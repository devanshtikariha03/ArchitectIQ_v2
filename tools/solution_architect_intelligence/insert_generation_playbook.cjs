const fs = require('fs');
const path = require('path');

const toolRoot = __dirname;
const projectRoot = path.resolve(toolRoot, '..', '..');
const legacyPath = path.join(projectRoot, 'landing', 'src', 'app', 'utils', 'legacy.js');

let text = fs.readFileSync(legacyPath, 'utf8');
if (!text.includes('const playbookBlock=buildArchitectThinkingPlaybookBlock(S);')) {
  const next = text.replace(/(  const contraBlock=contradictions\.length\?`[\s\S]*?`:'';\r?\n)(\r?\n  const userPrompt=`Generate)/, '$1  const playbookBlock=buildArchitectThinkingPlaybookBlock(S);\n$2');
  if (next === text) throw new Error('could not insert playbookBlock in generation');
  text = next;
}
fs.writeFileSync(legacyPath, text, 'utf8');
console.log('generation playbook variable inserted');
