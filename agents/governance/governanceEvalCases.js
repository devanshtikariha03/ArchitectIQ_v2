const GOVERNANCE_EVAL_CASES = [
  {
    id: 'global-retail-handoff-governance',
    name: 'Global retail Security and Compliance handoff governance',
    query: [
      'Global retail marketplace with product, price, promotion, cart, checkout, order, payment token, customer loyalty, inventory, fulfilment, returns, audit, RAG chatbot, vector store, PSP, WMS, ERP, support access, rollout waves, and architecture board approval.',
      'Need Governance review for systems of record, ADRs, approval gates, Security and Compliance handoffs, rollout readiness, runbooks, game days, accepted risks, and FinOps gate.',
    ].join(' '),
    state: {
      agent_outputs: {
        security: { agentId: 'security', graph_agent: { validation: { verdict: 'pass' } }, payment_security: { in_scope: true }, ai_security: { in_scope: true } },
        compliance: { agentId: 'compliance', graph_agent: { validation: { verdict: 'pass' } } },
      },
      data_classification: ['C5/C5E customer and payment-adjacent data'],
      jurisdiction_frameworks: [{ framework: 'GDPR/UK GDPR', status: 'assumption' }, { framework: 'PCI-DSS', status: 'assumption' }],
      compliance_evidence_status: { compliance: 'assumption', data_residency: 'assumption', processors: 'assumption' },
      compliance_validation_gates: [{ gate: 'Confirm processor evidence', owner: 'Privacy owner', status: 'requires human validation' }],
    },
    mustMatch: [
      ['systems of record', /system.?s? of record|source of truth|product|price|promotion|order|inventory/i],
      ['security compliance handoff', /security handoff|compliance handoff|pci|privacy|residency|processor/i],
      ['adr decisions', /adr|decision record|rejected alternative|accepted risk/i],
      ['approval gates', /approval gate|architecture board|go-live|finops|security\/compliance/i],
      ['rollout readiness', /rollout|pilot|rollback|runbook|game.?day|acceptance/i],
      ['evidence pack', /policy_sources|approval_workflow|client_questions|decision_evidence|owner_evidence/i],
      ['qualification', /draft|not an architecture-board approval|client-approved decision/i],
    ],
  },
  {
    id: 'store-edge-rollout-governance',
    name: 'Store edge rollout and offline POS governance',
    query: [
      'Retail store-edge POS rollout with offline checkout, WAN outage mode, queue replay, associate mobile, local device replacement, field support, pilot stores, rollout waves, rollback triggers, store training, runbooks, game days, and support handoff.',
      'Need governance for store selection, wave stop/go thresholds, offline acceptance tests, queue replay owner, incident owner, and go-live approval.',
    ].join(' '),
    mustMatch: [
      ['store edge', /store edge|pos|offline|queue replay|field support/i],
      ['rollout gates', /pilot|rollout wave|stop\/go|rollback|go-live/i],
      ['runbooks game days', /runbook|game.?day|support handoff|training/i],
      ['owners', /owner|accountable|approver|systems_of_record/i],
      ['evidence pack', /rollout_evidence|approval_workflow|client_questions/i],
    ],
  },
  {
    id: 'integration-replay-reconciliation-governance',
    name: 'Integration replay and reconciliation governance',
    query: [
      'Retail architecture with OMS, WMS, ERP, payment events, inventory reservations, returns, supplier feeds, event backbone, schema registry, DLQs, replay tooling, duplicate handling, reconciliation reports, and manual correction process.',
      'Need governance around integration owners, idempotency, retries, replay authority, reconciliation schedule, schema ownership, and audit evidence.',
    ].join(' '),
    mustMatch: [
      ['integration controls', /idempotency|retry|dlq|dead letter|replay|reconciliation|duplicate|manual correction/i],
      ['system ownership', /owner|source of truth|system.?s? of record/i],
      ['decision records', /adr|decision|accepted risk|rejected alternative/i],
      ['approval gates', /approval|gate|validation/i],
      ['evidence pack', /decision_evidence|owner_evidence|policy_sources/i],
    ],
  },
  {
    id: 'ai-governance-gate',
    name: 'Retail AI governance gate',
    query: [
      'Retail AI agent architecture with GPT model route, local fallback, RAG retrieval, embeddings, vector DB, tool calls into OMS/WMS/CRM/loyalty/refund, prompt telemetry, eval traces, human escalation, and cost controls.',
      'Need governance for model/provider ADR, retrieval-source approval, tool scopes, eval criteria, fallback policy, human approval, telemetry retention, and FinOps budget gate.',
    ].join(' '),
    mustMatch: [
      ['ai governance', /ai|model|rag|retrieval|tool|eval|fallback/i],
      ['adr provider', /adr|model\/provider|provider|decision/i],
      ['human escalation', /human escalation|approval|owner/i],
      ['finops gate', /finops|budget|cost|unit driver/i],
      ['evidence pack', /approval_workflow|client_questions|decision_evidence/i],
    ],
  },
  {
    id: 'missing-handoff-governance',
    name: 'Missing Security and Compliance handoff governance',
    query: [
      'Retail architecture recommendation asks for approval but does not include Security Agent output, Compliance Agent output, data classification, residency matrix, processor evidence, or owner approvals.',
      'Need governance review to keep approval draft-only and identify blockers before architecture board.',
    ].join(' '),
    mustMatch: [
      ['missing handoff', /security handoff is missing|compliance handoff is missing|draft/i],
      ['approval blocked', /architecture board|approval|requires human validation|governance validation/i],
      ['evidence status', /missing|assumption|evidence/i],
      ['owners', /owner|accountable|approver/i],
      ['qualification', /draft|not an architecture-board approval|client-approved/i],
    ],
  },
  {
    id: 'finops-budget-governance',
    name: 'FinOps budget and tradeoff governance',
    query: [
      'Retail platform has hard budget, service-level pricing assumptions, LLM/API token cost, vector DB cost, support plan, non-prod parity, licensing, partner implementation cost, contingency, and proposed cost reductions that may weaken security and compliance controls.',
      'Need governance for FinOps gate, accepted risk, budget owner, decision record, and mandatory controls before go-live.',
    ].join(' '),
    mustMatch: [
      ['finops budget', /finops|budget|cost|pricing|unit driver|contingency/i],
      ['tradeoff risk', /accepted risk|cost reduction|mandatory controls|security|compliance/i],
      ['decision records', /adr|decision|owner|architecture board/i],
      ['approval gates', /gate|approval|go-live/i],
      ['evidence pack', /approval_workflow|decision_evidence|client_questions/i],
    ],
  },
  {
    id: 'loyalty-cdp-governance',
    name: 'Loyalty CDP consent and marketing governance',
    query: [
      'Retail loyalty/CDP platform with customer 360, consent preferences, segmentation, campaign activation, deletion/DSAR workflows, analytics exports, support access, and personalisation models.',
      'Need governance for customer/loyalty/consent system of record, privacy approval, campaign audit, deletion owner, model/retrieval approval, rollout gates, and accepted risks.',
    ].join(' '),
    mustMatch: [
      ['customer loyalty sor', /customer|loyalty|consent|system.?s? of record|source of truth/i],
      ['privacy compliance gate', /privacy|compliance|dsar|deletion|processor/i],
      ['campaign audit', /campaign|audit|approval|owner/i],
      ['ai governance', /model|retrieval|ai|approval/i],
      ['validation gates', /requires human validation|governance_validation_gates|approval/i],
    ],
  },
  {
    id: 'architecture-board-decision-readiness',
    name: 'Architecture board decision readiness',
    query: [
      'Architecture board wants a final decision on managed Kubernetes, event backbone, Postgres, OpenSearch, external PSP, RAG chatbot, observability stack, and rollout roadmap.',
      'Need governance for ADRs, alternatives rejected, decision owners, decision expiry date, accepted risks, evidence status, approval workflow, and final readiness.',
    ].join(' '),
    mustMatch: [
      ['architecture board', /architecture board|approval_workflow|decision owner/i],
      ['adr alternatives', /adr|alternatives rejected|rejected alternative|tradeoffs/i],
      ['expiry review', /expiry|review date|evidence status|accepted risk/i],
      ['approval gates', /approval gate|final readiness|go-live/i],
      ['qualification', /draft|not an architecture-board approval|client-approved/i],
    ],
  },
];

