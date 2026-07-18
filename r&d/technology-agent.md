# Technology Agent R&D Backlog

The MVP Technology Agent is a specialist-handoff and provisional technology decision agent. It is good enough to route the architecture into API, Storage, AI, and UI validation, but it should not be treated as a finished enterprise technology design authority.

## Knowledge Base Expansion

- Build a deeper technology knowledge base for API gateway patterns, service mesh boundaries, event-driven architecture, contract versioning, schema registries, replay/reconciliation, third-party integration patterns, and strangler-modernization patterns.
- Build detailed storage decision guides for OLTP, cache, search, object storage, analytics, event stores, backups, replication, consistency, rebuild, retention, and domain ownership.
- Build detailed AI technology guides for RAG, model routing, local/private LLMs, embeddings, vector databases, reranking, evals, guardrails, prompt/data privacy, fallback, and cost control.
- Build detailed UI/channel guides for storefront, admin, support, associate mobile, POS, PWA/offline, accessibility, localization, performance budgets, feature flags, and telemetry.
- Add technology ADR templates with accepted option, rejected alternatives, NFR mapping, owner, evidence status, risks, cost drivers, and acceptance tests.

## Specialist Agent Integration

- Add the API Agent and make Technology consume its final service-contract, integration, eventing, and orchestration output.
- Add the Storage Agent and make Technology consume its source-of-truth, cache/search/read model, backup/restore, and retention output.
- Add the AI Agent and make Technology consume its RAG/model/vector/embedding/reranking/fallback/privacy/cost output.
- Add the UI Agent and make Technology consume its channel/persona/performance/accessibility/offline/release output.
- Add final Technology synthesis after all four specialist agents complete, including conflicts, accepted alternatives, rejected alternatives, and diagram-ready technology layers.

## Evaluation Improvements

- Expand evals from broad scenarios into dozens of edge cases per domain: API-only, storage-only, AI-heavy, UI-heavy, store-edge, marketplace, franchise, B2B, multi-region, and regulated retail.
- Add ambiguous/adversarial cases where the user asks for a final technology stack without enough evidence.
- Add scoring for false positives and false negatives in technology signal classification.
- Add regression checks that customer-facing output never includes internal development commentary.

## Customer Evidence Model

- Keep live customer connectors out of MVP unless a customer explicitly approves them.
- Use customer-provided architecture documents, policies, diagrams, CSV inventories, API lists, and manually exported evidence as the first enterprise evidence source.
- Later, if customers request it, support optional read-only imports for API catalogs, database inventories, architecture diagrams, observability exports, and IaC snapshots.

## Final Architecture Readiness

- Technology should eventually produce a diagram-ready technology layer only after API, Storage, AI, and UI specialist outputs are complete.
- Add conflict detection between specialist outputs, such as API synchronous path versus storage consistency, AI retrieval telemetry versus compliance residency, UI offline needs versus infrastructure topology, and FinOps constraints versus selected managed services.
- Add acceptance-test generation for each final technology decision.
