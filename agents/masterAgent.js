const { applyAgentOutput, normalizeAgentRequest } = require('./schema');
const { resolveAgents } = require('./registry');
const { getRetailSignals } = require('./retailContext');
const { runRetailReviewGate } = require('./retailReviewGate');
const { synthesizeArchitectureRecommendation } = require('./synthesis/architectureSynthesisAgent');

function summarizeConflicts(outputs, signals) {
  const conflicts = [];
  const hasComplianceRisk = outputs.some(output =>
    output.agentId === 'compliance' &&
    (output.validation_needed || []).some(item => /jurisdiction|residency|regulated/i.test(item))
  );
  const hasSecurityDataRisk = outputs.some(output =>
    output.agentId === 'security' &&
    (output.validation_needed || []).some(item => /data class|data classes|classification/i.test(item))
  );

  if (hasComplianceRisk && hasSecurityDataRisk) {
    conflicts.push({
      topic: 'Data classification and compliance scope',
      impact: 'Retail security and compliance recommendations cannot be treated as verified until data classes, jurisdictions, processors, and residency are confirmed.',
      resolution: 'Ask the retail client for customer/payment/loyalty/support data classes, regulated workflows, countries, residency requirements, processor list, and audit expectations.',
    });
  }

  if (signals.payments) {
    conflicts.push({
      topic: 'Payment and PCI evidence',
      impact: 'Payments are in scope, so PCI and payment-token recommendations remain assumption-based until the PSP/P2PE/token-vault boundary is validated.',
      resolution: 'Require PCI scope boundary, segmentation evidence, raw PAN/SAD exclusion or explicit scope, tokenisation/P2PE boundary, logging controls, and QSA/human validation.',
    });
  }

  if (signals.retailAi && signals.multiRegion) {
    conflicts.push({
      topic: 'Retail AI residency',
      impact: 'Retail AI prompts, completions, embeddings, traces, and vector stores can create new data residency and processor obligations.',
      resolution: 'Validate model/provider telemetry, prompt residency, embedding/vector-store region, eval trace retention, and support access before selecting final providers.',
    });
  }

  const hasFinOpsAssumption = outputs.some(output =>
    output.agentId === 'finops' &&
    (output.validation_needed || []).some(item => /pricing|budget|workload drivers|service-level/i.test(item))
  );

  if (hasFinOpsAssumption) {
    conflicts.push({
      topic: 'Budget feasibility and pricing evidence',
      impact: 'Cost and budget recommendations remain assumption-level until service-level pricing, workload drivers, support plans, licensing, partner costs, non-prod parity, and contingency are validated.',
      resolution: 'Ask the retail client for budget boundaries, usage drivers, provider contracts, support tier, deployment regions, HA/DR expectations, log retention, and AI token-volume assumptions.',
    });
  }

  return conflicts;
}

