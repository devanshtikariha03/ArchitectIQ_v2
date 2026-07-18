# Master AI Agent R&D

Current level: sequential orchestrator over Security -> Compliance -> Governance -> FinOps. It is not yet a full planning/reasoning loop.

Scope:

- Plan, execute, route, reconcile, and synthesize specialist agent outputs into a client-ready architecture recommendation.

R&D needed:

- Upgrade from fixed sequence to planner/router graph: understand request -> select agents -> run specialist agents -> detect conflicts -> ask follow-up questions if needed -> synthesize final recommendation.
- Add dependency-aware pipeline:
  - Security feeds Compliance.
  - Compliance feeds Governance.
  - Governance feeds FinOps.
  - Infrastructure and Technology agents feed each other.
  - API, Storage, AI, and UI agents feed the Technology parent.
- Add contradiction detector: conflicting regions, incompatible storage choices, budget mismatch, security/compliance conflict, unrealistic NFRs, missing owners.
- Add confidence model: per-agent confidence, evidence completeness, unresolved assumptions, model fallback state.
- Add customer-facing output composer: architecture recommendation table, rationale, cost, risks, validation needed, assumptions, next-step questions, and diagram-ready architecture state.
- Add agent memory: previous decisions, client policies, accepted constraints, rejected alternatives, reviewed architectures.
- Add eval suite for complete multi-agent outputs, not only individual agents.

Enterprise done criteria:

- Master Agent can explain why each specialist was used, what evidence each provided, what conflicts remain, and whether output is client-ready.
- Final output is coherent enough to drive architecture diagram generation.
