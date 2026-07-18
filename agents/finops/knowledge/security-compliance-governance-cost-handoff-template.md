# Security Compliance Governance Cost Handoff Template
ID: security-compliance-governance-cost-handoff-template
Version: 2026.07
Owner: ArchitectIQ FinOps Baseline
Effective-Date: 2026-07-17
Review-By: 2027-07-17
Tags: security, compliance, governance, mandatory-controls

## Controls
- Price upstream Security, Compliance, and Governance controls as mandatory unless named owners approve a documented accepted-risk reduction.
- Security cost lines include KMS/HSM, secrets, WAF/bot, mTLS/service mesh, SIEM export, DLP/redaction, security operations, PAM, workload identity, and vulnerability management.
- Compliance cost lines include residency, processor evidence, retention/deletion, DSAR, audit exports, backup/log retention, privacy/legal validation, support-access controls, and QSA validation where PCI applies.
- Governance cost lines include ADR/review effort, owner approvals, runbooks, game days, acceptance tests, rollout waves, support handoff, and decision evidence.
- Optimised tiers must state which mandatory capability is preserved and what cost lever is used.

## Risks
- Cheaper options can silently weaken security, compliance, residency, auditability, rollout readiness, or governance evidence.
- FinOps estimates become misleading if upstream validation gaps are not translated into budget lines.

## Validation Needed
- Map Security controls, Compliance evidence needs, Governance gates, runbooks, review effort, and approval workflow into service-level cost lines.
- Confirm which upstream blockers are mandatory before client-ready budget approval.

## Citations
- ArchitectIQ pipeline baseline: Security, Compliance, and Governance outputs become FinOps cost drivers.
