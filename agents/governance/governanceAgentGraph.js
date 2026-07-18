const { Annotation, END, START, StateGraph } = require('@langchain/langgraph');
const { runGovernanceAgent } = require('./governanceAgent');
const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeUnique } = require('../schema');
const { governanceTools } = require('./governanceTools');
const { classifyGovernanceSignals } = require('./governanceSignalClassifier');

const GovernanceGraphState = Annotation.Root({
  query: Annotation({ reducer: (_current, update) => update, default: () => '' }),
  mode: Annotation({ reducer: (_current, update) => update, default: () => 'architecture-review' }),
  useModel: Annotation({ reducer: (_current, update) => update, default: () => true }),
  context: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  architectureState: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  retrievedContext: Annotation({ reducer: (_current, update) => update, default: () => [] }),
  signals: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  governanceSignalProfile: Annotation({ reducer: (_current, update) => update, default: () => null }),
  handoff: Annotation({ reducer: (_current, update) => update, default: () => null }),
  systemsOfRecord: Annotation({ reducer: (_current, update) => update, default: () => null }),
  gates: Annotation({ reducer: (_current, update) => update, default: () => null }),
  governanceKnowledge: Annotation({ reducer: (_current, update) => update, default: () => null }),
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
  return [state.governanceSignalProfile, state.handoff, state.systemsOfRecord, state.gates, state.governanceKnowledge].filter(Boolean);
}

function toolInput(state) {
  return { query: state.query, context: state.context, state: state.architectureState, signals: state.signals };
}

async function prepareGovernanceContext(state) {
  const signals = getRetailSignals({ query: state.query, context: state.context, state: state.architectureState });
  const governanceSignalProfile = classifyGovernanceSignals({
    query: state.query,
    context: state.context,
    state: state.architectureState,
    signals,
  });
  return {
    signals,
    governanceSignalProfile,
    trace: [trace('prepare_governance_context', `Detected ${signals.workloadTypes.length || 0} workload signal(s) and ${governanceSignalProfile.domains.length} governance signal(s).`)],
  };
}

async function inspectArchitectureHandoff(state) {
  const handoff = await governanceTools.inspectArchitectureHandoffTool.invoke(toolInput(state));
  return {
    handoff,
    trace: [trace('inspect_architecture_handoff', `Security handoff: ${handoff.handoff?.security_available ? 'yes' : 'no'}; Compliance handoff: ${handoff.handoff?.compliance_available ? 'yes' : 'no'}.`)],
  };
}

async function buildSystemsOfRecord(state) {
  const systemsOfRecord = await governanceTools.buildSystemsOfRecordTool.invoke(toolInput(state));
  return {
    systemsOfRecord,
    trace: [trace('build_systems_of_record', `Built ${systemsOfRecord.systems?.length || 0} systems-of-record row(s).`)],
  };
}

async function buildDecisionAndApprovalGates(state) {
  const gates = await governanceTools.buildDecisionAndApprovalGatesTool.invoke(toolInput(state));
  return {
    gates,
    trace: [trace('build_decision_approval_gates', `Built ${gates.gates?.length || 0} governance gate(s).`)],
  };
}

async function planGovernanceRetrieval(state) {
  const plan = [
    'retail-architecture-governance-playbook',
    'retail-systems-of-record-template',
    'retail-adr-and-approval-gate-template',
    'retail-integration-replay-and-reconciliation-checklist',
    'retail-rollout-readiness-gate-template',
  ];
  if (state.handoff?.handoff?.security_available) plan.push('security-to-governance-handoff-checklist');
  if (state.handoff?.handoff?.compliance_available) plan.push('compliance-to-governance-handoff-checklist');
  for (const hint of state.governanceSignalProfile?.retrieval_hints || []) plan.push(hint);
  return {
    retrievalPlan: [...new Set(plan)],
    evidence: retailEvidence(state.retrievedContext),
    trace: [trace('plan_governance_retrieval', `Planned ${plan.length} governance retrieval request(s).`)],
  };
}

async function retrieveGovernanceKnowledge(state) {
  const governanceKnowledge = await governanceTools.retrieveGovernanceKnowledgeTool.invoke({
    ...toolInput(state),
    retrievalPlan: state.retrievalPlan,
    limit: 7,
  });
  return {
    governanceKnowledge,
    trace: [trace('retrieve_governance_knowledge', `Retrieved ${governanceKnowledge.docs?.length || 0} governance knowledge document(s).`)],
  };
}

async function runDeterministicGovernanceReview(state) {
  const deterministicReview = await runGovernanceAgent({
    query: state.query,
    mode: state.mode,
    useModel: false,
    context: state.context,
    state: state.architectureState,
    retrievedContext: state.retrievedContext,
  });
  return {
    deterministicReview,
    trace: [trace('deterministic_governance_review', `Produced ${deterministicReview.findings?.length || 0} deterministic governance control(s).`)],
  };
}

function inferGovernanceOwner(item) {
  const text = String(item || '').toLowerCase();
  if (/security|pci|payment|trust|key|iam/.test(text)) return 'Security owner / architecture board';
  if (/compliance|privacy|residency|processor|retention|legal|qsa/.test(text)) return 'Compliance/privacy owner / legal';
  if (/finops|budget|cost|pricing|unit driver/.test(text)) return 'FinOps owner';
  if (/rollout|pilot|runbook|game|support|on-call|store/.test(text)) return 'Delivery and operations owner';
  if (/integration|idempot|retry|dlq|replay|reconcil|schema/.test(text)) return 'Integration/platform owner';
  if (/ai|model|rag|prompt|vector|eval|fallback/.test(text)) return 'AI platform owner';
  return 'Architecture decision owner';
}

function buildGovernanceEvidencePack({ handoff = {}, systems = {}, gates = {}, knowledge = {}, evidenceStatus = {}, validationGates = [], governanceQualification = {} }) {
  return {
    evidence_pack: {
      policy_sources: knowledge.docs || [],
      policy_inventory: knowledge.policy_inventory || [],
      citations: knowledge.citations || [],
      evidence_status: evidenceStatus,
      governance_qualification: governanceQualification,
      handoff_summary: handoff.handoff || {},
      owner_evidence_needed: (systems.systems || []).map(item => ({
        domain: item.domain,
        scope: item.scope,
        owner: item.owner,
        status: item.status,
        evidence_needed: 'Named accountable owner, source-of-truth system, correction authority, replay/reconciliation owner, support-access owner, and audit-evidence owner.',
      })),
      decision_evidence_needed: (gates.decisions || []).map(item => ({
        decision: item.what,
        owner: item.owner,
        evidence_needed: 'ADR with alternatives rejected, tradeoffs, owner, evidence status, accepted risks, approval date, and review/expiry date.',
      })),
      rollout_evidence_needed: (gates.gates || []).map(gate => ({
        gate,
        evidence_needed: 'Named approver, done criteria, evidence location, status, due date, rollback/exception path where applicable.',
      })),
      approval_workflow: [
        'Architecture board validates decisions, rejected alternatives, accepted risks, owners, and evidence status.',
        'Security owner validates Security Agent handoff gates before architecture approval.',
        'Compliance/privacy/legal owners validate Compliance Agent handoff gates before architecture approval.',
        'Operations/delivery owner validates rollout, runbook, game-day, support handoff, and acceptance evidence.',
        'FinOps owner validates budget feasibility, pricing evidence, support/licensing, non-prod parity, and contingency before go-live.',
      ],
      client_questions: [
        'Who owns each system of record and who can approve corrections, replay, reconciliation, and manual overrides?',
        'Where will ADRs, accepted risks, rejected alternatives, decision expiry dates, and approval evidence live?',
        'Which Security and Compliance validation gates must be closed before client-ready approval?',
        'What are pilot scope, rollout waves, stop/go thresholds, rollback triggers, game days, and support handoff criteria?',
        'Which budget, staffing, support, licensing, and non-prod requirements are mandatory before go-live?',
      ],
      review_limitations: [
        'Governance output is an architecture governance draft, not an architecture-board approval or client-approved decision.',
        'Recommendations become decisions only when named owners approve evidence, risks, gates, and review dates.',
      ],
      validation_gates: validationGates,
    },
    validation_needed: [
      'Collect owner-approved governance evidence pack before marking architecture governance as client-ready.',
    ],
  };
}

function isCustomerFacingDecision(item) {
  const text = [item?.what, item?.why, item?.owner, item].map(value => {
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value || '');
    } catch {
      return String(value || '');
    }
  }).join(' ').toLowerCase();
  return !/master agent|specialist review agent|agentic|architectiq retail|technology agents complete|infrastructure and technology agents complete|current review has guardrails/.test(text);
}

