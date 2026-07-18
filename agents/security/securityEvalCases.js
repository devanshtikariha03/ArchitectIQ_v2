const SECURITY_EVAL_CASES = [
  {
    id: 'myntra-ai-checkout-payments',
    name: 'Myntra AI checkout and payment security',
    query: [
      'Myntra fashion commerce platform with AI support chatbot, RAG recommendations, vector store, payment orchestration, UPI/cards/wallets, PCI scope minimisation, customer PII, loyalty profile, order, refund, OMS, WMS, and EORS flash-sale traffic.',
      'Core checkout, payment, order commit, and inventory lock paths must remain isolated from chatbot, recommendation, and search failures.',
    ].join(' '),
    mustMatch: [
      ['structured approval output', /requires human validation|annotation|approve only/i],
      ['data classification', /c5|c5e|classif|pii|customer|loyalty/i],
      ['payment boundary', /pci|pan|sad|psp|p2pe|token.?vault/i],
      ['ai rag controls', /rag|vector|embedding|prompt|retrieval|tool/i],
      ['redaction', /redact|log|trace|prompt|telemetry/i],
      ['trust boundary', /trust boundary|security boundary|sb|tb/i],
      ['human validation', /qsa|owner|human|approval|validate|confirm/i],
      ['enterprise threat model', /threat|stride|abuse|prompt injection|replay|spoofing|tampering/i],
      ['compliance mapping', /soc 2|iso 27001|pci-dss|gdpr|ccpa|dpdp|privacy act|ai\/model governance/i],
      ['vendor security', /vendor|subprocessor|provider|dpa|telemetry|support access/i],
      ['evidence pack', /evidence pack|policy_sources|client_questions|approval_workflow|citation/i],
    ],
  },
  {
    id: 'store-edge-offline-pos',
    name: 'Store-edge offline POS security',
    query: [
      'Retail store-edge platform with POS checkout during WAN outages, local durable queues, encrypted local storage, reconnect replay, inventory mutations, payment token references, associate mobile devices, and field support.',
      'Stores must continue checkout offline and reconcile with central inventory and order systems after connectivity returns.',
    ].join(' '),
    mustMatch: [
      ['structured approval output', /requires human validation|annotation|approve only/i],
      ['store edge', /store.?edge|offline|pos|wan outage|local queue/i],
      ['device trust', /device trust|device posture|certificate|full.?disk|local secret/i],
      ['queue replay', /queue|replay|idempotency|duplicate|conflict/i],
      ['payment boundary', /payment|pci|token|psp|pan|sad/i],
      ['audit evidence', /audit|log|evidence|runbook|acceptance test/i],
      ['enterprise threat model', /threat|stride|replay|spoofing|tampering|repudiation/i],
      ['compliance mapping', /soc 2|iso 27001|pci-dss|privacy|compliance/i],
      ['vendor security', /vendor|subprocessor|provider|dpa|support access|field technician/i],
      ['evidence pack', /evidence pack|policy_sources|client_questions|approval_workflow|citation/i],
    ],
  },
  {
    id: 'loyalty-personalisation-privacy',
    name: 'Loyalty and personalisation privacy security',
    query: [
      'Retail loyalty and personalisation platform with customer 360 profiles, consent, segmentation, clickstream, recommendations, email activation, support transcripts, analytics exports, and regional GDPR/CCPA/DPDP privacy obligations.',
      'Marketing and support teams need controlled access but customer data must be minimised and deletion must propagate.',
    ].join(' '),
    mustMatch: [
      ['structured approval output', /requires human validation|annotation|approve only/i],
      ['customer data classification', /customer|loyalty|profile|c5|c5e|pii/i],
      ['consent privacy', /consent|privacy|gdpr|ccpa|dpdp|retention|dsar|deletion/i],
      ['support access', /support access|support transcript|approval|role|break.?glass|time.?bounded/i],
      ['redaction minimisation', /redact|minimi[sz]e|pseudonym|tokeni[sz]/i],
      ['analytics exports', /analytics|export|log|trace|support bundle/i],
      ['enterprise threat model', /threat|stride|information disclosure|exfiltration|tampering/i],
      ['compliance mapping', /soc 2|iso 27001|gdpr|ccpa|dpdp|privacy act/i],
      ['vendor security', /vendor|subprocessor|provider|dpa|telemetry|support access/i],
      ['evidence pack', /evidence pack|policy_sources|client_questions|approval_workflow|citation/i],
    ],
  },
  {
    id: 'global-marketplace-partner-integration',
    name: 'Global marketplace and partner integration security',
    query: [
      'Global retail marketplace with third-party sellers, supplier onboarding, seller portal, partner APIs, OAuth clients, API keys, signed webhooks, EDI/SFTP catalogue and inventory drops, dropship logistics, shipment events, customer addresses, order exports, return reconciliation, and vendor support access.',
      'The platform operates in EU, US, India, Australia, and New Zealand with regional data residency, cross-border transfer constraints, shared observability, analytics exports, and multiple subprocessors.',
    ].join(' '),
    mustMatch: [
      ['structured approval output', /requires human validation|annotation|approve only/i],
      ['partner security', /partner|seller|supplier|marketplace|vendor|subprocessor/i],
      ['secure exchange', /oauth|api.?key|m?tls|signed webhook|edi|sftp|credential rotation/i],
      ['tenant isolation', /tenant isolation|least.?privilege|contract.?scoped|seller portal/i],
      ['regional residency', /region|residency|cross-border|approved region|transfer/i],
      ['exports and reconciliation', /export|reconciliation|shipment|logistics|audit/i],
      ['enterprise threat model', /threat|stride|spoofing|tampering|repudiation|replay/i],
      ['compliance mapping', /soc 2|iso 27001|gdpr|ccpa|dpdp|privacy act|third-party risk/i],
      ['evidence pack', /evidence pack|policy_sources|client_questions|approval_workflow|citation/i],
    ],
  },
  {
    id: 'omnichannel-bopis-returns',
    name: 'Omnichannel BOPIS returns and store operations security',
    query: [
      'Large omnichannel retailer with buy-online-pickup-in-store, ship-from-store, store associate mobile app, QR pickup codes, returns desk, refund approvals, POS payment token references, inventory reservation, OMS/WMS integration, local store queues, customer PII, loyalty lookup, and support escalation.',
      'Stores must handle fraud prevention, offline fallback, duplicate pickup prevention, return abuse controls, and auditable reconciliation after WAN disruption.',
    ].join(' '),
    mustMatch: [
      ['structured approval output', /requires human validation|annotation|approve only/i],
      ['store edge operations', /store.?edge|offline|pos|associate mobile|wan|local queue/i],
      ['omnichannel fulfilment', /pickup|ship-from-store|returns|refund|reservation|oms|wms/i],
      ['fraud and duplicate prevention', /fraud|duplicate|idempotency|replay|conflict|abuse/i],
      ['payment boundary', /payment|pci|token|psp|pan|sad/i],
      ['privileged approval', /approval|maker.?checker|step.?up|privileged|refund/i],
      ['enterprise threat model', /threat|stride|replay|tampering|repudiation/i],
      ['evidence pack', /evidence pack|policy_sources|client_questions|approval_workflow|citation/i],
    ],
  },
  {
    id: 'admin-backoffice-price-promotion',
    name: 'Backoffice price promotion and refund security',
    query: [
      'Retail backoffice platform for price override, campaign promotion setup, manual order edits, refund approval, loyalty point adjustment, account recovery, inventory correction, fraud review, support impersonation, privileged admin roles, maker-checker approval, and audit evidence.',
      'Operations teams need speed during flash-sale incidents, but every high-risk mutation must be controlled, monitored, and defensible for internal audit.',
    ].join(' '),
    mustMatch: [
      ['structured approval output', /requires human validation|annotation|approve only/i],
      ['privileged operations', /privileged|admin|backoffice|back office|support impersonation/i],
      ['maker checker', /maker.?checker|four.?eyes|segregation|step.?up|approval/i],
      ['audit and session logging', /audit|session log|immutable|siem|monitor/i],
      ['high risk mutation', /price|promotion|refund|manual order|loyalty|account recovery/i],
      ['enterprise threat model', /threat|stride|elevation of privilege|tampering|repudiation/i],
      ['compliance mapping', /soc 2|iso 27001|risk assessment|logical access|incident/i],
      ['evidence pack', /evidence pack|policy_sources|client_questions|approval_workflow|citation/i],
    ],
  },
  {
    id: 'ai-agent-tooling-mutation',
    name: 'AI agent tool mutation and private data security',
    query: [
      'Enterprise retail AI agent with GPT model routing, local model fallback, RAG over product, policy, support, and order knowledge, vector database, embedding provider, reranker, tool calls into OMS, WMS, CRM, loyalty, refund, account recovery, payment-status lookup, Jira/GitHub, and Terraform automation.',
      'The agent must handle private company data, customer PII, support transcripts, secrets, prompt injection attempts, over-permissive tools, human approval, trace retention, no-training/no-retention terms, and deletion propagation.',
    ].join(' '),
    mustMatch: [
      ['structured approval output', /requires human validation|annotation|approve only/i],
      ['ai rag controls', /rag|vector|embedding|reranker|prompt|retrieval/i],
      ['tool authorization', /tool|permission|scope|human approval|mutation|oms|wms|crm/i],
      ['prompt injection', /prompt injection|injection|retrieval leakage|metadata filter/i],
      ['private data handling', /private|pii|support transcript|secret|no-training|retention|deletion/i],
      ['payment boundary', /payment|pci|token|psp|pan|sad/i],
      ['enterprise threat model', /threat|stride|elevation of privilege|information disclosure|tampering/i],
      ['evidence pack', /evidence pack|policy_sources|client_questions|approval_workflow|citation/i],
    ],
  },
  {
    id: 'warehouse-iot-loss-prevention',
    name: 'Warehouse IoT loss prevention and fulfilment security',
    query: [
      'Retail warehouse modernisation with WMS, handheld scanners, RFID gates, CCTV/loss-prevention events, worker badges, pick-pack-ship workflows, last-mile carrier APIs, supplier ASN feeds, inventory adjustments, returns intake, quality inspection photos, and operational dashboards.',
      'The design includes edge devices, local network zones, cloud ingestion, partner carrier webhooks, object storage for images, analytics exports, staff access controls, and incident monitoring.',
    ].join(' '),
    mustMatch: [
      ['structured approval output', /requires human validation|annotation|approve only/i],
      ['warehouse supply chain', /warehouse|wms|supplier|carrier|logistics|last-mile|rfid/i],
      ['device and network controls', /device|certificate|network|zone|edge|local|secret/i],
      ['partner integration', /partner|webhook|api|edi|sftp|supplier|carrier/i],
      ['privacy and images', /photo|image|staff|badge|pii|redact|retention/i],
      ['audit monitoring', /audit|siem|incident|monitor|log/i],
      ['enterprise threat model', /threat|stride|spoofing|tampering|information disclosure/i],
      ['evidence pack', /evidence pack|policy_sources|client_questions|approval_workflow|citation/i],
    ],
  },
  {
    id: 'continuous-config-drift-retail-cloud',
    name: 'Continuous configuration drift and IaC security',
    query: [
      'Enterprise retail cloud platform using Terraform, GitHub pull requests, CI/CD pipelines, policy-as-code, cloud configuration snapshots, IAM policies, security groups, firewall rules, S3 buckets, blob containers, KMS key policies, SIEM routing, and approved architecture security graph.',
      'The security review must detect drift where a customer loyalty data bucket becomes public, a database IAM role is expanded, logs are disabled, a non-approved region is used, payment segmentation is weakened, or AI provider telemetry is enabled without approval.',
    ].join(' '),
    mustMatch: [
      ['structured approval output', /requires human validation|annotation|approve only/i],
      ['configuration drift', /drift|configuration drift|cloud posture|cloud config/i],
      ['ci cd iac', /ci\/cd|cicd|terraform|iac|policy-as-code|pull request/i],
      ['public storage iam', /public bucket|public storage|s3|blob|iam|security group|firewall/i],
      ['approved architecture graph', /approved architecture graph|security graph|architecture graph/i],
      ['remediation workflow', /remediation sla|exception workflow|owner|approval|alert/i],
      ['enterprise threat model', /threat|tampering|information disclosure|elevation of privilege/i],
      ['compliance mapping', /soc 2|iso 27001|change|configuration|monitoring/i],
      ['evidence pack', /evidence pack|policy_sources|client_questions|approval_workflow|citation/i],
    ],
  },
  {
    id: 'retail-fraud-policy-abuse',
    name: 'Retail fraud and policy abuse security',
    query: [
      'Retail platform with loyalty point redemption, gift card balance lookup and redemption, coupon stacking, promotion looping, refund abuse, false delivery failure claims, counterfeit in-store returns, account takeover, support overrides, serial return abuse, fraud rings, and campaign peak bot traffic.',
      'Security review must model financial abuse paths, velocity limits, step-up authentication, maker-checker approval, fraud scoring, review queues, immutable audit evidence, and abuse-case game days.',
    ].join(' '),
    mustMatch: [
      ['structured approval output', /requires human validation|annotation|approve only/i],
      ['loyalty abuse', /loyalty point|loyalty draining|loyalty/i],
      ['gift card abuse', /gift card|balance|brute.?force|clon/i],
      ['coupon promotion abuse', /coupon|promotion loop|promo loop|promotion/i],
      ['returns refund abuse', /refund abuse|return fraud|counterfeit|delivery failure|serial return/i],
      ['fraud controls', /velocity|step.?up|fraud scoring|maker.?checker|review queue|audit/i],
      ['enterprise threat model', /threat|business logic abuse|tampering|repudiation|abuse-case/i],
      ['evidence pack', /evidence pack|policy_sources|client_questions|approval_workflow|citation/i],
    ],
  },
  {
    id: 'b2b-ingestion-supplier-feed-security',
    name: 'B2B ingestion supplier feed and payload security',
    query: [
      'Retail B2B ingestion layer with supplier feeds, 3PL carrier webhooks, WMS, ERP, EDI, SFTP, ASN, CSV/XML file feeds, marketplace seller updates, catalogue imports, inventory updates, shipment events, returns feeds, image uploads, and reconciliation into systems of record.',
      'If an upstream supplier is compromised, malicious payloads must not corrupt catalogue data, inventory ledger truth, fulfilment promise, or financial event processing. Require schema validation, payload signing, malware scanning, quarantine, replay protection, idempotency, tenant isolation, and blast-radius controls.',
    ].join(' '),
    mustMatch: [
      ['structured approval output', /requires human validation|annotation|approve only/i],
      ['b2b ingestion', /b2b|ingestion|supplier feed|3pl|asn|wms|erp/i],
      ['edi sftp webhook', /edi|sftp|webhook|file feed|csv|xml/i],
      ['payload validation', /payload validation|schema validation|allowlisted|content-type|malware scanning/i],
      ['quarantine', /quarantine|before commit|blast-radius|disable feed/i],
      ['replay idempotency', /replay|idempotency|duplicate|out-of-order/i],
      ['system of record protection', /system-of-record|catalogue|inventory ledger|reconciliation/i],
      ['enterprise threat model', /threat|spoofing|tampering|repudiation|malicious supplier payload/i],
      ['evidence pack', /evidence pack|policy_sources|client_questions|approval_workflow|citation/i],
    ],
  },
  {
    id: 'ambiguous-payment-cde-language',
    name: 'Ambiguous cardholder environment and payment-token language',
    query: [
      'Retail checkout modernisation where acquirer token references, stored credentials, chargebacks, refund ledger state, CHD-adjacent support tickets, and CDE segmentation evidence are mentioned but the team avoids saying raw card data is stored.',
      'Architecture review must identify whether the cardholder data environment, PSP token vault, support access, logs, analytics exports, and AI prompt paths can expand regulated payment scope.',
    ].join(' '),
    mustMatch: [
      ['structured approval output', /requires human validation|annotation|approve only/i],
      ['payment pci signal', /pci|pci-dss|chd|cde|cardholder|psp|token.?vault|stored credential/i],
      ['payment boundary', /segmentation|pan|sad|support ticket|log|prompt|analytics/i],
      ['human qsa review', /qsa|payment security owner|human validation|sign-off|approval/i],
      ['signal profile', /payment_pci|security_signal_profile|confidence/i],
      ['compliance qualification', /draft_requires_human_review|not legal advice|qsa sign-off|audit attestation/i],
    ],
  },
  {
    id: 'ambiguous-fraud-policy-abuse-language',
    name: 'Ambiguous stored-value and policy-abuse language',
    query: [
      'Large retailer has unauthorised benefit redemption, stored value instruments, voucher balance enumeration, recursive promotion eligibility, reverse-logistics substitution fraud, delivery-dispute abuse, and high-risk support overrides.',
      'Security review must treat these as abuse paths with velocity checks, step-up verification, segregation of duties, immutable evidence, review queues, and customer-impact controls.',
    ].join(' '),
    mustMatch: [
      ['structured approval output', /requires human validation|annotation|approve only/i],
      ['fraud abuse signal', /fraud|policy abuse|business logic abuse|stored value|benefit redemption|voucher|promotion|reverse-logistics|delivery-dispute/i],
      ['fraud controls', /velocity|step.?up|segregation|maker.?checker|review queue|immutable|audit/i],
      ['threat model abuse', /threat|abuse-case|tampering|repudiation|business logic/i],
      ['signal profile', /fraud_policy_abuse|security_signal_profile|confidence/i],
      ['compliance qualification', /draft_requires_human_review|not legal advice|audit attestation|human review/i],
    ],
  },
];

