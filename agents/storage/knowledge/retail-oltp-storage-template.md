# Retail OLTP Storage Template
ID: retail-oltp-storage-template
Tags: oltp, database, transaction, consistency
Version: 2026.07
Owner: ArchitectIQ Storage Architecture
Effective-Date: 2026-07-17
Review-By: 2027-01-17

## Controls
- Use strongly consistent transactional storage for order commit, payment metadata ledger, inventory reservation authority, promotion ledger, and audit-critical state transitions.
- Define transaction boundaries, idempotency, locking, schema ownership, migration strategy, restore targets, and rollback plans.

## Risks
- Using cache, search, or event streams as transactional truth can create oversell, double-charge, stale promise, and reconciliation failures.

## Validation Needed
- Confirm transaction boundaries, isolation/locking/idempotency rules, schema ownership, migration strategy, RTO/RPO, and restore evidence.

## Citations
- ArchitectIQ storage baseline: revenue-critical writes require durable transactional authority.