function augmentGovernanceReview(state) {
  const base = state.deterministicReview || {};
  const handoff = state.handoff || {};
  const sor = state.systemsOfRecord || {};
  const gates = state.gates || {};
  const knowledge = state.governanceKnowledge || {};
  const signalProfile = state.governanceSignalProfile || {};
  const findings = mergeArrayFields(base.findings, knowledge.controls, handoff.findings, gates.gates);
  const systems = mergeArrayFields(base.systems_of_record, (sor.systems || []).map(item => `${item.domain}: ${item.scope}. Owner: ${item.owner}. Status: ${item.status}.`));
  const systemsMatrix = sor.systems || [];
  const decisions = mergeArrayFields(base.decisions, gates.decisions).filter(isCustomerFacingDecision);
  const risks = mergeArrayFields(base.risks, knowledge.risks);
  const validationNeeded = mergeArrayFields(base.validation_needed, knowledge.validation_needed, handoff.validation_needed, sor.validation_needed, gates.validation_needed);
  const governanceQualification = {
    status: 'draft_requires_architecture_board_review',
    statement: 'This governance output is an architecture governance draft. It is not an architecture-board approval, client-approved decision, delivery sign-off, or accepted-risk record.',
    evidence_status: 'assumption_or_partial_until_named_owners_approve_evidence',
    required_reviewers: ['Architecture board', 'Security owner', 'Compliance/privacy owner', 'Operations/delivery owner', 'FinOps owner'],
  };
  const evidenceStatus = {
    governance: 'assumption',
    owners: systemsMatrix.length ? 'partial' : 'missing',
    decisions: decisions.length ? 'partial' : 'missing',
    rollout_readiness: 'assumption',
    security_handoff: handoff.handoff?.security_available ? 'partial' : 'missing',
    compliance_handoff: handoff.handoff?.compliance_available ? 'partial' : 'missing',
    finops_handoff: handoff.handoff?.finops_available ? 'partial' : 'missing',
  };
  const validationGates = validationNeeded.map(item => ({
    gate: item,
    owner: inferGovernanceOwner(item),
    status: 'requires human validation',
  }));
  const evidencePack = buildGovernanceEvidencePack({
    handoff,
    systems: sor,
    gates,
    knowledge,
    evidenceStatus,
    validationGates,
    governanceQualification,
  });
  const fullValidationNeeded = mergeArrayFields(validationNeeded, evidencePack.validation_needed);
  const statePatch = {
    ...(base.statePatch || {}),
    systems_of_record: systems,
    governance_controls: findings,
    architecture_decisions: decisions,
    governance_recommendation: mergeArrayFields(
      'Keep architecture governance draft-level until systems of record, decisions, Security/Compliance handoffs, rollout gates, evidence status, and named owner approvals are complete.',
      findings.slice(0, 8)
    ),
    governance_handoff_summary: handoff.handoff || {},
    systems_of_record_matrix: systemsMatrix,
    decision_records: decisions,
    approval_gates: gates.gates || [],
    rollout_readiness: (gates.gates || []).filter(item => /rollout|pilot|rollback|runbook|game|support|go-live|readiness/i.test(String(item))),
    governance_evidence_status: evidenceStatus,
    governance_validation_gates: validationGates,
    governance_qualification: governanceQualification,
    governance_policy_citations: knowledge.citations || [],
    governance_evidence_pack: evidencePack.evidence_pack,
    governance_signal_profile: {
      domains: signalProfile.domains || [],
      confidence_summary: signalProfile.confidence_summary || {},
      error_modes: signalProfile.error_modes || {},
    },
    human_validation_needed: mergeArrayFields(base.statePatch?.human_validation_needed, fullValidationNeeded),
    validation_gaps: mergeArrayFields(base.statePatch?.validation_gaps, fullValidationNeeded.map(item => `Governance validation required: ${item}`)),
    retrieval_requests: mergeArrayFields(base.statePatch?.retrieval_requests, state.retrievalPlan),
    governance_tool_context: {
      handoff,
      systems_of_record: sor,
      decision_approval_gates: gates,
      governance_knowledge: knowledge,
      governance_signal_profile: signalProfile,
    },
  };
  return {
    augmentedReview: {
      ...base,
      status: 'completed_with_tools',
      summary: 'Governance Agent completed tool-assisted review using Security and Compliance handoffs, systems-of-record ownership, and approval gates.',
      findings,
      governance_recommendation: statePatch.governance_recommendation,
      governance_handoff_summary: statePatch.governance_handoff_summary,
      systems_of_record: systems,
      systems_of_record_matrix: systemsMatrix,
      decisions,
      decision_records: decisions,
      approval_gates: statePatch.approval_gates,
      rollout_readiness: statePatch.rollout_readiness,
      governance_evidence_status: evidenceStatus,
      governance_validation_gates: validationGates,
      governance_qualification: governanceQualification,
      governance_policy_citations: knowledge.citations || [],
      governance_evidence_pack: evidencePack.evidence_pack,
      governance_signal_profile: statePatch.governance_signal_profile,
      risks,
      validation_needed: fullValidationNeeded,
      retrieval_requests: state.retrievalPlan,
      governance_tool_results: statePatch.governance_tool_context,
      statePatch,
    },
    trace: [trace('augment_governance_review', `Augmented governance review with ${compactToolResults(state).length} tool result(s).`)],
  };
}

