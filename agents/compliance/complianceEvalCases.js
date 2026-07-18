const COMPLIANCE_EVAL_CASES = [
  {
    id: 'global-retail-ai-payments-residency',
    name: 'Global retail AI payments residency review',
    query: [
      'Global retail marketplace operating in EU, UK, US, India, Australia, and New Zealand with customer PII, loyalty profiles, support transcripts, order data, payment tokens, PSP, refunds, RAG chatbot, embeddings, vector store, logs, traces, analytics exports, CRM, helpdesk, WMS, ERP, and vendor support access.',
      'Need compliance review for GDPR, CCPA/CPRA, India DPDP, Australian Privacy Act, PCI-DSS, residency, retention, deletion, DSAR, subprocessors, and support access.',
    ].join(' '),
    mustMatch: [
      ['evidence status', /assumption|partial|verified|evidence_status|evidence status/i],
      ['jurisdiction frameworks', /gdpr|ccpa|cpra|dpdp|australian privacy act|pci-dss/i],
      ['processor residency', /processor|subprocessor|residency|cross-border|support access/i],
      ['retention deletion dsar', /retention|deletion|dsar|erasure|consent/i],
      ['ai data processing', /prompt|completion|embedding|vector|telemetry|eval/i],
      ['payment pci', /pci|qsa|pan|sad|psp|token/i],
      ['human legal privacy review', /legal|privacy owner|human validation|approval|sign-off/i],
      ['qualification', /not legal advice|draft|audit attestation|certification/i],
      ['citations', /citation|source_id|baseline|policy/i],
    ],
  },
  {
    id: 'security-handoff-pci-ai-support',
    name: 'Compliance consumes Security handoff',
    query: [
      'Retail checkout and AI support design with payment orchestration, PSP token vault, support transcripts, customer loyalty data, AI prompt payloads, vector metadata, logs, traces, support access, and regional processing constraints.',
      'Security Agent has classified customer/support/payment-adjacent data as C5/C5E and flagged PCI/payment and AI/RAG tool security scope.',
    ].join(' '),
    state: {
      agent_outputs: {
        security: {
          agentId: 'security',
          graph_agent: { validation: { verdict: 'pass' } },
          payment_security: { in_scope: true },
          ai_security: { in_scope: true },
          security_signal_profile: {
            domains: [
              { id: 'payment_pci', confidence: 'high' },
              { id: 'ai_rag_tooling', confidence: 'high' },
            ],
          },
        },
      },
      data_classification: ['C5/C5E customer, loyalty, support transcript, payment-adjacent, prompt, and vector metadata'],
      payment_security: { in_scope: true },
      ai_security: { in_scope: true },
      security_signal_profile: {
        domains: [
          { id: 'payment_pci', confidence: 'high' },
          { id: 'ai_rag_tooling', confidence: 'high' },
        ],
      },
    },
    mustMatch: [
      ['security handoff', /security handoff|security-to-compliance|security_handoff|c5|c5e/i],
      ['pci evidence', /pci|qsa|psp|token.?vault|pan|sad/i],
      ['ai evidence', /prompt|completion|embedding|vector|telemetry|provider/i],
      ['support access', /support access|support transcript|debug bundle|ticket/i],
      ['evidence status', /assumption|partial|verified|evidence/i],
      ['qualification', /not legal advice|draft|legal\/privacy|audit attestation/i],
    ],
  },
  {
    id: 'offline-store-pos-retention',
    name: 'Offline store POS retention and support access',
    query: [
      'Retail store-edge POS supports offline checkout during WAN outage with local queues, payment token references, customer phone/email lookup, associate mobile app, support bundles, local logs, reconnect replay, and audit exports.',
      'Need compliance review for privacy, PCI, retention, deletion, local storage, support access, and audit evidence.',
    ].join(' '),
    mustMatch: [
      ['store edge processor path', /pos|offline|local queue|store|support bundle|local logs/i],
      ['payment pci', /pci|payment|token|pan|sad|qsa/i],
      ['retention deletion', /retention|deletion|dsar|backup|restore/i],
      ['audit evidence', /audit|evidence|access review|approval/i],
      ['residency processor', /region|residency|processor|support access/i],
    ],
  },
  {
    id: 'children-ai-content-privacy',
    name: 'Children AI content privacy review',
    query: [
      'Consumer AI product for kids where children draw characters and parents generate animated episodes. It stores child profile data, parental consent, prompts, generated media, moderation traces, model telemetry, support tickets, and deletion requests across 75 countries.',
      'Need compliance review for COPPA, GDPR-K, parental consent, age gate, retention, deletion, content moderation evidence, and processor obligations.',
    ].join(' '),
    mustMatch: [
      ['children privacy', /children|child|minor|kids|coppa|gdpr-k|parental consent|age gate/i],
      ['ai data processing', /prompt|model telemetry|moderation|generated media|eval|provider/i],
      ['retention deletion', /retention|deletion|dsar|erasure/i],
      ['legal privacy review', /legal|privacy owner|human validation|signoff|sign-off/i],
      ['qualification', /not legal advice|draft|certification|audit attestation/i],
    ],
  },
  {
    id: 'vague-compliance-request',
    name: 'Vague compliance request with missing jurisdiction',
    query: [
      'Build a compliant retail architecture for customer accounts, orders, support tickets, analytics, and audit reports.',
      'The request does not name countries, legal entities, processors, privacy frameworks, retention schedule, or support locations.',
    ].join(' '),
    mustMatch: [
      ['unspecified compliance', /unspecified compliance|missing|clarify|required frameworks|operating countries/i],
      ['evidence status', /assumption|missing|partial|verified|evidence/i],
      ['human validation', /legal|privacy owner|compliance owner|human validation|confirm/i],
      ['processor residency', /processor|subprocessor|residency|support access/i],
      ['qualification', /not legal advice|draft|certification|audit attestation/i],
    ],
  },
  {
    id: 'marketplace-franchise-data-sharing',
    name: 'Marketplace franchise and seller data sharing',
    query: [
      'Global retail marketplace and franchise platform with third-party sellers, brand operators, seller portal, partner support access, supplier feeds, order exports, return reconciliation, customer address sharing, logistics partners, and data-sharing agreements.',
      'Need compliance review for controller/processor roles, franchise boundaries, seller support access, export approvals, subprocessors, breach responsibilities, and cross-border transfers.',
    ].join(' '),
    mustMatch: [
      ['marketplace franchise', /marketplace|seller|franchise|brand|partner/i],
      ['data sharing role', /controller|processor|data-sharing|joint/i],
      ['export approvals', /export approval|exports|data-sharing terms/i],
      ['processor residency', /processor|subprocessor|support access|cross-border/i],
      ['evidence pack', /policy_sources|approval_workflow|client_questions|processor_evidence_needed/i],
    ],
  },
  {
    id: 'workforce-cctv-associate-privacy',
    name: 'Workforce CCTV and associate privacy',
    query: [
      'Retail warehouse and store operations platform with employee badges, associate mobile devices, CCTV/loss-prevention events, productivity monitoring, staff support tickets, HR case exports, shift data, and regional workforce access controls.',
      'Need compliance review for workforce privacy notices, monitoring basis, retention, access review, employee rights, HR/legal approval, and regional handling.',
    ].join(' '),
    mustMatch: [
      ['workforce privacy', /workforce|employee|staff|associate|badge|cctv/i],
      ['monitoring basis', /monitoring|privacy notice|legal basis|hr/i],
      ['retention access', /retention|access review|employee rights|approval/i],
      ['processor residency', /processor|region|residency|support access/i],
      ['qualification', /not legal advice|draft|legal/i],
    ],
  },
  {
    id: 'regulated-pharmacy-health-retail',
    name: 'Regulated pharmacy and health retail edge',
    query: [
      'Retail pharmacy platform with prescription refill reminders, health profile attributes, insurance eligibility lookup, customer support, delivery fulfilment, analytics exports, and AI assistant triage.',
      'Need compliance review for health privacy, HIPAA applicability, local medical privacy, processor obligations, support access, retention, deletion, and AI prompt handling.',
    ].join(' '),
    mustMatch: [
      ['regulated sector', /regulated retail|health|pharmacy|prescription|hipaa|medical/i],
      ['sector validation', /sector-specific|legal\/compliance|applicability/i],
      ['ai data processing', /prompt|ai|model|telemetry|provider/i],
      ['processor residency', /processor|support access|residency|region/i],
      ['evidence pack', /framework_evidence_needed|approval_workflow|client_questions/i],
    ],
  },
  {
    id: 'conflicting-residency-support-analytics',
    name: 'Conflicting residency support and analytics requirements',
    query: [
      'EU customer loyalty and order data must remain in the EU, but the proposed architecture sends support tickets to India, analytics exports to the US, CDN logs to a global provider, backups to another region, and model telemetry to an external AI provider.',
      'Need compliance review for GDPR, cross-border transfer basis, processor locations, support access, backup/log regions, analytics exports, telemetry, retention, and deletion propagation.',
    ].join(' '),
    mustMatch: [
      ['gdpr residency', /gdpr|eu|residency|cross-border|transfer/i],
      ['support analytics conflict', /support.*india|analytics.*us|cdn|model telemetry|external ai/i],
      ['processor evidence', /processor|subprocessor|support location|approved region/i],
      ['retention deletion', /retention|deletion|dsar|propagation/i],
      ['evidence status', /assumption|partial|missing|evidence/i],
    ],
  },
  {
    id: 'loyalty-cdp-marketing-consent',
    name: 'Loyalty CDP marketing consent and deletion',
    query: [
      'Retail loyalty and CDP platform with customer 360 profiles, consent preferences, segmentation, email/SMS activation, personalisation, clickstream, campaign exports, analytics workspaces, support transcripts, and deletion requests.',
      'Need compliance review for GDPR, CCPA/CPRA, DPDP, consent, opt-out, retention, DSAR/delete propagation, processors, campaign audit, and support access.',
    ].join(' '),
    mustMatch: [
      ['privacy frameworks', /gdpr|ccpa|cpra|dpdp|privacy/i],
      ['consent marketing', /consent|opt-out|campaign|activation|segmentation/i],
      ['deletion propagation', /deletion|dsar|propagation|retention/i],
      ['processors', /processor|analytics|support access|exports/i],
      ['validation gates', /requires human validation|privacy owner|legal/i],
    ],
  },
  {
    id: 'b2b-supplier-logistics-compliance',
    name: 'B2B supplier logistics and processor compliance',
    query: [
      'Retail supply-chain platform with supplier onboarding, WMS, ERP, 3PL carrier webhooks, EDI/SFTP feeds, ASN files, shipment events, returns feeds, customer addresses, proof-of-delivery photos, and reconciliation exports.',
      'Need compliance review for processor terms, data minimisation, support access, incident/export obligations, retention, cross-border logistics processing, and supplier breach responsibilities.',
    ].join(' '),
    mustMatch: [
      ['supply chain processors', /supplier|wms|erp|3pl|carrier|logistics/i],
      ['processor terms', /processor terms|processor|subprocessor|breach/i],
      ['data minimisation', /minimisation|minimization|customer addresses|proof-of-delivery/i],
      ['retention exports', /retention|exports|incident|support access/i],
      ['evidence pack', /processor_evidence_needed|client_questions|policy_sources/i],
    ],
  },
  {
    id: 'financial-retail-bnpl-credit',
    name: 'Financial retail BNPL credit compliance',
    query: [
      'Retail checkout offers BNPL, store credit, refund credit, identity checks, fraud scoring, chargebacks, payment tokens, customer profile data, support disputes, analytics exports, and model-assisted risk review.',
      'Need compliance review for PCI-DSS, financial/credit obligations, GLBA or local financial privacy if applicable, automated-decision auditability, retention, deletion, and support access.',
    ].join(' '),
    mustMatch: [
      ['payment pci', /pci|payment|token|chargeback|qsa/i],
      ['financial regulated edge', /financial|credit|glba|regulated|sector/i],
      ['automated decision', /automated-decision|risk review|model|auditability/i],
      ['retention support', /retention|deletion|support access|dispute/i],
      ['qualification', /not legal advice|draft|legal\/compliance/i],
    ],
  },
];

