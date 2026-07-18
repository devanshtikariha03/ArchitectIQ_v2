const { getRetailSignals } = require('../retailContext');

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function firstText(...values) {
  return values.map(value => String(value || '').trim()).find(Boolean) || '';
}

function parseBudget(value) {
  const text = String(value || '');
  const match = text.match(/(?:\$|usd|aud|inr|gbp|eur)?\s*([0-9][0-9,]*(?:\.[0-9]+)?)/i);
  if (!match) return 0;
  return Number(match[1].replace(/,/g, '')) || 0;
}

function range(low, high) {
  return `$${Math.round(low).toLocaleString()}-$${Math.round(high).toLocaleString()}/month`;
}

function budgetFeasible(high, state) {
  const budget = parseBudget(state.cost?.monthly);
  if (!budget) return true;
  return high <= budget;
}

function tierRange(baseLow, baseHigh, factor, state) {
  const low = baseLow * factor;
  const high = baseHigh * factor;
  return {
    text: range(low, high),
    feasible: budgetFeasible(high, state),
  };
}

function costBreakdown({ llm = '$4,000-$12,000/month', compute = '$55,000-$110,000/month', storage = '$45,000-$95,000/month', networking = '$35,000-$80,000/month', tooling = '$30,000-$65,000/month', security = '$25,000-$60,000/month', licensing = '$20,000-$55,000/month', contingency = '$25,000-$70,000/month' } = {}) {
  return {
    llm_api: llm,
    compute,
    storage,
    networking,
    tooling,
    observability_tooling: tooling,
    security,
    licensing_or_partner: licensing,
    contingency,
  };
}

function architectureDiagram({ hasStore, hasAi }) {
  const storeGroup = hasStore ? `
    group store(cloud)[Store Edge]
    service pos(server)[POS Lane] in store
    service edge(server)[Store Edge Node] in store
    service localq(server)[Local Queue] in store` : '';
  const storeLinks = hasStore ? `
    pos:R --> L:edge
    edge:R --> L:localq
    localq:R --> L:api` : '';
  const aiGroup = hasAi ? `
    group ai(cloud)[AI]
    service rag(server)[RAG Service] in ai
    service vector(database)[Vector Store] in ai
    service model(server)[Model Gateway] in ai` : '';
  const aiLinks = hasAi ? `
    web:R --> L:rag
    rag:R --> L:vector
    rag:B --> T:model` : '';
  return `architecture-beta
    group edge(cloud)[Edge]
    group ui(cloud)[UI Channels]
    group platform(cloud)[Retail Platform]
    group data(cloud)[Retail Data]
    group ops(cloud)[Operations]${storeGroup}${aiGroup}
    service customer(internet)[Customer] in edge
    service cdn(cloud)[CDN And WAF] in edge
    service web(server)[Storefront And Mobile] in ui
    service admin(server)[Admin Support UI] in ui
    service api(server)[API Gateway] in platform
    service checkout(server)[Checkout And Orders] in platform
    service inventory(server)[Inventory Reservation] in platform
    service integration(server)[Event Integration] in platform
    service oltp(database)[Transactional Store] in data
    service search(database)[Search Read Model] in data
    service audit(disk)[Audit And Logs] in data
    service mon(cloud)[Observability] in ops
    service sec(cloud)[Identity Keys And Secrets] in ops
    customer:R --> L:cdn
    cdn:R --> L:web
    web:R --> L:api
    admin:R --> L:api
    api:R --> L:checkout
    checkout:R --> L:inventory
    checkout:B --> T:oltp
    inventory:R --> L:search
    checkout:R --> L:integration
    integration:B --> T:audit
    api:B --> T:mon
    sec:R --> L:api${storeLinks}${aiLinks}`;
}

