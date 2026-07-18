const { buildRetailText, getRetailSignals } = require('../retailContext');

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

function textFromInput(input = {}) {
  return buildRetailText({
    query: input.query || '',
    context: input.context || {},
    state: input.state || {},
  }).toLowerCase();
}

function unique(items) {
  return [...new Set((items || []).filter(Boolean))];
}

function getSignals(input) {
  return input.signals || getRetailSignals(input);
}

function buildEnterpriseSecurityControls(input = {}) {
  const signals = getSignals(input);
  const text = textFromInput(input);
  const domains = [
    {
      domain: 'IAM, PAM, and support access',
      owner: 'Security IAM owner',
      controls: [
        'MFA/passwordless for workforce and admin access; step-up for refunds, account recovery, loyalty changes, and privileged actions.',
        'Workload identity for services; no long-lived service credentials in application config.',
        'PAM, break-glass approval, session logging, access review, and joiner/mover/leaver evidence.',
      ],
      evidence_needed: ['IAM policy export', 'PAM/break-glass runbook', 'access review evidence', 'support-access approval workflow'],
    },
    {
      domain: 'Secrets, keys, certificates, and encryption',
      owner: 'Security platform owner',
      controls: [
        'Approved secret manager for credentials and tokens.',
        'KMS/HSM/CMEK/CSEK decision with key owner, rotation, revocation, and emergency rotation path.',
        'Certificate lifecycle, TLS/mTLS ownership, and expiry monitoring.',
      ],
      evidence_needed: ['key inventory', 'rotation policy', 'certificate inventory', 'secret access audit'],
    },
    {
      domain: 'Logging, SIEM, DLP, and incident response',
      owner: 'Security operations owner',
      controls: [
        'Redacted security/audit logs, prompt traces, support transcripts, payment logs, admin actions, and key usage events exported to SIEM.',
        'Alert owner, severity model, runbook, evidence retention, immutable audit path, and incident notification workflow.',
      ],
      evidence_needed: ['SIEM routing evidence', 'redaction tests', 'incident runbook', 'audit retention policy'],
    },
    {
      domain: 'Third-party and subprocessor security',
      owner: 'Vendor/security owner',
      controls: [
        'Security review for SaaS, PSP, LLM/model, embedding, vector DB, CRM/helpdesk, observability, analytics, and logistics vendors.',
        'DPA/security terms, telemetry region, support access, incident notification SLA, subprocessor list, and exit/deletion path.',
      ],
      evidence_needed: ['vendor security review', 'DPA/security terms', 'subprocessor list', 'support access terms', 'incident SLA'],
    },
    {
      domain: 'Cloud landing zone and network security',
      owner: 'Cloud security owner',
      controls: [
        'Account/subscription separation, policy-as-code guardrails, private networking, egress control, WAF/CDN/bot protection, and approved regions.',
        'Control-plane logs, network logs, WAF logs, storage public-access blocks, encryption defaults, and exception workflow.',
      ],
      evidence_needed: ['landing-zone policy', 'network diagram', 'egress policy', 'guardrail evidence', 'approved region list'],
    },
  ];

  if (signals.payments) {
    domains.push({
      domain: 'Payment and PCI scope',
      owner: 'Payment security owner / QSA',
      controls: [
        'PSP/P2PE/token-vault boundary; PAN/SAD exclusion; segmentation; DLP for logs, support, prompts, analytics, and exports.',
        'Refund and payment-state access controls with QSA/security-owner validation.',
      ],
      evidence_needed: ['PCI scope diagram', 'PSP/token-vault contract', 'segmentation evidence', 'PAN/SAD DLP test', 'QSA validation'],
    });
  }

  if (signals.retailAi) {
    domains.push({
      domain: 'AI/RAG/agent security',
      owner: 'AI platform owner + security owner',
      controls: [
        'Prompt, completion, embedding, vector store, eval trace, model telemetry, and tool-call data classification.',
        'Retrieval ACLs, metadata filters, prompt-injection controls, tool scopes, human approvals, no-training/no-retention terms, and deletion propagation.',
      ],
      evidence_needed: ['retrieval ACL design', 'tool permission matrix', 'model/provider terms', 'trace retention policy', 'AI safety test evidence'],
    });
  }

  if (signals.storeEdge) {
    domains.push({
      domain: 'Store-edge/POS offline security',
      owner: 'Store technology security owner',
      controls: [
        'Device trust, encrypted local queues, full-disk encryption, local secret protection, certificate lifecycle, and offline access limits.',
        'Replay/idempotency, duplicate detection, reconnect criteria, conflict policy, device-loss process, and field technician access controls.',
      ],
      evidence_needed: ['device posture policy', 'offline queue security test', 'WAN outage test', 'field support runbook', 'device-loss process'],
    });
  }

  if (signals.multiRegion) {
    domains.push({
      domain: 'Multi-region residency and cross-border security',
      owner: 'Privacy/data security owner',
      controls: [
        'Region-by-region data map for primary stores, backups, logs, traces, prompts, embeddings, vector stores, exports, support access, and vendor telemetry.',
        'Approved-region controls, key-region ownership, transfer mechanism evidence, support-access location controls, and deletion/retention propagation.',
      ],
      evidence_needed: ['regional data-flow map', 'approved region list', 'key residency evidence', 'transfer impact assessment', 'support access location policy'],
    });
  }

  if (signals.supplyChain || /marketplace|seller|supplier|vendor|partner|edi|sftp|webhook|dropship|logistics/.test(text)) {
    domains.push({
      domain: 'Partner, marketplace, supply-chain, and logistics security',
      owner: 'Partner integration security owner',
      controls: [
        'Partner tenant isolation, contract-scoped API access, mTLS/OAuth/API-key lifecycle, webhook signing, EDI/SFTP hardening, and replay protection.',
        'Schema validation, payload size limits, allowlisted fields, content-type checks, malware scanning, source authentication, quarantine before commit, and reconciliation before feed data becomes system-of-record truth.',
        'Export approvals, reconciliation audit trails, vendor breach notification duties, least-privilege seller portal roles, and logistics data minimisation.',
      ],
      evidence_needed: ['partner API contract', 'tenant isolation test', 'credential rotation policy', 'webhook signing evidence', 'EDI/SFTP security review', 'payload validation/quarantine test', 'export approval workflow'],
    });
  }

  if (/admin|backoffice|back office|price override|promotion|refund approval|manual adjustment|maker.?checker|four.?eyes|privileged/.test(text)) {
    domains.push({
      domain: 'Privileged business operations and backoffice security',
      owner: 'Business operations security owner',
      controls: [
        'Step-up authentication, maker-checker approval, segregation of duties, privileged session logging, immutable audit events, and anomaly detection for high-risk mutations.',
        'Threshold-based approvals for price, promotion, refund, account recovery, manual order edit, loyalty adjustment, and payment-state actions.',
      ],
      evidence_needed: ['privileged workflow inventory', 'maker-checker policy', 'segregation-of-duties matrix', 'admin audit event schema', 'privileged session log sample'],
    });
  }

  if (/terraform|iac|infrastructure as code|ci\/cd|cicd|pipeline|github|pull request|cloud config|config drift|drift|iam policy|security group|firewall rule|public bucket|public storage|s3 bucket|blob container/.test(text)) {
    domains.push({
      domain: 'Continuous configuration drift detection',
      owner: 'Cloud security and platform engineering owner',
      controls: [
        'Compare approved security architecture graph against Terraform plans, pull requests, CI/CD policy checks, cloud configuration snapshots, IAM changes, network/security group changes, storage exposure, KMS/key policy changes, and logging/SIEM routing.',
        'Block or require approval for drift that exposes regulated data, weakens encryption, expands IAM, disables logs, changes regions, opens ingress/egress, creates public storage, or bypasses payment/AI/support-access boundaries.',
      ],
      evidence_needed: ['approved architecture graph', 'IaC repository list', 'CI/CD policy check evidence', 'cloud posture scan evidence', 'drift alert routing', 'remediation SLA', 'exception workflow'],
    });
  }

  if (/loyalty point|benefit redemption|stored value|gift card|voucher|coupon|promotion loop|promo loop|recursive promotion|return fraud|refund abuse|counterfeit|delivery failure|delivery dispute|reverse logistics|policy abuse|fraud ring|serial return|balance check/.test(text)) {
    domains.push({
      domain: 'Retail fraud and policy-abuse security',
      owner: 'Fraud, security, and retail operations owner',
      controls: [
        'Abuse-case threat model for loyalty point draining, gift-card brute force/cloning, coupon and promotion looping, refund abuse, counterfeit returns, false delivery failure claims, account takeover, inventory lock exhaustion, and support override abuse.',
        'Step-up authentication, velocity limits, per-account/device/payment-instrument controls, fraud scoring, maker-checker approval, manual review queues, and auditable policy decisions.',
      ],
      evidence_needed: ['abuse-case catalog', 'fraud owner', 'velocity/risk thresholds', 'review queue design', 'approval matrix', 'fraud telemetry', 'abuse-case game-day evidence'],
    });
  }

  return {
    tool: 'mapEnterpriseSecurityControlsTool',
    control_domains: domains,
    controls: unique(domains.flatMap(domain => domain.controls)),
    validation_needed: unique(domains.flatMap(domain => domain.evidence_needed.map(item => `Provide ${domain.domain} evidence: ${item}.`))),
  };
}

