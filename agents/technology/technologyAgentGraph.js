const { Annotation, END, START, StateGraph } = require('@langchain/langgraph');
const { runTechnologyAgent } = require('./technologyAgent');
const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeUnique } = require('../schema');
const { technologyTools } = require('./technologyTools');
const { classifyTechnologySignals } = require('./technologySignalClassifier');

const TechnologyGraphState = Annotation.Root({
  query: Annotation({ reducer: (_current, update) => update, default: () => '' }),
  mode: Annotation({ reducer: (_current, update) => update, default: () => 'architecture-review' }),
  useModel: Annotation({ reducer: (_current, update) => update, default: () => true }),
  context: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  architectureState: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  retrievedContext: Annotation({ reducer: (_current, update) => update, default: () => [] }),
  signals: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  technologySignalProfile: Annotation({ reducer: (_current, update) => update, default: () => null }),
  handoff: Annotation({ reducer: (_current, update) => update, default: () => null }),
  decomposition: Annotation({ reducer: (_current, update) => update, default: () => null }),
  specialistHandoff: Annotation({ reducer: (_current, update) => update, default: () => null }),
  provisionalDirection: Annotation({ reducer: (_current, update) => update, default: () => null }),
  nfrCoverage: Annotation({ reducer: (_current, update) => update, default: () => null }),
  technologyKnowledge: Annotation({ reducer: (_current, update) => update, default: () => null }),
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
    state.technologySignalProfile,
    state.handoff,
    state.decomposition,
    state.specialistHandoff,
    state.provisionalDirection,
    state.nfrCoverage,
    state.technologyKnowledge,
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

async function prepareTechnologyContext(state) {
  const signals = getRetailSignals({ query: state.query, context: state.context, state: state.architectureState });
  const technologySignalProfile = classifyTechnologySignals({
    query: state.query,
    context: state.context,
    state: state.architectureState,
    signals,
  });
  return {
    signals,
    technologySignalProfile,
    trace: [trace('prepare_technology_context', `Detected ${signals.workloadTypes.length || 0} workload signal(s) and ${technologySignalProfile.domains.length} technology domain signal(s).`)],
  };
}

async function inspectTechnologyHandoff(state) {
  const handoff = await technologyTools.inspectTechnologyHandoffTool.invoke(toolInput(state));
  return {
    handoff,
    trace: [trace('inspect_technology_handoff', `Security=${handoff.upstream?.security ? 'yes' : 'no'}, Compliance=${handoff.upstream?.compliance ? 'yes' : 'no'}, Governance=${handoff.upstream?.governance ? 'yes' : 'no'}, Infrastructure=${handoff.upstream?.infrastructure ? 'yes' : 'no'}, FinOps=${handoff.upstream?.finops ? 'yes' : 'no'}.`)],
  };
}

async function decomposeTechnology(state) {
  const decomposition = await technologyTools.decomposeTechnologyDomainsTool.invoke(toolInput(state));
  return {
    decomposition,
    trace: [trace('decompose_technology_domains', `Created ${decomposition.technology_domains?.length || 0} specialist technology domain(s).`)],
  };
}

async function planSpecialistHandoff(state) {
  const specialistHandoff = await technologyTools.planSpecialistHandoffTool.invoke(toolInput(state));
  return {
    specialistHandoff,
    trace: [trace('plan_specialist_handoff', `Planned ${specialistHandoff.specialist_handoff_matrix?.length || 0} specialist handoff(s).`)],
  };
}

async function draftProvisionalDirection(state) {
  const provisionalDirection = await technologyTools.draftProvisionalTechnologyDirectionTool.invoke(toolInput(state));
  return {
    provisionalDirection,
    trace: [trace('draft_provisional_technology_direction', 'Drafted provisional API, Storage, AI, and UI technology direction.')],
  };
}

async function assessNfrCoverage(state) {
  const nfrCoverage = await technologyTools.assessTechnologyNfrCoverageTool.invoke(toolInput(state));
  return {
    nfrCoverage,
    trace: [trace('assess_technology_nfr_coverage', `Built ${nfrCoverage.nfr_controls?.length || 0} technology NFR control(s).`)],
  };
}

async function planTechnologyRetrieval(state) {
  const plan = [
    'retail-technology-decomposition-playbook',
    'retail-api-integration-contract-template',
    'retail-storage-data-platform-template',
    'retail-cross-cutting-technology-nfr-template',
  ];
  if (state.signals.retailAi) plan.push('retail-ai-technology-template');
  if (state.signals.storeEdge || state.signals.commerce) plan.push('retail-ui-experience-template');
  for (const hint of state.technologySignalProfile?.retrieval_hints || []) plan.push(hint);
  return {
    retrievalPlan: [...new Set(plan)],
    evidence: retailEvidence(state.retrievedContext),
    trace: [trace('plan_technology_retrieval', `Planned ${plan.length} technology retrieval request(s).`)],
  };
}

async function retrieveTechnologyKnowledge(state) {
  const technologyKnowledge = await technologyTools.retrieveTechnologyKnowledgeTool.invoke({
    ...toolInput(state),
    retrievalPlan: state.retrievalPlan,
    limit: 7,
  });
  return {
    technologyKnowledge,
    trace: [trace('retrieve_technology_knowledge', `Retrieved ${technologyKnowledge.docs?.length || 0} local technology knowledge document(s).`)],
  };
}

async function runDeterministicTechnologyReview(state) {
  const deterministicReview = await runTechnologyAgent({
    query: state.query,
    mode: state.mode,
    useModel: false,
    context: state.context,
    state: state.architectureState,
    retrievedContext: state.retrievedContext,
  });
  return {
    deterministicReview,
    trace: [trace('deterministic_technology_review', `Produced ${deterministicReview.findings?.length || 0} deterministic technology control(s).`)],
  };
}

function inferTechnologyOwner(item) {
  const text = String(item || '').toLowerCase();
  if (/api|contract|integration|event|replay|dlq|schema|gateway/.test(text)) return 'API/integration owner';
  if (/storage|database|cache|search|backup|restore|source of truth|data/.test(text)) return 'Storage/data owner';
  if (/ai|rag|llm|embedding|vector|rerank|model/.test(text)) return 'AI platform owner';
  if (/ui|frontend|storefront|admin|mobile|pos|accessibility/.test(text)) return 'UI/channel owner';
  if (/security|compliance|residency|privacy|pci/.test(text)) return 'Security/compliance owner';
  if (/cost|pricing|budget|finops/.test(text)) return 'FinOps owner';
  if (/runtime|network|infrastructure|observability|release/.test(text)) return 'Infrastructure/platform owner';
  return 'Technology architecture owner';
}

function buildTechnologyEvidencePack({ handoff = {}, decomposition = {}, specialistHandoff = {}, provisionalDirection = {}, nfrCoverage = {}, knowledge = {}, signalProfile = {}, evidenceStatus = {}, validationGates = [], qualification = {} }) {
  return {
    evidence_pack: {
      policy_sources: knowledge.docs || [],
      policy_inventory: knowledge.policy_inventory || [],
      citations: knowledge.citations || [],
      evidence_status: evidenceStatus,
      technology_qualification: qualification,
      upstream_handoff_summary: handoff.upstream || {},
      specialist_evidence_needed: (specialistHandoff.specialist_handoff_matrix || []).map(item => ({
        agent: item.agent,
        priority: item.priority,
        inputs_needed: item.inputs_needed || [],
        expected_output: item.expected_output,
        status: 'requires specialist validation',
      })),
      technology_decision_evidence_needed: [
        ...(decomposition.technology_domains || []).map(item => ({
          domain: item.domain,
          owner: item.owner,
          scope: item.scope,
          status: item.evidence_status || 'assumption',
          evidence_needed: 'Specialist ADR, owner approval, NFR mapping, rejected alternatives, data-flow evidence, operational evidence, and acceptance tests.',
        })),
      ],
      provisional_direction: {
        api: provisionalDirection.api_technology || {},
        storage: provisionalDirection.storage_technology || {},
        ai: provisionalDirection.ai_technology || {},
        ui: provisionalDirection.ui_technology || {},
      },
      nfr_evidence_needed: (nfrCoverage.nfr_controls || []).map(item => ({
        control: item,
        evidence_needed: 'Measurable target, owner, test plan, operational dashboard, rollback/degradation behavior, and approval evidence.',
        status: 'assumption',
      })),
      approval_workflow: [
        'Technology architecture owner validates decomposition, specialist handoffs, decision records, rejected alternatives, and final synthesis criteria.',
        'API owner validates service contracts, gateway, orchestration, integration, idempotency, replay, DLQs, and reconciliation.',
        'Storage owner validates systems of record, data truth, consistency, cache/search/read models, backup/restore, retention, and rebuild.',
        'AI owner validates model routing, RAG, vector DB, embeddings, reranking, evals, fallback, telemetry, privacy, and cost controls where AI is in scope.',
        'UI owner validates storefront/admin/mobile/POS channel architecture, performance, accessibility, telemetry, feature flags, and rollback.',
        'Security, Compliance, Governance, Infrastructure, and FinOps owners validate their constraints are preserved by technology choices.',
      ],
      client_questions: [
        'Which API, Storage, AI, and UI domains are in scope for this architecture phase?',
        'What are the systems of record, service boundaries, data flows, integration partners, and third-party SLAs?',
        'Which technology NFRs are mandatory: latency, availability, consistency, privacy, residency, observability, cost, deployment, rollback, and support?',
        'Which technology choices are fixed by client standards and which can be recommended by ArchitectIQ?',
        'What evidence must be collected before final architecture diagram generation?',
      ],
      review_limitations: [
        'Technology output is a specialist-handoff and provisional technology draft, not final API, Storage, AI, or UI approval.',
        'Final architecture diagram should remain blocked until API, Storage, AI, and UI specialist outputs are available or explicitly waived by named owners.',
      ],
      validation_gates: validationGates,
      signal_profile: {
        domains: signalProfile.domains || [],
        confidence_summary: signalProfile.confidence_summary || {},
        error_modes: signalProfile.error_modes || {},
      },
    },
    validation_needed: [
      'Collect owner-approved Technology evidence pack before marking API, Storage, AI, UI, or cross-cutting technology decisions as verified.',
    ],
  };
}

function augmentTechnologyReview(state) {
  const base = state.deterministicReview || {};
  const handoff = state.handoff || {};
  const decomposition = state.decomposition || {};
  const specialistHandoff = state.specialistHandoff || {};
  const provisionalDirection = state.provisionalDirection || {};
  const nfrCoverage = state.nfrCoverage || {};
  const knowledge = state.technologyKnowledge || {};
  const signalProfile = state.technologySignalProfile || {};
  const findings = mergeArrayFields(base.findings, knowledge.controls, handoff.controls, decomposition.controls, specialistHandoff.controls, provisionalDirection.controls, nfrCoverage.controls);
  const risks = mergeArrayFields(base.risks, knowledge.risks, provisionalDirection.risks);
  const validationNeeded = mergeArrayFields(base.validation_needed, knowledge.validation_needed, handoff.validation_needed, decomposition.validation_needed, specialistHandoff.validation_needed, provisionalDirection.validation_needed, nfrCoverage.validation_needed);
  const evidenceStatus = {
    technology: 'assumption',
    api: 'assumption',
    storage: 'assumption',
    ai: state.signals.retailAi ? 'assumption' : 'conditional',
    ui: 'assumption',
    security_handoff: handoff.upstream?.security ? 'partial' : 'missing',
    compliance_handoff: handoff.upstream?.compliance ? 'partial' : 'missing',
    governance_handoff: handoff.upstream?.governance ? 'partial' : 'missing',
    infrastructure_handoff: handoff.upstream?.infrastructure ? 'partial' : 'missing',
    finops_handoff: handoff.upstream?.finops ? 'partial' : 'not_yet_available_or_optional',
  };
  const validationGates = validationNeeded.map(item => ({
    gate: item,
    owner: inferTechnologyOwner(item),
    status: 'requires human validation',
  }));
  const qualification = {
    status: 'draft_requires_specialist_agent_review',
    statement: 'This Technology output is a specialist-handoff and provisional technology draft. It is not final API, Storage, AI, UI, platform, security, compliance, governance, or budget approval.',
    evidence_status: 'assumption_or_partial_until_api_storage_ai_ui_and_upstream_owners_validate_evidence',
    required_reviewers: ['Technology architecture owner', 'API owner', 'Storage/data owner', 'AI platform owner where in scope', 'UI/channel owner', 'Security owner', 'Compliance/privacy owner', 'Infrastructure/platform owner', 'FinOps owner'],
  };
  const evidencePack = buildTechnologyEvidencePack({
    handoff,
    decomposition,
    specialistHandoff,
    provisionalDirection,
    nfrCoverage,
    knowledge,
    signalProfile,
    evidenceStatus,
    validationGates,
    qualification,
  });
  const fullValidationNeeded = mergeArrayFields(validationNeeded, evidencePack.validation_needed);
  const technologyDomains = decomposition.technology_domains || base.technology_domains || [];
  const specialistMatrix = specialistHandoff.specialist_handoff_matrix || base.specialist_handoff_matrix || [];
  const technologyRecommendation = mergeArrayFields(
    'Keep technology recommendation draft-level until API, Storage, AI, and UI specialist agents validate domain decisions, NFR evidence, and upstream constraints.',
    findings.slice(0, 8)
  );
  const statePatch = {
    ...(base.statePatch || {}),
    technology_controls: findings,
    technology_recommendation: technologyRecommendation,
    technology_handoff_summary: handoff.upstream || {},
    technology_domains: technologyDomains,
    specialist_handoff_matrix: specialistMatrix,
    api_technology: provisionalDirection.api_technology || base.api_technology || {},
    storage_technology: provisionalDirection.storage_technology || base.storage_technology || {},
    ai_technology: provisionalDirection.ai_technology || base.ai_technology || {},
    ui_technology: provisionalDirection.ui_technology || base.ui_technology || {},
    technology_nfr_coverage: nfrCoverage.nfr_controls || [],
    technology_evidence_status: evidenceStatus,
    technology_validation_gates: validationGates,
    technology_qualification: qualification,
    technology_policy_citations: knowledge.citations || [],
    technology_evidence_pack: evidencePack.evidence_pack,
    technology_signal_profile: {
      domains: signalProfile.domains || [],
      confidence_summary: signalProfile.confidence_summary || {},
      error_modes: signalProfile.error_modes || {},
    },
    risks,
    evidence_status: {
      ...(base.statePatch?.evidence_status || {}),
      technology: 'assumption_or_partial',
    },
    nfr_coverage: mergeArrayFields(base.statePatch?.nfr_coverage, (nfrCoverage.nfr_controls || []).map(item => ({
      nfr: 'Technology NFR coverage',
      target: item,
      mechanism: 'Specialist API/Storage/AI/UI validation and acceptance tests.',
      validation_needed: 'Confirm measurable target, owner, test evidence, and rollback/degradation behavior.',
    }))),
    human_validation_needed: mergeArrayFields(base.statePatch?.human_validation_needed, fullValidationNeeded),
    validation_gaps: mergeArrayFields(base.statePatch?.validation_gaps, fullValidationNeeded.map(item => `Technology validation required: ${item}`)),
    retrieval_requests: mergeArrayFields(base.statePatch?.retrieval_requests, state.retrievalPlan),
    technology_tool_context: {
      handoff,
      decomposition,
      specialist_handoff: specialistHandoff,
      provisional_direction: provisionalDirection,
      nfr_coverage: nfrCoverage,
      technology_knowledge: knowledge,
      technology_signal_profile: signalProfile,
      evidence_pack: evidencePack,
    },
  };
  return {
    augmentedReview: {
      ...base,
      status: 'completed_with_tools',
      summary: 'Technology Agent completed tool-assisted review using upstream constraints, API/Storage/AI/UI decomposition, specialist handoff, provisional domain direction, NFR coverage, and local technology knowledge.',
      findings,
      technology_recommendation: statePatch.technology_recommendation,
      technology_handoff_summary: statePatch.technology_handoff_summary,
      technology_domains: statePatch.technology_domains,
      specialist_handoff_matrix: statePatch.specialist_handoff_matrix,
      api_technology: statePatch.api_technology,
      storage_technology: statePatch.storage_technology,
      ai_technology: statePatch.ai_technology,
      ui_technology: statePatch.ui_technology,
      technology_nfr_coverage: statePatch.technology_nfr_coverage,
      technology_evidence_status: evidenceStatus,
      technology_validation_gates: validationGates,
      technology_qualification: qualification,
      technology_policy_citations: knowledge.citations || [],
      technology_evidence_pack: evidencePack.evidence_pack,
      technology_signal_profile: statePatch.technology_signal_profile,
      risks,
      validation_needed: fullValidationNeeded,
      retrieval_requests: state.retrievalPlan,
      technology_tool_results: statePatch.technology_tool_context,
      statePatch,
    },
    trace: [trace('augment_technology_review', `Augmented Technology review with ${compactToolResults(state).length} tool result(s).`)],
  };
}

function shouldRunModel(state) {
  return state.useModel ? 'model_judgement' : 'validate_technology_output';
}

async function runTechnologyModelJudgement(state) {
  const modelReview = await runTechnologyAgent({
    query: state.query,
    mode: state.mode,
    useModel: true,
    context: state.context,
    state: {
      ...state.architectureState,
      technology_tool_context: state.augmentedReview?.technology_tool_results,
      technology_signal_profile: state.augmentedReview?.technology_signal_profile,
      technology_qualification: state.augmentedReview?.technology_qualification,
      technology_policy_citations: state.augmentedReview?.technology_policy_citations,
      technology_evidence_pack: state.augmentedReview?.technology_evidence_pack,
    },
    retrievedContext: state.retrievedContext,
  });
  const usedModel = Boolean(modelReview?.model_review?.enabled);
  return {
    modelReview: usedModel ? enrichCandidateWithTools(modelReview, state) : null,
    trace: [trace('technology_model_judgement', usedModel ? modelReview.model_review?.error ? 'Model judgement failed; tool-assisted output retained.' : `Model judgement completed with ${modelReview.model_review?.model || 'configured model'}.` : 'Model judgement skipped because no model provider was available.')],
  };
}

function enrichCandidateWithTools(candidate, state) {
  const toolReview = state.augmentedReview || {};
  return {
    ...candidate,
    findings: mergeArrayFields(candidate.findings, toolReview.findings),
    technology_recommendation: mergeArrayFields(candidate.technology_recommendation, toolReview.technology_recommendation),
    technology_handoff_summary: toolReview.technology_handoff_summary || candidate.technology_handoff_summary,
    technology_domains: mergeArrayFields(candidate.technology_domains, toolReview.technology_domains),
    specialist_handoff_matrix: mergeArrayFields(candidate.specialist_handoff_matrix, toolReview.specialist_handoff_matrix),
    api_technology: toolReview.api_technology || candidate.api_technology,
    storage_technology: toolReview.storage_technology || candidate.storage_technology,
    ai_technology: toolReview.ai_technology || candidate.ai_technology,
    ui_technology: toolReview.ui_technology || candidate.ui_technology,
    technology_nfr_coverage: mergeArrayFields(candidate.technology_nfr_coverage, toolReview.technology_nfr_coverage),
    technology_evidence_status: toolReview.technology_evidence_status || candidate.technology_evidence_status,
    technology_validation_gates: mergeArrayFields(candidate.technology_validation_gates, toolReview.technology_validation_gates),
    technology_qualification: toolReview.technology_qualification || candidate.technology_qualification,
    technology_policy_citations: mergeArrayFields(candidate.technology_policy_citations, toolReview.technology_policy_citations),
    technology_evidence_pack: toolReview.technology_evidence_pack || candidate.technology_evidence_pack,
    technology_signal_profile: toolReview.technology_signal_profile || candidate.technology_signal_profile,
    risks: mergeArrayFields(candidate.risks, toolReview.risks),
    validation_needed: mergeArrayFields(candidate.validation_needed, toolReview.validation_needed),
    retrieval_requests: mergeArrayFields(candidate.retrieval_requests, state.retrievalPlan),
    technology_tool_results: toolReview.technology_tool_results,
    statePatch: {
      ...(candidate.statePatch || {}),
      ...toolReview.statePatch,
      technology_controls: mergeArrayFields(candidate.statePatch?.technology_controls, toolReview.findings),
      risks: mergeArrayFields(candidate.statePatch?.risks, toolReview.risks),
      human_validation_needed: mergeArrayFields(candidate.statePatch?.human_validation_needed, toolReview.validation_needed),
      validation_gaps: mergeArrayFields(candidate.statePatch?.validation_gaps, toolReview.statePatch?.validation_gaps),
      retrieval_requests: mergeArrayFields(candidate.statePatch?.retrieval_requests, state.retrievalPlan),
      technology_tool_context: toolReview.technology_tool_results,
    },
  };
}

async function validateTechnologyOutput(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const validation = await technologyTools.validateTechnologyOutputTool.invoke({
    ...toolInput(state),
    output: candidate,
    toolResults: compactToolResults(state),
  });
  return {
    validation,
    trace: [trace('validate_technology_output', `Technology validation returned ${validation.verdict}.`, { blockers: validation.blockers?.length || 0, warnings: validation.warnings?.length || 0 })],
  };
}

function shouldRecommendTechnologyReview(state) {
  return state.validation?.verdict === 'pass' ? 'finalize_technology_output' : 'recommend_technology_review_actions';
}

async function recommendTechnologyReviewActions(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const notes = [
    ...(state.validation?.blockers || []).map(item => `Technology blocker: ${item}`),
    ...(state.validation?.warnings || []).map(item => `Technology warning: ${item}`),
  ];
  return {
    remediation: {
      ...candidate,
      status: candidate?.status === 'completed_with_model' ? 'completed_with_model_and_technology_review_recommendations' : 'completed_with_technology_review_recommendations',
      validation_needed: mergeArrayFields(candidate?.validation_needed, notes),
      statePatch: {
        ...(candidate?.statePatch || {}),
        human_validation_needed: mergeArrayFields(candidate?.statePatch?.human_validation_needed, notes),
        validation_gaps: mergeArrayFields(candidate?.statePatch?.validation_gaps, notes),
      },
      technology_review_recommendation: {
        reason: state.validation?.verdict,
        blockers: state.validation?.blockers || [],
        warnings: state.validation?.warnings || [],
        action: 'Output remains a Technology review draft until API, Storage, AI, UI, and upstream owners validate specialist evidence and NFRs.',
      },
    },
    trace: [trace('recommend_technology_review_actions', `Added ${notes.length} Technology review recommendation note(s).`)],
  };
}

async function finalizeTechnologyOutput(state) {
  const selected = state.remediation || state.modelReview || state.augmentedReview || state.deterministicReview;
  const usedModel = Boolean(selected?.model_review?.enabled && !selected?.model_review?.error);
  return {
    output: {
      ...selected,
      status: selected?.model_review?.error ? 'completed_with_fallback' : selected?.technology_review_recommendation ? selected.status : usedModel ? 'completed_with_model' : selected?.status || 'completed_with_tools',
      graph_agent: {
        framework: 'langgraph',
        graph: 'technology_agent_graph',
        agent_type: 'tool_using_technology_agent',
        nodes: state.trace.map(item => item.node),
        tools: [
          'inspectTechnologyHandoffTool',
          'decomposeTechnologyDomainsTool',
          'planSpecialistHandoffTool',
          'draftProvisionalTechnologyDirectionTool',
          'assessTechnologyNfrCoverageTool',
          'retrieveTechnologyKnowledgeTool',
          'validateTechnologyOutputTool',
        ],
        retrieval_plan: state.retrievalPlan,
        retrieved_docs: state.technologyKnowledge?.docs || [],
        validation: state.validation,
        trace: state.trace,
        upstream: state.handoff?.upstream || {},
        model_route: { requested: Boolean(state.useModel), used: usedModel, provider: selected?.model_review?.provider || (usedModel ? 'openai' : 'none'), model: selected?.model_review?.model || 'none' },
      },
      evidence: {
        ...selected?.evidence,
        graph_retrieval: state.evidence,
        local_technology_knowledge: state.technologyKnowledge?.docs || [],
        technology_policy_citations: selected?.technology_policy_citations || [],
        technology_evidence_pack: selected?.technology_evidence_pack || {},
        technology_signal_profile: selected?.technology_signal_profile || {},
        technology_tool_results: selected?.technology_tool_results,
      },
    },
    trace: [trace('finalize_technology_output', 'Finalized tool-using LangGraph Technology Agent output.')],
  };
}

const technologyAgentGraph = new StateGraph(TechnologyGraphState)
  .addNode('prepare_technology_context', prepareTechnologyContext)
  .addNode('inspect_technology_handoff', inspectTechnologyHandoff)
  .addNode('decompose_technology_domains', decomposeTechnology)
  .addNode('plan_specialist_handoff', planSpecialistHandoff)
  .addNode('draft_provisional_technology_direction', draftProvisionalDirection)
  .addNode('assess_technology_nfr_coverage', assessNfrCoverage)
  .addNode('plan_technology_retrieval', planTechnologyRetrieval)
  .addNode('retrieve_technology_knowledge', retrieveTechnologyKnowledge)
  .addNode('deterministic_technology_review', runDeterministicTechnologyReview)
  .addNode('augment_technology_review', augmentTechnologyReview)
  .addNode('model_judgement', runTechnologyModelJudgement)
  .addNode('validate_technology_output', validateTechnologyOutput)
  .addNode('recommend_technology_review_actions', recommendTechnologyReviewActions)
  .addNode('finalize_technology_output', finalizeTechnologyOutput)
  .addEdge(START, 'prepare_technology_context')
  .addEdge('prepare_technology_context', 'inspect_technology_handoff')
  .addEdge('inspect_technology_handoff', 'decompose_technology_domains')
  .addEdge('decompose_technology_domains', 'plan_specialist_handoff')
  .addEdge('plan_specialist_handoff', 'draft_provisional_technology_direction')
  .addEdge('draft_provisional_technology_direction', 'assess_technology_nfr_coverage')
  .addEdge('assess_technology_nfr_coverage', 'plan_technology_retrieval')
  .addEdge('plan_technology_retrieval', 'retrieve_technology_knowledge')
  .addEdge('retrieve_technology_knowledge', 'deterministic_technology_review')
  .addEdge('deterministic_technology_review', 'augment_technology_review')
  .addConditionalEdges('augment_technology_review', shouldRunModel, { model_judgement: 'model_judgement', validate_technology_output: 'validate_technology_output' })
  .addEdge('model_judgement', 'validate_technology_output')
  .addConditionalEdges('validate_technology_output', shouldRecommendTechnologyReview, { recommend_technology_review_actions: 'recommend_technology_review_actions', finalize_technology_output: 'finalize_technology_output' })
  .addEdge('recommend_technology_review_actions', 'finalize_technology_output')
  .addEdge('finalize_technology_output', END)
  .compile();

async function runTechnologyAgentGraph({ query, mode, useModel, context, state, retrievedContext }) {
  const result = await technologyAgentGraph.invoke({ query, mode, useModel, context, architectureState: state, retrievedContext });
  return result.output;
}

module.exports = {
  runTechnologyAgentGraph,
  technologyAgentGraph,
};
