const { Annotation, END, START, StateGraph } = require('@langchain/langgraph');
const { runStorageAgent } = require('./storageAgent');
const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeUnique } = require('../schema');
const { storageTools } = require('./storageTools');
const { classifyStorageSignals } = require('./storageSignalClassifier');

const StorageGraphState = Annotation.Root({
  query: Annotation({ reducer: (_current, update) => update, default: () => '' }),
  mode: Annotation({ reducer: (_current, update) => update, default: () => 'architecture-review' }),
  useModel: Annotation({ reducer: (_current, update) => update, default: () => true }),
  context: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  architectureState: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  retrievedContext: Annotation({ reducer: (_current, update) => update, default: () => [] }),
  signals: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  storageSignalProfile: Annotation({ reducer: (_current, update) => update, default: () => null }),
  handoff: Annotation({ reducer: (_current, update) => update, default: () => null }),
  dataDomains: Annotation({ reducer: (_current, update) => update, default: () => null }),
  storagePlatforms: Annotation({ reducer: (_current, update) => update, default: () => null }),
  cacheSearch: Annotation({ reducer: (_current, update) => update, default: () => null }),
  backupRetention: Annotation({ reducer: (_current, update) => update, default: () => null }),
  migrationRebuild: Annotation({ reducer: (_current, update) => update, default: () => null }),
  storageKnowledge: Annotation({ reducer: (_current, update) => update, default: () => null }),
  retrievalPlan: Annotation({ reducer: (_current, update) => update, default: () => [] }),
  evidence: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  deterministicReview: Annotation({ reducer: (_current, update) => update, default: () => null }),
  augmentedReview: Annotation({ reducer: (_current, update) => update, default: () => null }),
  modelReview: Annotation({ reducer: (_current, update) => update, default: () => null }),
  validation: Annotation({ reducer: (_current, update) => update, default: () => ({ verdict: 'pending', blockers: [], warnings: [], improvements: [] }) }),
  remediation: Annotation({ reducer: (_current, update) => update, default: () => null }),
  output: Annotation({ reducer: (_current, update) => update, default: () => null }),
  trace: Annotation({ reducer: (current, update) => [...(current || []), ...(update || [])], default: () => [] }),
});

function trace(node, detail, extra = {}) {
  return { node, detail, ...extra, at: new Date().toISOString() };
}

function mergeArrayFields(...arrays) {
  return mergeUnique([], arrays.flat().filter(Boolean));
}

function compactToolResults(state) {
  return [
    state.storageSignalProfile,
    state.handoff,
    state.dataDomains,
    state.storagePlatforms,
    state.cacheSearch,
    state.backupRetention,
    state.migrationRebuild,
    state.storageKnowledge,
  ].filter(Boolean);
}

function toolInput(state) {
  return {
    query: state.query,
    context: state.context,
    state: state.architectureState,
    signals: state.signals,
  };
}

async function prepareStorageContext(state) {
  const signals = getRetailSignals({ query: state.query, context: state.context, state: state.architectureState });
  const storageSignalProfile = classifyStorageSignals({
    query: state.query,
    context: state.context,
    state: state.architectureState,
    signals,
  });
  return {
    signals,
    storageSignalProfile,
    trace: [trace('prepare_storage_context', `Detected ${signals.workloadTypes.length || 0} workload signal(s) and ${storageSignalProfile.domains.length} storage domain signal(s).`)],
  };
}

async function inspectStorageHandoff(state) {
  const handoff = await storageTools.inspectStorageHandoffTool.invoke(toolInput(state));
  return {
    handoff,
    trace: [trace('inspect_storage_handoff', `Technology=${handoff.upstream?.technology ? 'yes' : 'no'}, Security=${handoff.upstream?.security ? 'yes' : 'no'}, Compliance=${handoff.upstream?.compliance ? 'yes' : 'no'}, Governance=${handoff.upstream?.governance ? 'yes' : 'no'}, Infrastructure=${handoff.upstream?.infrastructure ? 'yes' : 'no'}.`)],
  };
}

async function mapDataDomains(state) {
  const dataDomains = await storageTools.mapDataDomainsTool.invoke(toolInput(state));
  return {
    dataDomains,
    trace: [trace('map_data_domains', `Mapped ${dataDomains.data_domain_matrix?.length || 0} storage data domain(s).`)],
  };
}

