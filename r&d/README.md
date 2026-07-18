# ArchitectIQ Agent R&D Roadmap

This folder separates future R&D work from the current customer-facing MVP code.

Current status: the product is enterprise-style, not yet a complete enterprise platform. The implemented agents have LangGraph workflows, deterministic tools, optional model judgement, validation, and state handoff. Full enterprise level requires safer evidence ingestion, semantic RAG/vector retrieval, stronger evals, policy/version governance, and customer-provided architecture/infrastructure evidence. Live customer-environment connectors should be treated as a later enterprise feature, not an early R&D dependency.

Recommended build order:

1. Harden the existing pipeline: Security -> Compliance -> Governance -> FinOps.
2. Add Infrastructure Agent and Technology Agent.
3. Split Technology into API, Storage, AI, and UI specialist agents.
4. Upgrade Master Agent into a planner/router/synthesizer with agent memory and quality gates.
5. Add RAG/vector retrieval, customer policy packs, eval datasets, and production observability.

Agent R&D files:

- [Master AI Agent](master-ai-agent.md)
- [Security Agent](security-agent.md)
- [Compliance Agent](compliance-agent.md)
- [Governance Agent](governance-agent.md)
- [FinOps Agent](finops-agent.md)
- [Infrastructure Agent](infrastructure-agent.md)
- [Technology Agent](technology-agent.md)
- [API Agent](api-agent.md)
- [Storage Agent](storage-agent.md)
- [AI Agent](ai-agent.md)
- [UI Agent](ui-agent.md)
- [Cross-Agent Platform](cross-agent-platform.md)
