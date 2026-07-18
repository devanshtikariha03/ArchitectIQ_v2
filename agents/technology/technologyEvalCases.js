const TECHNOLOGY_EVAL_CASES = [
  {
    id: 'global-retail-technology-decomposition',
    name: 'Global retail technology decomposition',
    query: [
      'Global retail commerce platform with storefront, checkout, payment token flow, inventory reservation, WMS/ERP integrations, RAG chatbot, multi-region infrastructure, CDN, WAF, API gateway, managed Kubernetes, OpenSearch, PostgreSQL, Redis, vector DB, observability, CI/CD, and disaster recovery.',
      'Need Technology review for API, Storage, AI, UI specialist handoff, technology NFRs, upstream constraints, and final architecture readiness.',
    ].join(' '),
    state: {
      agent_outputs: {
        security: { agentId: 'security' },
        compliance: { agentId: 'compliance' },
        governance: { agentId: 'governance' },
        infrastructure: { agentId: 'infrastructure' },
      },
      infrastructure_evidence_status: { runtime: 'assumption' },
      governance_validation_gates: [{ gate: 'Architecture board approval', owner: 'Architecture board', status: 'requires human validation' }],
    },
    mustMatch: [
      ['api handoff', /api agent|api gateway|service contracts|idempotency|replay|dlq/i],
      ['storage handoff', /storage agent|oltp|cache|search|backup|source.?of.?truth|data truth/i],
      ['ai handoff', /ai agent|rag|llm|embedding|vector|rerank|model routing/i],
      ['ui handoff', /ui agent|storefront|admin|mobile|pos|accessibility/i],
      ['upstream constraints', /security|compliance|governance|infrastructure|finops|handoff/i],
      ['evidence pack', /specialist_evidence_needed|technology_decision_evidence_needed|approval_workflow|client_questions/i],
      ['qualification', /draft|not final api|specialist|requires.*review/i],
    ],
  },
  {
    id: 'api-integration-heavy-technology',
    name: 'API and integration heavy technology',
    query: [
      'Retail marketplace needs API gateway, REST and webhook contracts, ERP/WMS/OMS integration, PSP integration, carrier/supplier APIs, event schema, idempotency, retries, DLQs, replay, and reconciliation.',
      'Need Technology review before API Agent implementation.',
    ].join(' '),
    mustMatch: [
      ['api gateway', /api gateway|service contract|rest|webhook/i],
      ['integration', /erp|wms|oms|psp|carrier|supplier|integration/i],
      ['replay dlq', /idempotency|retries|dlq|replay|reconciliation/i],
      ['specialist handoff', /api agent|specialist_handoff_matrix/i],
      ['nfr', /latency|availability|acceptance test|nfr/i],
    ],
  },
  {
    id: 'storage-data-truth-technology',
    name: 'Storage and data truth technology',
    query: [
      'Retail platform needs order source of truth, payment metadata ledger, inventory reservation authority, promotion ledger, Redis cache, OpenSearch catalog search, object storage for documents, backups, restore tests, retention, and replication.',
      'Need Technology review to prepare Storage Agent handoff.',
    ].join(' '),
    mustMatch: [
      ['source truth', /source.?of.?truth|data truth|transactional|authority|ledger/i],
      ['storage components', /postgres|oltp|redis|cache|opensearch|search|object storage|backup|restore/i],
      ['consistency recovery', /consistency|retention|replication|rebuild|restore/i],
      ['storage agent', /storage agent|data architect/i],
      ['evidence', /technology_decision_evidence_needed|specialist_evidence_needed/i],
    ],
  },
  {
    id: 'ai-rag-technology',
    name: 'AI RAG technology',
    query: [
      'Retail AI assistant and recommendation system needs GPT 5.5 model judgement, local model option later, RAG, embeddings, vector DB, reranking, eval traces, prompt telemetry, fallback, privacy, cost controls, and no dependency in checkout.',
      'Need Technology review before AI Agent.',
    ].join(' '),
    mustMatch: [
      ['rag stack', /rag|llm|embedding|vector|rerank|model routing/i],
      ['fallback', /fallback|checkout-critical|no checkout|human escalation|eval/i],
      ['cost privacy', /privacy|cost|token|telemetry|residency/i],
      ['ai agent', /ai agent|ai platform owner/i],
      ['conditional evidence', /assumption|evidence_status|validation/i],
    ],
  },
  {
    id: 'ui-channel-technology',
    name: 'UI channel technology',
    query: [
      'Retail needs storefront web, admin console, support workspace, associate mobile app, POS UI, offline PWA behavior, accessibility, localization, performance budgets, feature flags, telemetry, and rollback.',
      'Need Technology review before UI Agent.',
    ].join(' '),
    mustMatch: [
      ['channels', /storefront|admin|support|associate|mobile|pos|pwa/i],
      ['ux nfrs', /accessibility|localization|performance budget|telemetry/i],
      ['release controls', /feature flag|rollback|release/i],
      ['ui agent', /ui agent|frontend architect|channel owner/i],
      ['evidence pack', /client_questions|specialist_evidence_needed/i],
    ],
  },
  {
    id: 'missing-specialists-technology',
    name: 'Missing specialist outputs technology',
    query: [
      'Architecture asks for final technology stack and architecture diagram, but API Agent, Storage Agent, AI Agent, and UI Agent have not run. Need Technology review to keep final diagram blocked.',
    ].join(' '),
    mustMatch: [
      ['blocked final', /blocked|draft|not final|not.*approval|specialist/i],
      ['required specialists', /api agent|storage agent|ai agent|ui agent/i],
      ['validation gates', /technology_validation_gates|requires human validation/i],
      ['evidence pack', /approval_workflow|specialist_evidence_needed/i],
    ],
  },
  {
    id: 'store-edge-technology',
    name: 'Store edge technology',
    query: [
      'Store-edge retail rollout with offline POS, associate mobile, local queue, payment terminal, inventory sync, store network outages, local logs, central APIs, and admin support tools.',
      'Need Technology review for API, Storage, UI, AI conditional, and infrastructure handoff.',
    ].join(' '),
    mustMatch: [
      ['store edge', /store edge|offline|pos|associate|local queue|payment terminal/i],
      ['api storage ui', /api|storage|ui|mobile|admin/i],
      ['sync consistency', /sync|replay|consistency|source of truth|data truth/i],
      ['infrastructure handoff', /infrastructure|network|runtime|handoff/i],
      ['specialists', /api agent|storage agent|ui agent/i],
    ],
  },
  {
    id: 'nfr-technology',
    name: 'Technology NFR coverage',
    query: [
      'Retail platform needs latency targets, availability targets, strong consistency for orders and inventory, observability, audit retention, cost controls, deployment rollback, acceptance tests, and rejected alternatives for every technology layer.',
    ].join(' '),
    mustMatch: [
      ['nfr coverage', /latency|availability|consistency|observability|cost|rollback|acceptance test/i],
      ['rejected alternatives', /rejected alternatives|adr|decision/i],
      ['technology layers', /api|storage|ai|ui/i],
      ['validation', /technology_validation_gates|human validation/i],
      ['qualification', /draft_requires_specialist_agent_review|specialist/i],
    ],
  },
];

