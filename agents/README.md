# Agent Layout

This folder is organised by agent domain so each agent can own its graph, tools, prompts, deterministic rules, and tests.

## Current structure

- `security/`
  - `securityKnowledgeBase.js`: local ArchitectIQ security playbook retrieval used by the Security graph.
  - `securityEnterprise.js`: enterprise security control mapping, threat modeling, compliance mapping, and evidence-pack assembly.
  - `securitySignalClassifier.js`: deterministic security-domain classifier used for retrieval routing, confidence reporting, and false-positive/false-negative notes.
  - `securityPolicyIngestion.js`: markdown policy ingestion for built-in and customer security policy packs.
  - `securityEvalCases.js`: no-LLM evaluation cases and scoring checks for Security Agent quality.
  - `securityAgentGraph.js`: LangGraph workflow for the Security Agent.
  - `securityTools.js`: LangChain tools used by the Security graph.
  - `securityAgent.js`: deterministic security rules plus model judgement prompt wrapper.
- `compliance/`
  - `complianceKnowledgeBase.js`: local ArchitectIQ compliance playbook retrieval used by the Compliance graph.
  - `compliancePolicyIngestion.js`: markdown policy ingestion for built-in and customer compliance policy packs.
  - `complianceSignalClassifier.js`: deterministic compliance-domain classifier used for retrieval routing, confidence reporting, and false-positive/false-negative notes.
  - `complianceEvalCases.js`: no-LLM evaluation cases and scoring checks for Compliance Agent quality.
  - `complianceAgentGraph.js`: LangGraph workflow for the Compliance Agent.
  - `complianceTools.js`: LangChain tools used by the Compliance graph.
  - `complianceAgent.js`: deterministic compliance rules plus model judgement prompt wrapper.
- `governance/`
  - `governanceKnowledgeBase.js`: local ArchitectIQ governance playbook retrieval used by the Governance graph.
  - `governancePolicyIngestion.js`: markdown policy ingestion for built-in and customer governance policy packs.
  - `governanceSignalClassifier.js`: deterministic governance-domain classifier used for retrieval routing, confidence reporting, and false-positive/false-negative notes.
  - `governanceEvalCases.js`: no-LLM evaluation cases and scoring checks for Governance Agent quality.
  - `governanceAgentGraph.js`: LangGraph workflow for the Governance Agent.
  - `governanceTools.js`: LangChain tools used by the Governance graph.
  - `governanceAgent.js`: deterministic governance rules plus model judgement prompt wrapper.
- `infrastructure/`
  - `infrastructureKnowledgeBase.js`: local ArchitectIQ infrastructure playbook retrieval used by the Infrastructure graph.
  - `infrastructurePolicyIngestion.js`: markdown policy ingestion for built-in and customer infrastructure policy packs.
  - `infrastructureSignalClassifier.js`: deterministic infrastructure-domain classifier used for retrieval routing, confidence reporting, and false-positive/false-negative notes.
  - `infrastructureEvalCases.js`: no-LLM evaluation cases and scoring checks for Infrastructure Agent quality.
  - `infrastructureAgentGraph.js`: LangGraph workflow for the Infrastructure Agent.
  - `infrastructureTools.js`: LangChain tools used by the Infrastructure graph.
  - `infrastructureAgent.js`: deterministic infrastructure rules plus model judgement prompt wrapper.
- `technology/`
  - `technologyKnowledgeBase.js`: local ArchitectIQ technology playbook retrieval used by the Technology graph.
  - `technologyPolicyIngestion.js`: markdown policy ingestion for built-in and customer technology policy packs.
  - `technologySignalClassifier.js`: deterministic technology-domain classifier used for retrieval routing, confidence reporting, and false-positive/false-negative notes.
  - `technologyEvalCases.js`: no-LLM evaluation cases and scoring checks for Technology Agent quality.
  - `technologyAgentGraph.js`: LangGraph workflow for the Technology Agent.
  - `technologyTools.js`: LangChain tools used by the Technology graph.
  - `technologyAgent.js`: deterministic technology rules plus model judgement prompt wrapper.
