const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const { buildRetailText, getRetailSignals } = require('../retailContext');
const { retrieveApiKnowledge } = require('./apiKnowledgeBase');

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

function inspectApiHandoff(input = {}) {
  const state = input.state || {};
  const upstream = {
    security: Boolean(state.agent_outputs?.security || state.security_tool_context),
    compliance: Boolean(state.agent_outputs?.compliance || state.compliance_tool_context),
    governance: Boolean(state.agent_outputs?.governance || state.governance_tool_context),
    infrastructure: Boolean(state.agent_outputs?.infrastructure || state.infrastructure_tool_context),
    technology: Boolean(state.agent_outputs?.technology || state.technology_tool_context),
    storage: Boolean(state.agent_outputs?.storage || state.storage_tool_context),
    finops: Boolean(state.agent_outputs?.finops || state.finops_tool_context),
    storage_evidence_status: state.storage_evidence_status || {},
    technology_evidence_status: state.technology_evidence_status || {},
    security_evidence_status: state.security_evidence_pack?.evidence_status || state.evidence_status || {},
    validation_gaps: asArray(state.validation_gaps),
  };
  const controls = [
    'Carry upstream constraints into API design: storage source of truth, data classes, PCI/privacy, residency, gateway topology, auth, owners, NFRs, replay, observability, and cost drivers.',
    'API remains draft until route owners, service contracts, sync/async boundaries, idempotency, replay, integration SLAs, and runbooks are validated.',
  ];
  if (upstream.storage) controls.push('Apply Storage handoff to source-of-truth ownership, write authority, consistency, cache/search/read models, and replay/reconciliation boundaries.');
  if (upstream.security) controls.push('Apply Security handoff to authN/authZ, mTLS, scopes, payload validation, secrets, audit logging, and privileged/admin APIs.');
  if (upstream.compliance) controls.push('Apply Compliance handoff to API payload residency, logs/traces, support access, processor obligations, retention, and deletion workflows.');
  if (upstream.infrastructure) controls.push('Apply Infrastructure handoff to API ingress, origin isolation, private connectivity, SLOs, failover, observability, and release topology.');
  if (upstream.technology) controls.push('Apply Technology handoff to domain boundaries, API/Storage/AI/UI contracts, NFRs, and specialist synthesis gates.');

  return {
    tool: 'inspectApiHandoffTool',
    upstream,
    controls,
    validation_needed: [
      'Confirm upstream Storage, Technology, Security, Compliance, Governance, and Infrastructure outputs are accepted as constraints before API approval.',
      'Confirm unresolved validation gaps are assigned to API, integration, storage, platform, security, compliance, and FinOps owners.',
    ],
  };
}

function designApiGateway(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  return {
    tool: 'designApiGatewayTool',
    api_gateway_strategy: {
      recommendation: 'API gateway with route ownership, auth, rate limits, throttles, WAF/bot handoff, TLS policy, origin isolation, and channel/tenant separation.',
      critical_path_isolation: signals.commerce ? ['browse/search origin pool', 'checkout/order/payment origin pool', 'integration/partner API pool', 'AI/tool API pool where applicable'] : ['customer API pool', 'partner API pool', 'admin/support API pool'],
      evidence_status: 'assumption',
    },
    controls: [
      'Separate browse/search, checkout/order/payment, integration, admin/support, and AI/tool API routes by criticality and failure mode.',
      'Define rate limits, throttles, auth, payload limits, schema validation, WAF/bot handoff, and fallback behavior by route class.',
    ],
    risks: [
      risk('Shared ingress or route policy can allow browse spikes, bot abuse, partner retries, or AI traffic to degrade checkout/order/payment APIs.', 'High', 'Medium', 'Use route classes, origin isolation, limits, and critical-path SLOs.'),
    ],
    validation_needed: [
      'Confirm gateway product, route map, auth model, WAF/bot handoff, rate limits, throttles, origin isolation, and route owners.',
    ],
  };
}

