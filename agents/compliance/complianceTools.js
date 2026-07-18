const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const { buildRetailText, getRetailSignals } = require('../retailContext');
const { retrieveComplianceKnowledge } = require('./complianceKnowledgeBase');

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

function securityContextFromInput(input = {}) {
  const state = input.state || {};
  return state.security_tool_context || state.agent_outputs?.security?.security_tool_results || {};
}

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

function assessJurisdictionScope(input = {}) {
  const text = textFromInput(input);
  const signals = input.signals || getRetailSignals(input);
  const securityContext = securityContextFromInput(input);
  const frameworks = [];
  const evidence_needed = [];

  if (signals.payments || /\bpci|payment|pan|sad|psp|p2pe|card\b/i.test(text)) {
    frameworks.push({
      framework: 'PCI-DSS',
      status: 'assumption',
      reason: 'Payment signals are present, but PSP attestation, token-vault boundary, segmentation, and QSA evidence are not verified.',
    });
    evidence_needed.push('PSP AOC/attestation, token-vault design, segmentation evidence, PAN/SAD DLP test results, and QSA/security-owner approval.');
  }
  if (/\bindia|dpdp|myntra\b/i.test(text)) {
    frameworks.push({
      framework: 'India DPDP Act',
      status: 'assumption',
      reason: 'India-first/customer data signals are present; applicability must be confirmed by legal/privacy owner.',
    });
    evidence_needed.push('DPDP legal basis, notice/consent, grievance, retention, deletion, processor, breach, and support-access evidence.');
  }
  if (/\beu|gdpr|europe|uk\b/i.test(text)) {
    frameworks.push({
      framework: 'GDPR/UK GDPR',
      status: 'assumption',
      reason: 'EU/UK customer or processing signal detected; controller/processor and transfer basis are not verified.',
    });
    evidence_needed.push('GDPR/UK GDPR applicability, SCC/transfer mechanism, DPA, subprocessor list, DSAR/delete path, and support-access controls.');
  }
  if (/\bccpa|cpra|california|united states|us\b/i.test(text)) {
    frameworks.push({
      framework: 'CCPA/CPRA',
      status: 'assumption',
      reason: 'US/California signal detected; consumer rights and sharing/sale obligations require legal validation.',
    });
    evidence_needed.push('CCPA/CPRA applicability, notice, opt-out/share/sale posture, deletion/access workflows, and processor terms.');
  }
  if (/\baustralia|privacy act|app\b/i.test(text)) {
    frameworks.push({
      framework: 'Australian Privacy Act',
      status: 'assumption',
      reason: 'Australian privacy signal detected; APP obligations and cross-border disclosure require validation.',
    });
    evidence_needed.push('Australian Privacy Act applicability, APP controls, cross-border disclosure evidence, retention, deletion, and support access.');
  }
  if (/\bsoc\s*2|soc2|iso\s*27001|iso27001|security compliance|audit\b/i.test(text) || securityContext.compliance_control_map) {
    frameworks.push({
      framework: 'SOC 2 / ISO 27001 control evidence',
      status: 'assumption',
      reason: 'Audit/control language or Security Agent compliance mapping is present; formal audit scope and evidence remain unverified.',
    });
    evidence_needed.push('SOC 2/ISO scope, control ownership, audit period, access review evidence, incident/security evidence, and exception register.');
  }
  if (/\bchildren|child|kids|minor|coppa|gdpr-k|parental consent|age gate\b/i.test(text)) {
    frameworks.push({
      framework: 'Children/minor privacy obligations',
      status: 'assumption',
      reason: 'Children/minor data signal detected; COPPA/GDPR-K or local minor privacy obligations require legal validation.',
    });
    evidence_needed.push('Age range, operating countries, parental-consent model, moderation controls, minor-data retention, and legal/privacy signoff.');
  }
  if (/\bmarketplace|seller|franchise|brand|partner|supplier|joint controller|joint processing|data sharing|seller portal\b/i.test(text)) {
    frameworks.push({
      framework: 'Marketplace/franchise data-sharing obligations',
      status: 'assumption',
      reason: 'Marketplace, seller, franchise, brand, or partner data-sharing signal detected; controller/processor responsibility and export approvals are not verified.',
    });
    evidence_needed.push('Seller/franchise agreements, data-sharing terms, processor/controller role, support-access location, export approval, and breach responsibility evidence.');
  }
  if (/\bemployee|workforce|staff|associate|badge|cctv|biometric|productivity monitoring|worker\b/i.test(text)) {
    frameworks.push({
      framework: 'Workforce privacy obligations',
      status: 'assumption',
      reason: 'Employee, associate, badge, CCTV, or workforce monitoring data detected; privacy/labour obligations require legal/HR validation.',
    });
    evidence_needed.push('Workforce privacy notice, monitoring basis, employee countries, retention, access review, and legal/HR approval.');
  }
  if (/\bpharmacy|prescription|health|medical|financial|credit|lending|insurance|regulated|hipaa|glba|apra|cps\s*234\b/i.test(text)) {
    frameworks.push({
      framework: 'Regulated retail sector obligations',
      status: 'assumption',
      reason: 'Health, pharmacy, financial, insurance, credit, or other regulated retail signal detected; sector-specific rules require legal/compliance validation.',
    });
    evidence_needed.push('Sector applicability assessment for HIPAA, GLBA, APRA/CPS 234, local health privacy, credit, insurance, or client-specific regulated obligations.');
  }
  if (/\bmust be compliant|fully compliant|make it compliant|compliance required|compliant architecture\b/i.test(text)) {
    frameworks.push({
      framework: 'Unspecified compliance requirement',
      status: 'missing',
      reason: 'The request asks for compliance without naming jurisdictions, frameworks, data classes, processors, or evidence.',
    });
    evidence_needed.push('Clarify required frameworks, operating countries, customer regions, data classes, processors, support access, audit scope, and legal owner.');
  }

  if (!frameworks.length && (signals.customerData || signals.loyaltyData)) {
    frameworks.push({
      framework: 'Retail privacy obligations',
      status: 'assumption',
      reason: 'Customer/loyalty data is in scope, but jurisdictions are not explicit.',
    });
    evidence_needed.push('Operating countries, customer countries, residency requirements, privacy frameworks, and legal owner sign-off.');
  }

  return {
    tool: 'assessJurisdictionScopeTool',
    frameworks,
    evidence_needed,
    findings: frameworks.map(item => `${item.framework} remains ${item.status}: ${item.reason}`),
    validation_needed: evidence_needed,
  };
}

