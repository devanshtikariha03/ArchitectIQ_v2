const AI_EVAL_CASES = [
  {
    id: 'global-retail-ai-rag',
    name: 'Global retail AI RAG architecture',
    query: [
      'Global retail AI assistant with GPT 5.5 for MVP, future local Ollama/fine-tuned models, RAG over policies and product docs, Qdrant vector DB, embeddings, reranking, order lookup tool API, returns status, loyalty lookup, recommendation API, eval traces, prompt telemetry, privacy, residency, fallback, human escalation, and token budget controls.',
      'Need AI review for model routing, RAG, vector DB, embeddings, reranking, tools, safety evals, privacy/residency, and FinOps cost drivers.',
    ].join(' '),
    state: {
      agent_outputs: {
        security: { agentId: 'security' },
        compliance: { agentId: 'compliance' },
        governance: { agentId: 'governance' },
        infrastructure: { agentId: 'infrastructure' },
        technology: { agentId: 'technology' },
        storage: { agentId: 'storage' },
        api: { agentId: 'api' },
      },
    },
    mustMatch: [
      ['rag', /rag|retrieval|corpus|chunk|metadata|citation/i],
      ['model routing', /gpt|frontier|local|ollama|model routing|fallback/i],
      ['vector embedding', /qdrant|vector|embedding|rerank|metadata filters/i],
      ['tools', /tool|api|order lookup|scope|approval|audit/i],
      ['eval', /eval|hallucination|groundedness|prompt injection|fallback/i],
      ['privacy cost', /privacy|residency|telemetry|token|budget|finops/i],
      ['upstream', /storage|api|security|compliance|handoff/i],
      ['evidence pack', /rag_evidence_needed|model_evidence_needed|tool_evidence_needed|privacy_cost_evidence_needed|approval_workflow/i],
      ['qualification', /draft|not model approval|ai owner/i],
    ],
  },
  {
    id: 'model-routing-local-gpt',
    name: 'Model routing local and GPT',
    query: 'Use GPT 5.5 for MVP final judgement, deterministic fallback if model fails, and later use Ollama/local fine-tuned models for lower-risk extraction, classification, and drafting after evals prove quality.',
    mustMatch: [
      ['gpt route', /gpt|frontier|mvp|final judgement/i],
      ['local route', /ollama|local|fine|private/i],
      ['fallback', /deterministic|fallback/i],
      ['quality eval', /eval|quality|latency/i],
      ['cost', /token|cost|budget/i],
    ],
  },
  {
    id: 'rag-corpus-retrieval',
    name: 'RAG corpus retrieval',
    query: 'Retail RAG over customer policy documents, architecture docs, product docs, and support SOPs needs corpus owner, data classes, chunking, metadata filters, citations, freshness, deletion propagation, retrieval evals, and rebuild.',
    mustMatch: [
      ['corpus owner', /corpus owner|data class|approved/i],
      ['chunk metadata', /chunk|metadata|filters/i],
      ['citations freshness', /citation|freshness/i],
      ['deletion rebuild', /deletion propagation|rebuild/i],
      ['eval', /retrieval eval|eval/i],
    ],
  },
  {
    id: 'vector-embedding-rerank',
    name: 'Vector embedding rerank',
    query: 'AI uses embeddings, vector DB, pgvector or Qdrant, metadata filters, deletion process, reranker only if quality improves, query limits, vector reads, latency targets, and cost model.',
    mustMatch: [
      ['vector db', /vector db|pgvector|qdrant|vector/i],
      ['embedding', /embedding|dimensions|model/i],
      ['metadata deletion', /metadata|deletion/i],
      ['rerank', /rerank|quality/i],
      ['cost latency', /query|latency|cost/i],
    ],
  },
  {
    id: 'ai-tool-api-controls',
    name: 'AI tool API controls',
    query: 'AI agent can call order lookup, return status, loyalty lookup, recommendation API, and support escalation tools but must not directly refund, mutate orders, export customer data, or access databases without scoped API contracts and human approval.',
    mustMatch: [
      ['tool api', /tool|api|order lookup|loyalty|recommendation/i],
      ['denied actions', /refund|mutate|export|denied|blocked/i],
      ['scopes', /scope|least|read\/write|approval/i],
      ['audit escalation', /audit|human escalation|rate limit/i],
      ['no db bypass', /direct database|bounded api|api contracts/i],
    ],
  },
  {
    id: 'ai-privacy-residency',
    name: 'AI privacy residency',
    query: 'AI prompts, completions, embeddings, vector stores, eval traces, logs, tool payloads, support bundles, and provider telemetry must respect PII, PCI, DPDP/GDPR, residency, retention, deletion, redaction, support access, and processor evidence.',
    mustMatch: [
      ['ai copies', /prompts|completions|embeddings|vector|eval traces|provider telemetry/i],
      ['privacy', /pii|pci|privacy|dpdp|gdpr/i],
      ['residency retention', /residency|retention|deletion|redaction/i],
      ['support processor', /support access|processor evidence/i],
      ['evidence', /privacy_cost_evidence_needed|validation/i],
    ],
  },
  {
    id: 'ai-safety-eval-fallback',
    name: 'AI safety eval fallback',
    query: 'Retail chatbot needs evals for hallucination, groundedness, refund policy, returns policy, inventory promises, payment-adjacent questions, prompt injection, data leakage, unsafe tool calls, fallback, human escalation, and release gates.',
    mustMatch: [
      ['evals', /eval|hallucination|groundedness/i],
      ['retail cases', /refund|returns|inventory|payment/i],
      ['prompt leakage', /prompt injection|data leakage/i],
      ['tool safety', /unsafe tool|tool-call/i],
      ['fallback release', /fallback|human escalation|release gate/i],
    ],
  },
  {
    id: 'missing-ai-evidence',
    name: 'Missing AI evidence',
    query: 'Architecture asks for final AI stack but has no approved corpus, no model policy, no vector DB evidence, no embedding model, no eval suite, no tool scopes, no privacy review, no token budget, and no fallback.',
    mustMatch: [
      ['draft', /draft|not model approval|requires human validation/i],
      ['missing evidence', /corpus|model|vector|embedding|eval|tool scopes|privacy|token budget|fallback/i],
      ['validation gates', /ai_validation_gates|requires human validation/i],
      ['evidence pack', /approval_workflow|client_questions|rag_evidence_needed/i],
    ],
  },
];

