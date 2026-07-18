const { Annotation, END, START, StateGraph } = require('@langchain/langgraph');
const { runApiAgent } = require('./apiAgent');
const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeUnique } = require('../schema');
const { apiTools } = require('./apiTools');
const { classifyApiSignals } = require('./apiSignalClassifier');

const ApiGraphState = Annotation.Root({
  query: Annotation({ reducer: (_current, update) => update, default: () => '' }),
  mode: Annotation({ reducer: (_current, update) => update, default: () => 'architecture-review' }),
  useModel: Annotation({ reducer: (_current, update) => update, default: () => true }),
  context: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  architectureState: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  retrievedContext: Annotation({ reducer: (_current, update) => update, default: () => [] }),
  signals: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  apiSignalProfile: Annotation({ reducer: (_current, update) => update, default: () => null }),
  handoff: Annotation({ reducer: (_current, update) => update, default: () => null }),
  gateway: Annotation({ reducer: (_current, update) => update, default: () => null }),
  contracts: Annotation({ reducer: (_current, update) => update, default: () => null }),
  orchestration: Annotation({ reducer: (_current, update) => update, default: () => null }),
  integrations: Annotation({ reducer: (_current, update) => update, default: () => null }),
  replay: Annotation({ reducer: (_current, update) => update, default: () => null }),
  securityObservability: Annotation({ reducer: (_current, update) => update, default: () => null }),
  apiKnowledge: Annotation({ reducer: (_current, update) => update, default: () => null }),
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
    state.apiSignalProfile,
    state.handoff,
    state.gateway,
    state.contracts,
    state.orchestration,
    state.integrations,
    state.replay,
    state.securityObservability,
    state.apiKnowledge,
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

async function prepareApiContext(state) {
  const signals = getRetailSignals({ query: state.query, context: state.context, state: state.architectureState });
  const apiSignalProfile = classifyApiSignals({
    query: state.query,
    context: state.context,
    state: state.architectureState,
    signals,
  });
  return {
    signals,
    apiSignalProfile,
    trace: [trace('prepare_api_context', `Detected ${signals.workloadTypes.length || 0} workload signal(s) and ${apiSignalProfile.domains.length} API domain signal(s).`)],
  };
}

async function inspectApiHandoff(state) {
  const handoff = await apiTools.inspectApiHandoffTool.invoke(toolInput(state));
  return {
    handoff,
    trace: [trace('inspect_api_handoff', `Storage=${handoff.upstream?.storage ? 'yes' : 'no'}, Technology=${handoff.upstream?.technology ? 'yes' : 'no'}, Security=${handoff.upstream?.security ? 'yes' : 'no'}, Compliance=${handoff.upstream?.compliance ? 'yes' : 'no'}, Infrastructure=${handoff.upstream?.infrastructure ? 'yes' : 'no'}.`)],
  };
}

async function designApiGateway(state) {
  const gateway = await apiTools.designApiGatewayTool.invoke(toolInput(state));
  return {
    gateway,
    trace: [trace('design_api_gateway', 'Designed API gateway and route-class strategy.')],
  };
}

async function defineServiceContracts(state) {
  const contracts = await apiTools.defineServiceContractsTool.invoke(toolInput(state));
  return {
    contracts,
    trace: [trace('define_service_contracts', `Defined ${contracts.api_contract_matrix?.length || 0} API contract row(s).`)],
  };
}

async function planOrchestration(state) {
  const orchestration = await apiTools.planOrchestrationTool.invoke(toolInput(state));
  return {
    orchestration,
    trace: [trace('plan_orchestration', 'Planned sync/async orchestration boundaries.')],
  };
}

async function planThirdPartyIntegrations(state) {
  const integrations = await apiTools.planThirdPartyIntegrationsTool.invoke(toolInput(state));
  return {
    integrations,
    trace: [trace('plan_third_party_integrations', `Planned ${integrations.third_party_integrations?.length || 0} partner integration row(s).`)],
  };
}

async function planIdempotencyReplay(state) {
  const replay = await apiTools.planIdempotencyReplayTool.invoke(toolInput(state));
  return {
    replay,
    trace: [trace('plan_idempotency_replay', `Planned ${replay.idempotency_replay_controls?.length || 0} idempotency/replay control(s).`)],
  };
}

async function planApiSecurityObservability(state) {
  const securityObservability = await apiTools.planApiSecurityObservabilityTool.invoke(toolInput(state));
  return {
    securityObservability,
    trace: [trace('plan_api_security_observability', `Planned ${securityObservability.api_security_observability?.length || 0} security/observability control(s).`)],
  };
}

async function planApiRetrieval(state) {
  const plan = [
    'retail-api-gateway-edge-template',
    'retail-service-contract-template',
    'retail-orchestration-integration-template',
    'retail-idempotency-replay-template',
    'retail-api-security-observability-template',
  ];
  if (state.signals.supplyChain || state.signals.payments) plan.push('retail-third-party-integration-template');
  for (const hint of state.apiSignalProfile?.retrieval_hints || []) plan.push(hint);
  return {
    retrievalPlan: [...new Set(plan)],
    evidence: retailEvidence(state.retrievedContext),
    trace: [trace('plan_api_retrieval', `Planned ${plan.length} API retrieval request(s).`)],
  };
}

async function retrieveApiKnowledge(state) {
  const apiKnowledge = await apiTools.retrieveApiKnowledgeTool.invoke({
    ...toolInput(state),
    retrievalPlan: state.retrievalPlan,
    limit: 7,
  });
  return {
    apiKnowledge,
    trace: [trace('retrieve_api_knowledge', `Retrieved ${apiKnowledge.docs?.length || 0} local API knowledge document(s).`)],
  };
}

async function runDeterministicApiReview(state) {
  const deterministicReview = await runApiAgent({
    query: state.query,
    mode: state.mode,
    useModel: false,
    context: state.context,
    state: state.architectureState,
    retrievedContext: state.retrievedContext,
  });
  return {
    deterministicReview,
    trace: [trace('deterministic_api_review', `Produced ${deterministicReview.findings?.length || 0} deterministic API control(s).`)],
  };
}

function inferApiOwner(item) {
  const text = String(item || '').toLowerCase();
  if (/gateway|route|rate|waf|origin|ingress/.test(text)) return 'API platform owner';
  if (/contract|openapi|asyncapi|schema|version|consumer/.test(text)) return 'API/domain owner';
  if (/sync|async|queue|event|workflow|timeout|compensation/.test(text)) return 'Integration/orchestration owner';
  if (/partner|third|erp|wms|oms|psp|carrier|supplier|edi/.test(text)) return 'Partner integration owner';
  if (/idempotency|retry|dlq|replay|reconciliation|outbox|inbox/.test(text)) return 'API reliability owner';
  if (/oauth|jwt|mtls|audit|trace|logs|slo|runbook|security/.test(text)) return 'Security/SRE owner';
  if (/storage|source of truth|write authority/.test(text)) return 'Storage/data owner';
  if (/cost|pricing|finops/.test(text)) return 'FinOps owner';
  return 'API owner';
}

function buildApiEvidencePack({ handoff = {}, gateway = {}, contracts = {}, orchestration = {}, integrations = {}, replay = {}, securityObservability = {}, knowledge = {}, signalProfile = {}, evidenceStatus = {}, validationGates = [], qualification = {} }) {
  return {
    evidence_pack: {
      policy_sources: knowledge.docs || [],
      policy_inventory: knowledge.policy_inventory || [],
      citations: knowledge.citations || [],
      evidence_status: evidenceStatus,
      api_qualification: qualification,
      upstream_handoff_summary: handoff.upstream || {},
      gateway_evidence_needed: [{
        recommendation: gateway.api_gateway_strategy?.recommendation,
        critical_path_isolation: gateway.api_gateway_strategy?.critical_path_isolation || [],
        status: gateway.api_gateway_strategy?.evidence_status || 'assumption',
        evidence_needed: 'Gateway product, route map, auth policy, rate limits, WAF/bot handoff, origin isolation, fallback, owner, and SLO evidence.',
      }],
      contract_evidence_needed: (contracts.api_contract_matrix || []).map(item => ({
        api: item.api,
        owner: item.owner,
        contract: item.contract,
        storage_dependency: item.storage_dependency,
        status: item.evidence_status || 'assumption',
        evidence_needed: 'OpenAPI/AsyncAPI/schema, versioning, compatibility, auth scopes, error model, idempotency, SLA, consumer tests, and owner approval.',
      })),
      orchestration_evidence_needed: [
        ...(orchestration.integration_orchestration?.sync_paths || []).map(path => ({ path, type: 'sync', evidence_needed: 'Timeout budget, SLO, dependency map, fallback, and owner approval.', status: 'assumption' })),
        ...(orchestration.integration_orchestration?.async_paths || []).map(path => ({ path, type: 'async', evidence_needed: 'Queue/event/workflow, retry, DLQ, replay, compensation, and owner approval.', status: 'assumption' })),
      ],
      integration_evidence_needed: (integrations.third_party_integrations || []).map(item => ({
        partner: item.partner,
        contract_needed: item.contract_needed,
        status: item.evidence_status || 'assumption',
      })),
      replay_evidence_needed: (replay.idempotency_replay_controls || []).map(control => ({
        control,
        evidence_needed: 'Key scope, retry window, DLQ owner, replay runbook, reconciliation report, audit trail, and customer-impact handling.',
        status: 'assumption',
      })),
      security_observability_evidence_needed: (securityObservability.api_security_observability || []).map(control => ({
        control,
        evidence_needed: 'Auth/scope policy, validation rule, trace/log field, SLO/dashboard, runbook, owner, and retention/residency evidence.',
        status: 'assumption',
      })),
      approval_workflow: [
        'API platform owner validates gateway, route classes, rate limits, auth, WAF/bot handoff, origin isolation, and route ownership.',
        'Domain API owners validate contracts, storage dependencies, versioning, compatibility, SLAs, and consumer tests.',
        'Integration owner validates sync/async boundaries, queues/events/workflows, partner contracts, retries, DLQs, replay, reconciliation, and exception workflow.',
        'Security/compliance owners validate auth, scopes, payload/log/trace data classes, residency, audit fields, and support access.',
        'Infrastructure/SRE owner validates topology, SLOs, observability, runbooks, on-call, failover, and incident workflow.',
        'FinOps owner validates API request volume, gateway charges, event/queue throughput, partner calls, observability volume, and support/licensing costs.',
      ],
      client_questions: [
        'Which API routes are customer-critical, partner-facing, admin/support, AI/tool, or batch/integration paths?',
        'Which APIs need synchronous consistency, and which can be asynchronous/replayable?',
        'Which source-of-truth store owns every write API and event?',
        'What idempotency, retry, DLQ, replay, reconciliation, and manual exception behavior is required?',
        'What API request volume, event throughput, partner call volume, log/trace volume, and gateway/rate-limit assumptions drive cost?',
      ],
      review_limitations: [
        'API output is a specialist architecture draft, not API implementation approval, contract sign-off, partner SLA approval, or production readiness approval.',
        'Final architecture diagram should remain blocked until API evidence is reconciled with Storage, Security, Compliance, Infrastructure, Technology, Governance, and FinOps constraints.',
      ],
      validation_gates: validationGates,
      signal_profile: {
        domains: signalProfile.domains || [],
        confidence_summary: signalProfile.confidence_summary || {},
        error_modes: signalProfile.error_modes || {},
      },
    },
    validation_needed: [
      'Collect owner-approved API evidence pack before marking gateway, contracts, integrations, idempotency/replay, or API observability status as verified.',
    ],
  };
}

function augmentApiReview(state) {
  const base = state.deterministicReview || {};
  const handoff = state.handoff || {};
  const gateway = state.gateway || {};
  const contracts = state.contracts || {};
  const orchestration = state.orchestration || {};
  const integrations = state.integrations || {};
  const replay = state.replay || {};
  const securityObservability = state.securityObservability || {};
  const knowledge = state.apiKnowledge || {};
  const signalProfile = state.apiSignalProfile || {};
  const findings = mergeArrayFields(base.findings, knowledge.controls, handoff.controls, gateway.controls, contracts.controls, orchestration.controls, integrations.controls, replay.controls, securityObservability.controls);
  const risks = mergeArrayFields(base.risks, knowledge.risks, gateway.risks, integrations.risks);
  const validationNeeded = mergeArrayFields(base.validation_needed, knowledge.validation_needed, handoff.validation_needed, gateway.validation_needed, contracts.validation_needed, orchestration.validation_needed, integrations.validation_needed, replay.validation_needed, securityObservability.validation_needed);
  const evidenceStatus = {
    api: 'assumption',
    gateway: 'assumption',
    contracts: 'assumption',
    orchestration: 'assumption',
    integrations: 'assumption',
    idempotency_replay: 'assumption',
    security_observability: 'assumption',
    storage_handoff: handoff.upstream?.storage ? 'partial' : 'missing',
    technology_handoff: handoff.upstream?.technology ? 'partial' : 'missing',
    security_handoff: handoff.upstream?.security ? 'partial' : 'missing',
    compliance_handoff: handoff.upstream?.compliance ? 'partial' : 'missing',
    governance_handoff: handoff.upstream?.governance ? 'partial' : 'missing',
    infrastructure_handoff: handoff.upstream?.infrastructure ? 'partial' : 'missing',
    finops_handoff: handoff.upstream?.finops ? 'partial' : 'not_yet_available_or_optional',
  };
  const validationGates = validationNeeded.map(item => ({
    gate: item,
    owner: inferApiOwner(item),
    status: 'requires human validation',
  }));
  const qualification = {
    status: 'draft_requires_api_integration_owner_review',
    statement: 'This API output is a specialist architecture draft. It is not API implementation approval, contract sign-off, partner SLA approval, production readiness approval, or accepted-risk record.',
    evidence_status: 'assumption_or_partial_until_api_storage_security_compliance_infrastructure_technology_and_finops_owners_validate_evidence',
    required_reviewers: ['API platform owner', 'Domain API owners', 'Integration owner', 'Storage/data owner', 'Security owner', 'Compliance/privacy owner', 'Infrastructure/SRE owner', 'Technology owner', 'FinOps owner'],
  };
  const evidencePack = buildApiEvidencePack({
    handoff,
    gateway,
    contracts,
    orchestration,
    integrations,
    replay,
    securityObservability,
    knowledge,
    signalProfile,
    evidenceStatus,
    validationGates,
    qualification,
  });
  const fullValidationNeeded = mergeArrayFields(validationNeeded, evidencePack.validation_needed);
  const apiRecommendation = mergeArrayFields(
    'Keep API recommendation draft-level until gateway, service contracts, sync/async boundaries, integrations, idempotency/replay, reconciliation, security/observability, and Storage source-of-truth evidence are validated.',
    findings.slice(0, 8)
  );
  const statePatch = {
    ...(base.statePatch || {}),
    api_controls: findings,
    api_recommendation: apiRecommendation,
    api_handoff_summary: handoff.upstream || {},
    api_contract_matrix: contracts.api_contract_matrix || base.api_contract_matrix || [],
    api_gateway_strategy: gateway.api_gateway_strategy || base.api_gateway_strategy || {},
    integration_orchestration: orchestration.integration_orchestration || base.integration_orchestration || {},
    third_party_integrations: integrations.third_party_integrations || [],
    idempotency_replay_controls: replay.idempotency_replay_controls || base.idempotency_replay_controls || [],
    api_security_observability: securityObservability.api_security_observability || base.api_security_observability || [],
    api_evidence_status: evidenceStatus,
    api_validation_gates: validationGates,
    api_qualification: qualification,
    api_policy_citations: knowledge.citations || [],
    api_evidence_pack: evidencePack.evidence_pack,
    api_signal_profile: {
      domains: signalProfile.domains || [],
      confidence_summary: signalProfile.confidence_summary || {},
      error_modes: signalProfile.error_modes || {},
    },
    risks,
    evidence_status: {
      ...(base.statePatch?.evidence_status || {}),
      api: 'assumption_or_partial',
    },
    cost_drivers: mergeArrayFields(base.statePatch?.cost_drivers, [
      'API cost drivers: gateway requests, route classes, WAF/bot traffic, event/queue throughput, partner calls, retries/replay volume, observability logs/traces, support/licensing, non-prod parity, and integration testing.',
    ]),
    human_validation_needed: mergeArrayFields(base.statePatch?.human_validation_needed, fullValidationNeeded),
    validation_gaps: mergeArrayFields(base.statePatch?.validation_gaps, fullValidationNeeded.map(item => `API validation required: ${item}`)),
    retrieval_requests: mergeArrayFields(base.statePatch?.retrieval_requests, state.retrievalPlan),
    api_tool_context: {
      handoff,
      gateway,
      contracts,
      orchestration,
      integrations,
      replay,
      security_observability: securityObservability,
      api_knowledge: knowledge,
      api_signal_profile: signalProfile,
      evidence_pack: evidencePack,
    },
  };
  return {
    augmentedReview: {
      ...base,
      status: 'completed_with_tools',
      summary: 'API Agent completed tool-assisted review using upstream constraints, gateway strategy, service contracts, orchestration, integrations, idempotency/replay, security/observability, and local API knowledge.',
      findings,
      api_recommendation: statePatch.api_recommendation,
      api_handoff_summary: statePatch.api_handoff_summary,
      api_contract_matrix: statePatch.api_contract_matrix,
      api_gateway_strategy: statePatch.api_gateway_strategy,
      integration_orchestration: statePatch.integration_orchestration,
      third_party_integrations: statePatch.third_party_integrations,
      idempotency_replay_controls: statePatch.idempotency_replay_controls,
      api_security_observability: statePatch.api_security_observability,
      api_evidence_status: evidenceStatus,
      api_validation_gates: validationGates,
      api_qualification: qualification,
      api_policy_citations: knowledge.citations || [],
      api_evidence_pack: evidencePack.evidence_pack,
      api_signal_profile: statePatch.api_signal_profile,
      risks,
      validation_needed: fullValidationNeeded,
      retrieval_requests: state.retrievalPlan,
      api_tool_results: statePatch.api_tool_context,
      statePatch,
    },
    trace: [trace('augment_api_review', `Augmented API review with ${compactToolResults(state).length} tool result(s).`)],
  };
}

function shouldRunModel(state) {
  return state.useModel ? 'model_judgement' : 'validate_api_output';
}

async function runApiModelJudgement(state) {
  const modelReview = await runApiAgent({
    query: state.query,
    mode: state.mode,
    useModel: true,
    context: state.context,
    state: {
      ...state.architectureState,
      api_tool_context: state.augmentedReview?.api_tool_results,
      api_signal_profile: state.augmentedReview?.api_signal_profile,
      api_qualification: state.augmentedReview?.api_qualification,
      api_policy_citations: state.augmentedReview?.api_policy_citations,
      api_evidence_pack: state.augmentedReview?.api_evidence_pack,
    },
    retrievedContext: state.retrievedContext,
  });
  const usedModel = Boolean(modelReview?.model_review?.enabled);
  return {
    modelReview: usedModel ? enrichCandidateWithTools(modelReview, state) : null,
    trace: [trace('api_model_judgement', usedModel ? modelReview.model_review?.error ? 'Model judgement failed; tool-assisted output retained.' : `Model judgement completed with ${modelReview.model_review?.model || 'configured model'}.` : 'Model judgement skipped because no model provider was available.')],
  };
}

function enrichCandidateWithTools(candidate, state) {
  const toolReview = state.augmentedReview || {};
  return {
    ...candidate,
    findings: mergeArrayFields(candidate.findings, toolReview.findings),
    api_recommendation: mergeArrayFields(candidate.api_recommendation, toolReview.api_recommendation),
    api_handoff_summary: toolReview.api_handoff_summary || candidate.api_handoff_summary,
    api_contract_matrix: mergeArrayFields(candidate.api_contract_matrix, toolReview.api_contract_matrix),
    api_gateway_strategy: toolReview.api_gateway_strategy || candidate.api_gateway_strategy,
    integration_orchestration: toolReview.integration_orchestration || candidate.integration_orchestration,
    third_party_integrations: mergeArrayFields(candidate.third_party_integrations, toolReview.third_party_integrations),
    idempotency_replay_controls: mergeArrayFields(candidate.idempotency_replay_controls, toolReview.idempotency_replay_controls),
    api_security_observability: mergeArrayFields(candidate.api_security_observability, toolReview.api_security_observability),
    api_evidence_status: toolReview.api_evidence_status || candidate.api_evidence_status,
    api_validation_gates: mergeArrayFields(candidate.api_validation_gates, toolReview.api_validation_gates),
    api_qualification: toolReview.api_qualification || candidate.api_qualification,
    api_policy_citations: mergeArrayFields(candidate.api_policy_citations, toolReview.api_policy_citations),
    api_evidence_pack: toolReview.api_evidence_pack || candidate.api_evidence_pack,
    api_signal_profile: toolReview.api_signal_profile || candidate.api_signal_profile,
    risks: mergeArrayFields(candidate.risks, toolReview.risks),
    validation_needed: mergeArrayFields(candidate.validation_needed, toolReview.validation_needed),
    retrieval_requests: mergeArrayFields(candidate.retrieval_requests, state.retrievalPlan),
    api_tool_results: toolReview.api_tool_results,
    statePatch: {
      ...(candidate.statePatch || {}),
      ...toolReview.statePatch,
      api_controls: mergeArrayFields(candidate.statePatch?.api_controls, toolReview.findings),
      risks: mergeArrayFields(candidate.statePatch?.risks, toolReview.risks),
      human_validation_needed: mergeArrayFields(candidate.statePatch?.human_validation_needed, toolReview.validation_needed),
      validation_gaps: mergeArrayFields(candidate.statePatch?.validation_gaps, toolReview.statePatch?.validation_gaps),
      retrieval_requests: mergeArrayFields(candidate.statePatch?.retrieval_requests, state.retrievalPlan),
      api_tool_context: toolReview.api_tool_results,
    },
  };
}

async function validateApiOutput(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const validation = await apiTools.validateApiOutputTool.invoke({
    ...toolInput(state),
    output: candidate,
    toolResults: compactToolResults(state),
  });
  return {
    validation,
    trace: [trace('validate_api_output', `API validation returned ${validation.verdict}.`, { blockers: validation.blockers?.length || 0, warnings: validation.warnings?.length || 0 })],
  };
}

function shouldRecommendApiReview(state) {
  return state.validation?.verdict === 'pass' ? 'finalize_api_output' : 'recommend_api_review_actions';
}

async function recommendApiReviewActions(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const notes = [
    ...(state.validation?.blockers || []).map(item => `API blocker: ${item}`),
    ...(state.validation?.warnings || []).map(item => `API warning: ${item}`),
  ];
  return {
    remediation: {
      ...candidate,
      status: candidate?.status === 'completed_with_model' ? 'completed_with_model_and_api_review_recommendations' : 'completed_with_api_review_recommendations',
      validation_needed: mergeArrayFields(candidate?.validation_needed, notes),
      statePatch: {
        ...(candidate?.statePatch || {}),
        human_validation_needed: mergeArrayFields(candidate?.statePatch?.human_validation_needed, notes),
        validation_gaps: mergeArrayFields(candidate?.statePatch?.validation_gaps, notes),
      },
      api_review_recommendation: {
        reason: state.validation?.verdict,
        blockers: state.validation?.blockers || [],
        warnings: state.validation?.warnings || [],
        action: 'Output remains an API review draft until API, integration, storage, security, compliance, infrastructure, technology, and FinOps owners validate evidence.',
      },
    },
    trace: [trace('recommend_api_review_actions', `Added ${notes.length} API review recommendation note(s).`)],
  };
}

async function finalizeApiOutput(state) {
  const selected = state.remediation || state.modelReview || state.augmentedReview || state.deterministicReview;
  const usedModel = Boolean(selected?.model_review?.enabled && !selected?.model_review?.error);
  return {
    output: {
      ...selected,
      status: selected?.model_review?.error ? 'completed_with_fallback' : selected?.api_review_recommendation ? selected.status : usedModel ? 'completed_with_model' : selected?.status || 'completed_with_tools',
      graph_agent: {
        framework: 'langgraph',
        graph: 'api_agent_graph',
        agent_type: 'tool_using_api_agent',
        nodes: state.trace.map(item => item.node),
        tools: [
          'inspectApiHandoffTool',
          'designApiGatewayTool',
          'defineServiceContractsTool',
          'planOrchestrationTool',
          'planThirdPartyIntegrationsTool',
          'planIdempotencyReplayTool',
          'planApiSecurityObservabilityTool',
          'retrieveApiKnowledgeTool',
          'validateApiOutputTool',
        ],
        retrieval_plan: state.retrievalPlan,
        retrieved_docs: state.apiKnowledge?.docs || [],
        validation: state.validation,
        trace: state.trace,
        upstream: state.handoff?.upstream || {},
        model_route: { requested: Boolean(state.useModel), used: usedModel, provider: selected?.model_review?.provider || (usedModel ? 'openai' : 'none'), model: selected?.model_review?.model || 'none' },
      },
      evidence: {
        ...selected?.evidence,
        graph_retrieval: state.evidence,
        local_api_knowledge: state.apiKnowledge?.docs || [],
        api_policy_citations: selected?.api_policy_citations || [],
        api_evidence_pack: selected?.api_evidence_pack || {},
        api_signal_profile: selected?.api_signal_profile || {},
        api_tool_results: selected?.api_tool_results,
      },
    },
    trace: [trace('finalize_api_output', 'Finalized tool-using LangGraph API Agent output.')],
  };
}

const apiAgentGraph = new StateGraph(ApiGraphState)
  .addNode('prepare_api_context', prepareApiContext)
  .addNode('inspect_api_handoff', inspectApiHandoff)
  .addNode('design_api_gateway', designApiGateway)
  .addNode('define_service_contracts', defineServiceContracts)
  .addNode('plan_orchestration', planOrchestration)
  .addNode('plan_third_party_integrations', planThirdPartyIntegrations)
  .addNode('plan_idempotency_replay', planIdempotencyReplay)
  .addNode('plan_api_security_observability', planApiSecurityObservability)
  .addNode('plan_api_retrieval', planApiRetrieval)
  .addNode('retrieve_api_knowledge', retrieveApiKnowledge)
  .addNode('deterministic_api_review', runDeterministicApiReview)
  .addNode('augment_api_review', augmentApiReview)
  .addNode('model_judgement', runApiModelJudgement)
  .addNode('validate_api_output', validateApiOutput)
  .addNode('recommend_api_review_actions', recommendApiReviewActions)
  .addNode('finalize_api_output', finalizeApiOutput)
  .addEdge(START, 'prepare_api_context')
  .addEdge('prepare_api_context', 'inspect_api_handoff')
  .addEdge('inspect_api_handoff', 'design_api_gateway')
  .addEdge('design_api_gateway', 'define_service_contracts')
  .addEdge('define_service_contracts', 'plan_orchestration')
  .addEdge('plan_orchestration', 'plan_third_party_integrations')
  .addEdge('plan_third_party_integrations', 'plan_idempotency_replay')
  .addEdge('plan_idempotency_replay', 'plan_api_security_observability')
  .addEdge('plan_api_security_observability', 'plan_api_retrieval')
  .addEdge('plan_api_retrieval', 'retrieve_api_knowledge')
  .addEdge('retrieve_api_knowledge', 'deterministic_api_review')
  .addEdge('deterministic_api_review', 'augment_api_review')
  .addConditionalEdges('augment_api_review', shouldRunModel, { model_judgement: 'model_judgement', validate_api_output: 'validate_api_output' })
  .addEdge('model_judgement', 'validate_api_output')
  .addConditionalEdges('validate_api_output', shouldRecommendApiReview, { recommend_api_review_actions: 'recommend_api_review_actions', finalize_api_output: 'finalize_api_output' })
  .addEdge('recommend_api_review_actions', 'finalize_api_output')
  .addEdge('finalize_api_output', END)
  .compile();

async function runApiAgentGraph({ query, mode, useModel, context, state, retrievedContext }) {
  const result = await apiAgentGraph.invoke({ query, mode, useModel, context, architectureState: state, retrievedContext });
  return result.output;
}

module.exports = {
  apiAgentGraph,
  runApiAgentGraph,
};
