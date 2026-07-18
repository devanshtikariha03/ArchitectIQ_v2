const FINOPS_EVAL_CASES = [
  {
    id: 'global-retail-ai-rag-finops',
    name: 'Global retail AI RAG and GPT cost model',
    query: [
      'Global retail commerce platform with GPT-5.5 architecture agents, RAG chatbot, embeddings, vector DB, reranking, eval traces, prompt telemetry, customer loyalty data, checkout, payment token flow, and enterprise budget.',
      'Need FinOps review for model routing, tokens, vector reads, provider pricing evidence, Security/Compliance/Governance handoff costs, support plan, non-prod parity, and contingency.',
    ].join(' '),
    state: {
      agent_outputs: {
        security: { agentId: 'security', graph_agent: { validation: { verdict: 'pass' } }, payment_security: { in_scope: true }, ai_security: { in_scope: true } },
        compliance: { agentId: 'compliance', graph_agent: { validation: { verdict: 'pass' } } },
        governance: { agentId: 'governance', graph_agent: { validation: { verdict: 'pass' } } },
      },
      security_controls: ['KMS/HSM', 'WAF/bot', 'SIEM export', 'service mesh mTLS'],
      compliance_evidence_status: { data_residency: 'assumption', processors: 'assumption' },
      governance_validation_gates: [{ gate: 'Architecture board and FinOps budget gate', owner: 'Architecture board', status: 'requires human validation' }],
    },
    mustMatch: [
      ['ai cost model', /llm|gpt|token|embedding|vector|rerank|model routing|eval traces/i],
      ['provider pricing evidence', /aws|azure|gcp|provider pricing|sku|service-level/i],
      ['upstream handoff', /security|compliance|governance|mandatory controls/i],
      ['unit drivers', /requests|turns|tokens|cache hit|vector/i],
      ['evidence pack', /policy_sources|pricing_evidence_needed|unit_driver_evidence_needed|approval_workflow|client_questions/i],
      ['qualification', /draft|not a provider quote|procurement approval|budget-owner/i],
    ],
  },
  {
    id: 'flash-sale-commerce-finops',
    name: 'Flash sale commerce peak cost',
    query: [
      'Retail flash-sale platform with CDN, WAF, bot management, API gateway, search catalog reads, checkout isolation, payment throughput, inventory reservations, promotion engine, fraud tooling, and peak campaign multiplier.',
      'Need cheapest, recommended, and conservative cost guardrails without weakening security or checkout reliability.',
    ].join(' '),
    mustMatch: [
      ['flash sale cost', /flash-sale|campaign|peak|cdn|waf|bot|checkout|inventory/i],
      ['tiering', /conservative|recommended|optimised|optimized|cheapest/i],
      ['guardrails', /preserving|required security|compliance|cannot weaken|mandatory controls/i],
      ['unit drivers', /peak multiplier|checkout attempts|requests|sessions/i],
      ['evidence pack', /cost_control_evidence_needed|approval_workflow/i],
    ],
  },
  {
    id: 'store-edge-pos-rollout-finops',
    name: 'Store edge POS rollout cost',
    query: [
      'Retail store-edge POS rollout with 1200 stores, POS lanes, offline checkout, local storage, HA edge appliances, device management, WAN outage mode, field replacement, training, support desk, rollout waves, and pilot stores.',
      'Need FinOps review for hardware, field operations, support, non-prod, rollout, and contingency.',
    ].join(' '),
    mustMatch: [
      ['store edge', /store edge|pos|offline|device|field replacement|training|support desk/i],
      ['rollout cost', /rollout|pilot|field operations|hardware|support/i],
      ['unit drivers', /stores|pos lanes|rollout waves|support seats/i],
      ['evidence status', /assumption|partial|verified|missing/i],
      ['evidence pack', /unit_driver_evidence_needed|client_questions/i],
    ],
  },
  {
    id: 'fulfilment-integration-finops',
    name: 'Fulfilment and integration cost',
    query: [
      'Retail OMS, WMS, ERP, 3PL, supplier feeds, carrier APIs, EDI/SFTP files, webhook events, exception queues, reconciliation, replay tooling, dashboards, and manual override operations.',
      'Need cost review for integration volume, exception operations, partner support, observability, and manual staffing.',
    ].join(' '),
    mustMatch: [
      ['integration cost', /oms|wms|erp|3pl|supplier|carrier|edi|sftp|integration/i],
      ['exception operations', /exception|reconciliation|replay|manual override|partner support/i],
      ['unit drivers', /events\/sec|queue|throughput|feed volume|carrier call/i],
      ['evidence pack', /cost_control_evidence_needed|client_questions/i],
      ['support partner', /partner|support|licensing|implementation/i],
    ],
  },
  {
    id: 'missing-budget-finops',
    name: 'Missing budget and vague estimate',
    query: [
      'Customer asks for a cost estimate for a retail architecture but gives no traffic, no stores, no transactions, no regions, no support plan, no contracts, no hard budget, and no non-prod requirement.',
      'Need FinOps output to stay conditional and ask for evidence.',
    ].join(' '),
    mustMatch: [
      ['missing budget', /budget is not confirmed|hard monthly budget|setup budget|currency/i],
      ['assumption status', /assumption|missing|not_confirmed/i],
      ['unit driver evidence', /unit_driver_evidence_needed|requests|sessions|data growth|peak/i],
      ['qualification', /draft|not a provider quote|budget-owner sign-off/i],
      ['validation gates', /requires human validation|finops_validation_gates/i],
    ],
  },
  {
    id: 'security-compliance-cost-finops',
    name: 'Security compliance governance mandatory cost',
    query: [
      'Retail payment and loyalty platform has PCI, privacy, residency, processor evidence, KMS/HSM, WAF/bot, secrets, SIEM export, DLP, audit retention, support access, QSA review, architecture board approvals, and runbooks.',
      'Need FinOps to price these as mandatory controls before recommending cheaper options.',
    ].join(' '),
    state: {
      agent_outputs: {
        security: { agentId: 'security' },
        compliance: { agentId: 'compliance' },
        governance: { agentId: 'governance' },
      },
    },
    mustMatch: [
      ['mandatory controls', /mandatory|security|compliance|governance|pci|qsa|waf|siem|kms/i],
      ['cannot weaken', /cannot weaken|preserving|required capability|accepted-risk/i],
      ['upstream summary', /finops_upstream_summary|security_available|compliance_available|governance_available/i],
      ['approval workflow', /approval_workflow|security and compliance owners|governance owner/i],
      ['evidence pack', /cost_control_evidence_needed|policy_sources/i],
    ],
  },
  {
    id: 'multi-cloud-pricing-evidence-finops',
    name: 'AWS Azure GCP pricing evidence',
    query: [
      'Retail platform may use AWS, Azure, or GCP managed Kubernetes, managed Postgres, OpenSearch/search, object storage, CDN, WAF, queue/event backbone, observability, and support plan in India and Australia regions.',
      'Need FinOps pricing evidence status and provider lookup path.',
    ].join(' '),
    mustMatch: [
      ['multi cloud', /aws|azure|gcp|cloud/i],
      ['provider lookup', /provider pricing|azure retail prices|aws price list|gcp cloud billing|sku/i],
      ['evidence status', /verified|partial|assumption|missing/i],
      ['pricing evidence summary', /pricing_evidence_summary|usable_price_points|provider_summary/i],
      ['validation needed', /exact service sku|region|discount|support plan|commitment/i],
    ],
  },
  {
    id: 'observability-retention-finops',
    name: 'Observability retention and egress cost',
    query: [
      'Retail data platform needs structured logs, traces, metrics, SIEM export, audit evidence retention, backups, cross-region replication, analytics warehouse exports, egress, restore tests, and privacy redaction.',
      'Need FinOps review for hidden storage, retention, egress, compliance evidence, and optimisation limits.',
    ].join(' '),
    mustMatch: [
      ['observability retention', /logs|traces|siem|audit evidence|retention|backup|egress|replication/i],
      ['hidden cost', /hidden cost|storage|network|observability|audit/i],
      ['compliance guardrail', /compliance|security|retention reductions|mandatory/i],
      ['cost controls', /cost_control_evidence_needed|optimised|retention/i],
      ['client questions', /client_questions|log gb\/day|trace sampling/i],
    ],
  },
  {
    id: 'optimized-tier-guardrail-finops',
    name: 'Optimised tier cannot weaken controls',
    query: [
      'Architecture has a proposed cheaper option that removes SIEM export, reduces retention, removes non-prod parity, uses a single region, drops WAF bot protection, and sends every AI review to GPT-5.5 without token caps.',
      'Need FinOps review to reject unsafe savings and recommend safe cost levers.',
    ].join(' '),
    mustMatch: [
      ['unsafe savings', /cheaper|optimised|optimized|cost reduction|remove|drops/i],
      ['control guardrail', /cannot weaken|mandatory controls|security|compliance|non-prod|waf|siem/i],
      ['ai caps', /gpt|token caps|model routing|cache|retrieval/i],
      ['safe levers', /right-sizing|commitments|caching|retention tuning|traffic shaping/i],
      ['qualification', /draft|requires human validation|budget-owner/i],
    ],
  },
];

