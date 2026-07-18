const { loadCompliancePolicyDocuments } = require('./compliancePolicyIngestion');

const COMPLIANCE_KNOWLEDGE_DOCS = [
  {
    id: 'retail-compliance-playbook',
    title: 'Retail Compliance Playbook',
    tags: ['retail', 'privacy', 'compliance', 'evidence', 'audit', 'support-access'],
    controls: [
      'Do not mark compliance, residency, or processor status as verified unless source evidence is supplied and reviewed by the named owner.',
      'Separate compliance facts into verified, partial, assumption, stale, missing, and contradictory evidence states.',
      'Map customer, loyalty, support, payment-adjacent, order, fulfilment, audit, logs, prompts, embeddings, and exports to owners and obligations.',
    ],
    risks: [
      'Architecture outputs can overclaim compliance when jurisdictions, processors, support access, and retention are not verified.',
      'Support and analytics tools often become hidden processors for regulated retail data.',
    ],
    validation_needed: [
      'Confirm operating countries, customer regions, store regions, support regions, legal entities, and privacy owners.',
      'Confirm evidence status for every framework, processor, residency claim, retention rule, and support-access path.',
    ],
    citations: ['ArchitectIQ compliance baseline: evidence-status discipline and human legal/privacy validation are mandatory.'],
  },
  {
    id: 'retail-residency-and-processor-matrix',
    title: 'Retail Residency And Processor Matrix',
    tags: ['residency', 'processor', 'subprocessor', 'cross-border', 'saas', 'logs', 'backups'],
    controls: [
      'Track residency for application data, transactional stores, object storage, backups, logs, traces, CDN/edge logs, audit exports, AI payloads, vector stores, SaaS metadata, and support bundles.',
      'Track each processor/subprocessor with region, support location, DPA status, retention, deletion path, breach notice, and support-access controls.',
      'Do not treat primary database region as end-to-end residency evidence; backups, logs, SaaS tools, AI providers, and support exports must also be checked.',
    ],
    risks: [
      'Cross-border transfer risk can hide in support access, observability, CDN logs, incident exports, analytics, or AI telemetry.',
    ],
    validation_needed: [
      'Collect processor list, subprocessor list, DPA terms, approved regions, support locations, backup/log regions, and cross-border transfer basis.',
    ],
    citations: ['ArchitectIQ residency baseline: end-to-end data path evidence is required before residency can be marked verified.'],
  },
  {
    id: 'retail-retention-deletion-dsar-control-template',
    title: 'Retail Retention Deletion And DSAR Control Template',
    tags: ['retention', 'deletion', 'dsar', 'erasure', 'consent', 'legal-hold'],
    controls: [
      'Define retention classes for customer, loyalty, support transcript, payment-adjacent, order, fulfilment, audit, telemetry, prompt, embedding, vector, and backup data.',
      'Map DSAR/deletion propagation across OLTP stores, search indexes, caches, queues, object storage, logs, traces, analytics exports, support tools, eval datasets, embeddings, vector stores, and provider telemetry.',
      'Separate legal/audit retention from operational retention and document deletion exceptions, restore limitations, and legal hold handling.',
    ],
    risks: [
      'Deletion promises fail when logs, support tickets, analytics exports, vector stores, backups, and eval datasets are excluded from the lifecycle map.',
    ],
    validation_needed: [
      'Confirm retention schedule, DSAR/delete SLA, deletion propagation owner, backup limitation notice, and evidence of deletion tests.',
    ],
    citations: ['ArchitectIQ lifecycle baseline: retention and deletion must include derived stores and AI/vector artifacts.'],
  },
  {
    id: 'pci-privacy-and-support-access-evidence-checklist',
    title: 'PCI Privacy And Support Access Evidence Checklist',
    tags: ['pci', 'payment', 'pan', 'sad', 'qsa', 'support-access', 'token-vault'],
    controls: [
      'Validate PSP/token-vault/P2PE boundary, PAN/SAD exclusion, segmentation evidence, refund workflow, support-ticket filtering, and QSA/security-owner approval where PCI applies.',
      'Ensure PAN/SAD and payment-sensitive values are excluded from logs, traces, support transcripts, analytics exports, prompt payloads, eval datasets, and vector stores.',
      'Treat payment tokens and refund metadata as payment-adjacent data requiring access controls, retention rules, and support-access evidence.',
    ],
    risks: [
      'PCI scope can expand through support access, refund tooling, logs, AI prompts, analytics exports, or vector stores even when raw PAN is not intentionally stored.',
    ],
    validation_needed: [
      'Collect PSP AOC/attestation, QSA/security-owner signoff, segmentation evidence, token-vault ownership, refund data map, and PAN/SAD DLP test evidence.',
    ],
    citations: ['ArchitectIQ PCI baseline: tokenization boundaries must be evidenced before PCI scope can be minimized.'],
  },
  {
    id: 'retail-ai-data-residency-review-template',
    title: 'Retail AI Data Residency Review Template',
    tags: ['ai', 'llm', 'rag', 'embedding', 'vector', 'telemetry', 'eval', 'automated-decision'],
    controls: [
      'Treat prompts, completions, moderation payloads, embeddings, vector metadata, retrieval snippets, eval traces, model telemetry, and provider support access as data-processing paths.',
      'Validate no-training/no-retention terms, residency, subprocessor list, deletion propagation, prompt redaction, human escalation, and automated-decision auditability.',
      'Require evidence for which customer, support, order, payment-adjacent, policy, and architecture data enters model or retrieval paths.',
    ],
    risks: [
      'AI/RAG can create new regulated processors and derived data stores that are missed by standard application data maps.',
    ],
    validation_needed: [
      'Confirm model provider, embedding provider, vector DB, region, retention, deletion, support access, telemetry, eval retention, and human escalation rules.',
    ],
    citations: ['ArchitectIQ AI compliance baseline: prompts, embeddings, vector stores, and eval traces need residency and retention review.'],
  },
  {
    id: 'security-to-compliance-handoff-checklist',
    title: 'Security To Compliance Handoff Checklist',
    tags: ['security-handoff', 'data-classification', 'pci', 'ai-security', 'trust-boundary'],
    controls: [
      'Consume Security Agent data classification, payment boundary, AI/RAG scope, trust boundaries, policy citations, and security signal profile before final compliance recommendations.',
      'Translate C5/C5E, payment-sensitive, AI/RAG, support-access, and external-processor findings into compliance evidence and owner validation actions.',
    ],
    risks: [
      'Compliance output can miss PCI, support-access, AI, and residency obligations if it ignores the Security Agent handoff.',
    ],
    validation_needed: [
      'Confirm Security Agent handoff is present and reviewed before Governance consumes Compliance output.',
    ],
    citations: ['ArchitectIQ pipeline baseline: Security output feeds Compliance, Compliance output feeds Governance.'],
  },
  {
    id: 'children-minor-privacy-template',
    title: 'Children And Minor Data Privacy Template',
    tags: ['children', 'minor', 'coppa', 'gdpr-k', 'parental-consent', 'age-gate'],
    controls: [
      'If children or minors are in scope, require age-gating, parental consent where applicable, data minimisation, content moderation evidence, retention limits, and guardian-access workflows.',
      'Do not infer COPPA/GDPR-K compliance without jurisdiction, user-age, parental-consent, moderation, and privacy-owner evidence.',
    ],
    risks: [
      'Minor data introduces heightened privacy, consent, content safety, retention, and review obligations that cannot be treated as generic customer data.',
    ],
    validation_needed: [
      'Confirm age range, countries, parental-consent model, content moderation controls, retention, deletion, and legal/privacy owner signoff.',
    ],
    citations: ['ArchitectIQ minor-data baseline: child privacy requires explicit legal/privacy validation before launch.'],
  },
];

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+\-/ ]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
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
        source_path: doc.source_path || 'agents/compliance/complianceKnowledgeBase.js',
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
    source_path: doc.source_path || 'agents/compliance/complianceKnowledgeBase.js',
    version: doc.version || 'built-in',
    effective_date: doc.effective_date || 'current ArchitectIQ baseline',
    review_by: doc.review_by || 'not stated',
    freshness_status: doc.freshness_status || 'baseline',
  }];
}

