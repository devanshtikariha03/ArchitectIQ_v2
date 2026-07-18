function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const STORAGE_SIGNAL_DOMAINS = [
  {
    id: 'systems_of_record',
    label: 'Systems of record and transactional truth',
    retrievalHints: ['retail-systems-of-record-storage-template'],
    aliases: ['system of record', 'source of truth', 'transactional truth', 'order', 'payment metadata', 'inventory authority', 'ledger', 'reservation'],
  },
  {
    id: 'oltp_platform',
    label: 'OLTP database platform',
    retrievalHints: ['retail-oltp-storage-template'],
    aliases: ['oltp', 'postgres', 'postgresql', 'mysql', 'sql', 'relational', 'database', 'transaction', 'acid', 'consistency'],
  },
  {
    id: 'cache_search_read_models',
    label: 'Cache, search, and read models',
    retrievalHints: ['retail-cache-search-read-model-template'],
    aliases: ['cache', 'redis', 'memcached', 'search', 'opensearch', 'elasticsearch', 'read model', 'catalog', 'faceting', 'index'],
  },
  {
    id: 'object_document_storage',
    label: 'Object, document, and media storage',
    retrievalHints: ['retail-object-document-storage-template'],
    aliases: ['object storage', 'blob', 's3', 'gcs', 'file', 'document', 'image', 'media', 'invoice', 'receipt'],
  },
  {
    id: 'backup_recovery_retention',
    label: 'Backup, recovery, retention, and deletion',
    retrievalHints: ['retail-backup-retention-storage-template'],
    aliases: ['backup', 'restore', 'recovery', 'rpo', 'rto', 'retention', 'deletion', 'dsar', 'archive', 'replication'],
  },
  {
    id: 'analytics_event_handoff',
    label: 'Analytics, events, and downstream data handoff',
    retrievalHints: ['retail-analytics-event-storage-template'],
    aliases: ['analytics', 'warehouse', 'lake', 'event', 'stream', 'cdc', 'etl', 'elt', 'reporting', 'bi'],
  },
  {
    id: 'data_residency_security',
    label: 'Data residency, security, and access controls',
    retrievalHints: ['retail-storage-security-residency-template'],
    aliases: ['residency', 'region', 'encryption', 'kms', 'hsm', 'key', 'pci', 'pii', 'privacy', 'support access', 'audit'],
  },
];

function matchAliases(text, aliases) {
  return aliases.filter(alias => {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(alias)}([^a-z0-9]|$)`, 'i');
    return pattern.test(text);
  });
}

function classifyStorageSignals({ query = '', context = {}, state = {}, signals = {} } = {}) {
  const text = normalize([
    query,
    typeof context === 'string' ? context : JSON.stringify(context || {}),
    typeof state === 'string' ? state : JSON.stringify(state || {}),
  ].join(' '));
  const domains = STORAGE_SIGNAL_DOMAINS.map(domain => {
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
  if (!domains.length) possibleMisses.push('No strong storage domain was detected; ask for systems of record, data stores, cache/search, backup, retention, and residency needs.');
  if (signals.commerce && !domains.some(domain => domain.id === 'systems_of_record')) possibleMisses.push('Commerce is in scope, but source-of-truth/storage ownership language was weak or indirect.');
  if (signals.multiRegion && !domains.some(domain => domain.id === 'backup_recovery_retention')) possibleMisses.push('Multi-region/residency is in scope, but backup/replication/recovery storage language was weak or indirect.');

  return {
    tool: 'classifyStorageSignals',
    domains,
    retrieval_hints: [...new Set(domains.flatMap(domain => domain.retrieval_hints))],
    confidence_summary: {
      high: domains.filter(domain => domain.confidence === 'high').length,
      medium: domains.filter(domain => domain.confidence === 'medium').length,
      low: domains.filter(domain => domain.confidence === 'low').length,
    },
    error_modes: {
      possible_false_positives: domains.filter(domain => domain.confidence === 'low').map(domain => `Low-confidence storage signal for ${domain.label}; confirm whether this storage domain is actually in scope.`),
      possible_false_negatives: possibleMisses,
      note: 'Storage signal classification is a routing aid. Data owners, storage owners, security, compliance, infrastructure, technology, and FinOps owners must validate final choices.',
    },
  };
}

module.exports = {
  STORAGE_SIGNAL_DOMAINS,
  classifyStorageSignals,
};
