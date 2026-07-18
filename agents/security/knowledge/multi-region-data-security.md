# Multi Region Data Security Standard
ID: multi-region-data-security
Version: 2026.07
Effective-Date: 2026-07-13
Review-By: 2027-07-15
Owner: Privacy And Data Security
Tags: multi-region, residency, sovereignty, cross-border, privacy, logs, backups, support

## Controls
- Maintain a region-by-region data-flow map for application data, backups, logs, traces, prompt payloads, embeddings, vector stores, analytics exports, support access, and vendor telemetry.
- Enforce approved-region controls for customer, loyalty, support, payment-adjacent, operational, and audit data, including key-region ownership and cross-border transfer basis.
- Validate deletion, retention, DSAR/erasure, backup expiry, support access location, and processor/subprocessor data movement for every regulated region.
- Block unapproved replication, observability export, model telemetry, support bundle, and debug data movement across residency boundaries.

## Risks
- Residency review can fail even when primary databases are regional if logs, traces, backups, prompts, embeddings, exports, support access, or vendor telemetry leave the approved region.
- Key ownership and support access location can silently undermine customer-managed encryption and privacy commitments.

## Validation Needed
- Confirm operating countries, customer regions, store regions, approved cloud regions, key region, support access location, and cross-border transfer mechanism.
- Confirm residency handling for logs, traces, backups, prompts, embeddings, vector stores, analytics exports, support bundles, and incident/debug evidence.
- Confirm deletion and retention propagation across primary stores, derived stores, backups, logs, vector stores, model traces, and third-party processors.

## Compliance Mappings
- GDPR/UK GDPR: transfer mechanism, processor controls, deletion, minimisation, data subject rights, and accountability evidence.
- CCPA/CPRA: service provider controls, deletion, access, minimisation, and disclosure controls.
- India DPDP Act and Australian Privacy Act: notice, consent where applicable, processor controls, retention, breach response, and cross-border handling.

## Citations
- Multi-region security review must include derived telemetry, support access, backups, prompts, embeddings, vector stores, exports, and key-region ownership, not only primary databases.
