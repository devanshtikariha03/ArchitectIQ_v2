const { loadFinOpsPolicyDocuments } = require('./finopsPolicyIngestion');

const FINOPS_KNOWLEDGE_DOCS = [
  {
    id: 'retail-finops-unit-driver-playbook',
    title: 'Retail FinOps Unit Driver Playbook',
    tags: ['unit-drivers', 'retail', 'traffic', 'peak', 'budget'],
    controls: ['Name unit drivers before estimating cost: requests, sessions, checkout attempts, transactions, events/sec, data growth, egress, log volume, stores, POS lanes, support seats, and peak multiplier.'],
    risks: ['Budget estimates are misleading when not tied to measured retail workload drivers.'],
    validation_needed: ['Collect measured baseline, peak telemetry, hard budget, currency, support tier, and commitment assumptions.'],
    citations: ['ArchitectIQ FinOps baseline: no budget approval without unit drivers and evidence status.'],
  },
  {
    id: 'llm-rag-agent-cost-model-template',
    title: 'LLM RAG Agent Cost Model Template',
    tags: ['llm', 'rag', 'agent', 'tokens', 'embedding', 'vector', 'reranker'],
    controls: ['Model AI cost using requests/day, turns/request, input/output tokens, model-routing split, cache hit rate, embedding ingestion/query volume, vector reads/storage, reranker calls, eval traces, and telemetry retention.'],
    risks: ['Frontier model calls, output tokens, vector reads, and eval traces can dominate cost when every agent step uses the strongest model.'],
    validation_needed: ['Confirm GPT/frontier usage share, cheaper model route, local/private model route, token caps, retrieval limits, cache hit rate, vector DB volume, and reranker usage.'],
    citations: ['ArchitectIQ AI FinOps baseline: GPT-class usage must be routed, budgeted, and capped.'],
  },
  {
    id: 'retail-service-level-pricing-evidence-checklist',
    title: 'Retail Service Level Pricing Evidence Checklist',
    tags: ['pricing', 'sku', 'cloud', 'region', 'evidence'],
    controls: ['Keep service-level pricing evidence marked verified, partial, assumption, stale, or missing. Provider price points are partial until exact SKU, usage, region, support, discounts, and commitments are validated.'],
    risks: ['Current-looking provider prices can still be wrong for the customer without exact SKU, contract, region, discount, commitment, and support-plan evidence.'],
    validation_needed: ['Collect official/current SKU evidence, region, support plan, usage, discounts, enterprise agreement, reserved/committed usage, marketplace/private offers, and tax/currency treatment.'],
    citations: ['ArchitectIQ pricing baseline: live catalog access is not a full monthly estimate without workload and contract evidence.'],
  },
  {
    id: 'cloud-support-licensing-partner-contingency-checklist',
    title: 'Cloud Support Licensing Partner Contingency Checklist',
    tags: ['support', 'licensing', 'partner', 'non-prod', 'contingency'],
    controls: ['Cost support plans, licensing, SaaS seats, partner implementation, non-prod parity, DR, training, rollout support, and contingency as mandatory cost lines.'],
    risks: ['Budget can appear feasible if support, licensing, partner effort, non-prod, DR, and contingency are excluded.'],
    validation_needed: ['Confirm support tier, SaaS seats, partner rates, non-prod environments, DR parity, rollout support, training, and contingency percentage.'],
    citations: ['ArchitectIQ support-cost baseline: non-prod, support, partner, and contingency are not optional for enterprise estimates.'],
  },
  {
    id: 'security-compliance-governance-cost-handoff-template',
    title: 'Security Compliance Governance Cost Handoff Template',
    tags: ['security', 'compliance', 'governance', 'mandatory-controls'],
    controls: ['Price upstream Security, Compliance, and Governance controls as mandatory unless named owners explicitly accept reduced capability and risk.'],
    risks: ['Optimised cost tiers can weaken security, compliance, residency, audit, or rollout controls if handoffs are not priced.'],
    validation_needed: ['Map Security controls, Compliance evidence needs, Governance gates, runbooks, review effort, and approval workflow into cost lines.'],
    citations: ['ArchitectIQ pipeline baseline: upstream controls become FinOps cost drivers.'],
  },
  {
    id: 'private-llm-vector-db-embedding-reranking-cost-template',
    title: 'Private LLM Vector DB Embedding Reranking Cost Template',
    tags: ['private-llm', 'vector-db', 'embedding', 'reranking', 'local-model'],
    controls: ['Compare API frontier model cost, cheaper model routes, local/private model hosting, embedding calls, vector DB storage/read units, reranking, eval traces, and telemetry retention.'],
    risks: ['Local/private models can reduce API dependency but increase GPU hosting, ops, latency, evaluation, and maintenance cost.'],
    validation_needed: ['Confirm model route, privacy requirements, GPU/hosting plan, vector count, dimensions, query rate, reranker rate, eval retention, and fallback policy.'],
    citations: ['ArchitectIQ private AI FinOps baseline: local models are a cost/security tradeoff, not automatically cheaper.'],
  },
  {
    id: 'retail-flash-sale-commerce-cost-driver-template',
    title: 'Retail Flash Sale Commerce Cost Driver Template',
    tags: ['commerce', 'flash-sale', 'cdn', 'waf', 'checkout', 'search'],
    controls: ['Model flash-sale headroom for CDN/WAF/bot, API gateway, search/catalog read model, cart/session, checkout/payment isolation, inventory lock path, promotion engine, fraud tooling, and observability.'],
    risks: ['Average-day cost estimates underfund peak retail events and create checkout/payment failure risk.'],
    validation_needed: ['Confirm peak multiplier, campaign calendar, bot/abuse assumptions, checkout attempts, inventory lock contention, search index size, and failover capacity.'],
    citations: ['ArchitectIQ retail peak baseline: campaign peaks need separate cost and capacity assumptions.'],
  },
  {
    id: 'retail-fulfilment-integration-cost-driver-template',
    title: 'Retail Fulfilment Integration Cost Driver Template',
    tags: ['fulfilment', 'integration', 'wms', 'erp', 'supplier', 'carrier'],
    controls: ['Model OMS/WMS/ERP adapters, supplier feeds, carrier API calls, EDI/SFTP processing, exception queues, reconciliation, dashboards, and manual override operations.'],
    risks: ['Integration and manual exception cost can exceed infrastructure cost in complex retail supply-chain workflows.'],
    validation_needed: ['Confirm feed volume, carrier call volume, exception rate, reconciliation frequency, partner support, and manual operation staffing.'],
    citations: ['ArchitectIQ fulfilment FinOps baseline: integration volume and exception operations are first-class cost drivers.'],
  },
  {
    id: 'data-observability-retention-cost-template',
    title: 'Data Observability Retention Cost Template',
    tags: ['data', 'observability', 'retention', 'logs', 'egress'],
    controls: ['Model data growth, backups, log/trace volume, SIEM export, audit evidence retention, analytics warehouse, egress, replication, and restore testing.'],
    risks: ['Logs, traces, audit retention, and egress can become a major hidden cost when compliance evidence is required.'],
    validation_needed: ['Confirm log GB/day, trace sampling, retention duration, SIEM export volume, backup policy, analytics export volume, egress, replication, and restore-test cadence.'],
    citations: ['ArchitectIQ observability FinOps baseline: retention and evidence requirements must be costed explicitly.'],
  },
  {
    id: 'store-edge-finops-cost-template',
    title: 'Store Edge FinOps Cost Template',
    tags: ['store-edge', 'pos', 'offline', 'hardware', 'rollout'],
    controls: ['Model store-edge hardware/appliance count, HA pairs, device management, local storage, UPS/network resilience, field replacement, rollout waves, training, and support desk load.'],
    risks: ['Store rollout cost can be dominated by field operations, support, device lifecycle, and training rather than cloud infrastructure.'],
    validation_needed: ['Confirm store count, POS lanes, offline mode, HA design, device lifecycle, field support rates, training effort, and rollout wave plan.'],
    citations: ['ArchitectIQ store-edge FinOps baseline: field operations and device lifecycle are mandatory cost drivers.'],
  },
];