function defineServiceContracts(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const matrix = [
    { api: 'Catalog/search API', contract: 'OpenAPI read contract with pagination/filtering/error model', owner: 'Catalog/search owner', storage_dependency: 'Catalog authority and search projection', evidence_status: 'assumption' },
    { api: 'Checkout/order API', contract: 'OpenAPI write contract with idempotency key, timeout budget, audit fields, and error model', owner: 'Order owner', storage_dependency: 'Order OLTP source of truth', evidence_status: 'assumption' },
    { api: 'Payment API', contract: 'Payment orchestration contract with PSP/token-vault boundary and reconciliation fields', owner: 'Payments owner', storage_dependency: 'Payment metadata ledger', evidence_status: 'assumption' },
    { api: 'Inventory API', contract: 'Reservation/commit contract with consistency and conflict behavior', owner: 'Inventory owner', storage_dependency: 'Inventory reservation authority', evidence_status: 'assumption' },
    { api: 'Integration/event API', contract: 'AsyncAPI/event schema with versioning, replay, DLQ, and consumer compatibility', owner: 'Integration owner', storage_dependency: 'Outbox/inbox and event store', evidence_status: 'assumption' },
  ];
  if (signals.retailAi) matrix.push({ api: 'AI/tool API', contract: 'Tool contract with scopes, data class, audit, rate limits, fallback, and human escalation', owner: 'AI platform owner', storage_dependency: 'Approved corpus/vector store and audit logs', evidence_status: 'assumption' });
  return {
    tool: 'defineServiceContractsTool',
    api_contract_matrix: matrix,
    controls: [
      'Every API contract must name owner, consumer, versioning policy, compatibility, auth scope, error model, idempotency behavior, and storage dependency.',
      'OpenAPI/AsyncAPI/schema definitions should be treated as governed artifacts with contract tests.',
    ],
    validation_needed: [
      'Confirm contract format, owners, consumers, versioning, compatibility, error codes, idempotency, SLAs, auth scopes, and consumer tests.',
    ],
  };
}

function planOrchestration(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  return {
    tool: 'planOrchestrationTool',
    integration_orchestration: {
      sync_paths: ['browse/search reads', 'checkout/order/payment commit', 'inventory reservation where immediate promise is required'],
      async_paths: ['fulfilment', 'carrier/supplier updates', 'ERP/WMS/OMS sync', 'analytics/events', 'email/notification', signals.retailAi ? 'AI enrichment/evaluation where non-critical' : null].filter(Boolean),
      controls: [
        'Use synchronous calls only where user-facing latency and consistency require it.',
        'Use queues/events/workflows for replayable integration, fulfilment, partner, analytics, and long-running work.',
        'Define timeout, compensation, backpressure, circuit breaker, degraded mode, and manual exception behavior.',
      ],
      evidence_status: 'assumption',
    },
    controls: [
      'Separate customer-critical synchronous APIs from replayable asynchronous workflows.',
      'Do not place slow or unreliable third-party calls inline with checkout commit unless fallback and timeout evidence exists.',
    ],
    validation_needed: [
      'Confirm sync/async boundaries, event backbone, queue policy, workflow owner, timeout, compensation, degraded mode, and manual exception handling.',
    ],
  };
}

function planThirdPartyIntegrations(input = {}) {
  const text = textFromInput(input);
  const partners = [
    /psp|payment/.test(text) ? 'PSP/payment provider' : null,
    /erp/.test(text) ? 'ERP' : null,
    /wms/.test(text) ? 'WMS' : null,
    /oms/.test(text) ? 'OMS' : null,
    /carrier|shipping|3pl/.test(text) ? 'Carrier/3PL' : null,
    /supplier|edi/.test(text) ? 'Supplier/EDI' : null,
    /marketplace|seller/.test(text) ? 'Marketplace/seller' : null,
  ].filter(Boolean);
  return {
    tool: 'planThirdPartyIntegrationsTool',
    third_party_integrations: (partners.length ? partners : ['Partner/SaaS integrations not fully enumerated']).map(partner => ({
      partner,
      contract_needed: 'Payload schema, auth, SLA, retry policy, rate limit, validation, DLQ/replay, reconciliation, support owner.',
      evidence_status: 'assumption',
    })),
    controls: [
      'Validate all inbound partner payloads and reject or quarantine malformed, stale, duplicate, or unauthorized events.',
      'Define partner retry/rate limits, DLQs, replay, reconciliation, manual exception workflow, and support escalation.',
    ],
    risks: [
      risk('Partner payloads or retry storms can corrupt inventory, fulfilment, catalogue, payment, or order state.', 'High', 'Medium', 'Use strict schemas, idempotency, rate limits, DLQs, reconciliation, and manual exception workflows.'),
    ],
    validation_needed: [
      'Confirm partner list, API/EDI formats, payload validation, auth, SLA, retry limits, reconciliation, manual exception workflow, and support ownership.',
    ],
  };
}

