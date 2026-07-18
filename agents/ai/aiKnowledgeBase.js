const { loadAiPolicyDocuments } = require('./aiPolicyIngestion');

const AI_KNOWLEDGE_DOCS = [
  {
    id: 'retail-rag-retrieval-template',
    title: 'Retail RAG Retrieval Template',
    tags: ['rag', 'retrieval', 'knowledge', 'corpus'],
    controls: ['Define approved AI knowledge corpus, chunking, metadata filters, retrieval scope, freshness, citations, and rebuild path before using RAG in customer or employee workflows.'],
    risks: ['Weak RAG boundaries can retrieve stale, unauthorized, cross-region, or customer-sensitive content.'],
    validation_needed: ['Confirm corpus owner, data classes, chunking, metadata, retrieval filters, freshness, citation policy, deletion propagation, and rebuild evidence.'],
    citations: ['ArchitectIQ AI baseline: RAG must be grounded in approved, classified, and rebuildable corpora.'],
  },
  {
    id: 'retail-model-routing-template',
    title: 'Retail Model Routing Template',
    tags: ['llm', 'model-routing', 'gpt', 'local-model'],
    controls: ['Use model routing by risk and cost: small/private models for low-risk drafting/classification where approved, GPT/frontier models for final judgement or complex synthesis, and deterministic fallback when models fail.'],
    risks: ['Using one frontier model for every step increases token cost, latency, and data exposure; using weak local models for final judgement can reduce quality.'],
    validation_needed: ['Confirm model provider, data handling, residency, token budget, fallback, quality evals, latency target, and future local/fine-tuned model plan.'],
    citations: ['ArchitectIQ AI baseline: model routing must balance quality, privacy, latency, and cost.'],
  },
  {
    id: 'retail-vector-embedding-rerank-template',
    title: 'Retail Vector Embedding Rerank Template',
    tags: ['vector', 'embedding', 'rerank', 'retrieval'],
    controls: ['Choose vector DB, embedding model, metadata filters, deletion propagation, reranking policy, query limits, and retrieval evals based on corpus size, latency, privacy, and cost.'],
    risks: ['Embeddings/vector stores can create hidden personal-data copies and cost drift if metadata, deletion, and query volume are not controlled.'],
    validation_needed: ['Confirm vector DB, embedding model, dimensions, metadata schema, deletion process, reranker need, query volume, latency, and cost model.'],
    citations: ['ArchitectIQ AI baseline: vector stores are derived data stores with privacy, deletion, and cost controls.'],
  },
  {
    id: 'retail-ai-tool-api-template',
    title: 'Retail AI Tool API Template',
    tags: ['tool', 'api', 'agent', 'action'],
    controls: ['AI tool APIs must have scoped permissions, read/write separation, approval gates for sensitive actions, audit trails, rate limits, and fallback/human escalation.'],
    risks: ['AI tools can bypass API/domain ownership and create unsafe customer-visible actions if scopes and approvals are unclear.'],
    validation_needed: ['Confirm tool list, API scopes, allowed actions, denied actions, approval gates, audit fields, rate limits, rollback, and human escalation.'],
    citations: ['ArchitectIQ AI baseline: AI tools must use bounded, auditable APIs.'],
  },
  {
    id: 'retail-ai-safety-eval-template',
    title: 'Retail AI Safety Eval Template',
    tags: ['safety', 'eval', 'fallback', 'quality'],
    controls: ['Define AI eval suites, hallucination checks, groundedness, refusal behavior, regression tests, fallback routes, human escalation, and release gates.'],
    risks: ['AI workflows without evals and fallback can hallucinate policy, refund, product, inventory, or compliance answers.'],
    validation_needed: ['Confirm eval cases, pass thresholds, prompt/version ownership, safety tests, fallback, human escalation, and release approval.'],
    citations: ['ArchitectIQ AI baseline: AI release requires eval evidence and fallback.'],
  },
  {
    id: 'retail-ai-privacy-residency-template',
    title: 'Retail AI Privacy Residency Template',
    tags: ['privacy', 'residency', 'telemetry', 'retention'],
    controls: ['Map prompts, completions, embeddings, vector stores, eval traces, logs, tool payloads, support bundles, and provider telemetry to data class, region, retention, and deletion controls.'],
    risks: ['AI telemetry and embeddings can violate privacy/residency even when application databases are compliant.'],
    validation_needed: ['Confirm prompt data classes, provider telemetry, residency, retention, deletion, support access, redaction, and processor evidence.'],
    citations: ['ArchitectIQ AI baseline: AI data copies must preserve privacy and residency constraints end to end.'],
  },
  {
    id: 'retail-ai-cost-operations-template',
    title: 'Retail AI Cost Operations Template',
    tags: ['cost', 'tokens', 'observability', 'operations'],
    controls: ['Track model calls, input/output tokens, prompt cache, retrieval count, embedding ingestion/query volume, vector reads, reranker calls, eval traces, fallback use, latency, and error rates.'],
    risks: ['AI cost can dominate architecture spend if GPT/frontier calls, embeddings, vector reads, and traces are not routed, cached, capped, and measured.'],
    validation_needed: ['Confirm token budget, model routing split, cache hit rate, request volume, retrieval/rerank volume, trace retention, alerts, and budget guardrails.'],
    citations: ['ArchitectIQ AI baseline: AI architecture requires explicit cost and observability controls.'],
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
        source_path: doc.source_path || 'agents/ai/aiKnowledgeBase.js',
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
    source_path: doc.source_path || 'agents/ai/aiKnowledgeBase.js',
    version: doc.version || 'built-in',
    effective_date: doc.effective_date || 'current ArchitectIQ baseline',
    review_by: doc.review_by || 'not stated',
    freshness_status: doc.freshness_status || 'baseline',
  }];
}

function retrieveAiKnowledge({ query = '', retrievalPlan = [], signals = {}, limit = 7 } = {}) {
  const allDocs = [
    ...loadAiPolicyDocuments(),
    ...AI_KNOWLEDGE_DOCS,
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
    tool: 'retrieveAiKnowledgeTool',
    source: 'local-ai-knowledge-base',
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
      severity: /privacy|residency|unsafe|dominate|hidden|hallucinate|bypass/i.test(item) ? 'High' : 'Medium',
      likelihood: 'Medium',
      fix: 'Attach AI owner, data-class evidence, model route, retrieval evidence, eval suite, fallback, telemetry, and FinOps validation before approval.',
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
  AI_KNOWLEDGE_DOCS,
  retrieveAiKnowledge,
};
