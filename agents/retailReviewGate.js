const { getRetailSignals } = require('./retailContext');

function asText(value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function flattenStateForReview(state = {}, outputs = []) {
  return [
    state.business_context,
    state.functional_requirements,
    state.non_functional_requirements,
    state.constraints,
    state.existing_systems,
    state.retail_workload,
    state.systems_of_record,
    state.integration_controls,
    state.data_classification,
    state.security_controls,
    state.compliance_obligations,
    state.governance_controls,
    state.finops_controls,
    state.cost_drivers,
    state.workload_pricing_assumptions,
    state.architecture_decisions,
    state.residency_matrix,
    state.nfr_coverage,
    state.human_validation_needed,
    state.validation_gaps,
    state.risks,
    outputs.map(output => ({
      agent: output.agentId,
      summary: output.summary,
      findings: output.findings,
      risks: output.risks,
      validation_needed: output.validation_needed,
    })),
  ].map(asText).join(' ').toLowerCase();
}

function addUnique(list, item) {
  return list.some(existing => String(existing).toLowerCase() === String(item).toLowerCase())
    ? list
    : [...list, item];
}

function scoreCheck(condition, strong = 9, weak = 5) {
  return condition ? strong : weak;
}

function hasAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text));
}

function defaultNfrCoverage(state = {}) {
  const scale = state.scale || {};
  const nfr = state.nfr || {};
  return [
    {
      nfr: 'Availability',
      target: scale.sla || 'SLA not stated',
      mechanism: 'Redundant runtime, integration queues, health checks, degraded modes, and owner alerts.',
      validation_needed: 'Run dependency-failure and failover tests against ERP, WMS, POS, store, channel, and provider dependencies.',
    },
    {
      nfr: 'Latency',
      target: scale.latency || 'Latency target not stated',
      mechanism: 'Separate synchronous commit paths from async integration, cache read-heavy availability data, and isolate checkout/order commit.',
      validation_needed: 'Load test peak browse, checkout, reservation, payment, inventory, and fulfilment promise paths.',
    },
    {
      nfr: 'RTO/RPO',
      target: nfr.dr || 'RTO/RPO not stated',
      mechanism: 'Backups, replayable events, restore runbooks, and reconciliation after backlog drain.',
      validation_needed: 'Complete restore, replay, and reconciliation game day with measured RTO/RPO.',
    },
    {
      nfr: 'Security',
      target: nfr.security || 'Security target not fully stated',
      mechanism: 'Identity controls, trust boundaries, encryption, key ownership, token paths, log filtering, least privilege, and audit evidence.',
      validation_needed: 'Security architect validates segmentation, IAM, key/certificate ownership, logging exclusions, and support access.',
    },
    {
      nfr: 'Compliance',
      target: nfr.compliance || 'Compliance target not fully stated',
      mechanism: 'Evidence status, PCI/privacy scope, residency matrix, retention/deletion workflow, and legal/privacy owner validation.',
      validation_needed: 'Compliance/privacy owner validates jurisdictions, processors, support access, audit evidence, and deletion obligations.',
    },
    {
      nfr: 'Operability',
      target: nfr.maintainability || 'Operations target not stated',
      mechanism: 'Dashboards, alerts, queue-age SLOs, runbooks, rollback triggers, game days, and named operational owners.',
      validation_needed: 'Support team completes runbook walkthrough and incident simulation before pilot.',
    },
    {
      nfr: 'Consistency',
      target: nfr.consistency || 'Consistency target not stated',
      mechanism: 'System-of-record ownership, idempotency keys, duplicate handling, reservation ledger, and reconciliation windows.',
      validation_needed: 'Replay duplicate/out-of-order events and validate no stock, order, payment, or customer-notification drift.',
    },
    {
      nfr: 'Cost',
      target: state.cost?.monthly || 'Budget not stated',
      mechanism: 'Tiered architecture, cost guardrails, retention controls, and FinOps review before rollout.',
      validation_needed: 'Validate estimates against service-level pricing, non-prod, licensing, partner, support, and contingency costs.',
    },
  ];
}

function defaultAssumptions(state = {}) {
  const signals = getRetailSignals({ state });
  return [
    `${state.basics?.company || 'The retail client'} scale and current-state facts are treated as client-provided until validated against POS, commerce, WMS/ERP, CRM/CDP, and analytics telemetry.`,
    `Primary workload is classified as ${signals.workloadTypes[0] || 'retail context not confirmed'}; adjacent segments should be confirmed during discovery: ${(signals.workloadTypes || []).join(', ') || 'none detected'}.`,
    'Pricing, compliance, region availability, model currentness, and data residency remain assumption-level until official provider/client evidence is supplied.',
    'Security, compliance, and governance outputs are review findings, not client-approved decisions, until named human owners validate evidence and accept risks.',
  ];
}