function buildThreatModel(input = {}) {
  const signals = getSignals(input);
  const text = textFromInput(input);
  const threats = [
    {
      boundary: 'Customer/channel edge',
      category: 'Spoofing / Denial of service',
      threat: 'Account takeover, bot abuse, credential stuffing, campaign traffic abuse, and checkout saturation.',
      severity: 'High',
      mitigation: 'WAF/CDN/bot controls, rate limits, MFA/step-up, session protection, checkout isolation, and abuse monitoring.',
      evidence_needed: 'Bot/WAF rules, auth policy, campaign load test, and fraud/ATO monitoring owner.',
    },
    {
      boundary: 'Internal service/data plane',
      category: 'Tampering / Elevation of privilege',
      threat: 'Over-permissive services mutate orders, inventory, refunds, promotions, or payment state without proper authorization.',
      severity: 'High',
      mitigation: 'Workload identity, service authorization, idempotency, audit events, schema contracts, and privileged action review.',
      evidence_needed: 'Service authorization matrix, audit event list, and mutation approval workflow.',
    },
    {
      boundary: 'Observability/support/export paths',
      category: 'Information disclosure',
      threat: 'Logs, traces, support tickets, debug bundles, analytics exports, or screenshots leak PII, PAN/SAD, tokens, secrets, prompts, or support transcripts.',
      severity: 'High',
      mitigation: 'DLP, redaction, minimisation, access approval, retention limits, support access logging, and export controls.',
      evidence_needed: 'Redaction test results, support access workflow, DLP rules, export approval path, and retention policy.',
    },
  ];

  if (signals.payments) {
    threats.push({
      boundary: 'Payment/PSP/token-vault boundary',
      category: 'Information disclosure / Tampering',
      threat: 'PAN/SAD or payment-sensitive data enters internal services, support tools, logs, AI prompts, vector stores, refund workflows, or analytics.',
      severity: 'Critical',
      mitigation: 'PSP/P2PE/token-vault boundary, PAN/SAD exclusion, segmentation, DLP, token-only references, and QSA/security-owner validation.',
      evidence_needed: 'PCI scope diagram, token-vault design, segmentation evidence, PAN/SAD DLP results, and QSA sign-off.',
    });
  }

  if (signals.retailAi) {
    threats.push({
      boundary: 'AI/RAG/tool boundary',
      category: 'Tampering / Information disclosure / Elevation of privilege',
      threat: 'Prompt injection, retrieval leakage, system prompt exposure, over-permissive tools, hidden telemetry, or agent mutation of OMS/WMS/CRM/loyalty/refund workflows.',
      severity: 'High',
      mitigation: 'Retrieval ACLs, metadata filters, prompt injection tests, tool scopes, human approval thresholds, telemetry controls, deletion propagation, and safe fallback.',
      evidence_needed: 'AI threat model, retrieval ACL tests, tool permission matrix, prompt-injection evals, model/provider terms, and AI safety test evidence.',
    });
  }

  if (signals.storeEdge) {
    threats.push({
      boundary: 'Store-edge/POS offline boundary',
      category: 'Tampering / Replay / Repudiation',
      threat: 'Offline queue tampering, replay duplication, device compromise, local secret theft, or reconciliation gaps after WAN outage.',
      severity: 'High',
      mitigation: 'Device trust, encrypted queues, full-disk encryption, ordered replay, idempotency keys, duplicate detection, and field runbooks.',
      evidence_needed: 'WAN outage test, queue replay test, device posture evidence, local retention policy, and field technician access review.',
    });
  }

  if (signals.multiRegion) {
    threats.push({
      boundary: 'Regional residency and cross-border boundary',
      category: 'Information disclosure / Compliance failure',
      threat: 'Sensitive customer, loyalty, support, payment-adjacent, log, prompt, vector, backup, export, or telemetry data moves into an unapproved region or support path.',
      severity: 'High',
      mitigation: 'Regional data map, approved-region controls, key residency, processor inventory, support-access location controls, transfer mechanism evidence, and deletion propagation tests.',
      evidence_needed: 'Regional data-flow map, approved region list, key residency evidence, support access policy, processor list, and transfer assessment.',
    });
  }

  if (signals.supplyChain || /marketplace|seller|supplier|vendor|partner|edi|sftp|webhook|dropship|logistics/.test(text)) {
    threats.push({
      boundary: 'Partner, marketplace, supply-chain, and logistics boundary',
      category: 'Spoofing / Tampering / Repudiation',
      threat: 'Compromised partner credentials, unsigned webhooks, weak EDI/SFTP controls, malicious supplier payloads, tenant leakage, replayed shipment/order events, or unapproved exports alter retail operations or leak shared data.',
      severity: 'High',
      mitigation: 'mTLS/OAuth scopes, API-key rotation, webhook signatures, EDI/SFTP hardening, schema validation, malware scanning, payload quarantine, tenant isolation, replay protection, reconciliation audit trails, export approval, and breach-notification ownership.',
      evidence_needed: 'Partner auth design, webhook signature test, EDI/SFTP security review, payload validation/quarantine test, tenant isolation test, reconciliation audit evidence, and export approval workflow.',
    });
  }

  if (/admin|backoffice|back office|price override|promotion|refund approval|manual adjustment|maker.?checker|four.?eyes|privileged/.test(text)) {
    threats.push({
      boundary: 'Backoffice and privileged business operations boundary',
      category: 'Elevation of privilege / Tampering / Repudiation',
      threat: 'Privileged users or support operators abuse price, promotion, refund, account recovery, order edit, loyalty adjustment, or payment-state workflows without sufficient approval and auditability.',
      severity: 'High',
      mitigation: 'Step-up authentication, maker-checker approval, segregation of duties, privileged session logging, immutable audit events, anomaly detection, and periodic access review.',
      evidence_needed: 'Privileged workflow inventory, approval threshold matrix, segregation-of-duties policy, admin audit events, and session log samples.',
    });
  }

  if (/terraform|iac|infrastructure as code|ci\/cd|cicd|pipeline|github|pull request|cloud config|config drift|drift|iam policy|security group|firewall rule|public bucket|public storage|s3 bucket|blob container/.test(text)) {
    threats.push({
      boundary: 'CI/CD, IaC, and cloud configuration drift boundary',
      category: 'Tampering / Information disclosure / Elevation of privilege',
      threat: 'Infrastructure drift exposes regulated data, weakens encryption, expands IAM roles, disables logs, creates public storage, changes approved regions, or opens network paths outside the approved architecture.',
      severity: 'High',
      mitigation: 'Policy-as-code gates, Terraform plan scanning, pull-request security review, cloud posture scans, drift alerts, exception workflow, remediation SLA, and evidence retention.',
      evidence_needed: 'IaC repository list, CI/CD policy results, cloud posture/drift scan evidence, exception register, alert routing, and remediation SLA.',
    });
  }

  if (/loyalty point|benefit redemption|stored value|gift card|voucher|coupon|promotion loop|promo loop|recursive promotion|return fraud|refund abuse|counterfeit|delivery failure|delivery dispute|reverse logistics|policy abuse|fraud ring|serial return|balance check/.test(text)) {
    threats.push({
      boundary: 'Retail fraud and policy-abuse boundary',
      category: 'Business logic abuse / Tampering / Repudiation',
      threat: 'Attackers drain loyalty points, brute-force or clone gift cards, loop coupons/promotions, abuse refunds, falsify delivery failures, return counterfeit items, or exploit support overrides.',
      severity: 'High',
      mitigation: 'Velocity limits, step-up authentication, fraud scoring, per-account/device/payment-instrument controls, maker-checker approval, review queues, immutable audit, and abuse-case game days.',
      evidence_needed: 'Abuse-case catalog, fraud telemetry, control thresholds, review queue design, approval matrix, and tabletop/game-day evidence.',
    });
  }

  return {
    tool: 'buildThreatModelTool',
    methodology: 'STRIDE plus retail abuse cases',
    threats,
    risks: threats.map(item => risk(item.threat, item.severity, 'Medium', item.mitigation)),
    validation_needed: unique(threats.map(item => `Threat model evidence required for ${item.boundary}: ${item.evidence_needed}`)),
  };
}

