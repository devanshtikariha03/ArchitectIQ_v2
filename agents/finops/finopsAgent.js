const { getRetailSignals, retailEvidence } = require('../retailContext');
const { mergeModelReview, runSpecialistModel } = require('../llmClient');

function risk(riskText, severity, likelihood, fix) {
  return { risk: riskText, severity, likelihood, fix };
}

function hasBudget(text) {
  return /\$\s?\d|budget|monthly|per month|opex|capex|cost/i.test(text);
}

async function runFinOpsAgent({ query, context, state, retrievedContext, useModel }) {
  const signals = getRetailSignals({ query, context, state });
  const scenarioText = [query, JSON.stringify(context || {}), JSON.stringify(state || {})].join(' ');
  const hasAiCosts = signals.retailAi || /llm|model|embedding|vector|rerank|rag|chatbot|agent/i.test(scenarioText);
  const hasEdgeCosts = signals.storeEdge;
  const hasCommerceCosts = signals.commerce;
  const hasSupplyCosts = signals.supplyChain;
  const hasCustomerDataCosts = signals.customerData || signals.loyaltyData;

  const findings = [
    'Keep pricing evidence explicit: verified, partial, or assumption. Do not claim live pricing unless service-level SKU evidence exists.',
    'Break cost down by compute, LLM/API, storage, networking, observability/tooling, security, licensing/partner, support plan, non-prod parity, and contingency.',
    'Name unit drivers before estimating monthly cost: requests, transactions, users, stores, POS lanes, events/sec, data volume, egress, IOPS, queue throughput, log retention, traces, support seats, and partner implementation effort.',
    'Create Conservative, Recommended, and Optimised tiers; Optimised can only be cheaper through credible right-sizing, commitments, caching, retention, or operational simplification.',
    'Budget feasibility should be false or conditional when the upper bound exceeds a hard budget or when service-level evidence is missing.',
  ];

  if (hasAiCosts) {
    findings.push('For retail AI/agent/RAG costs, estimate requests/day, turns/request, input/output tokens, cache hit rate, model routing split, embedding ingestion/query volume, vector DB storage/read units, reranker calls, eval/trace retention, and peak multiplier.');
  }
  if (hasEdgeCosts) {
    findings.push('For store-edge costs, include edge hardware/appliance footprint, HA pairs, device management, field replacement, local storage, network resilience, UPS, remote diagnostics, and store rollout support.');
  }
  if (hasCommerceCosts) {
    findings.push('For digital commerce costs, include CDN/WAF, bot protection, checkout/payment throughput, search/catalog index, promotion engine, session/cart storage, inventory lock path, peak campaign headroom, and fraud SaaS.');
  }
  if (hasSupplyCosts) {
    findings.push('For supply-chain/fulfilment costs, include WMS/TMS/OMS adapters, supplier feed processing, exception queues, carrier API calls, forecast jobs, dashboards, and manual override operations.');
  }
  if (hasCustomerDataCosts) {
    findings.push('For customer/loyalty data costs, include CRM/CDP/marketing platform licensing, clean-room/activation costs, identity resolution, consent/deletion workflows, analytics warehouse, data retention, and support-access audit evidence.');
  }

  const costDrivers = [
    'Peak transaction/request volume and campaign multiplier',
    'Storage growth, backup retention, log/trace retention, and audit evidence retention',
    'Network egress, CDN/edge traffic, private connectivity, and cross-region replication',
    'Security/compliance tooling, SIEM export, key management, secrets, WAF/bot protection, and support access controls',
    'Licensing, SaaS seats, partner implementation, support plan, non-prod parity, and contingency',
  ];

  if (hasAiCosts) {
    costDrivers.unshift('LLM output tokens, model routing split, prompt cache hit rate, embedding ingestion/query volume, vector DB storage/read units, reranker calls, eval traces, and provider telemetry retention');
  }
  if (hasEdgeCosts) {
    costDrivers.unshift('Store-edge appliance count, HA design, field support, network resilience, and rollout wave footprint');
  }

  const assumptions = [
    hasBudget(scenarioText)
      ? 'Budget is treated as a hard constraint only after the client confirms monthly, setup, licensing, support, and partner-cost boundaries.'
      : 'Budget is not confirmed; any monthly estimate must remain assumption-level.',
    'Pricing is assumption-level until current provider SKU, region, support plan, storage, egress, HA/DR, licensing, and commitment choices are validated.',
    hasAiCosts
      ? 'AI cost is assumption-level until requests/day, turns/request, token sizes, cache hit rate, model routing split, embedding/re-ranking volume, and vector DB read/storage volume are measured.'
      : 'AI/LLM costs are not treated as material unless AI, chatbot, recommendation, RAG, or agentic functionality is explicitly in scope.',
  ];

  const risks = [
    risk(
      'The architecture may be technically sound but financially indefensible if cost ranges are not tied to retail workload drivers.',
      'High',
      'Medium',
      'FinOps owner to validate unit drivers, service-level SKUs, support plan, non-prod parity, partner costs, and contingency before budget approval.'
    ),
    risk(
      'Optimised tiers can silently remove required capability if savings are not tied to explicit engineering controls.',
      'Medium',
      'Medium',
      'Require each optimisation to name the capability preserved, the cost lever used, and the accepted risk.'
    ),
  ];

  if (hasAiCosts) {
    risks.push(risk(
      'LLM output tokens, traces, embeddings, and vector reads can dominate the bill if GPT-5.5 or equivalent strong models are used for every specialist step.',
      'High',
      'Medium',
      'Route cheap specialist steps to cheaper models where possible, cache stable prompts, cap context, retrieve narrowly, and reserve GPT-5.5-class models for final judgement.'
    ));
  }

  const validationNeeded = [
    'Confirm monthly budget, setup budget, currency, cloud/SaaS contracts, committed spend, support plan, and whether budget is hard or indicative.',
    'Validate service-level pricing for compute, storage, network, observability, security, LLM/API, embeddings, vector DB, reranking, licensing, partners, support, and contingency.',
    'Confirm workload drivers: stores, POS lanes, sessions, checkout attempts, events/sec, data growth, retention, egress, queue throughput, log volume, and peak multiplier.',
  ];

  const workloadPricingAssumptions = {
    requests_per_day: hasAiCosts ? 'assumption required for agent/chatbot/RAG requests' : 'not applicable unless AI is in scope',
    turns_per_request: hasAiCosts ? 'assumption required' : 'not applicable unless AI is in scope',
    input_tokens_per_turn: hasAiCosts ? 'assumption required' : 'not applicable unless AI is in scope',
    output_tokens_per_turn: hasAiCosts ? 'assumption required' : 'not applicable unless AI is in scope',
    cache_hit_rate: hasAiCosts ? 'assumption required' : 'not applicable unless AI is in scope',
    model_routing_split: hasAiCosts ? 'assumption required; avoid using GPT-5.5-class models for every specialist step without cost approval' : 'not applicable unless AI is in scope',
    peak_multiplier: 'assumption required for retail campaign/store peak periods',
  };

  const base = {
    agentId: 'finops',
    title: 'FinOps AI Agent',
    status: 'completed',
    summary: 'Retail FinOps review aligned to the ArchitectIQ prompt: pricing evidence, unit drivers, budget feasibility, AI/token cost assumptions, and service-level validation gaps.',
    retail_workload: signals.workloadTypes,
    findings,
    cost_drivers: costDrivers,
    workload_pricing_assumptions: workloadPricingAssumptions,
    assumptions,
    risks,
    validation_needed: validationNeeded,
    retrieval_requests: [
      'retail-finops-unit-driver-playbook',
      'llm-rag-agent-cost-model-template',
      'retail-service-level-pricing-evidence-checklist',
      'cloud-support-licensing-partner-contingency-checklist',
    ],
    evidence: retailEvidence(retrievedContext),
    statePatch: {
      retail_workload: signals.workloadTypes,
      finops_controls: findings,
      cost_drivers: costDrivers,
      workload_pricing_assumptions: workloadPricingAssumptions,
      assumptions,
      risks,
      human_validation_needed: validationNeeded,
      evidence_status: {
        pricing: 'assumption',
      },
      validation_gaps: [
        'FinOps Agent needs service-level pricing evidence, workload drivers, support/licensing/partner costs, non-prod parity, and contingency before budget feasibility can be approved.',
      ],
      retrieval_requests: [
        'retail-finops-unit-driver-playbook',
        'llm-rag-agent-cost-model-template',
        'retail-service-level-pricing-evidence-checklist',
        'cloud-support-licensing-partner-contingency-checklist',
      ],
    },
  };

  if (!useModel) return base;

  try {
    const modelReview = await runSpecialistModel({
      agentId: 'finops',
      title: 'FinOps AI Agent',
      system: `You are the ArchitectIQ Retail FinOps AI Agent. Review cost and budget only. Apply the legacy ArchitectIQ rules: pricing evidence must be verified/partial/assumption; produce unit drivers; separate compute, LLM/API, embeddings, vector DB, reranking, storage, networking, observability/tooling, security, licensing/partner, support plan, non-prod parity, and contingency; for retail AI include requests/day, turns/request, input/output tokens, cache hit rate, model routing split, GPT-5.5-class usage, embedding ingestion/query volume, vector DB storage/read units, reranker calls, eval traces, provider telemetry, and peak multiplier; flag budget feasibility gaps and optimisation risks. Return concise JSON only.`,
      input: JSON.stringify({
        query,
        context,
        current_state: state,
        deterministic_finops_review: base,
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
        `FinOps model review failed and deterministic FinOps rules were used instead: ${err.message}`,
      ],
    };
  }
}

module.exports = { runFinOpsAgent };
