# Customer Infrastructure Policy Packs

Place customer-approved infrastructure, platform, network, runtime, HA/DR, observability, environment, and release policies in this folder.

Each policy should use this structure:

```md
# Policy Title
ID: customer-infrastructure-policy-id
Version: 2026.07
Owner: Customer Platform Owner
Effective-Date: 2026-07-17
Review-By: 2027-07-17
Tags: runtime, network, resilience

## Controls
- Customer-approved infrastructure control.

## Risks
- Customer-specific infrastructure risk.

## Validation Needed
- Evidence required before the agent can mark this policy verified.

## Citations
- Short customer-approved citation text safe to show in output.
```

Do not put secrets, account IDs, network credentials, IP allowlists, private topology diagrams, or confidential contract details in this folder. Use redacted policy excerpts and mark sensitive evidence as customer validation required.