function buildRecommendation(state, outputs, conflicts, signals, reviewGate) {
  const isRetailScoped = signals.retail || signals.workloadTypes.length > 0;
  return {
    executive_summary: isRetailScoped
      ? 'Security, compliance, governance, infrastructure, technology, storage, API, AI, UI, and FinOps agents completed the first ArchitectIQ Retail review slice. The output is ready for human validation but should not be treated as client-approved until retail data classification, systems of record, PCI/privacy scope, residency evidence, decision owners, infrastructure topology, technology specialist handoffs, storage/data-truth evidence, API contract/replay evidence, AI model/RAG/tool/eval evidence, UI journey/performance/accessibility/release evidence, rollout gates, unit drivers, and pricing evidence are confirmed.'
      : 'ArchitectIQ Retail needs a retail or retail-adjacent context before producing a client-ready architecture. Reframe the request around stores, POS, e-commerce, inventory, loyalty/customer data, fulfilment, retail analytics, payments, or retail platform modernisation.',
    agents_used: outputs.map(output => output.agentId),
    retail_scope: {
      in_scope: isRetailScoped,
      workload_types: state.retail_workload,
    },
    evidence_status: state.evidence_status,
    assumptions: state.assumptions,
    systems_of_record: state.systems_of_record,
    integration_controls: state.integration_controls,
    security_posture: state.security_controls,
    compliance_posture: state.compliance_obligations,
    governance_model: state.governance_controls,
    infrastructure_model: state.infrastructure_controls,
    technology_model: state.technology_controls,
    technology_domains: state.technology_domains,
    specialist_handoff_matrix: state.specialist_handoff_matrix,
    api_technology: state.api_technology,
    storage_technology: state.storage_technology,
    ai_technology: state.ai_technology,
    ui_technology: state.ui_technology,
    technology_nfr_coverage: state.technology_nfr_coverage,
    storage_model: state.storage_controls,
    data_domain_matrix: state.data_domain_matrix,
    system_of_record_matrix: state.system_of_record_matrix,
    storage_platform: state.storage_platform,
    storage_platforms: state.storage_platforms,
    cache_search_strategy: state.cache_search_strategy,
    backup_recovery_retention: state.backup_recovery_retention,
    data_migration_rebuild: state.data_migration_rebuild,
    api_model: state.api_controls,
    api_contract_matrix: state.api_contract_matrix,
    api_gateway_strategy: state.api_gateway_strategy,
    integration_orchestration: state.integration_orchestration,
    third_party_integrations: state.third_party_integrations,
    idempotency_replay_controls: state.idempotency_replay_controls,
    api_security_observability: state.api_security_observability,
    ai_model: state.ai_controls,
    ai_use_case_matrix: state.ai_use_case_matrix,
    rag_architecture: state.rag_architecture,
    model_routing_strategy: state.model_routing_strategy,
    vector_embedding_strategy: state.vector_embedding_strategy,
    ai_tool_api_controls: state.ai_tool_api_controls,
    ai_safety_evaluation: state.ai_safety_evaluation,
    ai_privacy_residency: state.ai_privacy_residency,
    ai_cost_operations: state.ai_cost_operations,
    ui_model: state.ui_controls,
    ui_channel_matrix: state.ui_channel_matrix,
    frontend_architecture: state.frontend_architecture,
    design_system_strategy: state.design_system_strategy,
    checkout_experience_resilience: state.checkout_experience_resilience,
    ui_auth_session_controls: state.ui_auth_session_controls,
    ui_performance_delivery: state.ui_performance_delivery,
    ui_observability: state.ui_observability,
    ui_accessibility_internationalization: state.ui_accessibility_internationalization,
    runtime_platform: state.runtime_platform,
    network_topology: state.network_topology,
    resilience_plan: state.resilience_plan,
    observability_operations: state.observability_operations,
    environment_release_strategy: state.environment_release_strategy,
    finops_model: state.finops_controls,
    cost_drivers: state.cost_drivers,
    workload_pricing_assumptions: state.workload_pricing_assumptions,
    constraint_gates: state.constraint_gates,
    residency_matrix: state.residency_matrix,
    nfr_coverage: state.nfr_coverage,
    architecture_decisions: state.architecture_decisions,
    risks: state.risks,
    human_validation_needed: state.human_validation_needed,
    validation_needed: state.validation_gaps,
    conflicts,
    architecture_board: reviewGate.board,
    validation: reviewGate.validation,
    next_steps: [
      'Validate the current Security, Compliance, Governance, and FinOps review with named human owners before treating it as client-ready.',
      'Run API, Storage, AI, and UI specialist validation before final architecture diagram approval.',
      'Validate storage source-of-truth, cache/search, backup/restore, retention/deletion, migration/rebuild, and residency evidence before final technology selection.',
      'Validate API gateway, service contracts, sync/async boundaries, partner integrations, idempotency/replay, reconciliation, and API observability before final architecture approval.',
      'Validate AI model routing, RAG corpus, vector/embedding/reranking, tool scopes, safety evals, privacy/residency, fallback, and token budget before final architecture approval.',
      'Validate UI storefront/mobile/admin channels, route/API dependencies, checkout resilience, design-system/accessibility, auth/session, frontend performance, observability, feature flags, and rollback gates before final architecture approval.',
      'Confirm runtime, network, deployment, HA/DR, observability, UI, API, storage, and AI technology choices before final architecture approval.',
      'Run acceptance tests for peak trading, replay/idempotency, rollback, PCI/payment boundaries, privacy deletion, and AI safety controls.',
      'Collect evidence for pricing, data residency, compliance obligations, provider contracts, system ownership, rollout gates, and support model.',
    ],
  };
}

function sanitizeAgentOutput(output = {}) {
  const {
    graph_agent,
    model_review,
    statePatch,
    security_tool_results,
    compliance_tool_results,
    governance_tool_results,
    infrastructure_tool_results,
    technology_tool_results,
    storage_tool_results,
    api_tool_results,
    ai_tool_results,
    ui_tool_results,
    finops_tool_results,
    evidence,
    ...customerOutput
  } = output;
  return customerOutput;
}

