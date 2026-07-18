#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { runSecurityAgentGraph } = require('../agents/security/securityAgentGraph');
const { SECURITY_EVAL_CASES, scoreSecurityOutput } = require('../agents/security/securityEvalCases');

const OUT_DIR = path.join(__dirname, 'results');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function runCase(testCase) {
  const output = await runSecurityAgentGraph({
    query: testCase.query,
    mode: 'security-eval',
    useModel: false,
    context: {},
    state: {},
    retrievedContext: [],
  });
  return {
    ...scoreSecurityOutput(output, testCase),
    status: output.status,
    nodes: output.graph_agent?.nodes || [],
    tools: output.graph_agent?.tools || [],
  };
}

(async () => {
  const results = [];
  for (const testCase of SECURITY_EVAL_CASES) {
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
  const outPath = path.join(OUT_DIR, `security-agent-eval-${ts}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ ran: new Date().toISOString(), results }, null, 2));
  console.log(`Results saved: ${outPath}`);

  if (failures.length) {
    console.error(`Security eval failed: ${failures.length}/${results.length} case(s) below threshold.`);
    process.exit(1);
  }
})();
