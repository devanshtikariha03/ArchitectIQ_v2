# Retail HA DR Resilience Template
ID: retail-ha-dr-resilience-template
Version: 2026.07
Owner: ArchitectIQ Infrastructure Baseline
Effective-Date: 2026-07-17
Review-By: 2027-07-17
Tags: ha, dr, resilience, rto, rpo

## Controls
- Define RTO/RPO per retail path: browse/search, checkout/order/payment, inventory reservation, fulfilment, integration/replay, support, AI, and store edge where applicable.
- Choose active-active, active-passive, regional HA, or backup/restore based on business criticality, consistency, data residency, cost, and operations maturity.
- Validate failover, backup/restore, dependency degradation, queue backpressure, replay, and manual operations through tests and game days.
- Keep AI, analytics, personalisation, and batch outside checkout-critical availability paths unless safe fallback is proven.

## Risks
- HA/DR labels are not credible without RTO/RPO, failover ownership, restore testing, and dependency degradation evidence.
- Multi-region replication can violate data residency or create consistency risks if compliance and data ownership are not validated.

## Validation Needed
- Confirm RTO/RPO, regional posture, active-active/passive choice, backup/restore policy, failover runbooks, dependency limits, data residency, and game-day schedule.

## Citations
- ArchitectIQ Infrastructure treats HA/DR as evidence-backed recovery behavior, not a generic platform label.
