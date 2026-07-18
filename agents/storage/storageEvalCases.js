const STORAGE_EVAL_CASES = [
  {
    id: 'global-retail-storage',
    name: 'Global retail storage architecture',
    query: [
      'Global retail commerce platform with orders, payment token metadata, inventory reservation, catalog search, Redis cache, OpenSearch, PostgreSQL, object storage for invoices and product media, RAG vector DB, backups, retention, data residency, and multi-region DR.',
      'Need Storage review for systems of record, OLTP, cache/search, object storage, backup/restore, retention/deletion, migration/rebuild, security/compliance, and FinOps cost drivers.',
    ].join(' '),
    state: {
      agent_outputs: {
        security: { agentId: 'security' },
        compliance: { agentId: 'compliance' },
        governance: { agentId: 'governance' },
        infrastructure: { agentId: 'infrastructure' },
        technology: { agentId: 'technology' },
      },
    },
    mustMatch: [
      ['systems of record', /system.?of.?record|source.?of.?truth|write authority|data truth/i],
      ['oltp', /oltp|postgres|transactional|strong consistency/i],
      ['cache search', /redis|cache|ttl|opensearch|search|index|rebuild/i],
      ['backup retention', /backup|restore|retention|deletion|rto|rpo/i],
      ['security residency', /security|compliance|residency|encryption|kms|privacy/i],
      ['evidence pack', /data_domain_evidence_needed|storage_platform_evidence_needed|backup_retention_evidence_needed|approval_workflow/i],
      ['qualification', /draft|not database implementation|data governance|storage owner/i],
    ],
  },
  {
    id: 'checkout-payment-inventory-truth',
    name: 'Checkout payment inventory truth',
    query: [
      'Retail checkout needs order commit, payment metadata ledger, token vault reference, inventory reservation authority, promotion ledger, idempotency, reconciliation, and audit state.',
      'Cache and search must not be source of truth.',
    ].join(' '),
    mustMatch: [
      ['order truth', /orders|order.*source|order oltp|order.*write/i],
      ['payment ledger', /payment metadata|ledger|token-vault|psp/i],
      ['inventory authority', /inventory reservation|authority|strong/i],
      ['cache not truth', /cache.*not|no authoritative truth|subordinate|hidden sources of record/i],
      ['reconciliation', /idempotency|reconciliation|audit/i],
    ],
  },
  {
    id: 'cache-search-catalog',
    name: 'Cache search catalog storage',
    query: [
      'Retail catalog browse uses Redis cache, OpenSearch faceting, search indexing, inventory freshness, promotion freshness, hot-key controls, rebuild pipeline, backfill, stale-read tolerance, and peak sale query load.',
    ].join(' '),
    mustMatch: [
      ['cache controls', /redis|cache|ttl|invalidation|hot-key|stale/i],
      ['search controls', /opensearch|search|faceting|index|freshness|schema/i],
      ['rebuild', /rebuild|backfill|projection|authoritative/i],
      ['peak', /peak|query|load|throughput/i],
      ['evidence', /cache_search_evidence_needed|validation/i],
    ],
  },
  {
    id: 'object-document-storage',
    name: 'Object document storage',
    query: [
      'Retail needs object storage for product images, invoices, receipts, audit bundles, support attachments, exports, and AI knowledge documents with classification, malware scanning, retention, legal hold, signed access, and deletion.',
    ].join(' '),
    mustMatch: [
      ['object storage', /object storage|product media|invoices|receipts|support attachments|exports/i],
      ['classification', /classification|data class|malware|legal hold|signed access/i],
      ['retention deletion', /retention|deletion|lifecycle/i],
      ['security', /encryption|access|privacy|audit/i],
      ['evidence', /storage_platform_evidence_needed|client_questions/i],
    ],
  },
  {
    id: 'multi-region-backup-residency',
    name: 'Multi-region backup residency',
    query: [
      'Retail platform has India and Australia residency, regional backups, replicas, logs, exports, active-passive DR, restore tests, RTO/RPO, deletion propagation, support access, and backup encryption.',
    ].join(' '),
    mustMatch: [
      ['residency', /india|australia|residency|region|replica/i],
      ['backup dr', /backup|restore|active-passive|dr|rto|rpo/i],
      ['deletion propagation', /deletion propagation|retention|support access|export/i],
      ['encryption', /encryption|key|kms/i],
      ['evidence status', /assumption|storage_evidence_status|backup_retention_evidence_needed/i],
    ],
  },
  {
    id: 'ai-vector-storage',
    name: 'AI vector storage',
    query: [
      'Retail RAG chatbot needs approved knowledge corpus, embeddings, vector DB, metadata filters, prompt/eval traces, deletion propagation, rebuild from source documents, privacy, residency, and storage cost controls.',
    ].join(' '),
    mustMatch: [
      ['vector store', /vector|embedding|rag|knowledge corpus|metadata/i],
      ['derived rebuild', /derived|rebuild|source documents|authoritative/i],
      ['privacy residency', /privacy|residency|deletion|retention/i],
      ['cost', /cost|storage growth|query volume|finops/i],
      ['evidence', /storage_platform_evidence_needed|data_domain_evidence_needed/i],
    ],
  },
  {
    id: 'migration-rebuild-storage',
    name: 'Migration rebuild storage',
    query: [
      'Retail platform migration from legacy Oracle to PostgreSQL needs schema migration, CDC, backfill, cutover, rollback, dual-write avoidance, data quality checks, reconciliation reports, cache warmup, and search rebuild.',
    ].join(' '),
    mustMatch: [
      ['migration', /migration|schema|oracle|postgresql|cdc|backfill/i],
      ['cutover rollback', /cutover|rollback|dual-write/i],
      ['quality reconciliation', /data quality|reconciliation|checksums|counts/i],
      ['rebuild', /cache warmup|search rebuild|derived stores/i],
      ['validation', /migration_rebuild_evidence_needed|owner sign-off/i],
    ],
  },
  {
    id: 'missing-storage-evidence',
    name: 'Missing storage evidence',
    query: [
      'Architecture asks for final database choice but has no system-of-record owners, no data classes, no RTO/RPO, no retention policy, no backup restore evidence, no region evidence, and no cost drivers.',
    ].join(' '),
    mustMatch: [
      ['draft qualification', /draft|not database implementation|requires human validation/i],
      ['missing evidence', /owner|data class|rto|rpo|retention|backup|region|cost/i],
      ['validation gates', /storage_validation_gates|requires human validation/i],
      ['evidence pack', /approval_workflow|client_questions|data_domain_evidence_needed/i],
    ],
  },
];