- `storage/`
  - `storageKnowledgeBase.js`: local ArchitectIQ storage playbook retrieval used by the Storage graph.
  - `storagePolicyIngestion.js`: markdown policy ingestion for built-in and customer storage policy packs.
  - `storageSignalClassifier.js`: deterministic storage-domain classifier used for retrieval routing, confidence reporting, and false-positive/false-negative notes.
  - `storageEvalCases.js`: no-LLM evaluation cases and scoring checks for Storage Agent quality.
  - `storageAgentGraph.js`: LangGraph workflow for the Storage Agent.
  - `storageTools.js`: LangChain tools used by the Storage graph.
  - `storageAgent.js`: deterministic storage rules plus model judgement prompt wrapper.
- `api/`
  - `apiKnowledgeBase.js`: local ArchitectIQ API playbook retrieval used by the API graph.
  - `apiPolicyIngestion.js`: markdown policy ingestion for built-in and customer API policy packs.
  - `apiSignalClassifier.js`: deterministic API-domain classifier used for retrieval routing, confidence reporting, and false-positive/false-negative notes.
  - `apiEvalCases.js`: no-LLM evaluation cases and scoring checks for API Agent quality.
  - `apiAgentGraph.js`: LangGraph workflow for the API Agent.
  - `apiTools.js`: LangChain tools used by the API graph.
  - `apiAgent.js`: deterministic API rules plus model judgement prompt wrapper.
- `ai/`
  - `aiKnowledgeBase.js`: local ArchitectIQ AI playbook retrieval used by the AI graph.
  - `aiPolicyIngestion.js`: markdown policy ingestion for built-in and customer AI policy packs.
  - `aiSignalClassifier.js`: deterministic AI-domain classifier used for retrieval routing, confidence reporting, and false-positive/false-negative notes.
  - `aiEvalCases.js`: no-LLM evaluation cases and scoring checks for AI Agent quality.
  - `aiAgentGraph.js`: LangGraph workflow for the AI Agent.
  - `aiTools.js`: LangChain tools used by the AI graph.
  - `aiAgent.js`: deterministic AI rules plus model judgement prompt wrapper.
- `ui/`
  - `uiKnowledgeBase.js`: local ArchitectIQ UI/frontend playbook retrieval used by the UI graph.
  - `uiPolicyIngestion.js`: markdown policy ingestion for built-in and customer UI policy packs.
  - `uiSignalClassifier.js`: deterministic UI-domain classifier used for retrieval routing, confidence reporting, and false-positive/false-negative notes.
  - `uiEvalCases.js`: no-LLM evaluation cases and scoring checks for UI Agent quality.
  - `uiAgentGraph.js`: LangGraph workflow for the UI Agent.
  - `uiTools.js`: LangChain tools used by the UI graph.
  - `uiAgent.js`: deterministic UI rules plus model judgement prompt wrapper.
- `finops/`
  - `cloudPricing.js`: AWS/Azure/GCP provider-pricing access used by the FinOps graph.
  - `finopsKnowledgeBase.js`: local ArchitectIQ FinOps playbook retrieval used by the FinOps graph.
  - `finopsPolicyIngestion.js`: markdown policy ingestion for built-in and customer FinOps policy packs.
  - `finopsSignalClassifier.js`: deterministic FinOps-domain classifier used for retrieval routing, confidence reporting, and false-positive/false-negative notes.
  - `finopsEvalCases.js`: no-LLM evaluation cases and scoring checks for FinOps Agent quality.
  - `finopsAgentGraph.js`: LangGraph workflow for the FinOps Agent.
  - `finopsTools.js`: LangChain tools used by the FinOps graph.
  - `finopsAgent.js`: deterministic FinOps rules plus model judgement prompt wrapper.
- `registry.js`
  - Top-level agent registry used by the Master Agent.
- `masterAgent.js`
  - Current sequential orchestration and recommendation assembly.
- `schema.js`
  - Shared request/state normalisation and state patch merge helpers.
- `retailContext.js`
  - Shared retail workload signal detection.
- `retailReviewGate.js`
  - Shared architecture-board and review-gate checks.
- `llmClient.js`
  - Shared specialist model call and model-output merge logic.

## Direction

Each agent folder should eventually contain:

- `<domain>AgentGraph.js`
- `<domain>Tools.js`
- `<domain>Agent.js`
- optional `<domain>Prompts.js`
- optional `<domain>Validation.js`

The Security, Compliance, Governance, Infrastructure, Technology, Storage, API, AI, UI, and FinOps Agents now follow the proper agentic pattern:

