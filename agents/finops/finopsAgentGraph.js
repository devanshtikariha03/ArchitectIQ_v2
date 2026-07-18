const { Annotation, END, START, StateGraph } = require('@langchain/langgraph');
const { runFinOpsAgent } = require('./finopsAgent');
const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeUnique } = require('../schema');
const { finopsTools } = require('./finopsTools');
const { classifyFinOpsSignals } = require('./finopsSignalClassifier');

const FinOpsGraphState = Annotation.Root({
  query: Annotation({ reducer: (_current, update) => update, default: () => '' }),
  mode: Annotation({ reducer: (_current, update) => update, default: () => 'architecture-review' }),
  useModel: Annotation({ reducer: (_current, update) => update, default: () => true }),
  context: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  architectureState: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  retrievedContext: Annotation({ reducer: (_current, update) => update, default: () => [] }),
  signals: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  finopsSignalProfile: Annotation({ reducer: (_current, update) => update, default: () => null }),
  costConstraints: Annotation({ reducer: (_current, update) => update, default: () => null }),
  unitDrivers: Annotation({ reducer: (_current, update) => update, default: () => null }),
  pricingEvidence: Annotation({ reducer: (_current, update) => update, default: () => null }),
  costModel: Annotation({ reducer: (_current, update) => update, default: () => null }),
  finopsKnowledge: Annotation({ reducer: (_current, update) => update, default: () => null }),
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
    state.finopsSignalProfile,
    state.costConstraints,
    state.unitDrivers,
    state.pricingEvidence,
    state.costModel,
    state.finopsKnowledge,
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

async function prepareFinOpsContext(state) {
  const signals = getRetailSignals({ query: state.query, context: state.context, state: state.architectureState });
  const agentOutputs = state.architectureState?.agent_outputs || {};
  const finopsSignalProfile = classifyFinOpsSignals({
    query: state.query,
    context: state.context,
    state: state.architectureState,
    signals,
  });
  return {
    signals,
    finopsSignalProfile,
    trace: [trace('prepare_finops_context', `Detected ${signals.workloadTypes.length || 0} workload signal(s), ${finopsSignalProfile.domains.length} FinOps domain signal(s); upstream agents available: ${Object.keys(agentOutputs).join(', ') || 'none'}.`)],
  };
}

async function inspectCostConstraints(state) {
  const costConstraints = await finopsTools.inspectCostConstraintsTool.invoke(toolInput(state));
  return {
    costConstraints,
    trace: [trace('inspect_cost_constraints', `Inspected upstream constraints; security=${costConstraints.upstream?.security ? 'yes' : 'no'}, compliance=${costConstraints.upstream?.compliance ? 'yes' : 'no'}, governance=${costConstraints.upstream?.governance ? 'yes' : 'no'}.`)],
  };
}

async function estimateUnitDrivers(state) {
  const unitDrivers = await finopsTools.estimateUnitDriversTool.invoke(toolInput(state));
  return {
    unitDrivers,
    trace: [trace('estimate_unit_drivers', `Estimated ${Object.keys(unitDrivers.workload_pricing_assumptions || {}).length} unit driver(s).`)],
  };
}

async function fetchLiveCloudPricing(state) {
  const pricingEvidence = await finopsTools.liveCloudPricingTool.invoke(toolInput(state));
  return {
    pricingEvidence,
    trace: [trace('fetch_live_cloud_pricing', `Fetched ${pricingEvidence.usablePricePoints?.length || 0} provider price point(s); evidence=${pricingEvidence.evidence_status || 'assumption'}.`)],
  };
}

async function buildCostModel(state) {
  const costModel = await finopsTools.buildCostModelTool.invoke(toolInput(state));
  return {
    costModel,
    trace: [trace('build_cost_model', `Built ${costModel.cost_drivers?.length || 0} cost driver(s) and ${costModel.tiering_rules?.length || 0} tiering rule(s).`)],
  };
}

async function planFinOpsRetrieval(state) {
  const plan = [
    'retail-finops-unit-driver-playbook',
    'llm-rag-agent-cost-model-template',
    'retail-service-level-pricing-evidence-checklist',
    'cloud-support-licensing-partner-contingency-checklist',
    'security-compliance-governance-cost-handoff-template',
  ];
  if (state.signals.retailAi) plan.push('private-llm-vector-db-embedding-reranking-cost-template');
  if (state.signals.commerce) plan.push('retail-flash-sale-commerce-cost-driver-template');
  if (state.signals.supplyChain) plan.push('retail-fulfilment-integration-cost-driver-template');
  if (state.signals.storeEdge) plan.push('store-edge-finops-cost-template');
  for (const hint of state.finopsSignalProfile?.retrieval_hints || []) plan.push(hint);
  return {
    retrievalPlan: [...new Set(plan)],
    evidence: retailEvidence(state.retrievedContext),
    trace: [trace('plan_finops_retrieval', `Planned ${plan.length} FinOps retrieval request(s).`)],
  };
}

async function retrieveFinOpsKnowledge(state) {
  const finopsKnowledge = await finopsTools.retrieveFinOpsKnowledgeTool.invoke({
    ...toolInput(state),
    retrievalPlan: state.retrievalPlan,
    limit: 7,
  });
  return {
    finopsKnowledge,
    trace: [trace('retrieve_finops_knowledge', `Retrieved ${finopsKnowledge.docs?.length || 0} local FinOps knowledge document(s).`)],
  };
}

async function runDeterministicFinOpsReview(state) {
  const deterministicReview = await runFinOpsAgent({
    query: state.query,
    mode: state.mode,
    useModel: false,
    context: state.context,
    state: state.architectureState,
    retrievedContext: state.retrievedContext,
  });
  return {
    deterministicReview,
    trace: [trace('deterministic_finops_review', `Produced ${deterministicReview.findings?.length || 0} deterministic FinOps control(s).`)],
  };
}

function mergeAssumptions(existing = {}, incoming = {}) {
  return { ...(existing || {}), ...(incoming || {}) };
}

function inferFinOpsOwner(item) {
  const text = String(item || '').toLowerCase();
  if (/llm|token|embedding|vector|rerank|gpt|model|rag|ai/.test(text)) return 'AI platform owner + FinOps owner';
  if (/security|pci|compliance|residency|processor|audit|qsa|privacy/.test(text)) return 'Security/compliance owner + FinOps owner';
  if (/support|license|partner|implementation|non-prod|contingency|training/.test(text)) return 'Commercial/procurement owner + FinOps owner';
  if (/store|pos|edge|rollout|field|device|hardware/.test(text)) return 'Retail operations owner + FinOps owner';
  if (/sku|price|contract|discount|commit|region|provider|aws|azure|gcp/.test(text)) return 'Cloud commercial owner + FinOps owner';
  return 'FinOps owner';
}

function buildFinOpsEvidencePack({ constraints = {}, unitDrivers = {}, pricing = {}, costModel = {}, knowledge = {}, signalProfile = {}, validationNeeded = [], evidenceStatus = {}, validationGates = [], finopsQualification = {} }) {
  const assumptions = unitDrivers.workload_pricing_assumptions || {};
  return {
    evidence_pack: {
      policy_sources: knowledge.docs || [],
      policy_inventory: knowledge.policy_inventory || [],
      citations: knowledge.citations || [],
      evidence_status: evidenceStatus,
      finops_qualification: finopsQualification,
      pricing_evidence_needed: [
        {
          component: 'AWS/Azure/GCP service pricing',
          status: pricing.evidence_status || 'assumption',
          evidence_needed: 'Exact service SKU, region, usage quantity, support tier, enterprise discounts, commitments, tax/currency, and contract terms.',
          current_provider_path: pricing.formatted_summary || pricing.summary || 'Provider pricing lookup unavailable or assumption-level.',
        },
        {
          component: 'LLM/API, embeddings, vector DB, reranking, and eval traces',
          status: /ai_unit_costs/.test(JSON.stringify(signalProfile)) ? 'assumption' : 'not_confirmed',
          evidence_needed: 'Model route, requests/day, turns/request, input/output tokens, prompt cache hit rate, vector count/dimensions, query rate, reranker rate, trace retention, and fallback route.',
        },
      ],
      unit_driver_evidence_needed: Object.entries(assumptions).map(([driver, current_assumption]) => ({
        driver,
        current_assumption,
        status: /not applicable/i.test(String(current_assumption)) ? 'not_confirmed' : 'assumption',
        evidence_needed: 'Measured baseline, peak multiplier, source telemetry, owner, date range, and approval status.',
      })),
      cost_control_evidence_needed: (costModel.cost_drivers || []).map(driver => ({
        cost_driver: driver,
        evidence_needed: 'Service-level line item, monthly estimate basis, owner validation, optimisation lever, and accepted risk if reduced.',
        status: 'assumption',
      })),
      upstream_cost_handoff_summary: {
        security_available: Boolean(constraints.upstream?.security),
        compliance_available: Boolean(constraints.upstream?.compliance),
        governance_available: Boolean(constraints.upstream?.governance),
        infrastructure_available: Boolean(constraints.upstream?.infrastructure),
        technology_available: Boolean(constraints.upstream?.technology),
        storage_available: Boolean(constraints.upstream?.storage),
        api_available: Boolean(constraints.upstream?.api),
        ai_available: Boolean(constraints.upstream?.ai),
        ui_available: Boolean(constraints.upstream?.ui),
        validation_gaps: constraints.upstream?.validation_gaps || [],
      },
      approval_workflow: [
        'FinOps owner validates unit drivers, provider SKUs, contracts, support/licensing, non-prod parity, partner effort, and contingency.',
        'Security and compliance owners confirm mandatory controls cannot be removed for cost optimisation without accepted-risk approval.',
        'Governance owner confirms budget gates, rollout waves, architecture decisions, and owner approvals before client-ready budget sign-off.',
        'Infrastructure/platform owner validates runtime, network, HA/DR, observability, environment/release, non-prod parity, and capacity cost drivers.',
        'Technology owner validates API, Storage, AI, UI, integration, telemetry, acceptance-test, and specialist-review cost drivers.',
        'Storage/data owner validates database, cache, search, object, backup, replication, restore, retention, and data-growth cost drivers.',
        'API/integration owner validates gateway, event/queue, partner call, retry/replay, contract-test, support, and observability cost drivers.',
        'UI/product owner validates CDN, image delivery, RUM/session replay, experimentation, feature flags, synthetic tests, accessibility testing, support/admin seats, browser/device testing, and release tooling cost drivers.',
        'AI owner validates model calls, token volume, prompt cache, embeddings, vector reads/storage, reranking, eval traces, fallback, local/private hosting, and AI observability cost drivers.',
        'Procurement/cloud commercial owner validates enterprise discounts, marketplace/private offers, commitments, support plan, currency, tax, and contract terms.',
      ],
      client_questions: [
        'What is the hard monthly budget, setup budget, currency, target margin, committed spend, and support tier?',
        'Which cloud/SaaS contracts, discounts, marketplace private offers, credits, and commitment terms already exist?',
        'What are measured baseline and peak unit drivers: users, requests, checkout attempts, events/sec, data growth, egress, logs/traces, stores, POS lanes, and support seats?',
        'Which Security, Compliance, and Governance controls are mandatory, and who can approve accepted-risk cost tradeoffs?',
        'For AI/RAG/agent workflows, what is the model routing split, token volume, cache hit rate, embedding/vector/reranking volume, trace retention, and fallback route?',
      ],
      review_limitations: [
        'FinOps output is an architecture budget draft, not a quote, purchase order, contract price, procurement approval, or budget-owner sign-off.',
        'Provider catalog lookups are partial until exact SKUs, region, usage, discounts, support, taxes/currency, and contract terms are verified.',
      ],
      validation_gates: validationGates,
      signal_profile: {
        domains: signalProfile.domains || [],
        confidence_summary: signalProfile.confidence_summary || {},
        error_modes: signalProfile.error_modes || {},
      },
    },
    validation_needed: [
      'Collect owner-approved FinOps evidence pack before marking budget feasibility, provider price, discount, commitment, or optimisation status as verified.',
      ...validationNeeded,
    ],
  };
}

function augmentFinOpsReview(state) {
  const base = state.deterministicReview || {};
  const constraints = state.costConstraints || {};
  const unitDrivers = state.unitDrivers || {};
  const pricing = state.pricingEvidence || {};
  const costModel = state.costModel || {};
  const knowledge = state.finopsKnowledge || {};
  const signalProfile = state.finopsSignalProfile || {};
  const findings = mergeArrayFields(base.findings, knowledge.controls, constraints.controls, costModel.tiering_rules);
  const pricingFindings = (pricing.summary || []).map(item => `Provider pricing evidence: ${item}`);
  const costDrivers = mergeArrayFields(base.cost_drivers, costModel.cost_drivers, pricingFindings);
  const workloadPricingAssumptions = mergeAssumptions(base.workload_pricing_assumptions, {
    provider_pricing_region: pricing.region?.label || 'Region not confirmed',
    provider_pricing_status: pricing.evidence_status || 'assumption',
    provider_price_points: pricing.usablePricePoints?.length ? `${pricing.usablePricePoints.length} usable AWS/Azure/GCP price point(s) fetched` : 'No usable AWS/Azure/GCP service-level price point fetched',
  }, unitDrivers.workload_pricing_assumptions);
  const risks = mergeArrayFields(base.risks, knowledge.risks, costModel.risks);
  const validationNeeded = mergeArrayFields(base.validation_needed, knowledge.validation_needed, constraints.validation_needed, unitDrivers.validation_needed, pricing.validation_needed, costModel.validation_needed);
  const evidenceStatus = {
    pricing: pricing.evidence_status || 'assumption',
    provider_skus: pricing.usablePricePoints?.length ? 'partial' : 'missing',
    unit_drivers: Object.keys(workloadPricingAssumptions).length ? 'assumption' : 'missing',
    ai_cost_model: state.signals.retailAi || signalProfile.domains?.some(domain => domain.id === 'ai_unit_costs') ? 'assumption' : 'not_confirmed',
    security_handoff: constraints.upstream?.security ? 'partial' : 'missing',
    compliance_handoff: constraints.upstream?.compliance ? 'partial' : 'missing',
    governance_handoff: constraints.upstream?.governance ? 'partial' : 'missing',
    infrastructure_handoff: constraints.upstream?.infrastructure ? 'partial' : 'missing',
    technology_handoff: constraints.upstream?.technology ? 'partial' : 'missing',
    storage_handoff: constraints.upstream?.storage ? 'partial' : 'missing',
    api_handoff: constraints.upstream?.api ? 'partial' : 'missing',
    ai_handoff: constraints.upstream?.ai ? 'partial' : 'missing',
    ui_handoff: constraints.upstream?.ui ? 'partial' : 'missing',
    support_licensing_partner: 'assumption',
    non_prod_contingency: 'assumption',
  };
  const validationGates = validationNeeded.map(item => ({
    gate: item,
    owner: inferFinOpsOwner(item),
    status: 'requires human validation',
  }));
  const finopsQualification = {
    status: 'draft_requires_budget_owner_review',
    statement: 'This FinOps output is an architecture budget draft. It is not a provider quote, procurement approval, purchase order, contract price, or budget-owner sign-off.',
    evidence_status: 'assumption_or_partial_until_unit_drivers_pricing_contracts_and_mandatory_controls_are_verified',
    required_reviewers: ['FinOps owner', 'Cloud commercial/procurement owner', 'Security owner', 'Compliance/privacy owner', 'Governance/architecture owner'],
  };
  const evidencePack = buildFinOpsEvidencePack({
    constraints,
    unitDrivers: { ...unitDrivers, workload_pricing_assumptions: workloadPricingAssumptions },
    pricing,
    costModel,
    knowledge,
    signalProfile,
    validationNeeded,
    evidenceStatus,
    validationGates,
    finopsQualification,
  });
  const fullValidationNeeded = mergeArrayFields(validationNeeded, evidencePack.validation_needed);
  const costOptimizationLevers = mergeArrayFields(
    costModel.tiering_rules,
    'Optimised cost tiers can only reduce spend through measured right-sizing, commitments, caching, retention tuning, traffic shaping, or model routing while preserving required security, compliance, resilience, and governance controls.',
    'Cheapest option is not client-ready if it removes mandatory controls, weakens evidence retention, underfunds support, or ignores peak retail load.'
  );
  const finopsRecommendation = mergeArrayFields(
    'Keep the budget recommendation conditional until unit drivers, provider SKUs, support/licensing/partner costs, non-prod parity, contingency, and upstream Security/Compliance/Governance controls are validated.',
    findings.slice(0, 8)
  );
  const statePatch = {
    ...(base.statePatch || {}),
    finops_controls: findings,
    cost_drivers: costDrivers,
    workload_pricing_assumptions: workloadPricingAssumptions,
    risks,
    finops_recommendation: finopsRecommendation,
    finops_upstream_summary: constraints.upstream || {},
    unit_driver_matrix: Object.entries(workloadPricingAssumptions).map(([driver, assumption]) => ({ driver, assumption, evidence_status: /not applicable/i.test(String(assumption)) ? 'not_confirmed' : 'assumption' })),
    pricing_evidence_summary: {
      evidence_status: pricing.evidence_status || 'assumption',
      usable_price_points: pricing.usablePricePoints?.length || 0,
      region: pricing.region || null,
      provider_summary: pricing.summary || [],
      validation_needed: pricing.validation_needed || [],
    },
    cost_model_tiers: costModel.tiering_rules || [],
    cost_optimization_levers: costOptimizationLevers,
    finops_evidence_status: evidenceStatus,
    finops_validation_gates: validationGates,
    finops_qualification: finopsQualification,
    finops_policy_citations: knowledge.citations || [],
    finops_evidence_pack: evidencePack.evidence_pack,
    finops_signal_profile: {
      domains: signalProfile.domains || [],
      confidence_summary: signalProfile.confidence_summary || {},
      error_modes: signalProfile.error_modes || {},
    },
    assumptions: mergeArrayFields(
      base.statePatch?.assumptions,
      base.assumptions,
      pricing.usablePricePoints?.length
        ? 'Pricing is partially verified from provider price points, but final monthly estimates still require exact SKUs, usage, discounts, support, non-prod, licensing, partner, and commitment evidence.'
        : 'Pricing remains assumption-level until current service SKU, usage, region, support, licensing, partner, and commitment evidence is supplied.'
    ),
    evidence_status: {
      ...(base.statePatch?.evidence_status || {}),
      pricing: pricing.evidence_status || 'assumption',
      finops: 'assumption_or_partial',
    },
    human_validation_needed: mergeArrayFields(base.statePatch?.human_validation_needed, fullValidationNeeded),
    validation_gaps: mergeArrayFields(base.statePatch?.validation_gaps, fullValidationNeeded.map(item => `FinOps validation required: ${item}`)),
    retrieval_requests: mergeArrayFields(base.statePatch?.retrieval_requests, state.retrievalPlan),
    finops_tool_context: {
      cost_constraints: constraints,
      unit_drivers: unitDrivers,
      provider_pricing: pricing,
      cost_model: costModel,
      finops_knowledge: knowledge,
      finops_signal_profile: signalProfile,
      evidence_pack: evidencePack,
    },
  };
  return {
    augmentedReview: {
      ...base,
      status: 'completed_with_tools',
      summary: 'FinOps Agent completed tool-assisted review using upstream Security, Compliance, and Governance constraints, AWS/Azure/GCP pricing evidence, local FinOps knowledge, unit drivers, and cost-model tiering.',
      findings,
      finops_recommendation: statePatch.finops_recommendation,
      finops_upstream_summary: statePatch.finops_upstream_summary,
      unit_driver_matrix: statePatch.unit_driver_matrix,
      cost_drivers: costDrivers,
      workload_pricing_assumptions: workloadPricingAssumptions,
      pricing_evidence_summary: statePatch.pricing_evidence_summary,
      provider_pricing: pricing,
      cost_model_tiers: statePatch.cost_model_tiers,
      cost_optimization_levers: statePatch.cost_optimization_levers,
      finops_evidence_status: evidenceStatus,
      finops_validation_gates: validationGates,
      finops_qualification: finopsQualification,
      finops_policy_citations: knowledge.citations || [],
      finops_evidence_pack: evidencePack.evidence_pack,
      finops_signal_profile: statePatch.finops_signal_profile,
      risks,
      validation_needed: fullValidationNeeded,
      retrieval_requests: state.retrievalPlan,
      finops_tool_results: statePatch.finops_tool_context,
      statePatch,
    },
    trace: [trace('augment_finops_review', `Augmented FinOps review with ${compactToolResults(state).length} tool result(s).`)],
  };
}

function shouldRunModel(state) {
  return state.useModel ? 'model_judgement' : 'validate_finops_output';
}

async function runFinOpsModelJudgement(state) {
  const modelReview = await runFinOpsAgent({
    query: state.query,
    mode: state.mode,
    useModel: true,
    context: state.context,
    state: {
      ...state.architectureState,
      finops_tool_context: state.augmentedReview?.finops_tool_results,
      finops_tool_validation_needed: state.augmentedReview?.validation_needed,
      provider_pricing: state.augmentedReview?.provider_pricing,
      finops_signal_profile: state.augmentedReview?.finops_signal_profile,
      finops_qualification: state.augmentedReview?.finops_qualification,
      finops_policy_citations: state.augmentedReview?.finops_policy_citations,
      finops_evidence_pack: state.augmentedReview?.finops_evidence_pack,
    },
    retrievedContext: state.retrievedContext,
  });
  const usedModel = Boolean(modelReview?.model_review?.enabled);
  return {
    modelReview: usedModel ? enrichCandidateWithTools(modelReview, state) : null,
    trace: [trace('finops_model_judgement', usedModel ? modelReview.model_review?.error ? 'Model judgement failed; tool-assisted output retained.' : `Model judgement completed with ${modelReview.model_review?.model || 'configured model'}.` : 'Model judgement skipped because no model provider was available.')],
  };
}

function enrichCandidateWithTools(candidate, state) {
  const toolReview = state.augmentedReview || {};
  return {
    ...candidate,
    findings: mergeArrayFields(candidate.findings, toolReview.findings),
    finops_recommendation: mergeArrayFields(candidate.finops_recommendation, toolReview.finops_recommendation),
    finops_upstream_summary: toolReview.finops_upstream_summary || candidate.finops_upstream_summary,
    unit_driver_matrix: mergeArrayFields(candidate.unit_driver_matrix, toolReview.unit_driver_matrix),
    cost_drivers: mergeArrayFields(candidate.cost_drivers, toolReview.cost_drivers),
    workload_pricing_assumptions: mergeAssumptions(candidate.workload_pricing_assumptions, toolReview.workload_pricing_assumptions),
    pricing_evidence_summary: toolReview.pricing_evidence_summary || candidate.pricing_evidence_summary,
    cost_model_tiers: mergeArrayFields(candidate.cost_model_tiers, toolReview.cost_model_tiers),
    cost_optimization_levers: mergeArrayFields(candidate.cost_optimization_levers, toolReview.cost_optimization_levers),
    finops_evidence_status: toolReview.finops_evidence_status || candidate.finops_evidence_status,
    finops_validation_gates: mergeArrayFields(candidate.finops_validation_gates, toolReview.finops_validation_gates),
    finops_qualification: toolReview.finops_qualification || candidate.finops_qualification,
    finops_policy_citations: mergeArrayFields(candidate.finops_policy_citations, toolReview.finops_policy_citations),
    finops_evidence_pack: toolReview.finops_evidence_pack || candidate.finops_evidence_pack,
    finops_signal_profile: toolReview.finops_signal_profile || candidate.finops_signal_profile,
    risks: mergeArrayFields(candidate.risks, toolReview.risks),
    validation_needed: mergeArrayFields(candidate.validation_needed, toolReview.validation_needed),
    retrieval_requests: mergeArrayFields(candidate.retrieval_requests, state.retrievalPlan),
    finops_tool_results: toolReview.finops_tool_results,
    statePatch: {
      ...(candidate.statePatch || {}),
      finops_controls: mergeArrayFields(candidate.statePatch?.finops_controls, toolReview.findings),
      finops_recommendation: mergeArrayFields(candidate.statePatch?.finops_recommendation, toolReview.finops_recommendation),
      finops_upstream_summary: toolReview.finops_upstream_summary || candidate.statePatch?.finops_upstream_summary,
      unit_driver_matrix: mergeArrayFields(candidate.statePatch?.unit_driver_matrix, toolReview.unit_driver_matrix),
      cost_drivers: mergeArrayFields(candidate.statePatch?.cost_drivers, toolReview.cost_drivers),
      workload_pricing_assumptions: mergeAssumptions(candidate.statePatch?.workload_pricing_assumptions, toolReview.workload_pricing_assumptions),
      pricing_evidence_summary: toolReview.pricing_evidence_summary || candidate.statePatch?.pricing_evidence_summary,
      cost_model_tiers: mergeArrayFields(candidate.statePatch?.cost_model_tiers, toolReview.cost_model_tiers),
      cost_optimization_levers: mergeArrayFields(candidate.statePatch?.cost_optimization_levers, toolReview.cost_optimization_levers),
      finops_evidence_status: toolReview.finops_evidence_status || candidate.statePatch?.finops_evidence_status,
      finops_validation_gates: mergeArrayFields(candidate.statePatch?.finops_validation_gates, toolReview.finops_validation_gates),
      finops_qualification: toolReview.finops_qualification || candidate.statePatch?.finops_qualification,
      finops_policy_citations: mergeArrayFields(candidate.statePatch?.finops_policy_citations, toolReview.finops_policy_citations),
      finops_evidence_pack: toolReview.finops_evidence_pack || candidate.statePatch?.finops_evidence_pack,
      finops_signal_profile: toolReview.finops_signal_profile || candidate.statePatch?.finops_signal_profile,
      risks: mergeArrayFields(candidate.statePatch?.risks, toolReview.risks),
      human_validation_needed: mergeArrayFields(candidate.statePatch?.human_validation_needed, toolReview.validation_needed),
      validation_gaps: mergeArrayFields(candidate.statePatch?.validation_gaps, toolReview.statePatch?.validation_gaps),
      retrieval_requests: mergeArrayFields(candidate.statePatch?.retrieval_requests, state.retrievalPlan),
      finops_tool_context: toolReview.finops_tool_results,
    },
  };
}

async function validateFinOpsOutput(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const validation = await finopsTools.validateFinOpsOutputTool.invoke({
    ...toolInput(state),
    output: candidate,
    toolResults: compactToolResults(state),
  });
  return {
    validation,
    trace: [trace('validate_finops_output', `FinOps validation returned ${validation.verdict}.`, { blockers: validation.blockers?.length || 0, warnings: validation.warnings?.length || 0 })],
  };
}

function shouldRecommendFinOpsReview(state) {
  return state.validation?.verdict === 'pass' ? 'finalize_finops_output' : 'recommend_finops_review_actions';
}

async function recommendFinOpsReviewActions(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const notes = [
    ...(state.validation?.blockers || []).map(item => `FinOps blocker: ${item}`),
    ...(state.validation?.warnings || []).map(item => `FinOps warning: ${item}`),
  ];
  return {
    remediation: {
      ...candidate,
      status: candidate?.status === 'completed_with_model' ? 'completed_with_model_and_finops_review_recommendations' : 'completed_with_finops_review_recommendations',
      validation_needed: mergeArrayFields(candidate?.validation_needed, notes),
      statePatch: {
        ...(candidate?.statePatch || {}),
        human_validation_needed: mergeArrayFields(candidate?.statePatch?.human_validation_needed, notes),
        validation_gaps: mergeArrayFields(candidate?.statePatch?.validation_gaps, notes),
      },
      finops_review_recommendation: {
        reason: state.validation?.verdict,
        blockers: state.validation?.blockers || [],
        warnings: state.validation?.warnings || [],
        action: 'Output remains a FinOps review draft until budget owners validate unit drivers, pricing evidence, contracts, mandatory controls, support/licensing/partner costs, and contingency.',
      },
    },
    trace: [trace('recommend_finops_review_actions', `Added ${notes.length} FinOps review recommendation note(s).`)],
  };
}

async function finalizeFinOpsOutput(state) {
  const selected = state.remediation || state.modelReview || state.augmentedReview || state.deterministicReview;
  const usedModel = Boolean(selected?.model_review?.enabled && !selected?.model_review?.error);
  return {
    output: {
      ...selected,
      status: selected?.model_review?.error ? 'completed_with_fallback' : selected?.finops_review_recommendation ? selected.status : usedModel ? 'completed_with_model' : selected?.status || 'completed_with_tools',
      graph_agent: {
        framework: 'langgraph',
        graph: 'finops_agent_graph',
        agent_type: 'tool_using_finops_agent',
        nodes: state.trace.map(item => item.node),
        tools: [
          'inspectCostConstraintsTool',
          'estimateUnitDriversTool',
          'liveCloudPricingTool',
          'buildCostModelTool',
          'retrieveFinOpsKnowledgeTool',
          'validateFinOpsOutputTool',
        ],
        retrieval_plan: state.retrievalPlan,
        retrieved_docs: state.finopsKnowledge?.docs || [],
        validation: state.validation,
        trace: state.trace,
        upstream: state.costConstraints?.upstream || {},
        pricing: {
          evidence_status: state.pricingEvidence?.evidence_status || 'assumption',
          providers: {
            azure: Boolean(state.pricingEvidence?.azure),
            aws: Boolean(state.pricingEvidence?.aws),
            gcp: Boolean(state.pricingEvidence?.gcp?.available),
          },
          usable_price_points: state.pricingEvidence?.usablePricePoints?.length || 0,
          region: state.pricingEvidence?.region || null,
        },
        model_route: { requested: Boolean(state.useModel), used: usedModel, provider: selected?.model_review?.provider || (usedModel ? 'openai' : 'none'), model: selected?.model_review?.model || 'none' },
      },
      evidence: {
        ...selected?.evidence,
        graph_retrieval: state.evidence,
        local_finops_knowledge: state.finopsKnowledge?.docs || [],
        finops_policy_citations: selected?.finops_policy_citations || [],
        finops_evidence_pack: selected?.finops_evidence_pack || {},
        finops_signal_profile: selected?.finops_signal_profile || {},
        finops_tool_results: selected?.finops_tool_results,
      },
    },
    trace: [trace('finalize_finops_output', 'Finalized tool-using LangGraph FinOps Agent output.')],
  };
}

const finopsAgentGraph = new StateGraph(FinOpsGraphState)
  .addNode('prepare_finops_context', prepareFinOpsContext)
  .addNode('inspect_cost_constraints', inspectCostConstraints)
  .addNode('estimate_unit_drivers', estimateUnitDrivers)
  .addNode('fetch_live_cloud_pricing', fetchLiveCloudPricing)
  .addNode('build_cost_model', buildCostModel)
  .addNode('plan_finops_retrieval', planFinOpsRetrieval)
  .addNode('retrieve_finops_knowledge', retrieveFinOpsKnowledge)
  .addNode('deterministic_finops_review', runDeterministicFinOpsReview)
  .addNode('augment_finops_review', augmentFinOpsReview)
  .addNode('model_judgement', runFinOpsModelJudgement)
  .addNode('validate_finops_output', validateFinOpsOutput)
  .addNode('recommend_finops_review_actions', recommendFinOpsReviewActions)
  .addNode('finalize_finops_output', finalizeFinOpsOutput)
  .addEdge(START, 'prepare_finops_context')
  .addEdge('prepare_finops_context', 'inspect_cost_constraints')
  .addEdge('inspect_cost_constraints', 'estimate_unit_drivers')
  .addEdge('estimate_unit_drivers', 'fetch_live_cloud_pricing')
  .addEdge('fetch_live_cloud_pricing', 'build_cost_model')
  .addEdge('build_cost_model', 'plan_finops_retrieval')
  .addEdge('plan_finops_retrieval', 'retrieve_finops_knowledge')
  .addEdge('retrieve_finops_knowledge', 'deterministic_finops_review')
  .addEdge('deterministic_finops_review', 'augment_finops_review')
  .addConditionalEdges('augment_finops_review', shouldRunModel, { model_judgement: 'model_judgement', validate_finops_output: 'validate_finops_output' })
  .addEdge('model_judgement', 'validate_finops_output')
  .addConditionalEdges('validate_finops_output', shouldRecommendFinOpsReview, { recommend_finops_review_actions: 'recommend_finops_review_actions', finalize_finops_output: 'finalize_finops_output' })
  .addEdge('recommend_finops_review_actions', 'finalize_finops_output')
  .addEdge('finalize_finops_output', END)
  .compile();

async function runFinOpsAgentGraph({ query, mode, useModel, context, state, retrievedContext }) {
  const result = await finopsAgentGraph.invoke({ query, mode, useModel, context, architectureState: state, retrievedContext });
  return result.output;
}

module.exports = {
  finopsAgentGraph,
  runFinOpsAgentGraph,
};
