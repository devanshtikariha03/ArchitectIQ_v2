const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const { buildRetailText, getRetailSignals } = require('../retailContext');
const { retrieveGovernanceKnowledge } = require('./governanceKnowledgeBase');

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function textFromInput(input = {}) {
  return buildRetailText({
    query: input.query || '',
    context: input.context || {},
    state: input.state || {},
  }).toLowerCase();
}

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

function inspectArchitectureHandoff(input = {}) {
  const state = input.state || {};
  const security = state.agent_outputs?.security || {};
  const compliance = state.agent_outputs?.compliance || {};
  const handoff = {
    security_available: Boolean(security.agentId || state.security_tool_context),
    compliance_available: Boolean(compliance.agentId || state.compliance_tool_context),
    finops_available: Boolean(state.agent_outputs?.finops || state.finops_tool_context),
    security_validation: security.graph_agent?.validation?.verdict || 'unknown',
    compliance_validation: compliance.graph_agent?.validation?.verdict || 'unknown',
    evidence_status: state.evidence_status || {},
    validation_gaps: asArray(state.validation_gaps),
    security_summary: {
      data_classes: asArray(state.data_classification).length,
      payment_in_scope: Boolean(state.payment_security?.in_scope || security.payment_security?.in_scope),
      ai_in_scope: Boolean(state.ai_security?.in_scope || security.ai_security?.in_scope),
      signal_profile: state.security_signal_profile || security.security_signal_profile || {},
    },
    compliance_summary: {
      frameworks: asArray(state.jurisdiction_frameworks).map(item => item.framework || item),
      evidence_status: state.compliance_evidence_status || {},
      validation_gates: asArray(state.compliance_validation_gates).length,
      signal_profile: state.compliance_signal_profile || {},
    },
  };
  const findings = [];
  if (handoff.security_available) findings.push('Security handoff is available and should drive data, PCI/payment, AI/RAG, trust-boundary, and support-access governance gates.');
  if (handoff.compliance_available) findings.push('Compliance handoff is available and should drive jurisdiction, residency, processor, retention, deletion, and audit governance gates.');
  if (!handoff.security_available) findings.push('Security handoff is missing; governance must remain draft until data classification and security boundaries are available.');
  if (!handoff.compliance_available) findings.push('Compliance handoff is missing; governance must remain draft until residency and processor obligations are available.');
  if (handoff.finops_available) findings.push('FinOps handoff is available and should drive budget, unit-driver, support/licensing, non-prod parity, contingency, and cost-risk governance gates.');
  return {
    tool: 'inspectArchitectureHandoffTool',
    handoff,
    findings,
    validation_needed: [
      'Confirm Security and Compliance outputs are accepted as inputs before governance approval.',
      'Confirm unresolved validation gaps are assigned to named decision owners.',
    ],
  };
}

function buildSystemsOfRecord(input = {}) {
  const text = textFromInput(input);
  const defs = [
    ['Product catalogue', 'SKU, hierarchy, attributes, catalogue eligibility', /catalog|product|sku|pim|erp/i],
    ['Price', 'base price, markdowns, tax, regional pricing', /price|pricing|markdown|erp/i],
    ['Promotion', 'campaign rules, coupons, combo deals, eligibility', /promotion|campaign|coupon|combo/i],
    ['Cart / checkout', 'basket, checkout state, session, customer intent', /cart|checkout|basket/i],
    ['Order', 'order lifecycle, state transitions, cancellations', /order|oms/i],
    ['Payment token', 'PSP token, payment intent, refund state', /payment|psp|token|refund|wallet|upi/i],
    ['Customer / loyalty / consent', 'identity, consent, loyalty tier, support profile', /customer|loyalty|consent|profile|crm|cdp/i],
    ['Inventory / reservation', 'available-to-promise, stock lock, reservation ledger', /inventory|stock|reservation|lock/i],
    ['Fulfilment / logistics', 'pick, pack, carrier, promise, exception handling', /fulfil|fulfill|logistics|wms|carrier/i],
    ['Returns', 'RMA, refund trigger, reverse logistics', /return|refund|rma/i],
    ['Audit / evidence', 'security, compliance, transaction, access, and decision evidence', /audit|log|siem|evidence/i],
  ];
  return {
    tool: 'buildSystemsOfRecordTool',
    systems: defs.map(([domain, scope, pattern]) => ({
      domain,
      scope,
      status: pattern.test(text) ? 'inferred - validate with client' : 'open - assign owner',
      owner: pattern.test(text) ? 'inferred from current architecture context' : 'not explicit in current inputs',
    })),
    validation_needed: [
      'Assign accountable human owners for every system of record before final technology selection.',
      'Confirm which platform owns correction, replay, reconciliation, support access, and audit evidence for each domain.',
    ],
  };
}

