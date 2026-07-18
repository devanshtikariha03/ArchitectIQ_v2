# Data Observability Retention Cost Template
ID: data-observability-retention-cost-template
Version: 2026.07
Owner: ArchitectIQ FinOps Baseline
Effective-Date: 2026-07-17
Review-By: 2027-07-17
Tags: data, observability, retention, logs, egress

## Controls
- Model data growth, backup retention, restore testing, log volume, trace sampling, metrics, SIEM export, audit evidence, analytics warehouse, egress, cross-region replication, and cold/archive tiers.
- Separate operational logs from security logs, audit evidence, application traces, analytics exports, and customer support evidence.
- Retention reductions must be approved by security, compliance, and operations owners.
- Include restore tests, replay dashboards, redaction, and audit evidence retrieval effort.

## Risks
- Logs, traces, audit retention, replication, and egress can become a major hidden cost.
- Aggressive retention cuts can break compliance evidence, incident investigation, or operational diagnosis.

## Validation Needed
- Confirm log GB/day, trace sampling, retention duration, SIEM export volume, backup policy, analytics export volume, egress, replication, restore-test cadence, and evidence retrieval SLA.

## Citations
- ArchitectIQ observability FinOps requires retention and evidence cost to be explicit.
