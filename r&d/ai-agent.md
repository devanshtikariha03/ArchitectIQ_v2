# AI Agent R&D Backlog

The MVP AI Agent is a specialist AI architecture reviewer. It is good enough to validate RAG, model routing, vector/embedding/reranking, AI tool/API boundaries, evals, privacy/residency, fallback, and cost operations before FinOps and final synthesis, but it is not a finished enterprise AI platform authority.

## Knowledge Base Expansion

- Add deeper RAG guides for corpus governance, chunking, retrieval filtering, citations, freshness, deletion propagation, rebuild, multi-tenant retrieval, and evaluation.
- Add detailed model-routing guides for GPT/frontier models, local/private Ollama models, managed private endpoints, fine-tuned specialist models, deterministic fallbacks, and hybrid routing.
- Add vector DB guides for Qdrant, pgvector, Pinecone, Weaviate, Milvus/Zilliz, Chroma, metadata filters, backup/rebuild, and deletion propagation.
- Add embedding/reranking guides for model choice, dimensions, multilingual retail content, query expansion, retrieval quality, latency, and cost tradeoffs.
- Add AI tool/API playbooks for read-only tools, sensitive/write tools, approval gates, rollback, audit trails, scoped APIs, and human escalation.
- Add AI safety/eval packs for retail refund policy, returns, inventory promises, payment-adjacent questions, prompt injection, data leakage, unsafe tool calls, and hallucination.

## Specialist Integration

- Feed AI output back into Technology final synthesis when Storage, API, AI, and UI agents are complete.
- Feed AI tool needs back into API Agent for bounded tool contracts.
- Feed AI corpus/vector requirements back into Storage Agent for derived-store classification, retention, deletion, and rebuild.
- Feed AI customer/admin UI needs into the future UI Agent for assistant surfaces, escalation, feedback, explainability, and operational review.

## Evaluation Improvements

- Expand evals by AI use case: support assistant, architecture agent, recommendation, search enrichment, fraud triage, store associate assistant, admin copilot, and internal analyst assistant.
- Add adversarial cases: prompt injection, data exfiltration, unsafe refund/tool calls, raw payment data in prompts, cross-tenant retrieval, stale policy retrieval, and hallucinated compliance claims.
- Add scoring for false positives/false negatives in AI signal routing.
- Add regression checks that customer-facing output never includes internal development commentary.

## Customer Evidence Model

- Keep live model-provider, vector DB, and customer-data connectors out of MVP unless a customer explicitly approves them.
- First support customer-provided artifacts: AI policy, model/provider policy, corpus inventory, API/tool list, vector DB notes, eval cases, privacy review, token budget, and manually exported usage metrics.
- Later, if customers request it, support optional read-only imports for vector indexes, eval reports, prompt logs, model telemetry, and API tool catalogues.

## Final Architecture Readiness

- AI should eventually produce diagram-ready AI/RAG/model/tool layers only after Storage, API, Security, Compliance, Infrastructure, Technology, Governance, and FinOps constraints are reconciled.
- Add accepted/rejected AI alternatives with quality, privacy, latency, cost, residency, and operational rationale.
- Add acceptance-test generation for retrieval quality, groundedness, hallucination, prompt injection, tool-call safety, fallback, latency, privacy, deletion propagation, and budget guardrails.
