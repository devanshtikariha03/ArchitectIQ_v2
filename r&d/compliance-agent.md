# Compliance Agent R&D

Current level: strong MVP / enterprise-style advisory agent. It consumes Security output, produces structured compliance/residency obligations, retrieves versioned compliance policy packs, reports evidence status, and builds a compliance evidence pack. It is not yet a legal/compliance evidence system of record.

Already included:

- LangGraph compliance workflow.
- Security handoff consumption.
- Compliance signal confidence profile and error-mode notes.
- Jurisdiction/framework detection.
- Processor/residency matrix.
- Retention/deletion/DSAR controls.
- Markdown compliance policy ingestion with `Review-By` freshness.
- Customer compliance policy folder.
- Compliance evidence pack with policy sources, citations, approvals, client questions, processor evidence, retention evidence, and limitations.
- Customer-facing qualification that output is not legal advice, certification, audit attestation, QSA sign-off, or confirmation of compliance.
- No-token eval suite covering 12 scenarios.

R&D needed:

- Expand the compliance knowledge base beyond MVP baseline depth. Current markdown packs are useful routing/evidence anchors, but they are not detailed legal/compliance standards yet.
- Add deeper compliance playbooks for PCI-DSS, GDPR/UK GDPR, CCPA/CPRA, India DPDP, Australian Privacy Act, SOC 2, ISO 27001, children/minor privacy, workforce privacy, marketplace/franchise data sharing, regulated retail, AI/model data processing, processor/subprocessor governance, support access, retention/deletion/DSAR, consent, and cross-border transfer.
- Add clause/control-level detail for each compliance playbook: applicability triggers, required evidence, owner, review authority, common false claims, exclusions, unresolved-assumption language, audit artifacts, and customer-facing validation questions.
- Add richer compliance examples per domain: valid evidence, weak evidence, missing evidence, conflicting evidence, accepted assumptions, and how the agent should phrase draft recommendations without overclaiming compliance.
- Add semantic RAG/vector retrieval over uploaded customer legal policies, DPAs, vendor contracts, privacy notices, processor lists, retention schedules, audit reports, and data maps.
- Add document extraction for uploaded PDFs, screenshots, spreadsheets, and architecture packs without requiring live customer cloud connectors.
- Expand framework packs with deeper clause-level mappings for PCI-DSS, GDPR, UK GDPR, CCPA/CPRA, India DPDP, Australian Privacy Act, SOC 2, ISO 27001, HIPAA where relevant, GLBA, APRA/CPS 234, and sector/client policies.
- Add richer contradiction detection for conflicting residency, support location, retention, deletion, and processor terms.
- Add legal/privacy review workflow: approve, reject, request evidence, assign owner, set due date, and audit decision history.
- Add larger adversarial evals for vague compliance claims, obsolete policies, conflicting policies, malicious uploaded policy text, and missing processor evidence.
- Add customer-specific evidence status transitions from assumption to partial to verified once approved evidence is attached.

Enterprise done criteria:

- Compliance output never claims verified compliance without evidence.
- Every obligation has jurisdiction, data class, system path, owner, evidence status, and validation action.
- Legal/privacy reviewers can approve or reject generated obligations.
- Compliance handoff can feed Governance and FinOps with residency, audit, retention, and support-access costs.
