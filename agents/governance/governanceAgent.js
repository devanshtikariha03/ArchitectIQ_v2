const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeModelReview, runSpecialistModel } = require('../llmClient');

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

async function runGovernanceAgent({ query, context, state, retrievedContext, useModel }) {
  const signals = getRetailSignals({ query, context, state });
  const systemsOfRecord = [
    'Product catalogue owner/source of truth',
    'Price and promotion owner/source of truth',
    'Basket/cart and checkout owner/source of truth',
    'Order and payment-token owner/source of truth',
    'Customer/loyalty/consent owner/source of truth',
    'Inventory, reservation, fulfilment, returns, and audit owner/source of truth',
  ];

  const controls = [
    'Classify the retail workload before technology choice: store execution, digital commerce, retail data/loyalty, supply chain/fulfilment, or retail security/compliance.',
    'Apply the mandatory constraint gate before technology choice: hard constraints, end-to-end data residency, budget feasibility, optional retail AI fallback/lock-in, retail process orchestration, and domain relevance.',
    'Assign accountable owners for product, price, promotion, cart, order, payment token, customer/loyalty, inventory, fulfilment, returns, audit, security, compliance, operations, and FinOps.',
    'Create architecture decision records for platform, build/buy, data, integration, AI, security, delivery, and rejected alternatives.',
    'Track assumptions, evidence status, accepted risks, decision expiry dates, and human validation gates as first-class architecture artefacts.',
    'Define approval gates for target architecture, security review, PCI/privacy review, data residency, FinOps, implementation readiness, pilot, rollout waves, and go-live.',
    'Require roadmap evidence: pilot wave criteria, rollback triggers, game days, runbooks, operational owners, measurable acceptance tests, and client-ready approval state.',
    'Require service-level FinOps validation for compute, LLM/API, storage, networking, observability/tooling, security, licensing/partner cost, support plan, non-prod parity, and contingency.',
  ];

  if (signals.storeEdge) {
    controls.push('Govern store rollout with store selection criteria, offline-trading tests, WAN/power-failure drills, queue replay evidence, field replacement runbooks, and wave stop/go thresholds.');
  }
  if (signals.commerce) {
    controls.push('Govern peak trading readiness with campaign load tests, checkout isolation evidence, fraud/payment failover paths, inventory-lock correctness, and rollback criteria.');
  }
  if (signals.loyaltyData) {
    controls.push('Govern customer/loyalty activation with consent ownership, identity-resolution rules, segment lineage, deletion/DSAR workflow, and campaign audit evidence.');
  }
  if (signals.supplyChain) {
    controls.push('Govern supply-chain changes with WMS/OMS/ERP ownership, supplier API contracts, exception queues, manual override policy, and fulfilment-promise acceptance tests.');
  }
  if (signals.retailAi) {
    controls.push('Govern retail AI with model/provider decision records, retrieval-source approval, eval criteria, human escalation, prompt/trace retention, cost controls, and fallback policy.');
  }

  const integrationControls = [
    'Define POS/e-commerce/ERP/OMS/WMS/API ownership and contract versioning.',
    'Require idempotency keys, retry policy, dead letters, replay, reconciliation, duplicate handling, and manual correction for retail integrations.',
    'Separate channel reads from transaction writes so campaign traffic cannot break checkout, POS, payment, order, or inventory commit paths.',
  ];

  const decisions = [
    {
      what: 'Require named systems of record before final technology approval.',
      why: 'Retail architecture risk is concentrated around product, price, promotion, order, payment-token, customer, inventory, fulfilment, returns, and audit ownership. Final technology selection is not defensible until source-of-truth and correction authority are explicit.',
      owner: 'Enterprise architect / business system owners',
    },
    {
      what: 'Keep evidence status separate from recommendations.',
      why: 'The client needs to distinguish verified facts from partial evidence, assumptions, and human-validation gaps before treating the recommendation as approval-ready.',
      owner: 'Architecture governance owner',
    },
    {
      what: 'Make systems of record and integration contracts mandatory before final technology selection.',
      why: 'Retail failures usually occur at ownership, replay, reconciliation, and channel-boundary points, not just at infrastructure selection.',
      owner: 'Enterprise architect / integration owner',
    },
    {
      what: 'Keep Security, Compliance, and FinOps gates ahead of go-live approval.',
      why: 'Client-ready approval requires validated security boundaries, compliance/residency evidence, and budget feasibility before rollout decisions are accepted.',
      owner: 'Architecture board',
    },
  ];

  const constraintGates = [
    'C1 hard constraints: vendor exclusions, residency, sovereignty, compliance, security policy, procurement, hard budget, and hard timeline override convenience.',
    'C2 data residency: validate application data, backups, object storage, prompt payloads, embeddings, vector stores, moderation, telemetry, logs, traces, audit exports, CDN/edge logs, SaaS metadata, support access, CRM/ERP/helpdesk/observability/analytics/ticketing integrations.',
    'C3 budget feasibility: do not mark a path feasible when the upper realistic range exceeds hard budget without mitigation.',
    'C4 retail AI fallback and lock-in: same-vendor fallback is insufficient when retail AI resilience/vendor diversity is required unless residency constraints are explicitly accepted.',
    'C5 retail process orchestration: POS, OMS, WMS, fulfilment, customer profile, payment-token, and inventory processes need ownership, idempotency, retries, dead letters, replay, reconciliation, and human exception handling.',
    'C6 domain relevance: apply only retail and retail-adjacent playbooks; ask for retail context when the request is outside retail.',
  ];

  const risks = [
    risk(
      'Specialist agents may produce plausible but conflicting retail recommendations if ownership and decision authority are not explicit.',
      'Medium',
      'Medium',
      'Master Agent to surface conflicts and route them to named retail architecture, security, compliance, operations, or product owners.'
    ),
    risk(
      'The roadmap may be technically sound but not operable by store operations, commerce teams, or platform support after handover.',
      'High',
      'Medium',
      'Delivery lead to require runbooks, training, acceptance tests, rollback gates, on-call ownership, and evidence from pilot/game-day execution.'
    ),
  ];

  const nfrCoverage = [
    {
      nfr: 'Security',
      target: 'Encryption, IAM, trust boundaries, PCI/privacy controls, audit logging, and key ownership explicitly validated.',
      mechanism: 'Security Agent controls plus human security owner approval.',
      validation_needed: 'Confirm data classes, payment boundary, IAM model, key/certificate owners, and log redaction.',
    },
    {
      nfr: 'Compliance',
      target: 'Compliance and residency remain assumption/partial until evidence is supplied.',
      mechanism: 'Compliance Agent evidence status, residency matrix, and legal/privacy validation gates.',
      validation_needed: 'Confirm jurisdictions, processors, retention, deletion, support access, and audit evidence.',
    },
    {
      nfr: 'Operability',
      target: 'Retail team can run rollout, incidents, replay, rollback, and support workflows.',
      mechanism: 'Runbooks, game days, acceptance tests, rollout gates, and named owners.',
      validation_needed: 'Confirm team capacity, support model, store operations process, and pilot criteria.',
    },
  ];

  const validationNeeded = [
    'Confirm named owners for retail systems of record and decision approvals.',
    'Confirm pilot/store/channel rollout gates, rollback triggers, game days, runbooks, and measurable acceptance tests.',
    'Confirm required delivery artefacts: solution pack, dependency map, roadmap, strategy, code, and markdown documentation.',
  ];

  const base = {
    agentId: 'governance',
    title: 'Governance AI Agent',
    status: 'completed',
    summary: 'Retail governance review aligned to the ArchitectIQ prompt: workload classification, systems of record, decision records, integration controls, rollout gates, and human approval.',
    retail_workload: signals.workloadTypes,
    findings: controls,
    constraint_gates: constraintGates,
    systems_of_record: systemsOfRecord,
    integration_controls: integrationControls,
    nfr_coverage: nfrCoverage,
    decisions,
    risks,
    validation_needed: validationNeeded,
    retrieval_requests: [
      'retail-architecture-governance-playbook',
      'retail-systems-of-record-template',
      'retail-integration-replay-and-reconciliation-checklist',
      'retail-rollout-readiness-gate-template',
    ],
    evidence: retailEvidence(retrievedContext),
    statePatch: {
      retail_workload: signals.workloadTypes,
      systems_of_record: systemsOfRecord,
      integration_controls: integrationControls,
      governance_controls: controls,
      constraint_gates: constraintGates,
      architecture_decisions: decisions,
      nfr_coverage: nfrCoverage,
      risks,
      human_validation_needed: validationNeeded,
      validation_gaps: [
        'Governance Agent needs named retail systems of record, decision owners, rollout gates, and acceptance criteria before client-ready approval.',
      ],
      retrieval_requests: [
        'retail-architecture-governance-playbook',
        'retail-systems-of-record-template',
        'retail-integration-replay-and-reconciliation-checklist',
        'retail-rollout-readiness-gate-template',
      ],
    },
  };

  if (!useModel) return base;

  try {
    const modelReview = await runSpecialistModel({
      agentId: 'governance',
      title: 'Governance AI Agent',
      system: `You are the ArchitectIQ Retail Governance AI Agent. Review architecture governance only. Apply the legacy ArchitectIQ rules: classify retail workload; enforce C1-C6 mandatory constraint gates; name systems of record for product, price, promotion, cart, order, payment token, customer/loyalty, inventory, fulfilment, returns, and audit; define POS/e-commerce/ERP/OMS/WMS ownership, idempotency, retry, DLQ, replay, reconciliation, duplicate handling, manual correction; require ADRs, owners, evidence status, rollout waves, rollback triggers, game days, acceptance tests, runbooks, and human approval gates. Return concise JSON only.`,
      input: JSON.stringify({
        query,
        context,
        current_state: state,
        deterministic_governance_review: base,
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
        `Governance model review failed and deterministic governance rules were used instead: ${err.message}`,
      ],
    };
  }
}

module.exports = { runGovernanceAgent };