function buildStack({ tier, state, signals }) {
  const hasAi = signals.retailAi || asArray(state.ai_controls).length > 0;
  const hasStore = signals.store || /store|pos|offline/i.test(JSON.stringify(state || {}));
  const conservative = tier === 'conservative';
  const optimised = tier === 'optimised';
  const managedRuntime = conservative
    ? 'Managed container runtime with separate route classes for browse, checkout, AI, admin, and batch jobs'
    : optimised
      ? 'Managed Kubernetes/container platform with committed baseline capacity, autoscaling caps, and workload isolation'
      : 'Managed Kubernetes in approved region with separate node pools/namespaces for storefront, checkout/order, AI, integration, and batch services';
  const layers = [
    {
      layer: 'Edge and traffic isolation',
      rec: conservative ? 'CDN + WAF + API gateway with critical checkout route isolation' : 'CDN + WAF + bot management + API gateway with separate browse/search, checkout/order, admin, AI, and partner origin pools',
      why: 'Protects revenue-critical paths from campaign spikes and abusive traffic while allowing degraded browse, recommendation, or chatbot behavior without blocking checkout.',
      monthly_cost_est: conservative ? '$18,000-$45,000/month' : optimised ? '$35,000-$80,000/month' : '$40,000-$95,000/month',
    },
    {
      layer: 'UI channels',
      rec: 'React/Next-style storefront and mobile/PWA channel layer with governed design system, accessibility gates, session controls, feature flags, RUM, and checkout synthetic tests',
      why: 'Keeps storefront, mobile, account, admin/support, and AI surfaces aligned to API contracts while making checkout, auth/session, accessibility, and rollback evidence measurable.',
      monthly_cost_est: conservative ? '$12,000-$30,000/month' : optimised ? '$20,000-$55,000/month' : '$25,000-$65,000/month',
    },
    {
      layer: 'Runtime platform',
      rec: managedRuntime,
      why: 'Matches retail peak behavior, supports isolation and autoscaling, and avoids VM-per-service sprawl while preserving release and observability controls.',
      monthly_cost_est: conservative ? '$35,000-$80,000/month' : optimised ? '$50,000-$105,000/month' : '$60,000-$130,000/month',
    },
    {
      layer: 'API and integration',
      rec: 'API gateway, OpenAPI/AsyncAPI contracts, strategic event backbone, DLQs, replay tooling, idempotency keys, and partner integration controls',
      why: 'Retail failures usually appear at ownership, replay, reconciliation, and channel-boundary points, so API contracts and event discipline must be explicit.',
      monthly_cost_est: conservative ? '$22,000-$55,000/month' : optimised ? '$35,000-$80,000/month' : '$45,000-$100,000/month',
    },
    {
      layer: 'Transactional data',
      rec: 'Managed PostgreSQL-compatible relational cluster for orders, payment metadata, promotion ledger, reservation authority, and audit-critical state',
      why: 'Strong transactional guarantees and auditable transitions are required for orders, payments, stock commitments, refunds, and promotion decisions.',
      monthly_cost_est: conservative ? '$25,000-$65,000/month' : optimised ? '$35,000-$85,000/month' : '$45,000-$105,000/month',
    },
    {
      layer: 'Cache and search',
      rec: 'Redis-compatible cache for read acceleration plus OpenSearch-compatible catalog/search read model rebuilt from source-of-truth events',
      why: 'Supports faceted retail browse and campaign traffic without turning cache/search into transactional truth.',
      monthly_cost_est: conservative ? '$18,000-$45,000/month' : optimised ? '$28,000-$70,000/month' : '$35,000-$85,000/month',
    },
  ];

  if (hasStore) {
    layers.push({
      layer: 'Store edge continuity',
      rec: conservative ? 'Pilot store-edge appliance with encrypted local queue and reconnect replay tests' : 'HA store-edge pair with encrypted durable queues, local health checks, device posture, field replacement runbook, and reconciliation dashboards',
      why: 'Stores must keep trading during WAN outages while preserving idempotency, payment boundaries, queue durability, and audit evidence.',
      monthly_cost_est: conservative ? '$20,000-$55,000/month' : optimised ? '$45,000-$110,000/month' : '$55,000-$135,000/month',
    });
  }

  layers.push({
    layer: 'Payments and security boundary',
    rec: 'External PCI-compliant PSPs, token vault, KMS/HSM, secrets manager, mTLS/service mesh, workload identity, WAF/bot controls, redacted logs, and privileged-access controls',
    why: 'Minimizes PCI scope, protects customer/payment-adjacent data, and preserves evidence for security and compliance review.',
    monthly_cost_est: conservative ? '$25,000-$60,000/month' : optimised ? '$35,000-$85,000/month' : '$45,000-$110,000/month',
  });

  if (hasAi) {
    layers.push({
      layer: 'AI, RAG, and recommendations',
      rec: 'GPT/frontier model gateway for MVP synthesis, RAG over approved corpora, Qdrant or pgvector vector store, embeddings, optional reranking, scoped AI tool APIs, evals, fallback, and human escalation',
      why: 'Keeps AI useful without putting checkout in the critical path; model routing and retrieval controls manage quality, privacy, and token cost.',
      monthly_cost_est: conservative ? '$12,000-$45,000/month' : optimised ? '$25,000-$80,000/month' : '$35,000-$110,000/month',
    });
  }

  layers.push({
    layer: 'Observability and release governance',
    rec: 'OpenTelemetry-first traces, structured/redacted logs, RUM, synthetic checkout tests, SLO dashboards, feature flags, release rings, runbooks, game days, and rollback gates',
    why: 'Makes flash-sale readiness, incident diagnosis, audit evidence, and rollout control operationally measurable.',
    monthly_cost_est: conservative ? '$20,000-$55,000/month' : optimised ? '$30,000-$75,000/month' : '$40,000-$95,000/month',
  });

  if (optimised) {
    return layers.map(item => ({
      ...item,
      why: `${item.why} Optimisation is allowed only through right-sizing, commitments, caching, and retention tuning without weakening mandatory controls.`,
    }));
  }
  return layers;
}

