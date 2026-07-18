# Retail Fulfilment Integration Cost Driver Template
ID: retail-fulfilment-integration-cost-driver-template
Version: 2026.07
Owner: ArchitectIQ FinOps Baseline
Effective-Date: 2026-07-17
Review-By: 2027-07-17
Tags: fulfilment, integration, wms, erp, supplier, carrier

## Controls
- Model OMS, WMS, ERP, 3PL, supplier, carrier, EDI/SFTP, webhook, and file-feed integration cost separately from core application cost.
- Include adapter build, schema validation, malware scanning where file feeds exist, quarantine, exception queues, reconciliation, replay tooling, dashboards, and manual override operations.
- Include partner support windows, SLA mismatch handling, retries, DLQs, operational dashboards, and reconciliation cadence.

## Risks
- Integration and manual exception cost can exceed cloud infrastructure cost in complex retail supply-chain workflows.
- Supplier or carrier feed instability can increase queue, replay, support, and manual reconciliation cost.

## Validation Needed
- Confirm feed volume, carrier call volume, exception rate, reconciliation frequency, partner support, manual operation staffing, SLA expectations, and adapter ownership.

## Citations
- ArchitectIQ fulfilment FinOps treats integration volume and exception operations as first-class cost drivers.
