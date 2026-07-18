# UI Agent R&D Backlog

The current UI Agent is a strong MVP specialist reviewer. It is not yet a live design, analytics, or release-control platform.

## Near-Term Improvements

- Expand the UI knowledge base with detailed retail frontend patterns for SSR/SSG/CSR tradeoffs, mobile app/PWA constraints, checkout recovery, admin/support workflows, accessibility, localization, experimentation, and observability.
- Add more eval cases for marketplace seller portals, store-associate apps, returns kiosk flows, offline-lite mobile behavior, BOPIS/curbside pickup, customer account takeover recovery, and multi-brand design-system rollout.
- Add route-level output tables for journey, owner, API dependency, data class, cache rule, fallback state, SLO, telemetry, and release gate.
- Add clearer customer-facing recommended stack tables for React/Next.js/Vite/native/PWA/CDN/image/RUM/feature-flag choices once the final architecture synthesis layer is ready.

## Later R&D

- Add optional evidence upload support for screenshots, route maps, Storybook/component inventory exports, Lighthouse reports, RUM dashboards, accessibility reports, feature-flag exports, and release notes.
- Add controlled integrations only after customer trust exists: design-system inventory, analytics/RUM exports, feature-flag systems, CI accessibility/performance reports, and release pipeline metadata.
- Add automated comparison between approved UI journey map and supplied route/API evidence. This should work from uploaded/exported evidence first, not direct customer system connectors.
- Build a UI architecture diagram view that highlights storefront, mobile, checkout, account, admin/support, AI, CDN/edge, API dependencies, telemetry, and release controls.

## Explicit Limits

- Do not claim accessibility certification, security approval, production release approval, or design sign-off automatically.
- Keep customer-facing output focused on architecture recommendations, evidence needs, risks, and validation gates.
- Keep development diagnostics, graph traces, and internal scoring in logs or `development_diagnostics`, not the customer-facing app output.
