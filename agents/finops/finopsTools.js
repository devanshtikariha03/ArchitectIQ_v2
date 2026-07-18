const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const { buildRetailText, getRetailSignals } = require('../retailContext');
const { buildCloudPricingContext, formatPricingSummaryForPrompt } = require('./cloudPricing');
const { retrieveFinOpsKnowledge } = require('./finopsKnowledgeBase');

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

function inspectCostConstraints(input = {}) {
  const state = input.state || {};
  const evidenceStatus = state.evidence_status || {};
  const upstream = {
    security: Boolean(state.agent_outputs?.security || state.security_tool_context),
    compliance: Boolean(state.agent_outputs?.compliance || state.compliance_tool_context),
    governance: Boolean(state.agent_outputs?.governance || state.governance_tool_context),
    infrastructure: Boolean(state.agent_outputs?.infrastructure || state.infrastructure_tool_context),
    technology: Boolean(state.agent_outputs?.technology || state.technology_tool_context),
    storage: Boolean(state.agent_outputs?.storage || state.storage_tool_context),
    api: Boolean(state.agent_outputs?.api || state.api_tool_context),
    ai: Boolean(state.agent_outputs?.ai || state.ai_tool_context),
    ui: Boolean(state.agent_outputs?.ui || state.ui_tool_context),
    evidence_status: evidenceStatus,
    validation_gaps: asArray(state.validation_gaps),
  };
  const controls = [
    'Price security/compliance requirements as mandatory cost drivers, not optional optimisation items.',
    'Keep pricing assumption-level until service-level SKUs, region, support plan, commitment, and usage evidence are supplied.',
    'Separate steady-state, peak/campaign, degraded-mode, non-prod, support, licensing, partner, and contingency costs.',
  ];
  if (upstream.security) controls.push('Include KMS/HSM, secrets, WAF/bot, mTLS/service mesh, SIEM/log export, DLP/redaction, and security operations costs from Security Agent output.');
  if (upstream.compliance) controls.push('Include residency, processor evidence, retention/deletion, audit export, backup/log retention, legal/privacy validation, and support-access costs from Compliance Agent output.');
  if (upstream.governance) controls.push('Include runbooks, game days, acceptance tests, rollout waves, ADR/review effort, and operating model costs from Governance Agent output.');
  if (upstream.infrastructure) controls.push('Include runtime, network, HA/DR, observability, environment, release, non-prod parity, support, capacity headroom, and store-edge infrastructure costs from Infrastructure Agent output.');
  if (upstream.technology) controls.push('Include API, Storage, AI, UI, integration, data-flow, specialist validation, technology ADR, acceptance-test, telemetry, and support costs from Technology Agent output.');
  if (upstream.storage) controls.push('Include OLTP tier, storage growth, IOPS/throughput, cache memory, search index/query volume, object storage lifecycle, backup retention, replication, egress, restore testing, and non-prod parity costs from Storage Agent output.');
  if (upstream.api) controls.push('Include API gateway requests, WAF/bot traffic, route classes, event/queue throughput, partner calls, retries/replay volume, contract testing, observability logs/traces, support, and integration operations costs from API Agent output.');
  if (upstream.ai) controls.push('Include GPT/frontier model calls, local/private model hosting, input/output tokens, prompt cache, embeddings, vector DB reads/storage, reranking, eval traces, AI observability, fallback, and support costs from AI Agent output.');
  if (upstream.ui) controls.push('Include CDN traffic, image transformation/storage, RUM/session replay events, frontend observability retention, experimentation/feature-flag tooling, accessibility/device testing, third-party scripts, support/admin seats, synthetic monitoring, and non-prod parity costs from UI Agent output.');

  return {
    tool: 'inspectCostConstraintsTool',
    upstream,
    controls,
    validation_needed: [
      'Confirm whether security/compliance/governance controls are mandatory or negotiable for budget tradeoffs.',
      'Confirm support tier, licensing, partner implementation, audit evidence, non-prod parity, and contingency requirements.',
    ],
  };
}