function retrieveComplianceKnowledge({ query = '', retrievalPlan = [], signals = {}, limit = 6 } = {}) {
  const allDocs = [
    ...loadCompliancePolicyDocuments(),
    ...COMPLIANCE_KNOWLEDGE_DOCS,
  ];
  const queryTokens = new Set(tokenize([
    query,
    retrievalPlan.join(' '),
    Object.entries(signals).filter(([, value]) => value === true).map(([key]) => key).join(' '),
  ].join(' ')));
  const requested = new Set((retrievalPlan || []).map(String));
  const scoredCandidates = allDocs.map(doc => {
    const tokens = tokenize(docText(doc));
    const overlap = tokens.reduce((score, token) => score + (queryTokens.has(token) ? 1 : 0), 0);
    const planBoost = requested.has(doc.id) ? 12 : 0;
    const tagBoost = (doc.tags || []).reduce((score, tag) => score + (queryTokens.has(String(tag).toLowerCase()) ? 3 : 0), 0);
    return { doc, score: overlap + planBoost + tagBoost };
  })
    .filter(item => item.score > 0 || requested.has(item.doc.id));
  const byId = new Map();
  for (const item of scoredCandidates) {
    const existing = byId.get(item.doc.id);
    const itemIsPolicy = Boolean(item.doc.source);
    const existingIsPolicy = Boolean(existing?.doc?.source);
    if (!existing || (itemIsPolicy && !existingIsPolicy) || (itemIsPolicy === existingIsPolicy && item.score > existing.score)) {
      byId.set(item.doc.id, item);
    }
  }
  const scored = [...byId.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => ({ ...item.doc, score: item.score }));
  const freshnessValidation = unique(scored.flatMap(doc => {
    if (!doc.freshness_status || doc.freshness_status === 'current' || doc.freshness_status === 'baseline') return [];
    return (doc.freshness_notes || [`Policy freshness status is ${doc.freshness_status}.`])
      .map(note => `Policy freshness review required for ${doc.id}: ${note}`);
  }));

  return {
    tool: 'retrieveComplianceKnowledgeTool',
    source: 'local-compliance-knowledge-base',
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
      evidence_status: doc.source ? 'policy_pack' : 'baseline',
    })),
    controls: unique(scored.flatMap(doc => doc.controls || [])),
    risks: unique(scored.flatMap(doc => doc.risks || [])).map(item => ({
      risk: item,
      severity: /pci|minor|children|cross-border|ai\/rag|regulated/i.test(item) ? 'High' : 'Medium',
      likelihood: 'Medium',
      fix: 'Collect owner-approved compliance evidence and keep status as assumption/partial until verified.',
    })),
    validation_needed: unique([...scored.flatMap(doc => doc.validation_needed || []), ...freshnessValidation]),
    citations: scored.flatMap(citationsForDoc).map(citation => ({
      ...citation,
      evidence_status: citation.evidence_status || 'baseline',
    })).slice(0, 12),
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
  COMPLIANCE_KNOWLEDGE_DOCS,
  retrieveComplianceKnowledge,
};
