const fs = require('fs');
const path = require('path');

const toolRoot = __dirname;
const projectRoot = path.resolve(toolRoot, '..', '..');
const legacyPath = path.join(projectRoot, 'landing', 'src', 'app', 'utils', 'legacy.js');

let text = fs.readFileSync(legacyPath, 'utf8');

const replacements = [
  {
    from: "keywords:['mining','mine','rio','tinto','industrial','plant','remote site','ot','scada','plc','sensor','edge','satellite','mpls','wan','historian']",
    to: "keywords:['mining','mine','rio tinto','industrial site','plant floor','remote site','remote mine','operational technology','ot/it','scada','plc','historian','process control','satellite','mpls','wan outage','edge compute']"
  },
  {
    from: "const hits=keywords.filter(k=>k!=='all'&&haystack.includes(k.toLowerCase())).length;",
    to: "const hits=keywords.filter(k=>k!=='all'&&keywordMatchesArchitectPlaybook(haystack,k)).length;"
  }
];

for (const { from, to } of replacements) {
  text = text.split(from).join(to);
}

if (!text.includes('function keywordMatchesArchitectPlaybook')) {
  const marker = 'function selectArchitectThinkingRules(state,limit=8){';
  const helper = [
    "function keywordMatchesArchitectPlaybook(haystack,keyword){",
    "  const normalized=String(keyword||'').toLowerCase().trim();",
    "  if(!normalized) return false;",
    "  const escaped=normalized.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&');",
    "  if(normalized.length<=4 || /^[a-z0-9]+$/.test(normalized)){",
    "    return new RegExp('(^|[^a-z0-9])'+escaped+'([^a-z0-9]|$)').test(haystack);",
    "  }",
    "  return haystack.includes(normalized);",
    "}",
    ""
  ].join('\\n');
  const idx = text.indexOf(marker);
  if (idx < 0) throw new Error('selectArchitectThinkingRules marker not found');
  text = text.slice(0, idx) + helper + text.slice(idx);
}

fs.writeFileSync(legacyPath, text, 'utf8');
console.log('playbook matching rules tightened');

