const DEFAULT_AGENT_IDS = ['security', 'compliance', 'governance', 'infrastructure', 'technology', 'storage', 'api', 'ai', 'ui', 'finops'];

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function textFromRequest(request = {}) {
  return [
    request.query,
    request.prompt,
    request.problem,
    request.context?.industry,
    request.context?.domain,
    request.context?.constraints,
    request.context?.existingSystems,
    request.context?.data,
    request.context?.nfr,
    request.state?.basics,
    request.state?.scale,
    request.state?.cost,
    request.state?.nfr,
    request.state?.team,
    request.architectureState?.basics,
    request.architectureState?.scale,
    request.architectureState?.cost,
    request.architectureState?.nfr,
    request.architectureState?.team,
  ]
    .flatMap(asArray)
    .map(value => {
      if (typeof value === 'string') return value;
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    })
    .join('\n')
    .trim();
}

function createArchitectureState(seed = {}) {
  return {
    basics: seed.basics || {},
    scale: seed.scale || {},
    cost: seed.cost || {},
    nfr: seed.nfr || {},
    team: seed.team || {},
    business_context: seed.business_context || {},
    functional_requirements: asArray(seed.functional_requirements),
    non_functional_requirements: asArray(seed.non_functional_requirements),
    constraints: asArray(seed.constraints),
    existing_systems: asArray(seed.existing_systems),
    retail_workload: asArray(seed.retail_workload),
    systems_of_record: asArray(seed.systems_of_record),
    integration_controls: asArray(seed.integration_controls),
    data_classification: asArray(seed.data_classification),
    security_controls: asArray(seed.security_controls),
    security_recommendation: asArray(seed.security_recommendation),
    data_classification_matrix: asArray(seed.data_classification_matrix),
    trust_boundaries: asArray(seed.trust_boundaries),
    payment_security: seed.payment_security || {},
    ai_security: seed.ai_security || {},
    required_security_controls: asArray(seed.required_security_controls),
    security_approval_gates: asArray(seed.security_approval_gates),
    diagram_annotations: asArray(seed.diagram_annotations),
    accepted_security_assumptions: asArray(seed.accepted_security_assumptions),
    enterprise_control_map: asArray(seed.enterprise_control_map),
    threat_model: seed.threat_model || {},
    compliance_control_map: asArray(seed.compliance_control_map),
    compliance_qualification: seed.compliance_qualification || {},
    security_evidence_pack: seed.security_evidence_pack || {},
    policy_citations: asArray(seed.policy_citations),
    security_signal_profile: seed.security_signal_profile || {},
    compliance_recommendation: asArray(seed.compliance_recommendation),
    jurisdiction_frameworks: asArray(seed.jurisdiction_frameworks),
    compliance_obligations: asArray(seed.compliance_obligations),
    processor_residency_matrix: asArray(seed.processor_residency_matrix),
    retention_deletion_controls: asArray(seed.retention_deletion_controls),
    compliance_evidence_status: seed.compliance_evidence_status || {},
    compliance_validation_gates: asArray(seed.compliance_validation_gates),
    compliance_policy_citations: asArray(seed.compliance_policy_citations),
    compliance_evidence_pack: seed.compliance_evidence_pack || {},
    compliance_signal_profile: seed.compliance_signal_profile || {},
    governance_recommendation: asArray(seed.governance_recommendation),
    governance_handoff_summary: seed.governance_handoff_summary || {},
    systems_of_record_matrix: asArray(seed.systems_of_record_matrix),
    decision_records: asArray(seed.decision_records),
    approval_gates: asArray(seed.approval_gates),
    rollout_readiness: asArray(seed.rollout_readiness),
    governance_evidence_status: seed.governance_evidence_status || {},
    governance_validation_gates: asArray(seed.governance_validation_gates),
    governance_qualification: seed.governance_qualification || {},
    governance_policy_citations: asArray(seed.governance_policy_citations),
    governance_evidence_pack: seed.governance_evidence_pack || {},
    governance_signal_profile: seed.governance_signal_profile || {},
    governance_controls: asArray(seed.governance_controls),
    infrastructure_controls: asArray(seed.infrastructure_controls),
    infrastructure_recommendation: asArray(seed.infrastructure_recommendation),
    infrastructure_handoff_summary: seed.infrastructure_handoff_summary || {},
    runtime_platform: seed.runtime_platform || {},
    network_topology: asArray(seed.network_topology),
    resilience_plan: seed.resilience_plan || {},
    observability_operations: asArray(seed.observability_operations),
    environment_release_strategy: asArray(seed.environment_release_strategy),
    infrastructure_evidence_status: seed.infrastructure_evidence_status || {},
    infrastructure_validation_gates: asArray(seed.infrastructure_validation_gates),
    infrastructure_qualification: seed.infrastructure_qualification || {},
    infrastructure_policy_citations: asArray(seed.infrastructure_policy_citations),
    infrastructure_evidence_pack: seed.infrastructure_evidence_pack || {},
    infrastructure_signal_profile: seed.infrastructure_signal_profile || {},
    technology_controls: asArray(seed.technology_controls),
    technology_recommendation: asArray(seed.technology_recommendation),
    technology_handoff_summary: seed.technology_handoff_summary || {},
    technology_domains: asArray(seed.technology_domains),
    specialist_handoff_matrix: asArray(seed.specialist_handoff_matrix),
    api_technology: seed.api_technology || {},
    storage_technology: seed.storage_technology || {},
    ai_technology: seed.ai_technology || {},
    ui_technology: seed.ui_technology || {},
    technology_nfr_coverage: asArray(seed.technology_nfr_coverage),
    technology_evidence_status: seed.technology_evidence_status || {},
    technology_validation_gates: asArray(seed.technology_validation_gates),
    technology_qualification: seed.technology_qualification || {},
    technology_policy_citations: asArray(seed.technology_policy_citations),
    technology_evidence_pack: seed.technology_evidence_pack || {},
    technology_signal_profile: seed.technology_signal_profile || {},
    storage_controls: asArray(seed.storage_controls),
    storage_recommendation: asArray(seed.storage_recommendation),
    storage_handoff_summary: seed.storage_handoff_summary || {},
    data_domain_matrix: asArray(seed.data_domain_matrix),
    system_of_record_matrix: asArray(seed.system_of_record_matrix),
    storage_platform: seed.storage_platform || {},
    storage_platforms: asArray(seed.storage_platforms),
    cache_search_strategy: seed.cache_search_strategy || {},
    backup_recovery_retention: seed.backup_recovery_retention || {},
    data_migration_rebuild: asArray(seed.data_migration_rebuild),
    storage_evidence_status: seed.storage_evidence_status || {},
    storage_validation_gates: asArray(seed.storage_validation_gates),
    storage_qualification: seed.storage_qualification || {},
    storage_policy_citations: asArray(seed.storage_policy_citations),
    storage_evidence_pack: seed.storage_evidence_pack || {},
    storage_signal_profile: seed.storage_signal_profile || {},
    api_controls: asArray(seed.api_controls),
    api_recommendation: asArray(seed.api_recommendation),
    api_handoff_summary: seed.api_handoff_summary || {},
    api_contract_matrix: asArray(seed.api_contract_matrix),
    api_gateway_strategy: seed.api_gateway_strategy || {},
    integration_orchestration: seed.integration_orchestration || {},
    third_party_integrations: asArray(seed.third_party_integrations),
    idempotency_replay_controls: asArray(seed.idempotency_replay_controls),
    api_security_observability: asArray(seed.api_security_observability),
    api_evidence_status: seed.api_evidence_status || {},
    api_validation_gates: asArray(seed.api_validation_gates),
    api_qualification: seed.api_qualification || {},
    api_policy_citations: asArray(seed.api_policy_citations),
    api_evidence_pack: seed.api_evidence_pack || {},
    api_signal_profile: seed.api_signal_profile || {},
    ai_controls: asArray(seed.ai_controls),
    ai_recommendation: asArray(seed.ai_recommendation),
    ai_handoff_summary: seed.ai_handoff_summary || {},
    ai_use_case_matrix: asArray(seed.ai_use_case_matrix),
    rag_architecture: seed.rag_architecture || {},
    model_routing_strategy: seed.model_routing_strategy || {},
    vector_embedding_strategy: seed.vector_embedding_strategy || {},
    ai_tool_api_controls: asArray(seed.ai_tool_api_controls),
    ai_safety_evaluation: asArray(seed.ai_safety_evaluation),
    ai_privacy_residency: asArray(seed.ai_privacy_residency),
    ai_cost_operations: asArray(seed.ai_cost_operations),
    ai_evidence_status: seed.ai_evidence_status || {},
    ai_validation_gates: asArray(seed.ai_validation_gates),
    ai_qualification: seed.ai_qualification || {},
    ai_policy_citations: asArray(seed.ai_policy_citations),
    ai_evidence_pack: seed.ai_evidence_pack || {},
    ai_signal_profile: seed.ai_signal_profile || {},
    ui_controls: asArray(seed.ui_controls),
    ui_recommendation: asArray(seed.ui_recommendation),
    ui_handoff_summary: seed.ui_handoff_summary || {},
    ui_channel_matrix: asArray(seed.ui_channel_matrix),
    frontend_architecture: seed.frontend_architecture || {},
    design_system_strategy: seed.design_system_strategy || {},
    checkout_experience_resilience: seed.checkout_experience_resilience || {},
    ui_auth_session_controls: asArray(seed.ui_auth_session_controls),
    ui_performance_delivery: asArray(seed.ui_performance_delivery),
    ui_observability: asArray(seed.ui_observability),
    ui_accessibility_internationalization: asArray(seed.ui_accessibility_internationalization),
    ui_evidence_status: seed.ui_evidence_status || {},
    ui_validation_gates: asArray(seed.ui_validation_gates),
    ui_qualification: seed.ui_qualification || {},
    ui_policy_citations: asArray(seed.ui_policy_citations),
    ui_evidence_pack: seed.ui_evidence_pack || {},
    ui_signal_profile: seed.ui_signal_profile || {},
    finops_controls: asArray(seed.finops_controls),
    finops_recommendation: asArray(seed.finops_recommendation),
    finops_upstream_summary: seed.finops_upstream_summary || {},
    unit_driver_matrix: asArray(seed.unit_driver_matrix),
    pricing_evidence_summary: seed.pricing_evidence_summary || {},
    cost_model_tiers: asArray(seed.cost_model_tiers),
    cost_optimization_levers: asArray(seed.cost_optimization_levers),
    finops_evidence_status: seed.finops_evidence_status || {},
    finops_validation_gates: asArray(seed.finops_validation_gates),
    finops_qualification: seed.finops_qualification || {},
    finops_policy_citations: asArray(seed.finops_policy_citations),
    finops_evidence_pack: seed.finops_evidence_pack || {},
    finops_signal_profile: seed.finops_signal_profile || {},
    cost_drivers: asArray(seed.cost_drivers),
    workload_pricing_assumptions: seed.workload_pricing_assumptions || {},
    constraint_gates: asArray(seed.constraint_gates),
    architecture_decisions: asArray(seed.architecture_decisions),
    assumptions: asArray(seed.assumptions),
    residency_matrix: asArray(seed.residency_matrix),
    nfr_coverage: asArray(seed.nfr_coverage),
    human_validation_needed: asArray(seed.human_validation_needed),
    evidence_status: seed.evidence_status || {
      pricing: 'assumption',
      region_availability: 'assumption',
      model_currentness: 'assumption',
      data_residency: 'assumption',
      compliance: 'assumption',
    },
    risks: asArray(seed.risks),
    validation_gaps: asArray(seed.validation_gaps),
    retrieval_context: asArray(seed.retrieval_context),
    retrieval_requests: asArray(seed.retrieval_requests),
    agent_outputs: seed.agent_outputs || {},
  };
}