function buildResidencyMatrix(state) {
  const base = asArray(state.residency_matrix);
  if (base.length) return base.slice(0, 10);
  return [
    { component: 'Application data', data_touched: 'Customer, order, inventory, loyalty, and payment-token references', region_or_residency: 'Client-approved production region; confirm country-specific residency', status: 'assumption', action: 'Validate data classes, stores/channels, regions, and processor boundaries.' },
    { component: 'Backups and DR', data_touched: 'Database backups, object copies, replay logs, and audit evidence', region_or_residency: 'Same-region or approved paired region only until legal review', status: 'assumption', action: 'Confirm backup residency, retention, restore tests, and cross-region transfer approval.' },
    { component: 'Logs and telemetry', data_touched: 'RUM, traces, logs, audit events, support bundles, and redacted payload metadata', region_or_residency: 'Must follow application-data residency and redaction rules', status: 'assumption', action: 'Validate log redaction, retention, support access, and export controls.' },
    { component: 'AI prompts and vectors', data_touched: 'Prompts, completions, embeddings, vector store, eval traces, and provider telemetry', region_or_residency: 'Approved model/vector region only', status: 'assumption', action: 'Confirm model provider data handling, vector residency, deletion propagation, and eval trace retention.' },
    { component: 'Third-party SaaS/processors', data_touched: 'Payment, CRM, support, messaging, experimentation, observability, and analytics metadata', region_or_residency: 'Processor-specific; requires evidence', status: 'partial', action: 'Collect DPA, subprocessors, residency, support-access, and contract evidence.' },
  ];
}

