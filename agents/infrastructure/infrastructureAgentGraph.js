const { Annotation, END, START, StateGraph } = require('@langchain/langgraph');
const { runInfrastructureAgent } = require('./infrastructureAgent');
const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeUnique } = require('../schema');
const { infrastructureTools } = require('./infrastructureTools');
const { classifyInfrastructureSignals } = require('./infrastructureSignalClassifier');

const InfrastructureGraphState = Annotation.Root({
  query: Annotation({ reducer: (_current, update) => update, default: () => '' }),
  mode: Annotation({ reducer: (_current, update) => update, default: () => 'architecture-review' }),
  useModel: Annotation({ reducer: (_current, update) => update, default: () => true }),
  context: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  architectureState: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  retrievedContext: Annotation({ reducer: (_current, update) => update, default: () => [] }),
  signals: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  infrastructureSignalProfile: Annotation({ reducer: (_current, update) => update, default: () => null }),
  handoff: Annotation({ reducer: (_current, update) => update, default: () => null }),
  runtime: Annotation({ reducer: (_current, update) => update, default: () => null }),
  network: Annotation({ reducer: (_current, update) => update, default: () => null }),
  resilience: Annotation({ reducer: (_current, update) => update, default: () => null }),
  operations: Annotation({ reducer: (_current, update) => update, default: () => null }),
  environmentRelease: Annotation({ reducer: (_current, update) => update, default: () => null }),
  infrastructureKnowledge: Annotation({ reducer: (_current, update) => update, default: () => null }),
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
    state.infrastructureSignalProfile,
    state.handoff,
    state.runtime,
    state.network,
    state.resilience,
    state.operations,
    state.environmentRelease,
    state.infrastructureKnowledge,
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

async function prepareInfrastructureContext(state) {
  const signals = getRetailSignals({ query: state.query, context: state.context, state: state.architectureState });
  const infrastructureSignalProfile = classifyInfrastructureSignals({
    query: state.query,
    context: state.context,
    state: state.architectureState,
    signals,
  });
  return {
    signals,
    infrastructureSignalProfile,
    trace: [trace('prepare_infrastructure_context', `Detected ${signals.workloadTypes.length || 0} workload signal(s) and ${infrastructureSignalProfile.domains.length} infrastructure domain signal(s).`)],
  };
}

async function inspectInfrastructureHandoff(state) {
  const handoff = await infrastructureTools.inspectInfrastructureHandoffTool.invoke(toolInput(state));
  return {
    handoff,
    trace: [trace('inspect_infrastructure_handoff', `Security=${handoff.upstream?.security ? 'yes' : 'no'}, Compliance=${handoff.upstream?.compliance ? 'yes' : 'no'}, Governance=${handoff.upstream?.governance ? 'yes' : 'no'}.`)],
  };
}

async function selectRuntimePlatform(state) {
  const runtime = await infrastructureTools.selectRuntimePlatformTool.invoke(toolInput(state));
  return {
    runtime,
    trace: [trace('select_runtime_platform', `Built runtime recommendation with ${runtime.platform_components?.length || 0} component(s).`)],
  };
}

async function designNetworkTopology(state) {
  const network = await infrastructureTools.designNetworkTopologyTool.invoke(toolInput(state));
  return {
    network,
    trace: [trace('design_network_topology', `Built ${network.network_zones?.length || 0} network zone(s).`)],
  };
}

async function planResilience(state) {
  const resilience = await infrastructureTools.planResilienceTool.invoke(toolInput(state));
  return {
    resilience,
    trace: [trace('plan_resilience', `Planned ${resilience.resilience_model?.critical_paths?.length || 0} critical resilience path(s).`)],
  };
}

async function planObservabilityOperations(state) {
  const operations = await infrastructureTools.planObservabilityOperationsTool.invoke(toolInput(state));
  return {
    operations,
    trace: [trace('plan_observability_operations', `Planned ${operations.observability_model?.length || 0} observability/operations control(s).`)],
  };
}

async function planEnvironmentRelease(state) {
  const environmentRelease = await infrastructureTools.planEnvironmentReleaseTool.invoke(toolInput(state));
  return {
    environmentRelease,
    trace: [trace('plan_environment_release', `Planned ${environmentRelease.environment_strategy?.length || 0} environment/release row(s).`)],
  };
}

async function planInfrastructureRetrieval(state) {
  const plan = [
    'retail-runtime-platform-template',
    'retail-network-edge-connectivity-template',
    'retail-ha-dr-resilience-template',
    'retail-observability-operations-template',
    'retail-environment-release-template',
    'retail-infrastructure-security-compliance-handoff-template',
  ];
  if (state.signals.storeEdge) plan.push('retail-store-edge-infrastructure-template');
  if (state.signals.commerce) plan.push('retail-scalability-performance-template');
  if (state.signals.multiRegion) plan.push('retail-ha-dr-resilience-template');
  for (const hint of state.infrastructureSignalProfile?.retrieval_hints || []) plan.push(hint);
  return {
    retrievalPlan: [...new Set(plan)],
    evidence: retailEvidence(state.retrievedContext),
    trace: [trace('plan_infrastructure_retrieval', `Planned ${plan.length} infrastructure retrieval request(s).`)],
  };
}

async function retrieveInfrastructureKnowledge(state) {
  const infrastructureKnowledge = await infrastructureTools.retrieveInfrastructureKnowledgeTool.invoke({
    ...toolInput(state),
    retrievalPlan: state.retrievalPlan,
    limit: 7,
  });
  return {
    infrastructureKnowledge,
    trace: [trace('retrieve_infrastructure_knowledge', `Retrieved ${infrastructureKnowledge.docs?.length || 0} local infrastructure knowledge document(s).`)],
  };
}

async function runDeterministicInfrastructureReview(state) {
  const deterministicReview = await runInfrastructureAgent({
    query: state.query,
    mode: state.mode,
    useModel: false,
    context: state.context,
    state: state.architectureState,
    retrievedContext: state.retrievedContext,
  });
  return {
    deterministicReview,
    trace: [trace('deterministic_infrastructure_review', `Produced ${deterministicReview.findings?.length || 0} deterministic infrastructure control(s).`)],
  };
}

function inferInfrastructureOwner(item) {
  const text = String(item || '').toLowerCase();
  if (/security|pci|kms|secret|mTLS|siem|waf|admin/.test(text)) return 'Security platform owner';
  if (/compliance|residency|processor|privacy|backup|retention|support access/.test(text)) return 'Compliance/privacy owner + platform owner';
  if (/network|cdn|waf|vpc|vnet|subnet|connectivity|egress|dns|certificate/.test(text)) return 'Network/platform owner';
  if (/rto|rpo|dr|failover|backup|restore|game/.test(text)) return 'Platform resilience owner';
  if (/observability|logs|traces|slo|runbook|on-call|incident/.test(text)) return 'Operations/SRE owner';
  if (/environment|ci\/cd|iac|release|rollback|non-prod/.test(text)) return 'Platform delivery owner';
  if (/store|pos|edge|offline|device|field/.test(text)) return 'Store operations + platform owner';
  return 'Infrastructure/platform owner';
}

function buildInfrastructureEvidencePack({ handoff = {}, runtime = {}, network = {}, resilience = {}, operations = {}, environmentRelease = {}, knowledge = {}, signalProfile = {}, evidenceStatus = {}, validationGates = [], qualification = {} }) {
  return {
    evidence_pack: {
      policy_sources: knowledge.docs || [],
      policy_inventory: knowledge.policy_inventory || [],
      citations: knowledge.citations || [],
      evidence_status: evidenceStatus,
      infrastructure_qualification: qualification,
      upstream_handoff_summary: handoff.upstream || {},
      runtime_evidence_needed: (runtime.platform_components || []).map(item => ({
        layer: item.layer,
        recommendation: item.recommendation,
        status: item.evidence_status || 'assumption',
        evidence_needed: 'Runtime ADR, team capability, workload isolation, autoscaling limits, release strategy, support owner, and non-prod parity.',
      })),
      network_evidence_needed: (network.network_zones || []).map(item => ({
        zone: item.zone,
        purpose: item.purpose,
        status: item.evidence_status || 'assumption',
        evidence_needed: 'Network diagram, ingress/origin split, private endpoint plan, firewall/egress policy, DNS/certificate owner, and third-party/store connectivity evidence.',
      })),
      resilience_evidence_needed: (resilience.resilience_model?.critical_paths || []).map(path => ({
        critical_path: path,
        evidence_needed: 'RTO/RPO, failover/restore test, dependency degradation behavior, owner, runbook, and game-day evidence.',
        status: 'assumption',
      })),
      operations_evidence_needed: (operations.observability_model || []).map(item => ({
        control: item.control,
        evidence_needed: 'SLO/SLI, dashboard, alert, log/trace retention, redaction, owner, runbook, and incident workflow evidence.',
        status: item.evidence_status || 'assumption',
      })),
      environment_release_evidence_needed: (environmentRelease.environment_strategy || []).map(item => ({
        environment: item.environment,
        purpose: item.purpose,
        evidence_needed: 'Environment owner, parity statement, CI/CD/IaC path, secrets handling, release gate, rollback evidence, and change control.',
        status: item.evidence_status || 'assumption',
      })),
      approval_workflow: [
        'Platform owner validates runtime, network, environment, release, HA/DR, observability, support model, and operating ownership.',
        'Security owner validates private connectivity, admin access, PCI segmentation, secrets, keys, WAF/bot, audit logging, and SIEM export.',
        'Compliance/privacy owner validates regions, backup/log/trace residency, processor/support access, retention, and evidence handling.',
        'Governance/architecture owner validates ADRs, rejected alternatives, rollout gates, runbooks, game days, and decision evidence.',
        'FinOps owner validates topology cost drivers, non-prod parity, support plan, DR, observability retention, and capacity headroom.',
      ],
      client_questions: [
        'Which cloud/on-prem regions, runtime platforms, network patterns, and connectivity options are approved?',
        'What are RTO/RPO, peak multiplier, availability target, latency target, and disaster-recovery expectations for each retail path?',
        'Which environments must exist, how close must non-prod be to production, and who owns CI/CD/IaC/release rollback?',
        'What observability, log/trace retention, SIEM export, runbook, on-call, support, and incident process is required?',
        'Which Security, Compliance, Governance, and FinOps gates are mandatory before go-live?',
      ],
      review_limitations: [
        'Infrastructure output is an architecture infrastructure draft, not platform approval, implementation sign-off, production readiness approval, or accepted-risk record.',
        'Recommendations become client-ready only after named platform, security, compliance, governance, operations, and FinOps owners validate evidence.',
      ],
      validation_gates: validationGates,
      signal_profile: {
        domains: signalProfile.domains || [],
        confidence_summary: signalProfile.confidence_summary || {},
        error_modes: signalProfile.error_modes || {},
      },
    },
    validation_needed: [
      'Collect owner-approved Infrastructure evidence pack before marking topology, runtime, network, resilience, observability, environment, or release status as verified.',
    ],
  };
}

function augmentInfrastructureReview(state) {
  const base = state.deterministicReview || {};
  const handoff = state.handoff || {};
  const runtime = state.runtime || {};
  const network = state.network || {};
  const resilience = state.resilience || {};
  const operations = state.operations || {};
  const environmentRelease = state.environmentRelease || {};
  const knowledge = state.infrastructureKnowledge || {};
  const signalProfile = state.infrastructureSignalProfile || {};
  const findings = mergeArrayFields(base.findings, knowledge.controls, handoff.controls, runtime.controls, network.controls, resilience.controls, operations.controls, environmentRelease.controls);
  const risks = mergeArrayFields(base.risks, knowledge.risks, runtime.risks, network.risks, resilience.risks, operations.risks, environmentRelease.risks);
  const validationNeeded = mergeArrayFields(base.validation_needed, knowledge.validation_needed, handoff.validation_needed, runtime.validation_needed, network.validation_needed, resilience.validation_needed, operations.validation_needed, environmentRelease.validation_needed);
  const evidenceStatus = {
    infrastructure: 'assumption',
    runtime: 'assumption',
    network: 'assumption',
    resilience: 'assumption',
    observability: 'assumption',
    environment_release: 'assumption',
    security_handoff: handoff.upstream?.security ? 'partial' : 'missing',
    compliance_handoff: handoff.upstream?.compliance ? 'partial' : 'missing',
    governance_handoff: handoff.upstream?.governance ? 'partial' : 'missing',
  };
  const validationGates = validationNeeded.map(item => ({
    gate: item,
    owner: inferInfrastructureOwner(item),
    status: 'requires human validation',
  }));
  const qualification = {
    status: 'draft_requires_platform_owner_review',
    statement: 'This Infrastructure output is an architecture infrastructure draft. It is not platform approval, implementation sign-off, production readiness approval, or an accepted-risk record.',
    evidence_status: 'assumption_or_partial_until_platform_security_compliance_operations_governance_and_finops_owners_validate_evidence',
    required_reviewers: ['Platform/infrastructure owner', 'Security owner', 'Compliance/privacy owner', 'Operations/SRE owner', 'Governance/architecture owner', 'FinOps owner'],
  };
  const evidencePack = buildInfrastructureEvidencePack({
    handoff,
    runtime,
    network,
    resilience,
    operations,
    environmentRelease,
    knowledge,
    signalProfile,
    evidenceStatus,
    validationGates,
    qualification,
  });
  const fullValidationNeeded = mergeArrayFields(validationNeeded, evidencePack.validation_needed);
  const infrastructureRecommendation = mergeArrayFields(
    'Keep infrastructure recommendation draft-level until runtime, network, HA/DR, observability, environment/release, upstream handoffs, NFRs, and named platform-owner approvals are validated.',
    findings.slice(0, 8)
  );
  const statePatch = {
    ...(base.statePatch || {}),
    infrastructure_controls: findings,
    infrastructure_recommendation: infrastructureRecommendation,
    infrastructure_handoff_summary: handoff.upstream || {},
    runtime_platform: runtime.runtime_recommendation ? { recommendation: runtime.runtime_recommendation, components: runtime.platform_components || [], evidence_status: 'assumption' } : base.runtime_platform,
    network_topology: network.network_zones || base.network_topology || [],
    resilience_plan: resilience.resilience_model || base.resilience_plan || {},
    observability_operations: operations.observability_model || base.observability_operations || [],
    environment_release_strategy: environmentRelease.environment_strategy || base.environment_release_strategy || [],
    infrastructure_evidence_status: evidenceStatus,
    infrastructure_validation_gates: validationGates,
    infrastructure_qualification: qualification,
    infrastructure_policy_citations: knowledge.citations || [],
    infrastructure_evidence_pack: evidencePack.evidence_pack,
    infrastructure_signal_profile: {
      domains: signalProfile.domains || [],
      confidence_summary: signalProfile.confidence_summary || {},
      error_modes: signalProfile.error_modes || {},
    },
    risks,
    evidence_status: {
      ...(base.statePatch?.evidence_status || {}),
      infrastructure: 'assumption_or_partial',
    },
    nfr_coverage: mergeArrayFields(base.statePatch?.nfr_coverage, [
      { nfr: 'Availability', target: 'Path-specific HA/DR, RTO/RPO, failover, restore, and game-day evidence.', mechanism: 'Resilience plan and runbooks.', validation_needed: 'Confirm RTO/RPO and game-day evidence.' },
      { nfr: 'Performance', target: 'Peak retail traffic, autoscaling, dependency limits, and degraded mode.', mechanism: 'Runtime isolation, load tests, and SLO dashboards.', validation_needed: 'Confirm peak multiplier and load-test targets.' },
      { nfr: 'Operability', target: 'Observable, supportable platform with on-call, runbooks, release rollback, and incident workflow.', mechanism: 'Observability and environment/release strategy.', validation_needed: 'Confirm support model and owner approvals.' },
    ]),
    human_validation_needed: mergeArrayFields(base.statePatch?.human_validation_needed, fullValidationNeeded),
    validation_gaps: mergeArrayFields(base.statePatch?.validation_gaps, fullValidationNeeded.map(item => `Infrastructure validation required: ${item}`)),
    retrieval_requests: mergeArrayFields(base.statePatch?.retrieval_requests, state.retrievalPlan),
    infrastructure_tool_context: {
      handoff,
      runtime,
      network,
      resilience,
      operations,
      environment_release: environmentRelease,
      infrastructure_knowledge: knowledge,
      infrastructure_signal_profile: signalProfile,
      evidence_pack: evidencePack,
    },
  };
  return {
    augmentedReview: {
      ...base,
      status: 'completed_with_tools',
      summary: 'Infrastructure Agent completed tool-assisted review using upstream Security, Compliance, and Governance constraints, runtime selection, network topology, HA/DR, observability, environment/release strategy, and local infrastructure knowledge.',
      findings,
      infrastructure_recommendation: statePatch.infrastructure_recommendation,
      infrastructure_handoff_summary: statePatch.infrastructure_handoff_summary,
      runtime_platform: statePatch.runtime_platform,
      network_topology: statePatch.network_topology,
      resilience_plan: statePatch.resilience_plan,
      observability_operations: statePatch.observability_operations,
      environment_release_strategy: statePatch.environment_release_strategy,
      infrastructure_evidence_status: evidenceStatus,
      infrastructure_validation_gates: validationGates,
      infrastructure_qualification: qualification,
      infrastructure_policy_citations: knowledge.citations || [],
      infrastructure_evidence_pack: evidencePack.evidence_pack,
      infrastructure_signal_profile: statePatch.infrastructure_signal_profile,
      risks,
      validation_needed: fullValidationNeeded,
      retrieval_requests: state.retrievalPlan,
      infrastructure_tool_results: statePatch.infrastructure_tool_context,
      statePatch,
    },
    trace: [trace('augment_infrastructure_review', `Augmented Infrastructure review with ${compactToolResults(state).length} tool result(s).`)],
  };
}

function shouldRunModel(state) {
  return state.useModel ? 'model_judgement' : 'validate_infrastructure_output';
}

async function runInfrastructureModelJudgement(state) {
  const modelReview = await runInfrastructureAgent({
    query: state.query,
    mode: state.mode,
    useModel: true,
    context: state.context,
    state: {
      ...state.architectureState,
      infrastructure_tool_context: state.augmentedReview?.infrastructure_tool_results,
      infrastructure_signal_profile: state.augmentedReview?.infrastructure_signal_profile,
      infrastructure_qualification: state.augmentedReview?.infrastructure_qualification,
      infrastructure_policy_citations: state.augmentedReview?.infrastructure_policy_citations,
      infrastructure_evidence_pack: state.augmentedReview?.infrastructure_evidence_pack,
    },
    retrievedContext: state.retrievedContext,
  });
  const usedModel = Boolean(modelReview?.model_review?.enabled);
  return {
    modelReview: usedModel ? enrichCandidateWithTools(modelReview, state) : null,
    trace: [trace('infrastructure_model_judgement', usedModel ? modelReview.model_review?.error ? 'Model judgement failed; tool-assisted output retained.' : `Model judgement completed with ${modelReview.model_review?.model || 'configured model'}.` : 'Model judgement skipped because no model provider was available.')],
  };
}

function enrichCandidateWithTools(candidate, state) {
  const toolReview = state.augmentedReview || {};
  return {
    ...candidate,
    findings: mergeArrayFields(candidate.findings, toolReview.findings),
    infrastructure_recommendation: mergeArrayFields(candidate.infrastructure_recommendation, toolReview.infrastructure_recommendation),
    infrastructure_handoff_summary: toolReview.infrastructure_handoff_summary || candidate.infrastructure_handoff_summary,
    runtime_platform: toolReview.runtime_platform || candidate.runtime_platform,
    network_topology: mergeArrayFields(candidate.network_topology, toolReview.network_topology),
    resilience_plan: toolReview.resilience_plan || candidate.resilience_plan,
    observability_operations: mergeArrayFields(candidate.observability_operations, toolReview.observability_operations),
    environment_release_strategy: mergeArrayFields(candidate.environment_release_strategy, toolReview.environment_release_strategy),
    infrastructure_evidence_status: toolReview.infrastructure_evidence_status || candidate.infrastructure_evidence_status,
    infrastructure_validation_gates: mergeArrayFields(candidate.infrastructure_validation_gates, toolReview.infrastructure_validation_gates),
    infrastructure_qualification: toolReview.infrastructure_qualification || candidate.infrastructure_qualification,
    infrastructure_policy_citations: mergeArrayFields(candidate.infrastructure_policy_citations, toolReview.infrastructure_policy_citations),
    infrastructure_evidence_pack: toolReview.infrastructure_evidence_pack || candidate.infrastructure_evidence_pack,
    infrastructure_signal_profile: toolReview.infrastructure_signal_profile || candidate.infrastructure_signal_profile,
    risks: mergeArrayFields(candidate.risks, toolReview.risks),
    validation_needed: mergeArrayFields(candidate.validation_needed, toolReview.validation_needed),
    retrieval_requests: mergeArrayFields(candidate.retrieval_requests, state.retrievalPlan),
    infrastructure_tool_results: toolReview.infrastructure_tool_results,
    statePatch: {
      ...(candidate.statePatch || {}),
      infrastructure_controls: mergeArrayFields(candidate.statePatch?.infrastructure_controls, toolReview.findings),
      infrastructure_recommendation: mergeArrayFields(candidate.statePatch?.infrastructure_recommendation, toolReview.infrastructure_recommendation),
      infrastructure_handoff_summary: toolReview.infrastructure_handoff_summary || candidate.statePatch?.infrastructure_handoff_summary,
      runtime_platform: toolReview.runtime_platform || candidate.statePatch?.runtime_platform,
      network_topology: mergeArrayFields(candidate.statePatch?.network_topology, toolReview.network_topology),
      resilience_plan: toolReview.resilience_plan || candidate.statePatch?.resilience_plan,
      observability_operations: mergeArrayFields(candidate.statePatch?.observability_operations, toolReview.observability_operations),
      environment_release_strategy: mergeArrayFields(candidate.statePatch?.environment_release_strategy, toolReview.environment_release_strategy),
      infrastructure_evidence_status: toolReview.infrastructure_evidence_status || candidate.statePatch?.infrastructure_evidence_status,
      infrastructure_validation_gates: mergeArrayFields(candidate.statePatch?.infrastructure_validation_gates, toolReview.infrastructure_validation_gates),
      infrastructure_qualification: toolReview.infrastructure_qualification || candidate.statePatch?.infrastructure_qualification,
      infrastructure_policy_citations: mergeArrayFields(candidate.statePatch?.infrastructure_policy_citations, toolReview.infrastructure_policy_citations),
      infrastructure_evidence_pack: toolReview.infrastructure_evidence_pack || candidate.statePatch?.infrastructure_evidence_pack,
      infrastructure_signal_profile: toolReview.infrastructure_signal_profile || candidate.statePatch?.infrastructure_signal_profile,
      risks: mergeArrayFields(candidate.statePatch?.risks, toolReview.risks),
      human_validation_needed: mergeArrayFields(candidate.statePatch?.human_validation_needed, toolReview.validation_needed),
      validation_gaps: mergeArrayFields(candidate.statePatch?.validation_gaps, toolReview.statePatch?.validation_gaps),
      retrieval_requests: mergeArrayFields(candidate.statePatch?.retrieval_requests, state.retrievalPlan),
      infrastructure_tool_context: toolReview.infrastructure_tool_results,
    },
  };
}

async function validateInfrastructureOutput(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const validation = await infrastructureTools.validateInfrastructureOutputTool.invoke({
    ...toolInput(state),
    output: candidate,
    toolResults: compactToolResults(state),
  });
  return {
    validation,
    trace: [trace('validate_infrastructure_output', `Infrastructure validation returned ${validation.verdict}.`, { blockers: validation.blockers?.length || 0, warnings: validation.warnings?.length || 0 })],
  };
}

function shouldRecommendInfrastructureReview(state) {
  return state.validation?.verdict === 'pass' ? 'finalize_infrastructure_output' : 'recommend_infrastructure_review_actions';
}

async function recommendInfrastructureReviewActions(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const notes = [
    ...(state.validation?.blockers || []).map(item => `Infrastructure blocker: ${item}`),
    ...(state.validation?.warnings || []).map(item => `Infrastructure warning: ${item}`),
  ];
  return {
    remediation: {
      ...candidate,
      status: candidate?.status === 'completed_with_model' ? 'completed_with_model_and_infrastructure_review_recommendations' : 'completed_with_infrastructure_review_recommendations',
      validation_needed: mergeArrayFields(candidate?.validation_needed, notes),
      statePatch: {
        ...(candidate?.statePatch || {}),
        human_validation_needed: mergeArrayFields(candidate?.statePatch?.human_validation_needed, notes),
        validation_gaps: mergeArrayFields(candidate?.statePatch?.validation_gaps, notes),
      },
      infrastructure_review_recommendation: {
        reason: state.validation?.verdict,
        blockers: state.validation?.blockers || [],
        warnings: state.validation?.warnings || [],
        action: 'Output remains an Infrastructure review draft until platform, security, compliance, operations, governance, and FinOps owners validate topology evidence and NFRs.',
      },
    },
    trace: [trace('recommend_infrastructure_review_actions', `Added ${notes.length} Infrastructure review recommendation note(s).`)],
  };
}

async function finalizeInfrastructureOutput(state) {
  const selected = state.remediation || state.modelReview || state.augmentedReview || state.deterministicReview;
  const usedModel = Boolean(selected?.model_review?.enabled && !selected?.model_review?.error);
  return {
    output: {
      ...selected,
      status: selected?.model_review?.error ? 'completed_with_fallback' : selected?.infrastructure_review_recommendation ? selected.status : usedModel ? 'completed_with_model' : selected?.status || 'completed_with_tools',
      graph_agent: {
        framework: 'langgraph',
        graph: 'infrastructure_agent_graph',
        agent_type: 'tool_using_infrastructure_agent',
        nodes: state.trace.map(item => item.node),
        tools: [
          'inspectInfrastructureHandoffTool',
          'selectRuntimePlatformTool',
          'designNetworkTopologyTool',
          'planResilienceTool',
          'planObservabilityOperationsTool',
          'planEnvironmentReleaseTool',
          'retrieveInfrastructureKnowledgeTool',
          'validateInfrastructureOutputTool',
        ],
        retrieval_plan: state.retrievalPlan,
        retrieved_docs: state.infrastructureKnowledge?.docs || [],
        validation: state.validation,
        trace: state.trace,
        upstream: state.handoff?.upstream || {},
        model_route: { requested: Boolean(state.useModel), used: usedModel, provider: selected?.model_review?.provider || (usedModel ? 'openai' : 'none'), model: selected?.model_review?.model || 'none' },
      },
      evidence: {
        ...selected?.evidence,
        graph_retrieval: state.evidence,
        local_infrastructure_knowledge: state.infrastructureKnowledge?.docs || [],
        infrastructure_policy_citations: selected?.infrastructure_policy_citations || [],
        infrastructure_evidence_pack: selected?.infrastructure_evidence_pack || {},
        infrastructure_signal_profile: selected?.infrastructure_signal_profile || {},
        infrastructure_tool_results: selected?.infrastructure_tool_results,
      },
    },
    trace: [trace('finalize_infrastructure_output', 'Finalized tool-using LangGraph Infrastructure Agent output.')],
  };
}

const infrastructureAgentGraph = new StateGraph(InfrastructureGraphState)
  .addNode('prepare_infrastructure_context', prepareInfrastructureContext)
  .addNode('inspect_infrastructure_handoff', inspectInfrastructureHandoff)
  .addNode('select_runtime_platform', selectRuntimePlatform)
  .addNode('design_network_topology', designNetworkTopology)
  .addNode('plan_resilience', planResilience)
  .addNode('plan_observability_operations', planObservabilityOperations)
  .addNode('plan_environment_release', planEnvironmentRelease)
  .addNode('plan_infrastructure_retrieval', planInfrastructureRetrieval)
  .addNode('retrieve_infrastructure_knowledge', retrieveInfrastructureKnowledge)
  .addNode('deterministic_infrastructure_review', runDeterministicInfrastructureReview)
  .addNode('augment_infrastructure_review', augmentInfrastructureReview)
  .addNode('model_judgement', runInfrastructureModelJudgement)
  .addNode('validate_infrastructure_output', validateInfrastructureOutput)
  .addNode('recommend_infrastructure_review_actions', recommendInfrastructureReviewActions)
  .addNode('finalize_infrastructure_output', finalizeInfrastructureOutput)
  .addEdge(START, 'prepare_infrastructure_context')
  .addEdge('prepare_infrastructure_context', 'inspect_infrastructure_handoff')
  .addEdge('inspect_infrastructure_handoff', 'select_runtime_platform')
  .addEdge('select_runtime_platform', 'design_network_topology')
  .addEdge('design_network_topology', 'plan_resilience')
  .addEdge('plan_resilience', 'plan_observability_operations')
  .addEdge('plan_observability_operations', 'plan_environment_release')
  .addEdge('plan_environment_release', 'plan_infrastructure_retrieval')
  .addEdge('plan_infrastructure_retrieval', 'retrieve_infrastructure_knowledge')
  .addEdge('retrieve_infrastructure_knowledge', 'deterministic_infrastructure_review')
  .addEdge('deterministic_infrastructure_review', 'augment_infrastructure_review')
  .addConditionalEdges('augment_infrastructure_review', shouldRunModel, { model_judgement: 'model_judgement', validate_infrastructure_output: 'validate_infrastructure_output' })
  .addEdge('model_judgement', 'validate_infrastructure_output')
  .addConditionalEdges('validate_infrastructure_output', shouldRecommendInfrastructureReview, { recommend_infrastructure_review_actions: 'recommend_infrastructure_review_actions', finalize_infrastructure_output: 'finalize_infrastructure_output' })
  .addEdge('recommend_infrastructure_review_actions', 'finalize_infrastructure_output')
  .addEdge('finalize_infrastructure_output', END)
  .compile();

async function runInfrastructureAgentGraph({ query, mode, useModel, context, state, retrievedContext }) {
  const result = await infrastructureAgentGraph.invoke({ query, mode, useModel, context, architectureState: state, retrievedContext });
  return result.output;
}

module.exports = {
  infrastructureAgentGraph,
  runInfrastructureAgentGraph,
};
