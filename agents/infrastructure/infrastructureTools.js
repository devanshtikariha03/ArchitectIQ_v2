const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const { buildRetailText, getRetailSignals } = require('../retailContext');
const { retrieveInfrastructureKnowledge } = require('./infrastructureKnowledgeBase');

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

function inspectInfrastructureHandoff(input = {}) {
  const state = input.state || {};
  const upstream = {
    security: Boolean(state.agent_outputs?.security || state.security_tool_context),
    compliance: Boolean(state.agent_outputs?.compliance || state.compliance_tool_context),
    governance: Boolean(state.agent_outputs?.governance || state.governance_tool_context),
    security_evidence_status: state.security_evidence_pack?.evidence_status || state.evidence_status || {},
    compliance_evidence_status: state.compliance_evidence_status || {},
    governance_evidence_status: state.governance_evidence_status || {},
    validation_gaps: asArray(state.validation_gaps),
  };
  const controls = [
    'Carry Security, Compliance, and Governance gates into topology, regions, network boundaries, admin access, logging, backup, support access, and rollout decisions.',
    'Infrastructure remains draft until runtime, network, HA/DR, observability, environment, and operating model evidence is validated.',
  ];
  if (upstream.security) controls.push('Apply Security handoff to private connectivity, PCI segmentation, key ownership, secrets, WAF/bot, mTLS, admin access, audit logging, and SIEM export.');
  if (upstream.compliance) controls.push('Apply Compliance handoff to approved regions, data residency, backup/log/trace location, processor/support access, retention, and audit evidence.');
  if (upstream.governance) controls.push('Apply Governance handoff to systems-of-record ownership, rollout waves, ADRs, runbooks, game days, and approval gates.');

  return {
    tool: 'inspectInfrastructureHandoffTool',
    upstream,
    controls,
    validation_needed: [
      'Confirm upstream Security, Compliance, and Governance gates are accepted as constraints before infrastructure approval.',
      'Confirm unresolved validation gaps are assigned to platform, security, compliance, operations, and architecture owners.',
    ],
  };
}

function selectRuntimePlatform(input = {}) {
  const text = textFromInput(input);
  const signals = input.signals || getRetailSignals(input);
  const runtime = /serverless|lambda|function|cloud run/i.test(text)
    ? 'Managed container/serverless runtime for burstable stateless services, with separate treatment for stateful retail paths.'
    : /vm|virtual machine|lift.?and.?shift/i.test(text)
      ? 'VM-based runtime only for legacy workloads that cannot be containerized, with migration plan and operational guardrails.'
      : 'Managed Kubernetes/container platform with separate node pools/namespaces for storefront/API, checkout/order, integration, batch, and AI workloads where applicable.';
  const controls = [
    'Separate revenue-critical checkout/order/payment workloads from browse/search, batch, analytics, and AI workloads.',
    'Use autoscaling, resource quotas, pod/workload identity, release gates, rollback, and non-prod parity appropriate to workload criticality.',
    'Document runtime ADR with alternatives rejected, team capability, operating model, and support ownership.',
  ];
  if (signals.storeEdge) controls.push('For store-edge, define local runtime, offline queue, patching, device trust, monitoring, and field replacement separate from cloud runtime.');
  if (signals.retailAi) controls.push('Isolate AI/RAG/model services from checkout-critical paths and apply circuit breakers, token/rate limits, fallback, and telemetry controls.');

  return {
    tool: 'selectRuntimePlatformTool',
    runtime_recommendation: runtime,
    platform_components: [
      { layer: 'Runtime control plane', recommendation: runtime, evidence_status: 'assumption' },
      { layer: 'Workload isolation', recommendation: 'Separate pools/namespaces/accounts/projects for critical retail domains.', evidence_status: 'assumption' },
      { layer: 'Release model', recommendation: 'Blue/green or canary for customer-facing services with fast rollback.', evidence_status: 'assumption' },
      { layer: 'Non-prod parity', recommendation: 'Stage/UAT must match critical network, identity, data-shape, and integration paths.', evidence_status: 'assumption' },
    ],
    controls,
    risks: [
      risk('Shared runtime pools can let browse, batch, or AI workload pressure affect checkout/order/payment reliability.', 'High', 'Medium', 'Isolate critical paths and define autoscaling/resource quotas.'),
    ],
    validation_needed: [
      'Confirm cloud/on-prem preference, runtime skill set, release frequency, workload isolation needs, and support model.',
      'Confirm non-prod parity, rollback mechanism, autoscaling limits, and capacity headroom.',
    ],
  };
}

