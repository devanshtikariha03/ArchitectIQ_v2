const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const { buildRetailText, getRetailSignals } = require('../retailContext');
const { retrieveSecurityKnowledge } = require('./securityKnowledgeBase');
const {
  buildEnterpriseSecurityControls,
  buildSecurityEvidencePack,
  buildThreatModel,
  mapComplianceControls,
} = require('./securityEnterprise');

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function textFromInput(input = {}) {
  return buildRetailText({
    query: input.query || '',
    context: input.context || {},
    state: input.state || {},
  }).toLowerCase();
}

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

function classifyRetailData(input = {}) {
  const text = textFromInput(input);
  const classes = [];
  const dataPaths = [];
  const findings = [];
  const validation_needed = [];

  if (/\b(customer|pii|phone|address|profile|loyalty|support transcript|auth|session|complaint)\b/i.test(text)) {
    classes.push({
      class: 'C5/C5E',
      data: 'customer, loyalty, profile, support transcript, auth/session, address, phone, and sensitive audit data where present',
      handling: 'encrypt at rest and in transit, minimise collection, redact logs/traces/prompts, apply access controls, retention, deletion/DSAR, and support-access approval',
    });
    dataPaths.push('customer/support/loyalty data across application stores, logs, prompt payloads, vector stores, backups, support bundles, and exports');
    findings.push('Customer, loyalty, support, and profile data must be treated as sensitive retail data, not generic application metadata.');
    validation_needed.push('Confirm exact customer/loyalty/support fields and where they flow: apps, APIs, logs, prompts, vector stores, backups, exports, and support tooling.');
  }

  if (/\b(payment|payments|pci|pci-dss|pan|sad|psp|p2pe|card|cardholder|chd|cde|stored credential|stored credentials|acquirer token|wallet|upi|gift voucher|gift card|bnpl|token vault)\b/i.test(text)) {
    classes.push({
      class: 'C5E/payment-sensitive',
      data: 'payment-adjacent data, payment tokens, PSP references, refund state, fraud signals, and any cardholder data if present',
      handling: 'exclude PAN/SAD from internal systems unless formally in PCI scope; use PSP/P2PE/token vault boundaries and QSA validation',
    });
    dataPaths.push('payment orchestration, PSP/token vault, refund flows, support tickets, analytics, logs, and AI prompt/tool paths');
    findings.push('Payment and refund data require an explicit PCI/token-vault boundary before architecture approval.');
    validation_needed.push('Confirm PAN/SAD exclusion, PSP/P2PE/token-vault boundary, segmentation evidence, and QSA/human validation requirements.');
  }

  if (/\b(order|inventory|stock|catalog|catalogue|oms|wms|fulfilment|fulfillment|reservation|promotion|cart|checkout)\b/i.test(text)) {
    classes.push({
      class: 'C3/C4 operational',
      data: 'orders, carts, inventory, reservation state, fulfilment, catalogue, promotion, and operational audit data',
      handling: 'protect integrity and availability; apply idempotency, auditability, retention, and separation from customer identity where possible',
    });
    dataPaths.push('commerce/order/inventory/fulfilment APIs, queues, caches, search indexes, dashboards, and operational logs');
    findings.push('Operational retail data needs integrity controls, source-of-truth ownership, replay safety, and audit evidence.');
    validation_needed.push('Confirm systems of record for order, inventory, reservation, promotion, fulfilment, return, and audit domains.');
  }

  if (/\b(vendor|supplier|seller|marketplace|partner|edi|sftp|api key|oauth|webhook|dropship|logistics|3pl|asn|file feed|csv|xml|carrier)\b/i.test(text)) {
    classes.push({
      class: 'C3/C5 partner-shared',
      data: 'vendor, supplier, marketplace seller, logistics, catalogue, inventory, order, shipment, return, webhook, EDI/SFTP, file-feed, and partner API data',
      handling: 'classify shared fields by sensitivity, isolate partner tenants, enforce contract-scoped access, validate and quarantine payloads, sign webhooks, rotate API credentials, and audit exports',
    });
    dataPaths.push('partner APIs, webhooks, EDI/SFTP drops, seller portals, WMS/ERP/supplier feeds, logistics/carrier feeds, exports, quarantine stores, and reconciliation reports');
    findings.push('Partner, marketplace, WMS, ERP, 3PL, and supplier ingestion needs explicit tenant isolation, signed exchange, payload validation/quarantine, credential lifecycle, reconciliation, and export controls.');
    validation_needed.push('Confirm partner data-sharing agreements, API auth model, webhook signing, EDI/SFTP/file-feed controls, payload validation, malware scanning, quarantine workflow, tenant isolation, export approvals, and breach notification duties.');
  }

  if (/\b(loyalty point|benefit redemption|stored value|stored value instrument|gift card|voucher|coupon|promotion loop|promo loop|recursive promotion|return fraud|refund abuse|counterfeit|delivery failure|delivery dispute|delivery-dispute|reverse logistics|reverse-logistics|substitution fraud|policy abuse|fraud ring|serial return|balance check)\b/i.test(text)) {
    classes.push({
      class: 'C4/C5 fraud and policy-abuse',
      data: 'loyalty balances, gift-card balances, coupons, promotion eligibility, refund decisions, return evidence, delivery disputes, fraud signals, and abuse review outcomes',
      handling: 'apply fraud scoring, velocity limits, step-up verification, maker-checker approval, audit evidence, manual review queues, and abuse-case game days',
    });
    dataPaths.push('fraud/risk engines, loyalty, gift-card, coupon, promotion, refund, returns, support, delivery dispute, and audit systems');
    findings.push('Retail financial abuse paths must be threat-modeled as first-class security risks, not only business-rule exceptions.');
    validation_needed.push('Confirm controls for loyalty draining, gift-card brute force/cloning, coupon looping, refund abuse, counterfeit returns, false delivery failure claims, and support override abuse.');
  }

  if (/\b(admin|backoffice|back office|price override|promotion|refund approval|manual adjustment|maker.?checker|four.?eyes|privileged)\b/i.test(text)) {
    classes.push({
      class: 'C4/C5 privileged operations',
      data: 'admin actions, price and promotion overrides, refund approvals, manual order changes, account recovery, and privileged audit events',
      handling: 'apply step-up authentication, maker-checker approval, segregation of duties, immutable audit logging, and anomaly monitoring',
    });
    dataPaths.push('admin portals, support tools, approval queues, audit event stores, SIEM, and privileged session recordings');
    findings.push('Backoffice and admin workflows must be treated as high-risk mutation paths with approval and audit evidence.');
    validation_needed.push('Confirm privileged workflows, maker-checker thresholds, segregation-of-duties rules, audit event schema, and admin session logging.');
  }

  if (!classes.length) {
    classes.push({
      class: 'unknown',
      data: 'data classes not explicit in current request',
      handling: 'treat as unclassified until the client validates data inventory and sensitivity',
    });
    validation_needed.push('Ask the client for data inventory, sensitivity, regulated workflows, and data-flow evidence.');
  }

  return {
    tool: 'classifyRetailDataTool',
    classes,
    data_paths: [...new Set(dataPaths)],
    findings,
    validation_needed,
  };
}

