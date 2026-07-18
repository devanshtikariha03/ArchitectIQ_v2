# PCI Privacy And Support Access Evidence Checklist
ID: pci-privacy-and-support-access-evidence-checklist
Version: 2026.07
Effective-Date: 2026-07-16
Review-By: 2027-07-16
Owner: Payment Compliance
Tags: pci, payment, pan, sad, qsa, support-access, token-vault

## Controls
- Validate PSP/token-vault/P2PE boundary, PAN/SAD exclusion, segmentation evidence, refund workflow, support-ticket filtering, and QSA/security-owner approval where PCI applies.
- Ensure PAN/SAD and payment-sensitive values are excluded from logs, traces, support transcripts, analytics exports, prompt payloads, eval datasets, and vector stores.
- Treat payment tokens and refund metadata as payment-adjacent data requiring access controls, retention rules, and support-access evidence.

## Risks
- PCI scope can expand through support access, refund tooling, logs, AI prompts, analytics exports, or vector stores even when raw PAN is not intentionally stored.

## Validation Needed
- Collect PSP AOC/attestation, QSA/security-owner signoff, segmentation evidence, token-vault ownership, refund data map, and PAN/SAD DLP test evidence.

## Citations
- ArchitectIQ PCI baseline: tokenization boundaries must be evidenced before PCI scope can be minimized.
