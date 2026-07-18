const { runApiAgentGraph } = require('./api/apiAgentGraph');
const { runAiAgentGraph } = require('./ai/aiAgentGraph');
const { runComplianceAgentGraph } = require('./compliance/complianceAgentGraph');
const { runFinOpsAgentGraph } = require('./finops/finopsAgentGraph');
const { runGovernanceAgentGraph } = require('./governance/governanceAgentGraph');
const { runInfrastructureAgentGraph } = require('./infrastructure/infrastructureAgentGraph');
const { runSecurityAgentGraph } = require('./security/securityAgentGraph');
const { runStorageAgentGraph } = require('./storage/storageAgentGraph');
const { runTechnologyAgentGraph } = require('./technology/technologyAgentGraph');
const { runUiAgentGraph } = require('./ui/uiAgentGraph');

const AGENT_REGISTRY = {
  security: {
    id: 'security',
    label: 'Security AI Agent',
    run: runSecurityAgentGraph,
  },
  compliance: {
    id: 'compliance',
    label: 'Compliance AI Agent',
    run: runComplianceAgentGraph,
  },
  governance: {
    id: 'governance',
    label: 'Governance AI Agent',
    run: runGovernanceAgentGraph,
  },
  infrastructure: {
    id: 'infrastructure',
    label: 'Infrastructure AI Agent',
    run: runInfrastructureAgentGraph,
  },
  technology: {
    id: 'technology',
    label: 'Technology AI Agent',
    run: runTechnologyAgentGraph,
  },
  storage: {
    id: 'storage',
    label: 'Storage AI Agent',
    run: runStorageAgentGraph,
  },
  api: {
    id: 'api',
    label: 'API AI Agent',
    run: runApiAgentGraph,
  },
  ai: {
    id: 'ai',
    label: 'AI AI Agent',
    run: runAiAgentGraph,
  },
  ui: {
    id: 'ui',
    label: 'UI AI Agent',
    run: runUiAgentGraph,
  },
  finops: {
    id: 'finops',
    label: 'FinOps AI Agent',
    run: runFinOpsAgentGraph,
  },
};

function resolveAgents(agentIds) {
  return agentIds
    .map(id => AGENT_REGISTRY[String(id).toLowerCase()])
    .filter(Boolean);
}

module.exports = {
  AGENT_REGISTRY,
  resolveAgents,
};