function estimateUnitDrivers(input = {}) {
  const text = textFromInput(input);
  const signals = input.signals || getRetailSignals(input);
  const hasBudget = /\$\s?\d|budget|monthly|per month|opex|capex|cost|enterprise budget/i.test(text);
  const drivers = [
    ['peak_multiplier', 'assumption required for campaign/flash-sale/store peak periods'],
    ['sessions_or_requests_per_day', 'assumption required from web/mobile/API telemetry'],
    ['checkout_attempts_per_day', signals.commerce ? 'assumption required for checkout/payment/order commit sizing' : 'not applicable unless commerce is in scope'],
    ['event_throughput', 'assumption required for queues, event backbone, replay, and DLQ cost'],
    ['data_growth_gb_per_month', 'assumption required for OLTP/search/object/log/backup growth'],
    ['log_trace_gb_per_day', 'assumption required for observability, SIEM export, retention, and audit evidence'],
    ['support_seats_and_saas_admins', 'assumption required for CRM/helpdesk/observability/admin/support access cost'],
  ];
  if (signals.retailAi) {
    drivers.push(
      ['ai_requests_per_day', 'assumption required for chatbot/RAG/recommendation/agent requests'],
      ['turns_per_request', 'assumption required'],
      ['input_tokens_per_turn', 'assumption required'],
      ['output_tokens_per_turn', 'assumption required'],
      ['cache_hit_rate', 'assumption required'],
      ['model_routing_split', 'assumption required; reserve GPT-5.5-class usage for final judgement/fallback'],
      ['embedding_ingestion_and_query_volume', 'assumption required for vector DB and embedding costs'],
      ['reranker_calls', 'assumption required if reranking is used']
    );
  }

  return {
    tool: 'estimateUnitDriversTool',
    has_budget_signal: hasBudget,
    workload_pricing_assumptions: Object.fromEntries(drivers),
    validation_needed: [
      'Collect measured baseline and peak telemetry before approving budget feasibility.',
      'Confirm hard monthly budget, setup budget, currency, committed spend, support plan, and procurement constraints.',
    ],
  };
}

function buildCostModel(input = {}) {
  const signals = input.signals || getRetailSignals(input);
  const costDrivers = [
    'Compute/runtime by steady-state, peak, degraded mode, non-prod, and DR posture',
    'Storage, backup, search index, object storage, logs/traces, audit evidence retention, and restore testing',
    'Network egress, CDN/edge traffic, WAF/bot protection, private connectivity, and cross-region replication',
    'Frontend/UI delivery costs: CDN traffic, image processing, RUM/session replay, feature flags, experimentation, synthetic monitoring, browser/device testing, and accessibility validation',
    'Security/compliance tooling: KMS/HSM, secrets, SIEM export, DLP/redaction, support access, audit evidence, and legal/privacy review',
    'Licensing, SaaS seats, partner implementation, enterprise support plan, non-prod parity, and contingency',
  ];
  if (signals.retailAi) costDrivers.unshift('LLM/API tokens, model routing split, prompt cache hit rate, embeddings, vector DB storage/read units, reranking, eval traces, and provider telemetry retention');
  if (signals.commerce) costDrivers.unshift('CDN/WAF/bot, search/catalog read model, checkout/payment isolation, inventory lock path, promotion engine, and flash-sale headroom');
  if (signals.supplyChain) costDrivers.push('OMS/WMS/TMS adapters, supplier/carrier API calls, exception queues, fulfilment dashboards, and manual override operations');

  return {
    tool: 'buildCostModelTool',
    cost_drivers: costDrivers,
    tiering_rules: [
      'Conservative: preserves controls and resiliency with higher headroom; must disclose assumption-level pricing.',
      'Recommended: balances headroom, managed services, operational maturity, and cost evidence.',
      'Optimised: can reduce spend only through explicit levers that preserve required security/compliance/NFR capability.',
    ],
    risks: [
      risk('Budget can appear feasible if security, compliance, observability, support, non-prod, and partner costs are omitted.', 'High', 'Medium', 'Require service-level cost model with mandatory controls and contingency.'),
      risk('AI/RAG costs can dominate if GPT-5.5-class models, traces, embeddings, vector reads, and reranking are used for every specialist step.', 'High', 'Medium', 'Use model routing, caching, narrow retrieval, token caps, and local/private specialist models where approved.'),
    ],
    validation_needed: [
      'Validate service-level pricing and non-prod parity for every recommended technology layer.',
      'Validate cost levers against required security, compliance, residency, operability, and performance controls.',
    ],
  };
}

