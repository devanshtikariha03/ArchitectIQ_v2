const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const { buildRetailText } = require('../retailContext');
const { retrieveUiKnowledge } = require('./uiKnowledgeBase');

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function textFromInput(input = {}) {
  return buildRetailText({
    query: input.query || '',
    context: input.context || {},
    state: input.state || {},
  }).toLowerCase();
}

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

function inspectUiHandoff(input = {}) {
  const state = input.state || {};
  const upstream = {
    security: Boolean(state.agent_outputs?.security || state.security_tool_context),
    compliance: Boolean(state.agent_outputs?.compliance || state.compliance_tool_context),
    governance: Boolean(state.agent_outputs?.governance || state.governance_tool_context),
    infrastructure: Boolean(state.agent_outputs?.infrastructure || state.infrastructure_tool_context),
    technology: Boolean(state.agent_outputs?.technology || state.technology_tool_context),
    storage: Boolean(state.agent_outputs?.storage || state.storage_tool_context),
    api: Boolean(state.agent_outputs?.api || state.api_tool_context),
    ai: Boolean(state.agent_outputs?.ai || state.ai_tool_context),
    finops: Boolean(state.agent_outputs?.finops || state.finops_tool_context),
    validation_gaps: asArray(state.validation_gaps),
  };
  const controls = [
    'Carry upstream API, AI, Security, Compliance, Infrastructure, Technology, Storage, Governance, and FinOps constraints into UI route, auth/session, data, telemetry, fallback, and release decisions.',
    'UI remains draft until route ownership, API dependencies, checkout resilience, design-system/accessibility, auth/session, observability, and performance evidence are validated.',
  ];
  if (upstream.api) controls.push('Apply API handoff to frontend route dependencies, error states, idempotency/retry UX, contract testing, scopes, and rate-limit behavior.');
  if (upstream.ai) controls.push('Apply AI handoff to chatbot/recommendation exposure, fallback, consent-aware telemetry, human escalation, and AI-generated content controls.');
  if (upstream.security) controls.push('Apply Security handoff to XSS/CSRF/session/token boundaries, admin/support privileges, redaction, and secure frontend logging.');
  if (upstream.compliance) controls.push('Apply Compliance handoff to consent, privacy notices, telemetry residency, accessibility obligations, retention, deletion, and support access.');

  return {
    tool: 'inspectUiHandoffTool',
    upstream,
    controls,
    validation_needed: [
      'Confirm upstream API, AI, Security, Compliance, Governance, Infrastructure, Technology, Storage, and FinOps outputs are accepted as constraints before UI approval.',
      'Confirm unresolved validation gaps are assigned to UI, API, AI, security, compliance, product, platform, and FinOps owners.',
    ],
  };
}

function designFrontendArchitecture(input = {}) {
  const text = textFromInput(input);
  return {
    tool: 'designFrontendArchitectureTool',
    frontend_architecture: {
      recommendation: 'Use route-classed frontend architecture for storefront, mobile/PWA, account, support, admin, checkout, and AI surfaces with explicit API dependencies, cache behavior, fallback, release rings, and ownership.',
      rendering_strategy: /seo|catalog|product|pdp|search/.test(text) ? 'SEO-sensitive catalog/product/search routes need SSR/SSG or edge-rendered strategy with cache invalidation evidence.' : 'Rendering strategy remains conditional until SEO, personalization, freshness, and team constraints are confirmed.',
      evidence_status: 'assumption',
    },
    ui_channel_matrix: [
      { channel: 'Storefront web/mobile web', priority: 'browse, search, PDP, cart, checkout, account', evidence_status: 'assumption' },
      { channel: 'Native mobile/PWA', priority: 'app navigation, push/deep links, offline-lite behavior, checkout handoff', evidence_status: 'assumption' },
      { channel: 'Admin/support UI', priority: 'least-privilege operations, redaction, approval, audit, rollback', evidence_status: 'assumption' },
      { channel: 'AI-assisted UI', priority: 'chatbot/recommendation exposure, fallback, citations, escalation, consent-aware analytics', evidence_status: 'assumption' },
    ],
    controls: [
      'Map every UI route to owner, API dependency, cache policy, fallback state, error state, telemetry, SLO, and release gate.',
      'Keep checkout/account/admin routes isolated from recommendation, chatbot, analytics, and third-party script failures.',
    ],
    validation_needed: [
      'Confirm channels, route ownership, API dependencies, rendering strategy, cache policy, route SLOs, release rings, and fallback behavior.',
    ],
  };
}

