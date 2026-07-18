# ArchitectIQ Handoff

Last updated: 2026-07-06

## Current State

ArchitectIQ is an AI-assisted solution architecture platform. The current implementation is focused on producing more senior-architect-level recommendations: architecture decisions, diagrams, cost/FinOps context, security controls, scaling assumptions, delivery risks, and validation warnings.

The active working branch is `retail`, tracking `architectiq-v2/retail`.

Latest pushed commit:

```text
1685b60 Use provider-neutral generation wording
```

Recent commits:

```text
1685b60 Use provider-neutral generation wording
4796920 Add Render Docker deployment config
fc45053 Use venv for Render Python dependencies
9ae8aeb Fix Render diagram dependencies
bbf59c6 Add enterprise diagram annotations
6b7b4fa Improve retail architecture evidence and pricing
c4a37c2 Build retail-focused ArchitectIQ
```

## Product Direction

ArchitectIQ is being built to help companies and consultants produce robust, explainable solution architecture recommendations. The goal is not just to generate text or diagrams, but to make architectural judgment repeatable and defensible.

The system should behave like a senior solution architect by:

- Asking for business, scale, cost, NFR, team, and delivery inputs.
- Researching or validating context where possible.
- Producing architecture recommendations with assumptions, risks, and trade-offs.
- Calling out what is verified, inferred, low confidence, or needs human validation.
- Creating diagrams that show systems, trust boundaries, security annotations, and deployment context.
- Treating cost, scaling, security, compliance, and delivery readiness as first-class architecture concerns.

The project started with retail scenarios, but the broader direction is cross-industry IT solution architecture.

## Key Implemented Capabilities

### Architecture Generation

- Generates full architecture recommendations from user inputs.
- Uses an architecture playbook/retrieval layer before generation.
- Includes structured validation warnings and suggested improvements.
- Has deterministic fallback generation when live model output fails validation.
- Recently changed user-facing wording from provider/model-specific language to provider-neutral "architecture agents" wording.

Relevant file:

```text
landing/src/app/utils/legacy.js
```

### Retail Architecture Intelligence

Retail-focused intelligence was added for scenarios such as:

- Omnichannel commerce.
- Store-resilient fulfilment.
- Store edge and offline operation.
- Inventory reservation and promise logic.
- Loyalty and customer data.
- Supply chain and fulfilment.
- Retail AI and personalization.

Important quality expectations added:

- Systems of record ownership.
- Store outage behavior.
- Queue replay and duplicate handling.
- PCI boundary and PSP/token vault separation.
- Certificate lifecycle ownership.
- Rollout waves, rollback triggers, game days, and acceptance criteria.
- Human override for substitutions and operational exception flows.

### Pricing and FinOps

Pricing logic was improved to avoid misleading tiny SKU recommendations for enterprise scenarios.

Implemented improvements:

- Region-aware pricing.
- Better Azure PostgreSQL filtering.
- AWS RDS regional SKU lookup.
- GCP official pricing web-search validation.
- Pricing confidence and warning text when evidence is weak.
- Better separation between validated price points and fallback estimates.

Known context:

- Pricing APIs and search can still return low-quality or irrelevant SKUs.
- Enterprise sizing should always be treated as an estimate until validated with workload metrics, reserved capacity choices, storage, network egress, support plan, HA/DR, and licensing.

### Security and Enterprise Diagram Annotations

Diagram annotations were added to match enterprise architecture review expectations.

Security annotation keys include:

```text
A1   User/service credentials stored in Secret Manager or equivalent.
A2   System-to-system credentials encrypted with AES-256 and rotated by owner.
CA1  Strong user authentication: MFA, KBA, passwordless, or step-up control.
CA2  Basic username/password only; requires compensating MFA or policy review.
R2   Encryption at rest using customer-supplied or customer-managed keys where required.
R3   Encryption at rest using cloud-managed keys where risk and regulation permit.
T    Encryption in transit using TLS 1.2+ / SSH or equivalent.
C3   Class 3 operational/business data.
C5   Class 5 sensitive PII/payment-adjacent data.
C5E  Class 5 data with field/app-layer encryption or PGP where required.
SB   External security boundary: firewall, WAF, IPS, segmentation, or PSP boundary.
TB   Trust boundary around different ownership or security zones.
```

Diagram expectations:

- C5/C5E for customer, loyalty, support, and privacy stores.
- SB around PSP/token vault and PCI-scoped paths.
- T on inter-service and external integrations.
- R2/R3 before tokenization or masking is treated as sufficient.
- Background colors and legends for cloud, external/SaaS, third party, existing, updated, new, and supported components.

### Diagram Views

The app currently supports multiple diagram views:

- System Context.
- Solution Architecture.
- Deployment Architecture.
- Key Request Flow.

The renderer uses Python `diagrams`, Graphviz, and generated SVG output.

Relevant files:

```text
diagrams_render.py
diagrams_poc.py
landing/src/app/utils/legacy.js
```