function securityAnnotationModel(text) {
  const hasPii = /pii|customer|loyalty|profile|phone|address|support|privacy|consent/.test(text);
  const hasPayment = /payment|psp|pci|token|pan|sad|card|p2pe/.test(text);
  const hasSftp = /sftp|file transfer|batch/.test(text);
  const hasOnPrem = /on-?prem|data center|datacenter|legacy|erp|pos/.test(text);
  return {
    annotations: [
      ['A1', 'User/service credentials stored in Secret Manager or equivalent.'],
      ['A2', 'System-to-system credentials encrypted with AES-256 and rotated by owner.'],
      ['CA1', 'Strong user authentication: MFA, KBA, passwordless, or step-up control.'],
      ['CA2', 'Basic username/password only; requires compensating MFA or policy review.'],
      ['R2', 'Encryption at rest using customer-supplied or customer-managed keys where required.'],
      ['R3', 'Encryption at rest using cloud-managed keys where risk and regulation permit.'],
      ['T', 'Encryption in transit using TLS 1.2+ / SSH or equivalent.'],
      ['C3', 'Class 3 operational/business data.'],
      ['C5', 'Class 5 sensitive PII/payment-adjacent data.'],
      ['C5E', 'Class 5 data with field/app-layer encryption or PGP where required.'],
      ['SB', 'External security boundary: firewall, WAF, IPS, segmentation, or PSP boundary.'],
      ['TB', 'Trust boundary around different ownership or security zones.'],
    ],
    expected_controls: [
      hasPii ? 'C5/C5E expected for customer, loyalty, support, and privacy stores.' : 'C3 expected unless discovery confirms PII/regulated data.',
      hasPayment ? 'SB required around PSP/token vault and PCI-scoped paths.' : 'Payment boundary not detected in this workload.',
      hasSftp ? 'SFTP feeds require SSH, key rotation, landing-zone scanning, and reconciliation evidence.' : 'Batch/SFTP feed not detected.',
      hasOnPrem ? 'On-prem/legacy boundaries require TB, egress control, support-access controls, and migration rollback evidence.' : 'On-prem boundary not detected.',
      'T required on every inter-service and external integration flow.',
      'R2/R3 required before tokenization or masking is treated as sufficient.',
    ],
  };
}

