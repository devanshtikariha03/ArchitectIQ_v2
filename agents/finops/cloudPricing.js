const https = require('https');
const { buildRetailText, getRetailSignals } = require('../retailContext');

const GCP_BILLING_TOKEN = process.env.GCP_BILLING_BEARER_TOKEN || process.env.GOOGLE_CLOUD_BILLING_TOKEN || '';
const GCP_API_KEY = process.env.GOOGLE_CLOUD_API_KEY || process.env.GCP_API_KEY || process.env.GOOGLE_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const GCP_PRICING_WEB_SEARCH_MODEL = process.env.GCP_PRICING_WEB_SEARCH_MODEL || process.env.AGENT_LLM_MODEL || process.env.OPENAI_AGENT_MODEL || 'gpt-5.5';
const ENABLE_GCP_PRICING_WEB_SEARCH = process.env.ENABLE_GCP_PRICING_WEB_SEARCH !== 'false';
const DEFAULT_TIMEOUT_MS = 12000;
const MAX_BYTES = 8 * 1024 * 1024;

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function httpsJson({ hostname, path, headers = {}, maxBytes = MAX_BYTES, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname,
      path,
      method: 'GET',
      headers: { Accept: 'application/json', ...headers },
    }, res => {
      const chunks = [];
      let total = 0;
      let truncated = false;
      res.on('data', chunk => {
        if (total >= maxBytes) {
          truncated = true;
          return;
        }
        chunks.push(chunk);
        total += chunk.length;
        if (total >= maxBytes) truncated = true;
      });
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let body = null;
        try {
          body = raw ? JSON.parse(raw) : null;
        } catch {
          body = { raw: raw.slice(0, 2000) };
        }
        resolve({ statusCode: res.statusCode, body, truncated });
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`Pricing request timed out after ${timeoutMs}ms.`)));
    req.end();
  });
}

function postOpenAIResponses(payload, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    if (!OPENAI_API_KEY) return resolve(null);
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/responses',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`OpenAI pricing web search returned HTTP ${res.statusCode}: ${data.slice(0, 240)}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`OpenAI pricing web search response was not JSON: ${err.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error(`OpenAI pricing web search timed out after ${timeoutMs}ms.`)));
    req.write(body);
    req.end();
  });
}

function extractResponsePartText(part) {
  if (!part) return '';
  if (typeof part === 'string') return part;
  if (typeof part?.text === 'string') return part.text;
  if (typeof part?.output_text === 'string') return part.output_text;
  if (typeof part?.content === 'string') return part.content;
  if (typeof part?.arguments === 'string') return part.arguments;
  if (part?.parsed && typeof part.parsed === 'object') return JSON.stringify(part.parsed);
  if (part?.json && typeof part.json === 'object') return JSON.stringify(part.json);
  if (part?.value && typeof part.value === 'object') return JSON.stringify(part.value);
  if (Array.isArray(part?.content)) return part.content.map(extractResponsePartText).join('');
  return '';
}

function extractResponseText(body) {
  if (body?.output_parsed && typeof body.output_parsed === 'object') return JSON.stringify(body.output_parsed);
  if (body?.parsed && typeof body.parsed === 'object') return JSON.stringify(body.parsed);
  if (typeof body?.output_text === 'string') return body.output_text.trim();
  if (Array.isArray(body?.output)) {
    return body.output
      .flatMap(item => [item?.content, item?.text, item?.output_text, item?.parsed, item?.arguments])
      .flatMap(part => Array.isArray(part) ? part : [part])
      .map(extractResponsePartText)
      .join('')
      .trim();
  }
  return '';
}

