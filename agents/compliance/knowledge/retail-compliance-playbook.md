# Retail Compliance Playbook
ID: retail-compliance-playbook
Version: 2026.07
Effective-Date: 2026-07-16
Review-By: 2027-07-16
Owner: Compliance Architecture
Tags: retail, privacy, compliance, evidence, audit, support-access

## Controls
- Do not mark compliance, residency, processor, or retention status as verified unless source evidence is supplied and reviewed by the named owner.
- Separate compliance facts into verified, partial, assumption, stale, missing, and contradictory evidence states.
- Map customer, loyalty, support, payment-adjacent, order, fulfilment, audit, logs, prompts, embeddings, and exports to owners and obligations.

## Risks
- Architecture outputs can overclaim compliance when jurisdictions, processors, support access, and retention are not verified.
- Support and analytics tools can become hidden processors for regulated retail data.

## Validation Needed
- Confirm operating countries, customer regions, store regions, support regions, legal entities, and privacy owners.
- Confirm evidence status for every framework, processor, residency claim, retention rule, and support-access path.

## Citations
- ArchitectIQ compliance baseline: evidence-status discipline and human legal/privacy validation are mandatory.
