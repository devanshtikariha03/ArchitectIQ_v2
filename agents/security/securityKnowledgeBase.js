const { loadSecurityPolicyDocuments } = require('./securityPolicyIngestion');

const SECURITY_KNOWLEDGE_DOCS = [
  {
    id: 'retail-security-control-playbook',
    title: 'Retail Security Control Playbook',
    tags: ['retail', 'security', 'iam', 'waf', 'mfa', 'secrets', 'audit', 'zero-trust'],
    controls: [
      'Apply zero-trust access across customer, associate, admin, service, and third-party paths with MFA/passwordless controls and step-up verification for high-risk actions.',
      'Use WAF/CDN/bot controls, API rate limits, circuit breakers, and workload isolation so browse/search surges cannot saturate checkout, payment, order, or inventory-lock paths.',
      'Assign explicit owners for IAM, secrets, KMS/HSM keys, certificates, audit review, incident response, security exceptions, and support-access approvals.',
    ],
    risks: [
      'Revenue-critical checkout and inventory-lock paths can be exposed to campaign traffic or bot abuse if edge controls and isolation are not explicit.',
      'Privileged admin and support access can become the weakest path if it is not logged, time-bounded, and approved by named owners.',
    ],
    validation_needed: [
      'Confirm admin, support, service, and third-party roles; MFA/step-up policy; privileged access logging; exception ownership; and incident response owner.',
      'Confirm WAF/bot/rate-limit rules, critical-path isolation, and evidence from campaign or flash-sale tests.',
    ],
  },
  {
    id: 'retail-data-classification-and-encryption-standard',
    title: 'Retail Data Classification And Encryption Standard',
    tags: ['data', 'classification', 'encryption', 'pii', 'loyalty', 'support', 'logs'],
    controls: [
      'Classify customer, loyalty, support transcript, profile, auth/session, payment-adjacent, and sensitive audit data as C5/C5E unless the client proves a lower class.',
      'Encrypt before tokenisation or masking: TLS/mTLS in transit, managed KMS/HSM or customer-managed keys at rest, and field/application-layer encryption for C5E data.',
      'Redact or suppress PAN, PII, loyalty identifiers, auth tokens, support transcript content, secrets, and payment-sensitive values from logs, traces, prompts, eval datasets, analytics exports, and support bundles.',
    ],
    risks: [
      'Masking and tokenisation can be incorrectly treated as substitutes for encryption, key ownership, and lifecycle control.',
      'Logs, traces, prompt payloads, exports, and support bundles often become hidden data stores with weaker controls than the primary database.',
    ],
    validation_needed: [
      'Map each sensitive data class to applications, APIs, stores, queues, caches, logs, traces, prompts, vector stores, backups, support tools, analytics, and exports.',
      'Confirm encryption mode, key owner, key rotation, certificate lifecycle, log redaction, and deletion/retention handling for every C5/C5E path.',
    ],
  },
  {
    id: 'pci-scope-and-tokenization-boundary-template',
    title: 'PCI Scope And Tokenisation Boundary Template',
    tags: ['pci', 'payment', 'pan', 'sad', 'psp', 'p2pe', 'token-vault', 'refund'],
    controls: [
      'Keep raw PAN/SAD outside internal systems unless the client explicitly accepts PCI scope; use PSP, P2PE, and token-vault boundaries with documented ownership.',
      'Segment payment orchestration, refund state, fraud signals, support tickets, logs, analytics exports, AI prompts, and vector stores from raw cardholder data.',
      'Block PAN/SAD in schemas, logs, traces, support transcripts, prompt assembly, eval datasets, and exports using DLP tests and security-owner review.',
    ],
    risks: [
      'PCI scope can expand through support tickets, logs, analytics, refund workflows, AI prompts, vector stores, or operational exports.',
      'Payment-token metadata can still be sensitive if it links customers, orders, refunds, fraud decisions, and support conversations.',
    ],
    validation_needed: [
      'Confirm PSPs, payment methods, token-vault owner, P2PE boundary, refund workflow, payment state store, and whether any raw cardholder data enters internal systems.',
      'Collect QSA/security-owner validation for segmentation evidence, PAN/SAD exclusion, log filtering, support access, encryption, and breach responsibilities.',
    ],
  },
  {
    id: 'retail-ai-rag-tool-security-playbook',
    title: 'Retail AI RAG Tool Security Playbook',
    tags: ['ai', 'rag', 'llm', 'vector', 'embedding', 'prompt', 'tool', 'chatbot', 'recommendation'],
    controls: [
      'Treat prompts, completions, embeddings, vector stores, eval traces, tool calls, model telemetry, and provider support access as data-processing paths.',
      'Use retrieval allowlists, metadata ACL filters, prompt-injection controls, citation/evidence checks, tool permission scopes, rate limits, and human escalation for high-risk actions.',
      'Redact PAN, PII, loyalty identifiers, support transcript content, secrets, auth tokens, payment-sensitive fields, and fraud signals before prompt assembly or embedding.',
      'Define model/provider fallback, no-training/no-retention terms, region/residency constraints, telemetry retention, eval retention, deletion propagation, and incident obligations.',
    ],
    risks: [
      'RAG can create an unapproved processor path for customer, loyalty, support, order, refund, and payment-adjacent data.',
      'Agent tools can mutate OMS, WMS, CRM, loyalty, refund, or account workflows without adequate authorization and human review.',
    ],
    validation_needed: [
      'Confirm source collections, embedding provider, vector store, region, deletion path, encryption/key ownership, retrieval ACL model, and prompt/completion telemetry.',
      'Confirm which tools can read or mutate OMS, WMS, CRM, loyalty, refund, account recovery, payment-status, customer profile, and support-ticket APIs.',
      'Confirm human escalation and customer re-verification rules for refunds, address changes, loyalty adjustments, account recovery, complaints, and payment disputes.',
    ],
  },
  {
    id: 'store-edge-offline-security-acceptance-tests',
    title: 'Store Edge Offline Security Acceptance Tests',
    tags: ['store-edge', 'pos', 'offline', 'queue', 'replay', 'device', 'inventory', 'checkout'],
    controls: [
      'Require device trust, full-disk encryption, secure boot or device posture, managed certificates, local secret protection, encrypted local queues, and offline access policy.',
      'Use idempotency keys, ordered replay, duplicate detection, conflict policy, reconnect criteria, and audit events for every offline checkout and inventory mutation.',
      'Define degraded-mode limits for refunds, loyalty changes, manual discounts, account updates, and payment workflows during WAN outage.',
    ],
    risks: [
      'Offline checkout can preserve sales while creating duplicate orders, replay attacks, inventory drift, audit gaps, or privacy exposure after reconnect.',
      'Store devices can retain C5/C5E data longer than central systems if local queues, logs, and support bundles are not encrypted and expired.',
    ],
    validation_needed: [
      'Run WAN outage, local queue durability, duplicate replay, reconnect, conflict resolution, device-loss, certificate-expiry, and field-support acceptance tests.',
      'Confirm local retention, queue encryption, local log redaction, support bundle handling, store-operator permissions, and emergency override policy.',
    ],
  },
  {
    id: 'trust-boundary-and-diagram-annotation-standard',
    title: 'Trust Boundary And Diagram Annotation Standard',
    tags: ['trust-boundary', 'diagram', 'annotation', 'network', 'saas', 'third-party', 'security-boundary'],
    controls: [
      'Show external security boundaries, trust boundaries, network zones, egress controls, SaaS processors, PSPs, AI/model providers, support tools, observability, and logistics partners explicitly in diagrams.',
      'Annotate credentials, auth strength, encryption at rest, encryption in transit, data class, security boundary, trust boundary, retention/residency status, and support-access ownership.',
      'Every cross-boundary flow needs owner, protocol, auth method, encryption mode, data class, logging/redaction decision, retry/replay behaviour, and incident owner.',
    ],
    risks: [
      'Architecture diagrams can look complete while hiding the riskiest external processor, support-access, AI telemetry, and logging paths.',
      'Unowned cross-boundary flows make incident response and compliance evidence slow or impossible.',
    ],
    validation_needed: [
      'Confirm all external processors, SaaS tools, provider support paths, observability exports, AI/model providers, PSPs, logistics partners, and admin/support paths.',
      'Confirm diagram annotations for A1/A2 credentials, CA1/CA2 auth, R2/R3 encryption at rest, T encryption in transit, C3/C5/C5E data class, SB boundary, and TB boundary.',
    ],
  },
  {
    id: 'retail-privacy-support-access-redaction-standard',
    title: 'Retail Privacy Support Access Redaction Standard',
    tags: ['privacy', 'support', 'redaction', 'dpdp', 'gdpr', 'ccpa', 'loyalty', 'customer'],
    controls: [
      'Support access to customer, loyalty, payment-adjacent, account, refund, and complaint data must be role-scoped, approval-gated, logged, monitored, and time-bounded.',
      'Apply privacy-aware redaction and minimisation across support transcripts, CRM notes, screenshots, debug bundles, exports, logs, traces, prompt payloads, and analytics workspaces.',
      'Define deletion/DSAR propagation for primary stores, search indexes, caches, logs, traces, prompts, embeddings, vector stores, eval datasets, exports, and support tickets.',
    ],
    risks: [
      'Support tooling can bypass application security controls and expose sensitive retail data to broad operational teams or vendors.',
      'Deletion and retention promises can fail when AI/vector stores, traces, exports, and support bundles are excluded from data maps.',
    ],
    validation_needed: [
      'Confirm support roles, approval workflow, break-glass process, monitoring, ticket evidence, vendor access, data minimisation, and transcript redaction.',
      'Confirm deletion/DSAR handling for logs, traces, analytics, vector stores, embeddings, eval datasets, support tickets, screenshots, and exports.',
    ],
  },
];

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+\-/ ]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
}