function parseJsonObject(text) {
  const raw = String(text || '').replace(/^```json\s*|^```\s*|\s*```$/gm, '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1 || end < start) return null;
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function scenarioText(input = {}) {
  return buildRetailText({
    query: input.query || '',
    context: input.context || {},
    state: input.state || {},
  });
}

function detectCloudPreference(input = {}) {
  const text = scenarioText(input).toLowerCase();
  const hits = [
    [/\bazure\b|microsoft|aks|app service|azure sql|azure openai/.test(text), 'azure'],
    [/\baws\b|amazon|bedrock|cloudfront|dynamodb|aurora|ecs|eks|lambda/.test(text), 'aws'],
    [/\bgcp\b|google cloud|bigquery|cloud run|gke|vertex|cloud sql/.test(text), 'gcp'],
  ].filter(([matched]) => matched).map(([, provider]) => provider);
  if (hits.length > 1 || /compare|comparison|multi.?cloud|all three|aws.*azure.*gcp|azure.*aws.*gcp/.test(text)) return null;
  if (hits.length === 1) return hits[0];
  return null;
}

function pricingRegionContext(input = {}) {
  const text = scenarioText(input).toLowerCase();
  if (/\b(india|indian|myntra|flipkart|upi|rbi|dpdp|gst|mumbai|bengaluru|bangalore|delhi|hyderabad|chennai|pune)\b/.test(text)) {
    return { label: 'India', azureRegion: 'centralindia', awsRegion: 'ap-south-1', gcpRegion: 'asia-south1' };
  }
  if (/\b(australia|australian|au east|australia east|sydney|melbourne|perth|brisbane|new zealand|nz)\b/.test(text)) {
    return { label: 'Australia/New Zealand', azureRegion: 'australiaeast', awsRegion: 'ap-southeast-2', gcpRegion: 'australia-southeast1' };
  }
  if (/\b(united kingdom|uk|london|england|scotland|wales)\b/.test(text)) {
    return { label: 'United Kingdom', azureRegion: 'uksouth', awsRegion: 'eu-west-2', gcpRegion: 'europe-west2' };
  }
  if (/\b(europe|eu|germany|france|netherlands|ireland|spain|italy|gdpr)\b/.test(text)) {
    return { label: 'Europe', azureRegion: 'westeurope', awsRegion: 'eu-west-1', gcpRegion: 'europe-west1' };
  }
  if (/\b(united states|usa|us-|america|california|new york|texas|virginia|oregon)\b/.test(text)) {
    return { label: 'United States', azureRegion: 'eastus', awsRegion: 'us-east-1', gcpRegion: 'us-east4' };
  }
  return { label: 'Region not confirmed', azureRegion: null, awsRegion: null, gcpRegion: null };
}

function hasAiPricingScope(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const text = scenarioText(input).toLowerCase();
  return Boolean(signals.retailAi || /llm|model|embedding|vector|rerank|rag|chatbot|agent|recommendation|personalization|personalisation|vertex|bedrock|openai/.test(text));
}

function addPricingEvidence(ctx, text, provider, source, raw = {}) {
  if (!text) return;
  const evidence = { provider, source, text, raw };
  ctx.usablePricePoints.push(evidence);
  ctx.summary.push(text);
}

function formatAzureSku(item = {}) {
  return [item.productName, item.skuName, item.meterName, item.armRegionName].filter(Boolean).join(' / ') || 'Azure SKU';
}

function chooseAzurePostgresEvidence(items = []) {
  return items.find(item => {
    const text = formatAzureSku(item).toLowerCase();
    return /flexible|postgres/.test(text) && /vcpu|compute|dads|eds|general purpose|memory optimized|burstable/.test(text) && Number(item.unitPrice) > 0;
  }) || items.find(item => Number(item.unitPrice) > 0);
}

async function fetchAzurePricing(filter, top = 50) {
  const qs = `api-version=2023-01-01-preview&$top=${Math.min(top, 100)}&$filter=${encodeURIComponent(filter)}`;
  const result = await httpsJson({ hostname: 'prices.azure.com', path: `/api/retail/prices?${qs}` });
  if (result.statusCode >= 400) throw new Error(`Azure Retail Prices returned HTTP ${result.statusCode}`);
  return result.body?.Items || result.body?.items || [];
}

async function collectAzurePricing(ctx, input, detectedCloud) {
  if (detectedCloud && detectedCloud !== 'azure') return;
  const aiPricing = hasAiPricingScope(input);
  if (aiPricing) {
    try {
      const items = await fetchAzurePricing("serviceName eq 'Azure OpenAI'", 30);
      ctx.azure = { ...(ctx.azure || {}), openai: { count: items.length } };
      const gpt = items.find(item => /gpt-4o/i.test(`${item.skuName} ${item.meterName}`));
      if (gpt) addPricingEvidence(ctx, `Azure OpenAI sample (${formatAzureSku(gpt)}): $${gpt.unitPrice}/${gpt.unitOfMeasure || 'unit'} [Azure Retail Prices API; final token volume still required]`, 'Azure', 'azure-retail-prices', gpt);
    } catch (err) {
      ctx.notes.push(`Azure OpenAI pricing unavailable: ${err.message}`);
    }
  } else {
    ctx.notes.push('Azure OpenAI pricing skipped because this request does not explicitly include AI/model scope.');
  }

  if (!ctx.region.azureRegion) {
    ctx.notes.push('Azure regional pricing skipped because no Azure region was inferred.');
    return;
  }
  try {
    const items = await fetchAzurePricing(`serviceName eq 'Azure Database for PostgreSQL' and armRegionName eq '${ctx.region.azureRegion}'`, 50);
    const evidence = chooseAzurePostgresEvidence(items);
    ctx.azure = { ...(ctx.azure || {}), postgres: { count: items.length } };
    if (evidence) {
      addPricingEvidence(ctx, `Azure PostgreSQL Flexible sample (${ctx.region.label}, ${formatAzureSku(evidence)}): $${evidence.unitPrice}/${evidence.unitOfMeasure || 'unit'} [Azure Retail Prices API; final sizing still required]`, 'Azure', 'azure-retail-prices', evidence);
    } else {
      ctx.exclusions.push(`Azure PostgreSQL ${ctx.region.label}: ${items.length} item(s) returned, but no enterprise-relevant compute SKU was selected.`);
    }
  } catch (err) {
    ctx.notes.push(`Azure PostgreSQL pricing unavailable: ${err.message}`);
  }
}

function extractAwsOnDemandPrice(data = {}, sku) {
  const terms = data.sampleTerms?.[sku] || data.terms?.OnDemand?.[sku];
  const offer = terms && Object.values(terms)[0];
  const dimensions = offer?.priceDimensions ? Object.values(offer.priceDimensions) : [];
  const usd = dimensions.find(dim => dim.pricePerUnit?.USD && Number(dim.pricePerUnit.USD) > 0);
  return usd ? { price: usd.pricePerUnit.USD, unit: usd.unit || 'Hrs', description: usd.description || '' } : null;
}

function chooseAwsRdsEvidence(data = {}) {
  const products = data.sampleProducts || [];
  for (const product of products) {
    const price = extractAwsOnDemandPrice(data, product.sku);
    if (!price) continue;
    const attrs = product.attributes || {};
    return { product, price: price.price, unit: price.unit, description: price.description, attributes: attrs };
  }
  return null;
}

async function fetchAwsPricing({ service, region, instanceType, databaseEngine }) {
  const safeService = String(service || '').replace(/[^A-Za-z0-9]/g, '');
  const safeRegion = String(region || '').replace(/[^a-z0-9-]/g, '');
  const awsPath = safeService && safeRegion
    ? `/offers/v1.0/aws/${safeService}/current/${safeRegion}/index.json`
    : safeService
      ? `/offers/v1.0/aws/${safeService}/current/index.json`
      : '/offers/v1.0/aws/index.json';
  const result = await httpsJson({ hostname: 'pricing.us-east-1.amazonaws.com', path: awsPath, maxBytes: 25 * 1024 * 1024 });
  if (result.statusCode >= 400) throw new Error(`AWS Price List returned HTTP ${result.statusCode}`);
  const data = result.body || {};
  if (!data.products || !data.terms) return { ...data, truncated: result.truncated };

  const instanceRegex = instanceType ? new RegExp(`^${String(instanceType).replace(/\*/g, '.*')}$`, 'i') : null;
  const engine = String(databaseEngine || '').toLowerCase();
  const allProducts = Object.values(data.products);
  const filteredProducts = allProducts.filter(product => {
    const attrs = product.attributes || {};
    if (instanceRegex && !instanceRegex.test(String(attrs.instanceType || ''))) return false;
    if (engine && !String(attrs.databaseEngine || attrs.databaseEdition || '').toLowerCase().includes(engine)) return false;
    return true;
  });
  const sampleProducts = (instanceRegex || engine ? filteredProducts : allProducts).slice(0, 80);
  const sampleTerms = {};
  for (const product of sampleProducts) {
    if (data.terms.OnDemand?.[product.sku]) sampleTerms[product.sku] = data.terms.OnDemand[product.sku];
  }
  return {
    formatVersion: data.formatVersion,
    publicationDate: data.publicationDate,
    service: safeService,
    region: safeRegion,
    totalProducts: allProducts.length,
    matchedProducts: filteredProducts.length,
    truncated: result.truncated,
    sampleProducts,
    sampleTerms,
  };
}

async function collectAwsPricing(ctx, detectedCloud) {
  if (detectedCloud && detectedCloud !== 'aws') return;
  try {
    const index = await fetchAwsPricing({});
    if (index?.offers) {
      ctx.aws = { ...(ctx.aws || {}), indexLoaded: true, serviceCount: Object.keys(index.offers).length };
      ctx.notes.push(`AWS public pricing index loaded (${Object.keys(index.offers).length} services). This proves provider access, but service-level estimates still require SKU, region, and sizing.`);
    }
  } catch (err) {
    ctx.notes.push(`AWS pricing index unavailable: ${err.message}`);
  }
  if (!ctx.region.awsRegion) {
    ctx.notes.push('AWS regional pricing skipped because no AWS region was inferred.');
    return;
  }
  try {
    const data = await fetchAwsPricing({
      service: 'AmazonRDS',
      region: ctx.region.awsRegion,
      instanceType: 'db.r*g.*xlarge',
      databaseEngine: 'PostgreSQL',
    });
    const evidence = chooseAwsRdsEvidence(data);
    ctx.aws = { ...(ctx.aws || {}), rds: { matchedProducts: data.matchedProducts, publicationDate: data.publicationDate } };
    if (evidence) {
      addPricingEvidence(ctx, `AWS RDS PostgreSQL sample (${ctx.region.label}, ${evidence.attributes.instanceType || 'instance'}, ${evidence.attributes.deploymentOption || 'deployment not specified'}): $${evidence.price}/${String(evidence.unit || 'hour').toLowerCase()} [AWS public regional price list; final sizing still required]`, 'AWS', 'aws-price-list', evidence);
    } else {
      ctx.exclusions.push(`AWS RDS ${ctx.region.label}: matched ${data.matchedProducts || 0} regional product(s), but no PostgreSQL on-demand hourly SKU was selected.`);
    }
  } catch (err) {
    ctx.notes.push(`AWS RDS pricing unavailable: ${err.message}`);
  }
}

function nanosToUsd(unitPrice = {}) {
  const units = Number(unitPrice.units || 0);
  const nanos = Number(unitPrice.nanos || 0);
  const value = units + nanos / 1e9;
  return Number.isFinite(value) ? value : 0;
}

function gcpRequestConfig(path) {
  if (GCP_BILLING_TOKEN) {
    return {
      path,
      headers: { Authorization: `Bearer ${GCP_BILLING_TOKEN}` },
      authMode: 'oauth',
    };
  }
  if (GCP_API_KEY) {
    const separator = path.includes('?') ? '&' : '?';
    return {
      path: `${path}${separator}key=${encodeURIComponent(GCP_API_KEY)}`,
      headers: {},
      authMode: 'api_key',
    };
  }
  return { path, headers: {}, authMode: 'missing' };
}

function shouldUseGcpWebSearchFallback(input = {}, detectedCloud) {
  if (!ENABLE_GCP_PRICING_WEB_SEARCH || !OPENAI_API_KEY) return false;
  if (detectedCloud === 'gcp') return true;
  const text = scenarioText(input).toLowerCase();
  return /\bgcp\b|google cloud|vertex|gke|cloud run|cloud sql|bigquery|cloud armor|all three|multi.?cloud|compare.*cloud|aws.*azure.*gcp|azure.*aws.*gcp/.test(text);
}

function chooseGcpEvidenceFromSkus(serviceName, skus = [], region) {
  const regionText = String(region || '').toLowerCase();
  return skus
    .filter(sku => {
      const text = `${sku.description || ''} ${sku.category?.resourceFamily || ''} ${sku.category?.resourceGroup || ''} ${sku.category?.usageType || ''}`.toLowerCase();
      const hasRegion = !regionText || asArray(sku.serviceRegions).map(String).some(item => item.toLowerCase() === regionText || item.toLowerCase() === 'global');
      const hasPrice = asArray(sku.pricingInfo).some(info => asArray(info.pricingExpression?.tieredRates).some(rate => nanosToUsd(rate.unitPrice) > 0));
      return hasRegion && hasPrice && /(cpu|vcpu|core|memory|storage|request|operation|token|character|message|instance|sql|run|compute|vertex|bigquery|pub\/sub|armor|secret)/.test(text);
    })
    .slice(0, 2)
    .map(sku => {
      const tier = asArray(sku.pricingInfo)[0]?.pricingExpression?.tieredRates?.[0];
      const price = nanosToUsd(tier?.unitPrice);
      const unit = asArray(sku.pricingInfo)[0]?.pricingExpression?.usageUnit || 'unit';
      return {
        service: serviceName,
        sku: sku.description || sku.skuId,
        price,
        unit,
        region: asArray(sku.serviceRegions).join(', ') || region || 'region not stated',
      };
    });
}

async function collectGcpPricingWithWebSearch(ctx, input) {
  const region = ctx.region?.gcpRegion || ctx.region?.label || 'region not confirmed';
  const text = scenarioText(input).slice(0, 3500);
  const prompt = `Find current official Google Cloud public pricing evidence for this architecture scenario.

Scenario:
${text || 'No scenario text provided.'}

Region focus: ${region}

Use official Google Cloud pricing pages, Google Cloud Billing pricing references, or Google Cloud documentation pages only where possible.
Prefer price points for services likely relevant to enterprise retail architecture: Cloud SQL PostgreSQL, Compute Engine, GKE, Cloud Run, Vertex AI, BigQuery, Cloud Storage, Pub/Sub, Cloud Armor, and Secret Manager.
Return only public list-pricing evidence. Do not invent exact monthly architecture estimates. If a price varies by region, machine, tier, or usage, say so in the note.`;

  const schema = {
    type: 'object',
    additionalProperties: false,
    required: ['summary', 'evidence', 'limitations'],
    properties: {
      summary: {
        type: 'array',
        maxItems: 4,
        items: { type: 'string', maxLength: 260 },
      },
      evidence: {
        type: 'array',
        maxItems: 8,
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['service', 'sku_or_metric', 'region', 'price', 'unit', 'source_url', 'note'],
          properties: {
            service: { type: 'string', maxLength: 80 },
            sku_or_metric: { type: 'string', maxLength: 140 },
            region: { type: 'string', maxLength: 80 },
            price: { type: 'string', maxLength: 80 },
            unit: { type: 'string', maxLength: 80 },
            source_url: { type: 'string', maxLength: 260 },
            note: { type: 'string', maxLength: 220 },
          },
        },
      },
      limitations: {
        type: 'array',
        maxItems: 4,
        items: { type: 'string', maxLength: 260 },
      },
    },
  };

  const data = await postOpenAIResponses({
    model: GCP_PRICING_WEB_SEARCH_MODEL,
    store: false,
    reasoning: { effort: 'low' },
    max_output_tokens: 1400,
    tools: [{
      type: 'web_search',
      filters: { allowed_domains: ['cloud.google.com', 'docs.cloud.google.com'] },
      search_context_size: 'low',
    }],
    instructions: 'You are a FinOps pricing evidence extractor. Use web search for current official Google Cloud public pricing evidence. Return compact valid JSON only.',
    input: prompt,
    text: {
      format: {
        type: 'json_schema',
        name: 'gcp_public_pricing_evidence',
        schema,
        strict: true,
      },
    },
  });
  const parsed = parseJsonObject(extractResponseText(data));
  if (!parsed) throw new Error('OpenAI web-search fallback did not return parseable JSON.');

  const evidence = asArray(parsed.evidence).filter(item => item?.service && item?.price);
  ctx.gcp = {
    available: evidence.length > 0,
    authMode: 'openai_web_search',
    evidenceType: 'public_web_pricing_evidence',
    model: GCP_PRICING_WEB_SEARCH_MODEL,
  };
  asArray(parsed.summary).forEach(item => ctx.notes.push(`GCP web-search pricing summary: ${item}`));
  asArray(parsed.limitations).forEach(item => ctx.notes.push(`GCP web-search pricing limitation: ${item}`));
  evidence.forEach(item => {
    const source = item.source_url ? ` Source: ${item.source_url}` : '';
    addPricingEvidence(
      ctx,
      `GCP ${item.service} sample (${item.region || region}, ${item.sku_or_metric}): ${item.price}/${item.unit || 'unit'} [GPT web search over public Google Cloud pricing evidence; validate official SKU and contract pricing before approval].${source}`,
      'GCP',
      'openai-web-search-gcp-pricing',
      item
    );
  });
  if (!evidence.length) ctx.notes.push('GCP GPT web-search fallback returned no usable price points.');
}

async function collectGcpPricing(ctx, input, detectedCloud) {
  if (detectedCloud && detectedCloud !== 'gcp') return;
  const serviceRequest = gcpRequestConfig('/v1/services?pageSize=5000');
  if (serviceRequest.authMode === 'missing') {
    if (shouldUseGcpWebSearchFallback(input, detectedCloud)) {
      try {
        await collectGcpPricingWithWebSearch(ctx, input);
        return;
      } catch (err) {
        ctx.notes.push(`GCP GPT web-search pricing fallback unavailable: ${err.message}`);
      }
    }
    ctx.gcp = { available: false, authRequired: true };
    ctx.notes.push('GCP public list pricing requires GOOGLE_CLOUD_API_KEY/GCP_API_KEY or GOOGLE_CLOUD_BILLING_TOKEN/GCP_BILLING_BEARER_TOKEN. Without one, GCP pricing is missing for this run unless OPENAI_API_KEY web-search fallback is enabled and GCP is explicitly in scope.');
    return;
  }
  try {
    const servicesResult = await httpsJson({
      hostname: 'cloudbilling.googleapis.com',
      path: serviceRequest.path,
      headers: serviceRequest.headers,
    });
    if (servicesResult.statusCode >= 400) throw new Error(`GCP Cloud Billing Catalog returned HTTP ${servicesResult.statusCode}`);
    const services = servicesResult.body?.services || [];
    const wanted = ['Cloud SQL', 'Compute Engine', 'Cloud Run', 'Kubernetes Engine', 'Vertex AI', 'BigQuery', 'Cloud Storage', 'Pub/Sub', 'Cloud Armor', 'Secret Manager'];
    const selected = services.filter(service => wanted.some(name => String(service.displayName || '').toLowerCase().includes(name.toLowerCase()))).slice(0, 5);
    ctx.gcp = {
      available: selected.length > 0,
      authMode: serviceRequest.authMode,
      evidenceType: serviceRequest.authMode === 'api_key' ? 'public_list_pricing' : 'catalog_or_account_visible_pricing',
      serviceCount: services.length,
      selectedServices: selected.map(service => service.displayName),
    };
    for (const service of selected) {
      const serviceId = String(service.name || '').split('/').pop();
      if (!serviceId) continue;
      const skuRequest = gcpRequestConfig(`/v1/services/${serviceId}/skus?pageSize=200&currencyCode=USD`);
      const skuResult = await httpsJson({
        hostname: 'cloudbilling.googleapis.com',
        path: skuRequest.path,
        headers: skuRequest.headers,
        maxBytes: 4 * 1024 * 1024,
      });
      if (skuResult.statusCode >= 400) continue;
      chooseGcpEvidenceFromSkus(service.displayName, skuResult.body?.skus || [], ctx.region.gcpRegion).forEach(item => {
        addPricingEvidence(ctx, `GCP ${item.service} sample (${item.region}, ${item.sku}): $${item.price}/${item.unit} [GCP Cloud Billing Catalog public list pricing; final sizing and contract pricing still required]`, 'GCP', 'gcp-cloud-billing-catalog', item);
      });
    }
    if (!ctx.usablePricePoints.some(point => point.provider === 'GCP')) {
      ctx.notes.push('GCP Cloud Billing Catalog was reachable, but no region-relevant service-level SKU was selected.');
    }
    if (serviceRequest.authMode === 'api_key') {
      ctx.notes.push('GCP evidence is public list pricing. Customer-specific contract prices still require Cloud Billing account permissions or customer-provided pricing evidence.');
    }
  } catch (err) {
    ctx.gcp = { available: false, error: err.message };
    ctx.notes.push(`GCP pricing unavailable: ${err.message}`);
  }
}

async function buildCloudPricingContext(input = {}) {
  const region = pricingRegionContext(input);
  const detectedCloud = detectCloudPreference(input);
  const ctx = {
    tool: 'liveCloudPricingTool',
    detected_cloud: detectedCloud || 'none',
    region,
    azure: null,
    aws: null,
    gcp: { available: false },
    summary: [],
    usablePricePoints: [],
    notes: [],
    exclusions: [],
    evidence_status: 'assumption',
  };

  await Promise.allSettled([
    collectAzurePricing(ctx, input, detectedCloud),
    collectAwsPricing(ctx, detectedCloud),
    collectGcpPricing(ctx, input, detectedCloud),
  ]);

  ctx.evidence_status = ctx.usablePricePoints.length ? 'partial' : 'assumption';
  if (!ctx.usablePricePoints.length) ctx.summary.push('No service-level live pricing data available from AWS/Azure/GCP for this run.');
  return ctx;
}

function formatPricingSummaryForPrompt(pricing = {}) {
  const lines = pricing.summary?.length ? [...pricing.summary] : ['No service-level live pricing data available.'];
  if (pricing.notes?.length) {
    lines.push('Pricing notes:');
    pricing.notes.slice(0, 5).forEach(note => lines.push(`- ${note}`));
  }
  if (pricing.exclusions?.length) {
    lines.push('Excluded pricing datapoints:');
    pricing.exclusions.slice(0, 5).forEach(note => lines.push(`- ${note}`));
  }
  return lines.join('\n');
}

module.exports = {
  buildCloudPricingContext,
  detectCloudPreference,
  formatPricingSummaryForPrompt,
  hasAiPricingScope,
  pricingRegionContext,
};
