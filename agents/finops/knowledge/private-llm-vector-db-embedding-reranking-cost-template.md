# Private LLM Vector DB Embedding Reranking Cost Template
ID: private-llm-vector-db-embedding-reranking-cost-template
Version: 2026.07
Owner: ArchitectIQ FinOps Baseline
Effective-Date: 2026-07-17
Review-By: 2027-07-17
Tags: private-llm, vector-db, embedding, reranking, local-model

## Controls
- Compare API frontier models, cheaper API models, local/private model hosting, embeddings, vector DB, reranking, eval traces, monitoring, and support operations.
- For local/private models, include GPU/accelerator cost, autoscaling, model serving, patching, evaluation, prompt/model governance, failover, and operator support.
- For vector DBs, include vector count, dimensions, metadata filters, read/write rate, storage, backup, replication, latency target, HA, and operational ownership.
- Treat local models as a cost/security tradeoff, not automatically cheaper.

## Risks
- Private hosting can reduce external API dependency but increase fixed infrastructure and operations cost.
- Vector reads and reranker calls can creep up with agent loops and broad retrieval.
- A local model that produces weaker architecture judgement can increase review rework and human validation cost.

## Validation Needed
- Confirm model route, privacy requirements, GPU/hosting plan, vector count, dimensions, query rate, reranker rate, eval retention, fallback policy, and expected quality threshold.

## Citations
- ArchitectIQ private AI FinOps requires comparing API cost against hosting, operations, latency, quality, and governance cost.