async function selectStoragePlatforms(state) {
  const storagePlatforms = await storageTools.selectStoragePlatformsTool.invoke(toolInput(state));
  return {
    storagePlatforms,
    trace: [trace('select_storage_platforms', `Selected ${storagePlatforms.storage_platforms?.length || 0} provisional storage platform layer(s).`)],
  };
}

async function planCacheSearch(state) {
  const cacheSearch = await storageTools.planCacheSearchStrategyTool.invoke(toolInput(state));
  return {
    cacheSearch,
    trace: [trace('plan_cache_search_strategy', 'Planned cache/search/read-model strategy.')],
  };
}

async function planBackupRetention(state) {
  const backupRetention = await storageTools.planBackupRecoveryRetentionTool.invoke(toolInput(state));
  return {
    backupRetention,
    trace: [trace('plan_backup_recovery_retention', 'Planned backup/recovery/retention/deletion controls.')],
  };
}

async function planMigrationRebuild(state) {
  const migrationRebuild = await storageTools.planMigrationRebuildTool.invoke(toolInput(state));
  return {
    migrationRebuild,
    trace: [trace('plan_migration_rebuild', `Planned ${migrationRebuild.data_migration_rebuild?.length || 0} migration/rebuild control(s).`)],
  };
}

async function planStorageRetrieval(state) {
  const plan = [
    'retail-systems-of-record-storage-template',
    'retail-oltp-storage-template',
    'retail-cache-search-read-model-template',
    'retail-object-document-storage-template',
    'retail-backup-retention-storage-template',
    'retail-storage-security-residency-template',
  ];
  if (state.signals.supplyChain) plan.push('retail-analytics-event-storage-template');
  if (state.signals.retailAi) plan.push('retail-analytics-event-storage-template');
  for (const hint of state.storageSignalProfile?.retrieval_hints || []) plan.push(hint);
  return {
    retrievalPlan: [...new Set(plan)],
    evidence: retailEvidence(state.retrievedContext),
    trace: [trace('plan_storage_retrieval', `Planned ${plan.length} storage retrieval request(s).`)],
  };
}

async function retrieveStorageKnowledge(state) {
  const storageKnowledge = await storageTools.retrieveStorageKnowledgeTool.invoke({
    ...toolInput(state),
    retrievalPlan: state.retrievalPlan,
    limit: 7,
  });
  return {
    storageKnowledge,
    trace: [trace('retrieve_storage_knowledge', `Retrieved ${storageKnowledge.docs?.length || 0} local storage knowledge document(s).`)],
  };
}

async function runDeterministicStorageReview(state) {
  const deterministicReview = await runStorageAgent({
    query: state.query,
    mode: state.mode,
    useModel: false,
    context: state.context,
    state: state.architectureState,
    retrievedContext: state.retrievedContext,
  });
  return {
    deterministicReview,
    trace: [trace('deterministic_storage_review', `Produced ${deterministicReview.findings?.length || 0} deterministic storage control(s).`)],
  };
}

function inferStorageOwner(item) {
  const text = String(item || '').toLowerCase();
  if (/order|payment|inventory|promotion|source of truth|write authority|system/.test(text)) return 'Data domain owner';
  if (/cache|search|index|rebuild|ttl|invalidation/.test(text)) return 'Storage/search platform owner';
  if (/backup|restore|retention|deletion|rto|rpo|legal hold/.test(text)) return 'Storage resilience/privacy owner';
  if (/security|encryption|kms|pci|privacy|residency|support access/.test(text)) return 'Security/compliance owner';
  if (/migration|cutover|rollback|backfill|cdc|reconciliation/.test(text)) return 'Storage migration owner';
  if (/cost|pricing|iops|throughput|finops/.test(text)) return 'FinOps owner';
  return 'Storage/data owner';
}

