# LLM RAG Agent Cost Model Template
ID: llm-rag-agent-cost-model-template
Version: 2026.07
Owner: ArchitectIQ FinOps Baseline
Effective-Date: 2026-07-17
Review-By: 2027-07-17
Tags: llm, rag, agent, tokens, embedding, vector, reranker

## Controls
- Model LLM/RAG cost by requests/day, agents per request, turns per request, input tokens, output tokens, context size, model route, prompt cache hit rate, retries, eval traces, and telemetry retention.
- Model retrieval cost by document ingestion volume, embedding dimensions, embedding refresh rate, vector count, vector DB storage, query rate, top-k reads, metadata filtering, reranker calls, and retention.
- Separate frontier model calls from cheaper specialist model calls and local/private model routes.
- Apply token caps, retrieval limits, prompt compression, response-size controls, cache policies, and budget guardrails before scaling agent workflows.
- Reserve GPT-class frontier calls for synthesis, high-risk judgement, or fallback paths when cheaper deterministic or specialist routes are sufficient.

## Risks
- Output tokens, traces, reranker calls, vector reads, and repeated multi-agent loops can dominate the bill.
- Local/private models can reduce API dependency but increase GPU hosting, evaluation, latency, model operations, and maintenance cost.
- Using the strongest model for every specialist step creates unnecessary cost and data-residency review burden.

## Validation Needed
- Confirm GPT/frontier usage share, cheaper model route, local/private model route, token caps, retrieval limits, cache hit rate, vector DB volume, reranker usage, eval retention, and fallback policy.
- Confirm whether customer data, logs, prompts, embeddings, and model telemetry may leave the approved environment.

## Citations
- ArchitectIQ AI FinOps requires token, embedding, vector, reranking, trace, and model-route drivers for agentic architectures.
