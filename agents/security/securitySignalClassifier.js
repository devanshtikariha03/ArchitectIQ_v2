function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SECURITY_SIGNAL_DOMAINS = [
  {
    id: 'payment_pci',
    label: 'Payment and PCI scope',
    retrievalHints: ['pci-scope-and-tokenization-boundary-template'],
    aliases: [
      'payment', 'payments', 'pci', 'pci-dss', 'pan', 'sad', 'cardholder', 'cardholder data',
      'chd', 'cde', 'psp', 'p2pe', 'token vault', 'token references', 'tokenized card',
      'tokenised card', 'stored credential', 'stored credentials', 'acquirer token',
      'acquirer token references', 'wallet', 'upi', 'bnpl', 'refund', 'chargeback',
    ],
  },
  {
    id: 'ai_rag_tooling',
    label: 'AI, RAG, model, and tool security',
    retrievalHints: ['retail-ai-rag-tool-security-playbook'],
    aliases: [
      'ai', 'agentic', 'llm', 'rag', 'retrieval augmented', 'embedding', 'vector',
      'semantic search', 'chatbot', 'copilot', 'model route', 'recommendation model',
      'prompt', 'completion', 'tool call', 'tool invocation', 'model telemetry',
      'prompt injection', 'retrieval leakage', 'system prompt',
    ],
  },
  {
    id: 'customer_privacy',
    label: 'Customer, loyalty, privacy, and support data',
    retrievalHints: ['retail-privacy-support-access-redaction-standard'],
    aliases: [
      'customer', 'pii', 'personal data', 'personally identifiable', 'phone', 'address',
      'profile', 'loyalty', 'customer 360', 'cdp', 'consent', 'dsar', 'erasure',
      'support transcript', 'support ticket', 'privacy', 'gdpr', 'ccpa', 'dpdp',
      'privacy act', 'retention', 'deletion',
    ],
  },
  {
    id: 'partner_b2b_ingestion',
    label: 'B2B ingestion, partner, and supplier feed security',
    retrievalHints: ['partner-marketplace-security', 'b2b-ingestion-security'],
    aliases: [
      'b2b', '3pl', 'supplier', 'supplier feed', 'seller', 'marketplace', 'partner',
      'carrier', 'wms', 'erp', 'edi', 'sftp', 'asn', 'csv', 'xml', 'file feed',
      'webhook', 'payload validation', 'schema validation', 'malware scanning',
      'quarantine', 'source authentication', 'reconciliation', 'inventory feed',
    ],
  },
  {
    id: 'configuration_drift',
    label: 'Continuous configuration drift',
    retrievalHints: ['continuous-configuration-drift-security'],
    aliases: [
      'drift', 'configuration drift', 'cloud posture', 'cloud config', 'terraform',
      'iac', 'infrastructure as code', 'ci/cd', 'cicd', 'pipeline', 'pull request',
      'github', 'public bucket', 'public storage', 's3 bucket', 'blob container',
      'iam policy', 'role expansion', 'security group', 'firewall rule',
      'policy-as-code', 'policy as code',
    ],
  },
  {
    id: 'fraud_policy_abuse',
    label: 'Retail fraud and policy abuse',
    retrievalHints: ['retail-fraud-policy-abuse-security'],
    aliases: [
      'fraud', 'policy abuse', 'business logic abuse', 'loyalty point', 'loyalty draining',
      'benefit redemption', 'stored value', 'stored value instrument', 'gift card',
      'voucher balance', 'balance check', 'coupon', 'promotion loop', 'promo loop',
      'coupon stacking', 'refund abuse', 'return fraud', 'counterfeit return',
      'delivery failure', 'false delivery', 'delivery dispute', 'delivery-dispute',
      'reverse logistics', 'reverse-logistics', 'substitution fraud', 'serial return',
      'fraud ring', 'unauthorised benefit', 'unauthorized benefit',
    ],
  },
  {
    id: 'privileged_operations',
    label: 'Privileged backoffice and support operations',
    retrievalHints: ['privileged-operations-security'],
    aliases: [
      'admin', 'backoffice', 'back office', 'privileged', 'support impersonation',
      'price override', 'promotion setup', 'manual adjustment', 'manual order',
      'refund approval', 'account recovery', 'maker checker', 'maker-checker',
      'four eyes', 'segregation of duties',
    ],
  },
  {
    id: 'multi_region_residency',
    label: 'Multi-region residency and cross-border transfer',
    retrievalHints: ['multi-region-data-security'],
    aliases: [
      'multi-region', 'multi region', 'global', 'regional', 'residency', 'sovereignty',
      'cross-border', 'cross border', 'approved region', 'eu', 'uk', 'us', 'india',
      'australia', 'new zealand', 'processor location', 'support location',
    ],
  },
  {
    id: 'store_edge_offline',
    label: 'Store edge, POS, and offline operation',
    retrievalHints: ['store-edge-offline-security-acceptance-tests'],
    aliases: [
      'store edge', 'store-edge', 'pos', 'point of sale', 'offline checkout',
      'offline trading', 'wan outage', 'local queue', 'queue replay',
      'associate mobile', 'store device', 'store appliance',
    ],
  },
];

function matchAliases(text, aliases) {
  return aliases.filter(alias => {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(alias)}([^a-z0-9]|$)`, 'i');
    return pattern.test(text);
  });
}

function classifySecuritySignals({ query = '', context = {}, state = {}, signals = {} } = {}) {
  const text = normalize([
    query,
    typeof context === 'string' ? context : JSON.stringify(context || {}),
    typeof state === 'string' ? state : JSON.stringify(state || {}),
  ].join(' '));
  const domains = SECURITY_SIGNAL_DOMAINS.map(domain => {
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

  const retrievalHints = [...new Set(domains.flatMap(domain => domain.retrieval_hints))];
  const lowConfidence = domains
    .filter(domain => domain.confidence === 'low')
    .map(domain => `Low-confidence security signal for ${domain.label}; confirm whether this domain is actually in scope.`);
  const likelyMisses = [];
  if (!domains.length) {
    likelyMisses.push('No strong security domain was detected from the request; ask for data inventory, regulated workflows, integrations, and operational security context.');
  }
  if (signals.payments && !domains.some(domain => domain.id === 'payment_pci')) {
    likelyMisses.push('Retail context indicates payments, but payment/PCI language was weak or indirect.');
  }
  if (signals.retailAi && !domains.some(domain => domain.id === 'ai_rag_tooling')) {
    likelyMisses.push('Retail context indicates AI, but AI/RAG/tooling language was weak or indirect.');
  }

  return {
    tool: 'classifySecuritySignals',
    domains,
    retrieval_hints: retrievalHints,
    confidence_summary: {
      high: domains.filter(domain => domain.confidence === 'high').length,
      medium: domains.filter(domain => domain.confidence === 'medium').length,
      low: domains.filter(domain => domain.confidence === 'low').length,
    },
    error_modes: {
      possible_false_positives: lowConfidence,
      possible_false_negatives: likelyMisses,
      note: 'Signal classification is a routing aid. Human review and optional model judgment should validate ambiguous or novel wording.',
    },
  };
}

module.exports = {
  SECURITY_SIGNAL_DOMAINS,
  classifySecuritySignals,
};
