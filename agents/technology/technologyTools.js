const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const { buildRetailText, getRetailSignals } = require('../retailContext');
const { retrieveTechnologyKnowledge } = require('./technologyKnowledgeBase');

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

function inspectTechnologyHandoff(input = {}) {
  const state = input.state || {};
  const upstream = {
    security: Boolean(state.agent_outputs?.security || state.security_tool_context),
    compliance: Boolean(state.agent_outputs?.compliance || state.compliance_tool_context),
    governance: Boolean(state.agent_outputs?.governance || state.governance_tool_context),
    infrastructure: Boolean(state.agent_outputs?.infrastructure || state.infrastructure_tool_context),
    finops: Boolean(state.agent_outputs?.finops || state.finops_tool_context),
    security_evidence_status: state.security_evidence_pack?.evidence_status || state.evidence_status || {},
    compliance_evidence_status: state.compliance_evidence_status || {},
    governance_evidence_status: state.governance_evidence_status || {},
    infrastructure_evidence_status: state.infrastructure_evidence_status || {},
    finops_evidence_status: state.finops_evidence_status || {},
    validation_gaps: asArray(state.validation_gaps),
  };
  const controls = [
    'Carry upstream constraints into technology choices: data classes, PCI/privacy, residency, owners, runtime topology, network boundaries, observability, support, pricing, and rollout gates.',
    'Technology remains draft until API, Storage, AI, and UI specialist reviews validate evidence, NFRs, ownership, and rejected alternatives.',
  ];
  if (upstream.security) controls.push('Apply Security handoff to data classes, trust boundaries, credentials, secrets, keys, privileged access, AI/RAG safety, and audit logging.');
  if (upstream.compliance) controls.push('Apply Compliance handoff to residency, processor, retention, deletion, support access, and audit evidence decisions.');
  if (upstream.governance) controls.push('Apply Governance handoff to systems of record, accountable owners, ADRs, approval gates, rollout waves, and acceptance tests.');
  if (upstream.infrastructure) controls.push('Apply Infrastructure handoff to runtime, network, HA/DR, observability, environment, release, and topology constraints.');
  if (upstream.finops) controls.push('Apply FinOps handoff to unit drivers, pricing evidence, cost levers, support/licensing, non-prod parity, and budget guardrails.');

  return {
    tool: 'inspectTechnologyHandoffTool',
    upstream,
    controls,
    validation_needed: [
      'Confirm upstream Security, Compliance, Governance, Infrastructure, and FinOps outputs are accepted as constraints before technology approval.',
      'Confirm unresolved validation gaps are assigned to technology, platform, security, compliance, governance, and FinOps owners.',
    ],
  };
}

function decomposeTechnologyDomains(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const text = textFromInput(input);
  const hasAi = signals.retailAi || /ai|rag|llm|embedding|vector|rerank|chatbot|recommendation|model/.test(text);
  const hasStoreEdge = signals.storeEdge || /pos|store edge|associate|offline/.test(text);
  return {
    tool: 'decomposeTechnologyDomainsTool',
    technology_domains: [
      {
        domain: 'API and integration',
        owner: 'API Agent / integration architect',
        scope: 'API gateway, service contracts, orchestration, events, third-party integrations, idempotency, replay, DLQs, reconciliation.',
        evidence_status: 'assumption',
      },
      {
        domain: 'Storage and data platform',
        owner: 'Storage Agent / data architect',
        scope: 'OLTP truth, cache, search, object storage, backups, replication, retention, rebuild, analytics handoff.',
        evidence_status: 'assumption',
      },
      {
        domain: 'AI platform',
        owner: 'AI Agent / AI architect',
        scope: hasAi ? 'RAG, LLM/model routing, embeddings, vector DB, reranking, chatbot/recommendation, evals, fallback, privacy, cost controls.' : 'Conditional until AI/RAG/model usage is confirmed.',
        evidence_status: hasAi ? 'assumption' : 'conditional',
      },
      {
        domain: 'UI and experience',
        owner: 'UI Agent / frontend architect',
        scope: hasStoreEdge ? 'Storefront, admin, associate/POS, mobile, offline behavior, accessibility, telemetry, feature flags, rollback.' : 'Storefront, admin, support, mobile/web channels, accessibility, performance, telemetry, feature flags, rollback.',
        evidence_status: 'assumption',
      },
    ],
    controls: [
      'Treat API, Storage, AI, and UI as separate specialist validation tracks.',
      'Keep final architecture diagram blocked until specialist technology tracks are validated.',
      'Map every technology domain to systems of record, data flows, NFRs, owners, and acceptance tests.',
    ],
    validation_needed: [
      'Confirm API, Storage, AI, and UI specialist owners and review sequence.',
      'Confirm which domains are in scope for this client and which are conditional.',
    ],
  };
}

