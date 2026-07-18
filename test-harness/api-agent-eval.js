#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { runApiAgentGraph } = require('../agents/api/apiAgentGraph');
const { API_EVAL_CASES, scoreApiOutput } = require('../agents/api/apiEvalCases');

const OUT_DIR = path.join(__dirname, 'results');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function runCase(testCase) {
  const output = await runApiAgentGraph({
    query: testCase.query,
    mode: 'api-eval',
    useModel: false,
    context: {},
    state: testCase.state || {},
    retrievedContext: [],
  });
  return {
    ...scoreApiOutput(output, testCase),
    status: output.status,
    nodes: output.graph_agent?.nodes || [],
    tools: output.graph_agent?.tools || [],
  };
}

(async () => {
  const results = [];
  for (const testCase of API_EVAL_CASES) {
    const result = await runCase(testCase);
    results.push(result);
    const label = result.score >= 90 && result.graph_validation === 'pass' ? 'PASS' : 'FAIL';
    console.log(`${label} ${result.name}: ${result.passed}/${result.total} (${result.score}%), graph=${result.graph_validation}`);
    result.checks.filter(check => !check.pass).forEach(check => console.log(`  missing: ${check.label}`));
  }

  const failures = results.filter(result => result.score < 90 || result.graph_validation !== 'pass');
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outPath = path.join(OUT_DIR, `api-agent-eval-${ts}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ ran: new Date().toISOString(), results }, null, 2));
  console.log(`Results saved: ${outPath}`);

  if (failures.length) {
    console.error(`API eval failed: ${failures.length}/${results.length} case(s) below threshold.`);
    process.exit(1);
  }
})();
