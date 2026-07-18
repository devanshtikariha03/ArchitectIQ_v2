function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const COMPLIANCE_SIGNAL_DOMAINS = [
  {
    id: 'payment_pci',
    label: 'Payment and PCI compliance',
    retrievalHints: ['pci-privacy-and-support-access-evidence-checklist'],
    aliases: ['payment', 'payments', 'pci', 'pci-dss', 'pan', 'sad', 'cardholder', 'chd', 'cde', 'psp', 'p2pe', 'token vault', 'stored credential', 'chargeback', 'refund'],
  },
  {
    id: 'privacy_customer_data',
    label: 'Customer privacy and data rights',
    retrievalHints: ['retail-compliance-playbook', 'retail-retention-deletion-dsar-control-template'],
    aliases: ['customer', 'pii', 'personal data', 'loyalty', 'profile', 'consent', 'privacy', 'dsar', 'erasure', 'deletion', 'retention', 'support transcript', 'gdpr', 'ccpa', 'cpra', 'dpdp', 'privacy act'],
  },
  {
    id: 'residency_cross_border',
    label: 'Residency and cross-border transfer',
    retrievalHints: ['retail-residency-and-processor-matrix'],
    aliases: ['residency', 'data residency', 'sovereignty', 'cross-border', 'cross border', 'approved region', 'regional', 'eu', 'uk', 'us', 'india', 'australia', 'new zealand', 'support location', 'processor location'],
  },
  {
    id: 'processor_subprocessor',
    label: 'Processor and subprocessor governance',
    retrievalHints: ['retail-residency-and-processor-matrix'],
    aliases: ['processor', 'subprocessor', 'dpa', 'vendor', 'saas', 'support access', 'crm', 'erp', 'helpdesk', 'observability', 'analytics', 'ticketing', 'logistics', '3pl', 'supplier'],
  },
  {
    id: 'ai_data_processing',
    label: 'AI/RAG data processing compliance',
    retrievalHints: ['retail-ai-data-residency-review-template'],
    aliases: ['ai', 'llm', 'rag', 'prompt', 'completion', 'embedding', 'vector', 'eval trace', 'model telemetry', 'no-training', 'no retention', 'chatbot', 'copilot', 'automated decision'],
  },
  {
    id: 'audit_evidence',
    label: 'Audit evidence and access review',
    retrievalHints: ['retail-compliance-playbook', 'security-to-compliance-handoff-checklist'],
    aliases: ['audit', 'evidence', 'access review', 'access log', 'support access', 'approval', 'attestation', 'soc 2', 'iso 27001', 'qsa', 'legal owner', 'privacy owner'],
  },
  {
    id: 'children_minor_data',
    label: 'Children or minor data privacy',
    retrievalHints: ['children-minor-privacy-template'],
    aliases: ['child', 'children', 'minor', 'kids', 'coppa', 'gdpr-k', 'parental consent', 'age gate', 'student'],
  },
  {
    id: 'marketplace_franchise',
    label: 'Marketplace, seller, franchise, and partner data sharing',
    retrievalHints: ['marketplace-franchise-compliance-template'],
    aliases: ['marketplace', 'seller', 'franchise', 'brand', 'partner', 'supplier', 'data sharing', 'joint controller', 'joint processing', 'export approval', 'seller portal'],
  },
  {
    id: 'workforce_privacy',
    label: 'Employee, associate, and workforce privacy',
    retrievalHints: ['employee-workforce-privacy-template'],
    aliases: ['employee', 'workforce', 'staff', 'associate', 'badge', 'cctv', 'biometric', 'productivity monitoring', 'worker', 'labour', 'labor'],
  },
  {
    id: 'regulated_retail_edge',
    label: 'Regulated retail sector edge case',
    retrievalHints: ['regulated-retail-edge-template'],
    aliases: ['pharmacy', 'prescription', 'health', 'medical', 'financial', 'credit', 'lending', 'insurance', 'regulated', 'hipaa', 'glba', 'apra', 'cps 234'],
  },
  {
    id: 'vague_compliance_claim',
    label: 'Vague compliance claim',
    retrievalHints: ['retail-compliance-playbook'],
    aliases: ['must be compliant', 'fully compliant', 'compliance required', 'regulatory compliant', 'make it compliant', 'compliant architecture'],
  },
];

function matchAliases(text, aliases) {
  return aliases.filter(alias => {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(alias)}([^a-z0-9]|$)`, 'i');
    return pattern.test(text);
  });
}

function classifyComplianceSignals({ query = '', context = {}, state = {}, signals = {} } = {}) {
  const text = normalize([
    query,
    typeof context === 'string' ? context : JSON.stringify(context || {}),
    typeof state === 'string' ? state : JSON.stringify(state || {}),
  ].join(' '));
  const domains = COMPLIANCE_SIGNAL_DOMAINS.map(domain => {
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

  const likelyMisses = [];
  if (!domains.length) {
    likelyMisses.push('No strong compliance domain was detected; ask for jurisdictions, data classes, processors, residency, retention, and support-access requirements.');
  }
  if (signals.payments && !domains.some(domain => domain.id === 'payment_pci')) {
    likelyMisses.push('Retail context indicates payments, but PCI/payment compliance language was weak or indirect.');
  }
  if (signals.retailAi && !domains.some(domain => domain.id === 'ai_data_processing')) {
    likelyMisses.push('Retail context indicates AI, but prompt/completion/vector/eval compliance language was weak or indirect.');
  }

  return {
    tool: 'classifyComplianceSignals',
    domains,
    retrieval_hints: [...new Set(domains.flatMap(domain => domain.retrieval_hints))],
    confidence_summary: {
      high: domains.filter(domain => domain.confidence === 'high').length,
      medium: domains.filter(domain => domain.confidence === 'medium').length,
      low: domains.filter(domain => domain.confidence === 'low').length,
    },
    error_modes: {
      possible_false_positives: domains
        .filter(domain => domain.confidence === 'low')
        .map(domain => `Low-confidence compliance signal for ${domain.label}; confirm whether this domain is actually in scope.`),
      possible_false_negatives: likelyMisses,
      note: 'Compliance signal classification is a routing aid. Legal/privacy owners must validate applicability and evidence.',
    },
  };
}

module.exports = {
  COMPLIANCE_SIGNAL_DOMAINS,
  classifyComplianceSignals,
};