async function fetchLiveCloudPricing(input = {}) {
  const pricing = await buildCloudPricingContext(input);
  const validationNeeded = [
    'Validate live provider price points against exact service SKUs, instance sizes, regions, discounts, support plan, commitment terms, non-prod parity, and workload usage.',
  ];
  if (pricing.gcp?.authRequired) {
    validationNeeded.push('Configure GOOGLE_CLOUD_API_KEY/GCP_API_KEY for GCP public list pricing, GOOGLE_CLOUD_BILLING_TOKEN/GCP_BILLING_BEARER_TOKEN for authenticated Cloud Billing access, or OPENAI_API_KEY for the GCP public-pricing web-search fallback.');
  }
  if (pricing.gcp?.authMode === 'api_key') {
    validationNeeded.push('GCP price points are public list pricing; validate customer-specific contract discounts through Cloud Billing account evidence or procurement records.');
  }
  if (pricing.gcp?.authMode === 'openai_web_search') {
    validationNeeded.push('GCP price points came from GPT web search over public Google Cloud pricing evidence; validate official SKU pages, exact region/SKU, and customer contract discounts before approval.');
  }
  if (!pricing.usablePricePoints?.length) {
    validationNeeded.push('No usable AWS/Azure/GCP service-level price point was fetched; keep pricing evidence as assumption.');
  }
  return {
    ...pricing,
    formatted_summary: formatPricingSummaryForPrompt(pricing),
    validation_needed: validationNeeded,
  };
}