`LangGraph state -> tools -> deterministic controls -> model judgement -> validation -> review recommendations/final output`.

The Security Agent is the quality reference:

`input classification -> data classification -> payment scope -> AI/RAG/tool scope -> trust boundaries -> local playbook/policy retrieval -> enterprise controls -> threat model -> compliance map -> evidence pack -> deterministic controls -> optional model judgement -> validation -> review recommendations/final output`.

Its v2 structured output includes:

- `security_recommendation`
- `data_classification_matrix`
- `trust_boundaries`
- `payment_security`
- `ai_security`
- `required_controls`
- `approval_gates`
- `diagram_annotations`
- `accepted_assumptions`

Its enterprise v3 output adds:

- `enterprise_control_map`
- `threat_model`
- `compliance_control_map`
- `security_evidence_pack`
- `policy_citations`

Its v4 hardening adds:

- `compliance_qualification`: explicit customer-facing qualification that compliance mapping is a security architecture draft and still needs security, privacy/legal, and QSA review where applicable.
- `security_signal_profile`: detected security domains, confidence summary, and false-positive/false-negative notes.
- policy freshness metadata from retrieved markdown policies: version, effective date, review-by date, freshness status, and freshness review notes.

Add ArchitectIQ baseline policies under `security/knowledge/` and customer-specific approved policies under `security/customer-policies/` as markdown files with `Controls`, `Risks`, `Validation Needed`, `Compliance Mappings`, and `Citations` sections. These documents are retrieved into the Security Agent evidence pack and cited in the final output.

The Compliance Agent now follows the same quality pattern:

`input classification -> Security handoff inspection -> jurisdiction/framework scope -> processor/residency matrix -> retention/deletion controls -> local compliance playbook retrieval -> deterministic controls -> optional model judgement -> validation -> review recommendations/final output`.

Its structured output includes:

- `compliance_recommendation`
- `jurisdiction_frameworks`
- `processor_residency_matrix`
- `retention_deletion_controls`
- `compliance_evidence_status`
- `compliance_validation_gates`
- `compliance_qualification`
- `compliance_policy_citations`
- `compliance_evidence_pack`
- `compliance_signal_profile`

Compliance output is always draft-level until legal/privacy owners validate jurisdictions, processor evidence, residency, retention/deletion, support access, and QSA requirements where PCI applies.

Add ArchitectIQ compliance policies under `compliance/knowledge/` and customer-specific approved compliance policies under `compliance/customer-policies/` as markdown files with `Controls`, `Risks`, `Validation Needed`, and `Citations` sections. These documents are retrieved into the Compliance Agent evidence pack and include version, owner, effective date, review-by date, and freshness status.

Run its no-token quality gate with:

`npm run test:security-agent`

Run the Compliance Agent no-token quality gate with:

`npm run test:compliance-agent`

The Security Agent eval suite covers simple and complex retail-enterprise scenarios, including AI checkout/payment, offline POS, loyalty privacy, global marketplace partners, BOPIS/returns, privileged backoffice mutation, AI agent tool access, warehouse/logistics security, continuous CI/CD/IaC/cloud configuration drift detection, retail fraud and policy abuse, and B2B/supplier-feed ingestion security.

The Compliance Agent eval suite covers global retail AI/payment residency, Security handoff consumption, offline POS compliance, children/minor AI privacy, vague compliance requests, marketplace/franchise data sharing, workforce privacy, regulated retail, conflicting residency paths, loyalty/CDP consent, B2B logistics, and financial retail/BNPL scenarios.

The Governance Agent follows the same quality pattern:

`input classification -> Security/Compliance handoff inspection -> systems-of-record matrix -> decision and approval gates -> local governance playbook retrieval -> deterministic controls -> optional model judgement -> validation -> review recommendations/final output`.

Its structured output includes:

- `governance_recommendation`
- `governance_handoff_summary`
- `systems_of_record_matrix`
- `decision_records`
- `approval_gates`
- `rollout_readiness`
- `governance_evidence_status`
- `governance_validation_gates`
- `governance_qualification`
- `governance_policy_citations`
- `governance_evidence_pack`
- `governance_signal_profile`

