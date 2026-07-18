const INFRASTRUCTURE_EVAL_CASES = [
  {
    id: 'global-retail-platform-infrastructure',
    name: 'Global retail platform infrastructure',
    query: [
      'Global retail commerce platform with storefront, checkout, payment token flow, inventory reservation, WMS/ERP integrations, RAG chatbot, multi-region requirements, CDN, WAF, API gateway, managed Kubernetes, observability, CI/CD, and disaster recovery.',
      'Need Infrastructure review for runtime, network, HA/DR, observability, environments, security/compliance handoffs, governance gates, and FinOps cost drivers.',
    ].join(' '),
    state: {
      agent_outputs: {
        security: { agentId: 'security' },
        compliance: { agentId: 'compliance' },
        governance: { agentId: 'governance' },
      },
      payment_security: { in_scope: true },
      compliance_evidence_status: { data_residency: 'assumption' },
      governance_validation_gates: [{ gate: 'Architecture board approval', owner: 'Architecture board', status: 'requires human validation' }],
    },
    mustMatch: [
      ['runtime', /runtime|kubernetes|container|node pool|namespace|deployment/i],
      ['network edge', /cdn|waf|api gateway|ingress|private endpoint|egress|network/i],
      ['ha dr', /ha|dr|rto|rpo|failover|backup|restore|game.?day/i],
      ['observability', /observability|logs|traces|metrics|slo|runbook|on-call/i],
      ['upstream handoff', /security|compliance|governance|pci|residency|handoff/i],
      ['evidence pack', /policy_sources|runtime_evidence_needed|network_evidence_needed|resilience_evidence_needed|approval_workflow|client_questions/i],
      ['qualification', /draft|not platform approval|production readiness|platform owner/i],
    ],
  },
  {
    id: 'flash-sale-runtime-isolation',
    name: 'Flash-sale runtime and network isolation',
    query: [
      'Retail flash sale architecture with CDN, WAF, bot management, API gateway, search/catalog reads, checkout APIs, payment APIs, inventory locks, promotion engine, Kubernetes autoscaling, load tests, and peak multiplier.',
      'Need Infrastructure review for runtime isolation, network edge, autoscaling, peak readiness, rollback, and SLOs.',
    ].join(' '),
    mustMatch: [
      ['critical isolation', /browse|search|checkout|payment|inventory|isolate|separate/i],
      ['edge controls', /cdn|waf|bot|api gateway|origin/i],
      ['autoscale performance', /autoscal|peak|load test|latency|throughput|capacity/i],
      ['rollback release', /rollback|release|canary|blue.?green/i],
      ['evidence pack', /runtime_evidence_needed|network_evidence_needed|operations_evidence_needed/i],
    ],
  },
  {
    id: 'store-edge-offline-infrastructure',
    name: 'Store edge offline POS infrastructure',
    query: [
      'Retail store-edge POS rollout with offline checkout, WAN outage mode, local queue replay, edge appliance, associate mobile, payment terminal, local logs, device management, patching, field replacement, support desk, and rollout waves.',
      'Need Infrastructure review for offline runtime, store network, local observability, support, release, and field operations.',
    ].join(' '),
    mustMatch: [
      ['store edge', /store edge|pos|offline|wan outage|local queue|edge appliance|device/i],
      ['field operations', /field replacement|support desk|rollout waves|patching/i],
      ['network segmentation', /store network|remote support|network|segmentation/i],
      ['observability', /local observability|logs|runbook|support/i],
      ['evidence pack', /client_questions|environment_release_evidence_needed|operations_evidence_needed/i],
    ],
  },
  {
    id: 'multi-region-residency-dr',
    name: 'Multi-region residency and DR infrastructure',
    query: [
      'Retail platform must run in India and Australia with data residency constraints, active-passive DR, regional backups, log and trace residency, DNS failover, private connectivity, and RTO/RPO targets.',
      'Need Infrastructure review that keeps residency, backup/log location, failover, and compliance evidence assumption-level until validated.',
    ].join(' '),
    state: {
      agent_outputs: {
        compliance: { agentId: 'compliance' },
        security: { agentId: 'security' },
        governance: { agentId: 'governance' },
      },
      compliance_evidence_status: { data_residency: 'assumption', processors: 'assumption' },
    },
    mustMatch: [
      ['multi region', /multi-region|india|australia|regional|dns|failover/i],
      ['residency', /residency|backup|logs|traces|support access|compliance/i],
      ['rto rpo', /rto|rpo|active-passive|dr|restore/i],
      ['evidence status', /assumption|partial|missing|evidence_status/i],
      ['approval workflow', /approval_workflow|compliance\/privacy owner|platform owner/i],
    ],
  },
  {
    id: 'environment-release-iac',
    name: 'Environment release IaC infrastructure',
    query: [
      'Retail platform needs dev, integration, UAT, staging, production, DR, CI/CD, Terraform IaC, secrets handling, config promotion, canary releases, rollback, release windows, and drift review without connecting live cloud accounts yet.',
      'Need Infrastructure review for environment strategy and production readiness evidence.',
    ].join(' '),
    mustMatch: [
      ['environment strategy', /dev|integration|uat|staging|production|environment/i],
      ['iac cicd', /ci\/cd|iac|terraform|secrets|config promotion/i],
      ['release rollback', /canary|rollback|release windows|change controls/i],
      ['non prod parity', /non-prod parity|production-like|parity/i],
      ['evidence pack', /environment_release_evidence_needed|approval_workflow/i],
    ],
  },
  {
    id: 'observability-operations-infrastructure',
    name: 'Observability and operations infrastructure',
    query: [
      'Retail distributed system needs OpenTelemetry traces, structured logs, metrics, SIEM export, SLOs, dashboards, alerts, runbooks, on-call, incident workflow, post-incident reviews, and support handoff for checkout, payment, inventory, order, fulfilment, and AI paths.',
      'Need Infrastructure review for operational readiness.',
    ].join(' '),
    mustMatch: [
      ['telemetry', /opentelemetry|traces|logs|metrics|siem/i],
      ['slo dashboards', /slo|dashboard|alerts|business-impact/i],
      ['runbooks', /runbook|on-call|incident|support handoff|post-incident/i],
      ['retail paths', /checkout|payment|inventory|order|fulfilment|ai/i],
      ['evidence pack', /operations_evidence_needed|client_questions/i],
    ],
  },
  {
    id: 'missing-handoff-infrastructure',
    name: 'Missing upstream handoff infrastructure',
    query: [
      'Architecture asks for final infrastructure approval but has no Security output, no Compliance output, no Governance output, no approved regions, no data classification, no RTO/RPO, and no network diagram.',
      'Need Infrastructure review to remain draft-only and list blockers.',
    ].join(' '),
    mustMatch: [
      ['missing handoff', /security_handoff.*missing|compliance_handoff.*missing|governance_handoff.*missing|missing/i],
      ['draft qualification', /draft|not platform approval|requires human validation/i],
      ['network evidence', /network diagram|network_evidence_needed|private endpoint|firewall/i],
      ['rto rpo evidence', /rto|rpo|resilience_evidence_needed/i],
      ['validation gates', /infrastructure_validation_gates|requires human validation/i],
    ],
  },
  {
    id: 'ai-rag-infrastructure',
    name: 'AI RAG infrastructure isolation',
    query: [
      'Retail AI/RAG chatbot and recommendation services with model provider, embeddings, vector DB, reranker, eval traces, tool calls, prompt telemetry, fallback, and human escalation. Checkout must not depend on AI availability.',
      'Need Infrastructure review for AI service isolation, network/privacy boundaries, observability, fallback, and cost/NFR handoff.',
    ].join(' '),
    mustMatch: [
      ['ai isolation', /ai|rag|model|embedding|vector|reranker|checkout-critical/i],
      ['fallback circuit', /fallback|circuit|rate limits|token|telemetry/i],
      ['privacy network', /privacy|network|private|support access|logs|traces/i],
      ['observability', /eval|prompt telemetry|observability|logs|traces/i],
      ['evidence pack', /runtime_evidence_needed|operations_evidence_needed|approval_workflow/i],
    ],
  },
];

