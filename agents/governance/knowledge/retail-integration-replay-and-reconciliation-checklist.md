# Retail Integration Replay And Reconciliation Checklist
ID: retail-integration-replay-and-reconciliation-checklist
Version: 2026.07
Effective-Date: 2026-07-16
Review-By: 2027-07-16
Owner: Integration Governance
Tags: integration, idempotency, retry, dlq, replay, reconciliation

## Controls
- Retail integrations require idempotency, retry limits, DLQs, replay tooling, duplicate handling, reconciliation reports, schema ownership, and manual correction process.
- Payment, inventory, order, fulfilment, returns, loyalty, and supplier events need explicit replay authority and audit evidence.

## Risks
- Uncontrolled retry/replay can duplicate orders, corrupt inventory, misstate refunds, or break fulfilment promises.

## Validation Needed
- Confirm integration owners, schema registry, retry policy, DLQ owner, replay procedure, reconciliation schedule, and manual correction approval.

## Citations
- ArchitectIQ integration governance baseline: replay and reconciliation must be owned and testable.
