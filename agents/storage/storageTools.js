const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const { buildRetailText, getRetailSignals } = require('../retailContext');
const { retrieveStorageKnowledge } = require('./storageKnowledgeBase');

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function textFromInput(input = {}) {
  return buildRetailText({
    query: input.query || '',
    context: input.context || {},
    state: input.state || {},
  }).toLowerCase();
}

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

function inspectStorageHandoff(input = {}) {
  const state = input.state || {};
  const upstream = {
    security: Boolean(state.agent_outputs?.security || state.security_tool_context),
    compliance: Boolean(state.agent_outputs?.compliance || state.compliance_tool_context),
    governance: Boolean(state.agent_outputs?.governance || state.governance_tool_context),
    infrastructure: Boolean(state.agent_outputs?.infrastructure || state.infrastructure_tool_context),
    technology: Boolean(state.agent_outputs?.technology || state.technology_tool_context),
    finops: Boolean(state.agent_outputs?.finops || state.finops_tool_context),
    security_evidence_status: state.security_evidence_pack?.evidence_status || state.evidence_status || {},
    compliance_evidence_status: state.compliance_evidence_status || {},
    governance_evidence_status: state.governance_evidence_status || {},
    infrastructure_evidence_status: state.infrastructure_evidence_status || {},
    technology_evidence_status: state.technology_evidence_status || {},
    validation_gaps: asArray(state.validation_gaps),
  };
  const controls = [
    'Carry upstream constraints into storage: data classes, PCI/privacy, residency, systems of record, runtime topology, network boundaries, backup/log/export location, support access, and cost drivers.',
    'Storage remains draft until data owners validate source of truth, consistency, retention, backup/restore, security, residency, and cost evidence.',
  ];
  if (upstream.security) controls.push('Apply Security handoff to encryption, key ownership, privileged access, secrets, audit logging, AI/vector data, and data classification.');
  if (upstream.compliance) controls.push('Apply Compliance handoff to residency, retention/deletion, processor/support access, audit evidence, backup/log/export location, and DSAR/deletion propagation.');
  if (upstream.governance) controls.push('Apply Governance handoff to system-of-record owners, approval gates, ADRs, rollout, acceptance tests, and accepted-risk workflow.');
  if (upstream.infrastructure) controls.push('Apply Infrastructure handoff to regions, runtime, private connectivity, HA/DR, observability, environment, release, and restore testing.');
  if (upstream.technology) controls.push('Apply Technology handoff to API/service boundaries, data domains, AI/vector needs, UI/channel needs, and specialist decision gates.');

  return {
    tool: 'inspectStorageHandoffTool',
    upstream,
    controls,
    validation_needed: [
      'Confirm upstream Security, Compliance, Governance, Infrastructure, and Technology outputs are accepted as constraints before storage approval.',
      'Confirm unresolved validation gaps are assigned to data, storage, platform, security, compliance, technology, and FinOps owners.',
    ],
  };
}

function mapDataDomains(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const text = textFromInput(input);
  const domains = [
    { domain: 'Orders', owner: 'Order domain owner', write_authority: 'Order OLTP service/database', consistency: 'strong after commit', evidence_status: 'assumption' },
    { domain: 'Payment metadata', owner: 'Payments owner', write_authority: 'Payment orchestration ledger with PSP/token-vault reference', consistency: 'strong and auditable', evidence_status: 'assumption' },
    { domain: 'Inventory reservation', owner: 'Inventory owner', write_authority: 'Inventory reservation authority', consistency: 'strong for reservation/commit path', evidence_status: 'assumption' },
    { domain: 'Product/catalog', owner: 'Merchandising/catalog owner', write_authority: 'Catalog/PIM authority with search as projection', consistency: 'eventual for browse/search projection', evidence_status: 'assumption' },
    { domain: 'Price/promotion', owner: 'Pricing/promotion owner', write_authority: 'Pricing/promotion ledger or rules authority', consistency: 'strong for checkout-visible price decisions', evidence_status: 'assumption' },
    { domain: 'Customer/loyalty', owner: 'Customer/loyalty owner', write_authority: 'Customer profile/CDP/loyalty authority', consistency: 'privacy and consent constrained', evidence_status: 'assumption' },
  ];
  if (signals.supplyChain || /fulfilment|wms|oms|erp|carrier|supplier/.test(text)) {
    domains.push({ domain: 'Fulfilment/logistics', owner: 'Fulfilment owner', write_authority: 'OMS/WMS/TMS domain authority with integration replay', consistency: 'eventual with reconciliation except committed operational state', evidence_status: 'assumption' });
  }
  if (signals.retailAi || /ai|rag|vector|embedding|knowledge/.test(text)) {
    domains.push({ domain: 'AI knowledge/vector data', owner: 'AI/data owner', write_authority: 'Approved knowledge corpus with vector index as derived store', consistency: 'derived and rebuildable', evidence_status: 'assumption' });
  }
  return {
    tool: 'mapDataDomainsTool',
    data_domain_matrix: domains,
    controls: [
      'Every data domain must have a named owner, write authority, consistency model, read projections, and reconciliation path.',
      'Derived stores must state their authoritative source and rebuild process.',
    ],
    validation_needed: [
      'Confirm source of truth, owner, consistency, write authority, projection, reconciliation, and audit evidence for every data domain.',
    ],
  };
}

