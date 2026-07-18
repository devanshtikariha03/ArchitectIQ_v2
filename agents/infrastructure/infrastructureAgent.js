const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeModelReview, runSpecialistModel } = require('../llmClient');

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

async function runInfrastructureAgent({ query, context, state, retrievedContext, useModel }) {
  const signals = getRetailSignals({ query, context, state });
  const scenarioText = [query, JSON.stringify(context || {}), JSON.stringify(state || {})].join(' ');
  const hasCloud = /cloud|aws|azure|gcp|kubernetes|serverless|container|managed/i.test(scenarioText);
  const hasStoreEdge = signals.storeEdge;
  const hasCommerce = signals.commerce;
  const hasAi = signals.retailAi;
  const hasMultiRegion = signals.multiRegion || /multi-region|active-active|active passive|dr|disaster recovery|rto|rpo/i.test(scenarioText);

  const findings = [
    'Define runtime, network, HA/DR, observability, environment, release, and support ownership before treating the architecture as client-ready.',
    'Carry Security, Compliance, and Governance gates into infrastructure: regions, network boundaries, admin access, key/secrets ownership, logs, backups, support access, and rollout evidence.',
    'Separate customer browse/search, checkout/order/payment, inventory/reservation, integration/replay, batch/analytics, and AI workloads so non-critical load cannot degrade revenue-critical paths.',
    'Keep infrastructure evidence status explicit: verified, partial, assumption, missing, stale, or blocked for human validation.',
  ];
  if (hasCloud) findings.push('Use managed cloud primitives where they reduce operational burden, but validate service availability, quotas, support plan, region, private connectivity, and team capability.');
  if (hasStoreEdge) findings.push('For store-edge/POS, define offline trading runtime, local queue, device trust, patching, WAN outage behavior, field replacement, support desk, and rollout waves.');
  if (hasCommerce) findings.push('For digital commerce, isolate CDN/WAF/bot/API edge, search/catalog reads, checkout/order/payment, inventory lock, and promotion paths for peak campaigns.');
  if (hasAi) findings.push('For AI/RAG workloads, isolate model/retrieval services from checkout-critical paths and add circuit breakers, token/rate limits, fallback, telemetry, and privacy controls.');
  if (hasMultiRegion) findings.push('For multi-region/DR, define active-active versus active-passive ADR, RTO/RPO, DNS/failover, replication, backup/restore tests, residency, and game-day evidence.');

  const runtimePlatform = {
    recommendation: hasCloud
      ? 'Managed Kubernetes/container platform for complex retail services, with serverless allowed for narrow event/batch jobs and VM exceptions only for legacy constraints.'
      : 'Runtime platform remains assumption-level until cloud/on-prem preference, team capability, deployment model, and support ownership are confirmed.',
    workload_isolation: ['browse/search', 'checkout/order/payment', 'inventory/reservation', 'integration/replay', 'batch/analytics', hasAi ? 'AI/RAG/model services' : null].filter(Boolean),
    evidence_status: 'assumption',
  };

  const networkTopology = [
    { zone: 'Public edge', recommendation: 'CDN, WAF, bot management, API gateway, TLS policy, and separate origin pools.', evidence_status: 'assumption' },
    { zone: 'Application runtime', recommendation: 'Private service runtime with workload isolation and service-to-service policy.', evidence_status: 'assumption' },
    { zone: 'Data plane', recommendation: 'Private database/cache/search/object/queue/backup paths with egress and replication controls.', evidence_status: 'assumption' },
    { zone: 'Operations/admin', recommendation: 'Privileged access, CI/CD, observability, support, and break-glass paths with audit logging.', evidence_status: 'assumption' },
    { zone: 'Third-party/store connectivity', recommendation: 'PSP, ERP/WMS/OMS, carrier/supplier, SaaS, and store connectivity boundaries.', evidence_status: 'assumption' },
  ];

  const resiliencePlan = [
    'Define RTO/RPO by path: browse/search, checkout/order/payment, inventory reservation, integration/replay, fulfilment, support, AI, and store edge where applicable.',
    'Validate backup/restore, failover, dependency degradation, queue backpressure, replay, and game-day evidence.',
    'Keep AI, analytics, personalisation, and batch out of checkout-critical availability paths unless safe fallback is proven.',
  ];

  const observabilityOperations = [
    'OpenTelemetry-style traces, metrics, and structured logs with redaction and retention controls.',
    'SLO dashboards and alerts for business-impact paths: checkout, payment, order, inventory, fulfilment, support, and integration replay.',
    'Runbooks, on-call ownership, incident workflow, game days, support handoff, and post-incident review.',
  ];

  const environmentReleaseStrategy = [
    'Dev/test/stage/UAT/prod environment strategy with IaC, secrets, approvals, config promotion, and evidence location.',
    'Production-like pre-prod for critical network, identity, integration, observability, rollback, and performance behavior.',
    'Blue/green or canary release where customer-facing risk is high, with fast rollback and owner-approved go/no-go gates.',
  ];

  const risks = [
    risk(
      'Infrastructure can look complete while still being unfit for retail peaks if checkout/order/payment, search, inventory, and integration paths share runtime or network bottlenecks.',
      'High',
      'Medium',
      'Isolate critical paths and validate peak load, autoscaling, dependency limits, degraded mode, and rollback evidence.'
    ),
    risk(
      'Security or compliance assumptions can be invalidated by region, backup, log, support access, admin path, or network-segmentation choices.',
      'High',
      'Medium',
      'Platform owner to validate infrastructure topology against Security and Compliance handoffs before approval.'
    ),
  ];

  const validationNeeded = [
    'Confirm cloud/on-prem preference, approved regions, runtime platform, network topology, private connectivity, support plan, and platform operating model.',
    'Confirm RTO/RPO, HA/DR posture, backup/restore tests, failover runbooks, dependency degradation, and game-day schedule.',
    'Confirm observability, log/trace retention, redaction, SIEM export, alerting, on-call ownership, and incident workflow.',
    'Confirm environment strategy, CI/CD/IaC ownership, non-prod parity, release gates, rollback, and change controls.',
  ];

  const base = {
    agentId: 'infrastructure',
    title: 'Infrastructure AI Agent',
    status: 'completed',
    summary: 'Infrastructure review aligned to ArchitectIQ Retail: runtime, network, HA/DR, observability, environment, release, operations, and upstream Security/Compliance/Governance constraints.',
    retail_workload: signals.workloadTypes,
    findings,
    infrastructure_recommendation: findings,
    runtime_platform: runtimePlatform,
    network_topology: networkTopology,
    resilience_plan: resiliencePlan,
    observability_operations: observabilityOperations,
    environment_release_strategy: environmentReleaseStrategy,
    infrastructure_evidence_status: {
      runtime: 'assumption',
      network: 'assumption',
      resilience: 'assumption',
      observability: 'assumption',
      environment_release: 'assumption',
      upstream_handoff: 'assumption',
    },
    risks,
    validation_needed: validationNeeded,
    retrieval_requests: [
      'retail-runtime-platform-template',
      'retail-network-edge-connectivity-template',
      'retail-ha-dr-resilience-template',
      'retail-observability-operations-template',
      'retail-environment-release-template',
      'retail-infrastructure-security-compliance-handoff-template',
    ],
    evidence: retailEvidence(retrievedContext),
    statePatch: {
      retail_workload: signals.workloadTypes,
      infrastructure_controls: findings,
      infrastructure_recommendation: findings,
      runtime_platform: runtimePlatform,
      network_topology: networkTopology,
      resilience_plan: resiliencePlan,
      observability_operations: observabilityOperations,
      environment_release_strategy: environmentReleaseStrategy,
      infrastructure_evidence_status: {
        runtime: 'assumption',
        network: 'assumption',
        resilience: 'assumption',
        observability: 'assumption',
        environment_release: 'assumption',
        upstream_handoff: 'assumption',
      },
      risks,
      human_validation_needed: validationNeeded,
      validation_gaps: validationNeeded.map(item => `Infrastructure validation required: ${item}`),
      evidence_status: {
        infrastructure: 'assumption',
      },
      retrieval_requests: [
        'retail-runtime-platform-template',
        'retail-network-edge-connectivity-template',
        'retail-ha-dr-resilience-template',
        'retail-observability-operations-template',
        'retail-environment-release-template',
        'retail-infrastructure-security-compliance-handoff-template',
      ],
    },
  };

  if (!useModel) return base;

  try {
    const modelReview = await runSpecialistModel({
      agentId: 'infrastructure',
      title: 'Infrastructure AI Agent',
      system: `You are the ArchitectIQ Retail Infrastructure AI Agent. Review infrastructure only: runtime platform, cloud/on-prem topology, network/edge/private connectivity, HA/DR, observability, environments, CI/CD/IaC, release, rollback, support model, and operational readiness. Carry Security, Compliance, Governance, and FinOps constraints forward. Do not output internal agent-development commentary. Return concise JSON only.`,
      input: JSON.stringify({
        query,
        context,
        current_state: state,
        deterministic_infrastructure_review: base,
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
        `Infrastructure model review failed and deterministic infrastructure rules were used instead: ${err.message}`,
      ],
    };
  }
}

module.exports = { runInfrastructureAgent };