function planIdempotencyReplay() {
  return {
    tool: 'planIdempotencyReplayTool',
    idempotency_replay_controls: [
      'Define idempotency-key scope by operation: checkout, order commit, payment authorization/capture/refund, inventory reservation, promotion application, and partner updates.',
      'Use outbox/inbox and dedupe for state-changing events.',
      'Route failed async work to DLQs with owner, alert, triage, replay, poison-message, and customer-impact handling.',
      'Produce reconciliation reports for orders, payments, inventory reservations, fulfilment updates, returns, and partner integrations.',
      'Keep replay audited, permissioned, scoped, and safe against duplicate customer-visible effects.',
    ],
    controls: [
      'Retail write APIs and integration events need idempotency, replay, DLQ, and reconciliation evidence before approval.',
    ],
    validation_needed: [
      'Confirm idempotency-key scope, retry windows, DLQ ownership, replay process, reconciliation report, audit trail, and customer-impact handling.',
    ],
  };
}

function planApiSecurityObservability() {
  return {
    tool: 'planApiSecurityObservabilityTool',
    api_security_observability: [
      'AuthN/authZ with OAuth/OIDC/JWT/mTLS/scopes by route class and partner.',
      'Schema/payload validation, size limits, content-type controls, request signing where required, and audit fields.',
      'Trace correlation across gateway, service, queue/event, storage write, partner call, and replay/reconciliation path.',
      'SLOs, dashboards, alerts, runbooks, on-call ownership, and incident workflow by critical API path.',
      'Redaction and residency controls for API logs, traces, error bodies, support bundles, and partner payloads.',
    ],
    controls: [
      'API security and observability must be designed per route class, not as a generic platform checkbox.',
    ],
    validation_needed: [
      'Confirm authN/authZ, scopes, schema validation, audit fields, trace IDs, logs/metrics, SLOs, runbooks, and on-call ownership.',
    ],
  };
}

function retrieveApiKnowledgeForInput(input = {}) {
  return retrieveApiKnowledge({
    query: buildRetailText({
      query: input.query || '',
      context: input.context || {},
      state: input.state || {},
    }),
    retrievalPlan: input.retrievalPlan || input.retrieval_plan || [],
    signals: input.signals || {},
    limit: input.limit || 7,
  });
}