function deterministicRetailValidation({ query = '', context = {}, state = {}, outputs = [] }) {
  const signals = getRetailSignals({ query, context, state });
  const text = flattenStateForReview(state, outputs);
  const warnings = [];
  const improvements = [];
  const constraint_violations = [];

  const checks = [
    {
      when: signals.retail,
      pattern: /system.?s? of record|source of truth|ownership|product.*price|order.*inventory|inventory.*order|payment token|returns|audit/i,
      warning: 'Retail architecture should explicitly name systems of record and ownership for product, price, promotion, order, payment token, customer/loyalty, inventory, fulfilment, returns, and audit where relevant.',
    },
    {
      when: signals.retail,
      pattern: /idempot|dead.?letter|dlq|replay|reconcil|duplicate|retry|poison|manual correction/i,
      warning: 'Retail integration design should define idempotency, retry/dead-letter handling, replay, reconciliation, duplicate prevention, and manual correction.',
    },
    {
      when: signals.storeEdge,
      pattern: /edge.*(ha|failover|failure|hot spare|replacement|appliance)|appliance.*(ha|failover|failure|hot spare|replacement)|store.*(wave|pilot)/i,
      warning: 'Store-edge retail designs must state edge appliance HA, failure behavior, replacement path, or accepted single-appliance risk before rollout.',
    },
    {
      when: signals.storeEdge,
      pattern: /offline.*(auth|payment|queue|mode|boundary)|queue.*(durab|order|replay|idempot)|reconnect|wan/i,
      warning: 'Store continuity designs must prove offline auth/payment boundaries, queue durability, ordering, replay/idempotency, and reconnect criteria.',
    },
    {
      when: signals.payments,
      pattern: /pci.*(scope|segmentation|boundary)|p2pe|pan|sad|payment.*(vlan|segmentation|provider|rail)|qsa|token vault|psp/i,
      warning: 'Retail payment designs must define PCI scope, segmentation evidence, PAN/SAD exclusion or explicit scope, P2PE/tokenization boundary, and QSA/human validation.',
    },
    {
      when: signals.customerData || signals.loyaltyData,
      pattern: /consent|tokeni[sz]ation|pseudonym|retention|deletion|dsar|erasure|support access|minimi[sz]ation|regional ownership/i,
      warning: 'Retail customer/loyalty designs must cover consent, tokenization or pseudonymization, retention, deletion/DSAR, regional ownership, support access, and analytics minimization.',
    },
    {
      when: signals.retail,
      pattern: /pilot|wave|rollback|acceptance|game.?day|go.?live|done when|launch gate|rollout gate/i,
      warning: 'Retail roadmap should include pilot wave criteria, rollback triggers, operational owners, game days, and measurable acceptance tests.',
    },
    {
      when: signals.commerce,
      pattern: /cdn|waf|cache|peak|campaign|black friday|checkout.*isolation|read.*write|cart|promotion|search|circuit breaker/i,
      warning: 'Digital commerce architectures should isolate campaign/read traffic from checkout, payment, order, and inventory commit paths and define peak-testing criteria.',
    },
    {
      when: signals.supplyChain,
      pattern: /wms|tms|reservation|fulfil|fulfill|replenish|supplier|warehouse|exception|substitution|manual override/i,
      warning: 'Retail supply-chain designs should connect demand, inventory, fulfilment promises, warehouse/store operations, exceptions, and manual overrides.',
    },
  ];

  for (const check of checks) {
    if (check.when && !check.pattern.test(text)) warnings.push(check.warning);
  }

  if (!hasAny(text, [/encrypt|tls|ssh|kms|hsm|cmek|csek|aes|pgp|key rotation|secret manager|at rest|in transit|field.?level|app.?layer/i])) {
    warnings.push('Security detail is insufficient; tokenization/masking is not enough without explicit encryption in transit, encryption at rest, key ownership/rotation, secret-manager use, and log redaction.');
  }
  if (!hasAny(text, [/trust boundary|security boundary|segmentation|firewall|waf|ips|pci scope|psp boundary|network zone|private subnet|egress/i])) {
    warnings.push('Diagram/security detail should show trust boundaries, external security boundaries, provider/network zones, and PCI/privacy segmentation evidence.');
  }
  if (!Array.isArray(state.nfr_coverage) || state.nfr_coverage.length < 5) {
    warnings.push('Structured NFR coverage is incomplete; availability, latency, RTO/RPO, security, compliance, cost, operability, and DR need explicit targets and validation evidence.');
  }
  if (!Array.isArray(state.residency_matrix) || !state.residency_matrix.length) {
    warnings.push('Residency matrix is missing; include application data, backups, logs, telemetry, SaaS metadata, support access, and third-party processors.');
  }

  if (signals.retailAi && hasAny(text, [/\baws\s+step\s+functions\b/i, /\bstep\s+functions\b/i, /\bazure\s+logic\s+apps\b/i, /\blogic\s+apps\b/i, /\bapache\s+airflow\b/i, /\baws\s+glue\s+workflows\b/i])) {
    constraint_violations.push('Retail AI/model/agent control layer must not be represented by Step Functions, Logic Apps, Airflow, or Glue Workflows; use a traced AI orchestration pattern with human escalation.');
  }

  improvements.push('Add a retail acceptance-test pack covering peak campaign load, offline store operation, replay backlog, payment/P2PE boundary, PCI segmentation, data deletion, and rollout rollback gates.');

  return {
    verdict: constraint_violations.length ? 'fail' : warnings.length ? 'warn' : 'pass',
    constraint_violations,
    warnings,
    improvements,
  };
}