function detectPaymentScope(input = {}) {
  const text = textFromInput(input);
  const inScope = /\b(payment|payments|pci|pci-dss|pan|sad|psp|p2pe|card|cardholder|chd|cde|stored credential|stored credentials|acquirer token|wallet|upi|gift voucher|bnpl|token vault|refund|chargeback)\b/i.test(text);
  if (!inScope) {
    return {
      tool: 'detectPaymentScopeTool',
      in_scope: false,
      scope: 'No explicit payment/POS/PCI signal detected.',
      controls: [],
      risks: [],
      validation_needed: ['Confirm whether payment, refund, gift-card, wallet, UPI, POS, or PSP flows are in scope.'],
    };
  }

  return {
    tool: 'detectPaymentScopeTool',
    in_scope: true,
    scope: 'Payment and payment-adjacent flows appear in scope; internal systems should avoid raw PAN/SAD and rely on PSP/P2PE/token-vault boundaries.',
    controls: [
      'Define PSP/P2PE/token-vault boundary and keep raw PAN/SAD out of internal systems unless explicitly accepted into PCI scope.',
      'Segment payment orchestration, refund state, fraud signals, logs, support tickets, analytics exports, and AI prompt/tool paths from raw cardholder data.',
      'Require PAN/SAD DLP controls across chat transcripts, support tickets, logs, traces, analytics, prompt payloads, eval datasets, and exports.',
      'Collect QSA/security-owner validation for PCI segmentation, tokenisation, encryption, key ownership, and support access.',
    ],
    risks: [
      risk('PCI scope can expand through support tools, analytics, logs, AI prompts, vector stores, or refund workflows.', 'High', 'Medium', 'Block PAN/SAD fields, document PSP/P2PE/token-vault boundaries, and validate with QSA/security owner.'),
    ],
    validation_needed: [
      'Confirm exact payment methods, PSPs, token vault owner, refund flow, payment state store, and whether any raw cardholder data enters internal systems.',
      'Confirm QSA validation, segmentation evidence, log filtering, support access, and breach/incident responsibilities.',
    ],
  };
}

