# Governance Agent R&D

Current level: strong MVP / enterprise-style advisory agent. It consumes Security and Compliance handoffs, produces ownership and governance gates, retrieves versioned governance policy packs, reports evidence status, and builds a governance evidence pack. It is not yet a full architecture-board workflow system of record.

Already included:

- LangGraph governance workflow.
- Security and Compliance handoff inspection.
- Governance signal confidence profile and error-mode notes.
- Systems-of-record ownership matrix.
- ADR/decision-record and approval-gate expectations.
- Integration replay/reconciliation governance.
- Rollout readiness, runbook, game-day, pilot, rollback, and go-live gates.
- Markdown governance policy ingestion with `Review-By` freshness.
- Customer governance policy folder.
- Governance evidence pack with policy sources, citations, approval workflow, client questions, owner evidence, decision evidence, rollout evidence, and limitations.
- Customer-facing qualification that output is a draft and not architecture-board approval, client-approved decision, or accepted-risk record.
- No-token eval suite covering 8 scenarios.

R&D needed:

- Expand the governance knowledge base beyond MVP baseline depth. Current markdown packs are useful routing/evidence anchors, but they are not detailed enterprise architecture governance standards yet.
- Add deeper governance playbooks for systems of record, ADRs, approval gates, architecture board workflow, accepted-risk governance, RACI/operating model, rollout readiness, runbooks, game days, dependency management, integration replay/reconciliation, FinOps gates, Security/Compliance handoff gates, AI governance, store-edge rollout, and post-go-live review.
- Add governance rule-level detail for each playbook: required artifacts, owner/approver model, decision authority, evidence required, approval status, expiry/review date, escalation path, exception handling, accepted-risk authority, and customer-facing wording.
- Add richer governance examples per domain: good ADR, weak ADR, missing owner, conflicting owners, rejected alternative, accepted risk, rollout gate, rollback trigger, go-live blocker, and architecture-board decision record.
- Add real architecture-board workflow: approve, reject, conditionally approve, request evidence, assign owner, due date, review date, decision history, and audit trail.
- Add ADR persistence: ADR creation, versioning, accepted risk authority, alternatives rejected, decision expiry/review date, and change history.
- Add RACI/operating-model generator with accountable/responsible/consulted/informed mapping for product, platform, security, compliance, operations, support, FinOps, and business owners.
- Add dependency and migration sequencing across Infrastructure, Technology, API, Storage, AI, UI, Security, Compliance, Governance, and FinOps outputs.
- Add risk-register integration: risk severity, likelihood, owner, mitigation, due date, residual risk, and accepted-risk approval.
- Add uploaded evidence review for customer governance packs, operating model docs, rollout plans, decision logs, and architecture-board minutes.
- Add larger adversarial evals for conflicting owners, stale decision records, missing accepted-risk authority, unsupported go-live pressure, and unowned rollback.

Enterprise done criteria:

- Every major recommendation has named owner, decision gate, evidence, and acceptance criteria.
- Governance can block architecture finalization when mandatory owners or rollout controls are missing.
- Governance output becomes the bridge between specialist agents and the final architecture board.