function mapComplianceControls(input = {}) {
  const text = textFromInput(input);
  const signals = getSignals(input);
  const mappings = [
    {
      framework: 'SOC 2 / ISO 27001',
      applies: true,
      controls: ['logical access', 'change/security monitoring', 'incident response', 'vendor risk', 'logging', 'risk assessment'],
      evidence_needed: ['access review', 'SIEM evidence', 'incident runbook', 'vendor review', 'risk register'],
    },
    {
      framework: 'Privacy: GDPR / CCPA / DPDP / Australian Privacy Act',
      applies: signals.customerData || signals.loyaltyData || /gdpr|ccpa|dpdp|privacy act|customer|loyalty|pii/.test(text),
      controls: ['data minimisation', 'purpose limitation', 'retention/deletion', 'DSAR/erasure', 'processor controls', 'support access'],
      evidence_needed: ['data map', 'retention schedule', 'deletion propagation evidence', 'processor list', 'support access audit'],
    },
    {
      framework: 'PCI-DSS',
      applies: signals.payments,
      controls: ['scope minimisation', 'segmentation', 'PAN/SAD exclusion', 'tokenisation/P2PE', 'logging/DLP', 'access control'],
      evidence_needed: ['PCI scope diagram', 'segmentation evidence', 'PAN/SAD exclusion proof', 'QSA validation'],
    },
    {
      framework: 'AI/model governance',
      applies: signals.retailAi,
      controls: ['prompt/vector data classification', 'retrieval ACLs', 'tool authorization', 'telemetry retention', 'human escalation', 'provider terms'],
      evidence_needed: ['AI data-flow map', 'tool permission matrix', 'model/provider terms', 'eval trace retention', 'AI safety test evidence'],
    },
    {
      framework: 'Partner/vendor security and third-party risk',
      applies: signals.supplyChain || /marketplace|seller|supplier|vendor|partner|edi|sftp|webhook|dropship|logistics|subprocessor/.test(text),
      controls: ['tenant isolation', 'least-privilege partner access', 'secure file/API exchange', 'payload validation and quarantine', 'vendor security review', 'breach notification', 'export controls'],
      evidence_needed: ['partner inventory', 'vendor security review', 'API/file-transfer security evidence', 'payload validation/quarantine evidence', 'tenant isolation test', 'data-sharing agreement'],
    },
    {
      framework: 'Change/configuration governance',
      applies: /terraform|iac|ci\/cd|cicd|pipeline|github|cloud config|drift|public bucket|public storage|iam policy/.test(text),
      controls: ['policy-as-code', 'IaC review', 'configuration drift detection', 'exception workflow', 'remediation SLA', 'security evidence retention'],
      evidence_needed: ['approved architecture graph', 'CI/CD policy check evidence', 'cloud posture scan evidence', 'exception register', 'remediation SLA'],
    },
    {
      framework: 'Fraud and business policy abuse governance',
      applies: /loyalty point|benefit redemption|stored value|gift card|voucher|coupon|promotion loop|recursive promotion|return fraud|refund abuse|counterfeit|delivery failure|delivery dispute|reverse logistics|policy abuse|fraud/.test(text),
      controls: ['abuse-case risk assessment', 'fraud monitoring', 'step-up controls', 'maker-checker approval', 'audit evidence', 'incident response'],
      evidence_needed: ['abuse-case catalog', 'fraud telemetry', 'approval matrix', 'monitoring evidence', 'game-day evidence'],
    },
  ];

  return {
    tool: 'mapComplianceControlsTool',
    mappings,
    validation_needed: unique(mappings.filter(item => item.applies).flatMap(item => item.evidence_needed.map(evidence => `${item.framework}: ${evidence}.`))),
  };
}