function detectAiSecurityScope(input = {}) {
  const text = textFromInput(input);
  const inScope = /\b(ai|agentic|llm|rag|embedding|vector|chatbot|model|recommendation|copilot|prompt|tool)\b/i.test(text);
  if (!inScope) {
    return {
      tool: 'detectAiSecurityScopeTool',
      in_scope: false,
      controls: [],
      risks: [],
      validation_needed: ['Confirm whether AI assistant, recommendation, RAG, vector store, embedding, or model-tool workflows are in scope.'],
    };
  }

  return {
    tool: 'detectAiSecurityScopeTool',
    in_scope: true,
    controls: [
      'Treat prompts, completions, embeddings, vector stores, eval traces, tool calls, and provider telemetry as data-processing paths.',
      'Use retrieval allowlists, metadata ACL filters, prompt-injection controls, tool permission scopes, and human escalation for high-risk actions.',
      'Exclude or redact PAN, PII, loyalty identifiers, support transcripts, secrets, auth tokens, fraud signals, and payment-sensitive fields before prompt assembly.',
      'Define model fallback, no-training/no-retention requirements, telemetry retention, residency, support access, and provider incident obligations.',
    ],
    risks: [
      risk('RAG and agent tools can silently create a new processor path for PII, loyalty, support, order, refund, and payment-adjacent data.', 'High', 'Medium', 'Approve retrieval sources, redaction, tool scopes, telemetry, retention, and residency before production.'),
      risk('AI tools may mutate OMS/WMS/CRM/loyalty/refund workflows without sufficient authorization or human approval.', 'High', 'Medium', 'Gate every tool by intent, role, step-up verification, rate limit, audit event, and human approval threshold.'),
    ],
    validation_needed: [
      'Confirm vector-store content sources, embedding provider, region, retention/deletion path, encryption/key ownership, and prompt/completion telemetry.',
      'Confirm whether chatbot/tools can access or mutate OMS, WMS, CRM, loyalty, refund, account recovery, or payment-status APIs.',
      'Confirm human escalation and customer re-verification rules for refunds, address changes, loyalty adjustments, and complaints.',
    ],
  };
}

