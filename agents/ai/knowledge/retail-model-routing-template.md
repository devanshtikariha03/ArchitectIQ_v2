# Retail Model Routing Template
ID: retail-model-routing-template
Tags: llm, model-routing, gpt, local-model
Version: 2026.07
Owner: ArchitectIQ AI Architecture
Effective-Date: 2026-07-18
Review-By: 2027-01-18

## Controls
- Use model routing by risk and cost: small/private models for low-risk drafting/classification where approved, GPT/frontier models for final judgement or complex synthesis, and deterministic fallback when models fail.
- Keep GPT/frontier usage bounded by token caps, caching, routing policy, prompt size controls, and evidence of quality need.

## Risks
- Using one frontier model for every step increases token cost, latency, and data exposure; using weak local models for final judgement can reduce quality.

## Validation Needed
- Confirm model provider, data handling, residency, token budget, fallback, quality evals, latency target, and future local/fine-tuned model plan.

## Citations
- ArchitectIQ AI baseline: model routing must balance quality, privacy, latency, and cost.