function architectureBoardChecks({ query = '', context = {}, state = {}, outputs = [], validation = {} }) {
  const signals = getRetailSignals({ query, context, state });
  const text = flattenStateForReview(state, outputs);
  const hasResidencyMatrix = Array.isArray(state.residency_matrix) && state.residency_matrix.length > 0;
  const hasNfrCoverage = Array.isArray(state.nfr_coverage) && state.nfr_coverage.length >= 5;
  const hasHumanValidation = Array.isArray(state.human_validation_needed) && state.human_validation_needed.length >= 3;
  const hasEncryptionEvidence = /encrypt|tls|ssh|kms|hsm|cmek|csek|aes|pgp|key rotation|secret manager|at rest|in transit|field.?level|app.?layer/i.test(text);
  const hasTrustBoundaryEvidence = /trust boundary|security boundary|segmentation|firewall|waf|ips|pci scope|psp boundary|network zone|private subnet|egress/i.test(text);
  const hasScalingEvidence = /autoscal|keda|queue lag|consumer lag|connection pool|pgbouncer|backpressure|rate limit|quota|cache hit|load test|stress test|peak test|degraded mode|circuit breaker|bulkhead/i.test(text);
  const hasFinopsEvidence = /finops|unit cost|cost driver|reserved|committed|savings plan|right.?siz|egress|iops|retention|non.?prod|licen[sc]|support plan|contingency|budget guardrail/i.test(text);

  const checks = [
    {
      lens: 'Business outcome',
      score: scoreCheck(/business|revenue|conversion|availability|customer|store|fulfil|fulfill|inventory|checkout/i.test(text), 9, 6),
      evidence: 'Major architecture choices should tie back to retail business outcomes.',
      gap: 'Tie every significant component to revenue, customer experience, risk, or operational continuity.',
    },
    {
      lens: 'Hard constraints',
      score: validation.constraint_violations?.length ? 4 : scoreCheck(/budget|residen|pci|privacy|deadline|timeline|constraint/i.test(text), 8, 6),
      evidence: 'Budget, compliance, residency, timeline, and vendor constraints must be explicit.',
      gap: 'Promote hard constraints into visible design decisions and delivery gates.',
    },
    {
      lens: 'Evidence currentness',
      score: Object.values(state.evidence_status || {}).some(value => String(value).toLowerCase() === 'verified') ? 8 : 6,
      evidence: 'Pricing, region availability, compliance, and vendor claims need verified/partial/assumption status.',
      gap: 'Mark currentness-sensitive claims as verified, partial, or assumption and keep weak evidence out of final claims.',
    },
    {
      lens: 'Security and compliance',
      score: scoreCheck((/pci|token|secret|segmentation|identity|mfa|audit|privacy|p2pe|qsa/i.test(text) && hasEncryptionEvidence && hasTrustBoundaryEvidence), 9, 5),
      evidence: 'Security must cover encryption, identity, key ownership, token paths, PCI/privacy, logging exclusions, and audit.',
      gap: 'Add encryption-at-rest/in-transit, key ownership, trust boundaries, PCI/privacy evidence, support-access rules, and owner sign-off.',
    },
    {
      lens: 'Encryption and trust boundaries',
      score: hasEncryptionEvidence && hasTrustBoundaryEvidence ? 9 : hasEncryptionEvidence || hasTrustBoundaryEvidence ? 6 : 4,
      evidence: 'Tokenisation and masking are not enough; encryption and trust boundaries must be explicit.',
      gap: 'Show TLS/SSH in transit, KMS/HSM/CMEK/CSEK at rest, secret-manager credentials, data class, external security boundary, and trust-boundary evidence.',
    },
    {
      lens: 'Data ownership',
      score: scoreCheck(/system.?s? of record|source of truth|owner|lineage|retention|deletion|inventory|customer|order|price/i.test(text), 8, 5),
      evidence: 'Retail data domains need explicit ownership and lifecycle controls.',
      gap: 'Name owners for product, price, promotion, order, payment token, customer, inventory, returns, and audit.',
    },
    {
      lens: 'Integration correctness',
      score: scoreCheck(/idempot|retry|dead.?letter|dlq|replay|reconcil|duplicate|event|queue/i.test(text), 9, 5),
      evidence: 'Retail integrations fail safely only with replay, duplicate handling, reconciliation, and manual correction.',
      gap: 'Add integration contracts, idempotency keys, retry/dead-letter rules, replay, and reconciliation windows.',
    },
    {
      lens: 'Operability',
      score: scoreCheck(/runbook|observability|dashboard|alert|slo|rollback|on.?call|support|game.?day/i.test(text), 8, 5),
      evidence: 'The client team must be able to run, detect, repair, and roll back the solution.',
      gap: 'Add runbooks, alert thresholds, owner roles, rollback triggers, game days, and support handoff.',
    },
    {
      lens: 'Cost and delivery realism',
      score: scoreCheck(/phase|pilot|wave|dependency|owner|done when|acceptance/i.test(text) && hasFinopsEvidence, 8, 5),
      evidence: 'The recommended path must fit budget, FinOps evidence, and roadmap deliverability.',
      gap: 'Add FinOps unit drivers, right-sizing/commitment levers, partner/licensing/support/contingency cost, sequencing, dependencies, and measurable done-when gates.',
    },
    {
      lens: 'Scaling mechanics',
      score: scoreCheck(hasScalingEvidence, 8, 5),
      evidence: 'Scaling must identify bottlenecks, autoscaling signals, backpressure, and acceptance tests.',
      gap: 'Add autoscaling signals, queue/consumer lag SLOs, connection pooling, cache strategy, quotas/rate limits, load-test targets, and degraded-mode behavior.',
    },
    {
      lens: 'NFR and residency',
      score: hasNfrCoverage && hasResidencyMatrix ? 9 : hasNfrCoverage || hasResidencyMatrix ? 7 : 5,
      evidence: 'NFRs and residency need structured coverage, not generic prose.',
      gap: 'Complete NFR coverage and residency matrix for apps, data, logs, backups, SaaS metadata, and support access.',
    },
    {
      lens: 'Approval readiness',
      score: scoreCheck(hasHumanValidation, 8, 5),
      evidence: 'A human architect needs clear assumptions, validation tasks, and approval gates.',
      gap: 'Add assumption register, human-validation checklist, and client decision log.',
    },
  ];

  const average = Math.round(checks.reduce((sum, item) => sum + item.score, 0) / checks.length);
  const blockers = checks.filter(item => item.score < 7).map(item => item.gap);
  const status = validation.verdict === 'fail' || average < 7 ? 'revise' : blockers.length ? 'conditional' : 'approval-ready';

  return {
    status,
    average,
    workload_profile: {
      primary: signals.workloadTypes[0] || 'retail context not confirmed',
      segments: signals.workloadTypes,
    },
    checks,
    blockers,
  };
}