function shouldRunModel(state) {
  return state.useModel ? 'model_judgement' : 'validate_governance_output';
}

async function runGovernanceModelJudgement(state) {
  const modelReview = await runGovernanceAgent({
    query: state.query,
    mode: state.mode,
    useModel: true,
    context: state.context,
    state: {
      ...state.architectureState,
      governance_tool_context: state.augmentedReview?.governance_tool_results,
      governance_signal_profile: state.augmentedReview?.governance_signal_profile,
      governance_qualification: state.augmentedReview?.governance_qualification,
      governance_policy_citations: state.augmentedReview?.governance_policy_citations,
      governance_evidence_pack: state.augmentedReview?.governance_evidence_pack,
    },
    retrievedContext: state.retrievedContext,
  });
  const usedModel = Boolean(modelReview?.model_review?.enabled);
  return {
    modelReview: usedModel ? enrichCandidateWithTools(modelReview, state) : null,
    trace: [trace('governance_model_judgement', usedModel ? modelReview.model_review?.error ? 'Model judgement failed; tool-assisted output retained.' : `Model judgement completed with ${modelReview.model_review?.model || 'configured model'}.` : 'Model judgement skipped because no model provider was available.')],
  };
}

function enrichCandidateWithTools(candidate, state) {
  const toolReview = state.augmentedReview || {};
  const candidateDecisions = mergeArrayFields(candidate.decisions, toolReview.decisions).filter(isCustomerFacingDecision);
  return {
    ...candidate,
    findings: mergeArrayFields(candidate.findings, toolReview.findings),
    governance_recommendation: mergeArrayFields(candidate.governance_recommendation, toolReview.governance_recommendation),
    governance_handoff_summary: toolReview.governance_handoff_summary || candidate.governance_handoff_summary,
    systems_of_record: mergeArrayFields(candidate.systems_of_record, toolReview.systems_of_record),
    systems_of_record_matrix: mergeArrayFields(candidate.systems_of_record_matrix, toolReview.systems_of_record_matrix),
    decisions: candidateDecisions,
    decision_records: mergeArrayFields(candidate.decision_records, toolReview.decision_records).filter(isCustomerFacingDecision),
    approval_gates: mergeArrayFields(candidate.approval_gates, toolReview.approval_gates),
    rollout_readiness: mergeArrayFields(candidate.rollout_readiness, toolReview.rollout_readiness),
    governance_evidence_status: toolReview.governance_evidence_status || candidate.governance_evidence_status,
    governance_validation_gates: mergeArrayFields(candidate.governance_validation_gates, toolReview.governance_validation_gates),
    governance_qualification: toolReview.governance_qualification || candidate.governance_qualification,
    governance_policy_citations: mergeArrayFields(candidate.governance_policy_citations, toolReview.governance_policy_citations),
    governance_evidence_pack: toolReview.governance_evidence_pack || candidate.governance_evidence_pack,
    governance_signal_profile: toolReview.governance_signal_profile || candidate.governance_signal_profile,
    risks: mergeArrayFields(candidate.risks, toolReview.risks),
    validation_needed: mergeArrayFields(candidate.validation_needed, toolReview.validation_needed),
    retrieval_requests: mergeArrayFields(candidate.retrieval_requests, state.retrievalPlan),
    governance_tool_results: toolReview.governance_tool_results,
    statePatch: {
      ...(candidate.statePatch || {}),
      systems_of_record: mergeArrayFields(candidate.statePatch?.systems_of_record, toolReview.systems_of_record),
      governance_controls: mergeArrayFields(candidate.statePatch?.governance_controls, toolReview.findings),
      architecture_decisions: candidateDecisions,
      governance_recommendation: mergeArrayFields(candidate.statePatch?.governance_recommendation, toolReview.governance_recommendation),
      governance_handoff_summary: toolReview.governance_handoff_summary || candidate.statePatch?.governance_handoff_summary,
      systems_of_record_matrix: mergeArrayFields(candidate.statePatch?.systems_of_record_matrix, toolReview.systems_of_record_matrix),
      decision_records: mergeArrayFields(candidate.statePatch?.decision_records, toolReview.decision_records).filter(isCustomerFacingDecision),
      approval_gates: mergeArrayFields(candidate.statePatch?.approval_gates, toolReview.approval_gates),
      rollout_readiness: mergeArrayFields(candidate.statePatch?.rollout_readiness, toolReview.rollout_readiness),
      governance_evidence_status: toolReview.governance_evidence_status || candidate.statePatch?.governance_evidence_status,
      governance_validation_gates: mergeArrayFields(candidate.statePatch?.governance_validation_gates, toolReview.governance_validation_gates),
      governance_qualification: toolReview.governance_qualification || candidate.statePatch?.governance_qualification,
      governance_policy_citations: mergeArrayFields(candidate.statePatch?.governance_policy_citations, toolReview.governance_policy_citations),
      governance_evidence_pack: toolReview.governance_evidence_pack || candidate.statePatch?.governance_evidence_pack,
      governance_signal_profile: toolReview.governance_signal_profile || candidate.statePatch?.governance_signal_profile,
      risks: mergeArrayFields(candidate.statePatch?.risks, toolReview.risks),
      human_validation_needed: mergeArrayFields(candidate.statePatch?.human_validation_needed, toolReview.validation_needed),
      validation_gaps: mergeArrayFields(candidate.statePatch?.validation_gaps, toolReview.statePatch?.validation_gaps),
      retrieval_requests: mergeArrayFields(candidate.statePatch?.retrieval_requests, state.retrievalPlan),
      governance_tool_context: toolReview.governance_tool_results,
    },
  };
}

