# Retail AI Governance Gate Template
ID: retail-ai-governance-gate-template
Version: 2026.07
Effective-Date: 2026-07-16
Review-By: 2027-07-16
Owner: AI Governance
Tags: ai, llm, rag, tool, eval, fallback

## Controls
- AI governance must approve model/provider ADRs, retrieval sources, data handling, eval criteria, human escalation, fallback, telemetry, retention, and cost controls.
- AI tool access must have owner, scope, approval threshold, audit evidence, and rollback/fallback plan.

## Risks
- AI decisions can bypass architecture governance if model route, retrieval, tools, evals, and fallback are not owned.

## Validation Needed
- Confirm AI owner, model route, provider terms, retrieval-source approval, eval thresholds, fallback plan, and human escalation owner.

## Citations
- ArchitectIQ AI governance baseline: AI architecture requires separate decision and operating gates.
