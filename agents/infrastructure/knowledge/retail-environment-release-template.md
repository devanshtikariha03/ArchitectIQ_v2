# Retail Environment Release Template
ID: retail-environment-release-template
Version: 2026.07
Owner: ArchitectIQ Infrastructure Baseline
Effective-Date: 2026-07-17
Review-By: 2027-07-17
Tags: environment, cicd, iac, release, rollback

## Controls
- Define development, integration, UAT, staging/pre-prod, production, DR, and performance-test environment strategy where applicable.
- Use IaC, CI/CD, approvals, secrets handling, config promotion, release windows, canary/blue-green, rollback, and evidence locations.
- Require non-prod parity for critical network, identity, integration, observability, deployment, and rollback behavior.
- Track drift review and change controls without requiring customers to connect live cloud accounts during early sales/MVP use.

## Risks
- Production risk rises when non-prod parity, rollback, environment ownership, and config promotion are unclear.
- Manual environment changes can invalidate architecture evidence and increase incident risk.

## Validation Needed
- Confirm environment count, non-prod parity, CI/CD ownership, IaC state, approval gates, rollback path, release windows, drift-review approach, and change controls.

## Citations
- ArchitectIQ Infrastructure treats environment and release strategy as architecture evidence, not implementation detail.