function planCheckoutExperience(input = {}) {
  const text = textFromInput(input);
  return {
    tool: 'planCheckoutExperienceTool',
    checkout_experience_resilience: {
      recommendation: 'Treat cart, checkout, payment redirect/return, inventory promise, promotion validation, order confirmation, and retry/idempotency UX as critical paths with synthetic tests and safe degraded states.',
      scope: /checkout|cart|payment|order|promo|coupon|inventory/.test(text) ? 'Checkout/cart/payment UI scope detected; critical-path validation required.' : 'Conditional until commerce checkout scope is confirmed.',
      evidence_status: 'assumption',
    },
    controls: [
      'Do not let recommendations, chatbot, analytics, A/B tests, or third-party scripts block checkout progress.',
      'Make retry, duplicate-submit prevention, expired inventory promise, payment pending, promo failure, and order-confirmation uncertainty explicit in UI states.',
    ],
    risks: [
      risk('Checkout UI can create revenue loss if retry/idempotency UX, payment fallback, inventory promise, and order confirmation uncertainty are not handled.', 'High', 'Medium', 'Define critical journey states, synthetic tests, API contract behavior, and rollback gates.'),
    ],
    validation_needed: [
      'Confirm checkout isolation, cart persistence, payment redirect/return behavior, inventory promise messaging, promo error states, duplicate-submit prevention, and synthetic checkout tests.',
    ],
  };
}

function planDesignSystemAccessibility() {
  return {
    tool: 'planDesignSystemAccessibilityTool',
    design_system_strategy: {
      recommendation: 'Use governed design tokens, component library, forms/error-state standards, content patterns, accessibility checks, localization, and visual regression across customer, admin, support, and mobile UI.',
      evidence_status: 'assumption',
    },
    ui_accessibility_internationalization: [
      'Set WCAG target, keyboard/screen-reader coverage, color/contrast checks, focus behavior, semantic form errors, and checkout accessibility acceptance tests.',
      'Define locale, currency, address, phone, language, size/fit, tax, privacy notice, and support-content behavior by region.',
    ],
    controls: [
      'Design-system governance must cover checkout, account, admin/support, AI/chatbot, mobile, and marketplace/partner UI surfaces.',
    ],
    validation_needed: [
      'Confirm WCAG target, accessibility test gates, locale/currency/address rules, component ownership, visual regression, and content governance.',
    ],
  };
}

function planAuthSessionControls(input = {}) {
  const text = textFromInput(input);
  return {
    tool: 'planUiAuthSessionTool',
    ui_auth_session_controls: [
      'Use approved OIDC/OAuth flows, secure cookies or approved token storage, CSRF/XSS controls, CSP, session timeout, logout/device revocation, and step-up auth for sensitive account/admin/support actions.',
      'Separate customer, associate, admin, support, marketplace partner, and AI-assisted UI authorization paths with role-aware navigation and audit context.',
    ],
    controls: [
      /admin|support|backoffice|associate/.test(text)
        ? 'Privileged admin/support UI requires least privilege, redaction, maker-checker approval, audit trails, bulk-action safeguards, and reversible operations.'
        : 'Customer account UI requires secure session, privacy-aware data display, order/loyalty access controls, and clear logout/revocation behavior.',
    ],
    risks: [
      risk('Frontend token/session mistakes can expose customer, loyalty, order, support, or privileged admin data despite secure APIs.', 'High', 'Medium', 'Use secure session architecture, step-up auth, CSRF/XSS controls, CSP, role-aware UI, audit, and security owner validation.'),
    ],
    validation_needed: [
      'Confirm auth flows, token/session storage, cookie flags, CSP, CSRF/XSS controls, step-up actions, support/admin roles, logout/revocation, and audit fields.',
    ],
  };
}

function planPerformanceDelivery() {
  return {
    tool: 'planUiPerformanceDeliveryTool',
    ui_performance_delivery: [
      'Define Core Web Vitals, route-level bundle budgets, hydration budgets, mobile network budgets, image optimization, CDN cache rules, edge invalidation, and third-party script governance.',
      'Treat peak campaign, flash-sale, search, PDP, cart, and checkout synthetic tests as release gates.',
    ],
    controls: [
      'Frontend performance budget must be tied to conversion, checkout reliability, CDN cost, observability volume, and rollback thresholds.',
    ],
    validation_needed: [
      'Confirm Core Web Vitals targets, route bundle budgets, image/CDN strategy, third-party script controls, mobile network tests, and peak synthetic monitoring.',
    ],
  };
}

