# Retail AI Data Residency Review Template
ID: retail-ai-data-residency-review-template
Version: 2026.07
Effective-Date: 2026-07-16
Review-By: 2027-07-16
Owner: AI Governance And Privacy
Tags: ai, llm, rag, embedding, vector, telemetry, eval, automated-decision

## Controls
- Treat prompts, completions, moderation payloads, embeddings, vector metadata, retrieval snippets, eval traces, model telemetry, and provider support access as data-processing paths.
- Validate no-training/no-retention terms, residency, subprocessor list, deletion propagation, prompt redaction, human escalation, and automated-decision auditability.
- Require evidence for which customer, support, order, payment-adjacent, policy, and architecture data enters model or retrieval paths.

## Risks
- AI/RAG can create new regulated processors and derived data stores that are missed by standard application data maps.

## Validation Needed
- Confirm model provider, embedding provider, vector DB, region, retention, deletion, support access, telemetry, eval retention, and human escalation rules.

## Citations
- ArchitectIQ AI compliance baseline: prompts, embeddings, vector stores, and eval traces need residency and retention review.
