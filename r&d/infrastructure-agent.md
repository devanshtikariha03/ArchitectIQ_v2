# Infrastructure Agent R&D

Current level: strong MVP advisory agent with LangGraph orchestration, upstream Security/Compliance/Governance handoff consumption, runtime/platform modelling, network topology, HA/DR resilience, observability/operations, environment/release strategy, local infrastructure knowledge retrieval, customer-facing evidence packs, validation gates, and no-token eval coverage. It is not yet a cloud-provider implementation planner or IaC generator.

Scope:

- Cloud landing zone, network, runtime platform, regions, availability, DR, observability, deployment topology, secrets, service mesh, CI/CD, Terraform/IaC, and operational readiness.

R&D needed:

- Deepen the Infrastructure knowledge base. Current markdown policies are MVP baselines; add richer enterprise playbooks for AWS, Azure, GCP, hybrid, on-prem, Kubernetes, serverless, VM migration, networking, DR, observability, release engineering, and store-edge patterns.
- Add cloud/provider pattern library for AWS, Azure, GCP, hybrid, on-prem, and multi-cloud with service-family pros/cons, regional availability caveats, platform-team maturity requirements, and cost/NFR tradeoffs.
- Add reference architectures for retail commerce, store edge, warehouse, marketplace, AI/RAG, data platform, enterprise integration, and regulated retail.
- Improve NFR translator: availability, latency, RTO/RPO, throughput, peak multiplier, deployment frequency, compliance regions, operational maturity, support model, and provider quota limits.
- Add deeper DR/resilience planner: active-active, active-passive, backup/restore, multi-AZ, multi-region, queue buffering, graceful degradation, dependency quotas, chaos/game-day requirements, and evidence scoring.
- Add IaC output planner for future R&D: Terraform module map, environment strategy, state management, policy-as-code, config promotion, secrets handling, and drift review from exported design evidence. Keep this optional and customer-consented; do not require live cloud connectors in early MVP.
- Add provider-specific eval cases for regional outage, WAN outage, hybrid ERP integration, Kubernetes control-plane failure, provider quota exhaustion, failed rollout rollback, and expensive observability retention.

Enterprise done criteria:

- Infrastructure choices are tied to NFRs, operational maturity, security, compliance, and FinOps constraints.
- Agent produces implementation-ready platform recommendations, not generic cloud text.
