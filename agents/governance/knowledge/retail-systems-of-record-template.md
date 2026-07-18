# Retail Systems Of Record Template
ID: retail-systems-of-record-template
Version: 2026.07
Effective-Date: 2026-07-16
Review-By: 2027-07-16
Owner: Enterprise Architecture
Tags: system-of-record, source-of-truth, ownership, retail-domain

## Controls
- Assign systems of record for product, price, promotion, cart, checkout, order, payment token, customer, loyalty, consent, inventory, fulfilment, returns, and audit.
- For every domain, name owner, correction authority, replay owner, reconciliation owner, support-access owner, and audit evidence owner.

## Risks
- Retail incidents often come from unclear source of truth, duplicate writes, manual overrides, and reconciliation ambiguity.

## Validation Needed
- Confirm named human owner and source-of-truth system for every retail domain before final technology selection.

## Citations
- ArchitectIQ systems-of-record baseline: ownership must precede technology selection.
