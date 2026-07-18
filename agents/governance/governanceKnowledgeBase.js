const { loadGovernancePolicyDocuments } = require('./governancePolicyIngestion');

const GOVERNANCE_KNOWLEDGE_DOCS = [
  {
    id: 'retail-architecture-governance-playbook',
    title: 'Retail Architecture Governance Playbook',
    tags: ['governance', 'architecture-board', 'owners', 'approvals', 'evidence'],
    controls: [
      'Keep architecture approval draft-level until owners, evidence status, decision records, risks, and validation gates are explicit.',
      'Separate recommendation, decision, assumption, accepted risk, rejected alternative, and human approval status.',
      'Require Security, Compliance, Governance, and FinOps validation before client-ready architecture approval.',
    ],
    risks: ['A technically plausible architecture can fail delivery if decision authority, ownership, evidence, and rollout gates are ambiguous.'],
    validation_needed: ['Confirm architecture board owner, decision owners, approval workflow, evidence location, accepted-risk authority, and decision review dates.'],
    citations: ['ArchitectIQ governance baseline: architecture decisions need owners, evidence, gates, and review dates.'],
  },
  {
    id: 'retail-systems-of-record-template',
    title: 'Retail Systems Of Record Template',
    tags: ['system-of-record', 'source-of-truth', 'ownership', 'retail-domain'],
    controls: [
      'Assign systems of record for product, price, promotion, cart, checkout, order, payment token, customer, loyalty, consent, inventory, fulfilment, returns, and audit.',
      'For every domain, name owner, correction authority, replay owner, reconciliation owner, support-access owner, and audit evidence owner.',
    ],
    risks: ['Retail incidents often come from unclear source of truth, duplicate writes, manual overrides, and reconciliation ambiguity.'],
    validation_needed: ['Confirm named human owner and source-of-truth system for every retail domain before final technology selection.'],
    citations: ['ArchitectIQ systems-of-record baseline: ownership must precede technology selection.'],
  },
  {
    id: 'retail-adr-and-approval-gate-template',
    title: 'Retail ADR And Approval Gate Template',
    tags: ['adr', 'decision-record', 'approval-gate', 'rejected-alternative'],
    controls: [
      'Every major architecture choice needs an ADR with decision, owner, date, evidence, alternatives rejected, tradeoffs, risks, and expiry/review date.',
      'Approval gates must include architecture, security, compliance/privacy, data, platform operations, FinOps, implementation readiness, pilot, rollout, and go-live.',
    ],
    risks: ['Without ADRs and gates, teams cannot prove why choices were made or when assumptions became invalid.'],
    validation_needed: ['Confirm ADR repository, approvers, rejected alternatives, accepted risks, decision expiry dates, and evidence status.'],
    citations: ['ArchitectIQ ADR baseline: recommendations are not decisions until approved by named owners.'],
  },
  {
    id: 'retail-integration-replay-and-reconciliation-checklist',
    title: 'Retail Integration Replay And Reconciliation Checklist',
    tags: ['integration', 'idempotency', 'retry', 'dlq', 'replay', 'reconciliation'],
    controls: [
      'Retail integrations require idempotency, retry limits, DLQs, replay tooling, duplicate handling, reconciliation reports, schema ownership, and manual correction process.',
      'Payment, inventory, order, fulfilment, returns, loyalty, and supplier events need explicit replay authority and audit evidence.',
    ],
    risks: ['Uncontrolled retry/replay can duplicate orders, corrupt inventory, misstate refunds, or break fulfilment promises.'],
    validation_needed: ['Confirm integration owners, schema registry, retry policy, DLQ owner, replay procedure, reconciliation schedule, and manual correction approval.'],
    citations: ['ArchitectIQ integration governance baseline: replay and reconciliation must be owned and testable.'],
  },
  {
    id: 'retail-rollout-readiness-gate-template',
    title: 'Retail Rollout Readiness Gate Template',
    tags: ['rollout', 'pilot', 'rollback', 'runbook', 'game-day', 'acceptance-test'],
    controls: [
      'Rollout governance needs pilot criteria, rollout waves, rollback triggers, runbooks, game days, acceptance tests, support handoff, training, and owner signoff.',
      'Stop/go thresholds must be measurable for availability, latency, checkout success, payment success, inventory correctness, support load, and incident recovery.',
    ],
    risks: ['A design can pass architecture review but fail store/channel rollout without rehearsed operations and rollback criteria.'],
    validation_needed: ['Confirm pilot scope, wave plan, rollback triggers, runbooks, game-day evidence, support model, training, and go-live approvers.'],
    citations: ['ArchitectIQ rollout baseline: client-ready output requires measurable readiness gates.'],
  },
  {
    id: 'security-to-governance-handoff-checklist',
    title: 'Security To Governance Handoff Checklist',
    tags: ['security', 'handoff', 'data-classification', 'pci', 'trust-boundary'],
    controls: ['Governance must consume Security Agent data classification, payment boundary, AI/RAG scope, trust boundaries, evidence pack, policy citations, and validation gaps.'],
    risks: ['Governance approval is unsafe when security controls are not translated into named approval gates and owners.'],
    validation_needed: ['Confirm unresolved Security Agent validation gaps are assigned to named owners and approval gates.'],
    citations: ['ArchitectIQ pipeline baseline: Security findings become governance gates.'],
  },
  {
    id: 'compliance-to-governance-handoff-checklist',
    title: 'Compliance To Governance Handoff Checklist',
    tags: ['compliance', 'handoff', 'residency', 'processor', 'retention'],
    controls: ['Governance must consume Compliance Agent jurisdiction frameworks, residency matrix, processor evidence, retention controls, evidence status, validation gates, and legal/privacy qualification.'],
    risks: ['Governance approval can overclaim readiness when compliance remains assumption-level or missing owner validation.'],
    validation_needed: ['Confirm Compliance Agent validation gates are owned before architecture board approval.'],
    citations: ['ArchitectIQ pipeline baseline: Compliance findings become governance gates.'],
  },
  {
    id: 'retail-ai-governance-gate-template',
    title: 'Retail AI Governance Gate Template',
    tags: ['ai', 'llm', 'rag', 'tool', 'eval', 'fallback'],
    controls: ['AI governance must approve model/provider ADRs, retrieval sources, data handling, eval criteria, human escalation, fallback, telemetry, retention, and cost controls.'],
    risks: ['AI decisions can bypass architecture governance if model route, retrieval, tools, evals, and fallback are not owned.'],
    validation_needed: ['Confirm AI owner, model route, provider terms, retrieval-source approval, eval thresholds, fallback plan, and human escalation owner.'],
    citations: ['ArchitectIQ AI governance baseline: AI architecture requires separate decision and operating gates.'],
  },
  {
    id: 'store-edge-governance-template',
    title: 'Store Edge Governance Template',
    tags: ['store-edge', 'pos', 'offline', 'rollout', 'queue-replay'],
    controls: ['Store-edge rollout needs offline trading tests, queue replay evidence, device replacement runbooks, field support, store training, and wave stop/go criteria.'],
    risks: ['Store-edge changes can fail operationally even when central cloud services are healthy.'],
    validation_needed: ['Confirm pilot stores, field support owners, offline test results, queue replay evidence, and rollback criteria.'],
    citations: ['ArchitectIQ store-edge baseline: store operations readiness is a governance gate.'],
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
        source_path: doc.source_path || 'agents/governance/governanceKnowledgeBase.js',
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
    source_path: doc.source_path || 'agents/governance/governanceKnowledgeBase.js',
    version: doc.version || 'built-in',
    effective_date: doc.effective_date || 'current ArchitectIQ baseline',
    review_by: doc.review_by || 'not stated',
    freshness_status: doc.freshness_status || 'baseline',
  }];
}

function retrieveGovernanceKnowledge({ query = '', retrievalPlan = [], signals = {}, limit = 6 } = {}) {
  const allDocs = [
    ...loadGovernancePolicyDocuments(),
    ...GOVERNANCE_KNOWLEDGE_DOCS,
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
    tool: 'retrieveGovernanceKnowledgeTool',
    source: 'local-governance-knowledge-base',
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
      severity: /approval|unsafe|fail|duplicate|overclaim|bypass/i.test(item) ? 'High' : 'Medium',
      likelihood: 'Medium',
      fix: 'Assign named owner, evidence status, approval gate, and review date before client-ready approval.',
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
  GOVERNANCE_KNOWLEDGE_DOCS,
  retrieveGovernanceKnowledge,
};