function docText(doc) {
  return [
    doc.id,
    doc.title,
    doc.tags,
    doc.version,
    doc.effective_date,
    doc.review_by,
    doc.freshness_status,
    doc.freshness_notes,
    doc.controls,
    doc.risks,
    doc.validation_needed,
    doc.compliance_mappings,
    doc.citations?.map(item => item.snippet),
  ].flat(3).join(' ');
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function citationsForDoc(doc) {
  if (Array.isArray(doc.citations) && doc.citations.length) return doc.citations;
  const snippet = (doc.controls || doc.risks || doc.validation_needed || [])[0];
  if (!snippet) return [];
  return [{
    source_id: doc.id,
    title: doc.title,
    snippet,
    source_path: doc.source_path || 'agents/security/securityKnowledgeBase.js',
    version: doc.version || 'built-in',
    effective_date: doc.effective_date || 'current ArchitectIQ baseline',
    review_by: doc.review_by || 'not stated',
    freshness_status: doc.freshness_status || 'baseline',
  }];
}

function retrieveSecurityKnowledge({ query = '', retrievalPlan = [], signals = {}, limit = 5 } = {}) {
  const allDocs = [
    ...SECURITY_KNOWLEDGE_DOCS,
    ...loadSecurityPolicyDocuments(),
  ];
  const queryTokens = new Set(tokenize([
    query,
    retrievalPlan.join(' '),
    Object.entries(signals).filter(([, value]) => value === true).map(([key]) => key).join(' '),
  ].join(' ')));
  const requested = new Set((retrievalPlan || []).map(String));

  const scored = allDocs.map(doc => {
    const tokens = tokenize(docText(doc));
    const overlap = tokens.reduce((score, token) => score + (queryTokens.has(token) ? 1 : 0), 0);
    const planBoost = requested.has(doc.id) ? 12 : 0;
    const tagBoost = (doc.tags || []).reduce((score, tag) => score + (queryTokens.has(String(tag).toLowerCase()) ? 3 : 0), 0);
    return { doc, score: overlap + planBoost + tagBoost };
  })
    .filter(item => item.score > 0 || requested.has(item.doc.id))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => ({ ...item.doc, score: item.score }));

  const controls = unique(scored.flatMap(item => item.controls || []));
  const risks = unique(scored.flatMap(item => item.risks || []));
  const validationNeeded = unique(scored.flatMap(item => item.validation_needed || []));
  const freshnessValidation = unique(scored.flatMap(item => {
    if (!item.freshness_status || item.freshness_status === 'current' || item.freshness_status === 'baseline') return [];
    return (item.freshness_notes || [`Policy freshness status is ${item.freshness_status}.`])
      .map(note => `Policy freshness review required for ${item.id}: ${note}`);
  }));
  const complianceMappings = unique(scored.flatMap(item => item.compliance_mappings || []));
  const citations = scored.flatMap(citationsForDoc).slice(0, 12);

  return {
    tool: 'retrieveSecurityKnowledgeTool',
    source: 'local-security-knowledge-base',
    docs: scored.map(item => ({
      id: item.id,
      title: item.title,
      score: item.score,
      tags: item.tags,
      source: item.source || 'built-in',
      source_path: item.source_path || null,
      version: item.version || null,
      effective_date: item.effective_date || null,
      review_by: item.review_by || null,
      freshness_status: item.freshness_status || 'baseline',
      freshness_notes: item.freshness_notes || [],
    })),
    controls,
    risks: risks.map(item => ({
      risk: item,
      severity: /pci|pan|payment|raw card|rag|agent tools|offline checkout|support tooling/i.test(item) ? 'High' : 'Medium',
      likelihood: 'Medium',
      fix: 'Apply retrieved security playbook controls and require named owner validation before client-ready approval.',
    })),
    validation_needed: unique([...validationNeeded, ...freshnessValidation]),
    compliance_mappings: complianceMappings,
    citations,
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
  SECURITY_KNOWLEDGE_DOCS,
  retrieveSecurityKnowledge,
};
