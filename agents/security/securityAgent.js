const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeModelReview, runSpecialistModel } = require('../llmClient');

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

async function runSecurityAgent({ query, context, state, retrievedContext, useModel }) {
  const signals = getRetailSignals({ query, context, state });
  const controls = [
    'Classify retail data before design: C5/C5E for customer, loyalty, support transcript, payment-adjacent, profile, and sensitive audit data; C3 for operational inventory/order data where appropriate.',
    'Apply encryption before tokenisation or masking: TLS 1.2+ in transit (T), KMS/HSM/CMEK/CSEK or managed-key encryption at rest (R2/R3), and field/app-layer encryption for C5E data.',
    'Store credentials in Secret Manager or equivalent (A1), encrypt system-to-system credentials (A2), and assign key-rotation and certificate-lifecycle owners.',
    'Use strong customer, associate, admin, and service authentication with MFA/passwordless/step-up controls where risk requires it (CA1), plus privileged access logging.',
    'Show trust boundaries (TB), security boundaries (SB), network zones, egress controls, and external SaaS/third-party ownership boundaries in architecture diagrams.',
    'Require diagram annotation evidence where applicable: A1/A2 credentials, CA1/CA2 auth strength, R2/R3 at-rest encryption, T in-transit encryption, C3/C5/C5E data class, SB external security boundary, and TB trust boundary.',
    'Redact PAN, PII, loyalty identifiers, support transcripts, secrets, and auth tokens from logs, traces, prompt payloads, eval datasets, support bundles, and exports.',
  ];

  if (signals.payments) {
    controls.push('Keep raw PAN/SAD out of internal systems unless explicitly in PCI scope; define PSP/P2PE/token-vault boundary, PCI segmentation evidence, logging controls, and QSA/human validation.');
  }
  if (signals.storeEdge) {
    controls.push('For store-edge/POS paths, require device trust, full-disk encryption, encrypted local durable queues, offline auth/payment boundaries, queue ordering, replay/idempotency, conflict policy, reconnect criteria, and field runbooks.');
  }
  if (signals.commerce) {
    controls.push('For digital commerce, isolate catalogue/search/campaign traffic from checkout, payment, order commit, and inventory lock paths using WAF/CDN, rate limits, circuit breakers, and degraded-mode rules.');
  }
  if (signals.customerData || signals.loyaltyData) {
    controls.push('For customer/loyalty data, require consent-aware access, pseudonymisation/tokenisation, retention, deletion/DSAR, regional ownership, support-access controls, and analytics minimisation.');
  }
  if (signals.retailAi) {
    controls.push('For retail AI/RAG/agent paths, require prompt-injection controls, retrieval allowlists, tool permission scopes, prompt/completion residency review, trace redaction, model fallback, and human escalation.');
  }

  const risks = [
    risk(
      'Retail security can look complete while missing the actual payment, customer, loyalty, store-edge, and support-access data paths.',
      'High',
      'Medium',
      'Security owner to validate a data-flow and trust-boundary map before architecture approval.'
    ),
    risk(
      'Tokenisation or masking may be treated as a substitute for encryption and key ownership.',
      'High',
      'Medium',
      'Security architect to require explicit encryption in transit, encryption at rest, key ownership, key rotation, and log redaction before sign-off.'
    ),
  ];

  if (signals.payments) {
    risks.push(risk(
      'PCI scope can expand if POS, store edge, logs, support tools, analytics, or agent prompts receive raw card data or payment-sensitive fields.',
      'High',
      'Low',
      'Payment/security owner to document PSP/P2PE/token-vault boundaries, block PAN/SAD fields in schemas and logs, and collect QSA validation.'
    ));
  }

  if (signals.storeEdge) {
    risks.push(risk(
      'Offline store continuity can preserve checkout while creating replay, duplicate, privacy, or audit failures after reconnect.',
      'High',
      'Medium',
      'Store technology lead to run WAN outage, queue replay, duplicate handling, and reconciliation acceptance tests before pilot expansion.'
    ));
  }

  const validationNeeded = [
    'Confirm retail data classes and map each class to applications, stores, integrations, logs, prompt payloads, backups, support access, and exports.',
    'Confirm PCI scope, PSP/P2PE/token-vault boundary, network segmentation evidence, and QSA/human validation requirements if payments are in scope.',
    'Confirm owners for IAM, secrets, key rotation, certificate lifecycle, SIEM/audit review, incident response, and security exceptions.',
  ];

  const base = {
    agentId: 'security',
    title: 'Security AI Agent',
    status: 'completed',
    summary: 'Retail security review aligned to the ArchitectIQ prompt: encryption-first controls, PCI/privacy boundaries, trust boundaries, store-edge security, and AI/tooling safeguards.',
    retail_workload: signals.workloadTypes,
    findings: controls,
    risks,
    validation_needed: validationNeeded,
    retrieval_requests: [
      'retail-security-control-playbook',
      'pci-scope-and-tokenization-boundary-template',
      'retail-data-classification-and-encryption-standard',
      'store-edge-offline-security-acceptance-tests',
    ],
    evidence: retailEvidence(retrievedContext),
    statePatch: {
      retail_workload: signals.workloadTypes,
      data_classification: [
        'C5/C5E: customer, loyalty, support transcript, payment-adjacent, profile, auth/session, and sensitive audit data where present.',
        'C3: operational inventory, order, fulfilment, catalogue, and store execution data unless client classification says otherwise.',
      ],
      security_controls: controls,
      risks,
      human_validation_needed: validationNeeded,
      validation_gaps: [
        'Security Agent needs retail data classification, PCI/payment boundary, key ownership, and trust-boundary evidence before client-ready approval.',
      ],
      retrieval_requests: [
        'retail-security-control-playbook',
        'pci-scope-and-tokenization-boundary-template',
        'retail-data-classification-and-encryption-standard',
        'store-edge-offline-security-acceptance-tests',
      ],
    },
  };

  if (!useModel) return base;

  try {
    const modelReview = await runSpecialistModel({
      agentId: 'security',
      title: 'Security AI Agent',
      system: `You are the ArchitectIQ Retail Security AI Agent. Review only retail and retail-adjacent architecture. Apply the legacy ArchitectIQ security rules: encryption before tokenisation/masking; PCI scope minimisation; PAN/SAD exclusion; PSP/P2PE/token vault boundary; trust boundaries; IAM/MFA; secrets; key rotation; certificate lifecycle; store-edge/offline queue security; support-access controls; log redaction; AI/RAG prompt, trace, tool, and retrieval security. Return concise JSON only.`,
      input: JSON.stringify({
        query,
        context,
        current_state: state,
        deterministic_security_review: base,
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
        `Security model review failed and deterministic security rules were used instead: ${err.message}`,
      ],
    };
  }
}

module.exports = { runSecurityAgent };