function flattenOutput(output = {}) {
  return [
    output.summary,
    output.findings,
    output.ai_recommendation,
    output.ai_handoff_summary,
    output.ai_use_case_matrix,
    output.rag_architecture,
    output.model_routing_strategy,
    output.vector_embedding_strategy,
    output.ai_tool_api_controls,
    output.ai_safety_evaluation,
    output.ai_privacy_residency,
    output.ai_cost_operations,
    output.ai_evidence_status,
    output.ai_validation_gates,
    output.ai_qualification,
    output.ai_policy_citations,
    output.ai_evidence_pack,
    output.ai_signal_profile,
    output.risks,
    output.validation_needed,
    output.retrieval_requests,
    output.ai_tool_results,
    output.evidence,
    output.graph_agent,
  ].flat(8).map(item => {
    if (typeof item === 'string') return item;
    try {
      return JSON.stringify(item || '');
    } catch {
      return String(item || '');
    }
  }).join('\n');
}

function scoreAiOutput(output, testCase) {
  const text = flattenOutput(output);
  const checks = testCase.mustMatch.map(([label, pattern]) => ({ label, pass: pattern.test(text) }));
  checks.push(
    { label: 'v1 ai_recommendation field', pass: Array.isArray(output.ai_recommendation) && output.ai_recommendation.length > 0 },
    { label: 'v1 ai_use_case_matrix field', pass: Array.isArray(output.ai_use_case_matrix) && output.ai_use_case_matrix.length > 0 },
    { label: 'v1 rag_architecture field', pass: Boolean(output.rag_architecture?.recommendation) },
    { label: 'v1 model_routing_strategy field', pass: Boolean(output.model_routing_strategy?.primary_route || output.model_routing_strategy?.recommendation) },
    { label: 'v1 vector_embedding_strategy field', pass: Boolean(output.vector_embedding_strategy?.vector_db || output.vector_embedding_strategy?.recommendation) },
    { label: 'v1 ai_tool_api_controls field', pass: Array.isArray(output.ai_tool_api_controls) && output.ai_tool_api_controls.length > 0 },
    { label: 'v1 ai_safety_evaluation field', pass: Array.isArray(output.ai_safety_evaluation) && output.ai_safety_evaluation.length > 0 },
    { label: 'v1 ai_privacy_residency field', pass: Array.isArray(output.ai_privacy_residency) && output.ai_privacy_residency.length > 0 },
    { label: 'v1 ai_cost_operations field', pass: Array.isArray(output.ai_cost_operations) && output.ai_cost_operations.length > 0 },
    { label: 'v1 ai_evidence_status field', pass: Boolean(output.ai_evidence_status?.ai) },
    { label: 'v1 ai_validation_gates field', pass: Array.isArray(output.ai_validation_gates) && output.ai_validation_gates.length > 0 },
    { label: 'v1 ai_qualification field', pass: output.ai_qualification?.status === 'draft_requires_ai_owner_review' },
    { label: 'v1 ai_policy_citations field', pass: Array.isArray(output.ai_policy_citations) && output.ai_policy_citations.length > 0 },
    { label: 'v1 ai_evidence_pack field', pass: Array.isArray(output.ai_evidence_pack?.approval_workflow) && output.ai_evidence_pack.approval_workflow.length > 0 },
    { label: 'v1 ai_signal_profile field', pass: Array.isArray(output.ai_signal_profile?.domains) && output.ai_signal_profile.domains.length > 0 }
  );
  const passed = checks.filter(check => check.pass).length;
  return {
    case_id: testCase.id,
    name: testCase.name,
    passed,
    total: checks.length,
    score: checks.length ? Math.round((passed / checks.length) * 100) : 0,
    checks,
    graph_validation: output.graph_agent?.validation?.verdict || 'missing',
  };
}

module.exports = {
  AI_EVAL_CASES,
  scoreAiOutput,
};