function buildDevelopmentDiagnostics(outputs = [], state = {}, reviewGate = {}) {
  return {
    agents: outputs.map(output => ({
      agentId: output.agentId,
      title: output.title,
      status: output.status,
      model_review: output.model_review || null,
      graph_agent: output.graph_agent || null,
      state_patch_keys: Object.keys(output.statePatch || {}),
      evidence_keys: Object.keys(output.evidence || {}),
      tool_result_keys: Object.keys({
        ...(output.security_tool_results ? { security_tool_results: output.security_tool_results } : {}),
        ...(output.compliance_tool_results ? { compliance_tool_results: output.compliance_tool_results } : {}),
        ...(output.governance_tool_results ? { governance_tool_results: output.governance_tool_results } : {}),
        ...(output.infrastructure_tool_results ? { infrastructure_tool_results: output.infrastructure_tool_results } : {}),
        ...(output.technology_tool_results ? { technology_tool_results: output.technology_tool_results } : {}),
        ...(output.storage_tool_results ? { storage_tool_results: output.storage_tool_results } : {}),
        ...(output.api_tool_results ? { api_tool_results: output.api_tool_results } : {}),
        ...(output.ai_tool_results ? { ai_tool_results: output.ai_tool_results } : {}),
        ...(output.ui_tool_results ? { ui_tool_results: output.ui_tool_results } : {}),
        ...(output.finops_tool_results ? { finops_tool_results: output.finops_tool_results } : {}),
      }),
      counts: {
        findings: (output.findings || []).length,
        risks: (output.risks || []).length,
        validation_needed: (output.validation_needed || []).length,
      },
    })),
    architecture_state_counts: {
      security_controls: (state.security_controls || []).length,
      compliance_obligations: (state.compliance_obligations || []).length,
      governance_controls: (state.governance_controls || []).length,
      infrastructure_controls: (state.infrastructure_controls || []).length,
      technology_controls: (state.technology_controls || []).length,
      storage_controls: (state.storage_controls || []).length,
      api_controls: (state.api_controls || []).length,
      ai_controls: (state.ai_controls || []).length,
      ui_controls: (state.ui_controls || []).length,
      finops_controls: (state.finops_controls || []).length,
      risks: (state.risks || []).length,
      validation_gaps: (state.validation_gaps || []).length,
    },
    review_gate: {
      validation: reviewGate.validation,
      board: reviewGate.board,
      annotation_model: reviewGate.annotation_model,
    },
  };
}

function sanitizeArchitectureState(state = {}, sanitizedOutputs = []) {
  const sanitized = {
    ...state,
    agent_outputs: Object.fromEntries(sanitizedOutputs.map(output => [output.agentId, output])),
  };
  for (const key of Object.keys(sanitized)) {
    if (/_tool_context$|_tool_results$|^graph_agent$|^model_review$|^statePatch$/.test(key)) {
      delete sanitized[key];
    }
  }
  return sanitized;
}

async function runArchitectAgents(rawRequest = {}) {
  const request = normalizeAgentRequest(rawRequest);
  const signals = getRetailSignals({ query: request.query, context: request.context, state: request.state });
  const agents = resolveAgents(request.requestedAgents);
  let state = {
    ...request.state,
    retail_workload: request.state.retail_workload?.length ? request.state.retail_workload : signals.workloadTypes,
    retrieval_context: request.retrievedContext,
  };

  const outputs = [];
  for (const agent of agents) {
    const output = await agent.run({
      query: request.query,
      mode: request.mode,
      useModel: request.useModel,
      context: request.context,
      state,
      retrievedContext: request.retrievedContext,
    });
    outputs.push(output);
    state = applyAgentOutput(state, output);
  }

  const conflicts = summarizeConflicts(outputs, signals);
  const reviewGate = runRetailReviewGate({
    query: request.query,
    context: request.context,
    state,
    outputs,
  });
  state = reviewGate.enriched_state;
  const sanitizedOutputs = outputs.map(sanitizeAgentOutput);
  const sanitizedState = sanitizeArchitectureState(state, sanitizedOutputs);
  const recommendation = buildRecommendation(state, outputs, conflicts, signals, reviewGate);
  const architectureRecommendation = synthesizeArchitectureRecommendation({
    query: request.query,
    state,
    outputs,
    reviewGate,
  });

  return {
    ok: true,
    mode: request.mode,
    master_agent: {
      id: 'architecture_review',
      title: 'Architecture Review',
      status: 'completed',
      summary: 'Customer-facing specialist review completed.',
    },
    agents_used: sanitizedOutputs.map(output => output.agentId),
    agent_outputs: sanitizedOutputs,
    review_gate: {
      validation: reviewGate.validation,
      architecture_board: reviewGate.board,
    },
    architecture_state: sanitizedState,
    recommendation,
    architecture_recommendation: architectureRecommendation,
    synthesis_recommendation: architectureRecommendation,
    development_diagnostics: buildDevelopmentDiagnostics(outputs, state, reviewGate),
  };
}

module.exports = { runArchitectAgents };