Add ArchitectIQ governance policies under `governance/knowledge/` and customer-specific approved governance policies under `governance/customer-policies/` as markdown files with `Controls`, `Risks`, `Validation Needed`, and `Citations` sections. These documents are retrieved into the Governance Agent evidence pack and include version, owner, effective date, review-by date, and freshness status.

Run the Governance Agent no-token quality gate with:

`npm run test:governance-agent`

The Governance Agent eval suite covers Security/Compliance handoff governance, store-edge rollout, integration replay/reconciliation, AI governance, missing handoff blocking, FinOps budget governance, loyalty/CDP governance, and architecture-board decision readiness.

The Infrastructure Agent follows the same quality pattern:

`input classification -> Security/Compliance/Governance handoff inspection -> runtime platform -> network topology -> HA/DR resilience -> observability/operations -> environment/release strategy -> local infrastructure playbook retrieval -> deterministic controls -> optional model judgement -> validation -> review recommendations/final output`.

Its structured output includes:

- `infrastructure_recommendation`
- `infrastructure_handoff_summary`
- `runtime_platform`
- `network_topology`
- `resilience_plan`
- `observability_operations`
- `environment_release_strategy`
- `infrastructure_evidence_status`
- `infrastructure_validation_gates`
- `infrastructure_qualification`
- `infrastructure_policy_citations`
- `infrastructure_evidence_pack`
- `infrastructure_signal_profile`

Add ArchitectIQ infrastructure policies under `infrastructure/knowledge/` and customer-specific approved infrastructure policies under `infrastructure/customer-policies/` as markdown files with `Controls`, `Risks`, `Validation Needed`, and `Citations` sections. These documents are retrieved into the Infrastructure Agent evidence pack and include version, owner, effective date, review-by date, and freshness status.

Run the Infrastructure Agent no-token quality gate with:

`npm run test:infrastructure-agent`

The Infrastructure Agent eval suite covers global retail platform topology, flash-sale runtime/network isolation, store-edge offline POS, multi-region residency and DR, environment/release/IaC, observability/operations, missing upstream handoffs, and AI/RAG infrastructure isolation.

The Technology Agent follows the same quality pattern:

`input classification -> Security/Compliance/Governance/Infrastructure/FinOps handoff inspection -> API/Storage/AI/UI decomposition -> specialist handoff matrix -> provisional technology direction -> NFR coverage -> local technology playbook retrieval -> deterministic controls -> optional model judgement -> validation -> review recommendations/final output`.

Its structured output includes:

- `technology_recommendation`
- `technology_handoff_summary`
- `technology_domains`
- `specialist_handoff_matrix`
- `api_technology`
- `storage_technology`
- `ai_technology`
- `ui_technology`
- `technology_nfr_coverage`
- `technology_evidence_status`
- `technology_validation_gates`
- `technology_qualification`
- `technology_policy_citations`
- `technology_evidence_pack`
- `technology_signal_profile`

Add ArchitectIQ technology policies under `technology/knowledge/` and customer-specific approved technology policies under `technology/customer-policies/` as markdown files with `Controls`, `Risks`, `Validation Needed`, and `Citations` sections. These documents are retrieved into the Technology Agent evidence pack and include version, owner, effective date, review-by date, and freshness status.

Run the Technology Agent no-token quality gate with:

`npm run test:technology-agent`

The Technology Agent eval suite covers global retail technology decomposition, API/integration-heavy systems, storage/data-truth design, AI/RAG technology, UI/channel technology, missing specialist outputs, store-edge technology, and cross-cutting NFR coverage.

The Storage Agent follows the same quality pattern:

`input classification -> upstream handoff inspection -> data-domain/source-of-truth mapping -> storage platform selection -> cache/search/read-model strategy -> backup/recovery/retention -> migration/rebuild planning -> local storage playbook retrieval -> deterministic controls -> optional model judgement -> validation -> review recommendations/final output`.

Its structured output includes:

- `storage_recommendation`
- `storage_handoff_summary`
- `data_domain_matrix`
- `system_of_record_matrix`
- `storage_platform`
- `storage_platforms`
- `cache_search_strategy`
- `backup_recovery_retention`
- `data_migration_rebuild`
- `storage_evidence_status`
- `storage_validation_gates`
- `storage_qualification`
- `storage_policy_citations`
- `storage_evidence_pack`
- `storage_signal_profile`

