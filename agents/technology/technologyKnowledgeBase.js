const { loadTechnologyPolicyDocuments } = require('./technologyPolicyIngestion');

const TECHNOLOGY_KNOWLEDGE_DOCS = [
  {
    id: 'retail-technology-decomposition-playbook',
    title: 'Retail Technology Decomposition Playbook',
    tags: ['technology', 'decomposition', 'handoff', 'architecture'],
    controls: ['Decompose retail technology into API, Storage, AI, UI, integration, data-flow, NFR, and operations domains before final technology selection.'],
    risks: ['A single technology recommendation can hide ownership, consistency, replay, data truth, performance, and customer-channel gaps.'],
    validation_needed: ['Confirm which specialist agents or owners must validate API, Storage, AI, UI, Infrastructure, Security, Compliance, Governance, and FinOps decisions.'],
    citations: ['ArchitectIQ technology baseline: technology choices must be decomposed into specialist-owned domains.'],
  },
  {
    id: 'retail-api-integration-contract-template',
    title: 'Retail API Integration Contract Template',
    tags: ['api', 'integration', 'contract', 'event', 'orchestration'],
    controls: ['Define API gateway, service contracts, ownership, idempotency, retries, DLQs, schema versioning, replay, and reconciliation for retail integrations.'],
    risks: ['Retail failures often occur at API, integration, replay, and reconciliation boundaries rather than inside a single service.'],
    validation_needed: ['Confirm API ownership, contract standards, synchronous/asynchronous boundaries, event schema, replay rules, third-party SLAs, and exception handling.'],
    citations: ['ArchitectIQ technology baseline: retail APIs and integrations need explicit contracts and replay semantics.'],
  },
  {
    id: 'retail-storage-data-platform-template',
    title: 'Retail Storage Data Platform Template',
    tags: ['storage', 'database', 'cache', 'search', 'backup'],
    controls: ['Assign systems of record and choose OLTP, cache, search, object storage, backup, and analytics stores by consistency, latency, recovery, and ownership requirements.'],
    risks: ['Using cache/search/event streams as transactional truth can create oversell, reconciliation, audit, and customer-impact failures.'],
    validation_needed: ['Confirm source of truth, consistency model, cache invalidation, search rebuild, backup/restore, retention, replication, and data owner for each domain.'],
    citations: ['ArchitectIQ technology baseline: storage choices must protect retail data truth and recovery evidence.'],
  },
  {
    id: 'retail-ai-technology-template',
    title: 'Retail AI Technology Template',
    tags: ['ai', 'rag', 'llm', 'vector', 'embedding'],
    controls: ['Design AI/RAG with model routing, retrieval boundaries, embedding/vector DB strategy, evaluation, fallback, privacy controls, and no hard dependency in checkout-critical paths.'],
    risks: ['AI technology can increase cost, privacy, residency, hallucination, and availability risk if it sits inline with critical commerce workflows.'],
    validation_needed: ['Confirm model/provider, prompt data classes, vector DB, embeddings, reranking, eval traces, fallback, human escalation, telemetry retention, and cost controls.'],
    citations: ['ArchitectIQ technology baseline: AI/RAG must be isolated, measurable, and cost-controlled.'],
  },
  {
    id: 'retail-ui-experience-template',
    title: 'Retail UI Experience Template',
    tags: ['ui', 'frontend', 'mobile', 'admin', 'pos'],
    controls: ['Separate storefront, admin, associate, POS, support, and operational UI needs by persona, performance, accessibility, offline, localization, release, and observability requirements.'],
    risks: ['Customer-facing and admin UI failures can hide operational exceptions, degrade conversion, and create unsafe manual workarounds.'],
    validation_needed: ['Confirm channels, personas, performance budgets, accessibility, localization, offline/PWA needs, feature flags, telemetry, and rollback.'],
    citations: ['ArchitectIQ technology baseline: retail UI architecture must match channel, persona, and operational workflows.'],
  },
  {
    id: 'retail-cross-cutting-technology-nfr-template',
    title: 'Retail Cross Cutting Technology NFR Template',
    tags: ['nfr', 'latency', 'availability', 'security', 'compliance', 'cost'],
    controls: ['Every technology decision must trace to NFRs, security/compliance constraints, infrastructure posture, governance approval, FinOps cost drivers, and measurable acceptance tests.'],
    risks: ['Technology selections become indefensible when they are not tied to NFRs, evidence, rejected alternatives, ownership, and cost drivers.'],
    validation_needed: ['Confirm latency, availability, consistency, privacy, residency, observability, cost, deployment, rollback, and acceptance-test evidence for each technology layer.'],
    citations: ['ArchitectIQ technology baseline: technology recommendations must be evidence-backed and NFR-linked.'],
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
        source_path: doc.source_path || 'agents/technology/technologyKnowledgeBase.js',
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
    source_path: doc.source_path || 'agents/technology/technologyKnowledgeBase.js',
    version: doc.version || 'built-in',
    effective_date: doc.effective_date || 'current ArchitectIQ baseline',
    review_by: doc.review_by || 'not stated',
    freshness_status: doc.freshness_status || 'baseline',
  }];
}

function retrieveTechnologyKnowledge({ query = '', retrievalPlan = [], signals = {}, limit = 7 } = {}) {
  const allDocs = [
    ...loadTechnologyPolicyDocuments(),
    ...TECHNOLOGY_KNOWLEDGE_DOCS,
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
    tool: 'retrieveTechnologyKnowledgeTool',
    source: 'local-technology-knowledge-base',
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
      severity: /failure|oversell|privacy|critical|indefensible|unsafe/i.test(item) ? 'High' : 'Medium',
      likelihood: 'Medium',
      fix: 'Attach specialist owner, technology ADR, NFR, evidence, rejected alternatives, and acceptance-test validation before final approval.',
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
  TECHNOLOGY_KNOWLEDGE_DOCS,
  retrieveTechnologyKnowledge,
};