function buildNfrCoverage(state) {
  const existing = asArray(state.nfr_coverage);
  if (existing.length >= 5) return existing.slice(0, 10);
  const nfr = state.nfr || {};
  return [
    { nfr: 'Availability', target: firstText(nfr.reliability, state.scale?.sla, 'Checkout/order commit remains available during non-critical degradation.'), mechanism: 'Route isolation, autoscaling, circuit breakers, fallback states, SLOs, synthetic tests, and rollback gates.', validation_needed: 'Run peak, failover, degraded-mode, and checkout synthetic acceptance tests.' },
    { nfr: 'Latency and performance', target: firstText(state.scale?.latency, 'Route-level p95 targets for browse, search, cart, checkout, and AI/support.'), mechanism: 'CDN, cache/search read model, route bundle budgets, RUM, load tests, and API latency budgets.', validation_needed: 'Validate p95/p99 targets from telemetry and campaign simulations.' },
    { nfr: 'Security', target: firstText(nfr.security, 'Zero-trust controls for customer, payment, loyalty, support, admin, and AI data.'), mechanism: 'WAF/bot, OIDC/OAuth, mTLS, KMS/HSM, secrets, redaction, scoped APIs, and privileged-access controls.', validation_needed: 'Validate data classes, PCI boundary, threat model, secrets, auth/session, and audit evidence.' },
    { nfr: 'Compliance and residency', target: firstText(nfr.compliance, 'Privacy, PCI, retention, deletion, support-access, and residency obligations remain explicit.'), mechanism: 'Residency matrix, processor evidence, retention/deletion workflows, consent, telemetry controls, and audit pack.', validation_needed: 'Confirm jurisdictions, processors, data classes, retention, deletion, and legal/QSA review.' },
    { nfr: 'DR and continuity', target: firstText(nfr.dr, 'Domain-level RTO/RPO for checkout, inventory, catalog/search, AI, and support.'), mechanism: 'Backups, restore drills, replayable events, DLQs, multi-AZ runtime, store-edge continuity where needed, and runbooks.', validation_needed: 'Run restore, replay, failover, and rollback drills before pilot or production approval.' },
    { nfr: 'Operability', target: firstText(nfr.maintainability, 'Named owners can operate the platform after handover.'), mechanism: 'Runbooks, dashboards, on-call ownership, release rings, game days, feature flags, ADRs, and evidence gates.', validation_needed: 'Confirm operating model, support tier, escalation, and rollout readiness.' },
    { nfr: 'Cost control', target: firstText(state.cost?.monthly, 'Budget remains conditional until unit drivers and provider SKUs are validated.'), mechanism: 'FinOps unit drivers, provider price evidence, token budgets, CDN/RUM controls, commitments, retention tiers, and contingency.', validation_needed: 'Validate service SKUs, contracts, usage drivers, support/licensing, and non-prod parity.' },
  ];
}

function buildRisks(state) {
  return asArray(state.risks).slice(0, 6).map(item => {
    if (typeof item === 'object') return {
      risk: item.risk || item.topic || JSON.stringify(item),
      severity: item.severity || 'Medium',
      likelihood: item.likelihood || 'Medium',
      fix: item.fix || item.resolution || 'Assign an owner, collect evidence, and validate through architecture review before approval.',
    };
    return { risk: item, severity: 'Medium', likelihood: 'Medium', fix: 'Assign an owner, collect evidence, and validate before approval.' };
  }).concat([
    { risk: 'Final technology selection can be wrong if current traffic, data volume, provider contracts, and system ownership are not validated.', severity: 'High', likelihood: 'Medium', fix: 'Collect telemetry, contracts, system-of-record ownership, and acceptance-test evidence before sign-off.' },
    { risk: 'Checkout, payments, inventory, or admin/support workflows can fail if UI/API/storage/AI boundaries are coupled too tightly.', severity: 'High', likelihood: 'Medium', fix: 'Keep critical paths isolated, contract-tested, observable, and rollback-ready.' },
  ]).slice(0, 8);
}

