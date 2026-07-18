# Regulated Retail Edge Template
ID: regulated-retail-edge-template
Version: 2026.07
Effective-Date: 2026-07-16
Review-By: 2027-07-16
Owner: Regulated Retail Compliance
Tags: health, pharmacy, financial, insurance, regulated, sector

## Controls
- Detect pharmacy, health, financial, insurance, credit, lending, prescription, and regulated sector signals before treating the workload as ordinary retail.
- Require sector-specific legal/compliance review where health, financial, prescription, or credit data is present.

## Risks
- Regulated retail edge cases can introduce obligations beyond generic privacy and PCI controls.

## Validation Needed
- Confirm whether HIPAA, GLBA, APRA/CPS 234, local health privacy, credit, insurance, or sector rules apply.

## Citations
- ArchitectIQ regulated-retail baseline: sector rules must be explicitly confirmed rather than inferred.