function planSpecialistHandoff(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  return {
    tool: 'planSpecialistHandoffTool',
    specialist_handoff_matrix: [
      {
        agent: 'API Agent',
        priority: 'high',
        inputs_needed: ['systems of record', 'service boundaries', 'third-party list', 'sync/async rules', 'event schema needs', 'SLA/NFR targets'],
        expected_output: 'API gateway, service contracts, orchestration, integration, idempotency, replay, DLQ, and reconciliation recommendation.',
      },
      {
        agent: 'Storage Agent',
        priority: 'high',
        inputs_needed: ['data domains', 'consistency needs', 'transactional truth', 'retention', 'backup/RTO/RPO', 'search/cache/read model needs'],
        expected_output: 'OLTP/cache/search/object/backup/replication/rebuild recommendation with data-owner evidence.',
      },
      {
        agent: 'AI Agent',
        priority: signals.retailAi ? 'high' : 'conditional',
        inputs_needed: ['AI use cases', 'prompt data classes', 'model policy', 'retrieval corpus', 'vector DB constraints', 'token budget', 'fallback and eval requirements'],
        expected_output: 'RAG, LLM routing, vector DB, embedding, reranking, chatbot/recommendation, eval, fallback, and privacy/cost recommendation.',
      },
      {
        agent: 'UI Agent',
        priority: 'medium',
        inputs_needed: ['channels', 'personas', 'journeys', 'performance budget', 'accessibility', 'offline needs', 'release/rollback needs'],
        expected_output: 'Storefront/admin/mobile/POS UI architecture with performance, accessibility, telemetry, feature flag, and rollback controls.',
      },
    ],
    controls: [
      'Specialist handoff must include upstream constraints and evidence status, not only functional requirements.',
      'Specialist outputs must return validation gates that Technology can synthesize before architecture diagram generation.',
    ],
    validation_needed: [
      'Confirm specialist handoff order and whether Storage should run before API for data-truth-heavy scenarios.',
      'Confirm final Technology synthesis criteria after API, Storage, AI, and UI agents complete.',
    ],
  };
}

function draftProvisionalTechnologyDirection(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const text = textFromInput(input);
  const commerce = signals.commerce || /checkout|order|payment|inventory|catalog/.test(text);
  const supplyChain = signals.supplyChain || /wms|oms|erp|fulfilment|carrier|supplier/.test(text);
  const ai = signals.retailAi || /ai|rag|llm|chatbot|recommendation|vector/.test(text);
  return {
    tool: 'draftProvisionalTechnologyDirectionTool',
    api_technology: {
      recommendation: commerce || supplyChain
        ? 'Use API gateway plus domain service contracts, event backbone where needed, schema registry, DLQs, replay, and reconciliation for retail integrations.'
        : 'API technology remains provisional until service boundaries and integrations are confirmed.',
      evidence_status: 'assumption',
    },
    storage_technology: {
      recommendation: commerce
        ? 'Use strongly consistent OLTP stores for order/payment metadata/inventory authority, cache/search as read accelerators, object storage for documents/media, and evidence-backed backup/restore.'
        : 'Storage technology remains provisional until systems of record, consistency, retention, and recovery targets are confirmed.',
      evidence_status: 'assumption',
    },
    ai_technology: {
      recommendation: ai
        ? 'Use RAG-ready architecture with model routing, embeddings, vector DB, optional reranking, eval traces, fallback, and no checkout-critical hard dependency.'
        : 'AI technology is conditional until AI/RAG/chatbot/recommendation use cases are confirmed.',
      evidence_status: ai ? 'assumption' : 'conditional',
    },
    ui_technology: {
      recommendation: 'Use channel-specific UI architecture for storefront, admin/support, mobile/POS/associate workflows with performance budgets, accessibility, telemetry, feature flags, and rollback.',
      evidence_status: 'assumption',
    },
    controls: [
      'Provisional direction must not be shown as final specialist approval.',
      'Final technology recommendation requires API, Storage, AI, and UI specialist evidence.',
    ],
    risks: [
      risk('Provisional technology direction can be mistaken for final design before specialist reviews validate contracts, data truth, AI boundaries, and UI channel needs.', 'High', 'Medium', 'Label provisional direction clearly and block final diagram until specialist outputs arrive.'),
    ],
    validation_needed: [
      'Validate provisional API, Storage, AI, and UI directions with specialist agents before final architecture generation.',
    ],
  };
}