function selectStoragePlatforms(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const text = textFromInput(input);
  const commerce = signals.commerce || /checkout|order|payment|inventory|promotion/.test(text);
  const ai = signals.retailAi || /ai|rag|vector|embedding/.test(text);
  const platforms = [
    { layer: 'Transactional OLTP', recommendation: commerce ? 'Managed PostgreSQL-compatible relational cluster for order, payment metadata, promotion ledger, and inventory reservation authority where strict consistency is required.' : 'OLTP platform remains assumption-level until transactional domains are confirmed.', evidence_status: 'assumption' },
    { layer: 'Cache', recommendation: 'Redis-compatible cache for read acceleration, session/rate/freshness optimization, and carefully bounded short-lived coordination only when authority remains elsewhere.', evidence_status: 'assumption' },
    { layer: 'Search/read model', recommendation: 'OpenSearch-compatible catalog/search projection fed by authoritative catalog/inventory events with rebuild and schema versioning.', evidence_status: 'assumption' },
    { layer: 'Object/document storage', recommendation: 'Object storage for product media, invoices, receipts, exports, audit bundles, support attachments, and approved AI corpora with classification and lifecycle controls.', evidence_status: 'assumption' },
    { layer: 'Analytics/event storage', recommendation: 'Analytics warehouse/lake/event store as downstream data product with privacy filtering, CDC/event schema, replay, and deletion propagation.', evidence_status: 'assumption' },
  ];
  if (ai) platforms.push({ layer: 'Vector/retrieval store', recommendation: 'Vector DB/index as derived retrieval store from approved knowledge corpus, with metadata filters, deletion propagation, rebuild path, and cost controls.', evidence_status: 'assumption' });
  return {
    tool: 'selectStoragePlatformsTool',
    storage_platforms: platforms,
    controls: [
      'Choose each storage platform by consistency, latency, data class, recovery, rebuild, residency, access, and owner requirements.',
      'Do not use cache/search/vector/analytics stores as hidden systems of record.',
    ],
    risks: [
      risk('Selecting storage by product familiarity instead of data authority and consistency can break checkout, inventory, pricing, or audit behavior.', 'High', 'Medium', 'Start from data-domain ownership and consistency before selecting storage products.'),
    ],
    validation_needed: [
      'Confirm storage products, service tiers, region availability, quotas, RTO/RPO, support plan, data classes, and owner approvals.',
    ],
  };
}

function planCacheSearchStrategy() {
  return {
    tool: 'planCacheSearchStrategyTool',
    cache_search_strategy: {
      cache_controls: [
        'Define cache purpose, keys, TTL, invalidation triggers, stale-read tolerance, hot-key controls, fallback, and monitoring.',
        'Use cache for read acceleration and bounded coordination only; authoritative decisions must be backed by source-of-truth writes.',
      ],
      search_controls: [
        'Define search index schema, source events, freshness SLO, rebuild pipeline, backfill, relevance testing, and zero-result/fallback behavior.',
        'Keep catalog/search indexes rebuildable from authoritative product, price, promotion, and inventory sources.',
      ],
      evidence_status: 'assumption',
    },
    controls: [
      'Cache and search are subordinate projections with explicit freshness, rebuild, and fallback rules.',
    ],
    validation_needed: [
      'Confirm cache TTL/invalidation, search freshness SLO, rebuild time, peak query profile, index size, and stale-data acceptance.',
    ],
  };
}

