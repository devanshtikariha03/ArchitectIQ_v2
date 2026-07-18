const { loadStoragePolicyDocuments } = require('./storagePolicyIngestion');

const STORAGE_KNOWLEDGE_DOCS = [
  {
    id: 'retail-systems-of-record-storage-template',
    title: 'Retail Systems Of Record Storage Template',
    tags: ['system-of-record', 'truth', 'ownership', 'consistency'],
    controls: ['Assign a named source of truth for orders, payment metadata, inventory, product/catalog, price/promotion, customer/loyalty, fulfilment, returns, audit, and AI knowledge stores.'],
    risks: ['Unclear systems of record cause oversell, reconciliation gaps, customer-impacting data conflicts, and audit failure.'],
    validation_needed: ['Confirm system owner, consistency model, write authority, read projections, reconciliation process, and audit evidence for each data domain.'],
    citations: ['ArchitectIQ storage baseline: every retail data domain needs a named owner and write authority.'],
  },
  {
    id: 'retail-oltp-storage-template',
    title: 'Retail OLTP Storage Template',
    tags: ['oltp', 'database', 'transaction', 'consistency'],
    controls: ['Use strongly consistent transactional storage for order commit, payment metadata ledger, inventory reservation authority, promotion ledger, and audit-critical state transitions.'],
    risks: ['Using cache, search, or event streams as transactional truth can create oversell, double-charge, stale promise, and reconciliation failures.'],
    validation_needed: ['Confirm transaction boundaries, isolation/locking/idempotency rules, schema ownership, migration strategy, RTO/RPO, and restore evidence.'],
    citations: ['ArchitectIQ storage baseline: revenue-critical writes require durable transactional authority.'],
  },
  {
    id: 'retail-cache-search-read-model-template',
    title: 'Retail Cache Search Read Model Template',
    tags: ['cache', 'search', 'read-model', 'rebuild'],
    controls: ['Use cache and search as subordinate read accelerators with TTL, invalidation, rebuild, backpressure, and stale-read behavior defined.'],
    risks: ['Cache/search misuse can expose stale price, inventory, promotion, or product state and damage customer trust.'],
    validation_needed: ['Confirm cache keys, TTLs, invalidation triggers, search indexing pipeline, rebuild plan, stale-read tolerance, and peak query profile.'],
    citations: ['ArchitectIQ storage baseline: cache/search must be rebuildable projections, not hidden sources of truth.'],
  },
  {
    id: 'retail-object-document-storage-template',
    title: 'Retail Object Document Storage Template',
    tags: ['object-storage', 'documents', 'media', 'files'],
    controls: ['Use object/document storage for receipts, invoices, product media, exports, audit bundles, support attachments, and AI corpora with classification, retention, malware scanning, and access controls.'],
    risks: ['Unclassified file/object stores can leak customer data, payment-adjacent evidence, support attachments, or AI knowledge corpus content.'],
    validation_needed: ['Confirm bucket/container ownership, data class, encryption, object lifecycle, access paths, malware scanning, legal hold, and deletion workflow.'],
    citations: ['ArchitectIQ storage baseline: object stores require classification, lifecycle, and access evidence.'],
  },
  {
    id: 'retail-backup-retention-storage-template',
    title: 'Retail Backup Retention Storage Template',
    tags: ['backup', 'restore', 'retention', 'deletion'],
    controls: ['Define backup, restore, retention, deletion, legal hold, archive, replication, RTO/RPO, and game-day evidence by data domain.'],
    risks: ['Backup and retention design can violate privacy/residency rules or fail recovery objectives if not tested and domain-specific.'],
    validation_needed: ['Confirm retention schedule, deletion exceptions, restore test cadence, backup residency, encryption, immutable backup need, and owner sign-off.'],
    citations: ['ArchitectIQ storage baseline: backup claims require restore evidence and retention ownership.'],
  },
  {
    id: 'retail-analytics-event-storage-template',
    title: 'Retail Analytics Event Storage Template',
    tags: ['analytics', 'events', 'cdc', 'warehouse'],
    controls: ['Separate operational truth from analytics/event stores and define CDC, event schema, replay, privacy filtering, aggregation, and downstream ownership.'],
    risks: ['Analytics and event pipelines can create unauthorized copies, stale operational decisions, or unclear deletion obligations.'],
    validation_needed: ['Confirm CDC/event source, schema versioning, replay policy, privacy filters, aggregation rules, downstream consumers, and deletion propagation.'],
    citations: ['ArchitectIQ storage baseline: analytics/event stores are downstream products with explicit privacy and replay controls.'],
  },
  {
    id: 'retail-storage-security-residency-template',
    title: 'Retail Storage Security Residency Template',
    tags: ['security', 'residency', 'encryption', 'pci', 'privacy'],
    controls: ['Map data class to encryption, KMS/HSM/CMEK/CSEK, access model, support access, logs, backups, replicas, exports, and approved regions.'],
    risks: ['Storage choices can invalidate Security and Compliance assumptions through replicas, backups, logs, exports, support access, or unmanaged keys.'],
    validation_needed: ['Confirm data classes, PCI/privacy scope, approved regions, key ownership, backup/log/export residency, support access, and audit evidence.'],
    citations: ['ArchitectIQ storage baseline: storage architecture must preserve security and residency constraints end to end.'],
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
        source_path: doc.source_path || 'agents/storage/storageKnowledgeBase.js',
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
    source_path: doc.source_path || 'agents/storage/storageKnowledgeBase.js',
    version: doc.version || 'built-in',
    effective_date: doc.effective_date || 'current ArchitectIQ baseline',
    review_by: doc.review_by || 'not stated',
    freshness_status: doc.freshness_status || 'baseline',
  }];
}

function retrieveStorageKnowledge({ query = '', retrievalPlan = [], signals = {}, limit = 7 } = {}) {
  const allDocs = [
    ...loadStoragePolicyDocuments(),
    ...STORAGE_KNOWLEDGE_DOCS,
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
    tool: 'retrieveStorageKnowledgeTool',
    source: 'local-storage-knowledge-base',
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
      severity: /oversell|double-charge|leak|violate|fail|unauthorized|invalidate/i.test(item) ? 'High' : 'Medium',
      likelihood: 'Medium',
      fix: 'Attach data owner, source-of-truth ADR, consistency evidence, restore evidence, retention evidence, and security/residency approval.',
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
  STORAGE_KNOWLEDGE_DOCS,
  retrieveStorageKnowledge,
};
