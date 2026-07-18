#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { runComplianceAgentGraph } = require('../agents/compliance/complianceAgentGraph');
const { COMPLIANCE_EVAL_CASES, scoreComplianceOutput } = require('../agents/compliance/complianceEvalCases');

const OUT_DIR = path.join(__dirname, 'results');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function runCase(testCase) {
  const output = await runComplianceAgentGraph({
    query: testCase.query,
    mode: 'compliance-eval',
    useModel: false,
    context: {},
    state: testCase.state || {},
    retrievedContext: [],
  });
  return {
    ...scoreComplianceOutput(output, testCase),
    status: output.status,
    nodes: output.graph_agent?.nodes || [],
    tools: output.graph_agent?.tools || [],
  };
}

(async () => {
  const results = [];
  for (const testCase of COMPLIANCE_EVAL_CASES) {
    const result = await runCase(testCase);
    results.push(result);
    const label = result.score >= 90 && result.graph_validation === 'pass' ? 'PASS' : 'FAIL';
    console.log(`${label} ${result.name}: ${result.passed}/${result.total} (${result.score}%), graph=${result.graph_validation}`);
    result.checks
      .filter(check => !check.pass)
      .forEach(check => console.log(`  missing: ${check.label}`));
  }

  const failures = results.filter(result => result.score < 90 || result.graph_validation !== 'pass');
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(OUT_DIR, `compliance-agent-eval-${ts}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ ran: new Date().toISOString(), results }, null, 2));
  console.log(`Results saved: ${outPath}`);

  if (failures.length) {
    console.error(`Compliance eval failed: ${failures.length}/${results.length} case(s) below threshold.`);
    process.exit(1);
  }
})();
