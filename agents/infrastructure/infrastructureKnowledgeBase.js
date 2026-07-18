const { loadInfrastructurePolicyDocuments } = require('./infrastructurePolicyIngestion');

const INFRASTRUCTURE_KNOWLEDGE_DOCS = [
  {
    id: 'retail-runtime-platform-template',
    title: 'Retail Runtime Platform Template',
    tags: ['runtime', 'kubernetes', 'serverless', 'containers', 'deployment'],
    controls: ['Choose runtime based on team maturity, deployment frequency, isolation needs, autoscaling, release safety, and operational ownership.'],
    risks: ['Runtime choices are fragile when team capability, rollback, scaling, and support model are not validated.'],
    validation_needed: ['Confirm cloud/on-prem preference, runtime team capability, deployment model, release gates, support model, and non-prod parity.'],
    citations: ['ArchitectIQ infrastructure baseline: runtime platform must match NFRs and operating model.'],
  },
  {
    id: 'retail-network-edge-connectivity-template',
    title: 'Retail Network Edge Connectivity Template',
    tags: ['network', 'edge', 'waf', 'cdn', 'connectivity'],
    controls: ['Separate public edge, API ingress, private service networks, data networks, admin access, third-party connectivity, and store connectivity.'],
    risks: ['Shared ingress or flat networks can let browse spikes, bot abuse, admin access, or third-party issues affect checkout and order paths.'],
    validation_needed: ['Confirm ingress isolation, WAF/bot controls, private endpoints, egress control, NAT, firewall, VPN/direct connectivity, and admin access pattern.'],
    citations: ['ArchitectIQ infrastructure baseline: retail edge and private connectivity must be explicit.'],
  },
  {
    id: 'retail-ha-dr-resilience-template',
    title: 'Retail HA DR Resilience Template',
    tags: ['ha', 'dr', 'resilience', 'rto', 'rpo'],
    controls: ['Define HA/DR by workload criticality, RTO, RPO, failover pattern, backup/restore, regional posture, and game-day evidence.'],
    risks: ['Claims of high availability are weak without RTO/RPO, failover ownership, restore testing, and dependency degradation paths.'],
    validation_needed: ['Confirm RTO/RPO, active-active or active-passive choice, dependency failover, backup policy, restore testing, runbooks, and game-day schedule.'],
    citations: ['ArchitectIQ infrastructure baseline: HA/DR must be evidence-backed, not a label.'],
  },
  {
    id: 'retail-observability-operations-template',
    title: 'Retail Observability Operations Template',
    tags: ['observability', 'slo', 'runbook', 'incident', 'operations'],
    controls: ['Require OpenTelemetry-style traces, structured logs, SLO dashboards, alerts, audit logs, redaction, runbooks, escalation, and on-call ownership.'],
    risks: ['Metrics-only monitoring is insufficient for distributed checkout, payment, inventory, fulfilment, and replay diagnosis.'],
    validation_needed: ['Confirm SLIs/SLOs, log/trace retention, redaction, dashboards, alert thresholds, runbook owners, on-call rotation, and incident workflow.'],
    citations: ['ArchitectIQ infrastructure baseline: observability must support retail transaction diagnosis and audit evidence.'],
  },
  {
    id: 'retail-store-edge-infrastructure-template',
    title: 'Retail Store Edge Infrastructure Template',
    tags: ['store-edge', 'pos', 'offline', 'device', 'rollout'],
    controls: ['For store-edge workloads, design offline mode, local queue, device trust, patching, local observability, field replacement, network resilience, and wave rollout.'],
    risks: ['Store-edge under-design causes transaction loss, reconciliation gaps, support incidents, and rollout failure.'],
    validation_needed: ['Confirm store count, POS lanes, offline duration, local storage, queue replay, device management, support desk, field support, and rollout waves.'],
    citations: ['ArchitectIQ infrastructure baseline: store-edge infrastructure needs offline and field-operations validation.'],
  },
  {
    id: 'retail-environment-release-template',
    title: 'Retail Environment Release Template',
    tags: ['environment', 'cicd', 'iac', 'release', 'rollback'],
    controls: ['Define dev/test/stage/UAT/prod environments, IaC, CI/CD, approvals, secrets, release strategy, rollback, config promotion, and drift review.'],
    risks: ['Production risk rises when non-prod parity, release rollback, environment ownership, and config promotion are unclear.'],
    validation_needed: ['Confirm environment count, non-prod parity, CI/CD ownership, IaC state, approvals, rollback, release windows, and change controls.'],
    citations: ['ArchitectIQ infrastructure baseline: release and environment strategy are infrastructure decisions.'],
  },
  {
    id: 'retail-infrastructure-security-compliance-handoff-template',
    title: 'Retail Infrastructure Security Compliance Handoff Template',
    tags: ['security', 'compliance', 'residency', 'pci', 'audit'],
    controls: ['Carry Security and Compliance gates into infrastructure: private connectivity, encryption, KMS/HSM, secrets, admin access, audit logging, SIEM export, residency, and PCI segmentation.'],
    risks: ['Infrastructure designs can invalidate security/compliance assumptions if regions, admin paths, support access, logs, backups, or network segmentation are not aligned.'],
    validation_needed: ['Confirm security/compliance handoff, approved regions, key ownership, admin path, logging/export, backup residency, support access, and PCI network segmentation.'],
    citations: ['ArchitectIQ infrastructure baseline: upstream Security and Compliance outputs constrain topology.'],
  },
  {
    id: 'retail-scalability-performance-template',
    title: 'Retail Scalability Performance Template',
    tags: ['scale', 'performance', 'autoscale', 'peak', 'load-test'],
    controls: ['Define autoscaling, capacity headroom, load-test profile, peak multiplier, queue backpressure, degraded modes, and dependency limits.'],
    risks: ['Retail peak events fail when average traffic drives sizing or when checkout, payment, inventory, and search share bottlenecks.'],
    validation_needed: ['Confirm peak multiplier, load-test targets, latency SLOs, concurrency, throughput, queue limits, dependency quotas, and degraded-mode behavior.'],
    citations: ['ArchitectIQ infrastructure baseline: retail scale is validated by peak load tests and dependency limits.'],
  },
];

