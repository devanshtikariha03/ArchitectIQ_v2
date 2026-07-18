function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const INFRASTRUCTURE_SIGNAL_DOMAINS = [
  {
    id: 'runtime_platform',
    label: 'Runtime platform and deployment model',
    retrievalHints: ['retail-runtime-platform-template'],
    aliases: ['kubernetes', 'aks', 'eks', 'gke', 'serverless', 'container', 'vm', 'virtual machine', 'node pool', 'namespace', 'deployment', 'runtime', 'blue green', 'canary'],
  },
  {
    id: 'network_edge',
    label: 'Network, edge, ingress, and connectivity',
    retrievalHints: ['retail-network-edge-connectivity-template'],
    aliases: ['cdn', 'waf', 'api gateway', 'load balancer', 'ingress', 'vpc', 'vnet', 'subnet', 'private link', 'vpn', 'direct connect', 'expressroute', 'nat', 'firewall'],
  },
  {
    id: 'ha_dr_resilience',
    label: 'High availability, disaster recovery, and resilience',
    retrievalHints: ['retail-ha-dr-resilience-template'],
    aliases: ['ha', 'high availability', 'dr', 'disaster recovery', 'rto', 'rpo', 'multi-region', 'active active', 'active passive', 'failover', 'backup', 'restore', 'resilience'],
  },
  {
    id: 'observability_operations',
    label: 'Observability and operations',
    retrievalHints: ['retail-observability-operations-template'],
    aliases: ['observability', 'opentelemetry', 'logs', 'traces', 'metrics', 'alerts', 'dashboard', 'slo', 'runbook', 'on-call', 'incident', 'game day'],
  },
  {
    id: 'store_edge_infrastructure',
    label: 'Store edge and offline infrastructure',
    retrievalHints: ['retail-store-edge-infrastructure-template'],
    aliases: ['store edge', 'pos', 'offline checkout', 'offline trading', 'wan outage', 'local queue', 'edge appliance', 'store rollout', 'device management'],
  },
  {
    id: 'environment_release',
    label: 'Environment, CI/CD, and release controls',
    retrievalHints: ['retail-environment-release-template'],
    aliases: ['ci/cd', 'cicd', 'pipeline', 'terraform', 'iac', 'environment', 'non-prod', 'staging', 'uat', 'dev', 'prod', 'release', 'rollback'],
  },
  {
    id: 'security_compliance_infra',
    label: 'Security and compliance infrastructure constraints',
    retrievalHints: ['retail-infrastructure-security-compliance-handoff-template'],
    aliases: ['security', 'compliance', 'pci', 'residency', 'sovereignty', 'kms', 'hsm', 'secret', 'mTLS', 'private endpoint', 'audit', 'siem'],
  },
  {
    id: 'scalability_performance',
    label: 'Scalability and performance',
    retrievalHints: ['retail-scalability-performance-template'],
    aliases: ['scale', 'autoscale', 'throughput', 'latency', 'peak', 'flash sale', 'campaign', 'requests per second', 'concurrency', 'performance', 'load test'],
  },
];

function matchAliases(text, aliases) {
  return aliases.filter(alias => {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(alias)}([^a-z0-9]|$)`, 'i');
    return pattern.test(text);
  });
}

function classifyInfrastructureSignals({ query = '', context = {}, state = {}, signals = {} } = {}) {
  const text = normalize([
    query,
    typeof context === 'string' ? context : JSON.stringify(context || {}),
    typeof state === 'string' ? state : JSON.stringify(state || {}),
  ].join(' '));
  const domains = INFRASTRUCTURE_SIGNAL_DOMAINS.map(domain => {
    const matched_terms = matchAliases(text, domain.aliases);
    const score = matched_terms.length;
    const confidence = score >= 4 ? 'high' : score >= 2 ? 'medium' : score === 1 ? 'low' : 'none';
    return {
      id: domain.id,
      label: domain.label,
      confidence,
      score,
      matched_terms,
      retrieval_hints: domain.retrievalHints,
    };
  }).filter(domain => domain.score > 0);

  const possibleMisses = [];
  if (!domains.length) possibleMisses.push('No strong infrastructure domain was detected; ask for runtime, network, HA/DR, observability, environment, and deployment constraints.');
  if (signals.storeEdge && !domains.some(domain => domain.id === 'store_edge_infrastructure')) possibleMisses.push('Store-edge retail is in scope, but infrastructure language for offline/edge deployment was weak or indirect.');
  if (signals.multiRegion && !domains.some(domain => domain.id === 'ha_dr_resilience')) possibleMisses.push('Multi-region or residency signals exist, but HA/DR infrastructure language was weak or indirect.');

  return {
    tool: 'classifyInfrastructureSignals',
    domains,
    retrieval_hints: [...new Set(domains.flatMap(domain => domain.retrieval_hints))],
    confidence_summary: {
      high: domains.filter(domain => domain.confidence === 'high').length,
      medium: domains.filter(domain => domain.confidence === 'medium').length,
      low: domains.filter(domain => domain.confidence === 'low').length,
    },
    error_modes: {
      possible_false_positives: domains.filter(domain => domain.confidence === 'low').map(domain => `Low-confidence infrastructure signal for ${domain.label}; confirm whether this infrastructure domain is actually in scope.`),
      possible_false_negatives: possibleMisses,
      note: 'Infrastructure signal classification is a routing aid. Platform, security, compliance, operations, and FinOps owners must validate final topology and NFR evidence.',
    },
  };
}

module.exports = {
  INFRASTRUCTURE_SIGNAL_DOMAINS,
  classifyInfrastructureSignals,
};
