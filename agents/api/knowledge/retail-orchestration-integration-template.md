# Retail Orchestration Integration Template
ID: retail-orchestration-integration-template
Tags: orchestration, events, queue, workflow
Version: 2026.07
Owner: ArchitectIQ API Architecture
Effective-Date: 2026-07-17
Review-By: 2027-01-17

## Controls
- Separate synchronous customer-critical APIs from asynchronous fulfilment, integration, event, and batch workflows with clear orchestration ownership.
- Define timeouts, compensation, retries, backpressure, DLQs, replay, and degraded-mode behavior for each workflow.

## Risks
- Putting slow third-party calls or ambiguous workflows inline can degrade checkout, order, and customer support paths.

## Validation Needed
- Confirm sync/async boundaries, event backbone, queue policy, workflow owner, timeout, compensation, and degraded-mode behavior.

## Citations
- ArchitectIQ API baseline: retail orchestration must protect customer-critical paths.