function buildProcessorResidencyMatrix(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const state = input.state || {};
  const securityContext = state.security_tool_context || {};
  const securitySignalProfile = state.security_signal_profile || {};
  const rows = [
    ['Application services', 'orders, carts, sessions, customer metadata, operational events', 'validate app runtime/data residency and processor terms'],
    ['Transactional stores', 'order, payment metadata, inventory/reservation, promotion ledger, audit state', 'validate storage region, encryption, backups, restore, and access controls'],
    ['Logs, metrics, traces, SIEM', 'PII/payment-adjacent metadata, support diagnostics, agent/tool traces', 'redact/minimise, validate residency, retention, export, and support access'],
    ['Backups, snapshots, DR copies', 'production retail data, audit history, restore payloads', 'validate backup region, retention, restore access, and deletion limitations'],
    ['SaaS admin/support systems', 'tickets, support transcripts, admin identities, debug bundles, incident exports', 'validate support region, subprocessors, retention, and approval workflow'],
    ['CRM/CDP/loyalty/campaign platforms', 'customer profiles, consent, segments, loyalty, activation events', 'validate consent, deletion, processor, campaign audit, and regional handling'],
  ];

  if (signals.payments || securityContext.payment_scope?.in_scope) {
    rows.push(['PSP/token vault/payment processors', 'payment tokens, PSP references, refund state, payment-adjacent metadata', 'validate PCI scope, PSP AOC, tokenisation boundary, support access, and processor role']);
  }
  if (signals.retailAi || securityContext.ai_security_scope?.in_scope) {
    rows.push(['LLM, embeddings, vector stores, eval traces', 'prompts, completions, retrieved snippets, embeddings, vector metadata, telemetry', 'validate provider retention, no-training, residency, deletion, subprocessor, and support access']);
  }
  if (Array.isArray(securitySignalProfile.domains) && securitySignalProfile.domains.some(domain => domain.id === 'ai_rag_tooling')) {
    rows.push(['AI retrieval and tool-security evidence', 'retrieval filters, tool audit trails, prompt redaction evidence, approval logs', 'validate that Security Agent AI/RAG controls are reflected in compliance evidence and provider terms']);
  }
  if (signals.supplyChain) {
    rows.push(['OMS/WMS/logistics/supplier processors', 'order, delivery promise, fulfilment, address, exception, carrier metadata', 'validate processor terms, data minimisation, support access, and incident/export obligations']);
  }
  if (/\bmarketplace|seller|franchise|partner|supplier|data sharing|seller portal\b/i.test(textFromInput(input))) {
    rows.push(['Marketplace, seller, franchise, and partner processors', 'seller profile, product/catalogue, order, fulfilment, return, support, and customer-contact data', 'validate data-sharing terms, export approvals, support location, controller/processor role, and breach obligations']);
  }
  if (/\bemployee|workforce|staff|associate|badge|cctv|biometric|worker\b/i.test(textFromInput(input))) {
    rows.push(['Workforce systems and monitoring processors', 'employee identifiers, shift/activity data, badge events, CCTV, device telemetry, support and HR case data', 'validate workforce privacy notice, legal basis, region, retention, access limits, and HR/legal approval']);
  }

  return {
    tool: 'buildProcessorResidencyMatrixTool',
    matrix: rows.map(([component, data_touched, action]) => ({
      component,
      data_touched,
      region_or_residency: 'unknown until client/provider evidence is supplied',
      status: 'assumption',
      action,
    })),
    validation_needed: [
      'Confirm production, backup, log, trace, SaaS, AI, vector, and support-access regions.',
      'Confirm processor/subprocessor list, DPA terms, retention, deletion, breach, and support-access evidence.',
    ],
  };
}

