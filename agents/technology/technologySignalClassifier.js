function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const TECHNOLOGY_SIGNAL_DOMAINS = [
  {
    id: 'technology_decomposition',
    label: 'Technology decomposition and specialist handoff',
    retrievalHints: ['retail-technology-decomposition-playbook'],
    aliases: ['technology', 'tech stack', 'solution components', 'architecture recommendation', 'component', 'layer', 'specialist', 'handoff'],
  },
  {
    id: 'api_integration',
    label: 'API, service contracts, orchestration, and integration',
    retrievalHints: ['retail-api-integration-contract-template'],
    aliases: ['api', 'api gateway', 'contract', 'rest', 'graphql', 'grpc', 'webhook', 'idempotency', 'orchestration', 'integration', 'erp', 'wms', 'oms', 'psp', 'carrier', 'supplier', 'event'],
  },
  {
    id: 'storage_data_platform',
    label: 'Storage, data truth, cache, search, and backup',
    retrievalHints: ['retail-storage-data-platform-template'],
    aliases: ['database', 'postgres', 'mysql', 'nosql', 'cache', 'redis', 'search', 'opensearch', 'object storage', 'backup', 'restore', 'replication', 'oltp', 'data store'],
  },
  {
    id: 'ai_platform',
    label: 'AI, RAG, LLM, vector DB, and recommendation technology',
    retrievalHints: ['retail-ai-technology-template'],
    aliases: ['ai', 'rag', 'llm', 'embedding', 'vector', 'rerank', 'chatbot', 'recommendation', 'personalization', 'agent', 'model routing', 'ollama', 'gpt'],
  },
  {
    id: 'ui_experience',
    label: 'Storefront, admin, mobile, and user-facing technology',
    retrievalHints: ['retail-ui-experience-template'],
    aliases: ['ui', 'frontend', 'storefront', 'admin', 'mobile', 'react', 'nextjs', 'native', 'pos', 'associate app', 'accessibility', 'performance', 'pwa'],
  },
  {
    id: 'cross_cutting_nfr',
    label: 'Cross-cutting NFR and technology decision controls',
    retrievalHints: ['retail-cross-cutting-technology-nfr-template'],
    aliases: ['nfr', 'latency', 'availability', 'scalability', 'resilience', 'security', 'compliance', 'observability', 'cost', 'rollback', 'slo'],
  },
];

function matchAliases(text, aliases) {
  return aliases.filter(alias => {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(alias)}([^a-z0-9]|$)`, 'i');
    return pattern.test(text);
  });
}

function classifyTechnologySignals({ query = '', context = {}, state = {}, signals = {} } = {}) {
  const text = normalize([
    query,
    typeof context === 'string' ? context : JSON.stringify(context || {}),
    typeof state === 'string' ? state : JSON.stringify(state || {}),
  ].join(' '));
  const domains = TECHNOLOGY_SIGNAL_DOMAINS.map(domain => {
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
  if (!domains.length) possibleMisses.push('No strong technology domain was detected; ask for API, storage, AI, UI, data-flow, and integration requirements.');
  if (signals.commerce && !domains.some(domain => domain.id === 'api_integration')) possibleMisses.push('Commerce is in scope, but service-contract/API/integration signals were weak or indirect.');
  if (signals.retailAi && !domains.some(domain => domain.id === 'ai_platform')) possibleMisses.push('Retail AI is in scope, but AI platform/RAG/vector/model routing signals were weak or indirect.');
  if (signals.storeEdge && !domains.some(domain => domain.id === 'ui_experience')) possibleMisses.push('Store-edge retail is in scope, but POS/mobile/UI technology signals were weak or indirect.');

  return {
    tool: 'classifyTechnologySignals',
    domains,
    retrieval_hints: [...new Set(domains.flatMap(domain => domain.retrieval_hints))],
    confidence_summary: {
      high: domains.filter(domain => domain.confidence === 'high').length,
      medium: domains.filter(domain => domain.confidence === 'medium').length,
      low: domains.filter(domain => domain.confidence === 'low').length,
    },
    error_modes: {
      possible_false_positives: domains.filter(domain => domain.confidence === 'low').map(domain => `Low-confidence technology signal for ${domain.label}; confirm whether this domain is actually in scope.`),
      possible_false_negatives: possibleMisses,
      note: 'Technology signal classification is a routing aid. API, Storage, AI, UI, platform, security, compliance, governance, and FinOps owners must validate final choices.',
    },
  };
}

module.exports = {
  TECHNOLOGY_SIGNAL_DOMAINS,
  classifyTechnologySignals,
};
