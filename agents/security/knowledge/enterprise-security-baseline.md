# Enterprise Security Baseline
ID: enterprise-security-baseline
Version: 2026.07
Effective-Date: 2026-07-13
Review-By: 2027-07-15
Owner: Security Architecture
Tags: enterprise, iam, secrets, kms, logging, incident, vendor, audit

## Controls
- Require named owners for IAM, PAM, secrets, KMS/HSM keys, certificates, audit review, SIEM alerts, incident response, support access, and security exceptions.
- Require MFA or passwordless authentication for workforce/admin access, workload identity for services, and step-up verification for refunds, account recovery, loyalty changes, and privileged admin actions.
- Store credentials in approved secrets management, rotate secrets and certificates on a defined lifecycle, and log break-glass access with post-event review.
- Export security events to SIEM with redaction, immutable retention for audit evidence, alert ownership, incident severity mapping, and runbook links.
- Require vendor security review for SaaS, PSP, LLM/model, embedding, vector DB, CRM/helpdesk, observability, analytics, and logistics providers.

## Risks
- Enterprise security review can fail if access, key ownership, audit evidence, support access, and vendor boundaries are treated as implementation details instead of architecture decisions.
- Missing SIEM ownership and incident runbooks can turn a contained event into an unmanaged breach response.

## Validation Needed
- Confirm IAM, PAM, secrets, key, certificate, SIEM, incident, support-access, and security-exception owners.
- Confirm alert routing, incident severity model, security evidence retention, and break-glass review workflow.
- Confirm third-party security review status, DPA/security terms, support access, subprocessor list, telemetry region, and incident notification SLA.

## Compliance Mappings
- SOC 2 CC6/CC7: logical access, system operations, change monitoring, and incident response evidence.
- ISO 27001 Annex A: access control, cryptography, supplier relationships, logging, monitoring, and incident management.

## Citations
- Enterprise baseline requires owner-backed controls for IAM, secrets, keys, certificates, SIEM, incident response, support access, and third-party security boundaries.
