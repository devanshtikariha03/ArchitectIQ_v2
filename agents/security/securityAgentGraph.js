const { Annotation, END, START, StateGraph } = require('@langchain/langgraph');
const { runSecurityAgent } = require('./securityAgent');
const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeUnique } = require('../schema');
const { securityTools } = require('./securityTools');
const { classifySecuritySignals } = require('./securitySignalClassifier');

const SecurityGraphState = Annotation.Root({
  query: Annotation({ reducer: (_current, update) => update, default: () => '' }),
  mode: Annotation({ reducer: (_current, update) => update, default: () => 'architecture-review' }),
  useModel: Annotation({ reducer: (_current, update) => update, default: () => true }),
  context: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  architectureState: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  retrievedContext: Annotation({ reducer: (_current, update) => update, default: () => [] }),
  signals: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  signalProfile: Annotation({ reducer: (_current, update) => update, default: () => null }),
  dataClassification: Annotation({ reducer: (_current, update) => update, default: () => null }),
  paymentScope: Annotation({ reducer: (_current, update) => update, default: () => null }),
  aiSecurityScope: Annotation({ reducer: (_current, update) => update, default: () => null }),
  trustBoundaryModel: Annotation({ reducer: (_current, update) => update, default: () => null }),
  retrievalPlan: Annotation({ reducer: (_current, update) => update, default: () => [] }),
  ragContext: Annotation({ reducer: (_current, update) => update, default: () => null }),
  enterpriseControlMap: Annotation({ reducer: (_current, update) => update, default: () => null }),
  threatModel: Annotation({ reducer: (_current, update) => update, default: () => null }),
  complianceControlMap: Annotation({ reducer: (_current, update) => update, default: () => null }),
  securityEvidencePack: Annotation({ reducer: (_current, update) => update, default: () => null }),
  evidence: Annotation({ reducer: (_current, update) => update, default: () => ({}) }),
  deterministicReview: Annotation({ reducer: (_current, update) => update, default: () => null }),
  augmentedReview: Annotation({ reducer: (_current, update) => update, default: () => null }),
  modelReview: Annotation({ reducer: (_current, update) => update, default: () => null }),
  validation: Annotation({
    reducer: (_current, update) => update,
    default: () => ({ verdict: 'pending', blockers: [], warnings: [], improvements: [] }),
  }),
  remediation: Annotation({ reducer: (_current, update) => update, default: () => null }),
  output: Annotation({ reducer: (_current, update) => update, default: () => null }),
  trace: Annotation({
    reducer: (current, update) => [...(current || []), ...(update || [])],
    default: () => [],
  }),
});

function trace(node, detail, extra = {}) {
  return {
    node,
    detail,
    ...extra,
    at: new Date().toISOString(),
  };
}

function compactToolResults(state) {
  return [
    state.dataClassification,
    state.paymentScope,
    state.aiSecurityScope,
    state.trustBoundaryModel,
    state.signalProfile,
    state.ragContext,
    state.enterpriseControlMap,
    state.threatModel,
    state.complianceControlMap,
    state.securityEvidencePack,
  ].filter(Boolean);
}

function mergeArrayFields(...arrays) {
  return mergeUnique([], arrays.flat().filter(Boolean));
}