Add ArchitectIQ storage policies under `storage/knowledge/` and customer-specific approved storage policies under `storage/customer-policies/` as markdown files with `Controls`, `Risks`, `Validation Needed`, and `Citations` sections. These documents are retrieved into the Storage Agent evidence pack and include version, owner, effective date, review-by date, and freshness status.

Run the Storage Agent no-token quality gate with:

`npm run test:storage-agent`

The Storage Agent eval suite covers global retail storage architecture, checkout/payment/inventory truth, cache/search catalog, object/document storage, multi-region backup/residency, AI vector storage, migration/rebuild, and missing evidence scenarios.

The API Agent follows the same quality pattern:

`input classification -> upstream handoff inspection -> API gateway/edge strategy -> service contract matrix -> sync/async orchestration -> third-party integration planning -> idempotency/replay/reconciliation controls -> API security/observability -> local API playbook retrieval -> deterministic controls -> optional model judgement -> validation -> review recommendations/final output`.

Its structured output includes:

- `api_recommendation`
- `api_handoff_summary`
- `api_contract_matrix`
- `api_gateway_strategy`
- `integration_orchestration`
- `third_party_integrations`
- `idempotency_replay_controls`
- `api_security_observability`
- `api_evidence_status`
- `api_validation_gates`
- `api_qualification`
- `api_policy_citations`
- `api_evidence_pack`
- `api_signal_profile`

Add ArchitectIQ API policies under `api/knowledge/` and customer-specific approved API policies under `api/customer-policies/` as markdown files with `Controls`, `Risks`, `Validation Needed`, and `Citations` sections. These documents are retrieved into the API Agent evidence pack and include version, owner, effective date, review-by date, and freshness status.

Run the API Agent no-token quality gate with:

`npm run test:api-agent`

The API Agent eval suite covers global retail API architecture, checkout/payment APIs, B2B integrations, event orchestration, store-edge POS APIs, AI/tool APIs, API security/observability, and missing evidence scenarios.

The AI Agent follows the same quality pattern:

`input classification -> upstream handoff inspection -> RAG/retrieval architecture -> model routing -> vector/embedding/reranking strategy -> AI tool/API access controls -> safety/eval/fallback planning -> privacy/residency/cost operations -> local AI playbook retrieval -> deterministic controls -> optional model judgement -> validation -> review recommendations/final output`.

Its structured output includes:

- `ai_recommendation`
- `ai_handoff_summary`
- `ai_use_case_matrix`
- `rag_architecture`
- `model_routing_strategy`
- `vector_embedding_strategy`
- `ai_tool_api_controls`
- `ai_safety_evaluation`
- `ai_privacy_residency`
- `ai_cost_operations`
- `ai_evidence_status`
- `ai_validation_gates`
- `ai_qualification`
- `ai_policy_citations`
- `ai_evidence_pack`
- `ai_signal_profile`

Add ArchitectIQ AI policies under `ai/knowledge/` and customer-specific approved AI policies under `ai/customer-policies/` as markdown files with `Controls`, `Risks`, `Validation Needed`, and `Citations` sections. These documents are retrieved into the AI Agent evidence pack and include version, owner, effective date, review-by date, and freshness status.

Run the AI Agent no-token quality gate with:

`npm run test:ai-agent`

The AI Agent eval suite covers global retail AI/RAG, GPT/local model routing, RAG corpus retrieval, vector/embedding/reranking, AI tool/API controls, AI privacy/residency, safety/eval/fallback, and missing evidence scenarios.

The UI Agent follows the same quality pattern:

`input classification -> upstream API/AI/Security/Compliance/Governance/Infrastructure/Technology/Storage handoff inspection -> storefront/mobile/admin channel design -> checkout journey resilience -> design-system/accessibility -> auth/session controls -> performance/CDN/image delivery -> observability/experimentation/release controls -> local UI playbook retrieval -> deterministic controls -> optional model judgement -> validation -> review recommendations/final output`.

Its structured output includes:

- `ui_recommendation`
- `ui_handoff_summary`
- `ui_channel_matrix`
- `frontend_architecture`
- `design_system_strategy`
- `checkout_experience_resilience`
- `ui_auth_session_controls`
- `ui_performance_delivery`
- `ui_observability`
- `ui_accessibility_internationalization`
- `ui_evidence_status`
- `ui_validation_gates`
- `ui_qualification`
- `ui_policy_citations`
- `ui_evidence_pack`
- `ui_signal_profile`

