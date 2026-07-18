const { loadUiPolicyDocuments } = require('./uiPolicyIngestion');

const UI_KNOWLEDGE_DOCS = [
  {
    id: 'retail-storefront-channel-template',
    title: 'Retail Storefront Channel Template',
    tags: ['storefront', 'mobile', 'pwa', 'channel'],
    controls: ['Separate browse, search, product detail, cart, checkout, account, support, admin, and mobile/PWA channel concerns with explicit API dependencies, fallback behavior, and ownership.'],
    risks: ['A single undifferentiated frontend path can let browse/search or personalization failure degrade checkout and account-critical workflows.'],
    validation_needed: ['Confirm channels, user journeys, route ownership, API dependencies, SEO/mobile needs, app-store constraints, and channel-specific SLOs.'],
    citations: ['ArchitectIQ UI baseline: retail UI architecture must preserve critical journey isolation.'],
  },
  {
    id: 'retail-checkout-experience-resilience-template',
    title: 'Retail Checkout Experience Resilience Template',
    tags: ['checkout', 'cart', 'payment', 'resilience'],
    controls: ['Checkout UI must degrade safely with inventory reservation, payment orchestration, cart state, promo validation, address validation, and order confirmation fallback clearly separated from non-critical browse, recommendation, and chatbot paths.'],
    risks: ['Retail revenue can fail through UI coupling even when backend checkout services remain healthy.'],
    validation_needed: ['Confirm checkout route isolation, cart persistence, payment redirect/fallback, inventory promise behavior, promo error handling, retry/idempotency UX, and synthetic checkout tests.'],
    citations: ['ArchitectIQ UI baseline: checkout UX must be tested as a critical path.'],
  },
  {
    id: 'retail-design-system-accessibility-template',
    title: 'Retail Design System Accessibility Template',
    tags: ['design-system', 'accessibility', 'a11y', 'i18n'],
    controls: ['Use a governed design system with tokens, components, form patterns, content rules, accessibility checks, localization, and regression tests for checkout, admin, support, and mobile interfaces.'],
    risks: ['Inconsistent components and untested accessibility can create conversion loss, legal exposure, and slow rollout across brands/regions.'],
    validation_needed: ['Confirm WCAG target, keyboard/screen-reader coverage, form error standards, locale/currency rules, component ownership, and visual regression gates.'],
    citations: ['ArchitectIQ UI baseline: UI components require accessibility, localization, and regression evidence.'],
  },
  {
    id: 'retail-frontend-performance-delivery-template',
    title: 'Retail Frontend Performance Delivery Template',
    tags: ['performance', 'cdn', 'image', 'web-vitals'],
    controls: ['Set frontend performance budgets for Core Web Vitals, bundle size, route hydration, image optimization, CDN caching, edge delivery, third-party scripts, and mobile network behavior.'],
    risks: ['Large bundles, poor image delivery, or uncontrolled third-party scripts can hurt conversion and inflate CDN/observability cost.'],
    validation_needed: ['Confirm performance budgets, CDN/image strategy, cache rules, third-party script governance, mobile network tests, and peak campaign synthetic monitoring.'],
    citations: ['ArchitectIQ UI baseline: retail UI must budget performance as architecture, not styling.'],
  },
  {
    id: 'retail-ui-auth-session-template',
    title: 'Retail UI Auth Session Template',
    tags: ['auth', 'session', 'account', 'admin'],
    controls: ['Define frontend auth/session boundaries for customer, admin, associate, support, marketplace partner, and AI-assisted experiences using OIDC/OAuth, step-up auth, CSRF/XSS controls, secure cookies, device posture, and role-aware navigation.'],
    risks: ['Weak session boundaries can expose account, order, loyalty, support, or admin functions despite secure backend APIs.'],
    validation_needed: ['Confirm auth flows, token storage, cookie/session settings, step-up actions, CSRF/XSS controls, support/admin roles, logout/device revocation, and audit requirements.'],
    citations: ['ArchitectIQ UI baseline: UI auth and session handling must align to API/security controls.'],
  },
  {
    id: 'retail-admin-support-ui-template',
    title: 'Retail Admin Support UI Template',
    tags: ['admin', 'support', 'backoffice', 'operations'],
    controls: ['Admin/support UI must expose least-privilege workflows, maker-checker approval where needed, audit trails, redaction, reversible operations, bulk-action safeguards, and operational dashboards.'],
    risks: ['Privileged backoffice screens are often the highest-risk retail UI surface because they can mutate customer, order, inventory, price, promo, and support data.'],
    validation_needed: ['Confirm admin roles, privileged actions, maker-checker gates, audit fields, redaction, bulk-operation safeguards, rollback, and support-access evidence.'],
    citations: ['ArchitectIQ UI baseline: privileged UI workflows need explicit approval and audit controls.'],
  },
  {
    id: 'retail-ui-observability-experimentation-template',
    title: 'Retail UI Observability Experimentation Template',
    tags: ['observability', 'rum', 'experimentation', 'analytics'],
    controls: ['Instrument frontend errors, RUM, Core Web Vitals, checkout funnel, search zero-results, recommendation exposure, consent-aware analytics, feature flags, A/B tests, release rings, and rollback triggers.'],
    risks: ['Without journey telemetry and feature controls, UI releases can reduce conversion or break checkout without fast detection.'],
    validation_needed: ['Confirm RUM metrics, error budgets, funnel events, consent gating, feature flags, experiment ownership, rollback thresholds, alert routing, and retention/residency of telemetry.'],
    citations: ['ArchitectIQ UI baseline: UI architecture requires journey observability and rollback evidence.'],
  },
];