function buildDecisions(state, signals) {
  const existing = asArray(state.architecture_decisions).filter(item => item && typeof item === 'object').slice(0, 4);
  const defaults = [
    { what: 'Use specialist-agent-reviewed architecture synthesis', why: 'Security, compliance, governance, infrastructure, technology, storage, API, AI, UI, and FinOps constraints are combined before final recommendation instead of relying on a single generic prompt.' },
    { what: 'Keep checkout/order/payment/inventory paths isolated from non-critical AI, recommendation, analytics, and chatbot paths', why: 'Retail revenue and trust depend on critical journey continuity during campaign spikes and partial degradation.' },
    { what: 'Use managed platform services with explicit portability at contracts and data boundaries', why: 'Managed services reduce operating load while OpenAPI/AsyncAPI contracts, event schemas, export paths, and provider-independent payment/model choices reduce lock-in.' },
    { what: 'Treat FinOps and evidence status as part of architecture approval', why: 'A recommendation is not client-ready until unit drivers, service SKUs, support/licensing, non-prod parity, and mandatory controls are costed.' },
  ];
  if (signals.retailAi) defaults.push({ what: 'Use GPT/frontier model route for MVP synthesis with RAG and future local/private model path after eval evidence', why: 'This balances MVP quality with a realistic path to lower cost and stronger privacy once R&D validates local/fine-tuned models.' });
  return [...existing, ...defaults].slice(0, 8);
}

function buildRoadmap(state) {
  return [
    {
      phase: 'Phase 1 - Evidence and target-state validation',
      timeline: 'Weeks 1-4',
      deliverables: ['Confirm systems of record and data classes', 'Validate PCI/privacy/residency and processor scope', 'Confirm route/API/storage/AI/UI ownership and cost unit drivers'],
      owner: 'Client sponsor, solution architect, security, compliance, platform, product, and FinOps owners',
      dependencies: ['Current-state system map', 'Traffic/data telemetry', 'Provider contracts', 'Security/compliance evidence'],
      done_when: 'Architecture assumptions, evidence gaps, system owners, NFRs, and acceptance tests are signed off.',
    },
    {
      phase: 'Phase 2 - Production architecture foundation',
      timeline: firstText(state.team?.timeline, 'Weeks 5-12'),
      deliverables: ['Implement edge/API/runtime/data foundation', 'Build checkout and integration contract tests', 'Stand up observability, release rings, runbooks, and rollback gates'],
      owner: 'Platform, API, storage, UI, AI, and SRE leads',
      dependencies: ['Approved target architecture', 'Security and compliance gates', 'FinOps budget guardrails'],
      done_when: 'Recommended architecture layer controls are implemented in non-prod with passing resilience, security, and observability tests.',
    },
    {
      phase: 'Phase 3 - Pilot and controlled rollout',
      timeline: 'Pilot then phased rollout',
      deliverables: ['Run peak/load, failover, replay, restore, checkout, AI safety, UI performance, and rollback tests', 'Publish evidence pack and go/no-go dashboard', 'Roll out by channel/store/brand wave'],
      owner: 'Programme delivery lead with architecture board',
      dependencies: ['Pilot scope', 'Runbooks', 'Monitoring dashboards', 'Rollback plans', 'Support model'],
      done_when: 'Pilot passes objective acceptance gates and each rollout wave has measured go/no-go evidence.',
    },
  ];
}