async function validateGovernanceOutput(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const validation = await governanceTools.validateGovernanceOutputTool.invoke({ ...toolInput(state), output: candidate, toolResults: compactToolResults(state) });
  return {
    validation,
    trace: [trace('validate_governance_output', `Governance validation returned ${validation.verdict}.`, { blockers: validation.blockers?.length || 0, warnings: validation.warnings?.length || 0 })],
  };
}

function shouldRecommendGovernanceReview(state) {
  return state.validation?.verdict === 'pass' ? 'finalize_governance_output' : 'recommend_governance_review_actions';
}

async function recommendGovernanceReviewActions(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const notes = [
    ...(state.validation?.blockers || []).map(item => `Governance blocker: ${item}`),
    ...(state.validation?.warnings || []).map(item => `Governance warning: ${item}`),
  ];
  return {
    remediation: {
      ...candidate,
      status: candidate?.status === 'completed_with_model' ? 'completed_with_model_and_governance_review_recommendations' : 'completed_with_governance_review_recommendations',
      validation_needed: mergeArrayFields(candidate?.validation_needed, notes),
      statePatch: {
        ...(candidate?.statePatch || {}),
        human_validation_needed: mergeArrayFields(candidate?.statePatch?.human_validation_needed, notes),
        validation_gaps: mergeArrayFields(candidate?.statePatch?.validation_gaps, notes),
      },
      governance_review_recommendation: {
        reason: state.validation?.verdict,
        blockers: state.validation?.blockers || [],
        warnings: state.validation?.warnings || [],
        action: 'Output remains a governance review draft until decision owners validate blockers, warnings, approvals, evidence, and accepted risks.',
      },
    },
    trace: [trace('recommend_governance_review_actions', `Added ${notes.length} governance review recommendation note(s).`)],
  };
}