function validateApiOutput(input = {}) {
  const output = input.output || {};
  const toolResults = asArray(input.toolResults);
  const text = [
    output.summary,
    output.findings,
    output.api_recommendation,
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
    toolResults,
  ].flat(7).map(item => typeof item === 'string' ? item : JSON.stringify(item || '')).join('\n').toLowerCase();
  const blockers = [];
  const warnings = [];
  const improvements = [];
  const hasGateway = /api gateway|gateway|rate limit|throttle|waf|origin|ingress/.test(text);
  const hasContracts = /contract|openapi|asyncapi|schema|versioning|service boundary|consumer/.test(text);
  const hasOrchestration = /sync|async|orchestration|queue|event|workflow|timeout|compensation/.test(text);
  const hasIntegrations = /third-party|partner|erp|wms|oms|psp|carrier|supplier|edi|integration/.test(text);
  const hasIdempotency = /idempotency|idempotent|retry|dlq|replay|reconciliation|outbox|inbox|dedupe/.test(text);
  const hasSecurityObs = /oauth|oidc|jwt|mtls|scope|audit|trace|logs|metrics|slo|runbook|observability/.test(text);
  const hasStorageHandoff = /storage|source.?of.?truth|write authority|data truth|oltp/.test(text);
  const hasUpstream = /technology|security|compliance|governance|infrastructure|finops|handoff/.test(text);
  const hasEvidencePack = /evidence_pack|policy_sources|approval_workflow|client_questions|contract_evidence_needed|integration_evidence_needed|replay_evidence_needed/.test(text);
  const hasQualification = /draft|not.*approval|human validation|requires.*validation|api owner|integration owner/.test(text);
  const hasCitations = /citation|source_id|policy|baseline/.test(text);

  if (!hasGateway) blockers.push('API output does not define gateway/edge/rate-limit/origin strategy.');
  if (!hasContracts) blockers.push('API output does not define service contracts/schema/versioning.');
  if (!hasOrchestration) blockers.push('API output does not define sync/async orchestration boundaries.');
  if (!hasIntegrations) warnings.push('API output should include third-party/partner integration controls, even if conditional.');
  if (!hasIdempotency) blockers.push('API output does not define idempotency/retry/DLQ/replay/reconciliation controls.');
  if (!hasSecurityObs) blockers.push('API output does not define API security/observability/runbook controls.');
  if (!hasStorageHandoff) blockers.push('API output does not consume Storage source-of-truth/write-authority constraints.');
  if (!hasUpstream) blockers.push('API output does not consume upstream Technology/Security/Compliance/Governance/Infrastructure/FinOps constraints.');
  if (!hasEvidencePack) blockers.push('API output does not include customer-facing evidence pack with contract/integration/replay evidence needs.');
  if (!hasQualification) blockers.push('API output does not qualify recommendation as draft-level until API/integration owners validate evidence.');
  if (!hasCitations) warnings.push('API output should include citations or source evidence.');
  if (!toolResults.length) blockers.push('API tools did not produce handoff, gateway, contracts, orchestration, integrations, replay, observability, retrieval, or validation evidence.');
  if (!output.model_review?.enabled) improvements.push('Run model judgement for customer-specific API recommendations when an approved model is available.');

  return {
    tool: 'validateApiOutputTool',
    verdict: blockers.length ? 'fail' : warnings.length ? 'warn' : 'pass',
    blockers,
    warnings,
    improvements,
    required_controls: {
      gateway: hasGateway,
      contracts: hasContracts,
      orchestration: hasOrchestration,
      integrations: hasIntegrations,
      idempotency_replay: hasIdempotency,
      security_observability: hasSecurityObs,
      storage_handoff: hasStorageHandoff,
      upstream_handoff: hasUpstream,
      evidence_pack: hasEvidencePack,
      qualification: hasQualification,
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

const apiTools = {
  inspectApiHandoffTool: tool(inspectApiHandoff, {
    name: 'inspectApiHandoffTool',
    description: 'Inspect upstream Storage, Technology, Security, Compliance, Governance, Infrastructure, and FinOps constraints before API recommendations.',
    schema: toolInputSchema,
  }),
  designApiGatewayTool: tool(designApiGateway, {
    name: 'designApiGatewayTool',
    description: 'Design API gateway, edge, route class, auth, rate-limit, and origin isolation strategy.',
    schema: toolInputSchema,
  }),
  defineServiceContractsTool: tool(defineServiceContracts, {
    name: 'defineServiceContractsTool',
    description: 'Define API/service contracts, schemas, owners, versioning, and storage dependencies.',
    schema: toolInputSchema,
  }),
  planOrchestrationTool: tool(planOrchestration, {
    name: 'planOrchestrationTool',
    description: 'Plan synchronous/asynchronous API orchestration, queues, events, compensation, and degraded modes.',
    schema: toolInputSchema,
  }),
  planThirdPartyIntegrationsTool: tool(planThirdPartyIntegrations, {
    name: 'planThirdPartyIntegrationsTool',
    description: 'Plan third-party, partner, B2B, PSP, ERP, WMS, OMS, supplier, and carrier integration controls.',
    schema: toolInputSchema,
  }),
  planIdempotencyReplayTool: tool(planIdempotencyReplay, {
    name: 'planIdempotencyReplayTool',
    description: 'Plan idempotency, retry, DLQ, replay, reconciliation, and audit controls.',
    schema: toolInputSchema,
  }),
  planApiSecurityObservabilityTool: tool(planApiSecurityObservability, {
    name: 'planApiSecurityObservabilityTool',
    description: 'Plan API security, audit, tracing, SLOs, runbooks, and observability controls.',
    schema: toolInputSchema,
  }),
  retrieveApiKnowledgeTool: tool(retrieveApiKnowledgeForInput, {
    name: 'retrieveApiKnowledgeTool',
    description: 'Retrieve local ArchitectIQ API knowledge and customer policy packs.',
    schema: toolInputSchema,
  }),
  validateApiOutputTool: tool(validateApiOutput, {
    name: 'validateApiOutputTool',
    description: 'Validate API output against gateway, contracts, orchestration, integrations, replay, observability, handoff, and evidence controls.',
    schema: toolInputSchema,
  }),
};

module.exports = {
  apiTools,
  defineServiceContracts,
  designApiGateway,
  inspectApiHandoff,
  planApiSecurityObservability,
  planIdempotencyReplay,
  planOrchestration,
  planThirdPartyIntegrations,
  retrieveApiKnowledgeForInput,
  validateApiOutput,
};