function buildDecisionAndApprovalGates(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const gates = [
    'Architecture decision record gate: platform, data, integration, security, compliance, AI, cost, and rejected alternatives must be documented.',
    'Security/compliance approval gate: data classes, PCI/payment boundary, residency, processors, retention, and support access must be validated.',
    'Integration correctness gate: idempotency, retries, DLQ, replay, duplicate handling, reconciliation, and manual correction must be proven.',
    'Operational readiness gate: runbooks, dashboards, alerts, rollback triggers, game days, on-call ownership, and support handoff must be accepted.',
    'FinOps gate: unit drivers, service-level pricing, support/licensing/partner cost, non-prod parity, and contingency must be reviewed.',
  ];
  if (signals.commerce) gates.push('Peak trading gate: campaign load, checkout isolation, payment failover, inventory lock correctness, and search/catalog degradation must be tested.');
  if (signals.retailAi) gates.push('AI governance gate: model/provider ADR, retrieval-source approval, tool scopes, evals, human escalation, telemetry, and fallback must be approved.');
  if (signals.supplyChain) gates.push('Supply-chain gate: OMS/WMS/logistics ownership, exception queues, fulfilment promise, and supplier/carrier contracts must be validated.');
  if (signals.storeEdge) gates.push('Store rollout gate: offline trading, queue replay, device trust, field replacement, and wave stop/go thresholds must be validated.');
  if (stateHasComplianceAssumptions(input.state)) gates.push('Compliance assumption gate: assumption, missing, stale, or partial compliance evidence must be assigned to legal/privacy owners before client-ready approval.');
  if (stateHasSecurityAssumptions(input.state)) gates.push('Security assumption gate: unresolved data-classification, payment, AI/RAG, trust-boundary, and support-access findings must be assigned to security owners.');

  return {
    tool: 'buildDecisionAndApprovalGatesTool',
    gates,
    decisions: [
      { what: 'Keep Security and Compliance as approval gates before final architecture sign-off.', why: 'Governance cannot assign accountable owners or approvals without validated data classification, PCI/privacy, residency, processor, and support-access context.', owner: 'Lead solution architect / architecture board' },
      { what: 'Treat final technology selection as conditional until runtime, API, UI, storage, AI, deployment, and operating-model recommendations are validated.', why: 'Current governance review can set ownership and approval guardrails, but the customer should not treat the full platform stack as final until each technology domain is reviewed against NFRs, budget, and operational readiness.', owner: 'Architecture board' },
    ],
    validation_needed: [
      'Confirm named approvers for architecture, security, compliance/privacy, data, platform operations, FinOps, and business ownership.',
      'Confirm ADRs, decision expiry dates, accepted risks, and approval evidence location.',
    ],
  };
}

function stateHasComplianceAssumptions(state = {}) {
  const evidence = state.compliance_evidence_status || {};
  return Object.values(evidence).some(value => /assumption|missing|partial|stale|contradictory/i.test(String(value)));
}

function stateHasSecurityAssumptions(state = {}) {
  return asArray(state.validation_gaps).some(item => /security/i.test(String(item))) || Boolean(state.security_signal_profile?.domains?.length);
}

function retrieveGovernanceKnowledgeForInput(input = {}) {
  return retrieveGovernanceKnowledge({
    query: textFromInput(input),
    retrievalPlan: input.retrievalPlan || input.retrieval_plan || [],
    signals: input.signals || getRetailSignals(input),
    limit: input.limit || 6,
  });
}

