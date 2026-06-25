// Step labels and option lists extracted from ArchitectIQ.html
export const STEPS = ['Basics', 'Scale', 'Cost', 'NFRs', 'Team', 'Generate'];

export const PL = ['Minimise', 'Balanced', 'Quality First'];

export const CL = [
  ['compute', 'Compute (edge / containers / VMs)'],
  ['llm', 'AI / Personalisation APIs (optional)'],
  ['storage', 'Retail data stores (DB / object storage)'],
  ['networking', 'Networking & CDN'],
  ['monitoring', 'Monitoring & Observability'],
  ['security', 'Retail Security, PCI & Privacy'],
  ['cicd', 'CI/CD & Dev tooling'],
  ['backup', 'Backup & Disaster recovery'],
];

export const NF = [
  ['security', 'What retail data is handled? PII, loyalty IDs, payment tokens, inventory, orders?'],
  ['compliance', 'PCI-DSS, GDPR, CCPA, Privacy Act, data residency, franchise obligations?'],
  ['reliability', 'Max downtime/month? Impact of 1-hour checkout, inventory, or fulfilment outage?'],
  ['dr', 'Recovery time & data-loss tolerance for stores, commerce, inventory, and orders?'],
  ['consistency', 'Strong consistency required, or eventual OK?'],
  ['maintainability', 'Deploy frequency? Store ops and platform support capacity?'],
  ['extensibility', 'Retail integrations planned in next 12-18 months?'],
  ['vendorLockIn', 'OK with single cloud/commerce/POS vendor, or need portability?'],
  ['i18n', 'Multiple countries, brands, languages, tax rules, or data sovereignty?'],
  ['auditability', 'Must customer, price, inventory, payment-token, or automated decisions be logged?'],
];

// SCENARIO_PRESETS is large; loaded lazily from the inlined legacy module so
// we keep a single source of truth.
export { SCENARIO_PRESETS, DEFAULT_SCENARIO_ID, getScenarioPreset, getDefaultState, deepClone } from '../utils/legacy.js';
