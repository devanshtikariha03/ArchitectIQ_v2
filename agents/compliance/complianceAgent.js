const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeModelReview, runSpecialistModel } = require('../llmClient');

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

function matrix(component, dataTouched, action) {
  return {
    component,
    data_touched: dataTouched,
    region_or_residency: 'unknown until client/provider evidence is supplied',
    status: 'unknown',
    action,
  };
}

async function runComplianceAgent({ query, context, state, retrievedContext, useModel }) {
  const signals = getRetailSignals({ query, context, state });
  const obligations = [
    'Maintain evidence_status as assumption/partial/verified; do not claim compliance, residency, current pricing, or provider availability without evidence.',
    'Validate data residency end to end across application data, backups, logs, traces, audit exports, prompt payloads, embeddings, vector stores, SaaS metadata, support access, and incident/debug bundles.',
    'Define retention, deletion, DSAR/erasure, consent, access-review, audit-evidence, and support-access obligations for retail customer and operational data.',
    'Separate verified legal/privacy requirements from inferred retail architecture assumptions and route unverified claims to human validation.',
  ];

  if (signals.payments) {
    obligations.push('For payments, assess PCI-DSS scope, PSP/P2PE/tokenisation boundary, segmentation evidence, log controls, and QSA/human validation.');
  }
  if (signals.customerData || signals.loyaltyData) {
    obligations.push('For customer/loyalty data, assess GDPR, CCPA, Privacy Act, DPDP, consent, minimisation, regional ownership, campaign activation, analytics minimisation, and deletion workflows where applicable.');
  }
  if (signals.storeEdge) {
    obligations.push('For stores/POS/offline trading, prove that offline mode does not weaken privacy, PCI, audit, retention, or support-access controls.');
  }
  if (signals.franchise) {
    obligations.push('For franchise or multi-brand retail, define brand/franchise data boundaries, support access rules, regional processor responsibilities, and audit ownership.');
  }
  if (signals.supplyChain) {
    obligations.push('For supply-chain/fulfilment, check supplier, WMS/TMS, food-safety/product-safety, substitution, delivery promise, and exception-audit obligations where relevant.');
  }
  if (signals.retailAi) {
    obligations.push('For retail AI/agentic workflows, validate model/provider telemetry, prompt/completion residency, eval datasets, retrieval sources, human escalation, and automated-decision auditability.');
  }

  const residencyMatrix = [
    matrix('Retail application services', 'orders, carts, inventory, fulfilment, customer/session data', 'validate region and processor evidence'),
    matrix('Object storage and document exports', 'architecture packs, audit evidence, imports/exports, support files, and batch landing data', 'validate storage region, encryption, retention, and access controls'),
    matrix('Logs, metrics, traces, SIEM, and audit exports', 'PII/payment-adjacent metadata, access logs, agent/tool traces', 'redact, minimise, retain, and validate residency'),
    matrix('Backups, snapshots, and DR copies', 'production retail data and audit history', 'validate storage region and restore access controls'),
    matrix('CDN, edge processing, and edge logs', 'customer IP/device/session metadata, cache keys, storefront traffic, and error logs', 'validate edge location, log retention, and minimisation'),
    matrix('SaaS admin metadata and support access', 'admin identities, tickets, debug bundles, incident exports, and support transcripts', 'validate support region, subprocessor list, and access approval'),
    matrix('CRM, ERP, helpdesk, observability, analytics, and ticketing integrations', 'customer, order, payment-adjacent, support, and operational metadata', 'validate processor obligations and cross-border transfer rules'),
  ];

  if (signals.retailAi) {
    residencyMatrix.push(matrix('LLM prompts, completions, moderation payloads, embeddings, vector stores, eval traces, and provider telemetry', 'client context, architecture docs, customer/support data if included', 'redact or self-host/region-host where residency is not verified'));
  }
  if (signals.payments) {
    residencyMatrix.push(matrix('PSP/token vault/payment integrations', 'payment tokens and payment-adjacent metadata', 'validate PCI scope, tokenisation boundary, and support access'));
  }
  if (signals.customerData || signals.loyaltyData) {
    residencyMatrix.push(matrix('CRM/CDP/loyalty/campaign platforms', 'customer profile, consent, loyalty, segments, activation events', 'validate consent, deletion, processor, and regional handling'));
  }

  const risks = [
    risk(
      'The recommendation may imply compliance without verified jurisdiction, residency, processor, support-access, or audit evidence.',
      'High',
      'High',
      'Compliance owner to mark evidence as assumption/partial until legal, privacy, security, and provider evidence is collected.'
    ),
  ];

  if (signals.retailAi) {
    risks.push(risk(
      'Retail AI traces, prompts, embeddings, and vector stores can silently create new regulated data processors.',
      'High',
      'Medium',
      'AI governance owner to approve retrieval sources, redaction, telemetry settings, region, retention, and human-escalation policy.'
    ));
  }

  const validationNeeded = [
    'Confirm operating countries, customer regions, store regions, data residency requirements, and cross-border transfer constraints.',
    'Confirm which frameworks apply: PCI-DSS, GDPR, CCPA, Australian Privacy Act, India DPDP Act, franchise obligations, sector rules, or client policy.',
    'Confirm retention, deletion/DSAR, support access, audit evidence, and processor/subprocessor requirements with legal/privacy owners.',
  ];

  const base = {
    agentId: 'compliance',
    title: 'Compliance AI Agent',
    status: 'completed',
    summary: 'Retail compliance review aligned to the ArchitectIQ prompt: evidence-aware obligations, end-to-end residency, PCI/privacy scope, and human validation gates.',
    retail_workload: signals.workloadTypes,
    findings: obligations,
    residency_matrix: residencyMatrix,
    risks,
    validation_needed: validationNeeded,
    retrieval_requests: [
      'retail-compliance-playbook',
      'retail-residency-and-processor-matrix',
      'pci-privacy-and-support-access-evidence-checklist',
      'retail-ai-data-residency-review-template',
    ],
    evidence: retailEvidence(retrievedContext),
    statePatch: {
      retail_workload: signals.workloadTypes,
      compliance_obligations: obligations,
      residency_matrix: residencyMatrix,
      evidence_status: {
        compliance: 'assumption',
        data_residency: 'assumption',
      },
      risks,
      human_validation_needed: validationNeeded,
      validation_gaps: [
        'Compliance Agent needs jurisdiction, processor, residency, retention, deletion, support-access, and audit-evidence confirmation before compliance can be marked verified.',
      ],
      retrieval_requests: [
        'retail-compliance-playbook',
        'retail-residency-and-processor-matrix',
        'pci-privacy-and-support-access-evidence-checklist',
        'retail-ai-data-residency-review-template',
      ],
    },
  };

  if (!useModel) return base;

  try {
    const modelReview = await runSpecialistModel({
      agentId: 'compliance',
      title: 'Compliance AI Agent',
      system: `You are the ArchitectIQ Retail Compliance AI Agent. Review retail compliance and residency only. Apply the legacy ArchitectIQ rules: never claim compliance or residency without evidence; separate verified/partial/assumption; validate app data, backups, object storage, prompt payloads, completions, embeddings, vector stores, moderation, telemetry, logs, traces, eval datasets, CDN/edge logs, SaaS metadata, support access, CRM/ERP/helpdesk/observability/analytics/ticketing integrations; cover PCI-DSS, GDPR, CCPA, Australian Privacy Act, India DPDP, retention, deletion/DSAR, consent, support access, processors, and audit evidence where relevant. Return concise JSON only.`,
      input: JSON.stringify({
        query,
        context,
        current_state: state,
        deterministic_compliance_review: base,
      }),
    });
    return mergeModelReview(base, modelReview);
  } catch (err) {
    return {
      ...base,
      model_review: {
        enabled: true,
        error: err.message,
      },
      validation_needed: [
        ...base.validation_needed,
        `Compliance model review failed and deterministic compliance rules were used instead: ${err.message}`,
      ],
    };
  }
}

module.exports = { runComplianceAgent };