function compactString(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function buildSecurityV2Output({ base = {}, data = {}, payment = {}, ai = {}, trust = {}, rag = {}, enterprise = {}, threat = {}, compliance = {}, evidencePack = {}, signalProfile = {}, findings = [], validationNeeded = [] }) {
  const dataClasses = data.classes || [];
  const trustBoundaries = trust.boundaries || [];
  const paymentControls = payment.in_scope
    ? payment.controls || []
    : ['Confirm whether payment, refund, gift-card, wallet, UPI, POS, or PSP flows are in scope before excluding PCI controls.'];
  const aiControls = ai.in_scope
    ? ai.controls || []
    : ['Confirm whether AI assistant, recommendation, RAG, vector store, embedding, or model-tool workflows are in scope before excluding AI security controls.'];
  const recommendation = mergeArrayFields(
    'Approve only a security-reviewed architecture that classifies retail data, defines trust boundaries, proves encryption/key ownership, and closes payment, AI/RAG, logging, support-access, and human-validation gaps.',
    findings.slice(0, 8)
  );
  const approvalGates = mergeArrayFields(
    validationNeeded.map(item => ({ gate: item, owner: inferApprovalOwner(item), status: 'requires human validation' }))
  );
  const diagramAnnotations = mergeArrayFields(
    trustBoundaries.flatMap(boundary => (boundary.required_annotations || []).map(annotation => ({
      boundary: boundary.boundary,
      annotation,
      reason: boundary.covers,
    }))),
    [
      { boundary: 'All sensitive data paths', annotation: 'C3/C5/C5E', reason: 'Every data flow must show its retail data class.' },
      { boundary: 'All service and third-party flows', annotation: 'T/R2/R3', reason: 'Show encryption in transit and at rest with key ownership.' },
      { boundary: 'External processors and AI/model providers', annotation: 'SB/TB', reason: 'Show external security boundary and trust boundary ownership.' },
    ]
  );

  return {
    security_recommendation: recommendation,
    data_classification_matrix: dataClasses.map(item => ({
      class: item.class || 'unknown',
      data: item.data || 'not specified',
      handling: item.handling || 'requires validation',
      data_paths: data.data_paths || [],
      evidence_status: 'assumption',
    })),
    trust_boundaries: trustBoundaries.map(item => ({
      boundary: item.boundary,
      covers: item.covers,
      required_annotations: item.required_annotations || [],
      validation_status: 'requires owner confirmation',
    })),
    payment_security: {
      in_scope: Boolean(payment.in_scope),
      scope: payment.scope || 'Payment scope not confirmed.',
      required_controls: paymentControls,
      evidence_needed: payment.validation_needed || [],
      approval_owner: payment.in_scope ? 'Payment/security owner and QSA where PCI applies' : 'Security owner',
    },
    ai_security: {
      in_scope: Boolean(ai.in_scope),
      required_controls: aiControls,
      evidence_needed: ai.validation_needed || [],
      approval_owner: ai.in_scope ? 'AI platform owner, security owner, privacy owner, and support operations owner' : 'Security owner',
    },
    required_controls: findings,
    approval_gates: approvalGates,
    diagram_annotations: diagramAnnotations,
    accepted_assumptions: mergeArrayFields(
      base.assumptions,
      'Security posture is not client-approved until data classes, data flows, payment boundary, AI/RAG paths, key ownership, support access, logging, and trust-boundary evidence are validated.',
      rag.docs?.length ? `Security recommendations are grounded in local playbooks: ${rag.docs.map(doc => doc.id).join(', ')}.` : null
    ),
    enterprise_control_map: enterprise.control_domains || [],
    threat_model: {
      methodology: threat.methodology || 'STRIDE plus retail abuse cases',
      threats: threat.threats || [],
    },
    compliance_control_map: compliance.mappings || [],
    compliance_qualification: {
      status: 'draft_requires_human_review',
      statement: 'Security compliance mapping is an architecture review draft only. It is not legal advice, QSA sign-off, certification, audit attestation, or a substitute for privacy, legal, security, and compliance owner review.',
      evidence_status: 'assumption_or_partial_until_client_evidence_is_verified',
      required_reviewers: ['Security owner', 'Compliance/privacy owner', 'Legal counsel where applicable', 'QSA where PCI applies'],
    },
    security_evidence_pack: evidencePack.evidence_pack || {},
    policy_citations: mergeArrayFields(rag.citations, evidencePack.evidence_pack?.citations),
    security_signal_profile: {
      domains: signalProfile.domains || [],
      confidence_summary: signalProfile.confidence_summary || {},
      error_modes: signalProfile.error_modes || {},
    },
  };
}

function inferApprovalOwner(item) {
  const text = compactString(item).toLowerCase();
  if (/pci|pan|sad|psp|p2pe|payment|qsa/.test(text)) return 'Payment security owner / QSA';
  if (/ai|rag|vector|embedding|prompt|model|tool/.test(text)) return 'AI platform owner + security owner';
  if (/privacy|customer|loyalty|support|dsar|deletion|retention/.test(text)) return 'Privacy/data owner + support operations owner';
  if (/key|secret|certificate|iam|credential/.test(text)) return 'Security platform owner';
  if (/diagram|boundary|saas|processor|provider/.test(text)) return 'Solution architect + security owner';
  return 'Named business, security, and platform owner';
}

function toolInput(state) {
  return {
    query: state.query,
    context: state.context,
    state: state.architectureState,
    signals: state.signals,
  };
}

async function prepareSecurityContext(state) {
  const signals = getRetailSignals({
    query: state.query,
    context: state.context,
    state: state.architectureState,
  });
  const signalProfile = classifySecuritySignals({
    query: state.query,
    context: state.context,
    state: state.architectureState,
    signals,
  });
  return {
    signals,
    signalProfile,
    trace: [trace('prepare_security_context', `Detected ${signals.workloadTypes.length || 0} retail workload signal(s) and ${signalProfile.domains.length} security domain signal(s).`)],
  };
}

async function classifySecurityData(state) {
  const dataClassification = await securityTools.classifyRetailDataTool.invoke(toolInput(state));
  return {
    dataClassification,
    trace: [trace('classify_security_data', `Classified ${dataClassification.classes?.length || 0} data class(es).`)],
  };
}

async function inspectPaymentScope(state) {
  const paymentScope = await securityTools.detectPaymentScopeTool.invoke(toolInput(state));
  return {
    paymentScope,
    trace: [trace('inspect_payment_scope', paymentScope.in_scope ? 'Payment/PCI scope detected.' : 'No explicit payment/PCI scope detected.')],
  };
}

async function inspectAiSecurityScope(state) {
  const aiSecurityScope = await securityTools.detectAiSecurityScopeTool.invoke(toolInput(state));
  return {
    aiSecurityScope,
    trace: [trace('inspect_ai_security_scope', aiSecurityScope.in_scope ? 'Retail AI/RAG/tool security scope detected.' : 'No explicit AI/RAG/tool security scope detected.')],
  };
}

async function buildTrustBoundaries(state) {
  const trustBoundaryModel = await securityTools.buildTrustBoundaryTool.invoke(toolInput(state));
  return {
    trustBoundaryModel,
    trace: [trace('build_trust_boundaries', `Built ${trustBoundaryModel.boundaries?.length || 0} trust/security boundary model(s).`)],
  };
}

async function planSecurityRetrieval(state) {
  const text = compactString([
    state.query,
    state.context,
    state.architectureState,
  ].map(item => typeof item === 'string' ? item : JSON.stringify(item || {})).join(' ')).toLowerCase();
  const plan = [
    'retail-security-control-playbook',
    'retail-data-classification-and-encryption-standard',
    'trust-boundary-and-diagram-annotation-standard',
  ];
  if (state.paymentScope?.in_scope || state.signals?.payments) plan.push('pci-scope-and-tokenization-boundary-template');
  if (state.signals?.storeEdge) plan.push('store-edge-offline-security-acceptance-tests');
  if (state.aiSecurityScope?.in_scope || state.signals?.retailAi) plan.push('retail-ai-rag-tool-security-playbook');
  if (state.signals?.customerData || state.signals?.loyaltyData) plan.push('retail-privacy-support-access-redaction-standard');
  if (state.signals?.multiRegion || /global|multi-region|multi region|residency|sovereignty|cross-border|eu|uk|us|india|australia|new zealand/.test(text)) {
    plan.push('multi-region-data-security');
  }
  if (state.signals?.supplyChain || /marketplace|seller|supplier|vendor|partner|edi|sftp|webhook|dropship|logistics|carrier/.test(text)) {
    plan.push('partner-marketplace-security');
  }
  if (/terraform|iac|infrastructure as code|ci\/cd|cicd|pipeline|github|pull request|cloud config|config drift|drift|iam policy|security group|firewall rule|public bucket|public storage|s3 bucket|blob container/.test(text)) {
    plan.push('continuous-configuration-drift-security');
  }
  if (/loyalty point|gift card|coupon|promotion loop|promo loop|return fraud|refund abuse|counterfeit|delivery failure|policy abuse|fraud ring|serial return|balance check/.test(text)) {
    plan.push('retail-fraud-policy-abuse-security');
  }
  if (/b2b|3pl|asn|supplier feed|wms|erp|edi|sftp|file feed|csv|xml|payload validation|quarantine|malware scanning|carrier webhook/.test(text)) {
    plan.push('b2b-ingestion-security');
  }
  if (/admin|backoffice|back office|price override|promotion|refund approval|manual adjustment|maker.?checker|four.?eyes|privileged|support impersonation/.test(text)) {
    plan.push('privileged-operations-security');
  }
  for (const hint of state.signalProfile?.retrieval_hints || []) {
    plan.push(hint);
  }
  return {
    retrievalPlan: [...new Set(plan)],
    evidence: retailEvidence(state.retrievedContext),
    trace: [trace('plan_security_retrieval', `Planned ${plan.length} security retrieval request(s).`)],
  };
}

async function retrieveSecurityKnowledge(state) {
  const ragContext = await securityTools.retrieveSecurityKnowledgeTool.invoke({
    ...toolInput(state),
    retrievalPlan: state.retrievalPlan,
    limit: 6,
  });
  return {
    ragContext,
    trace: [trace('retrieve_security_knowledge', `Retrieved ${ragContext.docs?.length || 0} local security knowledge document(s).`)],
  };
}

async function mapEnterpriseSecurityControls(state) {
  const enterpriseControlMap = await securityTools.mapEnterpriseSecurityControlsTool.invoke({
    ...toolInput(state),
    ragContext: state.ragContext,
  });
  return {
    enterpriseControlMap,
    trace: [trace('map_enterprise_security_controls', `Mapped ${enterpriseControlMap.control_domains?.length || 0} enterprise security control domain(s).`)],
  };
}

async function buildSecurityThreatModel(state) {
  const threatModel = await securityTools.buildThreatModelTool.invoke({
    ...toolInput(state),
    ragContext: state.ragContext,
  });
  return {
    threatModel,
    trace: [trace('build_security_threat_model', `Built ${threatModel.threats?.length || 0} threat model item(s).`)],
  };
}

async function mapSecurityComplianceControls(state) {
  const complianceControlMap = await securityTools.mapComplianceControlsTool.invoke({
    ...toolInput(state),
    ragContext: state.ragContext,
  });
  return {
    complianceControlMap,
    trace: [trace('map_security_compliance_controls', `Mapped ${complianceControlMap.mappings?.length || 0} compliance framework(s).`)],
  };
}

async function buildSecurityEvidencePack(state) {
  const securityEvidencePack = await securityTools.buildSecurityEvidencePackTool.invoke({
    ...toolInput(state),
    ragContext: state.ragContext,
  });
  return {
    securityEvidencePack,
    trace: [trace('build_security_evidence_pack', `Built evidence pack with ${securityEvidencePack.evidence_pack?.policy_sources?.length || 0} policy source(s).`)],
  };
}

async function runDeterministicSecurityControls(state) {
  const deterministicReview = await runSecurityAgent({
    query: state.query,
    mode: state.mode,
    useModel: false,
    context: state.context,
    state: state.architectureState,
    retrievedContext: state.retrievedContext,
  });
  return {
    deterministicReview,
    trace: [trace('deterministic_security_controls', `Produced ${deterministicReview.findings?.length || 0} deterministic security control(s).`)],
  };
}

function augmentSecurityReview(state) {
  const base = state.deterministicReview || {};
  const data = state.dataClassification || {};
  const payment = state.paymentScope || {};
  const ai = state.aiSecurityScope || {};
  const trust = state.trustBoundaryModel || {};
  const rag = state.ragContext || {};
  const enterprise = state.enterpriseControlMap || {};
  const threat = state.threatModel || {};
  const compliance = state.complianceControlMap || {};
  const evidencePack = state.securityEvidencePack || {};
  const signalProfile = state.signalProfile || {};
  const risks = mergeArrayFields(base.risks, payment.risks, ai.risks, rag.risks, threat.risks);
  const findings = mergeArrayFields(
    base.findings,
    rag.controls,
    enterprise.controls,
    data.findings,
    payment.controls,
    ai.controls,
    trust.controls,
    (trust.boundaries || []).map(item => `Trust boundary: ${item.boundary} covers ${item.covers}. Required annotations: ${(item.required_annotations || []).join(', ')}.`)
  );
  const validationNeeded = mergeArrayFields(
    base.validation_needed,
    data.validation_needed,
    payment.validation_needed,
    ai.validation_needed,
    trust.validation_needed,
    rag.validation_needed,
    enterprise.validation_needed,
    threat.validation_needed,
    compliance.validation_needed,
    evidencePack.validation_needed
  );
  const dataClasses = mergeArrayFields(
    base.statePatch?.data_classification,
    (data.classes || []).map(item => `${item.class}: ${item.data}. Handling: ${item.handling}.`)
  );
  const statePatch = {
    ...(base.statePatch || {}),
    data_classification: dataClasses,
    security_controls: findings,
    risks,
    human_validation_needed: mergeArrayFields(base.statePatch?.human_validation_needed, validationNeeded),
    validation_gaps: mergeArrayFields(base.statePatch?.validation_gaps, validationNeeded.map(item => `Security validation required: ${item}`)),
    retrieval_requests: mergeArrayFields(base.statePatch?.retrieval_requests, state.retrievalPlan),
    security_tool_context: {
      data_classification: data,
      payment_scope: payment,
      ai_security_scope: ai,
      trust_boundaries: trust,
      rag_context: rag,
      enterprise_controls: enterprise,
      threat_model: threat,
      compliance_control_map: compliance,
      evidence_pack: evidencePack,
      signal_profile: signalProfile,
    },
  };
  const structured = buildSecurityV2Output({ base, data, payment, ai, trust, rag, enterprise, threat, compliance, evidencePack, signalProfile, findings, validationNeeded });
  Object.assign(statePatch, {
    security_recommendation: structured.security_recommendation,
    data_classification_matrix: structured.data_classification_matrix,
    trust_boundaries: structured.trust_boundaries,
    payment_security: structured.payment_security,
    ai_security: structured.ai_security,
    required_security_controls: structured.required_controls,
    security_approval_gates: structured.approval_gates,
    diagram_annotations: structured.diagram_annotations,
    accepted_security_assumptions: structured.accepted_assumptions,
    enterprise_control_map: structured.enterprise_control_map,
    threat_model: structured.threat_model,
    compliance_control_map: structured.compliance_control_map,
    compliance_qualification: structured.compliance_qualification,
    security_evidence_pack: structured.security_evidence_pack,
    policy_citations: structured.policy_citations,
    security_signal_profile: structured.security_signal_profile,
  });

  const augmentedReview = {
    ...base,
    status: 'completed_with_tools',
    summary: 'Security Agent completed tool-assisted retail security analysis across data classification, PCI/payment scope, AI/RAG/tooling paths, and trust boundaries.',
    findings,
    ...structured,
    risks,
    validation_needed: validationNeeded,
    retrieval_requests: state.retrievalPlan,
    security_tool_results: {
      data_classification: data,
      payment_scope: payment,
      ai_security_scope: ai,
      trust_boundaries: trust,
      rag_context: rag,
      enterprise_controls: enterprise,
      threat_model: threat,
      compliance_control_map: compliance,
      evidence_pack: evidencePack,
      signal_profile: signalProfile,
    },
    statePatch,
  };

  return {
    augmentedReview,
    trace: [trace('augment_security_review', `Augmented deterministic security review with ${compactToolResults(state).length} tool result(s).`)],
  };
}

function shouldRunModel(state) {
  return state.useModel ? 'model_judgement' : 'validate_security_output';
}

async function runSecurityModelJudgement(state) {
  const modelState = {
    ...state.architectureState,
    security_tool_context: state.augmentedReview?.security_tool_results,
    security_tool_validation_needed: state.augmentedReview?.validation_needed,
    security_rag_context: state.augmentedReview?.security_tool_results?.rag_context,
    enterprise_security_context: {
      enterprise_control_map: state.augmentedReview?.enterprise_control_map,
      threat_model: state.augmentedReview?.threat_model,
      compliance_control_map: state.augmentedReview?.compliance_control_map,
      compliance_qualification: state.augmentedReview?.compliance_qualification,
      security_evidence_pack: state.augmentedReview?.security_evidence_pack,
      policy_citations: state.augmentedReview?.policy_citations,
      security_signal_profile: state.augmentedReview?.security_signal_profile,
    },
  };
  const modelReview = await runSecurityAgent({
    query: state.query,
    mode: state.mode,
    useModel: true,
    context: state.context,
    state: modelState,
    retrievedContext: state.retrievedContext,
  });
  const usedModel = Boolean(modelReview?.model_review?.enabled);
  return {
    modelReview: usedModel ? enrichCandidateWithTools(modelReview, state) : null,
    trace: [trace('security_model_judgement', usedModel
      ? modelReview.model_review?.error
        ? 'Model judgement failed; tool-assisted deterministic output retained.'
        : `Model judgement completed with ${modelReview.model_review?.model || 'configured model'}.`
      : 'Model judgement skipped because no model provider was available in this process.')],
  };
}

function enrichCandidateWithTools(candidate, state) {
  const toolReview = state.augmentedReview || {};
  return {
    ...candidate,
    findings: mergeArrayFields(candidate.findings, toolReview.findings),
    security_recommendation: mergeArrayFields(candidate.security_recommendation, toolReview.security_recommendation),
    data_classification_matrix: mergeArrayFields(candidate.data_classification_matrix, toolReview.data_classification_matrix),
    trust_boundaries: mergeArrayFields(candidate.trust_boundaries, toolReview.trust_boundaries),
    payment_security: toolReview.payment_security || candidate.payment_security,
    ai_security: toolReview.ai_security || candidate.ai_security,
    required_controls: mergeArrayFields(candidate.required_controls, toolReview.required_controls),
    approval_gates: mergeArrayFields(candidate.approval_gates, toolReview.approval_gates),
    diagram_annotations: mergeArrayFields(candidate.diagram_annotations, toolReview.diagram_annotations),
    enterprise_control_map: mergeArrayFields(candidate.enterprise_control_map, toolReview.enterprise_control_map),
    threat_model: toolReview.threat_model || candidate.threat_model,
    compliance_control_map: mergeArrayFields(candidate.compliance_control_map, toolReview.compliance_control_map),
    compliance_qualification: toolReview.compliance_qualification || candidate.compliance_qualification,
    security_evidence_pack: toolReview.security_evidence_pack || candidate.security_evidence_pack,
    policy_citations: mergeArrayFields(candidate.policy_citations, toolReview.policy_citations),
    security_signal_profile: toolReview.security_signal_profile || candidate.security_signal_profile,
    accepted_assumptions: mergeArrayFields(candidate.accepted_assumptions, toolReview.accepted_assumptions),
    risks: mergeArrayFields(candidate.risks, toolReview.risks),
    validation_needed: mergeArrayFields(candidate.validation_needed, toolReview.validation_needed),
    retrieval_requests: mergeArrayFields(candidate.retrieval_requests, state.retrievalPlan),
    security_tool_results: toolReview.security_tool_results,
    statePatch: {
      ...(candidate.statePatch || {}),
      data_classification: mergeArrayFields(candidate.statePatch?.data_classification, toolReview.statePatch?.data_classification),
      security_controls: mergeArrayFields(candidate.statePatch?.security_controls, toolReview.findings),
      security_recommendation: mergeArrayFields(candidate.statePatch?.security_recommendation, toolReview.security_recommendation),
      data_classification_matrix: mergeArrayFields(candidate.statePatch?.data_classification_matrix, toolReview.data_classification_matrix),
      trust_boundaries: mergeArrayFields(candidate.statePatch?.trust_boundaries, toolReview.trust_boundaries),
      payment_security: toolReview.payment_security || candidate.statePatch?.payment_security,
      ai_security: toolReview.ai_security || candidate.statePatch?.ai_security,
      required_security_controls: mergeArrayFields(candidate.statePatch?.required_security_controls, toolReview.required_controls),
      security_approval_gates: mergeArrayFields(candidate.statePatch?.security_approval_gates, toolReview.approval_gates),
      diagram_annotations: mergeArrayFields(candidate.statePatch?.diagram_annotations, toolReview.diagram_annotations),
      enterprise_control_map: mergeArrayFields(candidate.statePatch?.enterprise_control_map, toolReview.enterprise_control_map),
      threat_model: toolReview.threat_model || candidate.statePatch?.threat_model,
      compliance_control_map: mergeArrayFields(candidate.statePatch?.compliance_control_map, toolReview.compliance_control_map),
      compliance_qualification: toolReview.compliance_qualification || candidate.statePatch?.compliance_qualification,
      security_evidence_pack: toolReview.security_evidence_pack || candidate.statePatch?.security_evidence_pack,
      policy_citations: mergeArrayFields(candidate.statePatch?.policy_citations, toolReview.policy_citations),
      security_signal_profile: toolReview.security_signal_profile || candidate.statePatch?.security_signal_profile,
      accepted_security_assumptions: mergeArrayFields(candidate.statePatch?.accepted_security_assumptions, toolReview.accepted_assumptions),
      risks: mergeArrayFields(candidate.statePatch?.risks, toolReview.risks),
      human_validation_needed: mergeArrayFields(candidate.statePatch?.human_validation_needed, toolReview.validation_needed),
      validation_gaps: mergeArrayFields(candidate.statePatch?.validation_gaps, toolReview.statePatch?.validation_gaps),
      retrieval_requests: mergeArrayFields(candidate.statePatch?.retrieval_requests, state.retrievalPlan),
      security_tool_context: toolReview.security_tool_results,
    },
  };
}

async function validateSecurityOutput(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const validation = await securityTools.validateSecurityOutputTool.invoke({
    ...toolInput(state),
    output: candidate,
    toolResults: compactToolResults(state),
  });
  return {
    validation,
    trace: [trace('validate_security_output', `Security validation returned ${validation.verdict}.`, {
      blockers: validation.blockers?.length || 0,
      warnings: validation.warnings?.length || 0,
    })],
  };
}

function shouldRecommendSecurityReview(state) {
  if (state.validation?.verdict === 'pass') return 'finalize_security_output';
  return 'recommend_security_review_actions';
}

async function recommendSecurityReviewActions(state) {
  const candidate = state.modelReview || state.augmentedReview || state.deterministicReview;
  const blockers = state.validation?.blockers || [];
  const warnings = state.validation?.warnings || [];
  const reviewNotes = [
    ...blockers.map(item => `Security blocker: ${item}`),
    ...warnings.map(item => `Security warning: ${item}`),
  ];
  const recommended = {
    ...candidate,
    status: candidate?.status === 'completed_with_model' ? 'completed_with_model_and_security_review_recommendations' : 'completed_with_security_review_recommendations',
    validation_needed: mergeArrayFields(candidate?.validation_needed, reviewNotes),
    statePatch: {
      ...(candidate?.statePatch || {}),
      human_validation_needed: mergeArrayFields(candidate?.statePatch?.human_validation_needed, reviewNotes),
      validation_gaps: mergeArrayFields(candidate?.statePatch?.validation_gaps, reviewNotes),
    },
    security_review_recommendation: {
      reason: state.validation?.verdict,
      blockers,
      warnings,
      action: 'Output remains a security review draft. Blocked or warned items require named-owner validation before client-ready approval.',
    },
  };

  return {
    remediation: recommended,
    trace: [trace('recommend_security_review_actions', `Added ${reviewNotes.length} security review recommendation note(s).`)],
  };
}

async function finalizeSecurityOutput(state) {
  const selected = state.remediation || state.modelReview || state.augmentedReview || state.deterministicReview;
  const usedModel = Boolean(selected?.model_review?.enabled && !selected?.model_review?.error);
  const status = selected?.model_review?.error
    ? 'completed_with_fallback'
    : selected?.security_review_recommendation
      ? selected.status
      : usedModel
        ? 'completed_with_model'
        : selected?.status || 'completed_with_tools';

  const output = {
    ...selected,
    status,
    graph_agent: {
      framework: 'langgraph',
      graph: 'security_agent_graph',
      agent_type: 'tool_using_security_agent',
      nodes: state.trace.map(item => item.node),
      tools: [
        'classifyRetailDataTool',
        'detectPaymentScopeTool',
        'detectAiSecurityScopeTool',
        'buildTrustBoundaryTool',
        'retrieveSecurityKnowledgeTool',
        'mapEnterpriseSecurityControlsTool',
        'buildThreatModelTool',
        'mapComplianceControlsTool',
        'buildSecurityEvidencePackTool',
        'validateSecurityOutputTool',
      ],
      retrieval_plan: state.retrievalPlan,
      retrieved_docs: state.ragContext?.docs || [],
      validation: state.validation,
      trace: state.trace,
      model_route: {
        requested: Boolean(state.useModel),
        used: usedModel,
        provider: selected?.model_review?.provider || (usedModel ? 'openai' : 'none'),
        model: selected?.model_review?.model || 'none',
      },
    },
    evidence: {
      ...selected?.evidence,
      graph_retrieval: state.evidence,
      local_security_knowledge: state.ragContext?.docs || [],
      policy_citations: selected?.policy_citations || [],
      security_signal_profile: selected?.security_signal_profile || {},
      security_tool_results: selected?.security_tool_results,
    },
  };

  return {
    output,
    trace: [trace('finalize_security_output', 'Finalized tool-using LangGraph Security Agent output.')],
  };
}

const securityAgentGraph = new StateGraph(SecurityGraphState)
  .addNode('prepare_security_context', prepareSecurityContext)
  .addNode('classify_security_data', classifySecurityData)
  .addNode('inspect_payment_scope', inspectPaymentScope)
  .addNode('inspect_ai_security_scope', inspectAiSecurityScope)
  .addNode('build_trust_boundaries', buildTrustBoundaries)
  .addNode('plan_security_retrieval', planSecurityRetrieval)
  .addNode('retrieve_security_knowledge', retrieveSecurityKnowledge)
  .addNode('map_enterprise_security_controls', mapEnterpriseSecurityControls)
  .addNode('build_security_threat_model', buildSecurityThreatModel)
  .addNode('map_security_compliance_controls', mapSecurityComplianceControls)
  .addNode('build_security_evidence_pack', buildSecurityEvidencePack)
  .addNode('deterministic_security_controls', runDeterministicSecurityControls)
  .addNode('augment_security_review', augmentSecurityReview)
  .addNode('model_judgement', runSecurityModelJudgement)
  .addNode('validate_security_output', validateSecurityOutput)
  .addNode('recommend_security_review_actions', recommendSecurityReviewActions)
  .addNode('finalize_security_output', finalizeSecurityOutput)
  .addEdge(START, 'prepare_security_context')
  .addEdge('prepare_security_context', 'classify_security_data')
  .addEdge('classify_security_data', 'inspect_payment_scope')
  .addEdge('inspect_payment_scope', 'inspect_ai_security_scope')
  .addEdge('inspect_ai_security_scope', 'build_trust_boundaries')
  .addEdge('build_trust_boundaries', 'plan_security_retrieval')
  .addEdge('plan_security_retrieval', 'retrieve_security_knowledge')
  .addEdge('retrieve_security_knowledge', 'map_enterprise_security_controls')
  .addEdge('map_enterprise_security_controls', 'build_security_threat_model')
  .addEdge('build_security_threat_model', 'map_security_compliance_controls')
  .addEdge('map_security_compliance_controls', 'build_security_evidence_pack')
  .addEdge('build_security_evidence_pack', 'deterministic_security_controls')
  .addEdge('deterministic_security_controls', 'augment_security_review')
  .addConditionalEdges('augment_security_review', shouldRunModel, {
    model_judgement: 'model_judgement',
    validate_security_output: 'validate_security_output',
  })
  .addEdge('model_judgement', 'validate_security_output')
  .addConditionalEdges('validate_security_output', shouldRecommendSecurityReview, {
    recommend_security_review_actions: 'recommend_security_review_actions',
    finalize_security_output: 'finalize_security_output',
  })
  .addEdge('recommend_security_review_actions', 'finalize_security_output')
  .addEdge('finalize_security_output', END)
  .compile();

async function runSecurityAgentGraph({ query, mode, useModel, context, state, retrievedContext }) {
  const result = await securityAgentGraph.invoke({
    query,
    mode,
    useModel,
    context,
    architectureState: state,
    retrievedContext,
  });
  return result.output;
}

module.exports = {
  runSecurityAgentGraph,
  securityAgentGraph,
};
