function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const API_SIGNAL_DOMAINS = [
  {
    id: 'api_gateway_edge',
    label: 'API gateway, edge, and ingress',
    retrievalHints: ['retail-api-gateway-edge-template'],
    aliases: ['api gateway', 'gateway', 'ingress', 'edge api', 'rate limit', 'throttle', 'waf', 'bot', 'origin', 'auth'],
  },
  {
    id: 'service_contracts',
    label: 'Service contracts and domain APIs',
    retrievalHints: ['retail-service-contract-template'],
    aliases: ['api', 'contract', 'rest', 'graphql', 'grpc', 'openapi', 'versioning', 'schema', 'domain api', 'service boundary'],
  },
  {
    id: 'sync_async_orchestration',
    label: 'Synchronous/asynchronous orchestration',
    retrievalHints: ['retail-orchestration-integration-template'],
    aliases: ['orchestration', 'workflow', 'sync', 'async', 'synchronous', 'asynchronous', 'queue', 'event', 'pubsub', 'kafka', 'saga'],
  },
  {
    id: 'third_party_integration',
    label: 'Third-party and B2B integration',
    retrievalHints: ['retail-third-party-integration-template'],
    aliases: ['erp', 'wms', 'oms', 'psp', 'carrier', 'supplier', 'marketplace', 'webhook', 'edi', '3pl', 'saas', 'integration'],
  },
  {
    id: 'idempotency_replay_reconciliation',
    label: 'Idempotency, replay, DLQ, and reconciliation',
    retrievalHints: ['retail-idempotency-replay-template'],
    aliases: ['idempotency', 'idempotent', 'replay', 'retry', 'dlq', 'dead letter', 'reconciliation', 'dedupe', 'outbox', 'exactly once'],
  },
  {
    id: 'api_security_observability',
    label: 'API security, observability, and operations',
    retrievalHints: ['retail-api-security-observability-template'],
    aliases: ['oauth', 'oidc', 'jwt', 'mtls', 'scope', 'audit', 'trace', 'logs', 'metrics', 'slo', 'observability', 'runbook'],
  },
];

function matchAliases(text, aliases) {
  return aliases.filter(alias => {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(alias)}([^a-z0-9]|$)`, 'i');
    return pattern.test(text);
  });
}

function classifyApiSignals({ query = '', context = {}, state = {}, signals = {} } = {}) {
  const text = normalize([
    query,
    typeof context === 'string' ? context : JSON.stringify(context || {}),
    typeof state === 'string' ? state : JSON.stringify(state || {}),
  ].join(' '));
  const domains = API_SIGNAL_DOMAINS.map(domain => {
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
  if (!domains.length) possibleMisses.push('No strong API domain was detected; ask for gateway, service contracts, integration, eventing, idempotency, replay, and observability requirements.');
  if (signals.commerce && !domains.some(domain => domain.id === 'idempotency_replay_reconciliation')) possibleMisses.push('Commerce is in scope, but idempotency/replay/reconciliation language was weak or indirect.');
  if (signals.supplyChain && !domains.some(domain => domain.id === 'third_party_integration')) possibleMisses.push('Supply-chain retail is in scope, but third-party/B2B integration language was weak or indirect.');

  return {
    tool: 'classifyApiSignals',
    domains,
    retrieval_hints: [...new Set(domains.flatMap(domain => domain.retrieval_hints))],
    confidence_summary: {
      high: domains.filter(domain => domain.confidence === 'high').length,
      medium: domains.filter(domain => domain.confidence === 'medium').length,
      low: domains.filter(domain => domain.confidence === 'low').length,
    },
    error_modes: {
      possible_false_positives: domains.filter(domain => domain.confidence === 'low').map(domain => `Low-confidence API signal for ${domain.label}; confirm whether this API domain is actually in scope.`),
      possible_false_negatives: possibleMisses,
      note: 'API signal classification is a routing aid. API, integration, storage, security, compliance, infrastructure, technology, governance, and FinOps owners must validate final choices.',
    },
  };
}

module.exports = {
  API_SIGNAL_DOMAINS,
  classifyApiSignals,
};
