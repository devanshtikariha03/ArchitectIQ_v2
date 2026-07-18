# Retail AI Technology Template
ID: retail-ai-technology-template
Tags: ai, rag, llm, vector, embedding
Version: 2026.07
Owner: ArchitectIQ Technology Architecture
Effective-Date: 2026-07-17
Review-By: 2027-01-17

## Controls
- Design AI/RAG with model routing, retrieval boundaries, embedding/vector DB strategy, evaluation, fallback, privacy controls, and no hard dependency in checkout-critical paths.
- Separate GPT/frontier model judgement, private/local model routing, embeddings, vector DB, reranking, prompt telemetry, and human escalation choices.

## Risks
- AI technology can increase cost, privacy, residency, hallucination, and availability risk if it sits inline with critical commerce workflows.

## Validation Needed
- Confirm model/provider, prompt data classes, vector DB, embeddings, reranking, eval traces, fallback, human escalation, telemetry retention, and cost controls.

## Citations
- ArchitectIQ technology baseline: AI/RAG must be isolated, measurable, and cost-controlled.
