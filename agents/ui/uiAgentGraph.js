const { Annotation, END, START, StateGraph } = require('@langchain/langgraph');
const { runUiAgent } = require('./uiAgent');
const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeUnique } = require('../schema');
const { uiTools } = require('./uiTools');
const { classifyUiSignals } = require('./uiSignalClassifier');

const UiGraphState = Annotation.Root({
  query: Annotation({ reducer: (_current, update) => update, default: () => '' }),
  mode: Annotation({ reducer: (_current, update) => update, default: () => 'architecture-review' }),
  useModel: Annotation({ reducer: (_current, update) => update, default: () => true }),
  context: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  architectureState: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  retrievedContext: Annotation({ reducer: (_current, update) => update, default: () => [] }),
  signals: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  uiSignalProfile: Annotation({ reducer: (_current, update) => update, default: () => null }),
  handoff: Annotation({ reducer: (_current, update) => update, default: () => null }),
  frontend: Annotation({ reducer: (_current, update) => update, default: () => null }),
  checkout: Annotation({ reducer: (_current, update) => update, default: () => null }),
  design: Annotation({ reducer: (_current, update) => update, default: () => null }),
  authSession: Annotation({ reducer: (_current, update) => update, default: () => null }),
  performance: Annotation({ reducer: (_current, update) => update, default: () => null }),
  observability: Annotation({ reducer: (_current, update) => update, default: () => null }),
  uiKnowledge: Annotation({ reducer: (_current, update) => update, default: () => null }),
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
    state.uiSignalProfile,
    state.handoff,
    state.frontend,
    state.checkout,
    state.design,
    state.authSession,
    state.performance,
    state.observability,
    state.uiKnowledge,
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

async function prepareUiContext(state) {
  const signals = getRetailSignals({ query: state.query, context: state.context, state: state.architectureState });
  const uiSignalProfile = classifyUiSignals({
    query: state.query,
    context: state.context,
    state: state.architectureState,
    signals,
  });
  return {
    signals,
    uiSignalProfile,
    trace: [trace('prepare_ui_context', `Detected ${signals.workloadTypes.length || 0} workload signal(s) and ${uiSignalProfile.domains.length} UI domain signal(s).`)],
  };
}

async function inspectUiHandoff(state) {
  const handoff = await uiTools.inspectUiHandoffTool.invoke(toolInput(state));
  return {
    handoff,
    trace: [trace('inspect_ui_handoff', `API=${handoff.upstream?.api ? 'yes' : 'no'}, AI=${handoff.upstream?.ai ? 'yes' : 'no'}, Security=${handoff.upstream?.security ? 'yes' : 'no'}, Compliance=${handoff.upstream?.compliance ? 'yes' : 'no'}.`)],
  };
}

async function designFrontend(state) {
  const frontend = await uiTools.designFrontendArchitectureTool.invoke(toolInput(state));
  return { frontend, trace: [trace('design_frontend_architecture', 'Designed UI channel and frontend architecture controls.')] };
}

async function planCheckout(state) {
  const checkout = await uiTools.planCheckoutExperienceTool.invoke(toolInput(state));
  return { checkout, trace: [trace('plan_checkout_experience', 'Planned checkout/cart/payment critical-journey controls.')] };
}

async function planDesign(state) {
  const design = await uiTools.planDesignSystemAccessibilityTool.invoke(toolInput(state));
  return { design, trace: [trace('plan_design_system_accessibility', 'Planned design-system, accessibility, and localization controls.')] };
}

async function planAuthSession(state) {
  const authSession = await uiTools.planUiAuthSessionTool.invoke(toolInput(state));
  return { authSession, trace: [trace('plan_ui_auth_session', 'Planned frontend auth/session controls.')] };
}

async function planPerformance(state) {
  const performance = await uiTools.planUiPerformanceDeliveryTool.invoke(toolInput(state));
  return { performance, trace: [trace('plan_ui_performance_delivery', 'Planned frontend performance/CDN/image controls.')] };
}

async function planObservability(state) {
  const observability = await uiTools.planUiObservabilityTool.invoke(toolInput(state));
  return { observability, trace: [trace('plan_ui_observability', 'Planned UI observability, experimentation, and release controls.')] };
}

async function planUiRetrieval(state) {
  const plan = [
    'retail-storefront-channel-template',
    'retail-checkout-experience-resilience-template',
    'retail-design-system-accessibility-template',
    'retail-frontend-performance-delivery-template',
    'retail-ui-auth-session-template',
    'retail-admin-support-ui-template',
    'retail-ui-observability-experimentation-template',
  ];
  for (const hint of state.uiSignalProfile?.retrieval_hints || []) plan.push(hint);
  return {
    retrievalPlan: [...new Set(plan)],
    evidence: retailEvidence(state.retrievedContext),
    trace: [trace('plan_ui_retrieval', `Planned ${plan.length} UI retrieval request(s).`)],
  };
}

async function retrieveUiKnowledge(state) {
  const uiKnowledge = await uiTools.retrieveUiKnowledgeTool.invoke({
    ...toolInput(state),
    retrievalPlan: state.retrievalPlan,
    limit: 7,
  });
  return {
    uiKnowledge,
    trace: [trace('retrieve_ui_knowledge', `Retrieved ${uiKnowledge.docs?.length || 0} local UI knowledge document(s).`)],
  };
}

async function runDeterministicUiReview(state) {
  const deterministicReview = await runUiAgent({
    query: state.query,
    mode: state.mode,
    useModel: false,
    context: state.context,
    state: state.architectureState,
    retrievedContext: state.retrievedContext,
  });
  return {
    deterministicReview,
    trace: [trace('deterministic_ui_review', `Produced ${deterministicReview.findings?.length || 0} deterministic UI control(s).`)],
  };
}

function inferUiOwner(item) {
  const text = String(item || '').toLowerCase();
  if (/checkout|cart|payment|order|inventory|promo/.test(text)) return 'Checkout/product owner';
  if (/design|component|accessibility|wcag|locale|localization/.test(text)) return 'Design system/accessibility owner';
  if (/auth|session|csrf|xss|cookie|step-up|admin|support/.test(text)) return 'Security/UI platform owner';
  if (/performance|core web vitals|cdn|image|bundle|hydration/.test(text)) return 'Frontend performance owner';
  if (/rum|funnel|feature flag|experiment|rollback|telemetry/.test(text)) return 'UI observability/release owner';
  if (/api|contract|dependency|fallback/.test(text)) return 'API/UI integration owner';
  if (/ai|chatbot|recommendation|personalization/.test(text)) return 'AI/product owner';
  if (/cost|finops|cdn|observability volume/.test(text)) return 'FinOps owner';
  return 'UI owner';
}

function buildUiEvidencePack({ handoff = {}, frontend = {}, checkout = {}, design = {}, authSession = {}, performance = {}, observability = {}, knowledge = {}, signalProfile = {}, evidenceStatus = {}, validationGates = [], qualification = {} }) {
  return {
    evidence_pack: {
      policy_sources: knowledge.docs || [],
      policy_inventory: knowledge.policy_inventory || [],
      citations: knowledge.citations || [],
      evidence_status: evidenceStatus,
      ui_qualification: qualification,
      upstream_handoff_summary: handoff.upstream || {},
      frontend_evidence_needed: [
        {
          recommendation: frontend.frontend_architecture?.recommendation,
          channel_matrix: frontend.ui_channel_matrix || [],
          status: frontend.frontend_architecture?.evidence_status || 'assumption',
          evidence_needed: 'Channel list, route ownership, API dependency map, rendering strategy, cache rules, fallback states, SLOs, release rings, and owner approval.',
        },
      ],
      checkout_evidence_needed: [
        {
          recommendation: checkout.checkout_experience_resilience?.recommendation,
          status: checkout.checkout_experience_resilience?.evidence_status || 'assumption',
          evidence_needed: 'Cart persistence, payment redirect/return, order confirmation, inventory promise, promo errors, duplicate-submit prevention, synthetic tests, and rollback gates.',
        },
      ],
      design_accessibility_evidence_needed: [
        {
          recommendation: design.design_system_strategy?.recommendation,
          accessibility: design.ui_accessibility_internationalization || [],
          status: design.design_system_strategy?.evidence_status || 'assumption',
          evidence_needed: 'WCAG target, component governance, keyboard/screen-reader coverage, locale/currency/address rules, content standards, and visual regression gates.',
        },
      ],
      auth_session_evidence_needed: (authSession.ui_auth_session_controls || []).map(control => ({
        control,
        evidence_needed: 'Auth flow, token/session storage, cookie/CSP/CSRF/XSS settings, step-up actions, support/admin roles, revocation, and audit evidence.',
        status: 'assumption',
      })),
      performance_evidence_needed: (performance.ui_performance_delivery || []).map(control => ({
        control,
        evidence_needed: 'Core Web Vitals target, route budget, bundle/hydration measurement, CDN/image rules, third-party script governance, mobile test, and owner approval.',
        status: 'assumption',
      })),
      observability_release_evidence_needed: (observability.ui_observability || []).map(control => ({
        control,
        evidence_needed: 'RUM metric, funnel event, alert owner, consent/residency/retention rule, feature flag, experiment owner, release ring, rollback threshold, and dashboard.',
        status: 'assumption',
      })),
      approval_workflow: [
        'UI/product owner validates channel map, route ownership, customer journeys, checkout fallback, and release gates.',
        'API owner validates route dependencies, contracts, error states, retry/idempotency behavior, and rate-limit UX.',
        'AI owner validates chatbot/recommendation exposure, fallback, consent-aware analytics, citations/grounding, and escalation journeys.',
        'Security/compliance owners validate auth/session, CSP/CSRF/XSS, admin/support privilege, redaction, privacy notices, telemetry, consent, residency, and retention.',
        'Infrastructure/SRE owner validates CDN/edge delivery, observability, performance SLOs, synthetic tests, and incident routing.',
        'FinOps owner validates CDN traffic, image processing, RUM/session replay volume, experiment tooling, third-party scripts, support seats, and non-prod parity costs.',
      ],
      client_questions: [
        'Which customer, mobile, admin, support, associate, marketplace, and AI-assisted UI channels are in scope?',
        'Which routes are revenue-critical, and what fallback states should customers see when API, payment, inventory, search, recommendation, or chatbot services degrade?',
        'What accessibility, localization, currency, address, consent, privacy notice, and telemetry obligations apply by region?',
        'What frontend performance budgets, CDN/image rules, third-party scripts, feature flags, experiments, and rollback thresholds are required?',
        'What session, token storage, step-up auth, support/admin role, redaction, and audit requirements must the UI enforce?',
      ],
      review_limitations: [
        'UI output is a specialist architecture draft, not design sign-off, accessibility certification, security approval, release approval, or accepted-risk record.',
        'Final architecture diagram should remain blocked until UI evidence is reconciled with API, AI, Security, Compliance, Infrastructure, Technology, Storage, Governance, and FinOps constraints.',
      ],
      validation_gates: validationGates,
      signal_profile: {
        domains: signalProfile.domains || [],
        confidence_summary: signalProfile.confidence_summary || {},
        error_modes: signalProfile.error_modes || {},
      },
    },
    validation_needed: [
      'Collect owner-approved UI evidence pack before marking channel, checkout, design/accessibility, auth/session, performance, observability, or release status as verified.',
    ],
  };
}

function augmentUiReview(state) {
  const base = state.deterministicReview || {};
  const handoff = state.handoff || {};
  const frontend = state.frontend || {};
  const checkout = state.checkout || {};
  const design = state.design || {};
  const authSession = state.authSession || {};
  const performance = state.performance || {};
  const observability = state.observability || {};
  const knowledge = state.uiKnowledge || {};
  const signalProfile = state.uiSignalProfile || {};
  const findings = mergeArrayFields(base.findings, knowledge.controls, handoff.controls, frontend.controls, checkout.controls, design.controls, authSession.controls, performance.controls, observability.controls);
  const risks = mergeArrayFields(base.risks, knowledge.risks, checkout.risks, authSession.risks);
  const validationNeeded = mergeArrayFields(base.validation_needed, knowledge.validation_needed, handoff.validation_needed, frontend.validation_needed, checkout.validation_needed, design.validation_needed, authSession.validation_needed, performance.validation_needed, observability.validation_needed);
  const evidenceStatus = {
    ui: 'assumption',
    channels: 'assumption',
    checkout_resilience: checkout.checkout_experience_resilience?.evidence_status || 'assumption',
    design_accessibility: design.design_system_strategy?.evidence_status || 'assumption',
    auth_session: 'assumption',
    performance_delivery: 'assumption',
    observability_release: 'assumption',
    api_handoff: handoff.upstream?.api ? 'partial' : 'missing',
    ai_handoff: handoff.upstream?.ai ? 'partial' : 'missing',
    security_handoff: handoff.upstream?.security ? 'partial' : 'missing',
    compliance_handoff: handoff.upstream?.compliance ? 'partial' : 'missing',
    governance_handoff: handoff.upstream?.governance ? 'partial' : 'missing',
    infrastructure_handoff: handoff.upstream?.infrastructure ? 'partial' : 'missing',
    technology_handoff: handoff.upstream?.technology ? 'partial' : 'missing',
    storage_handoff: handoff.upstream?.storage ? 'partial' : 'missing',
    finops_handoff: handoff.upstream?.finops ? 'partial' : 'not_yet_available_or_optional',
  };
  const validationGates = validationNeeded.map(item => ({
    gate: item,
    owner: inferUiOwner(item),
    status: 'requires human validation',
  }));
  const qualification = {
    status: 'draft_requires_ui_owner_review',
    statement: 'This UI output is a specialist architecture draft. It is not design sign-off, accessibility certification, security approval, release approval, production readiness approval, or accepted-risk record.',
    evidence_status: 'assumption_or_partial_until_ui_api_ai_security_compliance_infrastructure_technology_storage_and_finops_owners_validate_evidence',
    required_reviewers: ['UI/product owner', 'Design system/accessibility owner', 'API owner', 'AI owner', 'Security owner', 'Compliance/privacy owner', 'Infrastructure/SRE owner', 'Technology owner', 'FinOps owner'],
  };
  const evidencePack = buildUiEvidencePack({
    handoff,
    frontend,
    checkout,
    design,
    authSession,
    performance,
    observability,
    knowledge,
    signalProfile,
    evidenceStatus,
    validationGates,
    qualification,
  });
  const fullValidationNeeded = mergeArrayFields(validationNeeded, evidencePack.validation_needed);
  const uiRecommendation = mergeArrayFields(
    'Keep UI recommendation draft-level until channels, route/API dependencies, checkout resilience, design-system/accessibility, auth/session, performance/CDN/image, observability, release, and telemetry evidence are validated.',
    findings.slice(0, 8)
  );
  const statePatch = {
    ...(base.statePatch || {}),
    ui_controls: findings,
    ui_recommendation: uiRecommendation,
    ui_handoff_summary: handoff.upstream || {},
    ui_channel_matrix: frontend.ui_channel_matrix || base.ui_channel_matrix || [],
    frontend_architecture: frontend.frontend_architecture || base.frontend_architecture || {},
    design_system_strategy: design.design_system_strategy || base.design_system_strategy || {},
    checkout_experience_resilience: checkout.checkout_experience_resilience || base.checkout_experience_resilience || {},
    ui_auth_session_controls: authSession.ui_auth_session_controls || base.ui_auth_session_controls || [],
    ui_performance_delivery: performance.ui_performance_delivery || base.ui_performance_delivery || [],
    ui_observability: observability.ui_observability || base.ui_observability || [],
    ui_accessibility_internationalization: design.ui_accessibility_internationalization || base.ui_accessibility_internationalization || [],
    ui_evidence_status: evidenceStatus,
    ui_validation_gates: validationGates,
    ui_qualification: qualification,
    ui_policy_citations: knowledge.citations || [],
    ui_evidence_pack: evidencePack.evidence_pack,
    ui_signal_profile: {
      domains: signalProfile.domains || [],
      confidence_summary: signalProfile.confidence_summary || {},
      error_modes: signalProfile.error_modes || {},
    },
    risks,
    evidence_status: {
      ...(base.statePatch?.evidence_status || {}),
      ui: 'assumption_or_partial',
    },
    cost_drivers: mergeArrayFields(base.statePatch?.cost_drivers, [
      'UI cost drivers: CDN traffic, image transformation/storage, RUM/session replay events, frontend observability retention, experimentation/feature-flag tooling, third-party scripts, accessibility testing, device/browser testing, support/admin seats, non-prod parity, and synthetic monitoring.',
    ]),
    human_validation_needed: mergeArrayFields(base.statePatch?.human_validation_needed, fullValidationNeeded),
    validation_gaps: mergeArrayFields(base.statePatch?.validation_gaps, fullValidationNeeded.map(item => `UI validation required: ${item}`)),
    retrieval_requests: mergeArrayFields(base.statePatch?.retrieval_requests, state.retrievalPlan),
    ui_tool_context: {
      handoff,
      frontend,
      checkout,
      design,
      auth_session: authSession,
      performance,
      observability,
      ui_knowledge: knowledge,
      ui_signal_profile: signalProfile,
      evidence_pack: evidencePack,
    },
  };
  return {
    augmentedReview: {
      ...base,
      status: 'completed_with_tools',
      summary: 'UI Agent completed tool-assisted review using upstream constraints, storefront/mobile/admin channels, checkout resilience, design-system/accessibility, auth/session, performance delivery, observability/release controls, and local UI knowledge.',
      findings,
      ui_recommendation: statePatch.ui_recommendation,
      ui_handoff_summary: statePatch.ui_handoff_summary,
      ui_channel_matrix: statePatch.ui_channel_matrix,
      frontend_architecture: statePatch.frontend_architecture,
      design_system_strategy: statePatch.design_system_strategy,
      checkout_experience_resilience: statePatch.checkout_experience_resilience,
      ui_auth_session_controls: statePatch.ui_auth_session_controls,
      ui_performance_delivery: statePatch.ui_performance_delivery,
      ui_observability: statePatch.ui_observability,
      ui_accessibility_internationalization: statePatch.ui_accessibility_internationalization,
      ui_evidence_status: evidenceStatus,
      ui_validation_gates: validationGates,
      ui_qualification: qualification,
      ui_policy_citations: knowledge.citations || [],
      ui_evidence_pack: evidencePack.evidence_pack,
      ui_signal_profile: statePatch.ui_signal_profile,
      risks,
      validation_needed: fullValidationNeeded,
      retrieval_requests: state.retrievalPlan,
      ui_tool_results: statePatch.ui_tool_context,
      statePatch,
    },
    trace: [trace('augment_ui_review', `Augmented UI review with ${compactToolResults(state).length} tool result(s).`)],
  };
}

function shouldRunModel(state) {
  return state.useModel ? 'model_judgement' : 'validate_ui_output';
}

async function runUiModelJudgement(state) {
  const modelReview = await runUiAgent({
    query: state.query,
    mode: state.mode,
    useModel: true,
    context: state.context,
    state: {
      ...state.architectureState,
      ui_tool_context: state.augmentedReview?.ui_tool_results,
      ui_signal_profile: state.augmentedReview?.ui_signal_profile,
      ui_qualification: state.augmentedReview?.ui_qualification,
      ui_policy_citations: state.augmentedReview?.ui_policy_citations,
      ui_evidence_pack: state.augmentedReview?.ui_evidence_pack,
    },
    retrievedContext: state.retrievedContext,
  });
  const usedModel = Boolean(modelReview?.model_review?.enabled);
  return {
    modelReview: usedModel ? enrichCandidateWithTools(modelReview, state) : null,
    trace: [trace('ui_model_judgement', usedModel ? modelReview.model_review?.error ? 'Model judgement failed; tool-assisted output retained.' : `Model judgement completed with ${modelReview.model_review?.model || 'configured model'}.` : 'Model judgement skipped because no model provider was available.')],
  };
}

function enrichCandidateWithTools(candidate, state) {
  const toolReview = state.augmentedReview || {};
  return {
    ...candidate,
    findings: mergeArrayFields(candidate.findings, toolReview.findings),
    ui_recommendation: mergeArrayFields(candidate.ui_recommendation, toolReview.ui_recommendation),
    ui_handoff_summary: toolReview.ui_handoff_summary || candidate.ui_handoff_summary,
    ui_channel_matrix: mergeArrayFields(candidate.ui_channel_matrix, toolReview.ui_channel_matrix),
    frontend_architecture: toolReview.frontend_architecture || candidate.frontend_architecture,
    design_system_strategy: toolReview.design_system_strategy || candidate.design_system_strategy,
    checkout_experience_resilience: toolReview.checkout_experience_resilience || candidate.checkout_experience_resilience,
    ui_auth_session_controls: mergeArrayFields(candidate.ui_auth_session_controls, toolReview.ui_auth_session_controls),
    ui_performance_delivery: mergeArrayFields(candidate.ui_performance_delivery, toolReview.ui_performance_delivery),
    ui_observability: mergeArrayFields(candidate.ui_observability, toolReview.ui_observability),
    ui_accessibility_internationalization: mergeArrayFields(candidate.ui_accessibility_internationalization, toolReview.ui_accessibility_internationalization),
    ui_evidence_status: toolReview.ui_evidence_status || candidate.ui_evidence_status,
    ui_validation_gates: mergeArrayFields(candidate.ui_validation_gates, toolReview.ui_validation_gates),
    ui_qualification: toolReview.ui_qualification || candidate.ui_qualification,
    ui_policy_citations: mergeArrayFields(candidate.ui_policy_citations, toolReview.ui_policy_citations),
    ui_evidence_pack: toolReview.ui_evidence_pack || candidate.ui_evidence_pack,
    ui_signal_profile: toolReview.ui_signal_profile || candidate.ui_signal_profile,
    risks: mergeArrayFields(candidate.risks, toolReview.risks),
    validation_needed: mergeArrayFields(candidate.validation_needed, toolReview.validation_needed),
    retrieval_requests: mergeArrayFields(candidate.retrieval_requests, state.retrievalPlan),
    ui_tool_results: toolReview.ui_tool_results,
    statePatch: {
      ...(candidate.statePatch || {}),
      ...toolReview.statePatch,
      ui_controls: mergeArrayFields(candidate.statePatch?.ui_controls, toolReview.findings),
      risks: mergeArrayFields(candidate.statePatch?.risks, toolReview.risks),
      human_validation_needed: mergeArrayFields(candidate.statePatch?.human_validation_needed, toolReview.validation_needed),
      validation_gaps: mergeArrayFields(candidate.statePatch?.validation_gaps, toolReview.statePatch?.validation_gaps),
      retrieval_requests: mergeArrayFields(candidate.statePatch?.retrieval_requests, state.retrievalPlan),
      ui_tool_context: toolReview.ui_tool_results,
    },
  };
}

async function validateUiOutput(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const validation = await uiTools.validateUiOutputTool.invoke({
    ...toolInput(state),
    output: candidate,
    toolResults: compactToolResults(state),
  });
  return {
    validation,
    trace: [trace('validate_ui_output', `UI validation returned ${validation.verdict}.`, { blockers: validation.blockers?.length || 0, warnings: validation.warnings?.length || 0 })],
  };
}

function shouldRecommendUiReview(state) {
  return state.validation?.verdict === 'pass' ? 'finalize_ui_output' : 'recommend_ui_review_actions';
}

async function recommendUiReviewActions(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const notes = [
    ...(state.validation?.blockers || []).map(item => `UI blocker: ${item}`),
    ...(state.validation?.warnings || []).map(item => `UI warning: ${item}`),
  ];
  return {
    remediation: {
      ...candidate,
      status: candidate?.status === 'completed_with_model' ? 'completed_with_model_and_ui_review_recommendations' : 'completed_with_ui_review_recommendations',
      validation_needed: mergeArrayFields(candidate?.validation_needed, notes),
      statePatch: {
        ...(candidate?.statePatch || {}),
        human_validation_needed: mergeArrayFields(candidate?.statePatch?.human_validation_needed, notes),
        validation_gaps: mergeArrayFields(candidate?.statePatch?.validation_gaps, notes),
      },
      ui_review_recommendation: {
        reason: state.validation?.verdict,
        blockers: state.validation?.blockers || [],
        warnings: state.validation?.warnings || [],
        action: 'Output remains a UI review draft until UI, API, AI, security, compliance, infrastructure, technology, storage, and FinOps owners validate evidence.',
      },
    },
    trace: [trace('recommend_ui_review_actions', `Added ${notes.length} UI review recommendation note(s).`)],
  };
}

async function finalizeUiOutput(state) {
  const selected = state.remediation || state.modelReview || state.augmentedReview || state.deterministicReview;
  const usedModel = Boolean(selected?.model_review?.enabled && !selected?.model_review?.error);
  return {
    output: {
      ...selected,
      status: selected?.model_review?.error ? 'completed_with_fallback' : selected?.ui_review_recommendation ? selected.status : usedModel ? 'completed_with_model' : selected?.status || 'completed_with_tools',
      graph_agent: {
        framework: 'langgraph',
        graph: 'ui_agent_graph',
        agent_type: 'tool_using_ui_agent',
        nodes: state.trace.map(item => item.node),
        tools: [
          'inspectUiHandoffTool',
          'designFrontendArchitectureTool',
          'planCheckoutExperienceTool',
          'planDesignSystemAccessibilityTool',
          'planUiAuthSessionTool',
          'planUiPerformanceDeliveryTool',
          'planUiObservabilityTool',
          'retrieveUiKnowledgeTool',
          'validateUiOutputTool',
        ],
        retrieval_plan: state.retrievalPlan,
        retrieved_docs: state.uiKnowledge?.docs || [],
        validation: state.validation,
        trace: state.trace,
        upstream: state.handoff?.upstream || {},
        model_route: { requested: Boolean(state.useModel), used: usedModel, provider: selected?.model_review?.provider || (usedModel ? 'openai' : 'none'), model: selected?.model_review?.model || 'none' },
      },
      evidence: {
        ...selected?.evidence,
        graph_retrieval: state.evidence,
        local_ui_knowledge: state.uiKnowledge?.docs || [],
        ui_policy_citations: selected?.ui_policy_citations || [],
        ui_evidence_pack: selected?.ui_evidence_pack || {},
        ui_signal_profile: selected?.ui_signal_profile || {},
        ui_tool_results: selected?.ui_tool_results,
      },
    },
    trace: [trace('finalize_ui_output', 'Finalized tool-using LangGraph UI Agent output.')],
  };
}

const uiAgentGraph = new StateGraph(UiGraphState)
  .addNode('prepare_ui_context', prepareUiContext)
  .addNode('inspect_ui_handoff', inspectUiHandoff)
  .addNode('design_frontend_architecture', designFrontend)
  .addNode('plan_checkout_experience', planCheckout)
  .addNode('plan_design_system_accessibility', planDesign)
  .addNode('plan_ui_auth_session', planAuthSession)
  .addNode('plan_ui_performance_delivery', planPerformance)
  .addNode('plan_ui_observability', planObservability)
  .addNode('plan_ui_retrieval', planUiRetrieval)
  .addNode('retrieve_ui_knowledge', retrieveUiKnowledge)
  .addNode('deterministic_ui_review', runDeterministicUiReview)
  .addNode('augment_ui_review', augmentUiReview)
  .addNode('model_judgement', runUiModelJudgement)
  .addNode('validate_ui_output', validateUiOutput)
  .addNode('recommend_ui_review_actions', recommendUiReviewActions)
  .addNode('finalize_ui_output', finalizeUiOutput)
  .addEdge(START, 'prepare_ui_context')
  .addEdge('prepare_ui_context', 'inspect_ui_handoff')
  .addEdge('inspect_ui_handoff', 'design_frontend_architecture')
  .addEdge('design_frontend_architecture', 'plan_checkout_experience')
  .addEdge('plan_checkout_experience', 'plan_design_system_accessibility')
  .addEdge('plan_design_system_accessibility', 'plan_ui_auth_session')
  .addEdge('plan_ui_auth_session', 'plan_ui_performance_delivery')
  .addEdge('plan_ui_performance_delivery', 'plan_ui_observability')
  .addEdge('plan_ui_observability', 'plan_ui_retrieval')
  .addEdge('plan_ui_retrieval', 'retrieve_ui_knowledge')
  .addEdge('retrieve_ui_knowledge', 'deterministic_ui_review')
  .addEdge('deterministic_ui_review', 'augment_ui_review')
  .addConditionalEdges('augment_ui_review', shouldRunModel, { model_judgement: 'model_judgement', validate_ui_output: 'validate_ui_output' })
  .addEdge('model_judgement', 'validate_ui_output')
  .addConditionalEdges('validate_ui_output', shouldRecommendUiReview, { recommend_ui_review_actions: 'recommend_ui_review_actions', finalize_ui_output: 'finalize_ui_output' })
  .addEdge('recommend_ui_review_actions', 'finalize_ui_output')
  .addEdge('finalize_ui_output', END)
  .compile();

async function runUiAgentGraph({ query, mode, useModel, context, state, retrievedContext }) {
  const result = await uiAgentGraph.invoke({ query, mode, useModel, context, architectureState: state, retrievedContext });
  return result.output;
}

module.exports = {
  runUiAgentGraph,
  uiAgentGraph,
};