function flattenOutput(output = {}) {
  return [
    output.summary,
    output.findings,
    output.finops_recommendation,
    output.finops_upstream_summary,
    output.unit_driver_matrix,
    output.cost_drivers,
    output.workload_pricing_assumptions,
    output.pricing_evidence_summary,
    output.provider_pricing,
    output.cost_model_tiers,
    output.cost_optimization_levers,
    output.finops_evidence_status,
    output.finops_validation_gates,
    output.finops_qualification,
    output.finops_policy_citations,
    output.finops_evidence_pack,
    output.finops_signal_profile,
    output.assumptions,
    output.risks,
    output.validation_needed,
    output.retrieval_requests,
    output.finops_tool_results,
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

function scoreFinOpsOutput(output, testCase) {
  const text = flattenOutput(output);
  const checks = testCase.mustMatch.map(([label, pattern]) => ({ label, pass: pattern.test(text) }));
  checks.push(
    { label: 'v1 finops_recommendation field', pass: Array.isArray(output.finops_recommendation) && output.finops_recommendation.length > 0 },
    { label: 'v1 unit_driver_matrix field', pass: Array.isArray(output.unit_driver_matrix) && output.unit_driver_matrix.length > 0 },
    { label: 'v1 pricing_evidence_summary field', pass: Boolean(output.pricing_evidence_summary?.evidence_status) },
    { label: 'v1 cost_model_tiers field', pass: Array.isArray(output.cost_model_tiers) && output.cost_model_tiers.length > 0 },
    { label: 'v1 cost_optimization_levers field', pass: Array.isArray(output.cost_optimization_levers) && output.cost_optimization_levers.length > 0 },
    { label: 'v1 finops_evidence_status field', pass: Boolean(output.finops_evidence_status?.pricing) },
    { label: 'v1 finops_validation_gates field', pass: Array.isArray(output.finops_validation_gates) && output.finops_validation_gates.length > 0 },
    { label: 'v1 finops_qualification field', pass: output.finops_qualification?.status === 'draft_requires_budget_owner_review' },
    { label: 'v1 finops_policy_citations field', pass: Array.isArray(output.finops_policy_citations) && output.finops_policy_citations.length > 0 },
    { label: 'v1 finops_evidence_pack field', pass: Array.isArray(output.finops_evidence_pack?.approval_workflow) && output.finops_evidence_pack.approval_workflow.length > 0 },
    { label: 'v1 finops_signal_profile field', pass: Array.isArray(output.finops_signal_profile?.domains) && output.finops_signal_profile.domains.length > 0 }
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
  FINOPS_EVAL_CASES,
  scoreFinOpsOutput,
};