function planUiObservability() {
  return {
    tool: 'planUiObservabilityTool',
    ui_observability: [
      'Instrument RUM, frontend errors, Core Web Vitals, checkout funnel, search zero-results, recommendation exposure, chatbot handoff, consent-aware analytics, feature flags, experiments, release rings, and rollback triggers.',
      'Map UI telemetry to data class, consent, residency, retention, alert owner, dashboard, and support-access rules.',
    ],
    controls: [
      'UI releases need feature flags, ring deployment, visual regression, contract tests, synthetic checks, and measurable rollback criteria.',
    ],
    validation_needed: [
      'Confirm RUM metrics, error budgets, funnel events, consent gating, feature flags, experiment ownership, rollback thresholds, alert routing, and telemetry retention/residency.',
    ],
  };
}

function retrieveUiKnowledgeForInput(input = {}) {
  return retrieveUiKnowledge({
    query: buildRetailText({
      query: input.query || '',
      context: input.context || {},
      state: input.state || {},
    }),
    retrievalPlan: input.retrievalPlan || input.retrieval_plan || [],
    signals: input.signals || {},
    limit: input.limit || 7,
  });
}

function validateUiOutput(input = {}) {
  const output = input.output || {};
  const toolResults = asArray(input.toolResults);
  const text = [
    output.summary,
    output.findings,
    output.ui_recommendation,
    output.ui_channel_matrix,
    output.frontend_architecture,
    output.design_system_strategy,
    output.checkout_experience_resilience,
    output.ui_auth_session_controls,
    output.ui_performance_delivery,
    output.ui_observability,
    output.ui_accessibility_internationalization,
    output.ui_evidence_status,
    output.ui_validation_gates,
    output.ui_qualification,
    output.ui_policy_citations,
    output.ui_evidence_pack,
    output.ui_signal_profile,
    output.risks,
    output.validation_needed,
    toolResults,
  ].flat(7).map(item => typeof item === 'string' ? item : JSON.stringify(item || '')).join('\n').toLowerCase();

  const blockers = [];
  const warnings = [];
  const improvements = [];
  const hasChannels = /storefront|mobile|pwa|admin|support|channel|route/.test(text);
  const hasCheckout = /checkout|cart|payment|order confirmation|inventory promise|duplicate-submit|critical path/.test(text);
  const hasDesign = /design system|component|accessibility|wcag|locale|localization|i18n/.test(text);
  const hasAuth = /auth|session|cookie|csrf|xss|oidc|oauth|step-up|csp/.test(text);
  const hasPerformance = /core web vitals|bundle|hydration|cdn|image|third-party|performance/.test(text);
  const hasObservability = /rum|frontend errors|funnel|feature flag|experiment|rollback|telemetry/.test(text);
  const hasUpstream = /api|ai|security|compliance|infrastructure|technology|storage|governance|handoff/.test(text);
  const hasEvidencePack = /evidence_pack|policy_sources|approval_workflow|client_questions|frontend_evidence_needed|checkout_evidence_needed|auth_session_evidence_needed/.test(text);
  const hasQualification = /draft|not.*approval|human validation|requires.*validation|ui owner/.test(text);
  const hasCitations = /citation|source_id|policy|baseline/.test(text);

  if (!hasChannels) blockers.push('UI output does not define storefront/mobile/admin/support channel architecture.');
  if (!hasCheckout) blockers.push('UI output does not define checkout/cart/payment critical-journey resilience.');
  if (!hasDesign) blockers.push('UI output does not define design-system/accessibility/localization controls.');
  if (!hasAuth) blockers.push('UI output does not define frontend auth/session/security controls.');
  if (!hasPerformance) blockers.push('UI output does not define frontend performance/CDN/image delivery controls.');
  if (!hasObservability) blockers.push('UI output does not define RUM/funnel/feature-flag/rollback observability controls.');
  if (!hasUpstream) blockers.push('UI output does not consume upstream API/AI/Security/Compliance/Infrastructure/Technology/Storage/Governance constraints.');
  if (!hasEvidencePack) blockers.push('UI output does not include customer-facing evidence pack with UI route, checkout, auth/session, performance, accessibility, and observability evidence needs.');
  if (!hasQualification) blockers.push('UI output does not qualify recommendation as draft-level until UI owners validate evidence.');
  if (!hasCitations) warnings.push('UI output should include citations or source evidence.');
  if (!toolResults.length) blockers.push('UI tools did not produce handoff, frontend, checkout, design, auth/session, performance, observability, retrieval, or validation evidence.');
  if (!output.model_review?.enabled) improvements.push('Run model judgement for customer-specific UI recommendations when an approved model is available.');

  return {
    tool: 'validateUiOutputTool',
    verdict: blockers.length ? 'fail' : warnings.length ? 'warn' : 'pass',
    blockers,
    warnings,
    improvements,
    required_controls: {
      channels: hasChannels,
      checkout_resilience: hasCheckout,
      design_accessibility: hasDesign,
      auth_session: hasAuth,
      performance_delivery: hasPerformance,
      observability_release: hasObservability,
      upstream_handoff: hasUpstream,
      evidence_pack: hasEvidencePack,
      qualification: hasQualification,
      citations_or_sources: hasCitations,
    },
  };
}

