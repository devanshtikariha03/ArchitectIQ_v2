function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const AI_SIGNAL_DOMAINS = [
  {
    id: 'rag_retrieval',
    label: 'RAG and retrieval architecture',
    retrievalHints: ['retail-rag-retrieval-template'],
    aliases: ['rag', 'retrieval', 'knowledge base', 'corpus', 'chunk', 'context', 'grounding', 'document'],
  },
  {
    id: 'model_routing',
    label: 'LLM model routing and hosting',
    retrievalHints: ['retail-model-routing-template'],
    aliases: ['llm', 'gpt', 'gpt 5.5', 'model', 'local model', 'ollama', 'fine tune', 'frontier', 'fallback model', 'routing'],
  },
  {
    id: 'vector_embedding_rerank',
    label: 'Vector DB, embeddings, and reranking',
    retrievalHints: ['retail-vector-embedding-rerank-template'],
    aliases: ['vector', 'embedding', 'embeddings', 'rerank', 'reranking', 'qdrant', 'pgvector', 'pinecone', 'weaviate', 'milvus'],
  },
  {
    id: 'ai_tool_use',
    label: 'AI tool/API access and agent actions',
    retrievalHints: ['retail-ai-tool-api-template'],
    aliases: ['tool', 'tool call', 'agent', 'api call', 'order lookup', 'refund', 'returns', 'loyalty', 'recommendation tool'],
  },
  {
    id: 'ai_safety_eval',
    label: 'AI safety, evaluation, and fallback',
    retrievalHints: ['retail-ai-safety-eval-template'],
    aliases: ['eval', 'evaluation', 'hallucination', 'fallback', 'human escalation', 'guardrail', 'prompt injection', 'quality', 'test set'],
  },
  {
    id: 'ai_privacy_residency',
    label: 'AI privacy, residency, and telemetry',
    retrievalHints: ['retail-ai-privacy-residency-template'],
    aliases: ['privacy', 'residency', 'prompt', 'completion', 'telemetry', 'trace', 'pii', 'pci', 'retention', 'deletion'],
  },
  {
    id: 'ai_cost_operations',
    label: 'AI cost, observability, and operations',
    retrievalHints: ['retail-ai-cost-operations-template'],
    aliases: ['token', 'cost', 'budget', 'finops', 'cache hit', 'rate limit', 'observability', 'latency', 'monitoring'],
  },
];

function matchAliases(text, aliases) {
  return aliases.filter(alias => {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(alias)}([^a-z0-9]|$)`, 'i');
    return pattern.test(text);
  });
}

function classifyAiSignals({ query = '', context = {}, state = {}, signals = {} } = {}) {
  const text = normalize([
    query,
    typeof context === 'string' ? context : JSON.stringify(context || {}),
    typeof state === 'string' ? state : JSON.stringify(state || {}),
  ].join(' '));
  const domains = AI_SIGNAL_DOMAINS.map(domain => {
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
  if (!domains.length) possibleMisses.push('No strong AI domain was detected; ask for AI use case, RAG corpus, model route, tool access, telemetry, privacy, fallback, and token budget.');
  if (signals.retailAi && !domains.some(domain => domain.id === 'rag_retrieval')) possibleMisses.push('Retail AI is in scope, but RAG/retrieval/corpus language was weak or indirect.');
  if (signals.payments && domains.length && !domains.some(domain => domain.id === 'ai_privacy_residency')) possibleMisses.push('Payments are in scope with AI signals; verify prompt/log/payment-adjacent data exclusion or tokenized boundaries.');

  return {
    tool: 'classifyAiSignals',
    domains,
    retrieval_hints: [...new Set(domains.flatMap(domain => domain.retrieval_hints))],
    confidence_summary: {
      high: domains.filter(domain => domain.confidence === 'high').length,
      medium: domains.filter(domain => domain.confidence === 'medium').length,
      low: domains.filter(domain => domain.confidence === 'low').length,
    },
    error_modes: {
      possible_false_positives: domains.filter(domain => domain.confidence === 'low').map(domain => `Low-confidence AI signal for ${domain.label}; confirm whether this AI domain is actually in scope.`),
      possible_false_negatives: possibleMisses,
      note: 'AI signal classification is a routing aid. AI, API, Storage, Security, Compliance, Infrastructure, Technology, Governance, and FinOps owners must validate final choices.',
    },
  };
}

module.exports = {
  AI_SIGNAL_DOMAINS,
  classifyAiSignals,
};