function flattenOutput(output = {}) {
  return [
    output.summary,
    output.findings,
    output.infrastructure_recommendation,
    output.infrastructure_handoff_summary,
    output.runtime_platform,
    output.network_topology,
    output.resilience_plan,
    output.observability_operations,
    output.environment_release_strategy,
    output.infrastructure_evidence_status,
    output.infrastructure_validation_gates,
    output.infrastructure_qualification,
    output.infrastructure_policy_citations,
    output.infrastructure_evidence_pack,
    output.infrastructure_signal_profile,
    output.risks,
    output.validation_needed,
    output.retrieval_requests,
    output.infrastructure_tool_results,
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

function scoreInfrastructureOutput(output, testCase) {
  const text = flattenOutput(output);
  const checks = testCase.mustMatch.map(([label, pattern]) => ({ label, pass: pattern.test(text) }));
  checks.push(
    { label: 'v1 infrastructure_recommendation field', pass: Array.isArray(output.infrastructure_recommendation) && output.infrastructure_recommendation.length > 0 },
    { label: 'v1 runtime_platform field', pass: Boolean(output.runtime_platform?.recommendation || output.runtime_platform?.components) },
    { label: 'v1 network_topology field', pass: Array.isArray(output.network_topology) && output.network_topology.length > 0 },
    { label: 'v1 resilience_plan field', pass: Boolean(output.resilience_plan?.posture || output.resilience_plan?.critical_paths) },
    { label: 'v1 observability_operations field', pass: Array.isArray(output.observability_operations) && output.observability_operations.length > 0 },
    { label: 'v1 environment_release_strategy field', pass: Array.isArray(output.environment_release_strategy) && output.environment_release_strategy.length > 0 },
    { label: 'v1 infrastructure_evidence_status field', pass: Boolean(output.infrastructure_evidence_status?.infrastructure) },
    { label: 'v1 infrastructure_validation_gates field', pass: Array.isArray(output.infrastructure_validation_gates) && output.infrastructure_validation_gates.length > 0 },
    { label: 'v1 infrastructure_qualification field', pass: output.infrastructure_qualification?.status === 'draft_requires_platform_owner_review' },
    { label: 'v1 infrastructure_policy_citations field', pass: Array.isArray(output.infrastructure_policy_citations) && output.infrastructure_policy_citations.length > 0 },
    { label: 'v1 infrastructure_evidence_pack field', pass: Array.isArray(output.infrastructure_evidence_pack?.approval_workflow) && output.infrastructure_evidence_pack.approval_workflow.length > 0 },
    { label: 'v1 infrastructure_signal_profile field', pass: Array.isArray(output.infrastructure_signal_profile?.domains) && output.infrastructure_signal_profile.domains.length > 0 }
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
  INFRASTRUCTURE_EVAL_CASES,
  scoreInfrastructureOutput,
};