function defineRetentionDeletionControls(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const controls = [
    'Define retention classes for customer, loyalty, support transcript, payment-adjacent, order, inventory, audit, telemetry, prompt, embedding, and backup data.',
    'Map deletion/DSAR propagation across OLTP stores, search indexes, queues, object storage, backups, logs, BI exports, support tools, embeddings/vector stores, and provider telemetry.',
    'Separate legal/audit retention from operational retention and document deletion exceptions.',
    'Require access review, support-access approval, audit evidence, and export controls for regulated data.',
  ];
  if (signals.retailAi) {
    controls.push('For AI/RAG, define prompt/completion retention, eval trace retention, embedding deletion/rebuild, vector metadata deletion, no-training/no-retention settings, and human escalation audit.');
  }
  if (signals.payments) {
    controls.push('For payments, prove PAN/SAD exclusion from retention scope or explicitly document PCI-scoped storage, retention, and destruction controls.');
  }
  if (/\bchildren|child|kids|minor|coppa|gdpr-k|parental consent|age gate\b/i.test(textFromInput(input))) {
    controls.push('For children/minor data, define age-gated retention, parental/guardian rights workflows, content moderation evidence retention, and stricter deletion limits.');
  }
  if (/\bemployee|workforce|staff|associate|badge|cctv|biometric|worker\b/i.test(textFromInput(input))) {
    controls.push('For workforce data, define employee privacy retention, monitoring evidence retention, HR/legal access controls, and deletion or access-rights workflows by jurisdiction.');
  }
  if (/\bmarketplace|seller|franchise|partner|supplier|data sharing|seller portal\b/i.test(textFromInput(input))) {
    controls.push('For marketplace/franchise/partner data sharing, define export retention, seller-support case retention, contract evidence retention, and breach/audit evidence ownership.');
  }

  return {
    tool: 'defineRetentionDeletionTool',
    controls,
    validation_needed: [
      'Confirm legal retention schedule, DSAR/delete SLA, backup deletion limitations, and customer support transcript handling.',
      'Confirm owner and evidence for deletion propagation into analytics, campaign activation, AI/vector stores, logs, traces, and exports.',
    ],
  };
}

function retrieveComplianceKnowledgeForInput(input = {}) {
  return retrieveComplianceKnowledge({
    query: textFromInput(input),
    retrievalPlan: input.retrievalPlan || input.retrieval_plan || [],
    signals: input.signals || getRetailSignals(input),
    limit: input.limit || 6,
  });
}

