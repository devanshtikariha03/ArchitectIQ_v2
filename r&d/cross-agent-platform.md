# Cross-Agent Platform R&D

This covers capabilities shared by all agents.

R&D needed:

- Shared RAG service: vector DB, embeddings, reranker, metadata ACLs, source citations, freshness, deletion propagation.
- Shared model router: GPT-5.5/frontier model, cheaper model, local model, deterministic fallback, token budget, retry, timeout, cache.
- Shared eval framework: golden cases, adversarial cases, regression cases, scoring, output schema checks, trace checks, cost checks.
- Shared evidence model: verified, partial, assumption, stale, contradictory, missing.
- Shared policy pack format: markdown/YAML metadata, owner, version, effective date, review-by, citations, approval status.
- Shared observability: trace IDs, tool calls, retrieved docs, model route, token usage, latency, validation results, fallback reason.
- Shared UI output contract: customer-facing output separate from development logs.
- Shared security controls: secret handling, prompt redaction, no raw customer data in logs, PII minimization, model provider policy.
- Shared persistence: agent run history, customer workspace, decision memory, output snapshots, approval workflow.
- Shared human-in-the-loop: approve, reject, comment, override, assign owner, due date, audit trail.

Enterprise done criteria:

- Every agent uses the same evidence, logging, model-routing, retrieval, eval, and approval patterns.
- Customer-facing output stays clean while development/debug details stay in internal traces and logs.
