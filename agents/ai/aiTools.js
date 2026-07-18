const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const { buildRetailText, getRetailSignals } = require('../retailContext');
const { retrieveAiKnowledge } = require('./aiKnowledgeBase');

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

function inspectAiHandoff(input = {}) {
  const state = input.state || {};
  const upstream = {
    security: Boolean(state.agent_outputs?.security || state.security_tool_context),
    compliance: Boolean(state.agent_outputs?.compliance || state.compliance_tool_context),
    governance: Boolean(state.agent_outputs?.governance || state.governance_tool_context),
    infrastructure: Boolean(state.agent_outputs?.infrastructure || state.infrastructure_tool_context),
    technology: Boolean(state.agent_outputs?.technology || state.technology_tool_context),
    storage: Boolean(state.agent_outputs?.storage || state.storage_tool_context),
    api: Boolean(state.agent_outputs?.api || state.api_tool_context),
    finops: Boolean(state.agent_outputs?.finops || state.finops_tool_context),
    storage_evidence_status: state.storage_evidence_status || {},
    api_evidence_status: state.api_evidence_status || {},
    security_evidence_status: state.security_evidence_pack?.evidence_status || state.evidence_status || {},
    validation_gaps: asArray(state.validation_gaps),
  };
  const controls = [
    'Carry upstream constraints into AI: storage source of truth, API tool boundaries, data classes, PCI/privacy, residency, model route, telemetry, evals, fallback, and cost drivers.',
    'AI remains draft until AI owner validates model route, RAG corpus, vector/embedding store, tool scopes, evals, privacy/residency, and FinOps evidence.',
  ];
  if (upstream.storage) controls.push('Apply Storage handoff to AI corpora, embeddings, vector stores, derived data, deletion propagation, retention, and rebuild path.');
  if (upstream.api) controls.push('Apply API handoff to AI tool calls, scopes, read/write separation, rate limits, audit trails, rollback, and human escalation.');
  if (upstream.security) controls.push('Apply Security handoff to prompt/tool data classes, sensitive data exclusion, secrets, audit logging, and privileged tool access.');
  if (upstream.compliance) controls.push('Apply Compliance handoff to prompt/completion/vector/eval/log residency, processor evidence, retention, deletion, and support access.');

  return {
    tool: 'inspectAiHandoffTool',
    upstream,
    controls,
    validation_needed: [
      'Confirm upstream Storage, API, Technology, Security, Compliance, Governance, and Infrastructure outputs are accepted as constraints before AI approval.',
      'Confirm unresolved validation gaps are assigned to AI, API, storage, security, compliance, platform, and FinOps owners.',
    ],
  };
}

function designRagArchitecture(input = {}) {
  const text = textFromInput(input);
  return {
    tool: 'designRagArchitectureTool',
    rag_architecture: {
      recommendation: 'Use approved classified knowledge corpus, chunking, metadata filters, citations, freshness checks, retrieval evals, deletion propagation, and rebuild path.',
      corpus_scope: /policy|docs|document|knowledge|rag|retrieval/.test(text) ? 'Explicit knowledge/RAG scope detected; corpus evidence required.' : 'Conditional until RAG corpus is confirmed.',
      evidence_status: /rag|retrieval|knowledge|document|corpus/.test(text) ? 'assumption' : 'conditional',
    },
    controls: [
      'RAG corpus must have owner, data class, freshness, metadata filters, citation policy, deletion propagation, and rebuild evidence.',
      'Do not retrieve cross-tenant, cross-region, stale, unauthorized, or payment-sensitive content.',
    ],
    validation_needed: [
      'Confirm corpus owner, data classes, chunking, metadata filters, freshness, citation policy, deletion propagation, and rebuild evidence.',
    ],
  };
}

