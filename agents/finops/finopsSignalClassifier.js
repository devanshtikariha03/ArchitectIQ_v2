function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const FINOPS_SIGNAL_DOMAINS = [
  {
    id: 'budget_constraints',
    label: 'Budget and commercial constraints',
    retrievalHints: ['retail-service-level-pricing-evidence-checklist'],
    aliases: ['budget', 'monthly', 'per month', 'opex', 'capex', 'hard budget', 'currency', 'committed spend', 'savings plan', 'reserved instance', 'enterprise agreement'],
  },
  {
    id: 'ai_unit_costs',
    label: 'AI, LLM, RAG, and vector cost',
    retrievalHints: ['llm-rag-agent-cost-model-template', 'private-llm-vector-db-embedding-reranking-cost-template'],
    aliases: ['llm', 'gpt', 'gpt-5.5', 'model', 'rag', 'embedding', 'vector', 'rerank', 'reranker', 'tokens', 'prompt cache', 'chatbot', 'agentic', 'eval traces'],
  },
  {
    id: 'retail_unit_drivers',
    label: 'Retail workload unit drivers',
    retrievalHints: ['retail-finops-unit-driver-playbook'],
    aliases: ['requests per day', 'sessions', 'checkout attempts', 'transactions', 'events/sec', 'stores', 'pos lanes', 'peak multiplier', 'flash sale', 'campaign'],
  },
  {
    id: 'cloud_service_pricing',
    label: 'Cloud service and provider pricing',
    retrievalHints: ['retail-service-level-pricing-evidence-checklist'],
    aliases: ['aws', 'azure', 'gcp', 'cloud', 'sku', 'region', 'instance', 'managed postgres', 'kubernetes', 'cdn', 'waf', 'opensearch', 'rds', 'cloud sql'],
  },
  {
    id: 'security_compliance_costs',
    label: 'Security and compliance mandatory cost',
    retrievalHints: ['security-compliance-governance-cost-handoff-template'],
    aliases: ['security', 'compliance', 'pci', 'privacy', 'residency', 'processor', 'kms', 'hsm', 'siem', 'dlp', 'audit evidence', 'support access', 'qsa'],
  },
  {
    id: 'operations_support_costs',
    label: 'Operations, support, and rollout cost',
    retrievalHints: ['cloud-support-licensing-partner-contingency-checklist'],
    aliases: ['support plan', 'licensing', 'partner', 'implementation', 'non-prod', 'contingency', 'runbook', 'game day', 'rollout', 'pilot', 'on-call'],
  },
  {
    id: 'data_observability_costs',
    label: 'Data, observability, retention, and egress cost',
    retrievalHints: ['data-observability-retention-cost-template'],
    aliases: ['storage', 'backup', 'retention', 'logs', 'traces', 'observability', 'egress', 'replication', 'analytics', 'warehouse', 'siem export'],
  },
  {
    id: 'store_edge_costs',
    label: 'Store edge and POS rollout cost',
    retrievalHints: ['store-edge-finops-cost-template'],
    aliases: ['store edge', 'pos', 'offline', 'wan outage', 'device management', 'field replacement', 'edge appliance', 'store rollout'],
  },
];

function matchAliases(text, aliases) {
  return aliases.filter(alias => {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(alias)}([^a-z0-9]|$)`, 'i');
    return pattern.test(text);
  });
}

function classifyFinOpsSignals({ query = '', context = {}, state = {}, signals = {} } = {}) {
  const text = normalize([
    query,
    typeof context === 'string' ? context : JSON.stringify(context || {}),
    typeof state === 'string' ? state : JSON.stringify(state || {}),
  ].join(' '));
  const domains = FINOPS_SIGNAL_DOMAINS.map(domain => {
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
  if (!domains.length) possibleMisses.push('No strong FinOps domain was detected; ask for budget, traffic, unit drivers, regions, SKUs, and mandatory controls.');
  if (signals.retailAi && !domains.some(domain => domain.id === 'ai_unit_costs')) possibleMisses.push('Retail AI is in scope, but AI token/vector/reranking cost language was weak or indirect.');
  if ((signals.payments || signals.customerData) && !domains.some(domain => domain.id === 'security_compliance_costs')) possibleMisses.push('Security/compliance context exists, but mandatory control-cost language was weak or indirect.');

  return {
    tool: 'classifyFinOpsSignals',
    domains,
    retrieval_hints: [...new Set(domains.flatMap(domain => domain.retrieval_hints))],
    confidence_summary: {
      high: domains.filter(domain => domain.confidence === 'high').length,
      medium: domains.filter(domain => domain.confidence === 'medium').length,
      low: domains.filter(domain => domain.confidence === 'low').length,
    },
    error_modes: {
      possible_false_positives: domains.filter(domain => domain.confidence === 'low').map(domain => `Low-confidence FinOps signal for ${domain.label}; confirm whether this cost domain is actually in scope.`),
      possible_false_negatives: possibleMisses,
      note: 'FinOps signal classification is a routing aid. Budget owners must validate unit drivers, pricing evidence, discounts, support, licensing, and commitments.',
    },
  };
}

module.exports = {
  FINOPS_SIGNAL_DOMAINS,
  classifyFinOpsSignals,
};