function flattenOutput(output = {}) {
  return [
    output.summary,
    output.findings,
    output.governance_recommendation,
    output.governance_handoff_summary,
    output.systems_of_record,
    output.systems_of_record_matrix,
    output.decisions,
    output.decision_records,
    output.approval_gates,
    output.rollout_readiness,
    output.governance_evidence_status,
    output.governance_validation_gates,
    output.governance_qualification,
    output.governance_policy_citations,
    output.governance_evidence_pack,
    output.governance_signal_profile,
    output.constraint_gates,
    output.integration_controls,
    output.risks,
    output.validation_needed,
    output.retrieval_requests,
    output.governance_tool_results,
    output.evidence,
    output.graph_agent,
  ].flat(8).map(item => {
    if (typeof item === 'string') return item;
    try {
      return JSON.stringify(item || '');
    } catch {
      return String(item || '');
    }
  }).join('\n');
}

function scoreGovernanceOutput(output, testCase) {
  const text = flattenOutput(output);
  const checks = testCase.mustMatch.map(([label, pattern]) => ({ label, pass: pattern.test(text) }));
  checks.push(
    { label: 'v1 governance_recommendation field', pass: Array.isArray(output.governance_recommendation) && output.governance_recommendation.length > 0 },
    { label: 'v1 systems_of_record_matrix field', pass: Array.isArray(output.systems_of_record_matrix) && output.systems_of_record_matrix.length > 0 },
    { label: 'v1 decision_records field', pass: Array.isArray(output.decision_records) && output.decision_records.length > 0 },
    { label: 'v1 approval_gates field', pass: Array.isArray(output.approval_gates) && output.approval_gates.length > 0 },
    { label: 'v1 governance_evidence_status field', pass: Boolean(output.governance_evidence_status?.governance) },
    { label: 'v1 governance_validation_gates field', pass: Array.isArray(output.governance_validation_gates) && output.governance_validation_gates.length > 0 },
    { label: 'v1 governance_qualification field', pass: output.governance_qualification?.status === 'draft_requires_architecture_board_review' },
    { label: 'v1 governance_policy_citations field', pass: Array.isArray(output.governance_policy_citations) && output.governance_policy_citations.length > 0 },
    { label: 'v1 governance_evidence_pack field', pass: Array.isArray(output.governance_evidence_pack?.approval_workflow) && output.governance_evidence_pack.approval_workflow.length > 0 },
    { label: 'v1 governance_signal_profile field', pass: Array.isArray(output.governance_signal_profile?.domains) && output.governance_signal_profile.domains.length > 0 }
  );
  const passed = checks.filter(check => check.pass).length;
  return {
    case_id: testCase.id,
    name: testCase.name,
    passed,
    total: checks.length,
    score: checks.length ? Math.round((passed / checks.length) * 100) : 0,
    checks,
    graph_validation: output.graph_agent?.validation?.verdict || 'missing',
  };
}

module.exports = {
  GOVERNANCE_EVAL_CASES,
  scoreGovernanceOutput,
};
