#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { runInfrastructureAgentGraph } = require('../agents/infrastructure/infrastructureAgentGraph');
const { INFRASTRUCTURE_EVAL_CASES, scoreInfrastructureOutput } = require('../agents/infrastructure/infrastructureEvalCases');

const OUT_DIR = path.join(__dirname, 'results');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function runCase(testCase) {
  const output = await runInfrastructureAgentGraph({
    query: testCase.query,
    mode: 'infrastructure-eval',
    useModel: false,
    context: {},
    state: testCase.state || {},
    retrievedContext: [],
  });
  return {
    ...scoreInfrastructureOutput(output, testCase),
    status: output.status,
    nodes: output.graph_agent?.nodes || [],
    tools: output.graph_agent?.tools || [],
  };
}

(async () => {
  const results = [];
  for (const testCase of INFRASTRUCTURE_EVAL_CASES) {
    const result = await runCase(testCase);
    results.push(result);
    const label = result.score >= 90 && result.graph_validation === 'pass' ? 'PASS' : 'FAIL';
    console.log(`${label} ${result.name}: ${result.passed}/${result.total} (${result.score}%), graph=${result.graph_validation}`);
    result.checks.filter(check => !check.pass).forEach(check => console.log(`  missing: ${check.label}`));
  }

  const failures = results.filter(result => result.score < 90 || result.graph_validation !== 'pass');
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(OUT_DIR, `infrastructure-agent-eval-${ts}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ ran: new Date().toISOString(), results }, null, 2));
  console.log(`Results saved: ${outPath}`);

  if (failures.length) {
    console.error(`Infrastructure eval failed: ${failures.length}/${results.length} case(s) below threshold.`);
    process.exit(1);
  }
})();
