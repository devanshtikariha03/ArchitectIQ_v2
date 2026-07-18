const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeModelReview, runSpecialistModel } = require('../llmClient');

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

async function runUiAgent({ query, context, state, retrievedContext, useModel }) {
  const signals = getRetailSignals({ query, context, state });
  const scenarioText = [query, JSON.stringify(context || {}), JSON.stringify(state || {})].join(' ');
  const hasCheckout = /checkout|cart|payment|order|promo|coupon|inventory/i.test(scenarioText);
  const hasAdmin = /admin|support|backoffice|associate|operator|bulk/i.test(scenarioText);
  const hasMobile = /mobile|pwa|ios|android|app/i.test(scenarioText);
  const hasAiUi = /chatbot|recommendation|personalization|ai|rag|llm/i.test(scenarioText);

  const findings = [
    'Define UI route ownership, channel architecture, API dependencies, fallback states, auth/session controls, design-system standards, accessibility, performance budgets, observability, release rings, and rollback gates before treating UI architecture as client-ready.',
    'Carry API, AI, Security, Compliance, Governance, Infrastructure, Technology, Storage, and FinOps handoffs into UI decisions: route dependencies, data class, consent, session, telemetry, performance, fallback, and cost evidence.',
    'Keep UI evidence status explicit: verified, partial, assumption, missing, stale, or blocked for human validation.',
  ];
  if (hasCheckout || signals.commerce) findings.push('Checkout, cart, payment, inventory promise, promotion validation, and order confirmation UI must be treated as critical revenue paths isolated from non-critical recommendation, chatbot, analytics, and browse/search degradation.');
  if (hasAdmin) findings.push('Admin/support UI must use least privilege, redaction, maker-checker approvals, audit trails, bulk-action safeguards, and reversible operation patterns.');
  if (hasMobile) findings.push('Mobile/PWA architecture must define offline-lite behavior, deep links, app-store release controls, push notification boundaries, and checkout handoff behavior.');
  if (hasAiUi || signals.retailAi) findings.push('AI-assisted UI must define recommendation/chatbot exposure, fallback, citations/grounding where needed, human escalation, consent-aware analytics, and unsafe-content/error states.');

  const uiChannelMatrix = [
    { channel: 'Storefront web', scope: 'browse, search, product detail, cart, checkout, account', owner: 'UI/product owner', evidence_status: 'assumption' },
    { channel: 'Mobile app/PWA', scope: 'navigation, deep links, push, checkout handoff, app-release controls', owner: 'Mobile/UI owner', evidence_status: hasMobile ? 'assumption' : 'conditional' },
    { channel: 'Admin/support UI', scope: 'privileged workflows, redaction, approval, audit, rollback', owner: 'Operations/support owner', evidence_status: hasAdmin ? 'assumption' : 'conditional' },
    { channel: 'AI-assisted UI', scope: 'chatbot, recommendations, personalization, escalation, fallback', owner: 'AI/product owner', evidence_status: hasAiUi || signals.retailAi ? 'assumption' : 'conditional' },
  ];

  const risks = [
    risk('UI can create checkout revenue loss if cart/payment/order-confirmation states are coupled to non-critical services or lack retry/idempotency UX.', 'High', 'Medium', 'Isolate critical routes, define fallback states, contract-test APIs, and run synthetic checkout tests.'),
    risk('Frontend auth/session mistakes can expose customer, loyalty, support, or admin data despite secure backend APIs.', 'High', 'Medium', 'Validate session storage, cookies, CSRF/XSS/CSP, role-aware navigation, step-up auth, and audit trails.'),
    risk('Poor frontend performance, image delivery, and third-party script governance can reduce conversion and inflate CDN/telemetry cost.', 'Medium', 'High', 'Set route-level performance budgets, image/CDN rules, script governance, RUM, and rollback thresholds.'),
  ];

  const validationNeeded = [
    'Confirm UI channels, route ownership, API dependencies, rendering strategy, cache behavior, fallback states, route SLOs, release rings, and rollback gates.',
    'Confirm cart/checkout/payment/order confirmation UX, inventory promise behavior, promo error handling, duplicate-submit prevention, and synthetic checkout tests.',
    'Confirm design-system ownership, WCAG target, localization/currency/address rules, form/error standards, visual regression, and accessibility gates.',
    'Confirm frontend auth/session storage, cookie flags, CSRF/XSS/CSP controls, step-up actions, support/admin roles, logout/revocation, and audit fields.',
    'Confirm Core Web Vitals targets, bundle/hydration budgets, CDN/image strategy, third-party script controls, RUM/funnel telemetry, feature flags, experiments, consent, retention, and residency.',
  ];

  const retrievalRequests = [
    'retail-storefront-channel-template',
    'retail-checkout-experience-resilience-template',
    'retail-design-system-accessibility-template',
    'retail-frontend-performance-delivery-template',
    'retail-ui-auth-session-template',
    'retail-admin-support-ui-template',
    'retail-ui-observability-experimentation-template',
  ];

  const base = {
    agentId: 'ui',
    title: 'UI AI Agent',
    status: 'completed',
    summary: 'UI review aligned to ArchitectIQ Retail: storefront/mobile/admin channels, checkout resilience, design system, accessibility, auth/session, performance delivery, observability, experimentation, release safety, and upstream handoffs.',
    retail_workload: signals.workloadTypes,
    findings,
    ui_recommendation: findings,
    ui_channel_matrix: uiChannelMatrix,
    frontend_architecture: {
      recommendation: 'Route-classed frontend architecture for storefront, mobile/PWA, account, support, admin, checkout, and AI surfaces with explicit API dependencies, cache behavior, fallback, release rings, and ownership.',
      evidence_status: 'assumption',
    },
    design_system_strategy: {
      recommendation: 'Governed design system with tokens, components, form/error patterns, content rules, accessibility, localization, and visual regression gates.',
      evidence_status: 'assumption',
    },
    checkout_experience_resilience: {
      recommendation: 'Critical journey treatment for cart, checkout, payment return, inventory promise, promo validation, order confirmation, retry/idempotency UX, and safe degraded states.',
      evidence_status: hasCheckout || signals.commerce ? 'assumption' : 'conditional',
    },
    ui_auth_session_controls: [
      'Use approved OIDC/OAuth flows, secure cookies or approved token storage, CSRF/XSS/CSP controls, session timeout, logout/device revocation, and step-up auth.',
      'Separate customer, associate, admin, support, partner, and AI-assisted authorization paths with role-aware navigation and audit context.',
    ],
    ui_performance_delivery: [
      'Set Core Web Vitals, route bundle, hydration, image, CDN, third-party script, and mobile network budgets.',
      'Use synthetic monitoring for peak campaign, search, PDP, cart, checkout, and payment return paths.',
    ],
    ui_observability: [
      'Instrument RUM, frontend errors, checkout funnel, search zero-results, recommendation exposure, chatbot handoff, consent-aware analytics, feature flags, experiments, release rings, and rollback triggers.',
    ],
    ui_accessibility_internationalization: [
      'Define WCAG target, keyboard/screen-reader coverage, focus/error behavior, locale/currency/address/phone rules, privacy notices, and content governance.',
    ],
    ui_evidence_status: {
      ui: 'assumption',
      channels: 'assumption',
      checkout_resilience: hasCheckout || signals.commerce ? 'assumption' : 'conditional',
      design_accessibility: 'assumption',
      auth_session: 'assumption',
      performance_delivery: 'assumption',
      observability_release: 'assumption',
    },
    risks,
    validation_needed: validationNeeded,
    retrieval_requests: retrievalRequests,
    evidence: retailEvidence(retrievedContext),
    statePatch: {
      retail_workload: signals.workloadTypes,
      ui_controls: findings,
      ui_recommendation: findings,
      ui_channel_matrix: uiChannelMatrix,
      frontend_architecture: {
        recommendation: 'Route-classed frontend architecture for storefront, mobile/PWA, account, support, admin, checkout, and AI surfaces with explicit API dependencies, cache behavior, fallback, release rings, and ownership.',
        evidence_status: 'assumption',
      },
      design_system_strategy: {
        recommendation: 'Governed design system with tokens, components, form/error patterns, content rules, accessibility, localization, and visual regression gates.',
        evidence_status: 'assumption',
      },
      checkout_experience_resilience: {
        recommendation: 'Critical journey treatment for cart, checkout, payment return, inventory promise, promo validation, order confirmation, retry/idempotency UX, and safe degraded states.',
        evidence_status: hasCheckout || signals.commerce ? 'assumption' : 'conditional',
      },
      ui_auth_session_controls: [
        'Use approved OIDC/OAuth flows, secure cookies or approved token storage, CSRF/XSS/CSP controls, session timeout, logout/device revocation, and step-up auth.',
        'Separate customer, associate, admin, support, partner, and AI-assisted authorization paths with role-aware navigation and audit context.',
      ],
      ui_performance_delivery: [
        'Set Core Web Vitals, route bundle, hydration, image, CDN, third-party script, and mobile network budgets.',
        'Use synthetic monitoring for peak campaign, search, PDP, cart, checkout, and payment return paths.',
      ],
      ui_observability: [
        'Instrument RUM, frontend errors, checkout funnel, search zero-results, recommendation exposure, chatbot handoff, consent-aware analytics, feature flags, experiments, release rings, and rollback triggers.',
      ],
      ui_accessibility_internationalization: [
        'Define WCAG target, keyboard/screen-reader coverage, focus/error behavior, locale/currency/address/phone rules, privacy notices, and content governance.',
      ],
      ui_evidence_status: {
        ui: 'assumption',
        channels: 'assumption',
        checkout_resilience: hasCheckout || signals.commerce ? 'assumption' : 'conditional',
        design_accessibility: 'assumption',
        auth_session: 'assumption',
        performance_delivery: 'assumption',
        observability_release: 'assumption',
      },
      risks,
      human_validation_needed: validationNeeded,
      validation_gaps: validationNeeded.map(item => `UI validation required: ${item}`),
      evidence_status: {
        ui: 'assumption',
      },
      retrieval_requests: retrievalRequests,
    },
  };

  if (!useModel) return base;

  try {
    const modelReview = await runSpecialistModel({
      agentId: 'ui',
      title: 'UI AI Agent',
      system: 'You are the ArchitectIQ Retail UI Agent. Review UI architecture only: storefront, mobile/PWA, admin/support UI, checkout/cart/payment UX, design system, accessibility, localization, auth/session, frontend performance, CDN/image delivery, observability, experimentation, release safety, and upstream API/AI/Security/Compliance/Infrastructure/Technology/Storage/FinOps constraints. Do not output internal agent-development commentary. Return concise JSON only.',
      input: JSON.stringify({
        query,
        context,
        current_state: state,
        deterministic_ui_review: base,
      }),
    });
    return mergeModelReview(base, modelReview);
  } catch (err) {
    return {
      ...base,
      model_review: {
        enabled: true,
        error: err.message,
      },
      validation_needed: [
        ...base.validation_needed,
        `UI model review failed and deterministic UI rules were used instead: ${err.message}`,
      ],
    };
  }
}

module.exports = { runUiAgent };
