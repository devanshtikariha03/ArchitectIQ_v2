const API_EVAL_CASES = [
  {
    id: 'global-retail-api',
    name: 'Global retail API architecture',
    query: [
      'Global retail commerce platform with API gateway, CDN/WAF, REST contracts, AsyncAPI events, checkout, payment, inventory reservation, ERP/WMS/OMS integrations, carrier APIs, supplier webhooks, Redis/OpenSearch/PostgreSQL storage, RAG tool APIs, idempotency, DLQs, replay, reconciliation, OpenTelemetry, SLOs, and runbooks.',
      'Need API review for gateway, contracts, orchestration, third-party integrations, idempotency/replay, security/observability, storage handoff, and FinOps cost drivers.',
    ].join(' '),
    state: {
      agent_outputs: {
        security: { agentId: 'security' },
        compliance: { agentId: 'compliance' },
        governance: { agentId: 'governance' },
        infrastructure: { agentId: 'infrastructure' },
        technology: { agentId: 'technology' },
        storage: { agentId: 'storage' },
      },
      storage_evidence_status: { storage: 'assumption' },
    },
    mustMatch: [
      ['gateway', /api gateway|rate limits|waf|origin isolation|route/i],
      ['contracts', /openapi|asyncapi|schema|versioning|service contract/i],
      ['orchestration', /sync|async|queue|event|workflow|timeout|compensation/i],
      ['integrations', /erp|wms|oms|carrier|supplier|psp|third-party|partner/i],
      ['idempotency replay', /idempotency|dlq|replay|reconciliation|outbox|inbox/i],
      ['security observability', /oauth|jwt|mtls|audit|trace|slo|runbook|observability/i],
      ['storage handoff', /storage|source.?of.?truth|write authority|oltp/i],
      ['evidence pack', /contract_evidence_needed|integration_evidence_needed|replay_evidence_needed|approval_workflow/i],
      ['qualification', /draft|not api implementation|contract sign-off|api owner/i],
    ],
  },
  {
    id: 'checkout-payment-api',
    name: 'Checkout payment API',
    query: [
      'Retail checkout and payment APIs need API gateway route isolation, order commit contract, payment authorization/capture/refund contract, PSP token vault boundary, idempotency keys, timeout budgets, audit fields, retry windows, duplicate prevention, and reconciliation reports.',
    ].join(' '),
    mustMatch: [
      ['checkout contract', /checkout|order commit|contract|openapi/i],
      ['payment', /payment|authorization|capture|refund|psp|token-vault/i],
      ['idempotency', /idempotency|duplicate|retry|reconciliation/i],
      ['audit', /audit|trace|logs/i],
      ['storage', /payment metadata ledger|order oltp|source.?of.?truth|storage/i],
    ],
  },
  {
    id: 'integration-b2b-api',
    name: 'Integration B2B API',
    query: [
      'Retail supply chain API design for ERP, WMS, OMS, 3PL carrier, supplier EDI, marketplace seller feeds, webhooks, payload validation, partner SLAs, retry limits, DLQs, replay, and manual exception workflow.',
    ].join(' '),
    mustMatch: [
      ['partners', /erp|wms|oms|3pl|carrier|supplier|edi|marketplace|webhook/i],
      ['validation', /payload validation|schema|contract|sla/i],
      ['retry dlq', /retry|dlq|replay|manual exception/i],
      ['support', /support ownership|exception workflow|owner/i],
      ['evidence', /integration_evidence_needed|third_party_integrations/i],
    ],
  },
  {
    id: 'event-orchestration-api',
    name: 'Event orchestration API',
    query: [
      'Retail APIs need synchronous browse and checkout, asynchronous fulfilment, order events, inventory events, Kafka/event backbone, queue backpressure, workflow orchestration, saga compensation, timeout policy, and degraded mode.',
    ].join(' '),
    mustMatch: [
      ['sync async', /synchronous|asynchronous|sync|async/i],
      ['events queues', /event|kafka|queue|backpressure|workflow/i],
      ['compensation', /saga|compensation|timeout|degraded/i],
      ['critical paths', /checkout|browse|fulfilment|inventory/i],
      ['evidence', /orchestration_evidence_needed|integration_orchestration/i],
    ],
  },
  {
    id: 'store-edge-pos-api',
    name: 'Store edge POS API',
    query: [
      'Store-edge POS APIs need offline queue, local checkout, sync contract, replay to central order APIs, conflict resolution, inventory sync, device identity, mTLS, audit logs, WAN outage degraded mode, and support runbooks.',
    ].join(' '),
    mustMatch: [
      ['store edge', /store|pos|offline|local checkout|wan outage/i],
      ['sync replay', /sync contract|queue|replay|conflict resolution/i],
      ['identity security', /device identity|mtls|audit/i],
      ['runbooks', /runbook|support|degraded/i],
      ['storage handoff', /storage|source.?of.?truth|write authority/i],
    ],
  },
  {
    id: 'ai-tool-api',
    name: 'AI tool API',
    query: [
      'Retail AI/RAG assistant has tool APIs for order lookup, returns status, loyalty lookup, recommendation, vector retrieval, model calls, rate limits, tool scopes, audit logs, fallback, and no checkout-critical dependency.',
    ].join(' '),
    mustMatch: [
      ['ai tool', /ai|rag|tool api|vector|model|recommendation/i],
      ['scopes limits', /scope|rate limit|audit|fallback/i],
      ['checkout isolation', /checkout-critical|no checkout|critical path/i],
      ['observability', /trace|logs|slo|observability/i],
      ['evidence', /contract_evidence_needed|security_observability_evidence_needed/i],
    ],
  },
  {
    id: 'api-security-observability',
    name: 'API security observability',
    query: [
      'API architecture needs OAuth, OIDC, JWT, mTLS, scopes, request validation, audit fields, trace correlation, structured logs, metrics, SLO dashboards, alerts, runbooks, on-call ownership, and incident workflow.',
    ].join(' '),
    mustMatch: [
      ['auth', /oauth|oidc|jwt|mtls|scopes/i],
      ['validation audit', /request validation|audit fields/i],
      ['observability', /trace correlation|logs|metrics|slo|dashboard|alerts/i],
      ['runbooks', /runbooks|on-call|incident/i],
      ['evidence', /security_observability_evidence_needed|api_security_observability/i],
    ],
  },
  {
    id: 'missing-api-evidence',
    name: 'Missing API evidence',
    query: [
      'Architecture asks for final API design but has no route ownership, no service contracts, no storage source of truth, no auth scopes, no idempotency, no retry policy, no DLQ, no replay process, no partner SLA, and no runbooks.',
    ].join(' '),
    mustMatch: [
      ['draft', /draft|not api implementation|requires human validation/i],
      ['missing evidence', /route ownership|service contracts|source of truth|auth|idempotency|dlq|replay|sla|runbooks/i],
      ['validation gates', /api_validation_gates|requires human validation/i],
      ['evidence pack', /approval_workflow|client_questions|contract_evidence_needed/i],
    ],
  },
];

