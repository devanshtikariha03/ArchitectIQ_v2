# Retail Service Level Pricing Evidence Checklist
ID: retail-service-level-pricing-evidence-checklist
Version: 2026.07
Owner: ArchitectIQ FinOps Baseline
Effective-Date: 2026-07-17
Review-By: 2027-07-17
Tags: pricing, sku, cloud, region, evidence

## Controls
- Keep pricing evidence marked verified, partial, assumption, stale, missing, or contract-only.
- Provider catalog prices are partial until exact SKU, region, usage, discounts, support plan, tax/currency, and commitments are validated.
- Monthly estimates must separate compute, storage, network, observability, security, LLM/API, embeddings, vector DB, reranking, licensing, partner implementation, support, non-prod parity, disaster recovery, and contingency.
- Show cheapest, recommended, and conservative tiers only when the cheaper tier preserves mandatory controls and service levels.
- Do not claim live pricing when provider lookup failed, credentials are missing, or only generic service families are known.

## Risks
- Current-looking provider prices can still be wrong for a customer with negotiated discounts, private offers, support plans, or region-specific constraints.
- Service-family estimates can hide egress, replication, support, observability, and HA/DR cost.

## Validation Needed
- Collect official/current SKU evidence, region, support plan, usage, discounts, enterprise agreement, reserved/committed usage, marketplace/private offers, tax/currency treatment, and contract terms.
- Validate provider availability and service limits for the selected region and customer residency requirements.

## Citations
- ArchitectIQ treats provider catalog lookups as partial evidence until SKU, usage, contract, support, and commitment details are confirmed.
