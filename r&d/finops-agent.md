# FinOps Agent R&D

Current level: strong MVP advisory agent with LangGraph orchestration, upstream Security/Compliance/Governance handoff consumption, unit-driver modelling, AWS/Azure public pricing access, GCP billing-catalog support when a token exists, local FinOps knowledge retrieval, customer-facing evidence packs, validation gates, and no-token eval coverage. It is not yet a contract-grade pricing engine.

R&D needed:

- Deepen the FinOps knowledge base. Current markdown policies are MVP baselines; add richer enterprise playbooks for retail cloud economics, AI/RAG/token cost, vector DB cost, support/licensing, partner delivery, observability retention, marketplace/private offers, and cost-governance patterns.
- Add richer pricing connectors: marketplace/licensing APIs, support plans, CDN/observability/security tools, managed database pricing, vector DB pricing, LLM/API pricing, and provider service families not yet covered by the current AWS/Azure/GCP lookup path.
- Add contract and discount support: committed-use discounts, reserved instances, savings plans, enterprise agreements, credits, marketplace private offers, negotiated rates.
- Improve workload unit-driver estimation from architecture: users, requests/day, peak multiplier, transactions/sec, messages/sec, GB stored, GB egress, IOPS, log GB/day, trace sampling, vector count, embedding volume, LLM tokens, reranker calls.
- Add scenario modelling: MVP, expected, peak, enterprise, disaster recovery, non-prod parity, and regional expansion.
- Add AI cost router: GPT-5.5/frontier model, cheaper model, local model, embedding, reranking, vector DB, eval traces, cache hit rate, prompt compression, and fallback split.
- Add budget guardrails: monthly cap, alert thresholds, per-agent token budgets, per-customer budgets, queue/circuit breaker, degraded model route.
- Expand evidence statuses and scoring: live price verified, partial, assumed, stale, contract-only, customer-redacted, unsupported, and contradictory.
- Expand eval cases for unrealistic traffic, private-offer discounts, multi-region cost, tax/currency handling, enterprise support plans, GPU/local-model hosting, multi-cloud failover, and impossible hard-budget constraints.

Enterprise done criteria:

- Every estimate names unit drivers and evidence status.
- Pricing is source-linked or explicitly marked assumption.
- FinOps can explain cheapest, best, and recommended options.
- FinOps consumes Security, Compliance, and Governance requirements before estimating cost.
