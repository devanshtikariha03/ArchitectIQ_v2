# API Agent R&D Backlog

The MVP API Agent is a specialist API architecture reviewer. It is good enough to validate gateway, contracts, sync/async boundaries, integrations, idempotency/replay, reconciliation, and API observability before FinOps and final synthesis, but it is not a finished enterprise API platform authority.

## Knowledge Base Expansion

- Add deeper API gateway decision guides for AWS API Gateway, Kong, Apigee, Azure API Management, Cloudflare, NGINX, Envoy, service mesh ingress, and internal gateway patterns.
- Add detailed contract templates for OpenAPI, AsyncAPI, GraphQL, gRPC, webhook, EDI, partner APIs, and event schemas.
- Add retail domain API templates for checkout, order, payment, inventory, promotion, catalogue, loyalty, returns, fulfilment, support, marketplace, and store/POS APIs.
- Add idempotency, retry, DLQ, replay, reconciliation, outbox/inbox, saga, timeout, and compensation playbooks by workflow type.
- Add partner/B2B integration playbooks for PSP, ERP, WMS, OMS, TMS/carriers, suppliers, marketplaces, SaaS, and franchise systems.
- Add API security and observability playbooks for OAuth/OIDC/JWT/mTLS, scopes, payload validation, audit fields, trace correlation, redaction, SLOs, runbooks, and incident workflows.

## Specialist Integration

- Feed API output back into Technology final synthesis when Storage, API, AI, and UI agents are complete.
- Feed API contracts into the future AI Agent so AI tool calls use bounded, auditable, scoped APIs.
- Feed API channel and payload constraints into the future UI Agent so storefront/admin/POS behavior respects contracts and degraded modes.
- Add conflict detection between API sync/async choices and Storage consistency/source-of-truth output.
- Add conflict detection between API payload/log fields and Security/Compliance data classification or residency constraints.

## Evaluation Improvements

- Expand evals per API domain: checkout, payment, inventory, promotions, loyalty, returns, support, marketplace sellers, franchise stores, supplier feeds, and AI tool APIs.
- Add adversarial cases where the prompt requests direct DB writes from UI or AI tools, bypassing APIs and domain owners.
- Add ambiguous cases where the user asks for a final API design without contracts, traffic volume, partner SLAs, auth scopes, or source-of-truth evidence.
- Add scoring for false positives/false negatives in API signal routing.
- Add regression checks that customer-facing output never includes internal development commentary.

## Customer Evidence Model

- Keep live API management, gateway, or partner-system connectors out of MVP unless a customer explicitly approves them.
- First support customer-provided artifacts: API lists, OpenAPI/AsyncAPI files, partner interface docs, sequence diagrams, error catalogues, runbooks, and manually exported gateway metrics.
- Later, if customers request it, support optional read-only imports for API gateway exports, service catalogues, schema registries, event catalogues, and observability dashboards.

## Final Architecture Readiness

- API should eventually produce diagram-ready API/integration layers only after Storage, Security, Compliance, Infrastructure, Technology, Governance, and FinOps constraints are reconciled.
- Add accepted/rejected API alternatives with NFR, operational, security, compliance, and cost rationale.
- Add acceptance-test generation for contract compatibility, idempotency, replay, DLQ recovery, partner failure, rate limiting, auth, observability, and degraded mode.
