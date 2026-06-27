require('dotenv').config();
const http = require('http');
const https = require('https');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = Number(process.env.PORT) || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620';
const ANTHROPIC_API_VERSION = process.env.ANTHROPIC_API_VERSION || '2023-06-01';
const LLM_PRIMARY = (process.env.LLM_PRIMARY || '').toLowerCase();
const HTML_FILE = path.join(__dirname, 'ArchitectIQ.html');
const LANDING_DIR = path.join(__dirname, 'landing', 'dist');
const IS_DEV = process.env.NODE_ENV !== 'production';
const VITE_PORT = Number(process.env.VITE_PORT) || 5173;
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'architectiq.log');
const DIAGRAMS_RENDERER = path.join(__dirname, 'diagrams_render.py');
const GRAPHVIZ_BIN = path.join('C:', 'Program Files', 'Graphviz', 'bin');
const WINDOWS_PY_LAUNCHER = path.join('C:', 'Windows', 'py.exe');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function writeServerLog(level, event, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...meta
  };
  try {
    ensureLogDir();
    fs.appendFileSync(LOG_FILE, `${JSON.stringify(entry)}\n`, 'utf8');
  } catch (err) {
    console.error('Failed to write server log:', err.message);
  }
}

function readServerLogs(limit = 100) {
  try {
    if (!fs.existsSync(LOG_FILE)) return [];
    const lines = fs.readFileSync(LOG_FILE, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .slice(-limit)
      .reverse();
    return lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch (err) {
    writeServerLog('error', 'logs.read_failed', { message: err.message });
    return [];
  }
}

function summarizeOpenAIRequest(body, apiPath) {
  const inputChars = typeof body.input === 'string'
    ? body.input.length
    : Array.isArray(body.input)
      ? JSON.stringify(body.input).length
      : 0;

  return {
    apiPath,
    model: body.model || null,
    max_output_tokens: body.max_output_tokens || null,
    max_completion_tokens: body.max_completion_tokens || null,
    reasoning_effort: body.reasoning?.effort || null,
    text_format: body.text?.format?.type || null,
    has_instructions: Boolean(body.instructions),
    input_chars: inputChars,
    message_count: Array.isArray(body.messages) ? body.messages.length : 0
  };
}

function extractResponseTextPreview(responseBody) {
  try {
    if (typeof responseBody?.output_text === 'string' && responseBody.output_text.trim()) {
      return responseBody.output_text.slice(0, 800);
    }
    if (Array.isArray(responseBody?.output)) {
      const text = responseBody.output
        .flatMap(item => Array.isArray(item?.content) ? item.content : [item?.content])
        .map(part => {
          if (typeof part === 'string') return part;
          if (typeof part?.text === 'string') return part.text;
          if (typeof part?.content === 'string') return part.content;
          return '';
        })
        .join('')
        .trim();
      return text.slice(0, 800);
    }
  } catch {}
  return '';
}

function extractAnthropicText(body) {
  if (Array.isArray(body?.content)) {
    // Only collect text-type blocks. Thinking blocks (type:'thinking'),
    // tool_use blocks, and web_search_tool_result blocks are intentionally skipped —
    // they would break the downstream JSON parser if included.
    return body.content
      .filter(part => part?.type === 'text' && typeof part.text === 'string')
      .map(part => part.text)
      .join('')
      .trim();
  }
  if (typeof body?.text === 'string') return body.text.trim();
  return '';
}

function normalizeUserInput(parsedBody) {
  const input = parsedBody?.input;
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) {
    return input.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item?.text === 'string') return item.text;
      if (typeof item?.content === 'string') return item.content;
      return '';
    }).join('\n');
  }
  if (Array.isArray(parsedBody?.messages)) {
    return parsedBody.messages.map(msg => msg?.content || '').join('\n');
  }
  return '';
}

