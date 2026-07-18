const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeModelReview, runSpecialistModel } = require('../llmClient');

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

async function runStorageAgent({ query, context, state, retrievedContext, useModel }) {
  const signals = getRetailSignals({ query, context, state });
  const scenarioText = [query, JSON.stringify(context || {}), JSON.stringify(state || {})].join(' ');
  const hasCommerce = signals.commerce || /checkout|order|payment|inventory|promotion|catalog/i.test(scenarioText);
  const hasSearch = /search|catalog|faceting|opensearch|elastic/i.test(scenarioText);
  const hasCache = /cache|redis|hot key|ttl/i.test(scenarioText);
  const hasAi = signals.retailAi || /rag|vector|embedding|llm|ai corpus|knowledge base/i.test(scenarioText);
  const hasMultiRegion = signals.multiRegion || /multi-region|replication|residency|rto|rpo|dr/i.test(scenarioText);

  const findings = [
    'Assign systems of record before choosing storage products: order, payment metadata, inventory, product/catalog, price/promotion, customer/loyalty, fulfilment, returns, audit, and AI knowledge where applicable.',
    'Keep transactional truth separate from cache, search, analytics, events, and AI/vector stores.',
    'Storage evidence must stay explicit: verified, partial, assumption, missing, stale, or blocked for human validation.',
    'Carry Security, Compliance, Governance, Infrastructure, Technology, and FinOps handoffs into storage: data class, residency, key ownership, backup/log/export location, support access, RTO/RPO, and cost drivers.',
  ];
  if (hasCommerce) findings.push('Use strongly consistent OLTP storage for order commit, payment metadata ledger, inventory reservation authority, promotion ledger, and audit-critical transitions.');
  if (hasCache) findings.push('Use cache as a read accelerator only, with TTL, invalidation, hot-key controls, stale-read tolerance, and fallback to authoritative stores.');
  if (hasSearch) findings.push('Use search/catalog index as a rebuildable read model with schema versioning, freshness SLO, rebuild pipeline, and source-of-truth ownership elsewhere.');
  if (hasAi) findings.push('Treat AI corpora, embeddings, vector stores, prompt traces, and eval datasets as classified storage with retention, residency, deletion, and access controls.');
  if (hasMultiRegion) findings.push('Define replication, backup residency, restore tests, RTO/RPO, failover data behavior, deletion propagation, and conflict policy by data domain.');

  const dataDomainMatrix = [
    { domain: 'Orders', source_of_truth: 'Strongly consistent OLTP order store', consistency: 'strong for committed orders', evidence_status: 'assumption' },
    { domain: 'Payment metadata', source_of_truth: 'Payment orchestration ledger with PSP/token-vault reference only', consistency: 'strong and auditable', evidence_status: 'assumption' },
    { domain: 'Inventory reservation', source_of_truth: 'Inventory authority/reservation store', consistency: 'strong for reservation/commit path', evidence_status: 'assumption' },
    { domain: 'Catalog/search', source_of_truth: 'Product/catalog authority with search index as projection', consistency: 'eventual for browse, rebuildable', evidence_status: 'assumption' },
    { domain: 'Customer/loyalty', source_of_truth: 'Customer/loyalty profile store constrained by privacy/residency controls', consistency: 'domain-specific', evidence_status: 'assumption' },
    hasAi ? { domain: 'AI knowledge/vector data', source_of_truth: 'Approved knowledge corpus plus vector index as derived retrieval store', consistency: 'derived and rebuildable', evidence_status: 'assumption' } : null,
  ].filter(Boolean);

  const risks = [
    risk('Cache/search/event streams can be accidentally treated as truth, causing oversell, stale pricing, payment reconciliation gaps, or audit failure.', 'High', 'Medium', 'Define source of truth, rebuild paths, invalidation, and reconciliation for every derived store.'),
    risk('Backups, replicas, exports, logs, and vector stores can violate residency/privacy assumptions even when primary databases are compliant.', 'High', 'Medium', 'Map every copy of data to region, retention, deletion, encryption, and support-access evidence.'),
  ];

  const validationNeeded = [
    'Confirm systems of record, data owners, write authority, consistency model, and reconciliation process for every retail data domain.',
    'Confirm OLTP, cache, search, object/document, analytics/event, backup, replica, and AI/vector stores with evidence status.',
    'Confirm RTO/RPO, backup/restore tests, retention/deletion, legal hold, replication, residency, and deletion propagation.',
    'Confirm storage cost drivers: storage growth, IOPS/throughput, read/write mix, cache memory, search indexing/query volume, backup retention, egress, and non-prod parity.',
  ];

  const retrievalRequests = [
    'retail-systems-of-record-storage-template',
    'retail-oltp-storage-template',
    'retail-cache-search-read-model-template',
    'retail-object-document-storage-template',
    'retail-backup-retention-storage-template',
    'retail-analytics-event-storage-template',
    'retail-storage-security-residency-template',
  ];

  const base = {
    agentId: 'storage',
    title: 'Storage AI Agent',
    status: 'completed',
    summary: 'Storage review aligned to ArchitectIQ Retail: systems of record, transactional truth, cache/search/read models, object/document storage, backup/restore, retention/deletion, analytics/event handoff, and security/residency constraints.',
    retail_workload: signals.workloadTypes,
    findings,
    storage_recommendation: findings,
    data_domain_matrix: dataDomainMatrix,
    system_of_record_matrix: dataDomainMatrix,
    storage_platform: {
      recommendation: hasCommerce ? 'Managed PostgreSQL-compatible OLTP for transactional authority, plus domain-specific stores only when consistency, scale, and ownership require them.' : 'Storage platform remains assumption-level until systems of record and consistency needs are confirmed.',
      evidence_status: 'assumption',
    },
    cache_search_strategy: {
      cache: hasCache || hasCommerce ? 'Redis-compatible cache for read acceleration, short-lived locks only where safe, TTL/invalidation/hot-key controls, and no authoritative truth.' : 'Cache conditional until read latency and peak profile are confirmed.',
      search: hasSearch || hasCommerce ? 'OpenSearch-compatible catalog/search projection with schema versioning, freshness SLO, and rebuild pipeline.' : 'Search conditional until catalog/search/faceting needs are confirmed.',
      evidence_status: 'assumption',
    },
    backup_recovery_retention: [
      'Define backup, restore, retention, deletion, legal hold, archive, replication, RTO/RPO, and restore-test evidence by data domain.',
      'Track backup/log/export residency and deletion exceptions separately from production data.',
    ],
    data_migration_rebuild: [
      'Define schema migration, dual-write avoidance, CDC/backfill, search rebuild, cache warmup, rollback, and reconciliation approach.',
      'Keep derived stores rebuildable from authoritative sources with owner-approved runbooks.',
    ],
    storage_evidence_status: {
      storage: 'assumption',
      systems_of_record: 'assumption',
      oltp: 'assumption',
      cache_search: hasCache || hasSearch || hasCommerce ? 'assumption' : 'conditional',
      backup_retention: 'assumption',
      residency_security: 'assumption',
    },
    risks,
    validation_needed: validationNeeded,
    retrieval_requests: retrievalRequests,
    evidence: retailEvidence(retrievedContext),
    statePatch: {
      retail_workload: signals.workloadTypes,
      storage_controls: findings,
      storage_recommendation: findings,
      data_domain_matrix: dataDomainMatrix,
      system_of_record_matrix: dataDomainMatrix,
      storage_platform: {
        recommendation: hasCommerce ? 'Managed PostgreSQL-compatible OLTP for transactional authority, plus domain-specific stores only when consistency, scale, and ownership require them.' : 'Storage platform remains assumption-level until systems of record and consistency needs are confirmed.',
        evidence_status: 'assumption',
      },
      cache_search_strategy: {
        cache: hasCache || hasCommerce ? 'Redis-compatible cache for read acceleration, short-lived locks only where safe, TTL/invalidation/hot-key controls, and no authoritative truth.' : 'Cache conditional until read latency and peak profile are confirmed.',
        search: hasSearch || hasCommerce ? 'OpenSearch-compatible catalog/search projection with schema versioning, freshness SLO, and rebuild pipeline.' : 'Search conditional until catalog/search/faceting needs are confirmed.',
        evidence_status: 'assumption',
      },
      backup_recovery_retention: [
        'Define backup, restore, retention, deletion, legal hold, archive, replication, RTO/RPO, and restore-test evidence by data domain.',
        'Track backup/log/export residency and deletion exceptions separately from production data.',
      ],
      data_migration_rebuild: [
        'Define schema migration, dual-write avoidance, CDC/backfill, search rebuild, cache warmup, rollback, and reconciliation approach.',
        'Keep derived stores rebuildable from authoritative sources with owner-approved runbooks.',
      ],
      storage_evidence_status: {
        storage: 'assumption',
        systems_of_record: 'assumption',
        oltp: 'assumption',
        cache_search: hasCache || hasSearch || hasCommerce ? 'assumption' : 'conditional',
        backup_retention: 'assumption',
        residency_security: 'assumption',
      },
      risks,
      human_validation_needed: validationNeeded,
      validation_gaps: validationNeeded.map(item => `Storage validation required: ${item}`),
      evidence_status: {
        storage: 'assumption',
      },
      retrieval_requests: retrievalRequests,
    },
  };

  if (!useModel) return base;

  try {
    const modelReview = await runSpecialistModel({
      agentId: 'storage',
      title: 'Storage AI Agent',
      system: `You are the ArchitectIQ Retail Storage AI Agent. Review storage only: systems of record, transactional truth, OLTP, cache, search, object/document storage, backup/restore, retention/deletion, analytics/event handoff, migration/rebuild, data residency, encryption, support access, and storage cost drivers. Carry Security, Compliance, Governance, Infrastructure, Technology, and FinOps constraints forward. Do not output internal agent-development commentary. Return concise JSON only.`,
      input: JSON.stringify({
        query,
        context,
        current_state: state,
        deterministic_storage_review: base,
      }),
    });
    return mergeModelReview(base, modelReview);
  } catch (err) {
    return {
      ...base,
      model_review: {
        enabled: true,
        error: err.message,
      },
      validation_needed: [
        ...base.validation_needed,
        `Storage model review failed and deterministic storage rules were used instead: ${err.message}`,
      ],
    };
  }
}

module.exports = { runStorageAgent };