Add ArchitectIQ UI policies under `ui/knowledge/` and customer-specific approved UI policies under `ui/customer-policies/` as markdown files with `Controls`, `Risks`, `Validation Needed`, and `Citations` sections. These documents are retrieved into the UI Agent evidence pack and include version, owner, effective date, review-by date, and freshness status.

Run the UI Agent no-token quality gate with:

`npm run test:ui-agent`

The UI Agent eval suite covers global retail UI architecture, checkout critical journeys, admin/support UI, frontend performance delivery, auth/session security, accessibility/localization, AI-assisted UI, and missing evidence scenarios.

The Architecture Synthesis Agent runs after the specialist pipeline inside the Master Agent. It converts the merged specialist state into the same customer-facing recommendation contract used by the original Generate Architecture flow:

- `executive_summary`
- `architecture_confidence`
- `confidence_reason`
- `assumptions`
- `human_validation_needed`
- `evidence_status`
- `workload_pricing_assumptions`
- `residency_matrix`
- exactly three `tiers`: Conservative, Recommended, Optimised
- each tier includes `stack`, `architecture_diagram`, `cost_breakdown`, and `biggest_cost_driver`
- `nfr_coverage`
- `risks`
- `decisions`
- `roadmap`
- `next_steps`
- `disclaimer`

Run the synthesis no-token quality gate with:

`npm run test:synthesis-agent`

The Master Agent runs them sequentially:

`Security -> Compliance -> Governance -> Infrastructure -> Technology -> Storage -> API -> AI -> UI -> FinOps -> Architecture Synthesis`

Each agent returns a `statePatch`; the master merges that patch before invoking the next agent, so Security output feeds Compliance, Compliance output feeds Governance, Governance output feeds Infrastructure, Infrastructure output feeds Technology, Technology output feeds Storage, Storage output feeds API, API output feeds AI, AI output feeds UI, UI output feeds FinOps, and the final Architecture Synthesis Agent converts the merged state into the legacy customer-facing architecture recommendation format.

FinOps live pricing uses public Azure Retail Prices and AWS Price List APIs where reachable. GCP public list pricing uses Google Cloud Billing Catalog/Pricing API access with `GOOGLE_CLOUD_API_KEY`, `GCP_API_KEY`, or `GOOGLE_API_KEY`; customer-specific contract pricing still requires `GOOGLE_CLOUD_BILLING_TOKEN` or `GCP_BILLING_BEARER_TOKEN` plus Cloud Billing account permissions. If no GCP key/token exists and GCP is explicitly in scope, FinOps can use `OPENAI_API_KEY` with GPT web search to gather public Google Cloud pricing evidence; set `ENABLE_GCP_PRICING_WEB_SEARCH=false` to disable that fallback. If neither GCP credentials nor the OpenAI fallback are available, GCP pricing is marked missing for that run.

The FinOps Agent follows the same quality pattern:

`input classification -> upstream Security/Compliance/Governance cost inspection -> unit-driver estimation -> AWS/Azure/GCP pricing lookup -> cost model -> local FinOps playbook retrieval -> deterministic controls -> optional model judgement -> validation -> review recommendations/final output`.

Its structured output includes:

- `finops_recommendation`
- `finops_upstream_summary`
- `unit_driver_matrix`
- `pricing_evidence_summary`
- `cost_model_tiers`
- `cost_optimization_levers`
- `finops_evidence_status`
- `finops_validation_gates`
- `finops_qualification`
- `finops_policy_citations`
- `finops_evidence_pack`
- `finops_signal_profile`

Add ArchitectIQ FinOps policies under `finops/knowledge/` and customer-specific approved FinOps policies under `finops/customer-policies/` as markdown files with `Controls`, `Risks`, `Validation Needed`, and `Citations` sections. These documents are retrieved into the FinOps Agent evidence pack and include version, owner, effective date, review-by date, and freshness status.

Run the FinOps Agent no-token quality gate with:

`npm run test:finops-agent`

The FinOps Agent eval suite covers AI/RAG/GPT cost, flash-sale commerce peak cost, store-edge POS rollout, fulfilment integrations, missing-budget scenarios, Security/Compliance/Governance mandatory cost, AWS/Azure/GCP pricing evidence, observability retention/egress, and optimised-tier guardrails.