function validateGovernanceOutput(input = {}) {
  const output = input.output || {};
  const toolResults = asArray(input.toolResults);
  const text = [
    output.summary,
    output.findings,
    output.systems_of_record,
    output.constraint_gates,
    output.integration_controls,
    output.governance_recommendation,
    output.governance_handoff_summary,
    output.systems_of_record_matrix,
    output.decision_records,
    output.approval_gates,
    output.rollout_readiness,
    output.governance_evidence_status,
    output.governance_validation_gates,
    output.governance_qualification,
    output.governance_policy_citations,
    output.governance_evidence_pack,
    output.governance_signal_profile,
    output.decisions,
    output.validation_needed,
    output.model_summary,
    output.model_findings,
    toolResults,
  ].flat(5).map(item => typeof item === 'string' ? item : JSON.stringify(item || '')).join('\n').toLowerCase();
  const blockers = [];
  const warnings = [];
  const improvements = [];
  const hasOwners = /owner|accountable|approver|system.?s? of record|source of truth/.test(text);
  const hasAdr = /adr|decision|rejected|alternative|accepted risk/.test(text);
  const hasGates = /gate|approval|rollback|runbook|game.?day|acceptance/.test(text);
  const hasIntegration = /idempot|retry|dlq|dead.?letter|replay|reconcil|duplicate|manual correction/.test(text);
  const hasSecurityComplianceHandoff = /security|compliance|pci|privacy|residen|processor/.test(text);
  const hasEvidenceStatus = /evidence_status|evidence status|assumption|partial|verified|missing|stale/.test(text);
  const hasEvidencePack = /evidence_pack|policy_sources|approval_workflow|client_questions|decision_evidence|owner_evidence|rollout_evidence/.test(text);
  const hasQualification = /draft|not.*approval|not.*decision|human.*approval|architecture board/.test(text);
  const hasCitations = /citation|source_id|policy|baseline/.test(text);

  if (!hasOwners) blockers.push('Governance output does not assign systems-of-record or decision owners.');
  if (!hasAdr) warnings.push('Governance output should include ADR/decision-record expectations and rejected alternatives.');
  if (!hasGates) blockers.push('Governance output does not define approval, rollout, rollback, or acceptance gates.');
  if (!hasIntegration) warnings.push('Governance output should define replay, idempotency, reconciliation, and manual correction controls.');
  if (!hasSecurityComplianceHandoff) blockers.push('Governance output does not consume Security/Compliance handoff context.');
  if (!hasEvidenceStatus) blockers.push('Governance output does not preserve evidence status for assumptions, missing evidence, or validation state.');
  if (!hasEvidencePack) blockers.push('Governance output does not include an evidence pack with policy sources, approval workflow, client questions, and decision evidence.');
  if (!hasQualification) blockers.push('Governance output does not qualify that generated governance recommendations are draft and require human architecture-board approval.');
  if (!hasCitations) warnings.push('Governance output should include citations or source evidence for governance recommendations.');
  if (!toolResults.length) blockers.push('Governance tools did not produce handoff, systems-of-record, decision, or validation evidence.');
  if (!output.model_review?.enabled) improvements.push('Run model judgement for customer-specific governance recommendations when an approved model is available.');

  return {
    tool: 'validateGovernanceOutputTool',
    verdict: blockers.length ? 'fail' : warnings.length ? 'warn' : 'pass',
    blockers,
    warnings,
    improvements,
    required_controls: {
      owners: hasOwners,
      decisions: hasAdr,
      approval_gates: hasGates,
      integration_controls: hasIntegration,
      security_compliance_handoff: hasSecurityComplianceHandoff,
      evidence_status: hasEvidenceStatus,
      evidence_pack: hasEvidencePack,
      governance_qualification: hasQualification,
      citations_or_sources: hasCitations,
    },
  };
}

const toolInputSchema = z.object({
  query: z.string().optional(),
  context: z.record(z.any()).optional(),
  state: z.record(z.any()).optional(),
  signals: z.record(z.any()).optional(),
  output: z.record(z.any()).optional(),
  toolResults: z.array(z.any()).optional(),
  retrievalPlan: z.array(z.string()).optional(),
  retrieval_plan: z.array(z.string()).optional(),
  limit: z.number().optional(),
});

const governanceTools = {
  inspectArchitectureHandoffTool: tool(inspectArchitectureHandoff, {
    name: 'inspectArchitectureHandoffTool',
    description: 'Inspect Security and Compliance handoff before Governance decisions.',
    schema: toolInputSchema,
  }),
  buildSystemsOfRecordTool: tool(buildSystemsOfRecord, {
    name: 'buildSystemsOfRecordTool',
    description: 'Build retail systems-of-record ownership matrix.',
    schema: toolInputSchema,
  }),
  buildDecisionAndApprovalGatesTool: tool(buildDecisionAndApprovalGates, {
    name: 'buildDecisionAndApprovalGatesTool',
    description: 'Build ADR, approval, rollout, rollback, and acceptance gates.',
    schema: toolInputSchema,
  }),
  retrieveGovernanceKnowledgeTool: tool(retrieveGovernanceKnowledgeForInput, {
    name: 'retrieveGovernanceKnowledgeTool',
    description: 'Retrieve local ArchitectIQ governance playbooks and approval templates.',
    schema: toolInputSchema,
  }),
  validateGovernanceOutputTool: tool(validateGovernanceOutput, {
    name: 'validateGovernanceOutputTool',
    description: 'Validate Governance output against ownership, decision, approval, integration, and handoff controls.',
    schema: toolInputSchema,
  }),
};

module.exports = {
  buildDecisionAndApprovalGates,
  buildSystemsOfRecord,
  governanceTools,
  inspectArchitectureHandoff,
  retrieveGovernanceKnowledgeForInput,
  validateGovernanceOutput,
};