function designNetworkTopology(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const controls = [
    'Use CDN/WAF/bot protection and API ingress with separate origin pools for browse/search versus checkout/order/payment APIs.',
    'Keep service-to-service, data, admin, CI/CD, third-party, and observability traffic in explicitly named trust/network zones.',
    'Use private endpoints/private connectivity for databases, queues, secrets, logs, and sensitive processor paths where supported.',
    'Control egress, NAT, firewall rules, DNS, certificate lifecycle, and admin access path with named owners.',
  ];
  if (signals.storeEdge) controls.push('Define store connectivity with WAN outage behavior, local queue replay, secure remote support, and store network segmentation.');
  if (signals.multiRegion) controls.push('Define regional ingress, failover, data replication, DNS traffic steering, and residency boundaries.');
  return {
    tool: 'designNetworkTopologyTool',
    network_zones: [
      { zone: 'Public edge', purpose: 'CDN, WAF, bot controls, TLS termination policy, and API gateway ingress.', evidence_status: 'assumption' },
      { zone: 'Application runtime', purpose: 'Private service runtime for storefront/API, checkout/order, integration, batch, and AI services.', evidence_status: 'assumption' },
      { zone: 'Data plane', purpose: 'Private database, cache, search, object storage, queues/events, backup, and replication traffic.', evidence_status: 'assumption' },
      { zone: 'Operations/admin', purpose: 'Privileged access, CI/CD, observability, break-glass, and support access with audit logging.', evidence_status: 'assumption' },
      { zone: 'Third-party/store connectivity', purpose: 'PSP, ERP/WMS/OMS, carrier/supplier, SaaS, and store network integration boundaries.', evidence_status: 'assumption' },
    ],
    controls,
    risks: [
      risk('Flat network or shared origin design can allow campaign browse traffic, bot abuse, or integration failure to degrade checkout and payment.', 'High', 'Medium', 'Use separated ingress/origin pools, private data paths, egress controls, and dependency isolation.'),
    ],
    validation_needed: [
      'Confirm VPC/VNet/subnet model, ingress/origin split, firewall rules, private endpoints, egress policy, third-party connectivity, DNS, and certificate ownership.',
    ],
  };
}

function planResilience(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const criticalPaths = [
    'Storefront browse/search degradation path',
    'Checkout/order/payment commit path',
    'Inventory reservation and replay path',
    'Customer/support access path',
    'Integration/event replay path',
  ];
  if (signals.storeEdge) criticalPaths.push('Store offline trading and queue replay path');
  if (signals.retailAi) criticalPaths.push('AI/RAG degraded mode and human escalation path');
  return {
    tool: 'planResilienceTool',
    resilience_model: {
      posture: signals.multiRegion ? 'Multi-region posture requires explicit active-active or active-passive ADR.' : 'Regional HA with documented DR target until multi-region requirement is confirmed.',
      rto_rpo_status: 'assumption',
      critical_paths: criticalPaths,
    },
    controls: [
      'Define RTO/RPO by retail path: browse, checkout, payment, inventory, order, fulfilment, support, AI, and store edge where applicable.',
      'Use backup/restore tests, failover game days, dependency degradation, queue backpressure, and replay evidence before approval.',
      'Do not put AI/personalisation, analytics, or batch dependencies in checkout-critical availability paths.',
    ],
    risks: [
      risk('HA/DR claims are not credible without RTO/RPO, dependency failover, restore tests, and game-day evidence.', 'High', 'Medium', 'Define resilience tests and owner-approved recovery evidence.'),
    ],
    validation_needed: [
      'Confirm RTO/RPO, regional posture, active-active/passive choice, backup/restore policy, failover runbooks, dependency limits, and game-day schedule.',
    ],
  };
}