function tokenize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9+\-/ ]/g, ' ').split(/\s+/).filter(token => token.length > 2);
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function docText(doc) {
  return [doc.id, doc.title, doc.tags, doc.version, doc.effective_date, doc.review_by, doc.freshness_status, doc.freshness_notes, doc.controls, doc.risks, doc.validation_needed, doc.citations].flat(3).join(' ');
}

function citationsForDoc(doc) {
  if (Array.isArray(doc.citations) && doc.citations.length) {
    return doc.citations.map(item => typeof item === 'object' ? item : {
      source_id: doc.id,
      title: doc.title,
      snippet: String(item),
      source_path: doc.source_path || 'agents/ui/uiKnowledgeBase.js',
      version: doc.version || 'built-in',
      effective_date: doc.effective_date || 'current ArchitectIQ baseline',
      review_by: doc.review_by || 'not stated',
      freshness_status: doc.freshness_status || 'baseline',
    });
  }
  const snippet = (doc.controls || doc.risks || doc.validation_needed || [])[0];
  if (!snippet) return [];
  return [{
    source_id: doc.id,
    title: doc.title,
    snippet,
    source_path: doc.source_path || 'agents/ui/uiKnowledgeBase.js',
    version: doc.version || 'built-in',
    effective_date: doc.effective_date || 'current ArchitectIQ baseline',
    review_by: doc.review_by || 'not stated',
    freshness_status: doc.freshness_status || 'baseline',
  }];
}

function retrieveUiKnowledge({ query = '', retrievalPlan = [], signals = {}, limit = 7 } = {}) {
  const allDocs = [...loadUiPolicyDocuments(), ...UI_KNOWLEDGE_DOCS];
  const queryTokens = new Set(tokenize([query, retrievalPlan.join(' '), Object.entries(signals).filter(([, value]) => value === true).map(([key]) => key).join(' ')].join(' ')));
  const requested = new Set((retrievalPlan || []).map(String));
  const candidates = allDocs.map(doc => {
    const tokens = tokenize(docText(doc));
    const overlap = tokens.reduce((score, token) => score + (queryTokens.has(token) ? 1 : 0), 0);
    const planBoost = requested.has(doc.id) ? 12 : 0;
    const tagBoost = (doc.tags || []).reduce((score, tag) => score + (queryTokens.has(String(tag).toLowerCase()) ? 3 : 0), 0);
    return { doc, score: overlap + planBoost + tagBoost };
  }).filter(item => item.score > 0 || requested.has(item.doc.id));
  const byId = new Map();
  for (const item of candidates) {
    const existing = byId.get(item.doc.id);
    const itemIsPolicy = Boolean(item.doc.source);
    const existingIsPolicy = Boolean(existing?.doc?.source);
    if (!existing || (itemIsPolicy && !existingIsPolicy) || (itemIsPolicy === existingIsPolicy && item.score > existing.score)) byId.set(item.doc.id, item);
  }
  const scored = [...byId.values()].sort((a, b) => b.score - a.score).slice(0, limit).map(item => ({ ...item.doc, score: item.score }));
  const freshnessValidation = unique(scored.flatMap(doc => {
    if (!doc.freshness_status || doc.freshness_status === 'current' || doc.freshness_status === 'baseline') return [];
    return (doc.freshness_notes || [`Policy freshness status is ${doc.freshness_status}.`]).map(note => `Policy freshness review required for ${doc.id}: ${note}`);
  }));
  return {
    tool: 'retrieveUiKnowledgeTool',
    source: 'local-ui-knowledge-base',
    docs: scored.map(doc => ({
      id: doc.id,
      title: doc.title,
      score: doc.score,
      tags: doc.tags,
      source: doc.source || 'built-in',
      source_path: doc.source_path || null,
      version: doc.version || '2026.07',
      effective_date: doc.effective_date || null,
      review_by: doc.review_by || null,
      freshness_status: doc.freshness_status || 'baseline',
      freshness_notes: doc.freshness_notes || [],
    })),
    controls: unique(scored.flatMap(doc => doc.controls || [])),
    risks: unique(scored.flatMap(doc => doc.risks || [])).map(item => ({
      risk: item,
      severity: /checkout|admin|session|payment|legal|conversion|privileged/i.test(item) ? 'High' : 'Medium',
      likelihood: 'Medium',
      fix: 'Attach UI owner, journey evidence, API dependency map, security/compliance validation, performance budget, observability, and release rollback gates before approval.',
    })),
    validation_needed: unique([...scored.flatMap(doc => doc.validation_needed || []), ...freshnessValidation]),
    citations: scored.flatMap(citationsForDoc).map(citation => ({ ...citation, evidence_status: citation.evidence_status || 'baseline' })).slice(0, 12),
    policy_inventory: allDocs.map(doc => ({
      id: doc.id,
      title: doc.title,
      source: doc.source || 'built-in',
      source_path: doc.source_path || null,
      version: doc.version || null,
      owner: doc.owner || null,
      effective_date: doc.effective_date || null,
      review_by: doc.review_by || null,
      freshness_status: doc.freshness_status || 'baseline',
      freshness_notes: doc.freshness_notes || [],
    })),
  };
}

module.exports = {
  UI_KNOWLEDGE_DOCS,
  retrieveUiKnowledge,
};
