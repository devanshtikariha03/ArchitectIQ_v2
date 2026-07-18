# Retail FinOps Unit Driver Playbook
ID: retail-finops-unit-driver-playbook
Version: 2026.07
Owner: ArchitectIQ FinOps Baseline
Effective-Date: 2026-07-17
Review-By: 2027-07-17
Tags: unit-drivers, retail, traffic, peak, budget

## Controls
- Every budget recommendation must name the workload unit drivers before monthly cost is treated as credible.
- Required retail drivers include users, sessions, requests/day, checkout attempts, orders/day, events/sec, queue depth, data growth, egress, IOPS, log GB/day, trace sampling, stores, POS lanes, support seats, rollout waves, and campaign peak multiplier.
- Separate steady-state, peak/campaign, degraded-mode, disaster-recovery, non-prod, and regional-expansion assumptions.
- Mark every driver as verified, partial, assumption, stale, missing, or not confirmed.
- Do not approve budget feasibility when upper-bound estimates exceed hard budget, when hard budget is missing, or when major drivers are assumption-level.

## Risks
- Average-day traffic can underfund retail campaign, flash-sale, checkout, payment, and fulfilment load.
- Estimates without drivers become sales guesses instead of reviewable architecture cost models.
- Store rollout cost can be dominated by field support, training, device lifecycle, and support desk load.

## Validation Needed
- Collect measured telemetry window, baseline, peak multiplier, customer growth forecast, region/store rollout plan, and owner approval for each unit driver.
- Confirm hard monthly budget, setup budget, currency, target margin, committed spend, support tier, and procurement constraints.

## Citations
- ArchitectIQ requires unit drivers before treating monthly retail architecture cost as budget-feasible.
