const { Annotation, END, START, StateGraph } = require('@langchain/langgraph');
const { runComplianceAgent } = require('./complianceAgent');
const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeUnique } = require('../schema');
const { complianceTools } = require('./complianceTools');
const { classifyComplianceSignals } = require('./complianceSignalClassifier');

const ComplianceGraphState = Annotation.Root({
  query: Annotation({ reducer: (_current, update) => update, default: () => '' }),
  mode: Annotation({ reducer: (_current, update) => update, default: () => 'architecture-review' }),
  useModel: Annotation({ reducer: (_current, update) => update, default: () => true }),
  context: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  architectureState: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  retrievedContext: Annotation({ reducer: (_current, update) => update, default: () => [] }),
  signals: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  complianceSignalProfile: Annotation({ reducer: (_current, update) => update, default: () => null }),
  securityHandoff: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  jurisdictionScope: Annotation({ reducer: (_current, update) => update, default: () => null }),
  processorResidency: Annotation({ reducer: (_current, update) => update, default: () => null }),
  retentionDeletion: Annotation({ reducer: (_current, update) => update, default: () => null }),
  complianceKnowledge: Annotation({ reducer: (_current, update) => update, default: () => null }),
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
  return [state.complianceSignalProfile, state.jurisdictionScope, state.processorResidency, state.retentionDeletion, state.complianceKnowledge].filter(Boolean);
}

function toolInput(state) {
  return {
    query: state.query,
    context: state.context,
    state: state.architectureState,
    signals: state.signals,
  };
}

async function prepareComplianceContext(state) {
  const signals = getRetailSignals({ query: state.query, context: state.context, state: state.architectureState });
  const security = state.architectureState?.agent_outputs?.security || {};
  const complianceSignalProfile = classifyComplianceSignals({
    query: state.query,
    context: state.context,
    state: state.architectureState,
    signals,
  });
  return {
    signals,
    complianceSignalProfile,
    securityHandoff: {
      available: Boolean(security.agentId || state.architectureState?.security_tool_context),
      validation: security.graph_agent?.validation?.verdict || 'unknown',
      data_classification: state.architectureState?.data_classification || [],
      security_tool_context: state.architectureState?.security_tool_context || security.security_tool_results || {},
      security_signal_profile: state.architectureState?.security_signal_profile || security.security_signal_profile || {},
      compliance_qualification: state.architectureState?.compliance_qualification || security.compliance_qualification || {},
      payment_security: state.architectureState?.payment_security || security.payment_security || {},
      ai_security: state.architectureState?.ai_security || security.ai_security || {},
    },
    trace: [trace('prepare_compliance_context', `Detected ${signals.workloadTypes.length || 0} workload signal(s), ${complianceSignalProfile.domains.length} compliance signal(s); security handoff ${security.agentId ? 'available' : 'not explicit'}.`)],
  };
}

async function assessJurisdictionScope(state) {
  const jurisdictionScope = await complianceTools.assessJurisdictionScopeTool.invoke(toolInput(state));
  return {
    jurisdictionScope,
    trace: [trace('assess_jurisdiction_scope', `Assessed ${jurisdictionScope.frameworks?.length || 0} compliance framework(s).`)],
  };
}

async function buildProcessorResidency(state) {
  const processorResidency = await complianceTools.buildProcessorResidencyMatrixTool.invoke(toolInput(state));
  return {
    processorResidency,
    trace: [trace('build_processor_residency', `Built ${processorResidency.matrix?.length || 0} processor/residency row(s).`)],
  };
}

async function defineRetentionDeletion(state) {
  const retentionDeletion = await complianceTools.defineRetentionDeletionTool.invoke(toolInput(state));
  return {
    retentionDeletion,
    trace: [trace('define_retention_deletion', `Defined ${retentionDeletion.controls?.length || 0} retention/deletion control(s).`)],
  };
}

async function planComplianceRetrieval(state) {
  const plan = [
    'retail-compliance-playbook',
    'retail-residency-and-processor-matrix',
    'retail-retention-deletion-dsar-control-template',
  ];
  if (state.signals.payments) plan.push('pci-privacy-and-support-access-evidence-checklist');
  if (state.signals.retailAi) plan.push('retail-ai-data-residency-review-template');
  if (state.securityHandoff.available) plan.push('security-to-compliance-handoff-checklist');
  for (const hint of state.complianceSignalProfile?.retrieval_hints || []) {
    plan.push(hint);
  }
  return {
    retrievalPlan: [...new Set(plan)],
    evidence: retailEvidence(state.retrievedContext),
    trace: [trace('plan_compliance_retrieval', `Planned ${plan.length} compliance retrieval request(s).`)],
  };
}

async function retrieveComplianceKnowledge(state) {
  const complianceKnowledge = await complianceTools.retrieveComplianceKnowledgeTool.invoke({
    ...toolInput(state),
    retrievalPlan: state.retrievalPlan,
    limit: 6,
  });
  return {
    complianceKnowledge,
    trace: [trace('retrieve_compliance_knowledge', `Retrieved ${complianceKnowledge.docs?.length || 0} local compliance knowledge document(s).`)],
  };
}

async function runDeterministicComplianceReview(state) {
  const deterministicReview = await runComplianceAgent({
    query: state.query,
    mode: state.mode,
    useModel: false,
    context: state.context,
    state: state.architectureState,
    retrievedContext: state.retrievedContext,
  });
  return {
    deterministicReview,
    trace: [trace('deterministic_compliance_review', `Produced ${deterministicReview.findings?.length || 0} deterministic compliance obligation(s).`)],
  };
}

function augmentComplianceReview(state) {
  const base = state.deterministicReview || {};
  const jurisdiction = state.jurisdictionScope || {};
  const residency = state.processorResidency || {};
  const retention = state.retentionDeletion || {};
  const knowledge = state.complianceKnowledge || {};
  const signalProfile = state.complianceSignalProfile || {};
  const findings = mergeArrayFields(base.findings, knowledge.controls, jurisdiction.findings, retention.controls);
  const matrix = mergeArrayFields(base.residency_matrix, residency.matrix);
  const risks = mergeArrayFields(base.risks, knowledge.risks);
  const validationNeeded = mergeArrayFields(base.validation_needed, knowledge.validation_needed, jurisdiction.validation_needed, residency.validation_needed, retention.validation_needed);
  const complianceQualification = {
    status: 'draft_requires_legal_privacy_review',
    statement: 'This compliance output is an architecture compliance draft. It is not legal advice, certification, audit attestation, QSA sign-off, or confirmation of regulatory compliance.',
    evidence_status: 'assumption_or_partial_until_client_legal_privacy_evidence_is_verified',
    required_reviewers: ['Compliance/privacy owner', 'Legal counsel where applicable', 'Security owner', 'QSA where PCI applies'],
  };
  const evidenceStatus = {
    compliance: 'assumption',
    data_residency: 'assumption',
    processors: 'assumption',
    retention_deletion: 'assumption',
    support_access: 'assumption',
    security_handoff: state.securityHandoff.available ? 'partial' : 'missing',
  };
  const validationGates = validationNeeded.map(item => ({
    gate: item,
    owner: inferComplianceOwner(item),
    status: 'requires human validation',
  }));
  const evidencePack = buildComplianceEvidencePack({
    securityHandoff: state.securityHandoff,
    jurisdiction,
    residency,
    retention,
    knowledge,
    evidenceStatus,
    validationGates,
    complianceQualification,
  });
  const fullValidationNeeded = mergeArrayFields(validationNeeded, evidencePack.validation_needed);
  const statePatch = {
    ...(base.statePatch || {}),
    compliance_obligations: findings,
    residency_matrix: matrix,
    compliance_recommendation: mergeArrayFields(
      'Treat compliance and residency as assumption-level until legal/privacy owners validate jurisdictions, processors, support access, retention/deletion, and evidence.',
      findings.slice(0, 8)
    ),
    jurisdiction_frameworks: jurisdiction.frameworks || [],
    processor_residency_matrix: matrix,
    retention_deletion_controls: retention.controls || [],
    compliance_evidence_status: evidenceStatus,
    compliance_validation_gates: validationGates,
    compliance_qualification: complianceQualification,
    compliance_policy_citations: knowledge.citations || [],
    compliance_evidence_pack: evidencePack.evidence_pack,
    compliance_signal_profile: {
      domains: signalProfile.domains || [],
      confidence_summary: signalProfile.confidence_summary || {},
      error_modes: signalProfile.error_modes || {},
    },
    evidence_status: {
      ...(base.statePatch?.evidence_status || {}),
      compliance: 'assumption',
      data_residency: 'assumption',
      processors: 'assumption',
      retention_deletion: 'assumption',
    },
    human_validation_needed: mergeArrayFields(base.statePatch?.human_validation_needed, fullValidationNeeded),
    validation_gaps: mergeArrayFields(base.statePatch?.validation_gaps, fullValidationNeeded.map(item => `Compliance validation required: ${item}`)),
    retrieval_requests: mergeArrayFields(base.statePatch?.retrieval_requests, state.retrievalPlan),
    compliance_tool_context: {
      security_handoff: state.securityHandoff,
      jurisdiction_scope: jurisdiction,
      processor_residency: residency,
      retention_deletion: retention,
      compliance_knowledge: knowledge,
      compliance_signal_profile: signalProfile,
    },
  };
  return {
    augmentedReview: {
      ...base,
      status: 'completed_with_tools',
      summary: 'Compliance Agent completed tool-assisted review using Security handoff, jurisdiction scope, processor/residency matrix, and retention/deletion controls.',
      findings,
      compliance_recommendation: statePatch.compliance_recommendation,
      jurisdiction_frameworks: statePatch.jurisdiction_frameworks,
      residency_matrix: matrix,
      processor_residency_matrix: matrix,
      retention_deletion_controls: statePatch.retention_deletion_controls,
      compliance_evidence_status: evidenceStatus,
      compliance_validation_gates: validationGates,
      compliance_qualification: complianceQualification,
      compliance_policy_citations: knowledge.citations || [],
      compliance_evidence_pack: evidencePack.evidence_pack,
      compliance_signal_profile: statePatch.compliance_signal_profile,
      risks,
      validation_needed: fullValidationNeeded,
      retrieval_requests: state.retrievalPlan,
      compliance_tool_results: statePatch.compliance_tool_context,
      statePatch,
    },
    trace: [trace('augment_compliance_review', `Augmented compliance review with ${compactToolResults(state).length} tool result(s).`)],
  };
}

function inferComplianceOwner(item) {
  const text = String(item || '').toLowerCase();
  if (/pci|pan|sad|qsa|payment|psp|token/.test(text)) return 'Payment compliance owner / QSA';
  if (/gdpr|ccpa|dpdp|privacy|children|minor|coppa|legal/.test(text)) return 'Legal/privacy owner';
  if (/processor|subprocessor|dpa|vendor|support access|saas/.test(text)) return 'Vendor risk / privacy owner';
  if (/retention|deletion|dsar|erasure|backup/.test(text)) return 'Data governance / privacy owner';
  if (/security|c5|c5e|prompt|vector|ai|telemetry/.test(text)) return 'Security owner + compliance owner';
  return 'Compliance owner';
}

function buildComplianceEvidencePack({ securityHandoff = {}, jurisdiction = {}, residency = {}, retention = {}, knowledge = {}, evidenceStatus = {}, validationGates = [], complianceQualification = {} }) {
  const frameworks = jurisdiction.frameworks || [];
  return {
    evidence_pack: {
      policy_sources: knowledge.docs || [],
      policy_inventory: knowledge.policy_inventory || [],
      citations: knowledge.citations || [],
      evidence_status: evidenceStatus,
      compliance_qualification: complianceQualification,
      framework_evidence_needed: frameworks.map(item => ({
        framework: item.framework,
        status: item.status || 'assumption',
        evidence_needed: jurisdiction.evidence_needed || [],
      })),
      processor_evidence_needed: (residency.matrix || []).map(item => ({
        component: item.component,
        data_touched: item.data_touched,
        evidence_needed: item.action,
        status: item.status || 'assumption',
      })),
      retention_evidence_needed: (retention.controls || []).map(control => ({
        control,
        evidence_needed: 'Owner-approved retention schedule, deletion/DSAR path, backup limitation note, and test evidence.',
        status: 'assumption',
      })),
      approval_workflow: [
        'Compliance/privacy owner validates jurisdictions, processor evidence, data residency, retention/deletion, support access, and evidence status.',
        'Legal counsel validates regulatory applicability, cross-border transfer basis, data-sharing terms, and sector/client obligations where applicable.',
        'Security owner validates handoff from data classification, payment boundary, AI/RAG scope, support access, and trust boundaries.',
        'QSA or payment compliance owner validates PCI scope where payment, PAN/SAD, PSP, token vault, or refund workflows are in scope.',
      ],
      client_questions: [
        'Which countries do you operate in, and where are customers, stores, support teams, and legal entities located?',
        'Which compliance frameworks are contractual or regulatory requirements, and who can approve applicability?',
        'Which processors/subprocessors handle app data, backups, logs, traces, AI payloads, support tickets, analytics, and exports?',
        'What are the approved regions, support-access locations, DPA terms, retention schedules, and deletion/DSAR SLAs?',
        'Can you provide security handoff evidence for data classes, PCI/payment boundary, AI/RAG paths, support access, and trust boundaries?',
      ],
      security_handoff_summary: {
        available: Boolean(securityHandoff.available),
        validation: securityHandoff.validation || 'unknown',
        data_classification_count: securityHandoff.data_classification?.length || 0,
        payment_in_scope: Boolean(securityHandoff.payment_security?.in_scope),
        ai_in_scope: Boolean(securityHandoff.ai_security?.in_scope),
      },
      review_limitations: [
        'Compliance output is not legal advice, certification, QSA sign-off, audit attestation, or confirmation of regulatory compliance.',
        'Evidence marked assumption, partial, stale, missing, or contradictory requires human owner review before client-ready approval.',
      ],
      validation_gates: validationGates,
    },
    validation_needed: [
      'Collect owner-approved compliance evidence pack before marking compliance, residency, processor, support-access, or retention status as verified.',
    ],
  };
}

function shouldRunModel(state) {
  return state.useModel ? 'model_judgement' : 'validate_compliance_output';
}

async function runComplianceModelJudgement(state) {
  const modelReview = await runComplianceAgent({
    query: state.query,
    mode: state.mode,
    useModel: true,
    context: state.context,
    state: {
      ...state.architectureState,
      compliance_tool_context: state.augmentedReview?.compliance_tool_results,
      compliance_tool_validation_needed: state.augmentedReview?.validation_needed,
      compliance_signal_profile: state.augmentedReview?.compliance_signal_profile,
      compliance_qualification: state.augmentedReview?.compliance_qualification,
      compliance_policy_citations: state.augmentedReview?.compliance_policy_citations,
      compliance_evidence_pack: state.augmentedReview?.compliance_evidence_pack,
    },
    retrievedContext: state.retrievedContext,
  });
  const usedModel = Boolean(modelReview?.model_review?.enabled);
  return {
    modelReview: usedModel ? enrichCandidateWithTools(modelReview, state) : null,
    trace: [trace('compliance_model_judgement', usedModel ? modelReview.model_review?.error ? 'Model judgement failed; tool-assisted output retained.' : `Model judgement completed with ${modelReview.model_review?.model || 'configured model'}.` : 'Model judgement skipped because no model provider was available.')],
  };
}

function enrichCandidateWithTools(candidate, state) {
  const toolReview = state.augmentedReview || {};
  return {
    ...candidate,
    findings: mergeArrayFields(candidate.findings, toolReview.findings),
    compliance_recommendation: mergeArrayFields(candidate.compliance_recommendation, toolReview.compliance_recommendation),
    jurisdiction_frameworks: mergeArrayFields(candidate.jurisdiction_frameworks, toolReview.jurisdiction_frameworks),
    residency_matrix: mergeArrayFields(candidate.residency_matrix, toolReview.residency_matrix),
    processor_residency_matrix: mergeArrayFields(candidate.processor_residency_matrix, toolReview.processor_residency_matrix),
    retention_deletion_controls: mergeArrayFields(candidate.retention_deletion_controls, toolReview.retention_deletion_controls),
    compliance_evidence_status: toolReview.compliance_evidence_status || candidate.compliance_evidence_status,
    compliance_validation_gates: mergeArrayFields(candidate.compliance_validation_gates, toolReview.compliance_validation_gates),
    compliance_qualification: toolReview.compliance_qualification || candidate.compliance_qualification,
    compliance_policy_citations: mergeArrayFields(candidate.compliance_policy_citations, toolReview.compliance_policy_citations),
    compliance_evidence_pack: toolReview.compliance_evidence_pack || candidate.compliance_evidence_pack,
    compliance_signal_profile: toolReview.compliance_signal_profile || candidate.compliance_signal_profile,
    risks: mergeArrayFields(candidate.risks, toolReview.risks),
    validation_needed: mergeArrayFields(candidate.validation_needed, toolReview.validation_needed),
    retrieval_requests: mergeArrayFields(candidate.retrieval_requests, state.retrievalPlan),
    compliance_tool_results: toolReview.compliance_tool_results,
    statePatch: {
      ...(candidate.statePatch || {}),
      compliance_obligations: mergeArrayFields(candidate.statePatch?.compliance_obligations, toolReview.findings),
      compliance_recommendation: mergeArrayFields(candidate.statePatch?.compliance_recommendation, toolReview.compliance_recommendation),
      jurisdiction_frameworks: mergeArrayFields(candidate.statePatch?.jurisdiction_frameworks, toolReview.jurisdiction_frameworks),
      residency_matrix: mergeArrayFields(candidate.statePatch?.residency_matrix, toolReview.residency_matrix),
      processor_residency_matrix: mergeArrayFields(candidate.statePatch?.processor_residency_matrix, toolReview.processor_residency_matrix),
      retention_deletion_controls: mergeArrayFields(candidate.statePatch?.retention_deletion_controls, toolReview.retention_deletion_controls),
      compliance_evidence_status: toolReview.compliance_evidence_status || candidate.statePatch?.compliance_evidence_status,
      compliance_validation_gates: mergeArrayFields(candidate.statePatch?.compliance_validation_gates, toolReview.compliance_validation_gates),
      compliance_qualification: toolReview.compliance_qualification || candidate.statePatch?.compliance_qualification,
      compliance_policy_citations: mergeArrayFields(candidate.statePatch?.compliance_policy_citations, toolReview.compliance_policy_citations),
      compliance_evidence_pack: toolReview.compliance_evidence_pack || candidate.statePatch?.compliance_evidence_pack,
      compliance_signal_profile: toolReview.compliance_signal_profile || candidate.statePatch?.compliance_signal_profile,
      risks: mergeArrayFields(candidate.statePatch?.risks, toolReview.risks),
      human_validation_needed: mergeArrayFields(candidate.statePatch?.human_validation_needed, toolReview.validation_needed),
      validation_gaps: mergeArrayFields(candidate.statePatch?.validation_gaps, toolReview.statePatch?.validation_gaps),
      retrieval_requests: mergeArrayFields(candidate.statePatch?.retrieval_requests, state.retrievalPlan),
      compliance_tool_context: toolReview.compliance_tool_results,
    },
  };
}

async function validateComplianceOutput(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const validation = await complianceTools.validateComplianceOutputTool.invoke({
    ...toolInput(state),
    output: candidate,
    toolResults: compactToolResults(state),
  });
  return {
    validation,
    trace: [trace('validate_compliance_output', `Compliance validation returned ${validation.verdict}.`, { blockers: validation.blockers?.length || 0, warnings: validation.warnings?.length || 0 })],
  };
}

function shouldRecommendComplianceReview(state) {
  return state.validation?.verdict === 'pass' ? 'finalize_compliance_output' : 'recommend_compliance_review_actions';
}

async function recommendComplianceReviewActions(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const notes = [
    ...(state.validation?.blockers || []).map(item => `Compliance blocker: ${item}`),
    ...(state.validation?.warnings || []).map(item => `Compliance warning: ${item}`),
  ];
  return {
    remediation: {
      ...candidate,
      status: candidate?.status === 'completed_with_model' ? 'completed_with_model_and_compliance_review_recommendations' : 'completed_with_compliance_review_recommendations',
      validation_needed: mergeArrayFields(candidate?.validation_needed, notes),
      statePatch: {
        ...(candidate?.statePatch || {}),
        human_validation_needed: mergeArrayFields(candidate?.statePatch?.human_validation_needed, notes),
        validation_gaps: mergeArrayFields(candidate?.statePatch?.validation_gaps, notes),
      },
      compliance_review_recommendation: {
        reason: state.validation?.verdict,
        blockers: state.validation?.blockers || [],
        warnings: state.validation?.warnings || [],
        action: 'Output remains a compliance review draft until blockers and warnings are validated by legal/privacy owners.',
      },
    },
    trace: [trace('recommend_compliance_review_actions', `Added ${notes.length} compliance review recommendation note(s).`)],
  };
}

async function finalizeComplianceOutput(state) {
  const selected = state.remediation || state.modelReview || state.augmentedReview || state.deterministicReview;
  const usedModel = Boolean(selected?.model_review?.enabled && !selected?.model_review?.error);
  return {
    output: {
      ...selected,
      status: selected?.model_review?.error ? 'completed_with_fallback' : selected?.compliance_review_recommendation ? selected.status : usedModel ? 'completed_with_model' : selected?.status || 'completed_with_tools',
      graph_agent: {
        framework: 'langgraph',
        graph: 'compliance_agent_graph',
        agent_type: 'tool_using_compliance_agent',
        nodes: state.trace.map(item => item.node),
        tools: ['assessJurisdictionScopeTool', 'buildProcessorResidencyMatrixTool', 'defineRetentionDeletionTool', 'retrieveComplianceKnowledgeTool', 'validateComplianceOutputTool'],
        retrieval_plan: state.retrievalPlan,
        validation: state.validation,
        trace: state.trace,
        upstream: { security: state.securityHandoff },
        model_route: { requested: Boolean(state.useModel), used: usedModel, provider: selected?.model_review?.provider || (usedModel ? 'openai' : 'none'), model: selected?.model_review?.model || 'none' },
      },
      evidence: {
        ...selected?.evidence,
        graph_retrieval: state.evidence,
        local_compliance_knowledge: state.complianceKnowledge?.docs || [],
        compliance_policy_citations: selected?.compliance_policy_citations || [],
        compliance_evidence_pack: selected?.compliance_evidence_pack || {},
        compliance_signal_profile: selected?.compliance_signal_profile || {},
        compliance_tool_results: selected?.compliance_tool_results,
      },
    },
    trace: [trace('finalize_compliance_output', 'Finalized tool-using LangGraph Compliance Agent output.')],
  };
}

const complianceAgentGraph = new StateGraph(ComplianceGraphState)
  .addNode('prepare_compliance_context', prepareComplianceContext)
  .addNode('assess_jurisdiction_scope', assessJurisdictionScope)
  .addNode('build_processor_residency', buildProcessorResidency)
  .addNode('define_retention_deletion', defineRetentionDeletion)
  .addNode('plan_compliance_retrieval', planComplianceRetrieval)
  .addNode('retrieve_compliance_knowledge', retrieveComplianceKnowledge)
  .addNode('deterministic_compliance_review', runDeterministicComplianceReview)
  .addNode('augment_compliance_review', augmentComplianceReview)
  .addNode('model_judgement', runComplianceModelJudgement)
  .addNode('validate_compliance_output', validateComplianceOutput)
  .addNode('recommend_compliance_review_actions', recommendComplianceReviewActions)
  .addNode('finalize_compliance_output', finalizeComplianceOutput)
  .addEdge(START, 'prepare_compliance_context')
  .addEdge('prepare_compliance_context', 'assess_jurisdiction_scope')
  .addEdge('assess_jurisdiction_scope', 'build_processor_residency')
  .addEdge('build_processor_residency', 'define_retention_deletion')
  .addEdge('define_retention_deletion', 'plan_compliance_retrieval')
  .addEdge('plan_compliance_retrieval', 'retrieve_compliance_knowledge')
  .addEdge('retrieve_compliance_knowledge', 'deterministic_compliance_review')
  .addEdge('deterministic_compliance_review', 'augment_compliance_review')
  .addConditionalEdges('augment_compliance_review', shouldRunModel, { model_judgement: 'model_judgement', validate_compliance_output: 'validate_compliance_output' })
  .addEdge('model_judgement', 'validate_compliance_output')
  .addConditionalEdges('validate_compliance_output', shouldRecommendComplianceReview, { recommend_compliance_review_actions: 'recommend_compliance_review_actions', finalize_compliance_output: 'finalize_compliance_output' })
  .addEdge('recommend_compliance_review_actions', 'finalize_compliance_output')
  .addEdge('finalize_compliance_output', END)
  .compile();

async function runComplianceAgentGraph({ query, mode, useModel, context, state, retrievedContext }) {
  const result = await complianceAgentGraph.invoke({ query, mode, useModel, context, architectureState: state, retrievedContext });
  return result.output;
}

module.exports = {
  complianceAgentGraph,
  runComplianceAgentGraph,
};