function tokenize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9+\-/ ]/g, ' ').split(/\s+/).filter(token => token.length > 2);
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function docText(doc) {
  return [
    doc.id,
    doc.title,
    doc.tags,
    doc.version,
    doc.effective_date,
    doc.review_by,
    doc.freshness_status,
    doc.freshness_notes,
    doc.controls,
    doc.risks,
    doc.validation_needed,
    doc.citations,
  ].flat(3).join(' ');
}

function citationsForDoc(doc) {
  if (Array.isArray(doc.citations) && doc.citations.length) {
    return doc.citations.map(item => {
      if (item && typeof item === 'object') return item;
      return {
        source_id: doc.id,
        title: doc.title,
        snippet: String(item),
        source_path: doc.source_path || 'agents/finops/finopsKnowledgeBase.js',
        version: doc.version || 'built-in',
        effective_date: doc.effective_date || 'current ArchitectIQ baseline',
        review_by: doc.review_by || 'not stated',
        freshness_status: doc.freshness_status || 'baseline',
      };
    });
  }
  const snippet = (doc.controls || doc.risks || doc.validation_needed || [])[0];
  if (!snippet) return [];
  return [{
    source_id: doc.id,
    title: doc.title,
    snippet,
    source_path: doc.source_path || 'agents/finops/finopsKnowledgeBase.js',
    version: doc.version || 'built-in',
    effective_date: doc.effective_date || 'current ArchitectIQ baseline',
    review_by: doc.review_by || 'not stated',
    freshness_status: doc.freshness_status || 'baseline',
  }];
}