function buildTrustBoundaryModel(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const text = textFromInput(input);
  const boundaries = [
    {
      boundary: 'Customer and channel edge',
      covers: 'web, mobile, CDN/WAF/bot controls, API gateway, customer auth/session',
      required_annotations: ['CA1/CA2 auth strength', 'T in transit', 'SB external boundary', 'TB trust boundary'],
    },
    {
      boundary: 'Internal service and data plane',
      covers: 'commerce APIs, order/payment orchestration, inventory/reservation, OMS/WMS integrations, event bus',
      required_annotations: ['A1/A2 credentials', 'R2/R3 at-rest encryption', 'T in transit', 'C3/C5/C5E data class'],
    },
    {
      boundary: 'Third-party and SaaS processors',
      covers: 'PSP, CRM/helpdesk, observability, analytics, LLM provider, embedding/vector providers, logistics partners',
      required_annotations: ['SB external security boundary', 'subprocessor owner', 'support-access controls', 'retention/residency status'],
    },
  ];

  if (signals.storeEdge) {
    boundaries.push({
      boundary: 'Store-edge/POS offline boundary',
      covers: 'store devices, local queues, offline checkout, reconnect/replay, local secrets, device trust',
      required_annotations: ['device trust', 'full-disk encryption', 'local queue encryption', 'replay/idempotency evidence'],
    });
  }

  if (signals.retailAi) {
    boundaries.push({
      boundary: 'AI/RAG/tool boundary',
      covers: 'prompt assembly, retrieval, vector store, model provider, eval traces, tool execution, human escalation',
      required_annotations: ['retrieval ACL', 'prompt redaction', 'tool scope', 'telemetry retention', 'model fallback'],
    });
  }

  if (/\b(terraform|iac|infrastructure as code|ci\/cd|cicd|pipeline|github|pull request|cloud config|config drift|drift|iam policy|security group|firewall rule|public bucket|public storage|s3 bucket|blob container)\b/i.test(text)) {
    boundaries.push({
      boundary: 'CI/CD, IaC, and cloud configuration drift boundary',
      covers: 'Terraform plans, pull requests, CI/CD policy gates, cloud config snapshots, IAM changes, network/security group rules, storage exposure, KMS/key policies, and logging/SIEM routing',
      required_annotations: ['policy-as-code gate', 'approved architecture graph', 'drift severity', 'exception owner', 'remediation SLA'],
    });
  }

  if (/\b(loyalty point|benefit redemption|stored value|stored value instrument|gift card|voucher|coupon|promotion loop|promo loop|recursive promotion|return fraud|refund abuse|counterfeit|delivery failure|delivery dispute|delivery-dispute|reverse logistics|reverse-logistics|substitution fraud|policy abuse|fraud ring|serial return|balance check)\b/i.test(text)) {
    boundaries.push({
      boundary: 'Retail fraud and policy-abuse boundary',
      covers: 'loyalty redemption, gift-card balance and redemption, coupon/promotion eligibility, refund approval, returns intake, delivery disputes, support overrides, and fraud review queues',
      required_annotations: ['fraud owner', 'velocity limit', 'step-up trigger', 'maker-checker gate', 'abuse-case audit'],
    });
  }

  if (signals.multiRegion) {
    boundaries.push({
      boundary: 'Regional residency and cross-border transfer boundary',
      covers: 'application data, backups, logs, traces, prompts, vectors, exports, support access, analytics, and vendor telemetry across regions',
      required_annotations: ['approved region', 'residency status', 'cross-border transfer basis', 'key region', 'support-access location'],
    });
  }

  if (signals.supplyChain) {
    boundaries.push({
      boundary: 'Supply-chain, warehouse, logistics, and partner integration boundary',
      covers: 'WMS/TMS/ERP, warehouse devices, supplier feeds, seller portals, EDI/SFTP, webhooks, last-mile/3PL/carrier partners, file feeds, quarantine stores, and reconciliation exports',
      required_annotations: ['partner auth', 'tenant isolation', 'signed webhook', 'schema validation', 'payload quarantine', 'replay/idempotency', 'export approval', 'C3/C5 data class'],
    });
  }

  return {
    tool: 'buildTrustBoundaryTool',
    boundaries,
    controls: [
      'Show trust boundaries and external security boundaries explicitly in diagrams and decision records.',
      'Assign owners for credentials, secrets, keys, certificates, audit review, support access, and security exceptions.',
      'Use mTLS/TLS for service-to-service and external traffic, managed secrets, KMS/HSM-backed key ownership, and privileged access logging.',
    ],
    validation_needed: [
      'Confirm security boundary ownership for SaaS, PSP, LLM/embedding/vector providers, CRM/helpdesk, observability, logistics, and support access.',
      'Confirm key rotation, certificate lifecycle, secret ownership, privileged access, and incident response owners.',
    ],
  };
}

function retrieveSecurityKnowledgeForInput(input = {}) {
  return retrieveSecurityKnowledge({
    query: textFromInput(input),
    retrievalPlan: input.retrievalPlan || input.retrieval_plan || [],
    signals: input.signals || getRetailSignals(input),
    limit: input.limit || 6,
  });
}