function buildStorageEvidencePack({ handoff = {}, dataDomains = {}, storagePlatforms = {}, cacheSearch = {}, backupRetention = {}, migrationRebuild = {}, knowledge = {}, signalProfile = {}, evidenceStatus = {}, validationGates = [], qualification = {} }) {
  return {
    evidence_pack: {
      policy_sources: knowledge.docs || [],
      policy_inventory: knowledge.policy_inventory || [],
      citations: knowledge.citations || [],
      evidence_status: evidenceStatus,
      storage_qualification: qualification,
      upstream_handoff_summary: handoff.upstream || {},
      data_domain_evidence_needed: (dataDomains.data_domain_matrix || []).map(item => ({
        domain: item.domain,
        owner: item.owner,
        write_authority: item.write_authority,
        consistency: item.consistency,
        status: item.evidence_status || 'assumption',
        evidence_needed: 'Domain owner, write authority, consistency model, read projections, reconciliation, audit trail, data class, retention, and restore evidence.',
      })),
      storage_platform_evidence_needed: (storagePlatforms.storage_platforms || []).map(item => ({
        layer: item.layer,
        recommendation: item.recommendation,
        status: item.evidence_status || 'assumption',
        evidence_needed: 'Product/service tier, region, quota, capacity, IOPS/throughput, encryption/key owner, backup/restore, support plan, and cost evidence.',
      })),
      cache_search_evidence_needed: [
        ...(cacheSearch.cache_search_strategy?.cache_controls || []),
        ...(cacheSearch.cache_search_strategy?.search_controls || []),
      ].map(control => ({
        control,
        status: 'assumption',
        evidence_needed: 'Owner-approved TTL/freshness/rebuild/fallback/monitoring evidence and stale-data acceptance.',
      })),
      backup_retention_evidence_needed: (backupRetention.backup_recovery_retention?.controls || []).map(control => ({
        control,
        status: 'assumption',
        evidence_needed: 'Retention schedule, restore test, RTO/RPO, residency, deletion exception, legal hold, encryption, and owner approval.',
      })),
      migration_rebuild_evidence_needed: (migrationRebuild.data_migration_rebuild || []).map(control => ({
        control,
        status: 'assumption',
        evidence_needed: 'Migration ADR, cutover/rollback, data quality, reconciliation report, rebuild runbook, and owner sign-off.',
      })),
      approval_workflow: [
        'Data domain owners validate systems of record, write authority, consistency, reconciliation, and audit evidence.',
        'Storage/platform owner validates OLTP/cache/search/object/analytics/vector stores, quotas, regions, support, and restore capability.',
        'Security/compliance owners validate data classes, encryption/key ownership, residency, support access, retention/deletion, and audit evidence.',
        'Infrastructure owner validates topology, private connectivity, HA/DR, observability, environment, and restore/runbook evidence.',
        'Technology owner validates Storage Agent output against API, AI, UI, and final architecture synthesis.',
        'FinOps owner validates storage growth, IOPS/throughput, cache/search size, backup retention, egress, non-prod parity, and support cost drivers.',
      ],
      client_questions: [
        'Which system is the source of truth for each data domain, and who owns write authority?',
        'What consistency, latency, RTO/RPO, retention, deletion, and recovery targets apply to each domain?',
        'Which stores are authoritative and which are derived projections: cache, search, analytics, events, vector DB, exports, and logs?',
        'What data classes, approved regions, encryption/key owners, support-access paths, and audit evidence apply to every copy?',
        'What storage cost drivers are expected: growth, read/write mix, IOPS, throughput, query volume, retention, replication, and non-prod parity?',
      ],
      review_limitations: [
        'Storage output is a specialist architecture draft, not database implementation approval, data governance sign-off, privacy approval, or production readiness approval.',
        'Final architecture diagram should remain blocked until storage evidence is reconciled with API, AI, UI, Security, Compliance, Infrastructure, Governance, and FinOps constraints.',
      ],
      validation_gates: validationGates,
      signal_profile: {
        domains: signalProfile.domains || [],
        confidence_summary: signalProfile.confidence_summary || {},
        error_modes: signalProfile.error_modes || {},
      },
    },
    validation_needed: [
      'Collect owner-approved Storage evidence pack before marking storage, data-domain, backup, retention, or source-of-truth status as verified.',
    ],
  };
}