function retrieveFinOpsKnowledge({ query = '', retrievalPlan = [], signals = {}, limit = 7 } = {}) {
  const allDocs = [
    ...loadFinOpsPolicyDocuments(),
    ...FINOPS_KNOWLEDGE_DOCS,
  ];
  const queryTokens = new Set(tokenize([
    query,
    retrievalPlan.join(' '),
    Object.entries(signals).filter(([, value]) => value === true).map(([key]) => key).join(' '),
  ].join(' ')));
  const requested = new Set((retrievalPlan || []).map(String));
  const candidates = allDocs.map(doc => {
    const tokens = tokenize(docText(doc));
    const overlap = tokens.reduce((score, token) => score + (queryTokens.has(token) ? 1 : 0), 0);
    const planBoost = requested.has(doc.id) ? 12 : 0;
    const tagBoost = (doc.tags || []).reduce((score, tag) => score + (queryTokens.has(String(tag).toLowerCase()) ? 3 : 0), 0);
    return { doc, score: overlap + planBoost + tagBoost };
  }).filter(item => item.score > 0 || requested.has(item.doc.id));
  const byId = new Map();
  for (const item of candidates) {
    const existing = byId.get(item.doc.id);
    const itemIsPolicy = Boolean(item.doc.source);
    const existingIsPolicy = Boolean(existing?.doc?.source);
    if (!existing || (itemIsPolicy && !existingIsPolicy) || (itemIsPolicy === existingIsPolicy && item.score > existing.score)) byId.set(item.doc.id, item);
  }
  const scored = [...byId.values()].sort((a, b) => b.score - a.score).slice(0, limit).map(item => ({ ...item.doc, score: item.score }));
  const freshnessValidation = unique(scored.flatMap(doc => {
    if (!doc.freshness_status || doc.freshness_status === 'current' || doc.freshness_status === 'baseline') return [];
    return (doc.freshness_notes || [`Policy freshness status is ${doc.freshness_status}.`]).map(note => `Policy freshness review required for ${doc.id}: ${note}`);
  }));
  return {
    tool: 'retrieveFinOpsKnowledgeTool',
    source: 'local-finops-knowledge-base',
    docs: scored.map(doc => ({
      id: doc.id,
      title: doc.title,
      score: doc.score,
      tags: doc.tags,
      source: doc.source || 'built-in',
      source_path: doc.source_path || null,
      version: doc.version || '2026.07',
      effective_date: doc.effective_date || null,
      review_by: doc.review_by || null,
      freshness_status: doc.freshness_status || 'baseline',
      freshness_notes: doc.freshness_notes || [],
    })),
    controls: unique(scored.flatMap(doc => doc.controls || [])),
    risks: unique(scored.flatMap(doc => doc.risks || [])).map(item => ({
      risk: item,
      severity: /dominate|misleading|underfund|hidden|weaken|wrong/i.test(item) ? 'High' : 'Medium',
      likelihood: 'Medium',
      fix: 'Attach evidence, unit drivers, owner validation, and cost levers before budget approval.',
    })),
    validation_needed: unique([...scored.flatMap(doc => doc.validation_needed || []), ...freshnessValidation]),
    citations: scored.flatMap(citationsForDoc).map(citation => ({ ...citation, evidence_status: citation.evidence_status || 'baseline' })).slice(0, 12),
    policy_inventory: allDocs.map(doc => ({
      id: doc.id,
      title: doc.title,
      source: doc.source || 'built-in',
      source_path: doc.source_path || null,
      version: doc.version || null,
      owner: doc.owner || null,
      effective_date: doc.effective_date || null,
      review_by: doc.review_by || null,
      freshness_status: doc.freshness_status || 'baseline',
      freshness_notes: doc.freshness_notes || [],
    })),
  };
}

module.exports = {
  FINOPS_KNOWLEDGE_DOCS,
  retrieveFinOpsKnowledge,
};