function planModelRouting(input = {}) {
  const text = textFromInput(input);
  const localIntent = /local model|ollama|fine.?tune|self-host|private model/.test(text);
  return {
    tool: 'planModelRoutingTool',
    model_routing_strategy: {
      primary_route: 'GPT/frontier model for MVP final judgement and complex synthesis where quality matters.',
      controlled_routes: [
        'Deterministic rules for baseline/fallback output.',
        'Smaller/private/local models later for lower-risk classification, extraction, and drafting after eval evidence.',
        'Route high-risk or customer-facing synthesis to approved high-quality model until local/fine-tuned alternatives pass quality gates.',
      ],
      local_model_plan: localIntent ? 'Local/private model intent detected; validate quality, latency, hosting cost, GPU/ops, security, and residency before replacing GPT/frontier routes.' : 'Future local/private model route remains R&D until evaluated.',
      evidence_status: 'assumption',
    },
    controls: [
      'Model routing must be explicit by risk, data class, latency, quality, and cost.',
      'Do not replace GPT/frontier judgement with local models until evals show acceptable quality for that task.',
    ],
    validation_needed: [
      'Confirm model provider, data handling, residency, token budget, fallback, quality evals, latency target, and future local/fine-tuned model plan.',
    ],
  };
}

function designVectorEmbedding(input = {}) {
  const text = textFromInput(input);
  return {
    tool: 'designVectorEmbeddingTool',
    vector_embedding_strategy: {
      vector_db: /qdrant/.test(text) ? 'Qdrant candidate detected; validate hosting, filtering, latency, backup, deletion, and cost.' : /pgvector/.test(text) ? 'pgvector candidate detected; validate Postgres scale, indexes, backups, and query latency.' : 'Qdrant or pgvector remain default candidates until corpus size, latency, ops, and cost are validated.',
      embedding_model: 'Embedding model must match corpus language/domain, privacy requirements, cost, dimensions, and retrieval quality.',
      reranking: 'Use reranking only when retrieval evals show material quality improvement versus added latency and cost.',
      evidence_status: /vector|embedding|rerank/.test(text) ? 'assumption' : 'conditional',
    },
    controls: [
      'Vector DB and embeddings inherit source data classification, residency, retention, deletion, and rebuild requirements.',
      'Metadata filters must enforce tenant, region, data class, document type, freshness, and access boundaries.',
    ],
    validation_needed: [
      'Confirm vector DB, embedding model, dimensions, metadata schema, deletion process, reranker need, query volume, latency, and cost model.',
    ],
  };
}

function planAiToolAccess(input = {}) {
  const text = textFromInput(input);
  const toolDetected = /tool|api call|order lookup|refund|return|loyalty|agent/.test(text);
  return {
    tool: 'planAiToolAccessTool',
    ai_tool_api_controls: [
      'Use bounded API contracts, not direct database access.',
      'Separate read-only tools from sensitive/write tools.',
      'Define allowed actions, denied actions, scopes, rate limits, approval gates, audit fields, fallback, rollback, and human escalation.',
      'Block or require human approval for refunds, payment changes, loyalty adjustments, order mutation, customer-data export, and policy exceptions unless explicitly approved.',
    ],
    tool_scope_status: toolDetected ? 'assumption' : 'conditional',
    controls: [
      'AI tool use must preserve API/domain ownership and least-privilege access.',
    ],
    risks: [
      risk('AI tool calls can create unsafe customer-visible actions if read/write separation, approval gates, and audit trails are missing.', 'High', 'Medium', 'Use scoped APIs, approval gates, audit, rate limits, rollback, and human escalation.'),
    ],
    validation_needed: [
      'Confirm tool list, API scopes, allowed actions, denied actions, approval gates, audit fields, rate limits, rollback, and human escalation.',
    ],
  };
}

function planAiSafetyEval() {
  return {
    tool: 'planAiSafetyEvalTool',
    ai_safety_evaluation: [
      'Groundedness/citation evals for RAG answers.',
      'Hallucination and refusal evals for policy, refund, return, payment-adjacent, inventory promise, and compliance-sensitive answers.',
      'Tool-call correctness evals for order lookup, return status, loyalty, recommendation, and support workflows.',
      'Prompt injection and data leakage evals for retrieved content, tool outputs, and system/developer instruction boundaries.',
      'Fallback and human escalation tests for model outage, low confidence, retrieval miss, unsafe request, and critical workflow ambiguity.',
    ],
    controls: [
      'AI release must be gated by eval thresholds, regression tests, fallback behavior, and owner approval.',
    ],
    validation_needed: [
      'Confirm eval cases, pass thresholds, prompt/version ownership, safety tests, fallback, human escalation, and release approval.',
    ],
  };
}