function augmentStorageReview(state) {
  const base = state.deterministicReview || {};
  const handoff = state.handoff || {};
  const dataDomains = state.dataDomains || {};
  const storagePlatforms = state.storagePlatforms || {};
  const cacheSearch = state.cacheSearch || {};
  const backupRetention = state.backupRetention || {};
  const migrationRebuild = state.migrationRebuild || {};
  const knowledge = state.storageKnowledge || {};
  const signalProfile = state.storageSignalProfile || {};
  const findings = mergeArrayFields(base.findings, knowledge.controls, handoff.controls, dataDomains.controls, storagePlatforms.controls, cacheSearch.controls, backupRetention.controls, migrationRebuild.controls);
  const risks = mergeArrayFields(base.risks, knowledge.risks, storagePlatforms.risks);
  const validationNeeded = mergeArrayFields(base.validation_needed, knowledge.validation_needed, handoff.validation_needed, dataDomains.validation_needed, storagePlatforms.validation_needed, cacheSearch.validation_needed, backupRetention.validation_needed, migrationRebuild.validation_needed);
  const evidenceStatus = {
    storage: 'assumption',
    systems_of_record: 'assumption',
    oltp: 'assumption',
    cache_search: 'assumption',
    object_document: 'assumption',
    backup_retention: 'assumption',
    migration_rebuild: 'assumption',
    security_handoff: handoff.upstream?.security ? 'partial' : 'missing',
    compliance_handoff: handoff.upstream?.compliance ? 'partial' : 'missing',
    governance_handoff: handoff.upstream?.governance ? 'partial' : 'missing',
    infrastructure_handoff: handoff.upstream?.infrastructure ? 'partial' : 'missing',
    technology_handoff: handoff.upstream?.technology ? 'partial' : 'missing',
    finops_handoff: handoff.upstream?.finops ? 'partial' : 'not_yet_available_or_optional',
  };
  const validationGates = validationNeeded.map(item => ({
    gate: item,
    owner: inferStorageOwner(item),
    status: 'requires human validation',
  }));
  const qualification = {
    status: 'draft_requires_data_storage_owner_review',
    statement: 'This Storage output is a specialist architecture draft. It is not database implementation approval, data governance sign-off, privacy approval, production readiness approval, or accepted-risk record.',
    evidence_status: 'assumption_or_partial_until_data_storage_security_compliance_infrastructure_technology_and_finops_owners_validate_evidence',
    required_reviewers: ['Data domain owners', 'Storage/platform owner', 'Security owner', 'Compliance/privacy owner', 'Infrastructure owner', 'Technology owner', 'FinOps owner'],
  };
  const evidencePack = buildStorageEvidencePack({
    handoff,
    dataDomains,
    storagePlatforms,
    cacheSearch,
    backupRetention,
    migrationRebuild,
    knowledge,
    signalProfile,
    evidenceStatus,
    validationGates,
    qualification,
  });
  const fullValidationNeeded = mergeArrayFields(validationNeeded, evidencePack.validation_needed);
  const storageRecommendation = mergeArrayFields(
    'Keep storage recommendation draft-level until systems of record, data owners, storage platforms, cache/search, backup/restore, retention/deletion, migration/rebuild, security/residency, and cost drivers are validated.',
    findings.slice(0, 8)
  );
  const statePatch = {
    ...(base.statePatch || {}),
    storage_controls: findings,
    storage_recommendation: storageRecommendation,
    storage_handoff_summary: handoff.upstream || {},
    data_domain_matrix: dataDomains.data_domain_matrix || base.data_domain_matrix || [],
    system_of_record_matrix: dataDomains.data_domain_matrix || base.system_of_record_matrix || [],
    storage_platform: base.storage_platform || {},
    storage_platforms: storagePlatforms.storage_platforms || [],
    cache_search_strategy: cacheSearch.cache_search_strategy || base.cache_search_strategy || {},
    backup_recovery_retention: backupRetention.backup_recovery_retention || base.backup_recovery_retention || {},
    data_migration_rebuild: migrationRebuild.data_migration_rebuild || base.data_migration_rebuild || [],
    storage_evidence_status: evidenceStatus,
    storage_validation_gates: validationGates,
    storage_qualification: qualification,
    storage_policy_citations: knowledge.citations || [],
    storage_evidence_pack: evidencePack.evidence_pack,
    storage_signal_profile: {
      domains: signalProfile.domains || [],
      confidence_summary: signalProfile.confidence_summary || {},
      error_modes: signalProfile.error_modes || {},
    },
    risks,
    evidence_status: {
      ...(base.statePatch?.evidence_status || {}),
      storage: 'assumption_or_partial',
    },
    cost_drivers: mergeArrayFields(base.statePatch?.cost_drivers, [
      'Storage cost drivers: data growth, read/write mix, IOPS/throughput, cache memory, search index size/query volume, object storage lifecycle, backup retention, replication, egress, non-prod parity, and support plan.',
    ]),
    human_validation_needed: mergeArrayFields(base.statePatch?.human_validation_needed, fullValidationNeeded),
    validation_gaps: mergeArrayFields(base.statePatch?.validation_gaps, fullValidationNeeded.map(item => `Storage validation required: ${item}`)),
    retrieval_requests: mergeArrayFields(base.statePatch?.retrieval_requests, state.retrievalPlan),
    storage_tool_context: {
      handoff,
      data_domains: dataDomains,
      storage_platforms: storagePlatforms,
      cache_search: cacheSearch,
      backup_retention: backupRetention,
      migration_rebuild: migrationRebuild,
      storage_knowledge: knowledge,
      storage_signal_profile: signalProfile,
      evidence_pack: evidencePack,
    },
  };
  return {
    augmentedReview: {
      ...base,
      status: 'completed_with_tools',
      summary: 'Storage Agent completed tool-assisted review using upstream constraints, data-domain mapping, storage platform selection, cache/search/read-model controls, backup/retention, migration/rebuild, and local storage knowledge.',
      findings,
      storage_recommendation: statePatch.storage_recommendation,
      storage_handoff_summary: statePatch.storage_handoff_summary,
      data_domain_matrix: statePatch.data_domain_matrix,
      system_of_record_matrix: statePatch.system_of_record_matrix,
      storage_platform: statePatch.storage_platform,
      storage_platforms: statePatch.storage_platforms,
      cache_search_strategy: statePatch.cache_search_strategy,
      backup_recovery_retention: statePatch.backup_recovery_retention,
      data_migration_rebuild: statePatch.data_migration_rebuild,
      storage_evidence_status: evidenceStatus,
      storage_validation_gates: validationGates,
      storage_qualification: qualification,
      storage_policy_citations: knowledge.citations || [],
      storage_evidence_pack: evidencePack.evidence_pack,
      storage_signal_profile: statePatch.storage_signal_profile,
      risks,
      validation_needed: fullValidationNeeded,
      retrieval_requests: state.retrievalPlan,
      storage_tool_results: statePatch.storage_tool_context,
      statePatch,
    },
    trace: [trace('augment_storage_review', `Augmented Storage review with ${compactToolResults(state).length} tool result(s).`)],
  };
}

