const fs = require('fs');
const path = require('path');

const toolRoot = __dirname;
const projectRoot = path.resolve(toolRoot, '..', '..');
const legacyPath = path.join(projectRoot, 'landing', 'src', 'app', 'utils', 'legacy.js');
const promptPath = path.join(toolRoot, 'out-anthropic', 'architectiq_system_prompt_merged.md');

let legacy = fs.readFileSync(legacyPath, 'utf8');
const prompt = fs.readFileSync(promptPath, 'utf8').trim();
const start = legacy.indexOf('export const SYSTEM_PROMPT=');
if (start < 0) throw new Error('SYSTEM_PROMPT start not found');
const nextMarker = legacy.indexOf('\n\nexport function escapeHtml', start);
if (nextMarker < 0) throw new Error('escapeHtml marker not found after SYSTEM_PROMPT');
const replacement = 'export const SYSTEM_PROMPT=' + JSON.stringify(prompt) + ';';
legacy = legacy.slice(0, start) + replacement + legacy.slice(nextMarker);
fs.writeFileSync(legacyPath, legacy, 'utf8');
console.log(`merged prompt installed from ${promptPath}`);
