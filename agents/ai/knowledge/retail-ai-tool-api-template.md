# Retail AI Tool API Template
ID: retail-ai-tool-api-template
Tags: tool, api, agent, action
Version: 2026.07
Owner: ArchitectIQ AI Architecture
Effective-Date: 2026-07-18
Review-By: 2027-01-18

## Controls
- AI tool APIs must have scoped permissions, read/write separation, approval gates for sensitive actions, audit trails, rate limits, and fallback/human escalation.
- AI should not bypass API/domain ownership or directly access databases where governed APIs exist.

## Risks
- AI tools can bypass API/domain ownership and create unsafe customer-visible actions if scopes and approvals are unclear.

## Validation Needed
- Confirm tool list, API scopes, allowed actions, denied actions, approval gates, audit fields, rate limits, rollback, and human escalation.

## Citations
- ArchitectIQ AI baseline: AI tools must use bounded, auditable APIs.