const toolInputSchema = z.object({
  query: z.string().optional(),
  context: z.record(z.any()).optional(),
  state: z.record(z.any()).optional(),
  signals: z.record(z.any()).optional(),
  output: z.record(z.any()).optional(),
  toolResults: z.array(z.any()).optional(),
  retrievalPlan: z.array(z.string()).optional(),
  retrieval_plan: z.array(z.string()).optional(),
  limit: z.number().optional(),
});

const uiTools = {
  inspectUiHandoffTool: tool(inspectUiHandoff, {
    name: 'inspectUiHandoffTool',
    description: 'Inspect upstream API, AI, Security, Compliance, Infrastructure, Technology, Storage, Governance, and FinOps constraints before UI recommendations.',
    schema: toolInputSchema,
  }),
  designFrontendArchitectureTool: tool(designFrontendArchitecture, {
    name: 'designFrontendArchitectureTool',
    description: 'Design storefront, mobile/PWA, admin/support, checkout, and AI-assisted frontend architecture.',
    schema: toolInputSchema,
  }),
  planCheckoutExperienceTool: tool(planCheckoutExperience, {
    name: 'planCheckoutExperienceTool',
    description: 'Plan cart, checkout, payment, order confirmation, inventory promise, and critical journey resilience.',
    schema: toolInputSchema,
  }),
  planDesignSystemAccessibilityTool: tool(planDesignSystemAccessibility, {
    name: 'planDesignSystemAccessibilityTool',
    description: 'Plan design-system, accessibility, localization, component governance, and visual regression controls.',
    schema: toolInputSchema,
  }),
  planUiAuthSessionTool: tool(planAuthSessionControls, {
    name: 'planUiAuthSessionTool',
    description: 'Plan frontend auth, session, account, admin/support, CSRF/XSS, CSP, and step-up controls.',
    schema: toolInputSchema,
  }),
  planUiPerformanceDeliveryTool: tool(planPerformanceDelivery, {
    name: 'planUiPerformanceDeliveryTool',
    description: 'Plan frontend performance budgets, CDN, image delivery, mobile performance, and third-party script controls.',
    schema: toolInputSchema,
  }),
  planUiObservabilityTool: tool(planUiObservability, {
    name: 'planUiObservabilityTool',
    description: 'Plan RUM, frontend errors, funnel telemetry, feature flags, experiments, rollback, and release controls.',
    schema: toolInputSchema,
  }),
  retrieveUiKnowledgeTool: tool(retrieveUiKnowledgeForInput, {
    name: 'retrieveUiKnowledgeTool',
    description: 'Retrieve local ArchitectIQ UI knowledge and customer policy packs.',
    schema: toolInputSchema,
  }),
  validateUiOutputTool: tool(validateUiOutput, {
    name: 'validateUiOutputTool',
    description: 'Validate UI output against channel, checkout, design, auth/session, performance, observability, handoff, and evidence controls.',
    schema: toolInputSchema,
  }),
};

module.exports = {
  designFrontendArchitecture,
  inspectUiHandoff,
  planAuthSessionControls,
  planCheckoutExperience,
  planDesignSystemAccessibility,
  planPerformanceDelivery,
  planUiObservability,
  retrieveUiKnowledgeForInput,
  uiTools,
  validateUiOutput,
};