function shouldRunModel(state) {
  return state.useModel ? 'model_judgement' : 'validate_storage_output';
}

async function runStorageModelJudgement(state) {
  const modelReview = await runStorageAgent({
    query: state.query,
    mode: state.mode,
    useModel: true,
    context: state.context,
    state: {
      ...state.architectureState,
      storage_tool_context: state.augmentedReview?.storage_tool_results,
      storage_signal_profile: state.augmentedReview?.storage_signal_profile,
      storage_qualification: state.augmentedReview?.storage_qualification,
      storage_policy_citations: state.augmentedReview?.storage_policy_citations,
      storage_evidence_pack: state.augmentedReview?.storage_evidence_pack,
    },
    retrievedContext: state.retrievedContext,
  });
  const usedModel = Boolean(modelReview?.model_review?.enabled);
  return {
    modelReview: usedModel ? enrichCandidateWithTools(modelReview, state) : null,
    trace: [trace('storage_model_judgement', usedModel ? modelReview.model_review?.error ? 'Model judgement failed; tool-assisted output retained.' : `Model judgement completed with ${modelReview.model_review?.model || 'configured model'}.` : 'Model judgement skipped because no model provider was available.')],
  };
}

function enrichCandidateWithTools(candidate, state) {
  const toolReview = state.augmentedReview || {};
  return {
    ...candidate,
    findings: mergeArrayFields(candidate.findings, toolReview.findings),
    storage_recommendation: mergeArrayFields(candidate.storage_recommendation, toolReview.storage_recommendation),
    storage_handoff_summary: toolReview.storage_handoff_summary || candidate.storage_handoff_summary,
    data_domain_matrix: mergeArrayFields(candidate.data_domain_matrix, toolReview.data_domain_matrix),
    system_of_record_matrix: mergeArrayFields(candidate.system_of_record_matrix, toolReview.system_of_record_matrix),
    storage_platform: toolReview.storage_platform || candidate.storage_platform,
    storage_platforms: mergeArrayFields(candidate.storage_platforms, toolReview.storage_platforms),
    cache_search_strategy: toolReview.cache_search_strategy || candidate.cache_search_strategy,
    backup_recovery_retention: toolReview.backup_recovery_retention || candidate.backup_recovery_retention,
    data_migration_rebuild: mergeArrayFields(candidate.data_migration_rebuild, toolReview.data_migration_rebuild),
    storage_evidence_status: toolReview.storage_evidence_status || candidate.storage_evidence_status,
    storage_validation_gates: mergeArrayFields(candidate.storage_validation_gates, toolReview.storage_validation_gates),
    storage_qualification: toolReview.storage_qualification || candidate.storage_qualification,
    storage_policy_citations: mergeArrayFields(candidate.storage_policy_citations, toolReview.storage_policy_citations),
    storage_evidence_pack: toolReview.storage_evidence_pack || candidate.storage_evidence_pack,
    storage_signal_profile: toolReview.storage_signal_profile || candidate.storage_signal_profile,
    risks: mergeArrayFields(candidate.risks, toolReview.risks),
    validation_needed: mergeArrayFields(candidate.validation_needed, toolReview.validation_needed),
    retrieval_requests: mergeArrayFields(candidate.retrieval_requests, state.retrievalPlan),
    storage_tool_results: toolReview.storage_tool_results,
    statePatch: {
      ...(candidate.statePatch || {}),
      ...toolReview.statePatch,
      storage_controls: mergeArrayFields(candidate.statePatch?.storage_controls, toolReview.findings),
      risks: mergeArrayFields(candidate.statePatch?.risks, toolReview.risks),
      human_validation_needed: mergeArrayFields(candidate.statePatch?.human_validation_needed, toolReview.validation_needed),
      validation_gaps: mergeArrayFields(candidate.statePatch?.validation_gaps, toolReview.statePatch?.validation_gaps),
      retrieval_requests: mergeArrayFields(candidate.statePatch?.retrieval_requests, state.retrievalPlan),
      storage_tool_context: toolReview.storage_tool_results,
    },
  };
}