function flattenOutput(output = {}) {
  return [
    output.summary,
    output.findings,
    output.storage_recommendation,
    output.storage_handoff_summary,
    output.data_domain_matrix,
    output.system_of_record_matrix,
    output.storage_platform,
    output.storage_platforms,
    output.cache_search_strategy,
    output.backup_recovery_retention,
    output.data_migration_rebuild,
    output.storage_evidence_status,
    output.storage_validation_gates,
    output.storage_qualification,
    output.storage_policy_citations,
    output.storage_evidence_pack,
    output.storage_signal_profile,
    output.risks,
    output.validation_needed,
    output.retrieval_requests,
    output.storage_tool_results,
    output.evidence,
    output.graph_agent,
  ].flat(8).map(item => {
    if (typeof item === 'string') return item;
    try {
      return JSON.stringify(item || '');
    } catch {
      return String(item || '');
    }
  }).join('\n');
}

function scoreStorageOutput(output, testCase) {
  const text = flattenOutput(output);
  const checks = testCase.mustMatch.map(([label, pattern]) => ({ label, pass: pattern.test(text) }));
  checks.push(
    { label: 'v1 storage_recommendation field', pass: Array.isArray(output.storage_recommendation) && output.storage_recommendation.length > 0 },
    { label: 'v1 data_domain_matrix field', pass: Array.isArray(output.data_domain_matrix) && output.data_domain_matrix.length > 0 },
    { label: 'v1 system_of_record_matrix field', pass: Array.isArray(output.system_of_record_matrix) && output.system_of_record_matrix.length > 0 },
    { label: 'v1 storage_platform field', pass: Boolean(output.storage_platform?.recommendation) },
    { label: 'v1 storage_platforms field', pass: Array.isArray(output.storage_platforms) && output.storage_platforms.length > 0 },
    { label: 'v1 cache_search_strategy field', pass: Boolean(output.cache_search_strategy?.cache_controls || output.cache_search_strategy?.cache) },
    { label: 'v1 backup_recovery_retention field', pass: Boolean(output.backup_recovery_retention?.controls || Array.isArray(output.backup_recovery_retention)) },
    { label: 'v1 data_migration_rebuild field', pass: Array.isArray(output.data_migration_rebuild) && output.data_migration_rebuild.length > 0 },
    { label: 'v1 storage_evidence_status field', pass: Boolean(output.storage_evidence_status?.storage) },
    { label: 'v1 storage_validation_gates field', pass: Array.isArray(output.storage_validation_gates) && output.storage_validation_gates.length > 0 },
    { label: 'v1 storage_qualification field', pass: output.storage_qualification?.status === 'draft_requires_data_storage_owner_review' },
    { label: 'v1 storage_policy_citations field', pass: Array.isArray(output.storage_policy_citations) && output.storage_policy_citations.length > 0 },
    { label: 'v1 storage_evidence_pack field', pass: Array.isArray(output.storage_evidence_pack?.approval_workflow) && output.storage_evidence_pack.approval_workflow.length > 0 },
    { label: 'v1 storage_signal_profile field', pass: Array.isArray(output.storage_signal_profile?.domains) && output.storage_signal_profile.domains.length > 0 }
  );
  const passed = checks.filter(check => check.pass).length;
  return {
    case_id: testCase.id,
    name: testCase.name,
    passed,
    total: checks.length,
    score: checks.length ? Math.round((passed / checks.length) * 100) : 0,
    checks,
    graph_validation: output.graph_agent?.validation?.verdict || 'missing',
  };
}

module.exports = {
  STORAGE_EVAL_CASES,
  scoreStorageOutput,
};