function buildTiers(state, signals) {
  const hasAi = signals.retailAi || asArray(state.ai_controls).length > 0;
  const hasStore = signals.store || /store|pos|offline/i.test(JSON.stringify(state || {}));
  const baseLow = hasStore ? 180000 : hasAi ? 140000 : 120000;
  const baseHigh = hasStore ? 420000 : hasAi ? 340000 : 280000;
  const diagram = architectureDiagram({ hasStore, hasAi });
  const tiers = [
    {
      id: 'conservative',
      label: 'Conservative',
      tagline: 'Lowest production-safe baseline with limited headroom and stronger validation gates',
      factor: 0.62,
      note: 'Suitable for pilot or constrained rollout; not enough for full national peak unless telemetry validates headroom.',
      breakdown: costBreakdown({ llm: hasAi ? '$6,000-$25,000/month' : '$0-$2,000/month', compute: '$35,000-$85,000/month', storage: '$25,000-$70,000/month', networking: '$25,000-$65,000/month', tooling: '$20,000-$50,000/month', security: '$20,000-$55,000/month', licensing: '$10,000-$40,000/month', contingency: '$15,000-$45,000/month' }),
      driver: hasStore ? 'Store-edge rollout, network resilience, observability, and support operations dominate the conservative tier.' : hasAi ? 'Model calls, vector/RAG operations, CDN traffic, runtime headroom, and observability dominate the conservative tier.' : 'Runtime, storage, CDN/networking, security, and observability dominate the conservative tier.',
    },
    {
      id: 'recommended',
      label: 'Recommended',
      tagline: 'Production-grade target architecture for stated 12-month scale and NFRs',
      factor: 1,
      note: 'Best balance of managed services, control evidence, resilience, operating maturity, and cost realism.',
      breakdown: costBreakdown(),
      driver: hasAi ? 'GPT/frontier model usage, embeddings/vector reads, CDN traffic, runtime headroom, observability, and non-prod parity are the largest recurring costs.' : 'Runtime headroom, storage growth, CDN/networking, observability, security, support, and non-prod parity are the largest recurring costs.',
    },
    {
      id: 'optimised',
      label: 'Optimised',
      tagline: 'Recommended capability with right-sizing, commitments, routing, caching, and retention controls',
      factor: 0.78,
      note: 'Potentially cheaper than Recommended only if commitments, cache/retention tuning, token routing, and observability controls preserve required capability.',
      breakdown: costBreakdown({ llm: hasAi ? '$3,000-$18,000/month' : '$0-$1,000/month', compute: '$42,000-$90,000/month', storage: '$32,000-$75,000/month', networking: '$28,000-$65,000/month', tooling: '$22,000-$55,000/month', security: '$24,000-$58,000/month', licensing: '$14,000-$42,000/month', contingency: '$18,000-$50,000/month' }),
      driver: 'Optimisation depends on commitments, route-level caching, retention tiering, model routing, and observability volume controls without reducing mandatory security/compliance/resilience capability.',
    },
  ];
  return tiers.map(tier => {
    const total = tierRange(baseLow, baseHigh, tier.factor, state);
    return {
      id: tier.id,
      label: tier.label,
      tagline: tier.tagline,
      monthly_total: total.text,
      budget_feasible: total.feasible,
      budget_note: total.feasible ? tier.note : `${tier.note} Current stated monthly ceiling may be exceeded; validate budget or reduce scope with accepted-risk approval.`,
      stack: buildStack({ tier: tier.id, state, signals }),
      architecture_diagram: diagram,
      cost_breakdown: tier.breakdown,
      biggest_cost_driver: tier.driver,
    };
  });
}

function buildWorkloadPricingAssumptions(state) {
  const existing = state.workload_pricing_assumptions || {};
  return {
    requests_per_day: existing.requests_per_day || 'Assumption required from web/mobile/API/RUM telemetry before final pricing.',
    turns_per_request: existing.turns_per_request || 'For AI/RAG support, assume 1-5 turns until measured chatbot/agent data exists.',
    input_tokens_per_turn: existing.input_tokens_per_turn || 'Assumption required from prompt templates, RAG context size, and agent routing.',
    output_tokens_per_turn: existing.output_tokens_per_turn || 'Assumption required from target response length and customer-facing answer policy.',
    cache_hit_rate: existing.cache_hit_rate || 'Assumption required for CDN, API, search, prompt, and retrieval cache behavior.',
    model_routing_split: existing.model_routing_split || 'GPT/frontier for MVP judgement and complex synthesis; deterministic/local/private routes only after eval evidence.',
    peak_multiplier: existing.peak_multiplier || firstText(state.scale?.peak, 'Assumption required for campaign, flash-sale, and store peak periods.'),
  };
}