function planBackupRecoveryRetention(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  return {
    tool: 'planBackupRecoveryRetentionTool',
    backup_recovery_retention: {
      posture: signals.multiRegion ? 'Multi-region/residency scenario requires domain-specific replication, backup region, restore, deletion, and conflict policy.' : 'Regional backup/restore and retention remain assumption-level until RTO/RPO and residency are confirmed.',
      controls: [
        'Define backup schedule, retention, immutable backup need, legal hold, archive, deletion exceptions, and restore test cadence by data domain.',
        'Track backup, logs, traces, exports, replicas, analytics copies, and vector stores as separate data copies for residency and deletion.',
        'Define RTO/RPO, restore runbook, game-day evidence, and owner sign-off.',
      ],
      evidence_status: 'assumption',
    },
    controls: [
      'Backup claims require restore evidence and retention/deletion ownership.',
      'Privacy deletion and DSAR requirements must include backups, exports, analytics, logs, and derived AI/vector stores where applicable.',
    ],
    validation_needed: [
      'Confirm RTO/RPO, backup region, retention schedule, deletion propagation, legal hold, immutable backups, restore test evidence, and owner approvals.',
    ],
  };
}

function planMigrationRebuild() {
  return {
    tool: 'planMigrationRebuildTool',
    data_migration_rebuild: [
      'Use migration ADRs for schema changes, data backfill, cutover, rollback, validation, and reconciliation.',
      'Avoid uncontrolled dual writes; use outbox/CDC/backfill patterns with clear reconciliation where migration requires temporary duplication.',
      'Define rebuild runbooks for search, cache warmup, read models, analytics tables, and vector indexes from authoritative sources.',
      'Define data quality checks, checksums/counts, sampling, business reconciliation, and owner acceptance before cutover.',
    ],
    controls: [
      'Derived stores must be rebuildable and migration must preserve auditability, consistency, privacy, and rollback.',
    ],
    validation_needed: [
      'Confirm migration method, cutover plan, rollback, data quality checks, reconciliation reports, rebuild runbooks, and owner sign-off.',
    ],
  };
}

function retrieveStorageKnowledgeForInput(input = {}) {
  return retrieveStorageKnowledge({
    query: buildRetailText({
      query: input.query || '',
      context: input.context || {},
      state: input.state || {},
    }),
    retrievalPlan: input.retrievalPlan || input.retrieval_plan || [],
    signals: input.signals || {},
    limit: input.limit || 7,
  });
}

function validateStorageOutput(input = {}) {
  const output = input.output || {};
  const toolResults = asArray(input.toolResults);
  const text = [
    output.summary,
    output.findings,
    output.storage_recommendation,
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
    toolResults,
  ].flat(7).map(item => typeof item === 'string' ? item : JSON.stringify(item || '')).join('\n').toLowerCase();
  const blockers = [];
  const warnings = [];
  const improvements = [];
  const hasSoR = /system.?of.?record|source.?of.?truth|write authority|data truth|owner/.test(text);
  const hasOltp = /oltp|transaction|postgres|database|strong consistency|acid/.test(text);
  const hasCacheSearch = /cache|redis|ttl|invalidation|search|opensearch|index|rebuild/.test(text);
  const hasBackupRetention = /backup|restore|retention|deletion|rto|rpo|legal hold|archive/.test(text);
  const hasSecurityResidency = /security|compliance|residency|encryption|kms|pci|privacy|support access|audit/.test(text);
  const hasMigration = /migration|backfill|cdc|cutover|rollback|rebuild|reconciliation/.test(text);
  const hasUpstream = /technology|security|compliance|governance|infrastructure|finops|handoff/.test(text);
  const hasEvidencePack = /evidence_pack|policy_sources|approval_workflow|client_questions|data_domain_evidence_needed|storage_platform_evidence_needed|backup_retention_evidence_needed/.test(text);
  const hasQualification = /draft|not.*approval|human validation|requires.*validation|data owner|storage owner/.test(text);
  const hasCitations = /citation|source_id|policy|baseline/.test(text);

  if (!hasSoR) blockers.push('Storage output does not define systems of record/source of truth/write authority.');
  if (!hasOltp) blockers.push('Storage output does not define transactional OLTP/consistency direction.');
  if (!hasCacheSearch) blockers.push('Storage output does not define cache/search/read-model behavior.');
  if (!hasBackupRetention) blockers.push('Storage output does not define backup/restore/retention/deletion controls.');
  if (!hasSecurityResidency) blockers.push('Storage output does not carry security/compliance/residency controls.');
  if (!hasMigration) warnings.push('Storage output should include migration/rebuild/cutover/reconciliation controls.');
  if (!hasUpstream) blockers.push('Storage output does not consume upstream Technology/Security/Compliance/Governance/Infrastructure/FinOps constraints.');
  if (!hasEvidencePack) blockers.push('Storage output does not include customer-facing evidence pack with data-domain and storage-platform evidence needs.');
  if (!hasQualification) blockers.push('Storage output does not qualify recommendation as draft-level until data/storage owners validate evidence.');
  if (!hasCitations) warnings.push('Storage output should include citations or source evidence.');
  if (!toolResults.length) blockers.push('Storage tools did not produce handoff, data-domain, platform, cache/search, backup, migration, retrieval, or validation evidence.');
  if (!output.model_review?.enabled) improvements.push('Run model judgement for customer-specific storage recommendations when an approved model is available.');

  return {
    tool: 'validateStorageOutputTool',
    verdict: blockers.length ? 'fail' : warnings.length ? 'warn' : 'pass',
    blockers,
    warnings,
    improvements,
    required_controls: {
      systems_of_record: hasSoR,
      oltp_consistency: hasOltp,
      cache_search: hasCacheSearch,
      backup_retention: hasBackupRetention,
      security_residency: hasSecurityResidency,
      migration_rebuild: hasMigration,
      upstream_handoff: hasUpstream,
      evidence_pack: hasEvidencePack,
      qualification: hasQualification,
      citations_or_sources: hasCitations,
    },
  };
}