function planAiPrivacyCostOps() {
  return {
    tool: 'planAiPrivacyCostOpsTool',
    ai_privacy_residency: [
      'Map prompts, completions, embeddings, vector stores, eval traces, logs, tool payloads, support bundles, and provider telemetry to data class, region, retention, and deletion controls.',
      'Redact or exclude raw payment data, secrets, unsupported sensitive data, and unnecessary customer identifiers before model calls and telemetry.',
    ],
    ai_cost_operations: [
      'Track model calls, input/output tokens, prompt cache hit rate, retrieval count, embedding ingestion/query volume, vector reads, reranker calls, eval traces, fallback use, latency, errors, and budget alerts.',
      'Apply routing policies, rate limits, token caps, retrieval caps, trace retention controls, and budget guardrails before production.',
    ],
    controls: [
      'AI privacy/residency and AI cost must be validated together because telemetry and eval traces can create both compliance and spend risk.',
    ],
    validation_needed: [
      'Confirm prompt data classes, provider telemetry, residency, retention, deletion, support access, redaction, processor evidence, token budget, request volume, retrieval/rerank volume, trace retention, alerts, and budget guardrails.',
    ],
  };
}

function retrieveAiKnowledgeForInput(input = {}) {
  return retrieveAiKnowledge({
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

function validateAiOutput(input = {}) {
  const output = input.output || {};
  const toolResults = asArray(input.toolResults);
  const text = [
    output.summary,
    output.findings,
    output.ai_recommendation,
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
    toolResults,
  ].flat(7).map(item => typeof item === 'string' ? item : JSON.stringify(item || '')).join('\n').toLowerCase();
  const blockers = [];
  const warnings = [];
  const improvements = [];
  const hasRag = /rag|retrieval|corpus|knowledge|chunk|metadata|citation|ground/.test(text);
  const hasModel = /model routing|gpt|frontier|local|private|fallback model|deterministic/.test(text);
  const hasVector = /vector|embedding|rerank|metadata filters|deletion propagation/.test(text);
  const hasTools = /tool|api|scope|read\/write|approval gate|audit|human escalation/.test(text);
  const hasEval = /eval|hallucination|groundedness|prompt injection|fallback|quality|regression/.test(text);
  const hasPrivacy = /prompt|completion|telemetry|privacy|residency|retention|deletion|redaction|processor/.test(text);
  const hasCost = /token|cache hit|retrieval count|embedding.*volume|reranker|budget|finops|latency/.test(text);
  const hasUpstream = /storage|source.?of.?truth|api|security|compliance|governance|infrastructure|technology|handoff/.test(text);
  const hasEvidencePack = /evidence_pack|policy_sources|approval_workflow|client_questions|rag_evidence_needed|model_evidence_needed|tool_evidence_needed|privacy_cost_evidence_needed/.test(text);
  const hasQualification = /draft|not.*approval|human validation|requires.*validation|ai owner/.test(text);
  const hasCitations = /citation|source_id|policy|baseline/.test(text);

  if (!hasRag) blockers.push('AI output does not define RAG/retrieval/corpus controls.');
  if (!hasModel) blockers.push('AI output does not define model routing/fallback strategy.');
  if (!hasVector) blockers.push('AI output does not define vector/embedding/reranking controls.');
  if (!hasTools) blockers.push('AI output does not define AI tool/API scope controls.');
  if (!hasEval) blockers.push('AI output does not define safety/eval/fallback controls.');
  if (!hasPrivacy) blockers.push('AI output does not define privacy/residency/telemetry controls.');
  if (!hasCost) blockers.push('AI output does not define AI token/cost/observability controls.');
  if (!hasUpstream) blockers.push('AI output does not consume upstream Storage/API/Security/Compliance/Governance/Infrastructure/Technology constraints.');
  if (!hasEvidencePack) blockers.push('AI output does not include customer-facing evidence pack with RAG/model/tool/privacy/cost evidence needs.');
  if (!hasQualification) blockers.push('AI output does not qualify recommendation as draft-level until AI owners validate evidence.');
  if (!hasCitations) warnings.push('AI output should include citations or source evidence.');
  if (!toolResults.length) blockers.push('AI tools did not produce handoff, RAG, model, vector, tool, eval, privacy/cost, retrieval, or validation evidence.');
  if (!output.model_review?.enabled) improvements.push('Run model judgement for customer-specific AI recommendations when an approved model is available.');

  return {
    tool: 'validateAiOutputTool',
    verdict: blockers.length ? 'fail' : warnings.length ? 'warn' : 'pass',
    blockers,
    warnings,
    improvements,
    required_controls: {
      rag: hasRag,
      model_routing: hasModel,
      vector_embedding: hasVector,
      tools: hasTools,
      evals: hasEval,
      privacy_residency: hasPrivacy,
      cost_operations: hasCost,
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

const aiTools = {
  inspectAiHandoffTool: tool(inspectAiHandoff, {
    name: 'inspectAiHandoffTool',
    description: 'Inspect upstream Storage, API, Technology, Security, Compliance, Governance, Infrastructure, and FinOps constraints before AI recommendations.',
    schema: toolInputSchema,
  }),
  designRagArchitectureTool: tool(designRagArchitecture, {
    name: 'designRagArchitectureTool',
    description: 'Design RAG corpus, retrieval, metadata, citation, freshness, and rebuild controls.',
    schema: toolInputSchema,
  }),
  planModelRoutingTool: tool(planModelRouting, {
    name: 'planModelRoutingTool',
    description: 'Plan GPT/frontier/local/private model routing, fallback, quality, latency, and cost controls.',
    schema: toolInputSchema,
  }),
  designVectorEmbeddingTool: tool(designVectorEmbedding, {
    name: 'designVectorEmbeddingTool',
    description: 'Design vector DB, embedding, metadata, reranking, deletion, and retrieval quality controls.',
    schema: toolInputSchema,
  }),
  planAiToolAccessTool: tool(planAiToolAccess, {
    name: 'planAiToolAccessTool',
    description: 'Plan scoped AI tool/API access, approval gates, audit, rate limits, fallback, and escalation.',
    schema: toolInputSchema,
  }),
  planAiSafetyEvalTool: tool(planAiSafetyEval, {
    name: 'planAiSafetyEvalTool',
    description: 'Plan AI safety, evaluation, fallback, quality gates, prompt injection, and release controls.',
    schema: toolInputSchema,
  }),
  planAiPrivacyCostOpsTool: tool(planAiPrivacyCostOps, {
    name: 'planAiPrivacyCostOpsTool',
    description: 'Plan AI privacy, residency, telemetry, token cost, observability, and budget controls.',
    schema: toolInputSchema,
  }),
  retrieveAiKnowledgeTool: tool(retrieveAiKnowledgeForInput, {
    name: 'retrieveAiKnowledgeTool',
    description: 'Retrieve local ArchitectIQ AI knowledge and customer policy packs.',
    schema: toolInputSchema,
  }),
  validateAiOutputTool: tool(validateAiOutput, {
    name: 'validateAiOutputTool',
    description: 'Validate AI output against RAG, model, vector, tool, eval, privacy, cost, handoff, and evidence controls.',
    schema: toolInputSchema,
  }),
};

module.exports = {
  aiTools,
  designRagArchitecture,
  designVectorEmbedding,
  inspectAiHandoff,
  planAiPrivacyCostOps,
  planAiSafetyEval,
  planAiToolAccess,
  planModelRouting,
  retrieveAiKnowledgeForInput,
  validateAiOutput,
};