function planObservabilityOperations(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const telemetry = [
    'Customer-facing availability, latency, error rate, saturation, and conversion-impact SLOs',
    'Distributed traces for checkout, payment, inventory reservation, order, fulfilment, and integration replay',
    'Structured logs with redaction, audit evidence, SIEM/security export, and retention policy',
    'Dashboards, alerts, runbooks, on-call ownership, incident workflow, and post-incident review',
  ];
  if (signals.retailAi) telemetry.push('AI/RAG request, token, retrieval, tool-call, fallback, eval, and safety telemetry with privacy controls');
  return {
    tool: 'planObservabilityOperationsTool',
    observability_model: telemetry.map(item => ({ control: item, evidence_status: 'assumption' })),
    controls: [
      'Use OpenTelemetry-style traces, metrics, and structured logs with redaction and retention controls.',
      'Tie alerts to SLOs and retail business impact, not only infrastructure resource thresholds.',
      'Require runbooks, escalation, incident ownership, game days, and support handoff before go-live.',
    ],
    risks: [
      risk('Metrics-only monitoring is insufficient for distributed retail transaction diagnosis and audit evidence.', 'High', 'Medium', 'Implement trace/log correlation, replay dashboards, SLOs, and runbooks.'),
    ],
    validation_needed: [
      'Confirm SLIs/SLOs, log/trace retention, redaction, dashboards, alert thresholds, runbook owners, on-call rotation, and incident workflow.',
    ],
  };
}

function planEnvironmentRelease(input = {}) {
  return {
    tool: 'planEnvironmentReleaseTool',
    environment_strategy: [
      { environment: 'Development', purpose: 'Fast feedback, isolated secrets, synthetic/test data, IaC validation.', evidence_status: 'assumption' },
      { environment: 'Integration/UAT', purpose: 'Contract tests, replay/idempotency, processor mocks/sandboxes, representative data shape.', evidence_status: 'assumption' },
      { environment: 'Staging/pre-prod', purpose: 'Production-like network, identity, observability, release, rollback, and performance validation.', evidence_status: 'assumption' },
      { environment: 'Production', purpose: 'Controlled changes, audit logging, rollback, break-glass, SLOs, and support handoff.', evidence_status: 'assumption' },
    ],
    controls: [
      'Define IaC ownership, environment promotion, secrets handling, approvals, release windows, canary/blue-green, rollback, and drift review.',
      'Use non-prod parity for critical network, identity, integration, observability, and deployment behavior.',
      'Block production approval when rollback, runbook, ownership, or evidence location is missing.',
    ],
    risks: [
      risk('Production risk rises when non-prod parity, release rollback, environment ownership, and config promotion are unclear.', 'Medium', 'Medium', 'Define environment strategy and release gates before go-live.'),
    ],
    validation_needed: [
      'Confirm environment count, non-prod parity, CI/CD ownership, IaC state, approval gates, rollback path, release windows, and change controls.',
    ],
  };
}