function tokenize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9+\-/ ]/g, ' ').split(/\s+/).filter(token => token.length > 2);
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function docText(doc) {
  return [
    doc.id,
    doc.title,
    doc.tags,
    doc.version,
    doc.effective_date,
    doc.review_by,
    doc.freshness_status,
    doc.freshness_notes,
    doc.controls,
    doc.risks,
    doc.validation_needed,
    doc.citations,
  ].flat(3).join(' ');
}

function citationsForDoc(doc) {
  if (Array.isArray(doc.citations) && doc.citations.length) {
    return doc.citations.map(item => {
      if (item && typeof item === 'object') return item;
      return {
        source_id: doc.id,
        title: doc.title,
        snippet: String(item),
        source_path: doc.source_path || 'agents/infrastructure/infrastructureKnowledgeBase.js',
        version: doc.version || 'built-in',
        effective_date: doc.effective_date || 'current ArchitectIQ baseline',
        review_by: doc.review_by || 'not stated',
        freshness_status: doc.freshness_status || 'baseline',
      };
    });
  }
  const snippet = (doc.controls || doc.risks || doc.validation_needed || [])[0];
  if (!snippet) return [];
  return [{
    source_id: doc.id,
    title: doc.title,
    snippet,
    source_path: doc.source_path || 'agents/infrastructure/infrastructureKnowledgeBase.js',
    version: doc.version || 'built-in',
    effective_date: doc.effective_date || 'current ArchitectIQ baseline',
    review_by: doc.review_by || 'not stated',
    freshness_status: doc.freshness_status || 'baseline',
  }];
}

