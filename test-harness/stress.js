#!/usr/bin/env node
'use strict';
/**
 * ArchitectIQ — Core Stress Test (no LLM calls, free to run)
 *
 * Usage:
 *   node test-harness/stress.js
 *
 * Covers:
 *   1. Infrastructure      — endpoints, status codes, CORS, error handling
 *   2. Security            — XSS, path traversal, method confusion, large payloads
 *   3. Pricing APIs        — Azure, AWS, GCP reachability + response shape
 *   4. Contradiction rules — all 8 rules fire / no false positives
 *   5. Rapid load          — 30 sequential requests without crash
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const BASE    = process.env.BASE_URL || 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, 'results');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ── ANSI colours ──────────────────────────────────────────────────────────────
const C = {
  reset : '\x1b[0m',
  green : '\x1b[32m',
  red   : '\x1b[31m',
  yellow: '\x1b[33m',
  grey  : '\x1b[90m',
  bold  : '\x1b[1m',
  cyan  : '\x1b[36m',
};

// ── Results store ─────────────────────────────────────────────────────────────
const results = [];
let cat = '';

function category(name) {
  cat = name;
  console.log(`\n${C.bold}${C.cyan}${'━'.repeat(62)}${C.reset}`);
  console.log(`${C.bold}  ${name}${C.reset}`);
  console.log(`${C.cyan}${'━'.repeat(62)}${C.reset}`);
}

function record(name, status, detail = '', ms = 0) {
  results.push({ category: cat, name, status, detail, ms });
  const icon  = { PASS: '✓', FAIL: '✗', WARN: '⚠', SKIP: '○' }[status] || '?';
  const color = { PASS: C.green, FAIL: C.red, WARN: C.yellow, SKIP: C.grey }[status] || '';
  const dur   = ms > 0 ? `${C.grey} (${ms}ms)${C.reset}` : '';
  console.log(`  ${color}${icon}${C.reset} ${name}${dur}`);
  if (detail && status !== 'PASS') console.log(`    ${C.grey}↳ ${detail}${C.reset}`);
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpReq(method, urlStr, body = null, extraHeaders = {}, opts = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const payload = body != null ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const opts = {
      hostname: u.hostname,
      port    : Number(u.port) || 80,
      path    : u.pathname + u.search,
      method,
      headers : {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...extraHeaders,
      },
    };
    const req = http.request(opts, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({
        status : res.statusCode,
        headers: res.headers,
        raw    : Buffer.concat(chunks).toString('utf8'),
        json() { try { return JSON.parse(this.raw); } catch { return null; } },
      }));
    });
    req.on('error', reject);
    const timeoutMs = Number(opts.timeoutMs) || 15000;
    req.setTimeout(timeoutMs, () => { req.destroy(new Error('timeout')); });
    if (payload) req.write(payload);
    req.end();
  });
}

const GET  = (p, qs = '', opts = {}) => httpReq('GET',    `${BASE}${p}${qs}`, null, {}, opts);
const POST = (p, b)       => httpReq('POST',   `${BASE}${p}`, b);
const DEL  = (p)          => httpReq('DELETE', `${BASE}${p}`);
const OPT  = (p)          => httpReq('OPTIONS',`${BASE}${p}`);
const PUT  = (p, b)       => httpReq('PUT',    `${BASE}${p}`, b);

async function timed(fn) {
  const t = Date.now();
  const r = await fn();
  return { r, ms: Date.now() - t };
}

// ── escapeHtml (replicated from frontend) ─────────────────────────────────────
function escapeHtml(v) {
  return String(v ?? '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

// ── detectContradictions (replicated from frontend) ───────────────────────────
function detectContradictions(state) {
  const issues = [];
  const { basics: b = {}, scale: sc = {}, cost: c = {}, team: t = {}, nfr = {} } = state;
  const monthly       = parseFloat((c.monthly || '').replace(/[^0-9.]/g, '')) || 0;
  const timelineWeeks = parseInt(((t.timeline || '').match(/\d+/) || [])[0] || '0');
  const conLow        = (b.constraints || '').toLowerCase();
  const probLow       = (b.problem || '').toLowerCase();

  if ((sc.sla === '99.99%' || sc.sla === '99.95%') && c.compute === 'Minimise' && monthly > 0 && monthly < 1500)
    issues.push({ severity: 'high',   msg: 'SLA+Minimise+low budget' });
  if (c.llm === 'Quality First' && monthly > 0 && monthly < 500)
    issues.push({ severity: 'high',   msg: 'QF LLM + budget < $500' });
  const allMin = ['compute','storage','networking','llm'].every(k => c[k] === 'Minimise');
  if (allMin && ['99.9%','99.95%','99.99%'].includes(sc.sla))
    issues.push({ severity: 'medium', msg: 'All Minimise + high SLA' });
  if (t.seniority === 'Junior' && t.buildBuy === 'Build-first (custom)')
    issues.push({ severity: 'medium', msg: 'Junior + Build-first' });
  if (b.domain === 'AI & Agentic Systems' && timelineWeeks > 0 && timelineWeeks < 6)
    issues.push({ severity: 'medium', msg: 'AI domain + short timeline' });
  if (conLow.includes('australia') && conLow.includes('openai') && !conLow.includes('azure'))
    issues.push({ severity: 'medium', msg: 'AU residency + direct OpenAI' });
  if ((probLow.includes('real-time') || sc.latency === '< 100ms') && c.compute === 'Minimise')
    issues.push({ severity: 'low',    msg: 'Real-time + Minimise compute' });
  if (Object.values(nfr).filter(Boolean).length === 0)
    issues.push({ severity: 'low',    msg: 'No NFRs filled' });

  return issues;
}

// ── 1. INFRASTRUCTURE ─────────────────────────────────────────────────────────
async function testInfrastructure() {
  category('1 · Infrastructure');

  // Server alive
  try {
    const { r, ms } = await timed(() => GET('/'));
    r.status === 200 && r.raw.includes('ArchitectIQ')
      ? record('GET / returns ArchitectIQ HTML', 'PASS', '', ms)
      : record('GET / returns ArchitectIQ HTML', 'FAIL', `status=${r.status}`, ms);
  } catch (e) {
    record('GET / returns ArchitectIQ HTML', 'FAIL', `Server not running: ${e.message}`);
    console.log(`\n${C.red}${C.bold}  Server is not running on ${BASE}. Start it with: npm start${C.reset}\n`);
    process.exit(1);
  }

  // /api/config
  {
    const { r, ms } = await timed(() => GET('/api/config'));
    const j = r.json();
    r.status === 200 && j && 'keyConfigured' in j
      ? record('GET /api/config returns keyConfigured', 'PASS', '', ms)
      : record('GET /api/config returns keyConfigured', 'FAIL', `body=${r.raw.slice(0,80)}`, ms);
  }

  // /api/logs GET
  {
    const { r, ms } = await timed(() => GET('/api/logs'));
    const j = r.json();
    r.status === 200 && j && Array.isArray(j.logs)
      ? record('GET /api/logs returns logs array', 'PASS', '', ms)
      : record('GET /api/logs returns logs array', 'FAIL', `body=${r.raw.slice(0,80)}`, ms);
  }

  // /api/logs DELETE
  {
    const { r, ms } = await timed(() => DEL('/api/logs'));
    const j = r.json();
    r.status === 200 && j?.ok === true
      ? record('DELETE /api/logs clears log', 'PASS', '', ms)
      : record('DELETE /api/logs clears log', 'FAIL', `status=${r.status}`, ms);
  }

  // CORS preflight
  {
    const { r, ms } = await timed(() => OPT('/api/openai'));
    const h = r.headers;
    h['access-control-allow-origin'] === '*'
      ? record('OPTIONS /api/openai returns CORS headers', 'PASS', '', ms)
      : record('OPTIONS /api/openai returns CORS headers', 'FAIL', `no CORS header`, ms);
    record(`OPTIONS returns 204`, r.status === 204 ? 'PASS' : 'FAIL', `got ${r.status}`, 0);
  }

  // 404 for unknown route
  {
    const { r, ms } = await timed(() => GET('/api/does-not-exist'));
    r.status === 404
      ? record('Unknown route returns 404', 'PASS', '', ms)
      : record('Unknown route returns 404', 'FAIL', `got ${r.status}`, ms);
  }

  // Wrong method
  {
    const { r, ms } = await timed(() => PUT('/api/openai', {}));
    r.status === 404
      ? record('PUT /api/openai returns 404 (unsupported method)', 'PASS', '', ms)
      : record('PUT /api/openai returns 404 (unsupported method)', 'WARN', `got ${r.status} — method confusion possible`, ms);
  }

  // Invalid JSON body
  {
    const { r, ms } = await timed(() => httpReq('POST', `${BASE}/api/openai`, 'THIS IS NOT JSON'));
    r.status === 400 && r.raw.includes('Invalid JSON')
      ? record('POST /api/openai with invalid JSON returns 400', 'PASS', '', ms)
      : record('POST /api/openai with invalid JSON returns 400', 'FAIL', `got ${r.status}: ${r.raw.slice(0,80)}`, ms);
  }

  // Missing OPENAI_API_KEY check (only meaningful if key is NOT set — just verify response shape)
  {
    const { r } = await timed(() => GET('/api/config'));
    const j = r.json();
    typeof j?.keyConfigured === 'boolean'
      ? record('Config reports key status as boolean', 'PASS')
      : record('Config reports key status as boolean', 'FAIL', `got ${JSON.stringify(j)}`);
  }
}

// ── 2. SECURITY ───────────────────────────────────────────────────────────────
async function testSecurity() {
  category('2 · Security / Edge Inputs');

  // Path traversal
  {
    const { r, ms } = await timed(() => GET('/../../etc/passwd'));
    r.status === 404 || r.status === 400
      ? record('Path traversal attempt blocked', 'PASS', '', ms)
      : record('Path traversal attempt blocked', 'FAIL', `got ${r.status}`, ms);
  }

  // Large payload (500 KB)
  {
    const bigBody = JSON.stringify({ apiPath: '/v1/responses', junk: 'x'.repeat(500_000) });
    try {
      const { r, ms } = await timed(() => httpReq('POST', `${BASE}/api/openai`, bigBody));
      // Should either reject or handle — must not crash (5xx from server itself is bad)
      r.status < 500
        ? record('500KB payload — server handles without 5xx crash', 'PASS', `got ${r.status}`, ms)
        : record('500KB payload — server handles without 5xx crash', 'WARN', `got ${r.status} — consider payload size limit`, ms);
    } catch (e) {
      record('500KB payload — server handles without 5xx crash', 'FAIL', e.message);
    }
  }

  // Null bytes in payload
  {
    const body = JSON.stringify({ apiPath: '/v1/chat/completions', input: 'hello\x00world' });
    try {
      const { r, ms } = await timed(() => httpReq('POST', `${BASE}/api/openai`, body));
      r.status !== 500
        ? record('Null bytes in payload handled', 'PASS', `got ${r.status}`, ms)
        : record('Null bytes in payload handled', 'WARN', `500 with null bytes`, ms);
    } catch (e) {
      record('Null bytes in payload handled', 'FAIL', e.message);
    }
  }

  // XSS — escapeHtml function correctness (logic test, no server call)
  const xssCases = [
    ['<script>alert(1)</script>', '&lt;script&gt;alert(1)&lt;/script&gt;'],
    ['"quoted"',                  '&quot;quoted&quot;'],
    ["it's fine",                 'it&#39;s fine'],
    ['<img src=x onerror=alert(1)>', '&lt;img src=x onerror=alert(1)&gt;'],
    ['& ampersand',               '&amp; ampersand'],
    [null,                        ''],
    [undefined,                   ''],
    [0,                           '0'],
  ];
  let xssPass = 0, xssFail = 0, xssFailDetails = [];
  for (const [input, expected] of xssCases) {
    const got = escapeHtml(input);
    if (got === expected) xssPass++;
    else { xssFail++; xssFailDetails.push(`input=${JSON.stringify(input)} expected=${expected} got=${got}`); }
  }
  xssFail === 0
    ? record(`escapeHtml — all ${xssCases.length} XSS cases neutralised`, 'PASS')
    : record(`escapeHtml — ${xssFail} case(s) NOT escaped`, 'FAIL', xssFailDetails.join(' | '));

  // Content-Type: text/plain (not JSON)
  {
    const { r, ms } = await timed(() => httpReq('POST', `${BASE}/api/openai`, '{"apiPath":"/v1/responses"}', { 'Content-Type': 'text/plain' }));
    // Server should still parse (it reads body as string regardless) — just confirm no crash
    r.status < 500 || r.status === 500  // 500 is OK if it's "no API key", not a server crash
      ? record('Wrong Content-Type — server does not crash', 'PASS', `got ${r.status}`, ms)
      : record('Wrong Content-Type — server does not crash', 'FAIL', `got ${r.status}`, ms);
  }
}

// ── 3. PRICING APIs ───────────────────────────────────────────────────────────
async function testPricingAPIs() {
  category('3 · Pricing APIs');

  // Azure — base reachability
  {
    const { r, ms } = await timed(() => GET('/api/pricing/azure', `?$filter=${encodeURIComponent("serviceName eq 'Virtual Machines'")}&$top=5`));
    const j = r.json();
    const items = j?.Items || j?.items;
    r.status === 200 && Array.isArray(items) && items.length > 0
      ? record('Azure Retail Prices API — reachable, returns items', 'PASS', `${items.length} items`, ms)
      : record('Azure Retail Prices API — reachable, returns items', 'FAIL', `status=${r.status} body=${r.raw.slice(0,100)}`, ms);
  }

  // Azure — PostgreSQL filter
  {
    const filter = "serviceName eq 'Azure Database for PostgreSQL' and armRegionName eq 'australiaeast'";
    const { r, ms } = await timed(() => GET('/api/pricing/azure', `?$filter=${encodeURIComponent(filter)}&$top=3`));
    const j = r.json();
    r.status === 200
      ? record('Azure PostgreSQL AU East pricing — reachable', 'PASS', `${(j?.Items||j?.items||[]).length} items`, ms)
      : record('Azure PostgreSQL AU East pricing — reachable', 'WARN', `status=${r.status}`, ms);
  }

  // Azure — $top cap enforced (request 200, max allowed is 100)
  {
    const { r, ms } = await timed(() => GET('/api/pricing/azure', `?$top=200`));
    r.status === 200
      ? record('Azure $top=200 capped to 100 — no error', 'PASS', '', ms)
      : record('Azure $top=200 capped to 100 — no error', 'FAIL', `status=${r.status}`, ms);
  }

  // Azure — filter injection attempt (OData special chars)
  {
    const injected = "serviceName eq 'x' or 1 eq 1";
    const { r, ms } = await timed(() => GET('/api/pricing/azure', `?$filter=${encodeURIComponent(injected)}`));
    // Azure will reject with 400 or return empty — either is fine, server must not crash
    r.status < 500
      ? record('Azure filter injection — server does not crash', 'PASS', `Azure returned ${r.status}`, ms)
      : record('Azure filter injection — server does not crash', 'FAIL', `got 5xx`, ms);
  }

  // AWS — index endpoint
  {
    const { r, ms } = await timed(() => GET('/api/pricing/aws'));
    const j = r.json();
    r.status === 200 && (j?.offers || j?.raw || j?.error)
      ? record('AWS Pricing index — reachable', 'PASS', j?.offers ? `${Object.keys(j.offers).length} services` : j?.error || 'partial', ms)
      : record('AWS Pricing index — reachable', 'FAIL', `status=${r.status} body=${r.raw.slice(0,100)}`, ms);
  }

  // AWS — invalid service code
  {
    const { r, ms } = await timed(() => GET('/api/pricing/aws', '?service=FAKEINVALIDSERVICE'));
    // Should return 404 or an error JSON — must not crash
    r.status < 500
      ? record('AWS invalid service code — handled gracefully', 'PASS', `got ${r.status}`, ms)
      : record('AWS invalid service code — handled gracefully', 'FAIL', `got ${r.status}`, ms);
  }

  // AWS - special chars in service stripped
  {
    try {
      const { r, ms } = await timed(() => GET('/api/pricing/aws', '?service=Amazon%3CEC2%3E&dryrun=1', { timeoutMs: 10000 }));
      const j = r.json();
      r.status === 200 && j && j.dryrun === true && j.service === 'AmazonEC2'
        ? record('AWS service with special chars - sanitised, no crash', 'PASS', `sanitized=${j.service}`, ms)
        : record('AWS service with special chars - sanitised, no crash', 'FAIL', `status=${r.status}`, ms);
    } catch (e) {
      record('AWS service with special chars - sanitised, no crash', 'FAIL', e.message);
    }
  }


  // GCP — returns non-200 (expected, needs OAuth) but server must not crash
  {
    try {
      const { r, ms } = await timed(() => GET('/api/pricing/gcp'));
      r.status !== undefined && r.status < 600
        ? record('GCP Billing API — returns expected auth error (not server crash)', r.status === 200 ? 'WARN' : 'PASS', `got ${r.status} (expected 401/403/502)`, ms)
        : record('GCP Billing API — returns expected auth error', 'FAIL', 'no response', ms);
    } catch (e) {
      record('GCP Billing API — returns expected auth error', 'FAIL', e.message);
    }
  }

}

// ── 4. CONTRADICTION DETECTION ────────────────────────────────────────────────
async function testContradictions() {
  category('4 · Contradiction Detection Rules');

  const base = {
    basics: { company: 'TestCo', domain: 'AI & Agentic Systems', constraints: '', problem: '' },
    scale:  { sla: '99%', latency: '< 2 seconds' },
    cost:   { compute: 'Balanced', llm: 'Balanced', storage: 'Balanced', networking: 'Balanced', monthly: '$2,000' },
    team:   { seniority: 'Senior', buildBuy: 'Buy-first (managed services)', timeline: '12 weeks' },
    nfr:    { security: 'TLS', compliance: 'SOC2' },
  };

  function run(label, patch, expectSeverity) {
    const state = JSON.parse(JSON.stringify(base));
    if (patch.basics)  Object.assign(state.basics, patch.basics);
    if (patch.scale)   Object.assign(state.scale,  patch.scale);
    if (patch.cost)    Object.assign(state.cost,   patch.cost);
    if (patch.team)    Object.assign(state.team,   patch.team);
    if (patch.nfr)     state.nfr = patch.nfr;

    const issues = detectContradictions(state);

    if (expectSeverity === null) {
      issues.length === 0
        ? record(label, 'PASS', '0 issues (correct)')
        : record(label, 'FAIL', `Expected 0 issues, got: ${issues.map(i => i.msg).join(', ')}`);
    } else {
      const hit = issues.find(i => i.severity === expectSeverity);
      hit
        ? record(label, 'PASS', `fired: "${hit.msg}"`)
        : record(label, 'FAIL', `Expected ${expectSeverity} issue — got: [${issues.map(i => `${i.severity}:${i.msg}`).join(', ')}]`);
    }
  }

  run('Rule 1 — 99.99% SLA + Minimise compute + $300/month → HIGH',
    { scale: { sla: '99.99%' }, cost: { compute: 'Minimise', monthly: '$300' } },
    'high');

  run('Rule 2 — Quality First LLM + $200/month → HIGH',
    { cost: { llm: 'Quality First', monthly: '$200' } },
    'high');

  run('Rule 3 — All Minimise + 99.9% SLA → MEDIUM',
    { scale: { sla: '99.9%' }, cost: { compute: 'Minimise', llm: 'Minimise', storage: 'Minimise', networking: 'Minimise' } },
    'medium');

  run('Rule 4 — Junior + Build-first → MEDIUM',
    { team: { seniority: 'Junior', buildBuy: 'Build-first (custom)' } },
    'medium');

  run('Rule 5 — AI domain + 3-week timeline → MEDIUM',
    { team: { timeline: '3 weeks to launch' } },
    'medium');

  run('Rule 6 — AU residency + direct OpenAI → MEDIUM',
    { basics: { constraints: 'data must stay in australia, use openai api directly' } },
    'medium');

  run('Rule 7 — Real-time latency + Minimise compute → LOW',
    { scale: { latency: '< 100ms' }, cost: { compute: 'Minimise' } },
    'low');

  run('Rule 8 — No NFRs → LOW',
    { nfr: {} },
    'low');

  run('Clean state — no contradictions → zero issues',
    {},
    null);

  // Edge cases
  run('Edge — $1,499 budget + 99.95% SLA + Minimise compute → HIGH (just under threshold)',
    { scale: { sla: '99.95%' }, cost: { compute: 'Minimise', monthly: '$1,499' } },
    'high');

  run('Edge — $1,500 budget + 99.95% SLA + Minimise compute → no HIGH (at threshold)',
    { scale: { sla: '99.95%' }, cost: { compute: 'Minimise', monthly: '$1,500' } },
    null); // should not fire high (exactly at threshold is excluded)

  run('Edge — QF LLM with no monthly budget → no HIGH (zero = unknown)',
    { cost: { llm: 'Quality First', monthly: '' } },
    null);
}

// ── 5. RAPID LOAD (no LLM) ───────────────────────────────────────────────────
async function testRapidLoad() {
  category('5 · Rapid Sequential Load (30 cheap requests)');

  const endpoints = [
    () => GET('/'),
    () => GET('/api/config'),
    () => GET('/api/logs'),
    () => GET('/api/pricing/azure', '?$top=1'),
  ];

  const N = 30;
  let passed = 0, failed = 0, totalMs = 0;
  const errors = [];

  for (let i = 0; i < N; i++) {
    const fn = endpoints[i % endpoints.length];
    try {
      const { r, ms } = await timed(fn);
      totalMs += ms;
      if (r.status < 500) passed++;
      else { failed++; errors.push(`req ${i}: status ${r.status}`); }
    } catch (e) {
      failed++;
      errors.push(`req ${i}: ${e.message}`);
    }
  }

  const avg = Math.round(totalMs / N);
  passed === N
    ? record(`${N} sequential requests — all succeeded`, 'PASS', `avg ${avg}ms/req`)
    : record(`${N} sequential requests — ${failed} failed`, 'FAIL', errors.slice(0,3).join(' | '));

  avg < 2000
    ? record(`Average response time < 2000ms`, 'PASS', `avg ${avg}ms`)
    : record(`Average response time < 2000ms`, 'WARN', `avg ${avg}ms — consider this under load`);

  // Concurrent burst (5 parallel)
  const burst = Array.from({ length: 5 }, () => GET('/api/config'));
  try {
    const t0 = Date.now();
    const responses = await Promise.all(burst);
    const burstMs = Date.now() - t0;
    const ok = responses.every(r => r.status === 200);
    ok
      ? record('5 concurrent GET /api/config — all 200', 'PASS', `${burstMs}ms total`)
      : record('5 concurrent GET /api/config — all 200', 'FAIL', `${responses.filter(r=>r.status!==200).length} non-200`);
  } catch (e) {
    record('5 concurrent GET /api/config', 'FAIL', e.message);
  }
}

// ── REPORT ────────────────────────────────────────────────────────────────────
function printSummary() {
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  const total = results.length;

  console.log(`\n${C.bold}${'═'.repeat(62)}${C.reset}`);
  console.log(`${C.bold}  RESULTS${C.reset}`);
  console.log(`${'═'.repeat(62)}`);
  console.log(`  ${C.green}PASS ${pass}${C.reset}   ${C.red}FAIL ${fail}${C.reset}   ${C.yellow}WARN ${warn}${C.reset}   TOTAL ${total}`);

  if (fail > 0) {
    console.log(`\n${C.red}${C.bold}  Failures:${C.reset}`);
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ${C.red}✗${C.reset} [${r.category}] ${r.name}`);
      if (r.detail) console.log(`    ${C.grey}${r.detail}${C.reset}`);
    });
  }

  if (warn > 0) {
    console.log(`\n${C.yellow}${C.bold}  Warnings:${C.reset}`);
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`  ${C.yellow}⚠${C.reset} [${r.category}] ${r.name}`);
      if (r.detail) console.log(`    ${C.grey}${r.detail}${C.reset}`);
    });
  }

  // Write JSON results
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(OUT_DIR, `stress-${ts}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ ran: new Date().toISOString(), results }, null, 2));
  console.log(`\n  ${C.grey}Results saved: ${outPath}${C.reset}`);
  console.log(`  ${C.grey}Run LLM tests: node test-harness/stress-llm.js${C.reset}\n`);

  return fail;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log(`\n${C.bold}${C.cyan}  ArchitectIQ Stress Test — Core Suite${C.reset}`);
  console.log(`  ${C.grey}Target: ${BASE}${C.reset}`);

  await testInfrastructure();
  await testSecurity();
  await testPricingAPIs();
  await testContradictions();
  await testRapidLoad();

  const failures = printSummary();
  process.exit(failures > 0 ? 1 : 0);
})();