function flattenOutput(output = {}) {
  return [
    output.summary,
    output.security_recommendation,
    output.data_classification_matrix,
    output.trust_boundaries,
    output.payment_security,
    output.ai_security,
    output.required_controls,
    output.approval_gates,
    output.diagram_annotations,
    output.enterprise_control_map,
    output.threat_model,
    output.compliance_control_map,
    output.compliance_qualification,
    output.security_evidence_pack,
    output.policy_citations,
    output.security_signal_profile,
    output.security_review_recommendation,
    output.accepted_assumptions,
    output.findings,
    output.risks,
    output.validation_needed,
    output.retrieval_requests,
    output.security_tool_results,
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

function scoreSecurityOutput(output, testCase) {
  const text = flattenOutput(output);
  const checks = testCase.mustMatch.map(([label, pattern]) => ({
    label,
    pass: pattern.test(text),
  }));
  checks.push(
    { label: 'v2 security_recommendation field', pass: Array.isArray(output.security_recommendation) && output.security_recommendation.length > 0 },
    { label: 'v2 data_classification_matrix field', pass: Array.isArray(output.data_classification_matrix) && output.data_classification_matrix.length > 0 },
    { label: 'v2 trust_boundaries field', pass: Array.isArray(output.trust_boundaries) && output.trust_boundaries.length > 0 },
    { label: 'v2 approval_gates field', pass: Array.isArray(output.approval_gates) && output.approval_gates.length > 0 },
    { label: 'v2 diagram_annotations field', pass: Array.isArray(output.diagram_annotations) && output.diagram_annotations.length > 0 },
    { label: 'v3 enterprise_control_map field', pass: Array.isArray(output.enterprise_control_map) && output.enterprise_control_map.length > 0 },
    { label: 'v3 threat_model field', pass: Array.isArray(output.threat_model?.threats) && output.threat_model.threats.length > 0 },
    { label: 'v3 compliance_control_map field', pass: Array.isArray(output.compliance_control_map) && output.compliance_control_map.length > 0 },
    { label: 'v3 security_evidence_pack field', pass: Array.isArray(output.security_evidence_pack?.approval_workflow) && output.security_evidence_pack.approval_workflow.length > 0 },
    { label: 'v3 policy_citations field', pass: Array.isArray(output.policy_citations) && output.policy_citations.length > 0 },
    { label: 'v4 compliance_qualification field', pass: output.compliance_qualification?.status === 'draft_requires_human_review' },
    { label: 'v4 security_signal_profile field', pass: Array.isArray(output.security_signal_profile?.domains) && output.security_signal_profile.domains.length > 0 },
    { label: 'v4 signal error-mode field', pass: Boolean(output.security_signal_profile?.error_modes?.note) }
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
    retrieved_docs: output.graph_agent?.retrieved_docs || [],
  };
}

module.exports = {
  SECURITY_EVAL_CASES,
  scoreSecurityOutput,
};
