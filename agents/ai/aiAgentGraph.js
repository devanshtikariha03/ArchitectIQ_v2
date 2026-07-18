const { Annotation, END, START, StateGraph } = require('@langchain/langgraph');
const { runAiAgent } = require('./aiAgent');
const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeUnique } = require('../schema');
const { aiTools } = require('./aiTools');
const { classifyAiSignals } = require('./aiSignalClassifier');

const AiGraphState = Annotation.Root({
  query: Annotation({ reducer: (_current, update) => update, default: () => '' }),
  mode: Annotation({ reducer: (_current, update) => update, default: () => 'architecture-review' }),
  useModel: Annotation({ reducer: (_current, update) => update, default: () => true }),
  context: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  architectureState: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  retrievedContext: Annotation({ reducer: (_current, update) => update, default: () => [] }),
  signals: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  aiSignalProfile: Annotation({ reducer: (_current, update) => update, default: () => null }),
  handoff: Annotation({ reducer: (_current, update) => update, default: () => null }),
  rag: Annotation({ reducer: (_current, update) => update, default: () => null }),
  modelRouting: Annotation({ reducer: (_current, update) => update, default: () => null }),
  vectorEmbedding: Annotation({ reducer: (_current, update) => update, default: () => null }),
  toolAccess: Annotation({ reducer: (_current, update) => update, default: () => null }),
  safetyEval: Annotation({ reducer: (_current, update) => update, default: () => null }),
  privacyCostOps: Annotation({ reducer: (_current, update) => update, default: () => null }),
  aiKnowledge: Annotation({ reducer: (_current, update) => update, default: () => null }),
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
    state.aiSignalProfile,
    state.handoff,
    state.rag,
    state.modelRouting,
    state.vectorEmbedding,
    state.toolAccess,
    state.safetyEval,
    state.privacyCostOps,
    state.aiKnowledge,
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

async function prepareAiContext(state) {
  const signals = getRetailSignals({ query: state.query, context: state.context, state: state.architectureState });
  const aiSignalProfile = classifyAiSignals({
    query: state.query,
    context: state.context,
    state: state.architectureState,
    signals,
  });
  return {
    signals,
    aiSignalProfile,
    trace: [trace('prepare_ai_context', `Detected ${signals.workloadTypes.length || 0} workload signal(s) and ${aiSignalProfile.domains.length} AI domain signal(s).`)],
  };
}

async function inspectAiHandoff(state) {
  const handoff = await aiTools.inspectAiHandoffTool.invoke(toolInput(state));
  return {
    handoff,
    trace: [trace('inspect_ai_handoff', `Storage=${handoff.upstream?.storage ? 'yes' : 'no'}, API=${handoff.upstream?.api ? 'yes' : 'no'}, Security=${handoff.upstream?.security ? 'yes' : 'no'}, Compliance=${handoff.upstream?.compliance ? 'yes' : 'no'}, FinOps=${handoff.upstream?.finops ? 'yes' : 'no'}.`)],
  };
}

async function designRag(state) {
  const rag = await aiTools.designRagArchitectureTool.invoke(toolInput(state));
  return { rag, trace: [trace('design_rag_architecture', 'Designed RAG/retrieval architecture controls.')] };
}

async function planModelRouting(state) {
  const modelRouting = await aiTools.planModelRoutingTool.invoke(toolInput(state));
  return { modelRouting, trace: [trace('plan_model_routing', 'Planned AI model routing strategy.')] };
}

async function designVectorEmbedding(state) {
  const vectorEmbedding = await aiTools.designVectorEmbeddingTool.invoke(toolInput(state));
  return { vectorEmbedding, trace: [trace('design_vector_embedding', 'Designed vector/embedding/reranking strategy.')] };
}

async function planToolAccess(state) {
  const toolAccess = await aiTools.planAiToolAccessTool.invoke(toolInput(state));
  return { toolAccess, trace: [trace('plan_ai_tool_access', `Planned ${toolAccess.ai_tool_api_controls?.length || 0} AI tool access control(s).`)] };
}

async function planSafetyEval(state) {
  const safetyEval = await aiTools.planAiSafetyEvalTool.invoke(toolInput(state));
  return { safetyEval, trace: [trace('plan_ai_safety_eval', `Planned ${safetyEval.ai_safety_evaluation?.length || 0} AI safety/eval control(s).`)] };
}

async function planPrivacyCostOps(state) {
  const privacyCostOps = await aiTools.planAiPrivacyCostOpsTool.invoke(toolInput(state));
  return { privacyCostOps, trace: [trace('plan_ai_privacy_cost_ops', 'Planned AI privacy/residency and cost/operations controls.')] };
}

async function planAiRetrieval(state) {
  const plan = [
    'retail-rag-retrieval-template',
    'retail-model-routing-template',
    'retail-vector-embedding-rerank-template',
    'retail-ai-tool-api-template',
    'retail-ai-safety-eval-template',
    'retail-ai-privacy-residency-template',
    'retail-ai-cost-operations-template',
  ];
  for (const hint of state.aiSignalProfile?.retrieval_hints || []) plan.push(hint);
  return {
    retrievalPlan: [...new Set(plan)],
    evidence: retailEvidence(state.retrievedContext),
    trace: [trace('plan_ai_retrieval', `Planned ${plan.length} AI retrieval request(s).`)],
  };
}

async function retrieveAiKnowledge(state) {
  const aiKnowledge = await aiTools.retrieveAiKnowledgeTool.invoke({
    ...toolInput(state),
    retrievalPlan: state.retrievalPlan,
    limit: 7,
  });
  return {
    aiKnowledge,
    trace: [trace('retrieve_ai_knowledge', `Retrieved ${aiKnowledge.docs?.length || 0} local AI knowledge document(s).`)],
  };
}

async function runDeterministicAiReview(state) {
  const deterministicReview = await runAiAgent({
    query: state.query,
    mode: state.mode,
    useModel: false,
    context: state.context,
    state: state.architectureState,
    retrievedContext: state.retrievedContext,
  });
  return {
    deterministicReview,
    trace: [trace('deterministic_ai_review', `Produced ${deterministicReview.findings?.length || 0} deterministic AI control(s).`)],
  };
}

function inferAiOwner(item) {
  const text = String(item || '').toLowerCase();
  if (/rag|retrieval|corpus|chunk|citation|metadata/.test(text)) return 'AI/RAG owner';
  if (/model|gpt|frontier|local|fine|latency|quality/.test(text)) return 'AI model owner';
  if (/vector|embedding|rerank|deletion|metadata schema/.test(text)) return 'AI storage/retrieval owner';
  if (/tool|api|scope|approval|audit|human escalation/.test(text)) return 'AI tool/API owner';
  if (/eval|hallucination|prompt injection|fallback|release/.test(text)) return 'AI safety/eval owner';
  if (/privacy|residency|telemetry|retention|processor|redaction/.test(text)) return 'Compliance/privacy owner';
  if (/token|cost|budget|finops|cache hit/.test(text)) return 'FinOps owner';
  return 'AI owner';
}

function buildAiEvidencePack({ handoff = {}, rag = {}, modelRouting = {}, vectorEmbedding = {}, toolAccess = {}, safetyEval = {}, privacyCostOps = {}, knowledge = {}, signalProfile = {}, evidenceStatus = {}, validationGates = [], qualification = {} }) {
  return {
    evidence_pack: {
      policy_sources: knowledge.docs || [],
      policy_inventory: knowledge.policy_inventory || [],
      citations: knowledge.citations || [],
      evidence_status: evidenceStatus,
      ai_qualification: qualification,
      upstream_handoff_summary: handoff.upstream || {},
      rag_evidence_needed: [{
        recommendation: rag.rag_architecture?.recommendation,
        corpus_scope: rag.rag_architecture?.corpus_scope,
        status: rag.rag_architecture?.evidence_status || 'assumption',
        evidence_needed: 'Corpus owner, data class, chunking, metadata filters, citations, freshness, deletion propagation, retrieval evals, and rebuild evidence.',
      }],
      model_evidence_needed: [{
        primary_route: modelRouting.model_routing_strategy?.primary_route,
        controlled_routes: modelRouting.model_routing_strategy?.controlled_routes || [],
        local_model_plan: modelRouting.model_routing_strategy?.local_model_plan,
        status: modelRouting.model_routing_strategy?.evidence_status || 'assumption',
        evidence_needed: 'Provider approval, data handling, residency, eval scores, latency, fallback, token budget, and model route owner.',
      }],
      vector_evidence_needed: [{
        vector_db: vectorEmbedding.vector_embedding_strategy?.vector_db,
        embedding_model: vectorEmbedding.vector_embedding_strategy?.embedding_model,
        reranking: vectorEmbedding.vector_embedding_strategy?.reranking,
        status: vectorEmbedding.vector_embedding_strategy?.evidence_status || 'assumption',
        evidence_needed: 'Vector DB, embedding dimensions/model, metadata schema, deletion process, reranker eval, query volume, latency, and cost.',
      }],
      tool_evidence_needed: (toolAccess.ai_tool_api_controls || []).map(control => ({
        control,
        evidence_needed: 'Tool list, API scopes, read/write split, approval gate, audit field, rate limit, fallback, rollback, and human escalation evidence.',
        status: 'assumption',
      })),
      safety_eval_evidence_needed: (safetyEval.ai_safety_evaluation || []).map(control => ({
        control,
        evidence_needed: 'Eval case, threshold, owner, result, regression gate, release approval, and fallback evidence.',
        status: 'assumption',
      })),
      privacy_cost_evidence_needed: [
        ...(privacyCostOps.ai_privacy_residency || []),
        ...(privacyCostOps.ai_cost_operations || []),
      ].map(control => ({
        control,
        evidence_needed: 'Data class, region, retention, deletion, telemetry/provider evidence, token/request volume, budget guardrail, alert, and owner approval.',
        status: 'assumption',
      })),
      approval_workflow: [
        'AI owner validates use cases, model route, RAG, vector/embedding/rerank, tool scope, evals, fallback, and release gate.',
        'Storage/data owner validates corpus, embeddings, vector stores, deletion, retention, rebuild, and derived-data controls.',
        'API owner validates AI tool APIs, scopes, read/write split, rate limits, audit, fallback, and escalation.',
        'Security/compliance owners validate prompt/tool data classes, privacy, residency, processor telemetry, redaction, and support access.',
        'Infrastructure/SRE owner validates AI runtime isolation, observability, latency, fallback, and operating model.',
        'FinOps owner validates token, embedding, vector, reranking, eval trace, hosting, and observability costs.',
      ],
      client_questions: [
        'Which AI use cases are in scope, and which actions are explicitly denied?',
        'What corpus/data can AI retrieve, and who owns data class, freshness, deletion, and citation evidence?',
        'What model route is approved for MVP and what future local/private model route is planned?',
        'Which API tools can AI call, with what scopes, rate limits, approvals, and audit fields?',
        'What token volume, retrieval volume, embedding volume, vector reads, reranker calls, eval traces, and fallback routes drive cost?',
      ],
      review_limitations: [
        'AI output is a specialist architecture draft, not model approval, privacy approval, production release approval, or accepted-risk record.',
        'Final architecture diagram should remain blocked until AI evidence is reconciled with Storage, API, Security, Compliance, Infrastructure, Technology, Governance, and FinOps constraints.',
      ],
      validation_gates: validationGates,
      signal_profile: {
        domains: signalProfile.domains || [],
        confidence_summary: signalProfile.confidence_summary || {},
        error_modes: signalProfile.error_modes || {},
      },
    },
    validation_needed: [
      'Collect owner-approved AI evidence pack before marking AI model, RAG, vector, tool, eval, privacy, or cost status as verified.',
    ],
  };
}

function augmentAiReview(state) {
  const base = state.deterministicReview || {};
  const handoff = state.handoff || {};
  const rag = state.rag || {};
  const modelRouting = state.modelRouting || {};
  const vectorEmbedding = state.vectorEmbedding || {};
  const toolAccess = state.toolAccess || {};
  const safetyEval = state.safetyEval || {};
  const privacyCostOps = state.privacyCostOps || {};
  const knowledge = state.aiKnowledge || {};
  const signalProfile = state.aiSignalProfile || {};
  const findings = mergeArrayFields(base.findings, knowledge.controls, handoff.controls, rag.controls, modelRouting.controls, vectorEmbedding.controls, toolAccess.controls, safetyEval.controls, privacyCostOps.controls);
  const risks = mergeArrayFields(base.risks, knowledge.risks, toolAccess.risks);
  const validationNeeded = mergeArrayFields(base.validation_needed, knowledge.validation_needed, handoff.validation_needed, rag.validation_needed, modelRouting.validation_needed, vectorEmbedding.validation_needed, toolAccess.validation_needed, safetyEval.validation_needed, privacyCostOps.validation_needed);
  const evidenceStatus = {
    ai: 'assumption',
    rag: rag.rag_architecture?.evidence_status || 'conditional',
    model_routing: 'assumption',
    vector_embedding: vectorEmbedding.vector_embedding_strategy?.evidence_status || 'conditional',
    tool_api: toolAccess.tool_scope_status || 'conditional',
    safety_eval: 'assumption',
    privacy_residency: 'assumption',
    cost_operations: 'assumption',
    storage_handoff: handoff.upstream?.storage ? 'partial' : 'missing',
    api_handoff: handoff.upstream?.api ? 'partial' : 'missing',
    security_handoff: handoff.upstream?.security ? 'partial' : 'missing',
    compliance_handoff: handoff.upstream?.compliance ? 'partial' : 'missing',
    governance_handoff: handoff.upstream?.governance ? 'partial' : 'missing',
    infrastructure_handoff: handoff.upstream?.infrastructure ? 'partial' : 'missing',
    technology_handoff: handoff.upstream?.technology ? 'partial' : 'missing',
    finops_handoff: handoff.upstream?.finops ? 'partial' : 'not_yet_available_or_optional',
  };
  const validationGates = validationNeeded.map(item => ({
    gate: item,
    owner: inferAiOwner(item),
    status: 'requires human validation',
  }));
  const qualification = {
    status: 'draft_requires_ai_owner_review',
    statement: 'This AI output is a specialist architecture draft. It is not model approval, privacy approval, production release approval, procurement approval, or accepted-risk record.',
    evidence_status: 'assumption_or_partial_until_ai_storage_api_security_compliance_infrastructure_technology_and_finops_owners_validate_evidence',
    required_reviewers: ['AI owner', 'Storage/data owner', 'API owner', 'Security owner', 'Compliance/privacy owner', 'Infrastructure/SRE owner', 'Technology owner', 'FinOps owner'],
  };
  const evidencePack = buildAiEvidencePack({
    handoff,
    rag,
    modelRouting,
    vectorEmbedding,
    toolAccess,
    safetyEval,
    privacyCostOps,
    knowledge,
    signalProfile,
    evidenceStatus,
    validationGates,
    qualification,
  });
  const fullValidationNeeded = mergeArrayFields(validationNeeded, evidencePack.validation_needed);
  const aiRecommendation = mergeArrayFields(
    'Keep AI recommendation draft-level until RAG corpus, model routing, vector/embedding/reranking, tool/API scopes, safety evals, privacy/residency, fallback, and token/cost evidence are validated.',
    findings.slice(0, 8)
  );
  const statePatch = {
    ...(base.statePatch || {}),
    ai_controls: findings,
    ai_recommendation: aiRecommendation,
    ai_handoff_summary: handoff.upstream || {},
    ai_use_case_matrix: base.ai_use_case_matrix || [],
    rag_architecture: rag.rag_architecture || base.rag_architecture || {},
    model_routing_strategy: modelRouting.model_routing_strategy || base.model_routing_strategy || {},
    vector_embedding_strategy: vectorEmbedding.vector_embedding_strategy || base.vector_embedding_strategy || {},
    ai_tool_api_controls: toolAccess.ai_tool_api_controls || base.ai_tool_api_controls || [],
    ai_safety_evaluation: safetyEval.ai_safety_evaluation || base.ai_safety_evaluation || [],
    ai_privacy_residency: privacyCostOps.ai_privacy_residency || base.ai_privacy_residency || [],
    ai_cost_operations: privacyCostOps.ai_cost_operations || base.ai_cost_operations || [],
    ai_evidence_status: evidenceStatus,
    ai_validation_gates: validationGates,
    ai_qualification: qualification,
    ai_policy_citations: knowledge.citations || [],
    ai_evidence_pack: evidencePack.evidence_pack,
    ai_signal_profile: {
      domains: signalProfile.domains || [],
      confidence_summary: signalProfile.confidence_summary || {},
      error_modes: signalProfile.error_modes || {},
    },
    risks,
    evidence_status: {
      ...(base.statePatch?.evidence_status || {}),
      ai: 'assumption_or_partial',
    },
    cost_drivers: mergeArrayFields(base.statePatch?.cost_drivers, [
      'AI cost drivers: model calls, input/output tokens, prompt cache hit rate, retrieval count, embedding ingestion/query volume, vector reads, reranker calls, eval traces, fallback use, local/private model hosting, observability, and support.',
    ]),
    human_validation_needed: mergeArrayFields(base.statePatch?.human_validation_needed, fullValidationNeeded),
    validation_gaps: mergeArrayFields(base.statePatch?.validation_gaps, fullValidationNeeded.map(item => `AI validation required: ${item}`)),
    retrieval_requests: mergeArrayFields(base.statePatch?.retrieval_requests, state.retrievalPlan),
    ai_tool_context: {
      handoff,
      rag,
      model_routing: modelRouting,
      vector_embedding: vectorEmbedding,
      tool_access: toolAccess,
      safety_eval: safetyEval,
      privacy_cost_ops: privacyCostOps,
      ai_knowledge: knowledge,
      ai_signal_profile: signalProfile,
      evidence_pack: evidencePack,
    },
  };
  return {
    augmentedReview: {
      ...base,
      status: 'completed_with_tools',
      summary: 'AI Agent completed tool-assisted review using upstream constraints, RAG/retrieval, model routing, vector/embedding/reranking, tool/API controls, safety evals, privacy/residency, cost/ops, and local AI knowledge.',
      findings,
      ai_recommendation: statePatch.ai_recommendation,
      ai_handoff_summary: statePatch.ai_handoff_summary,
      ai_use_case_matrix: statePatch.ai_use_case_matrix,
      rag_architecture: statePatch.rag_architecture,
      model_routing_strategy: statePatch.model_routing_strategy,
      vector_embedding_strategy: statePatch.vector_embedding_strategy,
      ai_tool_api_controls: statePatch.ai_tool_api_controls,
      ai_safety_evaluation: statePatch.ai_safety_evaluation,
      ai_privacy_residency: statePatch.ai_privacy_residency,
      ai_cost_operations: statePatch.ai_cost_operations,
      ai_evidence_status: evidenceStatus,
      ai_validation_gates: validationGates,
      ai_qualification: qualification,
      ai_policy_citations: knowledge.citations || [],
      ai_evidence_pack: evidencePack.evidence_pack,
      ai_signal_profile: statePatch.ai_signal_profile,
      risks,
      validation_needed: fullValidationNeeded,
      retrieval_requests: state.retrievalPlan,
      ai_tool_results: statePatch.ai_tool_context,
      statePatch,
    },
    trace: [trace('augment_ai_review', `Augmented AI review with ${compactToolResults(state).length} tool result(s).`)],
  };
}

function shouldRunModel(state) {
  return state.useModel ? 'model_judgement' : 'validate_ai_output';
}

async function runAiModelJudgement(state) {
  const modelReview = await runAiAgent({
    query: state.query,
    mode: state.mode,
    useModel: true,
    context: state.context,
    state: {
      ...state.architectureState,
      ai_tool_context: state.augmentedReview?.ai_tool_results,
      ai_signal_profile: state.augmentedReview?.ai_signal_profile,
      ai_qualification: state.augmentedReview?.ai_qualification,
      ai_policy_citations: state.augmentedReview?.ai_policy_citations,
      ai_evidence_pack: state.augmentedReview?.ai_evidence_pack,
    },
    retrievedContext: state.retrievedContext,
  });
  const usedModel = Boolean(modelReview?.model_review?.enabled);
  return {
    modelReview: usedModel ? enrichCandidateWithTools(modelReview, state) : null,
    trace: [trace('ai_model_judgement', usedModel ? modelReview.model_review?.error ? 'Model judgement failed; tool-assisted output retained.' : `Model judgement completed with ${modelReview.model_review?.model || 'configured model'}.` : 'Model judgement skipped because no model provider was available.')],
  };
}

function enrichCandidateWithTools(candidate, state) {
  const toolReview = state.augmentedReview || {};
  return {
    ...candidate,
    findings: mergeArrayFields(candidate.findings, toolReview.findings),
    ai_recommendation: mergeArrayFields(candidate.ai_recommendation, toolReview.ai_recommendation),
    ai_handoff_summary: toolReview.ai_handoff_summary || candidate.ai_handoff_summary,
    ai_use_case_matrix: mergeArrayFields(candidate.ai_use_case_matrix, toolReview.ai_use_case_matrix),
    rag_architecture: toolReview.rag_architecture || candidate.rag_architecture,
    model_routing_strategy: toolReview.model_routing_strategy || candidate.model_routing_strategy,
    vector_embedding_strategy: toolReview.vector_embedding_strategy || candidate.vector_embedding_strategy,
    ai_tool_api_controls: mergeArrayFields(candidate.ai_tool_api_controls, toolReview.ai_tool_api_controls),
    ai_safety_evaluation: mergeArrayFields(candidate.ai_safety_evaluation, toolReview.ai_safety_evaluation),
    ai_privacy_residency: mergeArrayFields(candidate.ai_privacy_residency, toolReview.ai_privacy_residency),
    ai_cost_operations: mergeArrayFields(candidate.ai_cost_operations, toolReview.ai_cost_operations),
    ai_evidence_status: toolReview.ai_evidence_status || candidate.ai_evidence_status,
    ai_validation_gates: mergeArrayFields(candidate.ai_validation_gates, toolReview.ai_validation_gates),
    ai_qualification: toolReview.ai_qualification || candidate.ai_qualification,
    ai_policy_citations: mergeArrayFields(candidate.ai_policy_citations, toolReview.ai_policy_citations),
    ai_evidence_pack: toolReview.ai_evidence_pack || candidate.ai_evidence_pack,
    ai_signal_profile: toolReview.ai_signal_profile || candidate.ai_signal_profile,
    risks: mergeArrayFields(candidate.risks, toolReview.risks),
    validation_needed: mergeArrayFields(candidate.validation_needed, toolReview.validation_needed),
    retrieval_requests: mergeArrayFields(candidate.retrieval_requests, state.retrievalPlan),
    ai_tool_results: toolReview.ai_tool_results,
    statePatch: {
      ...(candidate.statePatch || {}),
      ...toolReview.statePatch,
      ai_controls: mergeArrayFields(candidate.statePatch?.ai_controls, toolReview.findings),
      risks: mergeArrayFields(candidate.statePatch?.risks, toolReview.risks),
      human_validation_needed: mergeArrayFields(candidate.statePatch?.human_validation_needed, toolReview.validation_needed),
      validation_gaps: mergeArrayFields(candidate.statePatch?.validation_gaps, toolReview.statePatch?.validation_gaps),
      retrieval_requests: mergeArrayFields(candidate.statePatch?.retrieval_requests, state.retrievalPlan),
      ai_tool_context: toolReview.ai_tool_results,
    },
  };
}

async function validateAiOutput(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const validation = await aiTools.validateAiOutputTool.invoke({
    ...toolInput(state),
    output: candidate,
    toolResults: compactToolResults(state),
  });
  return {
    validation,
    trace: [trace('validate_ai_output', `AI validation returned ${validation.verdict}.`, { blockers: validation.blockers?.length || 0, warnings: validation.warnings?.length || 0 })],
  };
}

function shouldRecommendAiReview(state) {
  return state.validation?.verdict === 'pass' ? 'finalize_ai_output' : 'recommend_ai_review_actions';
}

async function recommendAiReviewActions(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const notes = [
    ...(state.validation?.blockers || []).map(item => `AI blocker: ${item}`),
    ...(state.validation?.warnings || []).map(item => `AI warning: ${item}`),
  ];
  return {
    remediation: {
      ...candidate,
      status: candidate?.status === 'completed_with_model' ? 'completed_with_model_and_ai_review_recommendations' : 'completed_with_ai_review_recommendations',
      validation_needed: mergeArrayFields(candidate?.validation_needed, notes),
      statePatch: {
        ...(candidate?.statePatch || {}),
        human_validation_needed: mergeArrayFields(candidate?.statePatch?.human_validation_needed, notes),
        validation_gaps: mergeArrayFields(candidate?.statePatch?.validation_gaps, notes),
      },
      ai_review_recommendation: {
        reason: state.validation?.verdict,
        blockers: state.validation?.blockers || [],
        warnings: state.validation?.warnings || [],
        action: 'Output remains an AI review draft until AI, storage, API, security, compliance, infrastructure, technology, and FinOps owners validate evidence.',
      },
    },
    trace: [trace('recommend_ai_review_actions', `Added ${notes.length} AI review recommendation note(s).`)],
  };
}

async function finalizeAiOutput(state) {
  const selected = state.remediation || state.modelReview || state.augmentedReview || state.deterministicReview;
  const usedModel = Boolean(selected?.model_review?.enabled && !selected?.model_review?.error);
  return {
    output: {
      ...selected,
      status: selected?.model_review?.error ? 'completed_with_fallback' : selected?.ai_review_recommendation ? selected.status : usedModel ? 'completed_with_model' : selected?.status || 'completed_with_tools',
      graph_agent: {
        framework: 'langgraph',
        graph: 'ai_agent_graph',
        agent_type: 'tool_using_ai_agent',
        nodes: state.trace.map(item => item.node),
        tools: [
          'inspectAiHandoffTool',
          'designRagArchitectureTool',
          'planModelRoutingTool',
          'designVectorEmbeddingTool',
          'planAiToolAccessTool',
          'planAiSafetyEvalTool',
          'planAiPrivacyCostOpsTool',
          'retrieveAiKnowledgeTool',
          'validateAiOutputTool',
        ],
        retrieval_plan: state.retrievalPlan,
        retrieved_docs: state.aiKnowledge?.docs || [],
        validation: state.validation,
        trace: state.trace,
        upstream: state.handoff?.upstream || {},
        model_route: { requested: Boolean(state.useModel), used: usedModel, provider: selected?.model_review?.provider || (usedModel ? 'openai' : 'none'), model: selected?.model_review?.model || 'none' },
      },
      evidence: {
        ...selected?.evidence,
        graph_retrieval: state.evidence,
        local_ai_knowledge: state.aiKnowledge?.docs || [],
        ai_policy_citations: selected?.ai_policy_citations || [],
        ai_evidence_pack: selected?.ai_evidence_pack || {},
        ai_signal_profile: selected?.ai_signal_profile || {},
        ai_tool_results: selected?.ai_tool_results,
      },
    },
    trace: [trace('finalize_ai_output', 'Finalized tool-using LangGraph AI Agent output.')],
  };
}

const aiAgentGraph = new StateGraph(AiGraphState)
  .addNode('prepare_ai_context', prepareAiContext)
  .addNode('inspect_ai_handoff', inspectAiHandoff)
  .addNode('design_rag_architecture', designRag)
  .addNode('plan_model_routing', planModelRouting)
  .addNode('design_vector_embedding', designVectorEmbedding)
  .addNode('plan_ai_tool_access', planToolAccess)
  .addNode('plan_ai_safety_eval', planSafetyEval)
  .addNode('plan_ai_privacy_cost_ops', planPrivacyCostOps)
  .addNode('plan_ai_retrieval', planAiRetrieval)
  .addNode('retrieve_ai_knowledge', retrieveAiKnowledge)
  .addNode('deterministic_ai_review', runDeterministicAiReview)
  .addNode('augment_ai_review', augmentAiReview)
  .addNode('model_judgement', runAiModelJudgement)
  .addNode('validate_ai_output', validateAiOutput)
  .addNode('recommend_ai_review_actions', recommendAiReviewActions)
  .addNode('finalize_ai_output', finalizeAiOutput)
  .addEdge(START, 'prepare_ai_context')
  .addEdge('prepare_ai_context', 'inspect_ai_handoff')
  .addEdge('inspect_ai_handoff', 'design_rag_architecture')
  .addEdge('design_rag_architecture', 'plan_model_routing')
  .addEdge('plan_model_routing', 'design_vector_embedding')
  .addEdge('design_vector_embedding', 'plan_ai_tool_access')
  .addEdge('plan_ai_tool_access', 'plan_ai_safety_eval')
  .addEdge('plan_ai_safety_eval', 'plan_ai_privacy_cost_ops')
  .addEdge('plan_ai_privacy_cost_ops', 'plan_ai_retrieval')
  .addEdge('plan_ai_retrieval', 'retrieve_ai_knowledge')
  .addEdge('retrieve_ai_knowledge', 'deterministic_ai_review')
  .addEdge('deterministic_ai_review', 'augment_ai_review')
  .addConditionalEdges('augment_ai_review', shouldRunModel, { model_judgement: 'model_judgement', validate_ai_output: 'validate_ai_output' })
  .addEdge('model_judgement', 'validate_ai_output')
  .addConditionalEdges('validate_ai_output', shouldRecommendAiReview, { recommend_ai_review_actions: 'recommend_ai_review_actions', finalize_ai_output: 'finalize_ai_output' })
  .addEdge('recommend_ai_review_actions', 'finalize_ai_output')
  .addEdge('finalize_ai_output', END)
  .compile();

async function runAiAgentGraph({ query, mode, useModel, context, state, retrievedContext }) {
  const result = await aiAgentGraph.invoke({ query, mode, useModel, context, architectureState: state, retrievedContext });
  return result.output;
}

module.exports = {
  aiAgentGraph,
  runAiAgentGraph,
};