async function validateStorageOutput(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const validation = await storageTools.validateStorageOutputTool.invoke({
    ...toolInput(state),
    output: candidate,
    toolResults: compactToolResults(state),
  });
  return {
    validation,
    trace: [trace('validate_storage_output', `Storage validation returned ${validation.verdict}.`, { blockers: validation.blockers?.length || 0, warnings: validation.warnings?.length || 0 })],
  };
}

function shouldRecommendStorageReview(state) {
  return state.validation?.verdict === 'pass' ? 'finalize_storage_output' : 'recommend_storage_review_actions';
}

async function recommendStorageReviewActions(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const notes = [
    ...(state.validation?.blockers || []).map(item => `Storage blocker: ${item}`),
    ...(state.validation?.warnings || []).map(item => `Storage warning: ${item}`),
  ];
  return {
    remediation: {
      ...candidate,
      status: candidate?.status === 'completed_with_model' ? 'completed_with_model_and_storage_review_recommendations' : 'completed_with_storage_review_recommendations',
      validation_needed: mergeArrayFields(candidate?.validation_needed, notes),
      statePatch: {
        ...(candidate?.statePatch || {}),
        human_validation_needed: mergeArrayFields(candidate?.statePatch?.human_validation_needed, notes),
        validation_gaps: mergeArrayFields(candidate?.statePatch?.validation_gaps, notes),
      },
      storage_review_recommendation: {
        reason: state.validation?.verdict,
        blockers: state.validation?.blockers || [],
        warnings: state.validation?.warnings || [],
        action: 'Output remains a Storage review draft until data, storage, security, compliance, infrastructure, technology, and FinOps owners validate evidence.',
      },
    },
    trace: [trace('recommend_storage_review_actions', `Added ${notes.length} Storage review recommendation note(s).`)],
  };
}

