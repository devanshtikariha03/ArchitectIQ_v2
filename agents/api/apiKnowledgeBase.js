const { loadApiPolicyDocuments } = require('./apiPolicyIngestion');

const API_KNOWLEDGE_DOCS = [
  {
    id: 'retail-api-gateway-edge-template',
    title: 'Retail API Gateway Edge Template',
    tags: ['api-gateway', 'edge', 'ingress', 'rate-limit'],
    controls: ['Use API gateway/edge controls for routing, auth, rate limits, throttling, WAF/bot handoff, tenant/channel separation, and critical-path isolation.'],
    risks: ['Shared ingress and uncontrolled API traffic can let browse spikes, bot abuse, or third-party retries degrade checkout/order/payment paths.'],
    validation_needed: ['Confirm gateway product, route ownership, auth model, rate limits, throttles, WAF/bot integration, origin isolation, and fallback behavior.'],
    citations: ['ArchitectIQ API baseline: retail API ingress must isolate revenue-critical paths.'],
  },
  {
    id: 'retail-service-contract-template',
    title: 'Retail Service Contract Template',
    tags: ['contract', 'openapi', 'domain-api', 'versioning'],
    controls: ['Define domain service contracts with OpenAPI/AsyncAPI/schema ownership, versioning, compatibility, deprecation, error model, pagination, and idempotency requirements.'],
    risks: ['Weak contracts create brittle integrations, hidden coupling, incompatible releases, and unclear ownership.'],
    validation_needed: ['Confirm contract format, owners, versioning, backward compatibility, error codes, SLAs, auth scopes, and consumer testing.'],
    citations: ['ArchitectIQ API baseline: service contracts need ownership, compatibility, and acceptance evidence.'],
  },
  {
    id: 'retail-orchestration-integration-template',
    title: 'Retail Orchestration Integration Template',
    tags: ['orchestration', 'events', 'queue', 'workflow'],
    controls: ['Separate synchronous customer-critical APIs from asynchronous fulfilment, integration, event, and batch workflows with clear orchestration ownership.'],
    risks: ['Putting slow third-party calls or ambiguous workflows inline can degrade checkout, order, and customer support paths.'],
    validation_needed: ['Confirm sync/async boundaries, event backbone, queue policy, workflow owner, timeout, compensation, and degraded-mode behavior.'],
    citations: ['ArchitectIQ API baseline: retail orchestration must protect customer-critical paths.'],
  },
  {
    id: 'retail-third-party-integration-template',
    title: 'Retail Third Party Integration Template',
    tags: ['third-party', 'b2b', 'erp', 'wms', 'psp'],
    controls: ['Define third-party integration contracts for PSP, ERP, WMS, OMS, carriers, suppliers, marketplace sellers, SaaS, and EDI feeds with validation and exception handling.'],
    risks: ['Third-party retries, malformed payloads, SLA gaps, or upstream data errors can corrupt orders, inventory, catalogue, fulfilment, or payment state.'],
    validation_needed: ['Confirm partner list, contract format, payload validation, SLA, retry policy, reconciliation, manual exception workflow, and support ownership.'],
    citations: ['ArchitectIQ API baseline: B2B integrations require validation, replay, and exception ownership.'],
  },
  {
    id: 'retail-idempotency-replay-template',
    title: 'Retail Idempotency Replay Template',
    tags: ['idempotency', 'replay', 'dlq', 'reconciliation'],
    controls: ['Use idempotency keys, dedupe, outbox/inbox, retries, DLQs, replay tools, reconciliation reports, and audit trails for order/payment/inventory/integration APIs.'],
    risks: ['Missing idempotency and replay controls can cause duplicate orders, double charges, inventory drift, lost events, and unrecoverable integrations.'],
    validation_needed: ['Confirm idempotency-key scope, retry windows, DLQ ownership, replay process, reconciliation report, audit trail, and customer-impact handling.'],
    citations: ['ArchitectIQ API baseline: retail API reliability depends on idempotency and replay evidence.'],
  },
  {
    id: 'retail-api-security-observability-template',
    title: 'Retail API Security Observability Template',
    tags: ['security', 'observability', 'slo', 'audit'],
    controls: ['Apply OAuth/OIDC/JWT/mTLS/scopes, request validation, audit logging, trace correlation, SLOs, dashboards, runbooks, and incident ownership by API path.'],
    risks: ['APIs without clear auth, validation, audit, tracing, and SLOs are hard to secure, diagnose, and support during retail peaks.'],
    validation_needed: ['Confirm authN/authZ, scopes, schema validation, audit fields, trace IDs, logs/metrics, SLOs, runbooks, and on-call ownership.'],
    citations: ['ArchitectIQ API baseline: API controls must be observable, secure, and supportable.'],
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
        source_path: doc.source_path || 'agents/api/apiKnowledgeBase.js',
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
    source_path: doc.source_path || 'agents/api/apiKnowledgeBase.js',
    version: doc.version || 'built-in',
    effective_date: doc.effective_date || 'current ArchitectIQ baseline',
    review_by: doc.review_by || 'not stated',
    freshness_status: doc.freshness_status || 'baseline',
  }];
}

function retrieveApiKnowledge({ query = '', retrievalPlan = [], signals = {}, limit = 7 } = {}) {
  const allDocs = [
    ...loadApiPolicyDocuments(),
    ...API_KNOWLEDGE_DOCS,
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
    tool: 'retrieveApiKnowledgeTool',
    source: 'local-api-knowledge-base',
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
      severity: /duplicate|double|corrupt|degrade|unrecoverable|brittle|abuse/i.test(item) ? 'High' : 'Medium',
      likelihood: 'Medium',
      fix: 'Attach contract owner, gateway policy, sync/async ADR, idempotency/replay evidence, integration SLA, and operational runbook before approval.',
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
  API_KNOWLEDGE_DOCS,
  retrieveApiKnowledge,
};