function flattenOutput(output = {}) {
  return [
    output.summary,
    output.findings,
    output.compliance_recommendation,
    output.jurisdiction_frameworks,
    output.residency_matrix,
    output.processor_residency_matrix,
    output.retention_deletion_controls,
    output.compliance_evidence_status,
    output.compliance_validation_gates,
    output.compliance_qualification,
    output.compliance_policy_citations,
    output.compliance_evidence_pack,
    output.compliance_signal_profile,
    output.risks,
    output.validation_needed,
    output.retrieval_requests,
    output.compliance_tool_results,
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

function scoreComplianceOutput(output, testCase) {
  const text = flattenOutput(output);
  const checks = testCase.mustMatch.map(([label, pattern]) => ({ label, pass: pattern.test(text) }));
  checks.push(
    { label: 'v1 compliance_recommendation field', pass: Array.isArray(output.compliance_recommendation) && output.compliance_recommendation.length > 0 },
    { label: 'v1 jurisdiction_frameworks field', pass: Array.isArray(output.jurisdiction_frameworks) && output.jurisdiction_frameworks.length > 0 },
    { label: 'v1 processor_residency_matrix field', pass: Array.isArray(output.processor_residency_matrix) && output.processor_residency_matrix.length > 0 },
    { label: 'v1 retention_deletion_controls field', pass: Array.isArray(output.retention_deletion_controls) && output.retention_deletion_controls.length > 0 },
    { label: 'v1 compliance_evidence_status field', pass: Boolean(output.compliance_evidence_status?.compliance) },
    { label: 'v1 compliance_validation_gates field', pass: Array.isArray(output.compliance_validation_gates) && output.compliance_validation_gates.length > 0 },
    { label: 'v1 compliance_qualification field', pass: output.compliance_qualification?.status === 'draft_requires_legal_privacy_review' },
    { label: 'v1 compliance_policy_citations field', pass: Array.isArray(output.compliance_policy_citations) && output.compliance_policy_citations.length > 0 },
    { label: 'v2 compliance_evidence_pack field', pass: Array.isArray(output.compliance_evidence_pack?.approval_workflow) && output.compliance_evidence_pack.approval_workflow.length > 0 },
    { label: 'v2 policy_sources field', pass: Array.isArray(output.compliance_evidence_pack?.policy_sources) && output.compliance_evidence_pack.policy_sources.length > 0 },
    { label: 'v1 compliance_signal_profile field', pass: Array.isArray(output.compliance_signal_profile?.domains) && output.compliance_signal_profile.domains.length > 0 }
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
  COMPLIANCE_EVAL_CASES,
  scoreComplianceOutput,
};