function flattenOutput(output = {}) {
  return [
    output.summary,
    output.findings,
    output.api_recommendation,
    output.api_handoff_summary,
    output.api_contract_matrix,
    output.api_gateway_strategy,
    output.integration_orchestration,
    output.third_party_integrations,
    output.idempotency_replay_controls,
    output.api_security_observability,
    output.api_evidence_status,
    output.api_validation_gates,
    output.api_qualification,
    output.api_policy_citations,
    output.api_evidence_pack,
    output.api_signal_profile,
    output.risks,
    output.validation_needed,
    output.retrieval_requests,
    output.api_tool_results,
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

function scoreApiOutput(output, testCase) {
  const text = flattenOutput(output);
  const checks = testCase.mustMatch.map(([label, pattern]) => ({ label, pass: pattern.test(text) }));
  checks.push(
    { label: 'v1 api_recommendation field', pass: Array.isArray(output.api_recommendation) && output.api_recommendation.length > 0 },
    { label: 'v1 api_contract_matrix field', pass: Array.isArray(output.api_contract_matrix) && output.api_contract_matrix.length > 0 },
    { label: 'v1 api_gateway_strategy field', pass: Boolean(output.api_gateway_strategy?.recommendation) },
    { label: 'v1 integration_orchestration field', pass: Boolean(output.integration_orchestration?.controls || output.integration_orchestration?.recommendation) },
    { label: 'v1 third_party_integrations field', pass: Array.isArray(output.third_party_integrations) && output.third_party_integrations.length > 0 },
    { label: 'v1 idempotency_replay_controls field', pass: Array.isArray(output.idempotency_replay_controls) && output.idempotency_replay_controls.length > 0 },
    { label: 'v1 api_security_observability field', pass: Array.isArray(output.api_security_observability) && output.api_security_observability.length > 0 },
    { label: 'v1 api_evidence_status field', pass: Boolean(output.api_evidence_status?.api) },
    { label: 'v1 api_validation_gates field', pass: Array.isArray(output.api_validation_gates) && output.api_validation_gates.length > 0 },
    { label: 'v1 api_qualification field', pass: output.api_qualification?.status === 'draft_requires_api_integration_owner_review' },
    { label: 'v1 api_policy_citations field', pass: Array.isArray(output.api_policy_citations) && output.api_policy_citations.length > 0 },
    { label: 'v1 api_evidence_pack field', pass: Array.isArray(output.api_evidence_pack?.approval_workflow) && output.api_evidence_pack.approval_workflow.length > 0 },
    { label: 'v1 api_signal_profile field', pass: Array.isArray(output.api_signal_profile?.domains) && output.api_signal_profile.domains.length > 0 }
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
  API_EVAL_CASES,
  scoreApiOutput,
};