function runRetailReviewGate({ query = '', context = {}, state = {}, outputs = [] }) {
  const enrichedState = { ...state };
  if (!Array.isArray(enrichedState.nfr_coverage) || enrichedState.nfr_coverage.length < 5) {
    const existing = Array.isArray(enrichedState.nfr_coverage) ? enrichedState.nfr_coverage : [];
    const seen = new Set(existing.map(item => String(item.nfr || '').toLowerCase()));
    enrichedState.nfr_coverage = [
      ...existing,
      ...defaultNfrCoverage(enrichedState).filter(item => !seen.has(item.nfr.toLowerCase())),
    ];
  }
  const existingAssumptions = Array.isArray(enrichedState.assumptions) ? enrichedState.assumptions : [];
  const assumptionSeen = new Set(existingAssumptions.map(item => String(item).toLowerCase()));
  enrichedState.assumptions = [
    ...existingAssumptions,
    ...defaultAssumptions(enrichedState).filter(item => !assumptionSeen.has(String(item).toLowerCase())),
  ].slice(0, 8);
  if (!Array.isArray(enrichedState.human_validation_needed) || enrichedState.human_validation_needed.length < 5) {
    const existing = Array.isArray(enrichedState.human_validation_needed) ? enrichedState.human_validation_needed : [];
    enrichedState.human_validation_needed = [
      ...existing,
      'Business owner confirms target retail capability, pilot scope, rollout waves, and measurable acceptance criteria.',
      'Security/compliance owner confirms PCI/privacy scope, logging exclusions, support access, and regional obligations.',
      'Data owner confirms systems of record, retention, deletion/DSAR, lineage, and residency matrix.',
      'Platform/operations owner confirms runbooks, alert thresholds, rollback triggers, queue replay, and support model.',
      'FinOps/delivery owner validates service-level pricing, licensing, partner cost, non-prod parity, and contingency.',
    ].slice(0, 10);
  }

  const validation = deterministicRetailValidation({ query, context, state: enrichedState, outputs });
  const board = architectureBoardChecks({ query, context, state: enrichedState, outputs, validation });
  for (const blocker of board.blockers.slice(0, 5)) {
    validation.warnings = addUnique(validation.warnings, `Architecture board gap: ${blocker}`);
  }
  if (board.average < 7) {
    validation.constraint_violations = addUnique(validation.constraint_violations, `Architecture board score ${board.average}/10 is below client-delivery threshold; revise before presenting as solution-architect approved.`);
    validation.verdict = 'fail';
  } else if (board.average < 8) {
    validation.improvements = addUnique(validation.improvements, `Raise architecture board score from ${board.average}/10 by closing the revision brief items before client delivery.`);
    if (validation.verdict === 'pass') validation.verdict = 'warn';
  }
  if (validation.warnings.length && validation.verdict === 'pass') {
    validation.verdict = 'warn';
  }

  const annotation_model = securityAnnotationModel(flattenStateForReview(enrichedState, outputs));

  return {
    enriched_state: enrichedState,
    validation,
    board,
    annotation_model,
  };
}

module.exports = {
  architectureBoardChecks,
  defaultNfrCoverage,
  defaultAssumptions,
  deterministicRetailValidation,
  runRetailReviewGate,
  securityAnnotationModel,
};