async function finalizeStorageOutput(state) {
  const selected = state.remediation || state.modelReview || state.augmentedReview || state.deterministicReview;
  const usedModel = Boolean(selected?.model_review?.enabled && !selected?.model_review?.error);
  return {
    output: {
      ...selected,
      status: selected?.model_review?.error ? 'completed_with_fallback' : selected?.storage_review_recommendation ? selected.status : usedModel ? 'completed_with_model' : selected?.status || 'completed_with_tools',
      graph_agent: {
        framework: 'langgraph',
        graph: 'storage_agent_graph',
        agent_type: 'tool_using_storage_agent',
        nodes: state.trace.map(item => item.node),
        tools: [
          'inspectStorageHandoffTool',
          'mapDataDomainsTool',
          'selectStoragePlatformsTool',
          'planCacheSearchStrategyTool',
          'planBackupRecoveryRetentionTool',
          'planMigrationRebuildTool',
          'retrieveStorageKnowledgeTool',
          'validateStorageOutputTool',
        ],
        retrieval_plan: state.retrievalPlan,
        retrieved_docs: state.storageKnowledge?.docs || [],
        validation: state.validation,
        trace: state.trace,
        upstream: state.handoff?.upstream || {},
        model_route: { requested: Boolean(state.useModel), used: usedModel, provider: selected?.model_review?.provider || (usedModel ? 'openai' : 'none'), model: selected?.model_review?.model || 'none' },
      },
      evidence: {
        ...selected?.evidence,
        graph_retrieval: state.evidence,
        local_storage_knowledge: state.storageKnowledge?.docs || [],
        storage_policy_citations: selected?.storage_policy_citations || [],
        storage_evidence_pack: selected?.storage_evidence_pack || {},
        storage_signal_profile: selected?.storage_signal_profile || {},
        storage_tool_results: selected?.storage_tool_results,
      },
    },
    trace: [trace('finalize_storage_output', 'Finalized tool-using LangGraph Storage Agent output.')],
  };
}

const storageAgentGraph = new StateGraph(StorageGraphState)
  .addNode('prepare_storage_context', prepareStorageContext)
  .addNode('inspect_storage_handoff', inspectStorageHandoff)
  .addNode('map_data_domains', mapDataDomains)
  .addNode('select_storage_platforms', selectStoragePlatforms)
  .addNode('plan_cache_search_strategy', planCacheSearch)
  .addNode('plan_backup_recovery_retention', planBackupRetention)
  .addNode('plan_migration_rebuild', planMigrationRebuild)
  .addNode('plan_storage_retrieval', planStorageRetrieval)
  .addNode('retrieve_storage_knowledge', retrieveStorageKnowledge)
  .addNode('deterministic_storage_review', runDeterministicStorageReview)
  .addNode('augment_storage_review', augmentStorageReview)
  .addNode('model_judgement', runStorageModelJudgement)
  .addNode('validate_storage_output', validateStorageOutput)
  .addNode('recommend_storage_review_actions', recommendStorageReviewActions)
  .addNode('finalize_storage_output', finalizeStorageOutput)
  .addEdge(START, 'prepare_storage_context')
  .addEdge('prepare_storage_context', 'inspect_storage_handoff')
  .addEdge('inspect_storage_handoff', 'map_data_domains')
  .addEdge('map_data_domains', 'select_storage_platforms')
  .addEdge('select_storage_platforms', 'plan_cache_search_strategy')
  .addEdge('plan_cache_search_strategy', 'plan_backup_recovery_retention')
  .addEdge('plan_backup_recovery_retention', 'plan_migration_rebuild')
  .addEdge('plan_migration_rebuild', 'plan_storage_retrieval')
  .addEdge('plan_storage_retrieval', 'retrieve_storage_knowledge')
  .addEdge('retrieve_storage_knowledge', 'deterministic_storage_review')
  .addEdge('deterministic_storage_review', 'augment_storage_review')
  .addConditionalEdges('augment_storage_review', shouldRunModel, { model_judgement: 'model_judgement', validate_storage_output: 'validate_storage_output' })
  .addEdge('model_judgement', 'validate_storage_output')
  .addConditionalEdges('validate_storage_output', shouldRecommendStorageReview, { recommend_storage_review_actions: 'recommend_storage_review_actions', finalize_storage_output: 'finalize_storage_output' })
  .addEdge('recommend_storage_review_actions', 'finalize_storage_output')
  .addEdge('finalize_storage_output', END)
  .compile();

async function runStorageAgentGraph({ query, mode, useModel, context, state, retrievedContext }) {
  const result = await storageAgentGraph.invoke({ query, mode, useModel, context, architectureState: state, retrievedContext });
  return result.output;
}

module.exports = {
  runStorageAgentGraph,
  storageAgentGraph,
};