### Render Deployment

Render support was added using both Node and Python/Graphviz dependencies.

Relevant files:

```text
Dockerfile
render.yaml
Aptfile
requirements.txt
package.json
server.js
```

Current Render-oriented setup:

- Docker deployment is preferred.
- `Dockerfile` installs Node, Python 3, pip, Graphviz, and the Python `diagrams` package.
- `render.yaml` defines a Docker web service named `architectiq-retail`.
- `requirements.txt` contains `diagrams`.
- `Aptfile` contains `graphviz` and `python3-venv` for non-Docker/native Render build attempts.
- `package.json` has `render-build` using a Python virtual environment to avoid PEP 668 errors.
- `server.js` supports `PYTHON_BIN` and virtualenv Python detection.

Required Render environment variables:

```text
NODE_ENV=production
PYTHON_BIN=python3
LLM_PRIMARY=openai
OPENAI_API_KEY=<set in Render secret env>
ANTHROPIC_API_KEY=<optional fallback/provider key>
ANTHROPIC_MODEL=<optional model override>
```

Do not commit `.env` or secret values.

## Local Development

Install dependencies:

```bash
npm install
npm --prefix landing install
python -m pip install -r requirements.txt
```

Start server:

```bash
npm start
```

Default port:

```text
3000
```

If port 3000 is already in use on Windows:

```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
```

Build frontend:

```bash
npm --prefix landing run build
```

Render build command for native/non-Docker deploy:

```bash
npm run render-build
```

## Validation Already Run

Recent checks run successfully:

```text
node --check landing/src/app/utils/legacy.js
npm --prefix landing run build
```

The Vite build completed successfully, with only the existing chunk-size warning.

## Known Issues and Risks

- `server-dev.log` is currently untracked locally and should not be committed unless intentionally needed.
- The repository remote `architectiq-v2` still uses the old URL `ArchitectIQ_v2_diff_domain.git`, but GitHub redirects pushes to `ArchitectIQ_v2.git`.
- Live generation depends on configured API keys and provider availability.
- Pricing evidence can still be incomplete or misleading without final SKU, region, HA/DR, storage, egress, commitment, and support-plan validation.
- Company research confidence may be low when public evidence is weak.
- The app still has a large legacy frontend file, `landing/src/app/utils/legacy.js`, which carries most logic. Future refactoring should split architecture logic, pricing, research, diagrams, validation, and UI rendering.
- Render requires Graphviz for diagram rendering. Without Graphviz, errors like `failed to execute PosixPath('dot')` will occur.
- Python `diagrams` must be installed in the runtime. Without it, errors like `ModuleNotFoundError: No module named 'diagrams'` will occur.
- API keys were previously visible in local conversation/context. Rotate any exposed OpenAI or Anthropic keys before production use.

## Recommended Next Steps

1. Split `legacy.js` into modules:
   - input/state management
   - scenario library
   - architecture playbooks
   - pricing evidence
   - research evidence
   - diagram model generation
   - output validation
   - UI rendering

2. Add an explicit architecture review pipeline:
   - business capability map
   - system context
   - integration map
   - data classification
   - security and identity controls
   - NFR decomposition
   - HA/DR design
   - cost model
   - delivery plan
   - acceptance tests

3. Make security stricter:
   - encryption before tokenization/masking
   - key ownership
   - certificate lifecycle ownership
   - identity flows
   - network segmentation
   - PCI/PII boundary evidence
   - audit logging and retention

4. Improve FinOps:
   - generate high/medium/low cost tiers
   - include assumptions per SKU
   - separate compute, storage, network, observability, support, and licensing
   - add confidence score and validation gaps

5. Improve diagrams:
   - make all diagrams domain-specific
   - add trust/security boundaries consistently
   - show data classifications on flows
   - show component status and ownership
   - ensure diagrams are readable at PDF/export size

6. Add test scenarios:
   - retail startup
   - enterprise retailer
   - banking modernization
   - healthcare platform
   - logistics platform
   - insurance claims platform
   - government citizen service

7. Add automated regression checks:
   - output JSON schema validation
   - diagram render validation
   - pricing evidence validation
   - architecture warning validation
   - no provider/model names in user-facing UI

## Deployment Notes

For Render, prefer the Docker service because it guarantees Graphviz and Python dependencies:

```text
Environment: Docker
Branch: retail
Root Directory: leave blank
Dockerfile Path: ./Dockerfile
Start Command: handled by Docker CMD
```

If using native Node environment instead of Docker:

```text
Language: Node
Branch: retail
Build Command: npm run render-build
Start Command: npm start
```

Native deploy also needs system packages:

```text
graphviz
python3-venv
```

## Current Git Status at Handoff

Before this handoff file was added, status was:

```text
## retail...architectiq-v2/retail
?? server-dev.log
```

After adding this file, `HANDOFF.md` should be staged/committed if it needs to be pushed.

