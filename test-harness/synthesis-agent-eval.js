#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { runArchitectAgents } = require('../agents/masterAgent');

const OUT_DIR = path.join(__dirname, 'results');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function flatten(value) {
  return [value].flat(8).map(item => {
    if (typeof item === 'string') return item;
    try {
      return JSON.stringify(item || '');
    } catch {
      return String(item || '');
    }
  }).join('\n');
}

function checkResult(result) {
  const rec = result.architecture_recommendation;
  const checks = [
    ['has synthesis recommendation', Boolean(rec)],
    ['executive_summary', typeof rec?.executive_summary === 'string' && rec.executive_summary.length > 80],
    ['architecture_confidence', ['High', 'Medium', 'Low'].includes(rec?.architecture_confidence)],
    ['confidence_reason', typeof rec?.confidence_reason === 'string' && rec.confidence_reason.length > 40],
    ['assumptions array', Array.isArray(rec?.assumptions)],
    ['human_validation_needed array', Array.isArray(rec?.human_validation_needed) && rec.human_validation_needed.length >= 3],
    ['evidence_status', Boolean(rec?.evidence_status?.pricing && rec.evidence_status?.compliance)],
    ['workload_pricing_assumptions', Boolean(rec?.workload_pricing_assumptions?.requests_per_day && rec.workload_pricing_assumptions?.model_routing_split)],
    ['residency_matrix', Array.isArray(rec?.residency_matrix) && rec.residency_matrix.length >= 3],
    ['exactly three tiers', Array.isArray(rec?.tiers) && rec.tiers.length === 3],
    ['tier ids', ['conservative', 'recommended', 'optimised'].every(id => rec?.tiers?.some(tier => tier.id === id))],
    ['recommended tier stack', (rec?.tiers?.find(t => t.id === 'recommended')?.stack || []).length >= 7],
    ['architecture-beta diagram', rec?.tiers?.every(tier => String(tier.architecture_diagram || '').trim().startsWith('architecture-beta'))],
    ['cost breakdown shape', rec?.tiers?.every(tier => tier.cost_breakdown?.llm_api && tier.cost_breakdown?.compute && tier.cost_breakdown?.storage && tier.cost_breakdown?.networking && tier.cost_breakdown?.tooling && tier.cost_breakdown?.observability_tooling && tier.cost_breakdown?.security && tier.cost_breakdown?.licensing_or_partner && tier.cost_breakdown?.contingency)],
    ['nfr_coverage', Array.isArray(rec?.nfr_coverage) && rec.nfr_coverage.length >= 5],
    ['risks', Array.isArray(rec?.risks) && rec.risks.length >= 3],
    ['decisions', Array.isArray(rec?.decisions) && rec.decisions.length >= 3],
    ['roadmap', Array.isArray(rec?.roadmap) && rec.roadmap.length >= 3 && rec.roadmap.every(item => Array.isArray(item.dependencies))],
    ['next_steps', Array.isArray(rec?.next_steps) && rec.next_steps.length >= 4],
    ['disclaimer', typeof rec?.disclaimer === 'string' && rec.disclaimer.length > 80],
    ['agent pipeline includes ui', result.agents_used?.includes('ui')],
    ['agent pipeline includes finops', result.agents_used?.includes('finops')],
  ];
  const text = flatten(rec);
  checks.push(
    ['customer architecture wording', /architecture recommendation|recommended|conservative|optimised|monthly|roadmap|risk/i.test(text)],
    ['specialist intelligence consumed', /security|compliance|governance|infrastructure|technology|storage|api|ai|ui|finops/i.test(text)]
  );
  return checks.map(([label, pass]) => ({ label, pass: Boolean(pass) }));
}

(async () => {
  const result = await runArchitectAgents({
    mode: 'retail-agent-review',
    useModel: false,
    state: {
      basics: {
        company: 'Myntra',
        industry: 'Fashion & Lifestyle E-commerce',
        domain: 'Digital Commerce & Retail AI',
        problem: 'Build a flash-sale resilient commerce platform with React storefront, native apps, checkout, payments, inventory locking, order state, AI recommendations, RAG support chatbot, admin support UI, and fulfilment integrations.',
        stack: 'React web storefront, native iOS Android apps, CDN WAF, API gateway, Kubernetes, PostgreSQL, Redis, OpenSearch, Kafka, Qdrant, GPT 5.5, external PSP, CRM, OpenTelemetry.',
        constraints: 'Checkout and payment must stay available during AI, search, recommendation, chatbot, or logistics degradation. Raw card data must stay with PSP. PII and support transcripts require DPDP/GDPR-aware privacy controls.',
      },
      scale: {
        usersNow: 'Large national commerce workload',
        users12m: 'Growth across web, mobile, marketplace, beauty, fashion, and home',
        peak: '10x flash-sale peak validation assumption',
        latency: 'Checkout p95 below 500ms where payment provider permits',
        sla: '99.99%',
        traffic: 'Bursty',
        rw: 'Read-heavy with write-critical checkout',
        data: 'Orders, customer, support, catalog, inventory, clickstream, AI vectors, and audit data',
      },
      cost: {
        compute: 'Quality First',
        llm: 'Balanced',
        storage: 'Balanced',
        networking: 'Quality First',
        monitoring: 'Quality First',
        security: 'Quality First',
        cicd: 'Balanced',
        backup: 'Quality First',
        monthly: '$350,000/month',
        setup: '$2,000,000 programme budget',
      },
      nfr: {
        security: 'Zero trust, mTLS, WAF, KMS, tokenization, redaction, secrets, and privileged admin controls.',
        compliance: 'DPDP, PCI-DSS minimization, GDPR/CCPA where applicable, retention, deletion, and support access.',
        reliability: 'Checkout/order/payment/inventory must survive non-critical degradation.',
        dr: 'Domain-level RTO/RPO required.',
        consistency: 'Strong consistency for checkout, payment, order, inventory lock, and promotion ledger.',
      },
      team: {
        size: 'Enterprise cross-functional team',
        seniority: 'Senior',
        timeline: '16-20 week MVP, 12-18 month modernization',
        buildBuy: 'Balanced',
        deploy: 'Cloud-first',
      },
    },
  });

  const checks = checkResult(result);
  const passed = checks.filter(check => check.pass).length;
  const total = checks.length;
  const score = Math.round((passed / total) * 100);
  const label = score >= 95 ? 'PASS' : 'FAIL';
  console.log(`${label} Architecture synthesis legacy shape: ${passed}/${total} (${score}%)`);
  checks.filter(check => !check.pass).forEach(check => console.log(`  missing: ${check.label}`));

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(OUT_DIR, `synthesis-agent-eval-${ts}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ ran: new Date().toISOString(), checks, result }, null, 2));
  console.log(`Results saved: ${outPath}`);

  if (score < 95) process.exit(1);
})();