function assessTechnologyNfrCoverage() {
  return {
    tool: 'assessTechnologyNfrCoverageTool',
    nfr_controls: [
      'Latency and throughput budgets by API, storage, search, UI, and AI path.',
      'Availability and degradation behavior by checkout, order, payment, inventory, support, AI, and integration path.',
      'Consistency and reconciliation expectations for order, payment token, inventory, promotion, return, and loyalty domains.',
      'Security, privacy, residency, observability, and retention controls by technology layer.',
      'Deployment, feature flag, rollback, acceptance test, and operational ownership by specialist domain.',
      'Cost drivers and unit economics by API call, storage growth, search query, AI token/retrieval, UI telemetry, non-prod, and support/licensing.',
    ],
    controls: [
      'Every technology choice must trace to measurable NFRs and acceptance tests.',
      'Rejected alternatives must explain why cheaper or simpler options fail NFR, risk, ownership, or cost evidence.',
    ],
    validation_needed: [
      'Confirm NFR targets and acceptance tests for every technology domain before client-ready recommendation.',
    ],
  };
}

function retrieveTechnologyKnowledgeForInput(input = {}) {
  return retrieveTechnologyKnowledge({
    query: buildRetailText({
      query: input.query || '',
      context: input.context || {},
      state: input.state || {},
    }),
    retrievalPlan: input.retrievalPlan || input.retrieval_plan || [],
    signals: input.signals || {},
    limit: input.limit || 7,
  });
}

