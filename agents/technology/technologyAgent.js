const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeModelReview, runSpecialistModel } = require('../llmClient');

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

async function runTechnologyAgent({ query, context, state, retrievedContext, useModel }) {
  const signals = getRetailSignals({ query, context, state });
  const scenarioText = [query, JSON.stringify(context || {}), JSON.stringify(state || {})].join(' ');
  const hasApi = /api|gateway|contract|integration|webhook|event|orchestration|erp|wms|oms|psp/i.test(scenarioText);
  const hasStorage = /database|postgres|cache|redis|search|object storage|backup|restore|oltp|data store/i.test(scenarioText);
  const hasAi = signals.retailAi || /ai|rag|llm|embedding|vector|rerank|chatbot|recommendation|model/i.test(scenarioText);
  const hasUi = /ui|frontend|storefront|admin|mobile|pos|associate|pwa|react|next/i.test(scenarioText);

  const findings = [
    'Technology recommendation must decompose into API, Storage, AI, and UI specialist decisions before final architecture approval.',
    'Carry Security, Compliance, Governance, Infrastructure, and FinOps outputs into every technology choice: data class, residency, ownership, NFR, topology, cost, rollout, and evidence status.',
    'Keep technology evidence status explicit: verified, partial, assumption, missing, stale, or blocked for human validation.',
    'Define systems of record, service boundaries, data flows, integration contracts, acceptance tests, and rejected alternatives before treating the technology stack as client-ready.',
  ];
  if (hasApi || signals.commerce || signals.supplyChain) findings.push('API and integration choices must define gateway, service contracts, idempotency, schema versioning, replay, DLQs, third-party SLAs, and reconciliation ownership.');
  if (hasStorage || signals.commerce) findings.push('Storage choices must separate transactional truth from cache/search/read models and define consistency, backup/restore, retention, replication, and rebuild evidence.');
  if (hasAi) findings.push('AI technology must isolate RAG/model/retrieval services from checkout-critical paths and define model routing, embeddings, vector DB, reranking, evals, fallback, privacy, and token cost controls.');
  if (hasUi || signals.storeEdge) findings.push('UI technology must separate storefront, admin, associate/POS, support, and operational views by persona, performance, accessibility, offline, telemetry, release, and rollback needs.');

  const specialistHandoff = [
    { agent: 'API Agent', status: 'required_next', scope: 'API gateway, service contracts, orchestration, eventing, third-party integrations, idempotency, replay, and reconciliation.' },
    { agent: 'Storage Agent', status: 'required_next', scope: 'OLTP truth, cache, search, object storage, backup/restore, retention, replication, rebuild, and analytics handoff.' },
    { agent: 'AI Agent', status: hasAi ? 'required_next' : 'conditional', scope: 'RAG, LLM routing, embeddings, vector DB, reranking, chatbot/recommendation architecture, evals, fallback, and privacy/cost controls.' },
    { agent: 'UI Agent', status: 'required_next', scope: 'Storefront, admin, associate/POS, mobile, support UI, performance, accessibility, telemetry, feature flags, and rollback.' },
  ];

  const technologyDomains = [
    { domain: 'API and integration', provisional_direction: 'API gateway plus explicit service contracts, domain APIs, event contracts, DLQs, replay tooling, and reconciliation controls.', evidence_status: 'assumption' },
    { domain: 'Storage and data platform', provisional_direction: 'Transactional source-of-truth stores for orders/payments/inventory authority, cache/search/read models as subordinate projections, and evidence-backed backup/restore.', evidence_status: 'assumption' },
    { domain: 'AI platform', provisional_direction: hasAi ? 'RAG-ready architecture with model routing, private retrieval boundary, vector DB, embeddings, reranking only when justified, fallback, and no checkout-critical AI dependency.' : 'AI platform remains conditional until AI/RAG, chatbot, recommendation, or model usage is confirmed.', evidence_status: 'assumption' },
    { domain: 'UI and experience', provisional_direction: 'Channel-specific UI architecture for storefront, admin, support, mobile/POS, and operational workflows with performance budgets, accessibility, telemetry, and rollback.', evidence_status: 'assumption' },
  ];

  const risks = [
    risk('Technology selection can look complete while API contracts, data truth, UI channel behavior, and AI retrieval boundaries remain unvalidated.', 'High', 'Medium', 'Require API, Storage, AI, and UI specialist review before final technology approval.'),
    risk('A technology stack can violate upstream constraints if it ignores security classification, compliance residency, governance ownership, infrastructure topology, or FinOps cost drivers.', 'High', 'Medium', 'Trace every technology decision to upstream agent outputs and owner-approved evidence.'),
  ];

  const validationNeeded = [
    'Confirm API, Storage, AI, and UI specialist owners or agents and run their reviews before final architecture approval.',
    'Confirm service boundaries, systems of record, data flows, integration contracts, and rejected alternatives.',
    'Confirm NFRs by technology layer: latency, availability, consistency, privacy, residency, observability, cost, deployment, rollback, and acceptance tests.',
    'Confirm that Security, Compliance, Governance, Infrastructure, and FinOps constraints are reflected in every technology choice.',
  ];

  const retrievalRequests = [
    'retail-technology-decomposition-playbook',
    'retail-api-integration-contract-template',
    'retail-storage-data-platform-template',
    'retail-ai-technology-template',
    'retail-ui-experience-template',
    'retail-cross-cutting-technology-nfr-template',
  ];

  const base = {
    agentId: 'technology',
    title: 'Technology AI Agent',
    status: 'completed',
    summary: 'Technology review aligned to ArchitectIQ Retail: technology decomposition, API/Storage/AI/UI specialist handoff, provisional domain direction, and upstream Security/Compliance/Governance/Infrastructure/FinOps constraints.',
    retail_workload: signals.workloadTypes,
    findings,
    technology_recommendation: findings,
    technology_domains: technologyDomains,
    specialist_handoff_matrix: specialistHandoff,
    api_technology: technologyDomains[0],
    storage_technology: technologyDomains[1],
    ai_technology: technologyDomains[2],
    ui_technology: technologyDomains[3],
    technology_evidence_status: {
      technology: 'assumption',
      api: 'assumption',
      storage: 'assumption',
      ai: hasAi ? 'assumption' : 'conditional',
      ui: 'assumption',
      upstream_handoff: 'assumption',
    },
    risks,
    validation_needed: validationNeeded,
    retrieval_requests: retrievalRequests,
    evidence: retailEvidence(retrievedContext),
    statePatch: {
      retail_workload: signals.workloadTypes,
      technology_controls: findings,
      technology_recommendation: findings,
      technology_domains: technologyDomains,
      specialist_handoff_matrix: specialistHandoff,
      api_technology: technologyDomains[0],
      storage_technology: technologyDomains[1],
      ai_technology: technologyDomains[2],
      ui_technology: technologyDomains[3],
      technology_evidence_status: {
        technology: 'assumption',
        api: 'assumption',
        storage: 'assumption',
        ai: hasAi ? 'assumption' : 'conditional',
        ui: 'assumption',
        upstream_handoff: 'assumption',
      },
      risks,
      human_validation_needed: validationNeeded,
      validation_gaps: validationNeeded.map(item => `Technology validation required: ${item}`),
      evidence_status: {
        technology: 'assumption',
      },
      retrieval_requests: retrievalRequests,
    },
  };

  if (!useModel) return base;

  try {
    const modelReview = await runSpecialistModel({
      agentId: 'technology',
      title: 'Technology AI Agent',
      system: `You are the ArchitectIQ Retail Technology AI Agent. Review technology decomposition only: API, Storage, AI, UI, service boundaries, data flows, integration contracts, technology NFRs, and specialist handoffs. Carry Security, Compliance, Governance, Infrastructure, and FinOps constraints forward. Do not output internal agent-development commentary. Do not pretend API/Storage/AI/UI specialist agents have completed if they have not. Return concise JSON only.`,
      input: JSON.stringify({
        query,
        context,
        current_state: state,
        deterministic_technology_review: base,
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
        `Technology model review failed and deterministic technology rules were used instead: ${err.message}`,
      ],
    };
  }
}

module.exports = { runTechnologyAgent };
