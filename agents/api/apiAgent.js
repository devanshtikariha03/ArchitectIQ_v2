const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeModelReview, runSpecialistModel } = require('../llmClient');

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

async function runApiAgent({ query, context, state, retrievedContext, useModel }) {
  const signals = getRetailSignals({ query, context, state });
  const scenarioText = [query, JSON.stringify(context || {}), JSON.stringify(state || {})].join(' ');
  const hasCommerce = signals.commerce || /checkout|order|payment|inventory|promotion|catalog/i.test(scenarioText);
  const hasSupply = signals.supplyChain || /erp|wms|oms|carrier|supplier|fulfilment|3pl|edi/i.test(scenarioText);
  const hasAi = signals.retailAi || /ai|rag|chatbot|recommendation|model|agent/i.test(scenarioText);
  const hasStoreEdge = signals.storeEdge || /pos|store|offline|associate/i.test(scenarioText);

  const findings = [
    'Define API gateway, domain service contracts, sync/async boundaries, integration ownership, idempotency, replay, DLQs, reconciliation, and observability before treating API architecture as client-ready.',
    'Carry Storage source-of-truth and data-domain output into every API contract so APIs do not bypass authoritative write ownership.',
    'Carry Security, Compliance, Governance, Infrastructure, Technology, Storage, and FinOps handoffs into API decisions: auth, data class, residency, topology, owners, NFRs, and cost drivers.',
    'Keep API evidence status explicit: verified, partial, assumption, missing, stale, or blocked for human validation.',
  ];
  if (hasCommerce) findings.push('For checkout/order/payment/inventory APIs, require idempotency keys, timeout budgets, no duplicate side effects, audit trails, replay-safe operations, and reconciliation reports.');
  if (hasSupply) findings.push('For ERP/WMS/OMS/carrier/supplier/EDI integrations, require payload validation, partner SLAs, retry limits, DLQs, manual exception workflow, and reconciliation ownership.');
  if (hasAi) findings.push('For AI/RAG/tool APIs, isolate AI calls from checkout-critical paths and define tool scopes, rate limits, audit logs, fallback, and human escalation.');
  if (hasStoreEdge) findings.push('For store/POS APIs, define offline queue, sync contract, conflict resolution, replay, device identity, and store-network degraded behavior.');

  const apiContractMatrix = [
    { api: 'Browse/search APIs', mode: 'synchronous read', owner: 'Catalog/search owner', storage_dependency: 'Catalog authority and search projection', evidence_status: 'assumption' },
    { api: 'Checkout/order APIs', mode: 'synchronous critical write', owner: 'Order domain owner', storage_dependency: 'Order OLTP source of truth', evidence_status: 'assumption' },
    { api: 'Payment orchestration APIs', mode: 'synchronous/async boundary', owner: 'Payments owner', storage_dependency: 'Payment metadata ledger and PSP/token vault', evidence_status: 'assumption' },
    { api: 'Inventory reservation APIs', mode: 'synchronous critical write with event projection', owner: 'Inventory owner', storage_dependency: 'Inventory reservation authority', evidence_status: 'assumption' },
    { api: 'Integration/event APIs', mode: 'asynchronous where possible', owner: 'Integration owner', storage_dependency: 'Outbox/inbox, event store, DLQ, replay, reconciliation', evidence_status: 'assumption' },
  ];
  if (hasAi) apiContractMatrix.push({ api: 'AI/RAG tool APIs', mode: 'bounded async or non-critical sync', owner: 'AI platform owner', storage_dependency: 'Approved knowledge corpus/vector store and audit logs', evidence_status: 'assumption' });

  const risks = [
    risk('APIs can appear complete while bypassing storage source-of-truth, creating duplicate orders, stale inventory, payment mismatch, or audit gaps.', 'High', 'Medium', 'Tie every write API to a domain owner, source-of-truth store, idempotency key, and reconciliation evidence.'),
    risk('Third-party retries and malformed payloads can corrupt retail workflows if validation, DLQs, replay, and manual exceptions are not designed.', 'High', 'Medium', 'Define partner contracts, payload validation, retry/DLQ/replay policy, and exception ownership.'),
  ];

  const validationNeeded = [
    'Confirm API gateway, route ownership, auth model, rate limits, WAF/bot handoff, origin isolation, and fallback behavior.',
    'Confirm service contracts, OpenAPI/AsyncAPI schemas, versioning, compatibility, error model, SLAs, and consumer tests.',
    'Confirm sync/async boundaries, idempotency-key scope, retry windows, DLQ ownership, replay process, reconciliation reports, and audit trails.',
    'Confirm partner integration contracts, payload validation, partner SLAs, manual exception workflow, observability, SLOs, runbooks, and support ownership.',
  ];

  const retrievalRequests = [
    'retail-api-gateway-edge-template',
    'retail-service-contract-template',
    'retail-orchestration-integration-template',
    'retail-third-party-integration-template',
    'retail-idempotency-replay-template',
    'retail-api-security-observability-template',
  ];

  const base = {
    agentId: 'api',
    title: 'API AI Agent',
    status: 'completed',
    summary: 'API review aligned to ArchitectIQ Retail: gateway/edge, service contracts, sync/async orchestration, third-party integrations, idempotency, replay, reconciliation, API security, and observability.',
    retail_workload: signals.workloadTypes,
    findings,
    api_recommendation: findings,
    api_contract_matrix: apiContractMatrix,
    api_gateway_strategy: {
      recommendation: 'API gateway with route ownership, auth, rate limits, throttles, WAF/bot handoff, origin isolation, and critical-path separation.',
      evidence_status: 'assumption',
    },
    integration_orchestration: {
      recommendation: 'Use synchronous APIs only for customer-critical low-latency paths; use events/queues/workflows for fulfilment, partner, supplier, and replayable integration flows.',
      evidence_status: 'assumption',
    },
    idempotency_replay_controls: [
      'Define idempotency keys for checkout/order/payment/inventory APIs.',
      'Use outbox/inbox, retries, DLQs, replay tools, reconciliation reports, and audit trails for critical write and integration paths.',
    ],
    api_security_observability: [
      'Apply OAuth/OIDC/JWT/mTLS/scopes, request validation, audit logging, trace correlation, SLO dashboards, runbooks, and incident ownership by API path.',
      'Protect API payloads, logs, traces, errors, and partner payloads according to security classification and residency constraints.',
    ],
    api_evidence_status: {
      api: 'assumption',
      gateway: 'assumption',
      contracts: 'assumption',
      orchestration: 'assumption',
      integrations: hasSupply ? 'assumption' : 'conditional',
      idempotency_replay: 'assumption',
      security_observability: 'assumption',
    },
    risks,
    validation_needed: validationNeeded,
    retrieval_requests: retrievalRequests,
    evidence: retailEvidence(retrievedContext),
    statePatch: {
      retail_workload: signals.workloadTypes,
      api_controls: findings,
      api_recommendation: findings,
      api_contract_matrix: apiContractMatrix,
      api_gateway_strategy: {
        recommendation: 'API gateway with route ownership, auth, rate limits, throttles, WAF/bot handoff, origin isolation, and critical-path separation.',
        evidence_status: 'assumption',
      },
      integration_orchestration: {
        recommendation: 'Use synchronous APIs only for customer-critical low-latency paths; use events/queues/workflows for fulfilment, partner, supplier, and replayable integration flows.',
        evidence_status: 'assumption',
      },
      idempotency_replay_controls: [
        'Define idempotency keys for checkout/order/payment/inventory APIs.',
        'Use outbox/inbox, retries, DLQs, replay tools, reconciliation reports, and audit trails for critical write and integration paths.',
      ],
      api_security_observability: [
        'Apply OAuth/OIDC/JWT/mTLS/scopes, request validation, audit logging, trace correlation, SLO dashboards, runbooks, and incident ownership by API path.',
        'Protect API payloads, logs, traces, errors, and partner payloads according to security classification and residency constraints.',
      ],
      api_evidence_status: {
        api: 'assumption',
        gateway: 'assumption',
        contracts: 'assumption',
        orchestration: 'assumption',
        integrations: hasSupply ? 'assumption' : 'conditional',
        idempotency_replay: 'assumption',
        security_observability: 'assumption',
      },
      risks,
      human_validation_needed: validationNeeded,
      validation_gaps: validationNeeded.map(item => `API validation required: ${item}`),
      evidence_status: {
        api: 'assumption',
      },
      retrieval_requests: retrievalRequests,
    },
  };

  if (!useModel) return base;

  try {
    const modelReview = await runSpecialistModel({
      agentId: 'api',
      title: 'API AI Agent',
      system: `You are the ArchitectIQ Retail API AI Agent. Review API architecture only: gateway/edge, service contracts, domain APIs, sync/async boundaries, orchestration, events, third-party integrations, idempotency, retries, DLQs, replay, reconciliation, API security, observability, and support ownership. Carry Storage source-of-truth plus Security, Compliance, Governance, Infrastructure, Technology, and FinOps constraints forward. Do not output internal agent-development commentary. Return concise JSON only.`,
      input: JSON.stringify({
        query,
        context,
        current_state: state,
        deterministic_api_review: base,
      }),
    });
    return mergeModelReview(base, modelReview);
  } catch (err) {
    return {
      ...base,
      model_review: {
        enabled: true,
        error: err.message,
      },
      validation_needed: [
        ...base.validation_needed,
        `API model review failed and deterministic API rules were used instead: ${err.message}`,
      ],
    };
  }
}

module.exports = { runApiAgent };