function validateTechnologyOutput(input = {}) {
  const output = input.output || {};
  const toolResults = asArray(input.toolResults);
  const text = [
    output.summary,
    output.findings,
    output.technology_recommendation,
    output.technology_domains,
    output.specialist_handoff_matrix,
    output.api_technology,
    output.storage_technology,
    output.ai_technology,
    output.ui_technology,
    output.technology_nfr_coverage,
    output.technology_evidence_status,
    output.technology_validation_gates,
    output.technology_qualification,
    output.technology_policy_citations,
    output.technology_evidence_pack,
    output.technology_signal_profile,
    output.risks,
    output.validation_needed,
    toolResults,
  ].flat(7).map(item => typeof item === 'string' ? item : JSON.stringify(item || '')).join('\n').toLowerCase();
  const blockers = [];
  const warnings = [];
  const improvements = [];
  const hasDecomposition = /api|storage|ai|ui|specialist|handoff/.test(text);
  const hasApi = /api gateway|service contract|integration|idempotency|replay|dlq|schema/.test(text);
  const hasStorage = /storage|oltp|cache|search|backup|restore|source of truth|data truth/.test(text);
  const hasAi = /ai|rag|llm|embedding|vector|rerank|model routing|fallback/.test(text);
  const hasUi = /ui|storefront|admin|mobile|pos|accessibility|performance|feature flag|rollback/.test(text);
  const hasUpstream = /security|compliance|governance|infrastructure|finops|residency|pci|pricing|handoff/.test(text);
  const hasNfr = /nfr|latency|availability|consistency|observability|cost|acceptance test|rollback/.test(text);
  const hasEvidencePack = /evidence_pack|policy_sources|approval_workflow|client_questions|specialist_evidence_needed|technology_decision_evidence_needed/.test(text);
  const hasQualification = /draft|not.*approval|human validation|requires.*validation|specialist/.test(text);
  const hasCitations = /citation|source_id|policy|baseline/.test(text);

  if (!hasDecomposition) blockers.push('Technology output does not decompose into API, Storage, AI, and UI specialist tracks.');
  if (!hasApi) blockers.push('Technology output does not include API/service-contract/integration direction.');
  if (!hasStorage) blockers.push('Technology output does not include storage/data-truth direction.');
  if (!hasAi) warnings.push('Technology output should include AI/RAG/model-routing direction, even if conditional.');
  if (!hasUi) blockers.push('Technology output does not include UI/channel direction.');
  if (!hasUpstream) blockers.push('Technology output does not consume upstream Security/Compliance/Governance/Infrastructure/FinOps constraints.');
  if (!hasNfr) blockers.push('Technology output does not map technology choices to NFRs and acceptance tests.');
  if (!hasEvidencePack) blockers.push('Technology output does not include customer-facing evidence pack with specialist evidence needs and approval workflow.');
  if (!hasQualification) blockers.push('Technology output does not qualify recommendation as draft-level until specialist owners validate evidence.');
  if (!hasCitations) warnings.push('Technology output should include citations or source evidence.');
  if (!toolResults.length) blockers.push('Technology tools did not produce handoff, decomposition, specialist matrix, provisional direction, NFR, retrieval, or validation evidence.');
  if (!output.model_review?.enabled) improvements.push('Run model judgement for customer-specific technology recommendations when an approved model is available.');

  return {
    tool: 'validateTechnologyOutputTool',
    verdict: blockers.length ? 'fail' : warnings.length ? 'warn' : 'pass',
    blockers,
    warnings,
    improvements,
    required_controls: {
      decomposition: hasDecomposition,
      api: hasApi,
      storage: hasStorage,
      ai: hasAi,
      ui: hasUi,
      upstream_handoff: hasUpstream,
      nfr_coverage: hasNfr,
      evidence_pack: hasEvidencePack,
      qualification: hasQualification,
      citations_or_sources: hasCitations,
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

const technologyTools = {
  inspectTechnologyHandoffTool: tool(inspectTechnologyHandoff, {
    name: 'inspectTechnologyHandoffTool',
    description: 'Inspect upstream Security, Compliance, Governance, Infrastructure, and FinOps constraints before Technology recommendations.',
    schema: toolInputSchema,
  }),
  decomposeTechnologyDomainsTool: tool(decomposeTechnologyDomains, {
    name: 'decomposeTechnologyDomainsTool',
    description: 'Decompose technology into API, Storage, AI, and UI specialist domains.',
    schema: toolInputSchema,
  }),
  planSpecialistHandoffTool: tool(planSpecialistHandoff, {
    name: 'planSpecialistHandoffTool',
    description: 'Plan handoff inputs and expected outputs for API, Storage, AI, and UI specialist agents.',
    schema: toolInputSchema,
  }),
  draftProvisionalTechnologyDirectionTool: tool(draftProvisionalTechnologyDirection, {
    name: 'draftProvisionalTechnologyDirectionTool',
    description: 'Draft provisional API, Storage, AI, and UI technology direction before specialist approval.',
    schema: toolInputSchema,
  }),
  assessTechnologyNfrCoverageTool: tool(assessTechnologyNfrCoverage, {
    name: 'assessTechnologyNfrCoverageTool',
    description: 'Assess cross-cutting NFR and acceptance-test coverage for technology choices.',
    schema: toolInputSchema,
  }),
  retrieveTechnologyKnowledgeTool: tool(retrieveTechnologyKnowledgeForInput, {
    name: 'retrieveTechnologyKnowledgeTool',
    description: 'Retrieve local ArchitectIQ Technology knowledge and customer policy packs.',
    schema: toolInputSchema,
  }),
  validateTechnologyOutputTool: tool(validateTechnologyOutput, {
    name: 'validateTechnologyOutputTool',
    description: 'Validate Technology output against decomposition, API, Storage, AI, UI, upstream handoff, NFR, and evidence controls.',
    schema: toolInputSchema,
  }),
};

module.exports = {
  assessTechnologyNfrCoverage,
  decomposeTechnologyDomains,
  draftProvisionalTechnologyDirection,
  inspectTechnologyHandoff,
  planSpecialistHandoff,
  retrieveTechnologyKnowledgeForInput,
  technologyTools,
  validateTechnologyOutput,
};
