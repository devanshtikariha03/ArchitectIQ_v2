# Retail API Gateway Edge Template
ID: retail-api-gateway-edge-template
Tags: api-gateway, edge, ingress, rate-limit
Version: 2026.07
Owner: ArchitectIQ API Architecture
Effective-Date: 2026-07-17
Review-By: 2027-01-17

## Controls
- Use API gateway/edge controls for routing, auth, rate limits, throttling, WAF/bot handoff, tenant/channel separation, and critical-path isolation.
- Separate browse/search traffic from checkout/order/payment origin pools where peak retail load can affect revenue-critical paths.

## Risks
- Shared ingress and uncontrolled API traffic can let browse spikes, bot abuse, or third-party retries degrade checkout/order/payment paths.

## Validation Needed
- Confirm gateway product, route ownership, auth model, rate limits, throttles, WAF/bot integration, origin isolation, and fallback behavior.

## Citations
- ArchitectIQ API baseline: retail API ingress must isolate revenue-critical paths.
