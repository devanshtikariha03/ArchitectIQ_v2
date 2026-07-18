# Retail Storage Data Platform Template
ID: retail-storage-data-platform-template
Tags: storage, database, cache, search, backup
Version: 2026.07
Owner: ArchitectIQ Technology Architecture
Effective-Date: 2026-07-17
Review-By: 2027-01-17

## Controls
- Assign systems of record and choose OLTP, cache, search, object storage, backup, and analytics stores by consistency, latency, recovery, and ownership requirements.
- Keep cache, search, analytics, and event streams subordinate to the domain source of truth unless an explicit ADR proves otherwise.

## Risks
- Using cache/search/event streams as transactional truth can create oversell, reconciliation, audit, and customer-impact failures.

## Validation Needed
- Confirm source of truth, consistency model, cache invalidation, search rebuild, backup/restore, retention, replication, and data owner for each domain.

## Citations
- ArchitectIQ technology baseline: storage choices must protect retail data truth and recovery evidence.