function validateSecurityOutput(input = {}) {
  const output = input.output || {};
  const signals = input.signals || {};
  const toolResults = asArray(input.toolResults);
  const text = [
    output.summary,
    output.findings,
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
    output.security_evidence_pack,
    output.policy_citations,
    output.accepted_assumptions,
    output.risks,
    output.validation_needed,
    output.model_summary,
    output.model_findings,
    toolResults,
  ].flat(4).map(item => typeof item === 'string' ? item : JSON.stringify(item || '')).join('\n').toLowerCase();

  const warnings = [];
  const blockers = [];
  const improvements = [];
  const hasEncryption = /encrypt|tls|kms|hsm|csek|cmek|m?tls|at rest|in transit/.test(text);
  const hasDataClass = /c3|c5|c5e|classif|pii|customer|payment-sensitive/.test(text);
  const hasTrust = /trust boundary|security boundary|sb|tb|boundary/.test(text);
  const hasSecrets = /secret|credential|key rotation|certificate|kms|hsm/.test(text);
  const hasLogs = /log|trace|redact|transcript|prompt|telemetry/.test(text);
  const hasHuman = /human|owner|qsa|validate|approval|sign-off|confirm/.test(text);
  const hasThreatModel = /threat|stride|abuse|spoofing|tampering|repudiation|exfiltration|prompt injection|replay/.test(text);
  const hasComplianceMap = /soc 2|iso 27001|pci-dss|gdpr|ccpa|dpdp|privacy act|compliance/.test(text);
  const hasEvidencePack = /evidence pack|policy_sources|citation|client_questions|approval_workflow|policy sources/.test(text);
  const hasVendor = /vendor|subprocessor|saas|provider|dpa|telemetry|support access/.test(text);
  const hasDrift = /drift|ci\/cd|cicd|terraform|iac|policy-as-code|cloud config|public bucket|public storage/.test(text);
  const hasFraudAbuse = /fraud|loyalty point|benefit redemption|stored value|gift card|voucher|coupon|promotion loop|recursive promotion|return fraud|refund abuse|counterfeit|delivery dispute|reverse logistics|policy abuse|abuse-case/.test(text);
  const hasIngestionSecurity = /payload validation|quarantine|edi|sftp|supplier feed|3pl|schema validation|webhook signing|malware scanning/.test(text);

  if (!hasDataClass) blockers.push('Security output does not classify sensitive retail data.');
  if (!hasEncryption) blockers.push('Security output does not prove encryption in transit and at rest.');
  if (!hasTrust) blockers.push('Security output does not define trust/security boundaries.');
  if (!hasSecrets) warnings.push('Security output should name secrets, key, certificate, and credential ownership.');
  if (!hasLogs) warnings.push('Security output should cover log, trace, prompt, transcript, and telemetry redaction.');
  if (!hasHuman) warnings.push('Security output should include named human validation and approval actions.');
  if (!hasThreatModel) blockers.push('Security output does not include an enterprise threat model.');
  if (!hasComplianceMap) warnings.push('Security output should map security controls to compliance frameworks or internal policies.');
  if (!hasEvidencePack) warnings.push('Security output should include an evidence pack with policy sources, citations, approval workflow, and client questions.');
  if (!hasVendor) warnings.push('Security output should include third-party/vendor/subprocessor security controls.');

  if (signals.payments && !/pci|pan|sad|psp|p2pe|token vault|token-vault/.test(text)) {
    blockers.push('Payment signals detected but PCI/PAN/SAD/PSP/token-vault boundary is missing.');
  }
  if (signals.retailAi && !/rag|vector|prompt|embedding|tool|model fallback|retrieval/.test(text)) {
    blockers.push('Retail AI signals detected but RAG/vector/prompt/tool security is missing.');
  }
  if (signals.storeEdge && !/offline|store-edge|pos|queue|replay|device trust/.test(text)) {
    warnings.push('Store-edge signals detected but offline POS/queue replay security is weak.');
  }
  const inputText = textFromInput(input);
  if (/\b(terraform|iac|ci\/cd|cicd|pipeline|github|cloud config|drift|public bucket|public storage|s3 bucket|iam policy)\b/i.test(inputText) && !hasDrift) {
    warnings.push('Configuration drift signals detected but CI/CD/IaC/cloud posture drift controls are weak.');
  }
  if (/\b(loyalty point|benefit redemption|stored value|gift card|voucher|coupon|promotion loop|recursive promotion|return fraud|refund abuse|counterfeit|delivery failure|delivery dispute|reverse logistics|policy abuse)\b/i.test(inputText) && !hasFraudAbuse) {
    warnings.push('Retail fraud/policy-abuse signals detected but abuse-case controls are weak.');
  }
  if (/\b(edi|sftp|supplier feed|3pl|wms|erp|webhook|file feed|asn|carrier)\b/i.test(inputText) && !hasIngestionSecurity) {
    warnings.push('B2B ingestion signals detected but payload validation/quarantine/replay controls are weak.');
  }

  if (!output.model_review?.enabled) {
    improvements.push('Run model judgement for customer-facing security recommendations when an approved model provider is available.');
  }
  if (!toolResults.length) {
    blockers.push('Security tools did not produce evidence for data classification, payment, AI, or trust-boundary checks.');
  }

  return {
    tool: 'validateSecurityOutputTool',
    verdict: blockers.length ? 'fail' : warnings.length ? 'warn' : 'pass',
    blockers,
    warnings,
    improvements,
    required_controls: {
      data_classification: hasDataClass,
      encryption: hasEncryption,
      trust_boundaries: hasTrust,
      secrets_and_keys: hasSecrets,
      log_prompt_trace_redaction: hasLogs,
      human_validation: hasHuman,
      threat_model: hasThreatModel,
      compliance_mapping: hasComplianceMap,
      evidence_pack: hasEvidencePack,
      vendor_security: hasVendor,
      configuration_drift_detection: hasDrift,
      retail_fraud_policy_abuse: hasFraudAbuse,
      b2b_ingestion_security: hasIngestionSecurity,
    },
  };
}