function synthesizeArchitectureRecommendation({ query = '', state = {}, outputs = [], reviewGate = {} } = {}) {
  const signals = getRetailSignals({ query, state });
  const company = firstText(state.basics?.company, 'The retail client');
  const domain = firstText(state.basics?.domain, state.basics?.industry, 'retail platform');
  const evidenceStatus = {
    pricing: state.pricing_evidence_summary?.evidence_status || state.evidence_status?.pricing || 'assumption',
    region_availability: state.evidence_status?.region_availability || 'assumption',
    model_currentness: state.evidence_status?.model_currentness || 'assumption',
    data_residency: state.evidence_status?.data_residency || 'assumption',
    compliance: state.evidence_status?.compliance || 'assumption',
  };
  const validation = asArray(state.human_validation_needed).slice(0, 10);
  const confidence = reviewGate.board?.average >= 8 ? 'Medium' : 'Low';
  return {
    executive_summary: `${company} needs a production-grade ${domain} architecture that keeps customer journeys, checkout/order/payment/inventory paths, data protection, AI-assisted experiences, UI channels, observability, and cost controls aligned. The recommended path is a specialist-agent-reviewed retail platform with isolated critical paths, governed APIs, clear data ownership, controlled RAG/model/tool use, resilient frontend journeys, security/compliance evidence, and FinOps validation before client approval. The biggest remaining risk is treating assumption-level evidence as verified before traffic, data classes, provider SKUs, residency, and owner approvals are confirmed.`,
    architecture_confidence: confidence,
    confidence_reason: confidence === 'Medium'
      ? 'Specialist agents produced broad coverage, but confidence remains below High until exact telemetry, provider pricing, residency, security/compliance evidence, and owner approvals are validated.'
      : 'Confidence is limited because several recommendations are assumption-level until client telemetry, data classification, provider pricing, compliance scope, residency, and operational evidence are supplied.',
    assumptions: asArray(state.assumptions).slice(0, 8),
    human_validation_needed: validation.length ? validation : [
      'Validate data classes, jurisdictions, processor list, residency, retention, and support-access constraints.',
      'Validate current and 12-month traffic, peak multiplier, data growth, API volume, AI token volume, CDN/RUM volume, and non-prod parity.',
      'Validate provider SKUs, cloud/SaaS contracts, support/licensing, partner implementation, and contingency assumptions.',
      'Validate route ownership, API contracts, systems of record, checkout fallback, replay/idempotency, restore, and rollback tests.',
      'Validate Security, Compliance, Governance, Infrastructure, Technology, Storage, API, AI, UI, and FinOps owner approval gates.',
    ],
    evidence_status: evidenceStatus,
    workload_pricing_assumptions: buildWorkloadPricingAssumptions(state),
    residency_matrix: buildResidencyMatrix(state),
    tiers: buildTiers(state, signals),
    nfr_coverage: buildNfrCoverage(state),
    risks: buildRisks(state),
    decisions: buildDecisions(state, signals),
    roadmap: buildRoadmap(state),
    next_steps: [
      'Review the Recommended tier with security, compliance, product, platform, API, storage, AI, UI, SRE, and FinOps owners.',
      'Replace assumption-level cost ranges with exact service SKUs, region, support plan, discounts, usage drivers, and non-prod parity.',
      'Confirm systems of record for product, price, promotion, inventory, cart, order, payment token, customer, loyalty, support, audit, and AI corpora.',
      'Run acceptance tests for checkout peak, API retry/idempotency, event replay, restore, UI performance, AI safety/fallback, PCI/payment boundary, privacy deletion, and rollback.',
      'Use the Conservative tier only for pilot scope and the Optimised tier only when cost reductions preserve mandatory security, compliance, resilience, and governance controls.',
    ],
    disclaimer: 'This recommendation is a customer-facing architecture draft generated from specialist-agent review. It is not legal advice, compliance certification, provider quote, procurement approval, production release approval, or accepted-risk record. Validate all assumptions, evidence, pricing, residency, security, and operational controls with named client owners before implementation.',
    synthesis_metadata: {
      agentId: 'architecture_synthesis',
      title: 'Architecture Synthesis Agent',
      source_agents: outputs.map(output => output.agentId).filter(Boolean),
      generated_from: 'specialist_agent_state',
    },
  };
}

module.exports = {
  synthesizeArchitectureRecommendation,
};
