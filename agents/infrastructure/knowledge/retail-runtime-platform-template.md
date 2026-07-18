# Retail Runtime Platform Template
ID: retail-runtime-platform-template
Version: 2026.07
Owner: ArchitectIQ Infrastructure Baseline
Effective-Date: 2026-07-17
Review-By: 2027-07-17
Tags: runtime, kubernetes, containers, serverless, deployment

## Controls
- Choose runtime based on workload criticality, team capability, deployment frequency, isolation, autoscaling, release safety, and support ownership.
- Separate checkout/order/payment, browse/search, integration/replay, batch, analytics, and AI workloads using accounts/projects, node pools, namespaces, service accounts, or equivalent boundaries.
- Use serverless only where cold start, dependency limits, observability, networking, and transaction semantics are acceptable.
- Keep VM-based runtime for legacy workloads only when modernization is not feasible and operational guardrails exist.

## Risks
- Shared runtime capacity can allow browse, batch, or AI workloads to degrade checkout/order/payment reliability.
- Runtime decisions can fail operationally if team maturity, rollout model, rollback, and support ownership are not validated.

## Validation Needed
- Confirm cloud/on-prem preference, runtime skill set, release frequency, workload isolation needs, autoscaling limits, rollback mechanism, support model, and non-prod parity.

## Citations
- ArchitectIQ Infrastructure requires runtime selection to match NFRs, workload criticality, and operating model.
