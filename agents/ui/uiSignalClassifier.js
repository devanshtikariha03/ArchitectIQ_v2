function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const UI_SIGNAL_DOMAINS = [
  {
    id: 'storefront_channels',
    label: 'Storefront, mobile, and channel architecture',
    retrievalHints: ['retail-storefront-channel-template'],
    aliases: ['storefront', 'web', 'mobile', 'pwa', 'ios', 'android', 'channel', 'product page', 'search page', 'catalog page'],
  },
  {
    id: 'checkout_resilience',
    label: 'Cart, checkout, payment, and critical journey resilience',
    retrievalHints: ['retail-checkout-experience-resilience-template'],
    aliases: ['checkout', 'cart', 'payment redirect', 'order confirmation', 'promo', 'coupon', 'inventory promise', 'critical path'],
  },
  {
    id: 'design_system_accessibility',
    label: 'Design system, accessibility, and localization',
    retrievalHints: ['retail-design-system-accessibility-template'],
    aliases: ['design system', 'component', 'accessibility', 'a11y', 'wcag', 'localization', 'i18n', 'currency', 'locale'],
  },
  {
    id: 'performance_delivery',
    label: 'Frontend performance, CDN, and image delivery',
    retrievalHints: ['retail-frontend-performance-delivery-template'],
    aliases: ['performance', 'core web vitals', 'bundle', 'hydration', 'cdn', 'image', 'edge cache', 'third-party script'],
  },
  {
    id: 'auth_session',
    label: 'Frontend auth, session, and account security',
    retrievalHints: ['retail-ui-auth-session-template'],
    aliases: ['auth', 'session', 'oidc', 'oauth', 'cookie', 'csrf', 'xss', 'login', 'account', 'step-up'],
  },
  {
    id: 'admin_support_ui',
    label: 'Admin, support, and backoffice UI',
    retrievalHints: ['retail-admin-support-ui-template'],
    aliases: ['admin', 'support ui', 'backoffice', 'operator', 'associate', 'bulk action', 'maker checker', 'privileged'],
  },
  {
    id: 'ui_observability_experimentation',
    label: 'UI observability, experimentation, and release controls',
    retrievalHints: ['retail-ui-observability-experimentation-template'],
    aliases: ['rum', 'observability', 'frontend errors', 'funnel', 'analytics', 'feature flag', 'a/b test', 'experiment', 'rollback'],
  },
];

function matchAliases(text, aliases) {
  return aliases.filter(alias => new RegExp(`(^|[^a-z0-9])${escapeRegex(alias)}([^a-z0-9]|$)`, 'i').test(text));
}

function classifyUiSignals({ query = '', context = {}, state = {}, signals = {} } = {}) {
  const text = normalize([
    query,
    typeof context === 'string' ? context : JSON.stringify(context || {}),
    typeof state === 'string' ? state : JSON.stringify(state || {}),
  ].join(' '));
  const domains = UI_SIGNAL_DOMAINS.map(domain => {
    const matched_terms = matchAliases(text, domain.aliases);
    const score = matched_terms.length;
    const confidence = score >= 4 ? 'high' : score >= 2 ? 'medium' : score === 1 ? 'low' : 'none';
    return {
      id: domain.id,
      label: domain.label,
      confidence,
      score,
      matched_terms,
      retrieval_hints: domain.retrievalHints,
    };
  }).filter(domain => domain.score > 0);

  const possibleMisses = [];
  if (!domains.length) possibleMisses.push('No strong UI domain was detected; ask for storefront/mobile/admin channels, checkout journey, performance, accessibility, auth/session, telemetry, and release controls.');
  if (signals.commerce && !domains.some(domain => domain.id === 'checkout_resilience')) possibleMisses.push('Commerce is in scope, but checkout/cart UI language was weak or indirect.');
  if (signals.retailAi && !domains.some(domain => domain.id === 'ui_observability_experimentation')) possibleMisses.push('Retail AI is in scope; verify UI fallback, recommendation/chatbot exposure, consent-aware telemetry, and human escalation journeys.');

  return {
    tool: 'classifyUiSignals',
    domains,
    retrieval_hints: [...new Set(domains.flatMap(domain => domain.retrieval_hints))],
    confidence_summary: {
      high: domains.filter(domain => domain.confidence === 'high').length,
      medium: domains.filter(domain => domain.confidence === 'medium').length,
      low: domains.filter(domain => domain.confidence === 'low').length,
    },
    error_modes: {
      possible_false_positives: domains.filter(domain => domain.confidence === 'low').map(domain => `Low-confidence UI signal for ${domain.label}; confirm whether this UI domain is actually in scope.`),
      possible_false_negatives: possibleMisses,
      note: 'UI signal classification is a routing aid. UI, API, AI, Security, Compliance, Infrastructure, Technology, Governance, and FinOps owners must validate final choices.',
    },
  };
}

module.exports = {
  UI_SIGNAL_DOMAINS,
  classifyUiSignals,
};