const toolInputSchema = z.object({
  query: z.string().optional(),
  context: z.record(z.any()).optional(),
  state: z.record(z.any()).optional(),
  signals: z.record(z.any()).optional(),
  output: z.record(z.any()).optional(),
  toolResults: z.array(z.any()).optional(),
  retrievalPlan: z.array(z.string()).optional(),
  retrieval_plan: z.array(z.string()).optional(),
  limit: z.number().optional(),
});

const storageTools = {
  inspectStorageHandoffTool: tool(inspectStorageHandoff, {
    name: 'inspectStorageHandoffTool',
    description: 'Inspect upstream Technology, Security, Compliance, Governance, Infrastructure, and FinOps constraints before Storage recommendations.',
    schema: toolInputSchema,
  }),
  mapDataDomainsTool: tool(mapDataDomains, {
    name: 'mapDataDomainsTool',
    description: 'Map retail data domains, source of truth, write authority, owners, and consistency.',
    schema: toolInputSchema,
  }),
  selectStoragePlatformsTool: tool(selectStoragePlatforms, {
    name: 'selectStoragePlatformsTool',
    description: 'Select OLTP, cache, search, object, analytics/event, and vector storage direction.',
    schema: toolInputSchema,
  }),
  planCacheSearchStrategyTool: tool(planCacheSearchStrategy, {
    name: 'planCacheSearchStrategyTool',
    description: 'Plan cache, search, read-model, invalidation, freshness, and rebuild strategy.',
    schema: toolInputSchema,
  }),
  planBackupRecoveryRetentionTool: tool(planBackupRecoveryRetention, {
    name: 'planBackupRecoveryRetentionTool',
    description: 'Plan backup, restore, retention, deletion, replication, RTO/RPO, and residency evidence.',
    schema: toolInputSchema,
  }),
  planMigrationRebuildTool: tool(planMigrationRebuild, {
    name: 'planMigrationRebuildTool',
    description: 'Plan migration, cutover, rollback, rebuild, CDC/backfill, and reconciliation controls.',
    schema: toolInputSchema,
  }),
  retrieveStorageKnowledgeTool: tool(retrieveStorageKnowledgeForInput, {
    name: 'retrieveStorageKnowledgeTool',
    description: 'Retrieve local ArchitectIQ Storage knowledge and customer policy packs.',
    schema: toolInputSchema,
  }),
  validateStorageOutputTool: tool(validateStorageOutput, {
    name: 'validateStorageOutputTool',
    description: 'Validate Storage output against systems of record, OLTP, cache/search, backup, residency, migration, handoff, and evidence controls.',
    schema: toolInputSchema,
  }),
};

module.exports = {
  inspectStorageHandoff,
  mapDataDomains,
  planBackupRecoveryRetention,
  planCacheSearchStrategy,
  planMigrationRebuild,
  retrieveStorageKnowledgeForInput,
  selectStoragePlatforms,
  storageTools,
  validateStorageOutput,
};
