const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeModelReview, runSpecialistModel } = require('../llmClient');

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

async function runAiAgent({ query, context, state, retrievedContext, useModel }) {
  const signals = getRetailSignals({ query, context, state });
  const scenarioText = [query, JSON.stringify(context || {}), JSON.stringify(state || {})].join(' ');
  const hasRag = /rag|retrieval|knowledge base|corpus|document|vector/i.test(scenarioText);
  const hasTools = /tool|api call|order lookup|refund|return|loyalty|agent/i.test(scenarioText);
  const hasLocal = /local model|ollama|fine.?tune|private model|self-host/i.test(scenarioText);
  const hasPayments = signals.payments || /payment|pci|pan|psp|token/i.test(scenarioText);

  const findings = [
    'Define AI use case, model route, RAG corpus, vector/embedding strategy, tool/API access, safety evals, fallback, privacy/residency controls, and token budget before treating AI architecture as client-ready.',
    'Carry Storage data-domain and API tool-boundary output into AI so models do not bypass source-of-truth ownership or scoped APIs.',
    'Carry Security, Compliance, Governance, Infrastructure, Technology, Storage, API, and FinOps handoffs into AI decisions: data class, residency, tool scopes, telemetry, cost, rollout, and approval evidence.',
    'Keep AI evidence status explicit: verified, partial, assumption, missing, stale, or blocked for human validation.',
  ];
  if (hasRag) findings.push('RAG must use approved, classified, rebuildable corpora with metadata filters, citations, freshness controls, deletion propagation, and retrieval evals.');
  if (hasTools) findings.push('AI tool calls must use bounded APIs with read/write separation, scopes, approval gates for sensitive actions, audit trails, rate limits, fallback, and human escalation.');
  if (hasLocal) findings.push('Local/private models can reduce external API dependency later, but must be validated for quality, latency, hosting cost, security, and operations before replacing GPT/frontier judgement.');
  if (hasPayments) findings.push('Payment-sensitive data must be excluded or tokenized before prompts, completions, embeddings, vector stores, eval traces, logs, and provider telemetry unless PCI/security owners approve scope.');

  const aiUseCaseMatrix = [
    { use_case: 'Customer/support assistant', model_route: 'GPT/frontier or approved private model with RAG grounding and human escalation', data_boundary: 'No raw payment data; classify customer/support content', evidence_status: 'assumption' },
    { use_case: 'Recommendation/personalization', model_route: 'Recommendation model or LLM-assisted enrichment behind fallback', data_boundary: 'Customer/loyalty profile constraints and consent controls', evidence_status: 'assumption' },
    { use_case: 'Architecture/specialist judgement', model_route: 'GPT/frontier model for high-quality synthesis; deterministic fallback when unavailable', data_boundary: 'Architectural context and redacted customer evidence', evidence_status: 'assumption' },
    { use_case: 'Internal agent tool use', model_route: 'Scoped agent/tool runtime with audited API access', data_boundary: 'API contracts and storage source-of-truth boundaries', evidence_status: 'assumption' },
  ];

  const risks = [
    risk('AI can bypass API/domain ownership if tool calls directly mutate business state or access databases without scoped contracts.', 'High', 'Medium', 'Use bounded APIs, least-privilege scopes, approval gates, audit trails, and human escalation.'),
    risk('Prompts, embeddings, vector stores, eval traces, and provider telemetry can create hidden regulated-data copies.', 'High', 'Medium', 'Map every AI data copy to data class, residency, retention, deletion, redaction, and processor evidence.'),
    risk('GPT/frontier usage can dominate cost if routing, caching, retrieval caps, token budgets, and trace retention are not controlled.', 'High', 'Medium', 'Use model routing, prompt caching, retrieval limits, budget alerts, and FinOps validation.'),
  ];

  const validationNeeded = [
    'Confirm AI use cases, allowed/denied actions, model providers, model routing, local/private model plan, fallback, latency target, and quality thresholds.',
    'Confirm RAG corpus owners, data classes, chunking, metadata filters, vector DB, embedding model, reranking need, deletion propagation, freshness, and rebuild evidence.',
    'Confirm API tool scopes, read/write separation, approval gates, audit fields, rate limits, rollback, and human escalation.',
    'Confirm prompt/completion/embedding/vector/eval/log/provider telemetry residency, retention, redaction, support access, and processor evidence.',
    'Confirm token budget, request volume, cache hit rate, retrieval/rerank volume, eval trace retention, alerts, and FinOps guardrails.',
  ];

  const retrievalRequests = [
    'retail-rag-retrieval-template',
    'retail-model-routing-template',
    'retail-vector-embedding-rerank-template',
    'retail-ai-tool-api-template',
    'retail-ai-safety-eval-template',
    'retail-ai-privacy-residency-template',
    'retail-ai-cost-operations-template',
  ];

  const base = {
    agentId: 'ai',
    title: 'AI AI Agent',
    status: 'completed',
    summary: 'AI review aligned to ArchitectIQ Retail: RAG, model routing, vector/embedding/rerank, tool/API access, safety evals, fallback, privacy/residency, observability, and FinOps token controls.',
    retail_workload: signals.workloadTypes,
    findings,
    ai_recommendation: findings,
    ai_use_case_matrix: aiUseCaseMatrix,
    rag_architecture: {
      recommendation: 'RAG-ready architecture using approved corpus, chunking, metadata filters, citations, freshness checks, vector index rebuild, and deletion propagation.',
      evidence_status: hasRag ? 'assumption' : 'conditional',
    },
    model_routing_strategy: {
      recommendation: hasLocal
        ? 'Use GPT/frontier for MVP final judgement while preparing validated local/private model routes for lower-risk specialist tasks later.'
        : 'Use GPT/frontier for high-quality synthesis with deterministic fallback and future local/private model option after eval evidence.',
      evidence_status: 'assumption',
    },
    vector_embedding_strategy: {
      recommendation: 'Vector DB and embeddings are derived classified storage with metadata filters, deletion propagation, query limits, optional reranking, and retrieval evals.',
      evidence_status: hasRag ? 'assumption' : 'conditional',
    },
    ai_tool_api_controls: [
      'Use scoped APIs rather than direct database access.',
      'Separate read-only tools from sensitive/write tools.',
      'Require approval gates, audit trails, rate limits, fallback, and human escalation for sensitive actions.',
    ],
    ai_safety_evaluation: [
      'Define eval suite for groundedness, hallucination, policy, refund/return, inventory promise, prompt injection, privacy leakage, and tool-call correctness.',
      'Block release until eval thresholds, fallback routes, human escalation, and owner approval are validated.',
    ],
    ai_privacy_residency: [
      'Map prompts, completions, embeddings, vector stores, eval traces, logs, tool payloads, support bundles, and provider telemetry to data class, region, retention, and deletion controls.',
    ],
    ai_cost_operations: [
      'Track model calls, input/output tokens, cache hit rate, retrieval count, embedding ingestion/query volume, vector reads, reranker calls, eval traces, latency, errors, and budget alerts.',
    ],
    ai_evidence_status: {
      ai: 'assumption',
      rag: hasRag ? 'assumption' : 'conditional',
      model_routing: 'assumption',
      vector_embedding: hasRag ? 'assumption' : 'conditional',
      tool_api: hasTools ? 'assumption' : 'conditional',
      safety_eval: 'assumption',
      privacy_residency: 'assumption',
      cost_operations: 'assumption',
    },
    risks,
    validation_needed: validationNeeded,
    retrieval_requests: retrievalRequests,
    evidence: retailEvidence(retrievedContext),
    statePatch: {
      retail_workload: signals.workloadTypes,
      ai_controls: findings,
      ai_recommendation: findings,
      ai_use_case_matrix: aiUseCaseMatrix,
      rag_architecture: {
        recommendation: 'RAG-ready architecture using approved corpus, chunking, metadata filters, citations, freshness checks, vector index rebuild, and deletion propagation.',
        evidence_status: hasRag ? 'assumption' : 'conditional',
      },
      model_routing_strategy: {
        recommendation: hasLocal
          ? 'Use GPT/frontier for MVP final judgement while preparing validated local/private model routes for lower-risk specialist tasks later.'
          : 'Use GPT/frontier for high-quality synthesis with deterministic fallback and future local/private model option after eval evidence.',
        evidence_status: 'assumption',
      },
      vector_embedding_strategy: {
        recommendation: 'Vector DB and embeddings are derived classified storage with metadata filters, deletion propagation, query limits, optional reranking, and retrieval evals.',
        evidence_status: hasRag ? 'assumption' : 'conditional',
      },
      ai_tool_api_controls: [
        'Use scoped APIs rather than direct database access.',
        'Separate read-only tools from sensitive/write tools.',
        'Require approval gates, audit trails, rate limits, fallback, and human escalation for sensitive actions.',
      ],
      ai_safety_evaluation: [
        'Define eval suite for groundedness, hallucination, policy, refund/return, inventory promise, prompt injection, privacy leakage, and tool-call correctness.',
        'Block release until eval thresholds, fallback routes, human escalation, and owner approval are validated.',
      ],
      ai_privacy_residency: [
        'Map prompts, completions, embeddings, vector stores, eval traces, logs, tool payloads, support bundles, and provider telemetry to data class, region, retention, and deletion controls.',
      ],
      ai_cost_operations: [
        'Track model calls, input/output tokens, cache hit rate, retrieval count, embedding ingestion/query volume, vector reads, reranker calls, eval traces, latency, errors, and budget alerts.',
      ],
      ai_evidence_status: {
        ai: 'assumption',
        rag: hasRag ? 'assumption' : 'conditional',
        model_routing: 'assumption',
        vector_embedding: hasRag ? 'assumption' : 'conditional',
        tool_api: hasTools ? 'assumption' : 'conditional',
        safety_eval: 'assumption',
        privacy_residency: 'assumption',
        cost_operations: 'assumption',
      },
      risks,
      human_validation_needed: validationNeeded,
      validation_gaps: validationNeeded.map(item => `AI validation required: ${item}`),
      evidence_status: {
        ai: 'assumption',
      },
      retrieval_requests: retrievalRequests,
    },
  };

  if (!useModel) return base;

  try {
    const modelReview = await runSpecialistModel({
      agentId: 'ai',
      title: 'AI AI Agent',
      system: `You are the ArchitectIQ Retail AI Agent. Review AI architecture only: RAG, model routing, GPT/frontier/local/private model choices, embeddings, vector DB, reranking, tool/API access, safety evals, fallback, privacy/residency, observability, and token/cost controls. Carry Storage source-of-truth, API tool boundaries, Security, Compliance, Governance, Infrastructure, Technology, and FinOps constraints forward. Do not output internal agent-development commentary. Return concise JSON only.`,
      input: JSON.stringify({
        query,
        context,
        current_state: state,
        deterministic_ai_review: base,
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
        `AI model review failed and deterministic AI rules were used instead: ${err.message}`,
      ],
    };
  }
}

module.exports = { runAiAgent };