function retrieveFinOpsKnowledgeForInput(input = {}) {
  return retrieveFinOpsKnowledge({
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

function validateFinOpsOutput(input = {}) {
  const output = input.output || {};
  const toolResults = asArray(input.toolResults);
  const text = [
    output.summary,
    output.findings,
    output.cost_drivers,
    output.workload_pricing_assumptions,
    output.assumptions,
    output.validation_needed,
    output.finops_recommendation,
    output.finops_evidence_status,
    output.finops_validation_gates,
    output.finops_qualification,
    output.finops_policy_citations,
    output.finops_evidence_pack,
    output.finops_signal_profile,
    output.model_summary,
    output.model_findings,
    toolResults,
  ].flat(5).map(item => typeof item === 'string' ? item : JSON.stringify(item || '')).join('\n').toLowerCase();
  const blockers = [];
  const warnings = [];
  const improvements = [];
  const hasEvidence = /assumption|partial|verified|pricing evidence|service-level|sku/.test(text);
  const hasLiveProviderPath = /azure retail prices|aws public regional price list|aws price list|gcp cloud billing catalog|gpt web search over public google cloud pricing|openai-web-search-gcp-pricing|livecloudpricingtool|usablepricepoints/.test(text);
  const hasUnitDrivers = /requests|sessions|tokens|egress|storage|logs|trace|event|peak|multiplier|throughput/.test(text);
  const hasMandatoryControls = /security|compliance|support|licensing|partner|non-prod|contingency|observability/.test(text);
  const hasAiCost = /llm|token|embedding|vector|rerank|model routing|gpt/.test(text);
  const hasBudget = /budget|monthly|setup|currency|hard|committed spend/.test(text);
  const hasUpstream = /security|compliance|governance|residency|pci|processor|runbook|approval/.test(text);
  const hasCustomerEvidencePack = /evidence_pack|policy_sources|approval_workflow|client_questions|pricing_evidence_needed|unit_driver_evidence_needed|cost_control_evidence_needed|policy citations|policy_citations/.test(text);
  const hasQualification = /draft|not.*approval|budget owner|finops owner|not.*contract|not.*purchase order|human validation|requires.*validation/.test(text);
  const hasOptimizationGuardrail = /optimised|optimized|cheaper|right-sizing|commitment|cache|retention|preserve|required capability|cannot weaken|not weaken/.test(text);

  if (!hasEvidence) blockers.push('FinOps output does not mark pricing evidence as assumption/partial/verified.');
  if (!hasUnitDrivers) blockers.push('FinOps output does not name workload unit drivers.');
  if (!hasMandatoryControls) blockers.push('FinOps output does not include security/compliance/support/licensing/non-prod/contingency costs.');
  if (!hasBudget) warnings.push('FinOps output should request hard monthly/setup budget, currency, contracts, and support tier.');
  if (!hasUpstream) blockers.push('FinOps output does not consume upstream Security/Compliance/Governance constraints.');
  if (!hasAiCost) improvements.push('If AI/RAG remains in scope, include model-token, embedding, vector DB, reranking, eval, and telemetry costs.');
  if (!hasLiveProviderPath) improvements.push('Run AWS/Azure/GCP pricing lookup before customer-facing budget estimates when network/credentials are available.');
  if (!hasCustomerEvidencePack) blockers.push('FinOps output does not include a customer-facing evidence pack with policy sources, pricing evidence, unit-driver evidence, approval workflow, and client questions.');
  if (!hasQualification) blockers.push('FinOps output does not qualify the estimate as draft-level until budget owners validate evidence, contracts, and assumptions.');
  if (!hasOptimizationGuardrail) warnings.push('FinOps output should state that cheaper/optimised tiers cannot weaken mandatory security, compliance, resilience, or governance capability.');
  if (!toolResults.length) blockers.push('FinOps tools did not produce cost constraints, unit drivers, cost model, or validation evidence.');
  if (!output.model_review?.enabled) improvements.push('Run model judgement for customer-specific FinOps recommendations when an approved model is available.');

  return {
    tool: 'validateFinOpsOutputTool',
    verdict: blockers.length ? 'fail' : warnings.length ? 'warn' : 'pass',
    blockers,
    warnings,
    improvements,
    required_controls: {
      pricing_evidence: hasEvidence,
      unit_drivers: hasUnitDrivers,
      mandatory_controls_costed: hasMandatoryControls,
      budget_validation: hasBudget,
      upstream_constraints_used: hasUpstream,
      ai_cost_model: hasAiCost,
      provider_pricing_lookup: hasLiveProviderPath,
      customer_evidence_pack: hasCustomerEvidencePack,
      finops_qualification: hasQualification,
      optimization_guardrails: hasOptimizationGuardrail,
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

const finopsTools = {
  inspectCostConstraintsTool: tool(inspectCostConstraints, {
    name: 'inspectCostConstraintsTool',
    description: 'Inspect upstream Security, Compliance, and Governance cost constraints.',
    schema: toolInputSchema,
  }),
  estimateUnitDriversTool: tool(estimateUnitDrivers, {
    name: 'estimateUnitDriversTool',
    description: 'Estimate required retail workload unit drivers for FinOps modelling.',
    schema: toolInputSchema,
  }),
  buildCostModelTool: tool(buildCostModel, {
    name: 'buildCostModelTool',
    description: 'Build retail FinOps cost driver and tiering model.',
    schema: toolInputSchema,
  }),
  liveCloudPricingTool: tool(fetchLiveCloudPricing, {
    name: 'liveCloudPricingTool',
    description: 'Fetch AWS, Azure, and GCP pricing evidence using official provider pricing APIs/catalogs where available.',
    schema: toolInputSchema,
  }),
  retrieveFinOpsKnowledgeTool: tool(retrieveFinOpsKnowledgeForInput, {
    name: 'retrieveFinOpsKnowledgeTool',
    description: 'Retrieve local ArchitectIQ FinOps knowledge and customer FinOps policy packs.',
    schema: toolInputSchema,
  }),
  validateFinOpsOutputTool: tool(validateFinOpsOutput, {
    name: 'validateFinOpsOutputTool',
    description: 'Validate FinOps output against pricing evidence, unit drivers, mandatory controls, and upstream constraints.',
    schema: toolInputSchema,
  }),
};

module.exports = {
  buildCostModel,
  estimateUnitDrivers,
  fetchLiveCloudPricing,
  finopsTools,
  inspectCostConstraints,
  retrieveFinOpsKnowledgeForInput,
  validateFinOpsOutput,
};
