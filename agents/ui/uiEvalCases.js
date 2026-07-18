const UI_EVAL_CASES = [
  {
    id: 'global-retail-ui-architecture',
    name: 'Global retail UI architecture',
    query: 'Global retail storefront with web, mobile app, PWA, product detail pages, search, cart, checkout, payment redirect, order confirmation, account, support UI, admin backoffice, chatbot/recommendations, CDN/image delivery, Core Web Vitals, accessibility, OIDC session, CSRF/XSS/CSP, RUM, feature flags, experiments, release rings, rollback, and consent-aware analytics.',
    state: {
      agent_outputs: {
        security: { agentId: 'security' },
        compliance: { agentId: 'compliance' },
        governance: { agentId: 'governance' },
        infrastructure: { agentId: 'infrastructure' },
        technology: { agentId: 'technology' },
        storage: { agentId: 'storage' },
        api: { agentId: 'api' },
        ai: { agentId: 'ai' },
      },
    },
    mustMatch: [
      ['channels', /storefront|mobile|pwa|admin|support|channel/i],
      ['checkout', /checkout|cart|payment|order confirmation|inventory promise/i],
      ['design accessibility', /design system|accessibility|wcag|localization|i18n/i],
      ['auth session', /auth|session|csrf|xss|csp|oidc/i],
      ['performance', /core web vitals|bundle|hydration|cdn|image/i],
      ['observability release', /rum|funnel|feature flag|experiment|rollback/i],
      ['upstream', /api|ai|security|compliance|handoff/i],
      ['evidence pack', /frontend_evidence_needed|checkout_evidence_needed|auth_session_evidence_needed|approval_workflow/i],
      ['qualification', /draft|not design sign-off|ui owner/i],
    ],
  },
  {
    id: 'checkout-critical-journey',
    name: 'Checkout critical journey',
    query: 'Retail checkout UI needs cart persistence, inventory promise, promo validation, duplicate submit prevention, payment redirect return, pending payment status, order confirmation uncertainty, synthetic checkout tests, and safe fallback when recommendation/chatbot/search degrades.',
    mustMatch: [
      ['critical path', /checkout|cart|payment|critical/i],
      ['inventory promo', /inventory promise|promo|coupon/i],
      ['idempotency ux', /duplicate-submit|retry|idempotency|order confirmation/i],
      ['fallback', /fallback|degraded|recommendation|chatbot/i],
      ['synthetic', /synthetic checkout|synthetic tests/i],
    ],
  },
  {
    id: 'admin-support-ui',
    name: 'Admin support UI',
    query: 'Support and admin UI for order edits, refunds, loyalty adjustment, price override, inventory correction, bulk operations, backoffice dashboards, redaction, maker checker approval, audit trails, rollback, and privileged roles.',
    mustMatch: [
      ['admin support', /admin|support|backoffice/i],
      ['privileged', /privileged|least privilege|role/i],
      ['approval', /maker-checker|approval/i],
      ['audit redaction', /audit|redaction/i],
      ['bulk rollback', /bulk|rollback|reversible/i],
    ],
  },
  {
    id: 'performance-delivery',
    name: 'Performance delivery',
    query: 'Storefront needs Core Web Vitals targets, route bundle budgets, hydration controls, image optimization, CDN cache rules, edge invalidation, mobile network tests, third-party script governance, and peak campaign synthetic monitoring.',
    mustMatch: [
      ['web vitals', /core web vitals/i],
      ['bundle hydration', /bundle|hydration/i],
      ['cdn image', /cdn|image/i],
      ['third party', /third-party script/i],
      ['peak monitoring', /peak|synthetic/i],
    ],
  },
  {
    id: 'auth-session-security',
    name: 'Auth session security',
    query: 'Frontend auth uses OIDC/OAuth, secure cookies, session timeout, logout, device revocation, CSRF, XSS, CSP, step-up auth for account changes, support role restrictions, and audit context.',
    mustMatch: [
      ['oidc oauth', /oidc|oauth/i],
      ['secure session', /secure cookies|session|logout|revocation/i],
      ['csrf xss csp', /csrf|xss|csp/i],
      ['step up', /step-up|sensitive/i],
      ['audit role', /role|audit/i],
    ],
  },
  {
    id: 'accessibility-i18n',
    name: 'Accessibility and localization',
    query: 'Design system must support WCAG, keyboard navigation, screen reader labels, color contrast, focus states, form errors, locale, currency, address, phone, size guide, privacy notices, and visual regression.',
    mustMatch: [
      ['wcag', /wcag|accessibility/i],
      ['keyboard reader', /keyboard|screen-reader|screen reader/i],
      ['contrast focus', /contrast|focus/i],
      ['locale', /locale|currency|address|phone/i],
      ['visual regression', /visual regression/i],
    ],
  },
  {
    id: 'ai-assisted-ui',
    name: 'AI assisted UI',
    query: 'Retail UI has chatbot, recommendations, personalization cards, AI support escalation, citation display, consent-aware analytics, fallback when RAG misses, and safe states for hallucinated policy or product answers.',
    mustMatch: [
      ['ai surfaces', /chatbot|recommendation|personalization/i],
      ['escalation', /escalation|human/i],
      ['citation fallback', /citation|fallback|rag/i],
      ['consent', /consent-aware|consent/i],
      ['safe states', /hallucinated|unsafe|safe/i],
    ],
  },
  {
    id: 'missing-ui-evidence',
    name: 'Missing UI evidence',
    query: 'Final UI stack is requested but there is no route ownership, no API dependency map, no checkout fallback evidence, no accessibility target, no auth/session design, no performance budget, no RUM telemetry, no feature flag plan, and no rollback gate.',
    mustMatch: [
      ['draft', /draft|requires human validation/i],
      ['missing evidence', /route ownership|api dependency|checkout|accessibility|auth|performance|rum|rollback/i],
      ['validation gates', /ui_validation_gates|requires human validation/i],
      ['evidence pack', /approval_workflow|client_questions|frontend_evidence_needed/i],
    ],
  },
];