const toolInputSchema = z.object({
  query: z.string().optional(),
  context: z.record(z.any()).optional(),
  state: z.record(z.any()).optional(),
  signals: z.record(z.any()).optional(),
  ragContext: z.record(z.any()).optional(),
  retrievalPlan: z.array(z.string()).optional(),
  retrieval_plan: z.array(z.string()).optional(),
  limit: z.number().optional(),
  output: z.record(z.any()).optional(),
  toolResults: z.array(z.any()).optional(),
});

const securityTools = {
  classifyRetailDataTool: tool(classifyRetailData, {
    name: 'classifyRetailDataTool',
    description: 'Classify retail data sensitivity and handling requirements for security architecture.',
    schema: toolInputSchema,
  }),
  detectPaymentScopeTool: tool(detectPaymentScope, {
    name: 'detectPaymentScopeTool',
    description: 'Detect payment, PCI, PAN/SAD, PSP, P2PE, refund, and token-vault scope.',
    schema: toolInputSchema,
  }),
  detectAiSecurityScopeTool: tool(detectAiSecurityScope, {
    name: 'detectAiSecurityScopeTool',
    description: 'Detect AI, RAG, vector, prompt, embedding, chatbot, recommendation, and agent-tool security scope.',
    schema: toolInputSchema,
  }),
  buildTrustBoundaryTool: tool(buildTrustBoundaryModel, {
    name: 'buildTrustBoundaryTool',
    description: 'Build security/trust boundary model and diagram annotation requirements.',
    schema: toolInputSchema,
  }),
  retrieveSecurityKnowledgeTool: tool(retrieveSecurityKnowledgeForInput, {
    name: 'retrieveSecurityKnowledgeTool',
    description: 'Retrieve local ArchitectIQ retail security playbooks for RAG-style grounding.',
    schema: toolInputSchema,
  }),
  mapEnterpriseSecurityControlsTool: tool(buildEnterpriseSecurityControls, {
    name: 'mapEnterpriseSecurityControlsTool',
    description: 'Map enterprise security control domains, owners, and evidence requirements.',
    schema: toolInputSchema,
  }),
  buildThreatModelTool: tool(buildThreatModel, {
    name: 'buildThreatModelTool',
    description: 'Build STRIDE-style enterprise threat model and retail abuse cases.',
    schema: toolInputSchema,
  }),
  mapComplianceControlsTool: tool(mapComplianceControls, {
    name: 'mapComplianceControlsTool',
    description: 'Map security controls to PCI, privacy, SOC 2, ISO 27001, and AI/model governance evidence.',
    schema: toolInputSchema,
  }),
  buildSecurityEvidencePackTool: tool(buildSecurityEvidencePack, {
    name: 'buildSecurityEvidencePackTool',
    description: 'Build security evidence pack, citations, approval workflow, and client questions.',
    schema: toolInputSchema,
  }),
  validateSecurityOutputTool: tool(validateSecurityOutput, {
    name: 'validateSecurityOutputTool',
    description: 'Validate security output against mandatory ArchitectIQ security controls.',
    schema: toolInputSchema,
  }),
};

module.exports = {
  buildTrustBoundaryModel,
  buildEnterpriseSecurityControls,
  buildSecurityEvidencePack,
  buildThreatModel,
  classifyRetailData,
  detectAiSecurityScope,
  detectPaymentScope,
  mapComplianceControls,
  retrieveSecurityKnowledgeForInput,
  securityTools,
  validateSecurityOutput,
};