function buildSecurityEvidencePack(input = {}) {
  const rag = input.ragContext || {};
  const docs = rag.docs || [];
  const citations = rag.citations || [];
  return {
    tool: 'buildSecurityEvidencePackTool',
    evidence_pack: {
      policy_sources: docs.map(doc => ({
        id: doc.id,
        title: doc.title,
        source: doc.source || 'built-in',
        version: doc.version || 'not stated',
        effective_date: doc.effective_date || 'not stated',
      })),
      citations,
      approval_workflow: [
        'Security architect approves data classification, trust boundaries, key ownership, and logging/redaction evidence.',
        'Privacy/data owner approves customer, loyalty, support, deletion, retention, and processor paths.',
        'Payment security owner or QSA approves PCI/payment boundary where payments are in scope.',
        'AI platform/security owner approves prompt, vector, tool, telemetry, and human-escalation controls where AI is in scope.',
        'Operations owner approves SIEM routing, incident runbooks, support access, and operational evidence retention.',
      ],
      client_questions: [
        'Which sensitive data classes are present, and where do they flow across apps, APIs, logs, prompts, vectors, backups, exports, and support tools?',
        'Which systems or vendors process payment, customer, loyalty, support, AI, observability, analytics, and logistics data?',
        'Who owns IAM, secrets, keys, certificates, SIEM alerts, incident response, support access, and security exceptions?',
        'Which security policies are current, approved, and applicable to this workload?',
      ],
      missing_policy_coverage: [
        docs.length ? null : 'No retrieved policy/playbook documents were available for this run.',
        citations.length ? null : 'No citation snippets were available; output remains uncited review guidance.',
      ].filter(Boolean),
    },
    validation_needed: [
      'Attach current customer security policies or approve the ArchitectIQ baseline playbooks before client-ready security sign-off.',
      'Record named human approval for each evidence pack owner before production recommendation.',
    ],
  };
}

module.exports = {
  buildEnterpriseSecurityControls,
  buildSecurityEvidencePack,
  buildThreatModel,
  mapComplianceControls,
};
