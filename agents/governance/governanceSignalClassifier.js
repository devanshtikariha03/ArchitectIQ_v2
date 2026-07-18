function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const GOVERNANCE_SIGNAL_DOMAINS = [
  {
    id: 'systems_of_record',
    label: 'Systems of record and ownership',
    retrievalHints: ['retail-systems-of-record-template'],
    aliases: ['system of record', 'source of truth', 'owner', 'ownership', 'catalogue', 'price', 'promotion', 'cart', 'checkout', 'order', 'inventory', 'fulfilment', 'returns', 'audit'],
  },
  {
    id: 'adr_decision_governance',
    label: 'ADR and decision governance',
    retrievalHints: ['retail-adr-and-approval-gate-template'],
    aliases: ['adr', 'architecture decision', 'decision record', 'rejected alternative', 'accepted risk', 'approval', 'decision owner', 'architecture board'],
  },
  {
    id: 'integration_replay',
    label: 'Integration replay and reconciliation',
    retrievalHints: ['retail-integration-replay-and-reconciliation-checklist'],
    aliases: ['idempotency', 'retry', 'dlq', 'dead letter', 'replay', 'reconciliation', 'duplicate', 'manual correction', 'schema registry', 'event backbone'],
  },
  {
    id: 'rollout_readiness',
    label: 'Rollout and operational readiness',
    retrievalHints: ['retail-rollout-readiness-gate-template'],
    aliases: ['rollout', 'pilot', 'wave', 'rollback', 'runbook', 'game day', 'acceptance test', 'go-live', 'support handoff', 'on-call'],
  },
  {
    id: 'security_compliance_handoff',
    label: 'Security and compliance governance handoff',
    retrievalHints: ['security-to-governance-handoff-checklist', 'compliance-to-governance-handoff-checklist'],
    aliases: ['security handoff', 'compliance handoff', 'pci', 'privacy', 'residency', 'processor', 'data classification', 'trust boundary', 'qsa'],
  },
  {
    id: 'finops_budget_gate',
    label: 'FinOps and budget governance',
    retrievalHints: ['finops-to-governance-handoff-template'],
    aliases: ['finops', 'budget', 'cost', 'pricing', 'unit driver', 'support plan', 'non-prod', 'contingency', 'licensing'],
  },
  {
    id: 'retail_ai_governance',
    label: 'Retail AI governance',
    retrievalHints: ['retail-ai-governance-gate-template'],
    aliases: ['ai', 'llm', 'rag', 'model', 'prompt', 'embedding', 'vector', 'tool', 'human escalation', 'eval', 'fallback'],
  },
  {
    id: 'store_edge_governance',
    label: 'Store edge rollout governance',
    retrievalHints: ['store-edge-governance-template'],
    aliases: ['store edge', 'pos', 'offline', 'wan outage', 'associate mobile', 'store rollout', 'queue replay', 'field replacement'],
  },
];

function matchAliases(text, aliases) {
  return aliases.filter(alias => {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(alias)}([^a-z0-9]|$)`, 'i');
    return pattern.test(text);
  });
}

function classifyGovernanceSignals({ query = '', context = {}, state = {}, signals = {} } = {}) {
  const text = normalize([
    query,
    typeof context === 'string' ? context : JSON.stringify(context || {}),
    typeof state === 'string' ? state : JSON.stringify(state || {}),
  ].join(' '));
  const domains = GOVERNANCE_SIGNAL_DOMAINS.map(domain => {
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
  if (!domains.length) possibleMisses.push('No strong governance domain was detected; ask for systems of record, decision owners, rollout gates, and approval process.');
  if ((signals.payments || signals.customerData) && !domains.some(domain => domain.id === 'security_compliance_handoff')) {
    possibleMisses.push('Retail security/compliance context exists, but governance handoff language was weak or indirect.');
  }
  if (signals.retailAi && !domains.some(domain => domain.id === 'retail_ai_governance')) {
    possibleMisses.push('Retail AI context exists, but AI governance language was weak or indirect.');
  }

  return {
    tool: 'classifyGovernanceSignals',
    domains,
    retrieval_hints: [...new Set(domains.flatMap(domain => domain.retrieval_hints))],
    confidence_summary: {
      high: domains.filter(domain => domain.confidence === 'high').length,
      medium: domains.filter(domain => domain.confidence === 'medium').length,
      low: domains.filter(domain => domain.confidence === 'low').length,
    },
    error_modes: {
      possible_false_positives: domains.filter(domain => domain.confidence === 'low').map(domain => `Low-confidence governance signal for ${domain.label}; confirm whether this domain is actually in scope.`),
      possible_false_negatives: possibleMisses,
      note: 'Governance signal classification is a routing aid. Architecture owners must validate decision authority, evidence, and approvals.',
    },
  };
}

module.exports = {
  GOVERNANCE_SIGNAL_DOMAINS,
  classifyGovernanceSignals,
};