function buildAnthropicSystem(parsedBody) {
  const schema = parsedBody?.text?.format?.schema;
  // Append a compact field list rather than the full serialised schema (~800 tokens).
  // The OUTPUT FORMAT section in the system prompt already describes field details;
  // this hint just names the top-level required fields so the model doesn't omit any.
  const schemaHint = schema
    ? `\n\nRequired top-level JSON fields: ${Object.keys(schema?.properties || {}).join(', ')}. Return ONLY the JSON object — no markdown, no preamble.`
    : '';
  const instructions = typeof parsedBody?.instructions === 'string' ? parsedBody.instructions : '';
  return `${instructions}${schemaHint}`.trim();
}

function wrapAnthropicAsOpenAI(text, modelLabel) {
  const outputText = text || '';
  return {
    id: `anthropic-${Date.now()}`,
    model: modelLabel || ANTHROPIC_MODEL,
    output_text: outputText,
    output: [
      {
        type: 'message',
        content: [
          { type: 'output_text', text: outputText }
        ]
      }
    ]
  };
}

function callAnthropic(primaryBody, _retryCount = 0) {
  const MAX_RETRIES = 2;
  // Delays must exceed the 60-second rate-limit window so each retry starts
  // with a fresh token bucket.  Short delays (< 60s) just burn more tokens
  // in the same window and make the 429 worse.
  const RETRY_DELAYS_MS = [62000, 65000]; // 62s, 65s — each past one full window

  return new Promise((resolve, reject) => {
    if (!ANTHROPIC_API_KEY) return reject(new Error('ANTHROPIC_API_KEY is not configured.'));

    const userText = normalizeUserInput(primaryBody) || 'Provide the architecture recommendation.';
    const system = buildAnthropicSystem(primaryBody);
    const maxTokens = Number(primaryBody?.max_output_tokens || primaryBody?.max_completion_tokens || 2000);

    // Translate OpenAI web_search tool → Anthropic native web_search_20250305.
    // Applied to research, GCP pricing, and generation calls that declare web_search.
    const wantsWebSearch = Array.isArray(primaryBody?.tools) &&
      primaryBody.tools.some(t => t?.type === 'web_search' || t?.type === 'web_search_20250305');

    // Extended thinking is intentionally disabled.
    // For structured JSON generation calls, thinking silently consumes a large
    // portion of the max_tokens budget (often far beyond budget_tokens), leaving
    // insufficient tokens for the full 3-tier JSON output and causing mid-response
    // truncation.  All tokens go directly to text output instead.
    const wantsThinking = false;

    const totalMaxTokens = Math.max(256, Math.min(maxTokens, 20000));

    const anthropicPayload = {
      model: ANTHROPIC_MODEL,
      max_tokens: totalMaxTokens,
      system,
      messages: [{ role: 'user', content: userText }]
    };

    if (wantsWebSearch) {
      // max_uses caps searches per call to control cost and latency.
      anthropicPayload.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }];
    }

    const payload = JSON.stringify(anthropicPayload);
    const anthropicHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_API_VERSION,
      'Content-Length': Buffer.byteLength(payload)
    };
    // Enable extended output (up to 64 k tokens) when the request needs more than the
    // default 8 192-token limit.  Without this header Anthropic returns a 400 for
    // max_tokens > 8192 on models that support extended output.
    if (totalMaxTokens > 8192) {
      anthropicHeaders['anthropic-beta'] = 'output-128k-2025-02-19';
    }
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: anthropicHeaders
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 429 || res.statusCode === 529) {
          if (_retryCount < MAX_RETRIES) {
            const delay = RETRY_DELAYS_MS[_retryCount];
            writeServerLog('warn', 'anthropic.rate_limited_retrying', {
              statusCode: res.statusCode, attempt: _retryCount + 1, delayMs: delay
            });
            return setTimeout(() => {
              callAnthropic(primaryBody, _retryCount + 1).then(resolve, reject);
            }, delay);
          }
          return reject(new Error(`Anthropic returned HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Anthropic returned HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
        let parsed;
        try {
          parsed = JSON.parse(data);
        } catch (err) {
          return reject(new Error(`Anthropic response was not JSON: ${err.message}`));
        }
        const text = extractAnthropicText(parsed);
        if (!text) return reject(new Error('Anthropic response contained no text.'));
        resolve(wrapAnthropicAsOpenAI(text, ANTHROPIC_MODEL));
      });
    });

    req.on('error', err => reject(err));
    req.write(payload);
    req.end();
  });
}

function getDiagramRenderEnv() {
  const env = { ...process.env, PYTHONIOENCODING: 'utf-8' };
  if (fs.existsSync(GRAPHVIZ_BIN)) {
    env.PATH = `${GRAPHVIZ_BIN}${path.delimiter}${env.PATH || ''}`;
  }
  return env;
}

function getPythonInvocation() {
  const custom = process.env.PYTHON_BIN && process.env.PYTHON_BIN.trim();
  if (custom) {
    return { command: custom, args: [] };
  }

  if (process.platform === 'win32') {
    if (fs.existsSync(WINDOWS_PY_LAUNCHER)) {
      return { command: WINDOWS_PY_LAUNCHER, args: ['-3'] };
    }
    return { command: 'py', args: ['-3'] };
  }

  return { command: 'python3', args: [] };
}

function runDiagramRenderer(payload) {
  return new Promise((resolve, reject) => {
    const python = getPythonInvocation();
    const child = spawn(python.command, [...python.args, DIAGRAMS_RENDERER], {
      cwd: __dirname,
      env: getDiagramRenderEnv()
    });

    let stdout = '';
    let stderr = '';
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      reject(new Error('Diagram rendering timed out.'));
    }, 20000);

    child.stdout.on('data', chunk => {
      stdout += chunk.toString('utf8');
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString('utf8');
    });

    child.on('error', err => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (err && err.code === 'ENOENT') {
        const attempted = [python.command, ...python.args].join(' ');
        return reject(new Error(`Python runtime not found for diagram rendering. Attempted: ${attempted}. Set PYTHON_BIN if needed.`));
      }
      reject(err);
    });

    child.on('close', code => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      let parsed;
      try {
        parsed = JSON.parse(stdout || '{}');
      } catch (err) {
        return reject(new Error(`Diagram renderer returned invalid JSON. ${stderr || err.message}`.trim()));
      }
      if (code !== 0 || parsed?.ok === false) {
        const message = parsed?.error?.message || stderr || `Diagram renderer exited with code ${code}.`;
        return reject(new Error(message.trim()));
      }
      resolve(parsed);
    });

    child.stdin.write(JSON.stringify(payload || {}));
    child.stdin.end();
  });
}

// ── Dev: spawn Vite and proxy landing requests to it ──────────────────────────
function startViteDev() {
  const vite = spawn('npm', ['run', 'dev', '--', '--port', String(VITE_PORT), '--strictPort'], {
    cwd: path.join(__dirname, 'landing'),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });
  vite.stdout.on('data', d => process.stdout.write(`[vite] ${d}`));
  vite.stderr.on('data', d => process.stderr.write(`[vite] ${d}`));
  vite.on('exit', code => { if (code !== null) console.log(`[vite] exited (${code})`); });
  process.on('exit', () => vite.kill());
  process.on('SIGINT', () => { vite.kill(); process.exit(); });
  return vite;
}

function proxyToVite(req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: VITE_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };
  const proxy = http.request(options, proxyRes => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  proxy.on('error', () => {
    // Vite not ready yet — retry once after 500ms
    setTimeout(() => {
      const retry = http.request(options, proxyRes => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      });
      retry.on('error', () => { res.writeHead(502); res.end('Vite dev server not ready. Please wait a moment and refresh.'); });
      req.pipe(retry, { end: true });
    }, 500);
  });
  req.pipe(proxy, { end: true });
}
// ──────────────────────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const rawPath = String(req.url || '').split('?')[0];

  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (/(^|\/|%2f)\.\.(\/|$|%2f)/i.test(rawPath) || /%00/i.test(rawPath)) {
    res.writeHead(404);
    return res.end('Not found');
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (parsed.pathname === '/api/logs') {
    if (req.method === 'GET') {
      const limit = Math.max(1, Math.min(200, Number(parsed.query.limit) || 100));
      const logs = readServerLogs(limit);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ logs }));
    }

    if (req.method === 'DELETE') {
      try {
        ensureLogDir();
        fs.writeFileSync(LOG_FILE, '', 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: { message: err.message } }));
      }
    }
  }

  if (req.method === 'GET' && parsed.pathname === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      keyConfigured: Boolean(OPENAI_API_KEY || ANTHROPIC_API_KEY),
      openaiKeyConfigured: Boolean(OPENAI_API_KEY),
      anthropicKeyConfigured: Boolean(ANTHROPIC_API_KEY),
      primaryProvider: LLM_PRIMARY || (ANTHROPIC_API_KEY ? 'anthropic' : 'openai'),
      webSearchSupported: true,
      diagramsSupported: fs.existsSync(DIAGRAMS_RENDERER)
    }));
  }

  if (req.method === 'POST' && parsed.pathname === '/api/diagram/render') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch (err) {
        writeServerLog('error', 'diagram.request_invalid_json', {
          requestId,
          message: err.message
        });
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: { message: 'Invalid JSON payload.' } }));
      }

      writeServerLog('info', 'diagram.request_started', {
        requestId,
        panel: parsedBody?.panel || null,
        title: parsedBody?.title || null
      });

      try {
        const rendered = await runDiagramRenderer(parsedBody);
        writeServerLog('info', 'diagram.response_finished', {
          requestId,
          panel: rendered?.panel || parsedBody?.panel || null,
          svg_bytes: Buffer.byteLength(rendered?.svg || '', 'utf8'),
          source_chars: String(rendered?.source || '').length
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(rendered));
      } catch (err) {
        writeServerLog('error', 'diagram.render_failed', {
          requestId,
          message: err.message,
          panel: parsedBody?.panel || null
        });
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: { message: err.message } }));
      }
    });
    return;
  }

  // Pricing proxy — Azure Retail Prices (no auth required)
  if (req.method === 'GET' && parsed.pathname === '/api/pricing/azure') {
    const filter = parsed.query['$filter'] || '';
    const top = Math.min(Number(parsed.query['$top'] || 50), 100);
    const skip = Number(parsed.query['$skip'] || 0);
    const apiVer = '2023-01-01-preview';
    let qs = `api-version=${apiVer}&$top=${top}&$skip=${skip}`;
    if (filter) qs += `&$filter=${encodeURIComponent(filter)}`;
    const options = {
      hostname: 'prices.azure.com',
      path: `/api/retail/prices?${qs}`,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };
    const proxyReq = https.request(options, proxyRes => {
      let data = '';
      proxyRes.on('data', chunk => data += chunk);
      proxyRes.on('end', () => {
        res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    });
    proxyReq.on('error', err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    proxyReq.end();
    return;
  }

  // Pricing proxy — AWS Price List API (no auth required, public bulk JSON)
  if (req.method === 'GET' && parsed.pathname === '/api/pricing/aws') {
    const service = (parsed.query.service || '').replace(/[^A-Za-z0-9]/g, '');
    const region = (parsed.query.region || '').replace(/[^a-z0-9-]/g, '');
    const instanceType = (parsed.query.instanceType || '').replace(/[^A-Za-z0-9.*_-]/g, '');
    const databaseEngine = (parsed.query.databaseEngine || '').replace(/[^A-Za-z0-9 +_-]/g, '').toLowerCase();
    const dryrunValue = String(parsed.query.dryrun || '').toLowerCase();
    const isDryRun = dryrunValue === '1' || dryrunValue === 'true' || dryrunValue === 'yes';
    const MAX_BYTES = 25 * 1024 * 1024; // AWS regional price files can be huge.
    const awsPath = service && region
      ? `/offers/v1.0/aws/${service}/current/${region}/index.json`
      : service
        ? `/offers/v1.0/aws/${service}/current/index.json`
        : '/offers/v1.0/aws/index.json';
    if (isDryRun) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, dryrun: true, service, region, instanceType, databaseEngine, path: awsPath }));
      return;
    }
    const options = {
      hostname: 'pricing.us-east-1.amazonaws.com',
      path: awsPath,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };
    const chunks = [];
    let totalBytes = 0;
    let truncated = false;
    const proxyReq = https.request(options, proxyRes => {
      proxyRes.on('data', chunk => {
        if (totalBytes < MAX_BYTES) {
          chunks.push(chunk);
          totalBytes += chunk.length;
          if (totalBytes >= MAX_BYTES) truncated = true;
        }
      });
      proxyRes.on('end', () => {
        if (proxyRes.statusCode !== 200) {
          res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: `AWS pricing returned HTTP ${proxyRes.statusCode}`, path: awsPath }));
        }
        try {
          const raw = Buffer.concat(chunks).toString('utf8');
          const data = JSON.parse(raw);
          // For full price lists, return a useful summary instead of the whole file
          if (data.products && data.terms) {
            const allProducts = Object.values(data.products);
            const instanceRegex = instanceType
              ? new RegExp(`^${instanceType.replace(/\*/g, '.*')}$`, 'i')
              : null;
            const filteredProducts = allProducts.filter(product => {
              const attrs = product.attributes || {};
              if (instanceRegex && !instanceRegex.test(String(attrs.instanceType || ''))) return false;
              if (databaseEngine && !String(attrs.databaseEngine || attrs.databaseEdition || '').toLowerCase().includes(databaseEngine)) return false;
              return true;
            });
            const products = (instanceRegex || databaseEngine ? filteredProducts : allProducts).slice(0, 80);
            const skus = new Set(products.map(p => p.sku));
            const terms = {};
            for (const sku of skus) {
              if (data.terms.OnDemand?.[sku]) terms[sku] = data.terms.OnDemand[sku];
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              formatVersion: data.formatVersion,
              publicationDate: data.publicationDate,
              service,
              region,
              totalProducts: Object.keys(data.products).length,
              matchedProducts: instanceRegex || databaseEngine ? filteredProducts.length : undefined,
              truncated,
              sampleProducts: products,
              sampleTerms: terms
            }));
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ...data, truncated }));
          }
        } catch {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ raw: Buffer.concat(chunks).toString('utf8').slice(0, 2000), truncated }));
        }
      });
    });
    proxyReq.on('error', err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    proxyReq.end();
    return;
  }

  // Pricing proxy — GCP Cloud Billing Catalog (requires OAuth; returns 401 without credentials)
  if (req.method === 'GET' && parsed.pathname === '/api/pricing/gcp') {
    const serviceId = (parsed.query.serviceId || '').replace(/[^A-Za-z0-9-]/g, '');
    const gcpPath = serviceId ? `/v1/services/${serviceId}/skus` : '/v1/services';
    const options = {
      hostname: 'cloudbilling.googleapis.com',
      path: gcpPath,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };
    const proxyReq = https.request(options, proxyRes => {
      let data = '';
      proxyRes.on('data', chunk => data += chunk);
      proxyRes.on('end', () => {
        res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    });
    proxyReq.on('error', err => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: err.message,
        note: 'GCP Cloud Billing API requires OAuth 2.0 credentials. Set up a service account and pass a Bearer token to use this endpoint.'
      }));
    });
    proxyReq.end();
    return;
  }

  // Proxy OpenAI API calls
  if (req.method === 'POST' && parsed.pathname === '/api/openai') {
    const MAX_BODY_BYTES = 1 * 1024 * 1024; // 1 MB hard cap
    let body = '';
    let bodyBytes = 0;
    let tooLarge = false;

    req.on('data', chunk => {
      if (tooLarge) return;
      bodyBytes += chunk.length;
      if (bodyBytes > MAX_BODY_BYTES) {
        tooLarge = true;
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: 'Request body exceeds 1 MB limit.' } }));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on('end', async () => {
      if (tooLarge) return;
      const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      res.setHeader('X-ArchitectIQ-Request-Id', requestId);

      let parsedBody;
      try {
        parsedBody = JSON.parse(body);
      } catch (err) {
        writeServerLog('error', 'openai.request_invalid_json', {
          requestId,
          message: err.message
        });
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: { message: 'Invalid JSON payload.' } }));
      }

      const apiPath = typeof parsedBody.apiPath === 'string' ? parsedBody.apiPath : '/v1/chat/completions';
      delete parsedBody.apiPath;

      const payloadText = JSON.stringify(parsedBody);
      if (payloadText.includes('\\u0000') || payloadText.includes('\u0000')) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: { message: 'Request payload contains unsupported null bytes.' } }));
      }
      const hasModelInput = typeof parsedBody.input === 'string'
        || Array.isArray(parsedBody.input)
        || Array.isArray(parsedBody.messages);
      if (!hasModelInput) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: { message: 'Request payload must include input or messages.' } }));
      }

      const forceProvider = String(req.headers['x-llm-force'] || '').toLowerCase();
      const testFail = String(req.headers['x-llm-test-fail'] || '') === '1';
      const basePrimary = LLM_PRIMARY || (ANTHROPIC_API_KEY ? 'anthropic' : 'openai');
      const primary = (forceProvider === 'anthropic' || forceProvider === 'openai') ? forceProvider : basePrimary;
      const canUseAnthropic = Boolean(ANTHROPIC_API_KEY);
      const canUseOpenAI = Boolean(OPENAI_API_KEY);

      if (!canUseAnthropic && !canUseOpenAI) {
        writeServerLog('error', 'llm.missing_env_key', { requestId });
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          error: {
            message: 'No LLM API key is configured. Set ANTHROPIC_API_KEY for Claude and/or OPENAI_API_KEY for OpenAI fallback.'
          }
        }));
      }

      const openaiRequest = () => new Promise((resolve, reject) => {
        if (!canUseOpenAI) return reject(new Error('OPENAI_API_KEY is not configured.'));
        if (testFail && primary === 'openai') return reject(new Error('Forced test failure (openai).'));
        writeServerLog('info', 'openai.request_started', {
          requestId,
          provider: 'openai',
          ...summarizeOpenAIRequest(parsedBody, apiPath)
        });
        const payload = JSON.stringify(parsedBody);
        const options = {
          hostname: 'api.openai.com',
          path: apiPath,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Length': Buffer.byteLength(payload)
          }
        };
        const proxyReq = https.request(options, proxyRes => {
          let data = '';
          proxyRes.on('data', chunk => data += chunk);
          proxyRes.on('end', () => {
            if (proxyRes.statusCode >= 400) {
              writeServerLog('error', 'openai.response_failed', {
                requestId,
                statusCode: proxyRes.statusCode,
                body_preview: data.slice(0, 200)
              });
              return reject(new Error(`OpenAI returned HTTP ${proxyRes.statusCode}`));
            }
            resolve({ statusCode: proxyRes.statusCode, body: data });
          });
        });
        proxyReq.on('error', reject);
        proxyReq.write(payload);
        proxyReq.end();
      });

      const anthropicRequest = async () => {
        if (testFail && primary === 'anthropic') throw new Error('Forced test failure (anthropic).');
        writeServerLog('info', 'anthropic.request_started', {
          requestId,
          provider: 'anthropic',
          model: ANTHROPIC_MODEL
        });
        const payload = await callAnthropic(parsedBody);
        return { statusCode: 200, body: JSON.stringify(payload) };
      };

      try {
        const primaryResult = (primary === 'anthropic' && canUseAnthropic)
          ? await anthropicRequest()
          : await openaiRequest();
        writeServerLog('info', 'llm.response_finished', {
          requestId,
          provider: primary,
          statusCode: primaryResult.statusCode
        });
        res.setHeader('X-LLM-Provider', primary);
        res.writeHead(primaryResult.statusCode, { 'Content-Type': 'application/json' });
        return res.end(primaryResult.body);
      } catch (err) {
        writeServerLog('warn', 'llm.primary_failed', {
          requestId,
          provider: primary,
          message: err.message
        });
        // Don't fall back to OpenAI on rate-limit/overload errors — the fallback provider
        // is likely also rate-limited, and we'd just swap one error for another while
        // hiding the real cause from the user.  429 = rate limit, 529 = Anthropic overload.
        const isRateLimit = err.message.includes('429') || err.message.includes('529');
        if (primary === 'anthropic' && canUseOpenAI && !isRateLimit) {
          try {
            const fallbackResult = await openaiRequest();
            writeServerLog('info', 'llm.fallback_succeeded', { requestId, provider: 'openai' });
            res.setHeader('X-LLM-Provider', 'openai');
            res.writeHead(fallbackResult.statusCode, { 'Content-Type': 'application/json' });
            return res.end(fallbackResult.body);
          } catch (fallbackErr) {
            writeServerLog('error', 'llm.fallback_failed', {
              requestId,
              provider: 'openai',
              message: fallbackErr.message
            });
            const fallbackMsg = fallbackErr.message.includes('429')
              ? `Anthropic error: ${err.message} — OpenAI fallback also rate-limited. Please wait and retry.`
              : `Anthropic error: ${err.message} — OpenAI fallback failed: ${fallbackErr.message}`;
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: { message: fallbackMsg } }));
          }
        }
        // Surface the primary provider error directly.
        const userMessage = isRateLimit
          ? `Rate limit reached (${err.message}) — please wait a moment and try again.`
          : err.message;
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: { message: userMessage } }));
      }
    });
    return;
  }

  if (parsed.pathname.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { message: 'API route not found' } }));
    return;
  }

  // Serve the built Vite SPA (landing/dist) for all GET requests.
  // Static assets (JS/CSS/images) are served as files; everything else gets
  // index.html so React Router can handle /app and any other client-side routes.
  if (req.method === 'GET') {
    const MIME = {
      '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript',
      '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png',
      '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
    };
    let safePathname;
    try {
      safePathname = decodeURIComponent(parsed.pathname || '/');
    } catch {
      res.writeHead(400);
      return res.end('Bad request');
    }
    if (safePathname.includes('\0') || safePathname.split('/').includes('..')) {
      res.writeHead(404);
      return res.end('Not found');
    }
    if (/^\/(?:etc|windows|winnt|system32|users|home|root|proc|var|private)\//i.test(safePathname) || /(?:^|\/)(?:passwd|shadow|hosts|\.env)(?:$|\.)/i.test(safePathname)) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(safePathname);
    const isAsset = ext && ext !== '.html';
    const filePath = isAsset
      ? path.resolve(LANDING_DIR, `.${safePathname}`)
      : path.join(LANDING_DIR, 'index.html');
    if (isAsset) {
      const relative = path.relative(LANDING_DIR, filePath);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        res.writeHead(404);
        return res.end('Not found');
      }
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Asset missing — 404; SPA shell missing — helpful error
        if (isAsset) { res.writeHead(404); return res.end('Not found'); }
        res.writeHead(503, { 'Content-Type': 'text/html' });
        return res.end('<h2>Frontend not built yet.</h2><p>Run: <code>cd landing &amp;&amp; npm run build</code></p>');
      }
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/html' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  writeServerLog('info', 'server.started', { port: PORT });
  console.log('');
  console.log('  ArchitectIQ is running.');
  console.log('');
  console.log(`  Open:  http://localhost:${PORT}`);
  console.log('');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});