function retrieveInfrastructureKnowledgeForInput(input = {}) {
  return retrieveInfrastructureKnowledge({
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

function validateInfrastructureOutput(input = {}) {
  const output = input.output || {};
  const toolResults = asArray(input.toolResults);
  const text = [
    output.summary,
    output.findings,
    output.infrastructure_recommendation,
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
    toolResults,
  ].flat(6).map(item => typeof item === 'string' ? item : JSON.stringify(item || '')).join('\n').toLowerCase();
  const blockers = [];
  const warnings = [];
  const improvements = [];
  const hasRuntime = /runtime|kubernetes|container|serverless|node pool|namespace|deployment/.test(text);
  const hasNetwork = /network|vpc|vnet|subnet|cdn|waf|api gateway|ingress|private endpoint|egress|firewall/.test(text);
  const hasResilience = /ha|dr|rto|rpo|resilience|failover|backup|restore|game.?day/.test(text);
  const hasObservability = /observability|logs|traces|metrics|slo|dashboard|alert|runbook|on-call|incident/.test(text);
  const hasEnvironment = /environment|non-prod|staging|uat|prod|ci\/cd|iac|rollback|release/.test(text);
  const hasUpstream = /security|compliance|governance|residency|pci|privacy|approval|handoff/.test(text);
  const hasEvidencePack = /evidence_pack|policy_sources|approval_workflow|client_questions|runtime_evidence_needed|network_evidence_needed|resilience_evidence_needed|operations_evidence_needed/.test(text);
  const hasQualification = /draft|not.*approval|human validation|requires.*validation|architecture board|platform owner/.test(text);
  const hasCitations = /citation|source_id|policy|baseline/.test(text);

  if (!hasRuntime) blockers.push('Infrastructure output does not define runtime/deployment model.');
  if (!hasNetwork) blockers.push('Infrastructure output does not define network/edge/private connectivity model.');
  if (!hasResilience) blockers.push('Infrastructure output does not define HA/DR/resilience posture.');
  if (!hasObservability) blockers.push('Infrastructure output does not define observability/operations/runbook model.');
  if (!hasEnvironment) warnings.push('Infrastructure output should define environment, CI/CD, rollback, and non-prod strategy.');
  if (!hasUpstream) blockers.push('Infrastructure output does not consume Security/Compliance/Governance handoff constraints.');
  if (!hasEvidencePack) blockers.push('Infrastructure output does not include customer-facing evidence pack with policy sources, approval workflow, and evidence needs.');
  if (!hasQualification) blockers.push('Infrastructure output does not qualify infrastructure recommendation as draft-level until platform owners validate evidence.');
  if (!hasCitations) warnings.push('Infrastructure output should include citations or source evidence.');
  if (!toolResults.length) blockers.push('Infrastructure tools did not produce handoff, runtime, network, resilience, operations, environment, or validation evidence.');
  if (!output.model_review?.enabled) improvements.push('Run model judgement for customer-specific infrastructure recommendations when an approved model is available.');

  return {
    tool: 'validateInfrastructureOutputTool',
    verdict: blockers.length ? 'fail' : warnings.length ? 'warn' : 'pass',
    blockers,
    warnings,
    improvements,
    required_controls: {
      runtime: hasRuntime,
      network: hasNetwork,
      resilience: hasResilience,
      observability: hasObservability,
      environment_release: hasEnvironment,
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

const infrastructureTools = {
  inspectInfrastructureHandoffTool: tool(inspectInfrastructureHandoff, {
    name: 'inspectInfrastructureHandoffTool',
    description: 'Inspect Security, Compliance, and Governance handoff constraints before Infrastructure recommendations.',
    schema: toolInputSchema,
  }),
  selectRuntimePlatformTool: tool(selectRuntimePlatform, {
    name: 'selectRuntimePlatformTool',
    description: 'Select runtime/deployment model and workload isolation controls.',
    schema: toolInputSchema,
  }),
  designNetworkTopologyTool: tool(designNetworkTopology, {
    name: 'designNetworkTopologyTool',
    description: 'Design network, edge, ingress, private connectivity, and traffic isolation model.',
    schema: toolInputSchema,
  }),
  planResilienceTool: tool(planResilience, {
    name: 'planResilienceTool',
    description: 'Plan HA/DR/resilience, RTO/RPO, failover, backup, and game-day evidence.',
    schema: toolInputSchema,
  }),
  planObservabilityOperationsTool: tool(planObservabilityOperations, {
    name: 'planObservabilityOperationsTool',
    description: 'Plan observability, SLOs, runbooks, alerting, on-call, and incident operations.',
    schema: toolInputSchema,
  }),
  planEnvironmentReleaseTool: tool(planEnvironmentRelease, {
    name: 'planEnvironmentReleaseTool',
    description: 'Plan environments, CI/CD, IaC, release strategy, rollback, and non-prod parity.',
    schema: toolInputSchema,
  }),
  retrieveInfrastructureKnowledgeTool: tool(retrieveInfrastructureKnowledgeForInput, {
    name: 'retrieveInfrastructureKnowledgeTool',
    description: 'Retrieve local ArchitectIQ Infrastructure knowledge and customer policy packs.',
    schema: toolInputSchema,
  }),
  validateInfrastructureOutputTool: tool(validateInfrastructureOutput, {
    name: 'validateInfrastructureOutputTool',
    description: 'Validate Infrastructure output against runtime, network, resilience, observability, environment, handoff, and evidence controls.',
    schema: toolInputSchema,
  }),
};

module.exports = {
  designNetworkTopology,
  infrastructureTools,
  inspectInfrastructureHandoff,
  planEnvironmentRelease,
  planObservabilityOperations,
  planResilience,
  retrieveInfrastructureKnowledgeForInput,
  selectRuntimePlatform,
  validateInfrastructureOutput,
};