function retrieveInfrastructureKnowledge({ query = '', retrievalPlan = [], signals = {}, limit = 7 } = {}) {
  const allDocs = [
    ...loadInfrastructurePolicyDocuments(),
    ...INFRASTRUCTURE_KNOWLEDGE_DOCS,
  ];
  const queryTokens = new Set(tokenize([
    query,
    retrievalPlan.join(' '),
    Object.entries(signals).filter(([, value]) => value === true).map(([key]) => key).join(' '),
  ].join(' ')));
  const requested = new Set((retrievalPlan || []).map(String));
  const candidates = allDocs.map(doc => {
    const tokens = tokenize(docText(doc));
    const overlap = tokens.reduce((score, token) => score + (queryTokens.has(token) ? 1 : 0), 0);
    const planBoost = requested.has(doc.id) ? 12 : 0;
    const tagBoost = (doc.tags || []).reduce((score, tag) => score + (queryTokens.has(String(tag).toLowerCase()) ? 3 : 0), 0);
    return { doc, score: overlap + planBoost + tagBoost };
  }).filter(item => item.score > 0 || requested.has(item.doc.id));
  const byId = new Map();
  for (const item of candidates) {
    const existing = byId.get(item.doc.id);
    const itemIsPolicy = Boolean(item.doc.source);
    const existingIsPolicy = Boolean(existing?.doc?.source);
    if (!existing || (itemIsPolicy && !existingIsPolicy) || (itemIsPolicy === existingIsPolicy && item.score > existing.score)) byId.set(item.doc.id, item);
  }
  const scored = [...byId.values()].sort((a, b) => b.score - a.score).slice(0, limit).map(item => ({ ...item.doc, score: item.score }));
  const freshnessValidation = unique(scored.flatMap(doc => {
    if (!doc.freshness_status || doc.freshness_status === 'current' || doc.freshness_status === 'baseline') return [];
    return (doc.freshness_notes || [`Policy freshness status is ${doc.freshness_status}.`]).map(note => `Policy freshness review required for ${doc.id}: ${note}`);
  }));
  return {
    tool: 'retrieveInfrastructureKnowledgeTool',
    source: 'local-infrastructure-knowledge-base',
    docs: scored.map(doc => ({
      id: doc.id,
      title: doc.title,
      score: doc.score,
      tags: doc.tags,
      source: doc.source || 'built-in',
      source_path: doc.source_path || null,
      version: doc.version || '2026.07',
      effective_date: doc.effective_date || null,
      review_by: doc.review_by || null,
      freshness_status: doc.freshness_status || 'baseline',
      freshness_notes: doc.freshness_notes || [],
    })),
    controls: unique(scored.flatMap(doc => doc.controls || [])),
    risks: unique(scored.flatMap(doc => doc.risks || [])).map(item => ({
      risk: item,
      severity: /fail|fragile|invalidate|insufficient|under-design|flat networks/i.test(item) ? 'High' : 'Medium',
      likelihood: 'Medium',
      fix: 'Attach topology, NFR, runbook, ownership, and test evidence before client-ready approval.',
    })),
    validation_needed: unique([...scored.flatMap(doc => doc.validation_needed || []), ...freshnessValidation]),
    citations: scored.flatMap(citationsForDoc).map(citation => ({ ...citation, evidence_status: citation.evidence_status || 'baseline' })).slice(0, 12),
    policy_inventory: allDocs.map(doc => ({
      id: doc.id,
      title: doc.title,
      source: doc.source || 'built-in',
      source_path: doc.source_path || null,
      version: doc.version || null,
      owner: doc.owner || null,
      effective_date: doc.effective_date || null,
      review_by: doc.review_by || null,
      freshness_status: doc.freshness_status || 'baseline',
      freshness_notes: doc.freshness_notes || [],
    })),
  };
}

module.exports = {
  INFRASTRUCTURE_KNOWLEDGE_DOCS,
  retrieveInfrastructureKnowledge,
};
