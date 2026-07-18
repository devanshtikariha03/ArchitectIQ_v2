# Privileged Operations Security Standard
ID: privileged-operations-security
Version: 2026.07
Effective-Date: 2026-07-13
Review-By: 2027-07-15
Owner: Business Operations Security
Tags: admin, backoffice, privileged, maker-checker, refund, promotion, price, support, audit

## Controls
- Apply step-up authentication, maker-checker approval, segregation of duties, threshold-based approval, and privileged session logging for high-risk business mutations.
- Treat price overrides, promotion setup, refund approvals, account recovery, manual order edits, loyalty adjustments, payment-status changes, inventory corrections, and support impersonation as privileged workflows.
- Emit immutable audit events for actor, approver, customer/order/entity, before/after values, business reason, ticket reference, source IP/device, and risk decision.
- Route privileged-operation alerts to SIEM with anomaly detection, access reviews, emergency-access workflow, and periodic audit sampling.

## Risks
- Backoffice speed during incidents can create fraud, revenue leakage, privacy breaches, or repudiation gaps if approvals and audit trails are weak.
- Support impersonation and manual adjustment tools can bypass customer-facing security controls.

## Validation Needed
- Confirm privileged workflow inventory, approval thresholds, maker-checker matrix, segregation-of-duties policy, audit event schema, SIEM routing, and session log retention.
- Confirm break-glass process, incident-mode exception rules, post-event review, access review evidence, and anomaly detection ownership.

## Compliance Mappings
- SOC 2 CC6/CC7: logical access, privileged access review, monitoring, audit logging, and incident response.
- ISO 27001 Annex A: access rights, privileged access management, logging, monitoring, and segregation of duties.

## Citations
- Privileged business mutations need step-up authentication, maker-checker approval, segregation of duties, immutable audit events, SIEM monitoring, and evidence-backed access review.