async function finalizeGovernanceOutput(state) {
  const selected = state.remediation || state.modelReview || state.augmentedReview || state.deterministicReview;
  const usedModel = Boolean(selected?.model_review?.enabled && !selected?.model_review?.error);
  return {
    output: {
      ...selected,
      status: selected?.model_review?.error ? 'completed_with_fallback' : selected?.governance_review_recommendation ? selected.status : usedModel ? 'completed_with_model' : selected?.status || 'completed_with_tools',
      graph_agent: {
        framework: 'langgraph',
        graph: 'governance_agent_graph',
        agent_type: 'tool_using_governance_agent',
        nodes: state.trace.map(item => item.node),
        tools: ['inspectArchitectureHandoffTool', 'buildSystemsOfRecordTool', 'buildDecisionAndApprovalGatesTool', 'retrieveGovernanceKnowledgeTool', 'validateGovernanceOutputTool'],
        retrieval_plan: state.retrievalPlan,
        validation: state.validation,
        trace: state.trace,
        upstream: state.handoff?.handoff || {},
        model_route: { requested: Boolean(state.useModel), used: usedModel, provider: selected?.model_review?.provider || (usedModel ? 'openai' : 'none'), model: selected?.model_review?.model || 'none' },
      },
      evidence: {
        ...selected?.evidence,
        graph_retrieval: state.evidence,
        local_governance_knowledge: state.governanceKnowledge?.docs || [],
        governance_policy_citations: selected?.governance_policy_citations || [],
        governance_evidence_pack: selected?.governance_evidence_pack || {},
        governance_signal_profile: selected?.governance_signal_profile || {},
        governance_tool_results: selected?.governance_tool_results,
      },
    },
    trace: [trace('finalize_governance_output', 'Finalized tool-using LangGraph Governance Agent output.')],
  };
}