function flattenOutput(output = {}) {
  return [
    output.summary,
    output.findings,
    output.technology_recommendation,
    output.technology_handoff_summary,
    output.technology_domains,
    output.specialist_handoff_matrix,
    output.api_technology,
    output.storage_technology,
    output.ai_technology,
    output.ui_technology,
    output.technology_nfr_coverage,
    output.technology_evidence_status,
    output.technology_validation_gates,
    output.technology_qualification,
    output.technology_policy_citations,
    output.technology_evidence_pack,
    output.technology_signal_profile,
    output.risks,
    output.validation_needed,
    output.retrieval_requests,
    output.technology_tool_results,
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

function scoreTechnologyOutput(output, testCase) {
  const text = flattenOutput(output);
  const checks = testCase.mustMatch.map(([label, pattern]) => ({ label, pass: pattern.test(text) }));
  checks.push(
    { label: 'v1 technology_recommendation field', pass: Array.isArray(output.technology_recommendation) && output.technology_recommendation.length > 0 },
    { label: 'v1 technology_domains field', pass: Array.isArray(output.technology_domains) && output.technology_domains.length >= 4 },
    { label: 'v1 specialist_handoff_matrix field', pass: Array.isArray(output.specialist_handoff_matrix) && output.specialist_handoff_matrix.length >= 4 },
    { label: 'v1 api_technology field', pass: Boolean(output.api_technology?.recommendation || output.api_technology?.scope) },
    { label: 'v1 storage_technology field', pass: Boolean(output.storage_technology?.recommendation || output.storage_technology?.scope) },
    { label: 'v1 ai_technology field', pass: Boolean(output.ai_technology?.recommendation || output.ai_technology?.scope) },
    { label: 'v1 ui_technology field', pass: Boolean(output.ui_technology?.recommendation || output.ui_technology?.scope) },
    { label: 'v1 technology_nfr_coverage field', pass: Array.isArray(output.technology_nfr_coverage) && output.technology_nfr_coverage.length > 0 },
    { label: 'v1 technology_evidence_status field', pass: Boolean(output.technology_evidence_status?.technology) },
    { label: 'v1 technology_validation_gates field', pass: Array.isArray(output.technology_validation_gates) && output.technology_validation_gates.length > 0 },
    { label: 'v1 technology_qualification field', pass: output.technology_qualification?.status === 'draft_requires_specialist_agent_review' },
    { label: 'v1 technology_policy_citations field', pass: Array.isArray(output.technology_policy_citations) && output.technology_policy_citations.length > 0 },
    { label: 'v1 technology_evidence_pack field', pass: Array.isArray(output.technology_evidence_pack?.approval_workflow) && output.technology_evidence_pack.approval_workflow.length > 0 },
    { label: 'v1 technology_signal_profile field', pass: Array.isArray(output.technology_signal_profile?.domains) && output.technology_signal_profile.domains.length > 0 }
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
  TECHNOLOGY_EVAL_CASES,
  scoreTechnologyOutput,
};