function normalizeAgentRequest(request = {}) {
  const state = createArchitectureState(request.architectureState || request.state || {});
  const query = textFromRequest(request);
  const requestedAgents = asArray(request.agents || request.requestedAgents)
    .map(item => String(item).toLowerCase().trim())
    .filter(Boolean);

  return {
    query,
    mode: request.mode || 'architecture-review',
    useModel: request.useModel !== false && request.live !== false,
    requestedAgents: requestedAgents.length ? requestedAgents : DEFAULT_AGENT_IDS,
    context: request.context || {},
    retrievedContext: asArray(request.retrievedContext || request.retrieval_context),
    state,
  };
}

function mergeUnique(existing, incoming) {
  const seen = new Set();
  return [...asArray(existing), ...asArray(incoming)].filter(item => {
    const key = typeof item === 'string' ? item : JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function applyAgentOutput(state, output) {
  const patch = output?.statePatch || {};
  const next = { ...state, agent_outputs: { ...state.agent_outputs } };

  for (const [key, value] of Object.entries(patch)) {
    if (Array.isArray(next[key]) || Array.isArray(value)) {
      next[key] = mergeUnique(next[key], value);
    } else if (value && typeof value === 'object') {
      next[key] = { ...(next[key] || {}), ...value };
    } else if (value !== undefined) {
      next[key] = value;
    }
  }

  if (output?.agentId) {
    next.agent_outputs[output.agentId] = output;
  }

  return next;
}

module.exports = {
  DEFAULT_AGENT_IDS,
  applyAgentOutput,
  asArray,
  createArchitectureState,
  mergeUnique,
  normalizeAgentRequest,
};
