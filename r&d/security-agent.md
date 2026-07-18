# Security Agent R&D

Current level: strong MVP / enterprise-style advisory agent. It is not yet a full enterprise security platform because it does not inspect live infrastructure, CI/CD, IAM, SIEM, or customer policy systems.

Already included:

- LangGraph security workflow.
- Retail data classification.
- PCI/payment boundary checks.
- AI/RAG/tooling security checks.
- Trust boundary and diagram annotation requirements.
- Local security knowledge retrieval from markdown policy packs.
- Enterprise control map, threat model, compliance map, evidence pack, citations.
- Signal confidence profile and false-positive/false-negative notes.
- Policy freshness metadata with `Review-By`.
- Customer-facing compliance qualification.
- No-token eval suite covering 13 scenarios.

R&D needed:

- Expand the security knowledge base beyond MVP baseline depth. Current markdown packs are useful routing/evidence anchors, but they are not detailed enterprise standards yet.
- Add deeper security playbooks for IAM/PAM, secrets/key management, network segmentation, WAF/bot controls, SIEM/logging, DLP/redaction, incident response, vulnerability management, third-party risk, support access, store-edge/POS security, warehouse/device security, payment security, retail fraud/abuse, B2B ingestion, AI/RAG security, and data classification.
- Add control-level detail for each security playbook: mandatory controls, anti-patterns, architecture decision rules, evidence required, owner, severity, exceptions, accepted-risk authority, validation tests, and customer-facing explanation.
- Add richer security examples per domain: good design, rejected design, common failure modes, questions to ask the client, and diagram annotation requirements.
- Add semantic RAG with vector search over security standards, customer policies, architecture docs, ADRs, threat models, cloud controls, and previous reviews.
- Add customer policy pack governance: approval workflow, policy owners, version history, expiry, superseded policy handling, and source citations.
- Add evidence ingestion without live cloud access first: uploaded architecture diagrams, Terraform snippets, exported IaC plans, cloud screenshots, IAM summaries, network diagrams, security policies, SOC 2/ISO summaries, data-flow diagrams, and compliance requirements.
- Treat live read-only connectors as a later enterprise feature only after customer trust, access controls, audit logs, contracts, and ArchitectIQ security/compliance posture are mature.
- Add offline drift review first: compare the approved architecture graph against customer-uploaded IaC plans, Terraform snippets, cloud config exports, IAM summaries, network diagrams, screenshots, and security evidence. Flag possible public storage, expanded IAM, disabled logging, weak network rules, non-approved regions, and changed key-policy assumptions.
- Treat real continuous drift detection through live cloud/IaC connectors as a later enterprise feature.
- Add deeper threat modeling: STRIDE, MITRE ATT&CK cloud mappings, OWASP ASVS/API/LLM, PCI threat classes, retail fraud abuse patterns, and supply-chain ingestion threats.
- Add control-framework mapping with stronger qualification: SOC 2, ISO 27001, PCI-DSS, GDPR, CCPA/CPRA, India DPDP, Australian Privacy Act, NIST CSF, CIS, CSA CCM.
- Add confidence scoring per finding, evidence status per control, and explicit assumptions.
- Add adversarial evals: vague inputs, conflicting constraints, hidden PCI scope, prompt injection in documents, malicious policy text, missing evidence, obsolete policy packs.
- Add red-team test cases for AI tool access, support impersonation, refund abuse, loyalty abuse, B2B payload tampering, and cross-region data leakage.
- Add production observability: trace every tool call, retrieved source, model route, validation decision, and output mutation.

Enterprise done criteria:

- Every high-risk finding cites policy/evidence.
- Every compliance claim is marked verified, partial, or assumption.
- Agent can compare desired architecture against customer-provided cloud/IaC evidence.
- Eval suite has broad simple, complex, ambiguous, adversarial, and regression cases.
- Human security owner can approve, reject, or override findings with audit history.