const governanceAgentGraph = new StateGraph(GovernanceGraphState)
  .addNode('prepare_governance_context', prepareGovernanceContext)
  .addNode('inspect_architecture_handoff', inspectArchitectureHandoff)
  .addNode('build_systems_of_record', buildSystemsOfRecord)
  .addNode('build_decision_approval_gates', buildDecisionAndApprovalGates)
  .addNode('plan_governance_retrieval', planGovernanceRetrieval)
  .addNode('retrieve_governance_knowledge', retrieveGovernanceKnowledge)
  .addNode('deterministic_governance_review', runDeterministicGovernanceReview)
  .addNode('augment_governance_review', augmentGovernanceReview)
  .addNode('model_judgement', runGovernanceModelJudgement)
  .addNode('validate_governance_output', validateGovernanceOutput)
  .addNode('recommend_governance_review_actions', recommendGovernanceReviewActions)
  .addNode('finalize_governance_output', finalizeGovernanceOutput)
  .addEdge(START, 'prepare_governance_context')
  .addEdge('prepare_governance_context', 'inspect_architecture_handoff')
  .addEdge('inspect_architecture_handoff', 'build_systems_of_record')
  .addEdge('build_systems_of_record', 'build_decision_approval_gates')
  .addEdge('build_decision_approval_gates', 'plan_governance_retrieval')
  .addEdge('plan_governance_retrieval', 'retrieve_governance_knowledge')
  .addEdge('retrieve_governance_knowledge', 'deterministic_governance_review')
  .addEdge('deterministic_governance_review', 'augment_governance_review')
  .addConditionalEdges('augment_governance_review', shouldRunModel, { model_judgement: 'model_judgement', validate_governance_output: 'validate_governance_output' })
  .addEdge('model_judgement', 'validate_governance_output')
  .addConditionalEdges('validate_governance_output', shouldRecommendGovernanceReview, { recommend_governance_review_actions: 'recommend_governance_review_actions', finalize_governance_output: 'finalize_governance_output' })
  .addEdge('recommend_governance_review_actions', 'finalize_governance_output')
  .addEdge('finalize_governance_output', END)
  .compile();

async function runGovernanceAgentGraph({ query, mode, useModel, context, state, retrievedContext }) {
  const result = await governanceAgentGraph.invoke({ query, mode, useModel, context, architectureState: state, retrievedContext });
  return result.output;
}

module.exports = {
  governanceAgentGraph,
  runGovernanceAgentGraph,
};
