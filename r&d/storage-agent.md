# Storage Agent R&D Backlog

The MVP Storage Agent is a specialist storage architecture reviewer. It is good enough to validate source-of-truth, storage platform, cache/search, backup/retention, and migration evidence before FinOps and final architecture synthesis, but it is not a finished enterprise data-platform authority.

## Knowledge Base Expansion

- Add deeper decision guides for PostgreSQL, MySQL, Oracle, SQL Server, DynamoDB/Cosmos/Firestore, Redis, OpenSearch/Elasticsearch, object storage, data warehouses, event stores, and vector databases.
- Add domain-specific source-of-truth templates for order, payment metadata, inventory, product/catalog, price/promotion, customer/loyalty, fulfilment, returns, audit, and AI knowledge stores.
- Add consistency and transaction templates for reservation, idempotency, locking, outbox, saga, replay, reconciliation, and rollback.
- Add backup/retention templates for privacy deletion, DSAR/erasure, legal hold, immutable backups, archive, restore testing, and multi-region replication.
- Add cache/search anti-patterns: cache-as-truth, search-as-truth, stale price/promotion, inventory freshness drift, hot-key collapse, and rebuild gaps.

## Specialist Integration

- Feed Storage output into the future API Agent so service contracts respect source-of-truth and consistency boundaries.
- Feed Storage output into the future AI Agent so RAG/vector/embedding stores inherit data classes, retention, deletion, and residency constraints.
- Feed Storage output into the future UI Agent so storefront/POS/admin behavior respects stale-read, offline, search, and consistency constraints.
- After API, AI, and UI agents exist, add conflict detection across service boundaries, data truth, AI corpora, offline UI, and storage NFRs.

## Evaluation Improvements

- Expand eval cases per storage domain: payment ledger, inventory reservation, promotions, loyalty, returns, support attachments, marketplace sellers, franchise stores, and B2B supplier feeds.
- Add adversarial cases where the prompt suggests using Redis/search/vector DB as the primary source of truth.
- Add migration-specific evals for cutover, rollback, CDC, dual-write avoidance, backfill, and reconciliation.
- Add retention/deletion evals for privacy regulations, legal hold exceptions, and backup deletion limits.

## Customer Evidence Model

- Keep live database/cloud connectors out of MVP unless a customer explicitly approves them.
- First support customer-provided artifacts: architecture diagrams, database inventories, schema summaries, backup policies, retention schedules, data classification sheets, and exported usage metrics.
- Later, if customers request it, support optional read-only imports for database inventories, backup reports, object-store inventories, search index metadata, and observability/storage metrics.

## Final Architecture Readiness

- Storage should eventually produce diagram-ready data-store layers only after API, AI, UI, Security, Compliance, Infrastructure, Governance, and FinOps constraints are reconciled.
- Add accepted/rejected storage alternatives with NFR, operational, security, compliance, and cost rationale.
- Add acceptance-test generation for restore, failover, replay, cache invalidation, search rebuild, migration, and deletion propagation.