function validateComplianceOutput(input = {}) {
  const output = input.output || {};
  const signals = input.signals || {};
  const toolResults = asArray(input.toolResults);
  const text = [
    output.summary,
    output.findings,
    output.compliance_recommendation,
    output.jurisdiction_frameworks,
    output.validation_needed,
    output.residency_matrix,
    output.processor_residency_matrix,
    output.retention_deletion_controls,
    output.compliance_evidence_status,
    output.compliance_validation_gates,
    output.compliance_qualification,
    output.compliance_policy_citations,
    output.compliance_evidence_pack,
    output.compliance_signal_profile,
    output.model_summary,
    output.model_findings,
    toolResults,
  ].flat(5).map(item => typeof item === 'string' ? item : JSON.stringify(item || '')).join('\n').toLowerCase();

  const blockers = [];
  const warnings = [];
  const improvements = [];
  const hasEvidenceStatus = /assumption|partial|verified|evidence_status|evidence status/.test(text);
  const hasResidency = /residen|region|backup|log|trace|support access|processor|subprocessor/.test(text);
  const hasRetention = /retention|delete|deletion|dsar|erasure|consent/.test(text);
  const hasHuman = /legal|privacy|owner|validate|confirm|approval|sign-off|qsa/.test(text);
  const hasSecurityHandoff = /security|pci|payment|c5|c5e|prompt|vector|support/.test(text);
  const hasQualification = /not legal advice|draft|certification|audit attestation|human review|legal\/privacy/.test(text);
  const hasCitations = /citation|source_id|baseline|policy/.test(text);
  const hasEvidencePack = /evidence_pack|policy_sources|approval_workflow|client_questions|processor_evidence_needed|retention_evidence_needed|framework_evidence_needed/.test(text);

  if (!hasEvidenceStatus) blockers.push('Compliance output does not separate verified/partial/assumption evidence.');
  if (!hasResidency) blockers.push('Compliance output does not cover end-to-end residency and processor evidence.');
  if (!hasRetention) blockers.push('Compliance output does not cover retention, deletion/DSAR, consent, or erasure.');
  if (!hasHuman) warnings.push('Compliance output should require legal/privacy/QSA/human validation owners.');
  if (!hasSecurityHandoff) warnings.push('Compliance output should consume Security Agent data classification, payment, AI, and support-access context.');
  if (!hasQualification) blockers.push('Compliance output does not qualify that generated compliance mapping is a draft requiring legal/privacy review.');
  if (!hasCitations) warnings.push('Compliance output should include citations or source evidence for compliance recommendations.');
  if (!hasEvidencePack) blockers.push('Compliance output does not include an evidence pack with policy sources, approval workflow, client questions, and evidence needed.');
  if (signals.payments && !/pci|qsa|pan|sad|psp|token/.test(text)) blockers.push('Payments are in scope but PCI/QSA/tokenisation evidence is missing.');
  if (signals.retailAi && !/prompt|completion|embedding|vector|telemetry|eval/.test(text)) blockers.push('Retail AI is in scope but prompt/completion/embedding/vector/telemetry compliance is missing.');
  if (!toolResults.length) blockers.push('Compliance tools did not produce jurisdiction, processor, retention, or validation evidence.');
  if (!output.model_review?.enabled) improvements.push('Run model judgement for customer-specific compliance recommendations when an approved model is available.');

  return {
    tool: 'validateComplianceOutputTool',
    verdict: blockers.length ? 'fail' : warnings.length ? 'warn' : 'pass',
    blockers,
    warnings,
    improvements,
    required_controls: {
      evidence_status: hasEvidenceStatus,
      residency_processors: hasResidency,
      retention_deletion_consent: hasRetention,
      human_validation: hasHuman,
      security_handoff_used: hasSecurityHandoff,
      compliance_qualification: hasQualification,
      citations_or_sources: hasCitations,
      evidence_pack: hasEvidencePack,
    },
  };
}

const toolInputSchema = z.object({
  query: z.string().optional(),
  context: z.record(z.any()).optional(),
  state: z.record(z.any()).optional(),
  signals: z.record(z.any()).optional(),
  output: z.record(z.any()).optional(),
  toolResults: z.array(z.any()).optional(),
  retrievalPlan: z.array(z.string()).optional(),
  retrieval_plan: z.array(z.string()).optional(),
  limit: z.number().optional(),
});

const complianceTools = {
  assessJurisdictionScopeTool: tool(assessJurisdictionScope, {
    name: 'assessJurisdictionScopeTool',
    description: 'Assess retail compliance jurisdiction and framework scope.',
    schema: toolInputSchema,
  }),
  buildProcessorResidencyMatrixTool: tool(buildProcessorResidencyMatrix, {
    name: 'buildProcessorResidencyMatrixTool',
    description: 'Build processor and residency matrix from retail/security context.',
    schema: toolInputSchema,
  }),
  defineRetentionDeletionTool: tool(defineRetentionDeletionControls, {
    name: 'defineRetentionDeletionTool',
    description: 'Define retention, deletion, DSAR, consent, and support-access compliance controls.',
    schema: toolInputSchema,
  }),
  retrieveComplianceKnowledgeTool: tool(retrieveComplianceKnowledgeForInput, {
    name: 'retrieveComplianceKnowledgeTool',
    description: 'Retrieve local ArchitectIQ compliance playbooks and evidence templates.',
    schema: toolInputSchema,
  }),
  validateComplianceOutputTool: tool(validateComplianceOutput, {
    name: 'validateComplianceOutputTool',
    description: 'Validate compliance output against mandatory evidence, residency, retention, and human-validation requirements.',
    schema: toolInputSchema,
  }),
};

module.exports = {
  assessJurisdictionScope,
  buildProcessorResidencyMatrix,
  complianceTools,
  defineRetentionDeletionControls,
  retrieveComplianceKnowledgeForInput,
  validateComplianceOutput,
};