function flattenOutput(output = {}) {
  return [
    output.summary,
    output.findings,
    output.ui_recommendation,
    output.ui_handoff_summary,
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
    output.retrieval_requests,
    output.ui_tool_results,
    output.evidence,
    output.graph_agent,
  ].flat(8).map(item => {
    if (typeof item === 'string') return item;
    try {
      return JSON.stringify(item || '');
    } catch {
      return String(item || '');
    }
  }).join('\n');
}

function scoreUiOutput(output, testCase) {
  const text = flattenOutput(output);
  const checks = testCase.mustMatch.map(([label, pattern]) => ({ label, pass: pattern.test(text) }));
  checks.push(
    { label: 'v1 ui_recommendation field', pass: Array.isArray(output.ui_recommendation) && output.ui_recommendation.length > 0 },
    { label: 'v1 ui_channel_matrix field', pass: Array.isArray(output.ui_channel_matrix) && output.ui_channel_matrix.length > 0 },
    { label: 'v1 frontend_architecture field', pass: Boolean(output.frontend_architecture?.recommendation) },
    { label: 'v1 design_system_strategy field', pass: Boolean(output.design_system_strategy?.recommendation) },
    { label: 'v1 checkout_experience_resilience field', pass: Boolean(output.checkout_experience_resilience?.recommendation) },
    { label: 'v1 ui_auth_session_controls field', pass: Array.isArray(output.ui_auth_session_controls) && output.ui_auth_session_controls.length > 0 },
    { label: 'v1 ui_performance_delivery field', pass: Array.isArray(output.ui_performance_delivery) && output.ui_performance_delivery.length > 0 },
    { label: 'v1 ui_observability field', pass: Array.isArray(output.ui_observability) && output.ui_observability.length > 0 },
    { label: 'v1 ui_accessibility_internationalization field', pass: Array.isArray(output.ui_accessibility_internationalization) && output.ui_accessibility_internationalization.length > 0 },
    { label: 'v1 ui_evidence_status field', pass: Boolean(output.ui_evidence_status?.ui) },
    { label: 'v1 ui_validation_gates field', pass: Array.isArray(output.ui_validation_gates) && output.ui_validation_gates.length > 0 },
    { label: 'v1 ui_qualification field', pass: output.ui_qualification?.status === 'draft_requires_ui_owner_review' },
    { label: 'v1 ui_policy_citations field', pass: Array.isArray(output.ui_policy_citations) && output.ui_policy_citations.length > 0 },
    { label: 'v1 ui_evidence_pack field', pass: Array.isArray(output.ui_evidence_pack?.approval_workflow) && output.ui_evidence_pack.approval_workflow.length > 0 },
    { label: 'v1 ui_signal_profile field', pass: Array.isArray(output.ui_signal_profile?.domains) && output.ui_signal_profile.domains.length > 0 }
  );
  const passed = checks.filter(check => check.pass).length;
  return {
    case_id: testCase.id,
    name: testCase.name,
    passed,
    total: checks.length,
    score: checks.length ? Math.round((passed / checks.length) * 100) : 0,
    checks,
    graph_validation: output.graph_agent?.validation?.verdict || 'missing',
  };
}

module.exports = {
  UI_EVAL_CASES,
  scoreUiOutput,
};
