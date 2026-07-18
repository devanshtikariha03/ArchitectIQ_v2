export const STEPS=['Basics','Scale','Cost','NFRs','Team','Generate'];
export const PL=['Minimise','Balanced','Quality First'];
export const CL=[
  ['compute','Compute (edge / containers / VMs)'],
  ['llm','AI / Personalisation APIs (optional)'],
  ['storage','Retail data stores (DB / object storage)'],
  ['networking','Networking & CDN'],
  ['monitoring','Monitoring & Observability'],
  ['security','Retail Security, PCI & Privacy'],
  ['cicd','CI/CD & Dev tooling'],
  ['backup','Backup & Disaster recovery'],
];
export const NF=[
  ['security','What retail data is handled? PII, loyalty IDs, payment tokens, inventory, orders?'],
  ['compliance','PCI-DSS, GDPR, CCPA, Privacy Act, data residency, franchise obligations?'],
  ['reliability','Max downtime/month? Impact of 1-hour checkout, inventory, or fulfilment outage?'],
  ['dr','Recovery time & data-loss tolerance for stores, commerce, inventory, and orders?'],
  ['consistency','Strong consistency required, or eventual OK?'],
  ['maintainability','Deploy frequency? Store ops and platform support capacity?'],
  ['extensibility','Retail integrations planned in next 12-18 months?'],
  ['vendorLockIn','OK with single cloud/commerce/POS vendor, or need portability?'],
  ['i18n','Multiple countries, brands, languages, tax rules, or data sovereignty?'],
  ['auditability','Must customer, price, inventory, payment-token, or automated decisions be logged?'],
];

export const SCENARIO_PRESETS=[
  {
    id:'retailedge-omnichannel',
    name:'RetailEdge Omni',
    tag:'Store Edge',
    summary:'Store-edge failover, real-time inventory sync, PCI controls, and offline checkout continuity.',
    state:{
      basics:{
        company:'RetailEdge Omni',
        contact:'Avery Singh, Head of Retail Technology',
        industry:'Retail / E-commerce',
        domain:'Store Execution & Omnichannel Inventory',
        problem:'Design a real-time retail execution and omnichannel inventory platform that keeps physical stores, e-commerce, POS, ERP, and warehouse stock levels synchronized. Stores must continue checkout and inventory capture during internet dropouts, then reconcile with the central platform once connectivity is stable.',
        stack:'Central cloud APIs, identity provider, ERP/POS core database, e-commerce CMS, OMS, WMS, local store edge servers, POS registers, PCI-compliant payment terminals, associate mobile apps, local durable queueing, CDC sync, UPS-backed network gear, OAuth/OIDC, mTLS, SQLCipher on mobile devices, and full disk encryption on edge nodes.',
        constraints:'Checkout must continue during network dropouts. Inventory changes from POS must update digital availability. Physical store sales win inventory conflicts. Raw payment card data must never be stored in internal systems. PII and loyalty IDs must be tokenised or masked. PCI-DSS, GDPR, CCPA, and regional data residency controls are mandatory.'
      },
      scale:{usersNow:'120 stores, 720 POS lanes, 1,800 associate mobile users, 2.5 million online sessions per month',users12m:'250 stores, 1,600 POS lanes, 4,000 associate mobile users, 7 million online sessions per month',peak:'Campaign launches up to 12,000 POS transactions per minute and 4,500 inventory mutations per second',latency:'Inventory availability within 2 seconds online; local checkout under 300ms in store',sla:'99.99%',traffic:'Bursty retail peaks with store-local continuity during network failures',rw:'Write-heavy checkout and inventory flow; read-heavy catalogue and stock availability online',data:'18TB transaction, inventory, audit, and customer-token history, growing 1.5TB per month'},
      cost:{compute:'Balanced',llm:'Minimise',storage:'Balanced',networking:'Quality First',monitoring:'Quality First',security:'Quality First',cicd:'Balanced',backup:'Quality First',monthly:'$85,000/month',setup:'$650,000 rollout and store-edge deployment budget'},
      nfr:{security:'PII, loyalty identifiers, transaction metadata, and payment-adjacent events require zero-trust access, tokenisation, mTLS, device attestation, encrypted local queues, hardware-backed mobile keys, full disk encryption, and certificate lifecycle ownership.',compliance:'PCI-DSS applies to payment-adjacent architecture. GDPR and CCPA apply to customer and membership data. Need clear PCI scope boundaries, retention rules, support-access controls, and evidence that offline modes do not weaken protection.',reliability:'Stores must continue checkout and inventory capture during internet dropouts. Local failover should activate after 10 seconds of connectivity loss and reconnect only after stable connectivity is observed.',dr:'RTO 15 minutes for central inventory APIs, RPO 0 for committed local checkout transactions, and store-local queue durability for at least 7 days.',consistency:'Strong consistency required for completed POS sale records, payment token references, stock decrements, and audit logs. Conflict resolution must prioritize physical in-store checkout and reroute online fulfilment.',maintainability:'Retail operations and infrastructure teams need clear runbooks, certificate renewal workflows, remote diagnostics, and field technician procedures.',extensibility:'Roadmap includes associate tasking, shelf-scanning suppression during power events, regional depot orchestration, loyalty-tier QR verification, and store-by-store rollout to additional countries.',vendorLockIn:'Prefer cloud-managed services for central orchestration but require portable message contracts and payment-provider independence.',i18n:'Initial rollout covers Australia, New Zealand, US, and EU stores. EU customer data must remain in compliant EU processing and storage boundaries.',auditability:'Need audit trail for offline queue entries, sync retries, rejected ERP records, conflict-resolution decisions, tokenisation events, employee access, device attestation failures, certificate changes, and payment-token ledger reconciliation.'},
      team:{size:'18 people across retail platform, security, infrastructure, mobile, and store operations',seniority:'Mixed',timeline:'Pilot in 12 stores within 16 weeks, national rollout in 9 months',buildBuy:'Balanced',deploy:'Hybrid',notes:'Team has strong POS experience but limited experience operating distributed store-edge services at scale. Security and CISO approval are mandatory before pilot.'}
    }
  },
  {
    id:'retailloop-personalization',
    name:'RetailLoop',
    tag:'Retail Data',
    summary:'Real-time personalization and merchandising recommendations for a growing e-commerce retailer.',
    state:{
      basics:{company:'RetailLoop',contact:'Sofia Martinez, VP Product',industry:'Retail / E-commerce',domain:'Retail Data / Loyalty / Personalisation',problem:'Build a real-time personalization and recommendation platform that uses clickstream, catalogue, order, inventory, and loyalty data to power home page ranking, email recommendations, and merchandiser dashboards.',stack:'Shopify Plus storefront, Node microservices on GCP, BigQuery for analytics, Klaviyo, Snowplow events, Looker, consent records in CRM, and batch catalogue exports from ERP.',constraints:'Need first production use case in 10 weeks before peak trading season. Merchandising needs self-serve controls. Customer consent and regional processing must be respected before any activation.'},
      scale:{usersNow:'45 million events per month',users12m:'120 million events per month',peak:'5,500 events per second during campaign launches',latency:'< 500ms',sla:'99.9%',traffic:'Bursty (unpredictable spikes)',rw:'Mostly writes',data:'4TB event history and growing 500GB/month'},
      cost:{compute:'Balanced',llm:'Minimise',storage:'Balanced',networking:'Minimise',monitoring:'Balanced',security:'Balanced',cicd:'Minimise',backup:'Balanced',monthly:'$11,000/month',setup:'$28,000 one-time'},
      nfr:{security:'Customer profiles, behavioural events, loyalty IDs, and campaign targeting data require role-based controls and pseudonymisation.',compliance:'Privacy Act and GDPR apply. Consent must gate activation into email, ad, app, and on-site channels.',reliability:'Recommendation APIs cannot exceed 4 hours downtime per month during sales events.',dr:'RTO 4 hours, RPO 1 hour.',consistency:'Eventual consistency acceptable for dashboards. Recommendation serving should update within minutes.',maintainability:'Data team can manage SQL and managed services but does not want to run Kafka clusters by hand.',extensibility:'Mobile app personalization, store associate suggestions, and vendor-funded retail media are planned.',vendorLockIn:'Open to managed cloud-native data services if export and deletion paths remain practical.',i18n:'Australia, UK, and Singapore storefronts.',auditability:'Need lineage for recommendation inputs, experiment assignments, consent state, and segment activation.'},
      team:{size:'7 engineers - 3 data, 2 backend, 1 frontend, 1 analytics engineer',seniority:'Mixed',timeline:'Pilot in 10 weeks, scaled rollout in 20 weeks',buildBuy:'Balanced',deploy:'Cloud-only',notes:'Team has strong analytics skills but limited streaming-platform operations experience.'}
    }
  },
  {
    id:'myntra-intelligent-retail',
    name:'Myntra Intelligent Retail',
    tag:'Fashion Commerce',
    summary:'High-scale fashion commerce, EORS flash-sale resilience, real-time stock locking, AI discovery, chatbot support, and secure checkout.',
    state:{
      basics:{
        company:'Myntra',
        contact:'Enterprise Architecture Team / Retail Platform Sponsor',
        industry:'Fashion & Lifestyle E-commerce',
        domain:'Digital Commerce & Retail AI',
        problem:'Design a next-generation intelligent retail platform for Myntra that improves product discovery, conversion, combo-deal recommendations, real-time delivery transparency, AI support, and flash-sale resilience during high-velocity events such as End of Reason Sale. Core checkout, inventory locking, payment orchestration, and order state transitions must remain available even when AI recommendation, chatbot, or personalization services degrade.',
        stack:'React web storefront, native iOS and Android apps, reverse proxy and API gateway, WAF, OAuth2/OIDC social login, product catalog and search, OpenSearch-style faceted indexing, promotions and combo discount engine, Redis-style inventory state locker, stateless checkout/payment orchestrator, external PCI-compliant payment gateways supporting cards, UPI, net banking, wallets, gift vouchers, COD, and BNPL, Kafka/RabbitMQ-style event bus, fulfilment/logistics engine, AI personalization and recommendations, LLM/RAG customer support chatbot, CRM ticket escalation, admin dashboards, BI analytics, OpenTelemetry monitoring, tokenization vault, and HSM/KMS-backed encryption.',
        constraints:'India-first fashion and lifestyle e-commerce workload. Public/internal facts must be marked as verified, partial, or assumption. Core checkout and payment paths must be isolated from non-critical AI and recommendation failures. Inventory locking must prevent oversell for size/color variants during flash sales. Raw card data must stay with PCI-compliant payment providers. User PII, phone numbers, addresses, payment tokens, support transcripts, and profile data require tokenization, encryption, retention, deletion, and DPDP/GDPR/CCPA-aware privacy controls. The platform must support graceful degradation, zero-trust service boundaries, mTLS, rate limiting, circuit breakers, DLQs, replay, and measurable flash-sale acceptance tests.'
      },
      scale:{
        usersNow:'Large national fashion and lifestyle marketplace; exact active user/session volumes must be validated from Myntra telemetry',
        users12m:'Architecture target assumes continued growth across web, iOS, Android, beauty, fashion, home, and marketplace brand participation',
        peak:'EORS and festival flash-sale peaks with extreme browse/search/cart/checkout concurrency; use 10x normal traffic as validation assumption until real telemetry is provided',
        latency:'Search under 200ms p95, product page and cart under 300ms p95, checkout critical path under 500ms p95 where payment provider latency permits',
        sla:'99.99% for checkout/order commit; 99.9% for AI discovery and chatbot paths with graceful fallback',
        traffic:'Highly bursty campaign and flash-sale traffic with sharp spikes across catalog browse, search, promotions, cart, payment, and inventory lock paths',
        rw:'Read-heavy catalog/search/discovery workload with write-critical cart, payment, order, inventory lock, ticket, and fulfilment flows',
        data:'Product catalog, clickstream, customer profile, tokenized PII, orders, payments metadata, inventory locks, promotion decisions, support transcripts, reviews, logistics events, and audit history; exact volume must be validated'
      },
      cost:{
        compute:'Quality First',
        llm:'Balanced',
        storage:'Balanced',
        networking:'Quality First',
        monitoring:'Quality First',
        security:'Quality First',
        cicd:'Balanced',
        backup:'Quality First',
        monthly:'Enterprise budget - validate against real cloud, SaaS, marketplace, support, and partner costs',
        setup:'Enterprise programme budget - validate after discovery, migration waves, and traffic telemetry'
      },
      nfr:{
        security:'Zero-trust access, mTLS between services, WAF/rate limiting, HSM/KMS-managed encryption, field-level tokenization for phone/PII/payment-adjacent references, privileged admin controls, secrets management, and strict log redaction.',
        compliance:'India DPDP Act, PCI-DSS scope minimization, GDPR/CCPA where applicable, consumer deletion/retention workflows, support transcript governance, and privacy-by-design for personalization and chatbot context.',
        reliability:'Core checkout, payment orchestration, inventory locking, and order commit must continue through recommendation, chatbot, search replica, promotion, CRM, or logistics-provider degradation.',
        dr:'RTO/RPO must be defined per domain: checkout/order/inventory lock near-zero data loss, catalog/search rebuildable from source of truth, AI/chatbot recoverable with safe fallback.',
        consistency:'Strong consistency for stock locks, payment state, order commit, refund state, and promotion ledger. Eventual consistency acceptable for recommendations, search ranking, analytics, and non-critical personalization.',
        maintainability:'Microservice ownership, schema contracts, API versioning, release rollback, DLQ operations, runbooks, and platform SRE dashboards are mandatory before flash-sale readiness.',
        extensibility:'Support future AI styling, size guidance, conversational commerce, marketplace brand onboarding, loyalty tiers, beauty/home expansion, and regional logistics integrations.',
        vendorLockIn:'Prefer portable event contracts, replaceable search/vector/model providers, and payment-provider independence. Any AI provider choice must include fallback and data-residency/privacy review.',
        i18n:'India-first deployment with privacy/legal review for cross-border processing, support access, model telemetry, SaaS metadata, and future international expansion.',
        auditability:'Audit promotion decisions, inventory lock/release, payment state transitions, retries, fraud outcomes, chatbot escalation, profile access, tokenization, admin changes, DLQ replay, and refund/return decisions.'
      },
      team:{
        size:'Enterprise team across commerce, mobile, catalog/search, payments, inventory, fulfilment, AI/ML, data platform, security, SRE, QA, and customer support operations',
        seniority:'Senior',
        timeline:'Discovery and architecture baseline in 6-8 weeks, flash-sale hardening MVP in 16-20 weeks, phased platform modernization over 12-18 months',
        buildBuy:'Balanced',
        deploy:'Cloud-first / hybrid integrations',
        notes:'Treat this as a real-company architecture exercise based on the provided BHD and public signals. Internal Myntra traffic, topology, cloud contracts, compliance scope, and system ownership must be validated before any client-deliverable recommendation.'
      }
    }
  },
  {
    id:'localcart-commerce',
    name:'LocalCart Retail',
    tag:'Digital Commerce',
    summary:'Checkout, catalogue, payment, fraud, and order-management architecture for a growing specialty retailer.',
    state:{
      basics:{company:'LocalCart Retail',contact:'Nina Patel, Digital Commerce Lead',industry:'Specialty Retail',domain:'Digital Commerce & Checkout',problem:'Modernise the online storefront and checkout so campaign spikes do not break catalogue browsing, cart, payment, fraud checks, or order submission into OMS and store fulfilment.',stack:'Legacy Magento storefront, payment gateway, fraud SaaS, ERP catalogue feed, store stock CSV uploads, basic CDN, manual promotion rules, and no central order event stream.',constraints:'Must launch before peak season in 14 weeks. Payment data must remain with PSP. Promotions and inventory availability must be correct during campaign spikes. Store pickup promises must not oversell.'},
      scale:{usersNow:'600,000 online sessions per month',users12m:'1.8 million online sessions per month',peak:'2,800 checkout attempts per minute during campaigns',latency:'< 500ms',sla:'99.95%',traffic:'Bursty (unpredictable spikes)',rw:'80/20 reads',data:'2TB catalogue, order, customer, and session history'},
      cost:{compute:'Balanced',llm:'Minimise',storage:'Balanced',networking:'Quality First',monitoring:'Balanced',security:'Quality First',cicd:'Balanced',backup:'Balanced',monthly:'$38,000/month',setup:'$180,000 implementation budget'},
      nfr:{security:'Customer PII, payment tokens, cart state, promotion rules, and admin access require strong identity, WAF, secrets control, and audit logs.',compliance:'PCI scope must be minimized through PSP tokenisation. GDPR, CCPA, Privacy Act, and tax-region requirements apply.',reliability:'A one-hour checkout outage during campaign peaks has material revenue impact.',dr:'RTO 1 hour, RPO 15 minutes for orders and payments.',consistency:'Strong consistency for orders, payment tokens, and stock reservations. Eventual consistency acceptable for catalogue browse data.',maintainability:'Lean commerce team prefers managed services and clear rollback for releases.',extensibility:'Marketplace integration, retail media placements, and mobile app checkout are planned.',vendorLockIn:'Avoid deep lock-in to a single commerce suite where APIs and data export are weak.',i18n:'Australia and New Zealand now, US next year.',auditability:'Need audit trail for promotions, price changes, payment token flows, fraud decisions, and order state transitions.'},
      team:{size:'9 people across commerce, backend, QA, and platform',seniority:'Mixed',timeline:'14 weeks to peak season launch',buildBuy:'Balanced',deploy:'Cloud-only',notes:'The team can operate managed cloud services but cannot absorb a full replatform without phased strangler migration.'}
    }
  },
  {
    id:'storefleet-grocery',
    name:'StoreFleet Grocery',
    tag:'Fulfilment',
    summary:'Grocery replenishment, WMS integration, substitutions, click-and-collect, and delivery promise accuracy.',
    state:{
      basics:{company:'StoreFleet Grocery',contact:'Hannah Brooks, Head of Supply Chain Systems',industry:'Grocery / Supermarket',domain:'Supply Chain & Fulfilment',problem:'Improve online grocery fulfilment accuracy by connecting demand forecasts, store inventory, WMS, supplier feeds, picker apps, substitution rules, click-and-collect slots, and last-mile carrier promises.',stack:'Legacy WMS, nightly ERP replenishment batch, store handheld picking app, carrier APIs, spreadsheet substitution rules, and basic BI reporting.',constraints:'Chilled and fresh products have narrow fulfilment windows. Store substitutions need human override. Supplier feeds arrive at different cadences. Delivery promises must account for store capacity and inventory freshness.'},
      scale:{usersNow:'85 stores, 3 distribution centres, 18,000 online orders per week',users12m:'140 stores, 5 distribution centres, 55,000 online orders per week',peak:'Holiday spikes at 5x normal order volume',latency:'< 2 seconds',sla:'99.9%',traffic:'Seasonal',rw:'50/50 balanced',data:'7TB inventory, forecast, order, supplier, and fulfilment history'},
      cost:{compute:'Balanced',llm:'Minimise',storage:'Balanced',networking:'Balanced',monitoring:'Balanced',security:'Balanced',cicd:'Balanced',backup:'Quality First',monthly:'$52,000/month',setup:'$310,000 programme budget'},
      nfr:{security:'Supplier, pricing, store operations, and customer delivery data require scoped access and integration secrets management.',compliance:'Food safety, privacy, and regional data retention obligations apply.',reliability:'Fulfilment orchestration must continue through supplier feed delays, WMS outages, and carrier API degradation.',dr:'RTO 2 hours, RPO 30 minutes for order and inventory orchestration.',consistency:'Strong consistency for stock reservations and customer promises. Eventual consistency acceptable for forecast recalculation.',maintainability:'Operations teams need dashboards, exception queues, and support runbooks.',extensibility:'Future automation includes micro-fulfilment, store labour planning, and supplier ASN integration.',vendorLockIn:'Prefer portable integration contracts across WMS, OMS, and carrier providers.',i18n:'Australia now with New Zealand expansion in 18 months.',auditability:'Need audit trail for substitutions, stock reservation overrides, supplier feed failures, and delivery promise changes.'},
      team:{size:'14 people across supply chain systems, integration, store operations, and analytics',seniority:'Mid',timeline:'MVP in 18 weeks, full grocery rollout in 12 months',buildBuy:'Balanced',deploy:'Hybrid',notes:'The team understands operations but needs stronger integration observability and replay discipline.'}
    }
  },
  {
    id:'loyaltysphere-cdp',
    name:'LoyaltySphere',
    tag:'Loyalty/CDP',
    summary:'Customer 360, consent, identity resolution, segmentation, campaign activation, and deletion workflows.',
    state:{
      basics:{company:'LoyaltySphere',contact:'Maya Chen, CRM and Loyalty Director',industry:'Department Store / Big Box',domain:'Retail Data / Loyalty / Personalisation',problem:'Unify loyalty, e-commerce, POS, service, and campaign data into a governed customer 360 platform that supports consent-aware segmentation, offers, analytics, and deletion requests.',stack:'Loyalty SaaS, Salesforce Marketing Cloud, POS exports, e-commerce customer database, Snowflake analytics warehouse, SFTP partner feeds, and manual DSAR process.',constraints:'Consent must travel with every customer profile and segment. EU deletion requests must propagate across activation tools. Marketing wants near-real-time abandoned-cart and loyalty-tier campaigns without creating ungoverned shadow profiles.'},
      scale:{usersNow:'4.8 million loyalty members and 35 million customer events per month',users12m:'8 million loyalty members and 90 million customer events per month',peak:'Campaign sends to 1.2 million customers in 2 hours',latency:'< 2 seconds',sla:'99.9%',traffic:'Business hours (predictable peaks)',rw:'70/30 reads',data:'12TB customer, consent, loyalty, campaign, and transaction data'},
      cost:{compute:'Balanced',llm:'Minimise',storage:'Balanced',networking:'Minimise',monitoring:'Balanced',security:'Quality First',cicd:'Minimise',backup:'Quality First',monthly:'$44,000/month',setup:'$240,000 programme budget'},
      nfr:{security:'Customer identity, loyalty tier, campaign eligibility, and profile attributes require least-privilege access and pseudonymisation.',compliance:'GDPR, CCPA, Privacy Act, and consent obligations apply across data collection, activation, retention, and deletion.',reliability:'Campaign activation and customer profile updates must remain reliable during promotional peaks.',dr:'RTO 4 hours, RPO 1 hour for customer and consent data.',consistency:'Consent state and deletion status require strong consistency. Segment membership can be eventually consistent with clear freshness labels.',maintainability:'Marketing operations needs governed self-service without engineering changes for every segment.',extensibility:'Retail media, app push, in-store associate clienteling, and partner clean-room activation are planned.',vendorLockIn:'Avoid CDP lock-in by retaining raw and curated customer data in controlled storage with clear export paths.',i18n:'EU, US, Australia, and New Zealand customer data policies differ by region.',auditability:'Need lineage for profile merges, consent changes, segment activation, DSAR handling, and campaign decisions.'},
      team:{size:'10 people across CRM, data engineering, privacy, and marketing operations',seniority:'Mixed',timeline:'Customer 360 pilot in 12 weeks, loyalty migration in 28 weeks',buildBuy:'Balanced',deploy:'Cloud-only',notes:'The team needs privacy-by-design guardrails before marketing activation scales.'}
    }
  },
  {
    id:'retailgroup-modernisation',
    name:'RetailGroup One',
    tag:'Modernisation',
    summary:'Multi-brand retail platform modernisation across POS, OMS, ERP, WMS, payments, identity, and regional rollout.',
    state:{
      basics:{company:'RetailGroup One',contact:'Daniel Okoro, Group CIO',industry:'Franchise / Multi-store Retail',domain:'Retail Platform Modernisation',problem:'Create a target architecture and staged migration plan for a multi-brand retail group consolidating POS, OMS, ERP, WMS, identity, payments, loyalty, reporting, and integration platforms without disrupting trading.',stack:'Multiple brand-specific POS systems, SAP ERP, legacy ESB, regional WMS instances, Salesforce Service Cloud, payment gateways, Active Directory, data warehouse, and custom store reporting apps.',constraints:'No big-bang cutover. Trading cannot stop. Franchise stores need controlled autonomy. Regional data residency and payment scope differ by country. Architecture must support phased brand migration and objective acceptance gates.'},
      scale:{usersNow:'620 stores across 4 brands, 3,400 POS lanes, 11 warehouses, 9 million loyalty members',users12m:'760 stores across 5 brands, 4,200 POS lanes, 15 warehouses, 14 million loyalty members',peak:'Peak trading creates 18,000 POS transactions per minute and 6,000 order events per second',latency:'< 2 seconds',sla:'99.95%',traffic:'Seasonal',rw:'50/50 balanced',data:'110TB enterprise retail data across orders, inventory, finance, loyalty, logs, and analytics'},
      cost:{compute:'Balanced',llm:'Minimise',storage:'Balanced',networking:'Balanced',monitoring:'Quality First',security:'Quality First',cicd:'Balanced',backup:'Quality First',monthly:'$210,000/month',setup:'$2.4M transformation budget'},
      nfr:{security:'Group identity, store admin access, payment token paths, franchise data boundaries, and privileged operations require zero-trust controls and audit evidence.',compliance:'PCI-DSS, GDPR, CCPA, Privacy Act, financial controls, and regional support-access rules apply.',reliability:'Architecture must avoid outage cascades during staged brand migrations and peak trading.',dr:'RTO 1 hour for group integration and order services, RPO 15 minutes for critical transaction data.',consistency:'Strong consistency for payments, orders, stock commitments, and financial postings. Eventual consistency acceptable for analytics and some reporting.',maintainability:'Shared platform team needs standard patterns, runbooks, and clear brand onboarding playbooks.',extensibility:'Future acquisitions, new channels, retail media, and marketplace integration are expected.',vendorLockIn:'Prefer standards-based event contracts and replaceable channel systems even if a primary cloud is selected.',i18n:'Australia, New Zealand, US, UK, and EU operations with regional processing rules.',auditability:'Need migration-wave evidence, integration replay records, access logs, PCI scope evidence, and rollout acceptance results.'},
      team:{size:'45 people across enterprise architecture, platform, security, data, brand technology, and delivery partners',seniority:'Senior',timeline:'Foundation in 20 weeks, first brand migration in 9 months, group rollout over 24 months',buildBuy:'Balanced',deploy:'Hybrid',notes:'The group needs an architecture that defines ownership, acceptance criteria, and migration sequencing before tool selection.'}
    }
  }
];

export const DEFAULT_SCENARIO_ID=SCENARIO_PRESETS[0].id;

export function deepClone(value){
  return JSON.parse(JSON.stringify(value));
}

export function getScenarioPreset(id){
  return SCENARIO_PRESETS.find(item=>item.id===id)||SCENARIO_PRESETS[0];
}

export function getDefaultState(){
  return {
    step:0,
    ...deepClone(getScenarioPreset(DEFAULT_SCENARIO_ID).state)
  };
}

let ACTIVE_SCENARIO_ID=DEFAULT_SCENARIO_ID;
let S=getDefaultState();
const CLIENT_LOG_STORAGE_KEY='architectiq.client.logs.v1';
const CLIENT_LOG_LIMIT=150;
let CLIENT_LOGS=loadClientLogs();
let SERVER_LOGS=[];
let SERVER_LOG_STATE={loaded:false,loading:false,error:''};
let SERVER_CONFIG={loaded:false,loading:false,error:'',keyConfigured:null,openaiKeyConfigured:null,anthropicKeyConfigured:null,diagramsSupported:null};
let SERVER_CONFIG_PROMISE=null;
let LOG_UI={open:false,scope:'client'};
let ARCHITECTURE_UI={panel:'solution',display:'diagram'};
let PIPELINE_STAGES=[];
let PIPELINE_ACTIVE=false;
let LAST_CONTRADICTIONS=[];
let LAST_RESEARCH=null;
let LAST_PRICING_CONTEXT=null;
let LAST_VALIDATION=null;
let REVIEW_DECISION={status:'pending',note:'Not reviewed'};
let DIAGRAM_RENDER_CACHE={};
let DIAGRAM_RENDER_TOKEN=0;
let AUDIENCE_VIEW='technical';
let ACTIVE_TIER='recommended';
const PIPELINE_DEFS=[
  {id:'research',label:'Researching client & stack'},
  {id:'pricing',label:'Fetching live pricing (Azure - AWS - GCP)'},
  {id:'contradictions',label:'Validating inputs'},
  {id:'playbook',label:'Retrieving architect playbook'},
  {id:'generate',label:'Generating architecture'},
  {id:'review',label:'Running specialist review lenses'},
  {id:'validate',label:'Validating senior-architect quality'}
];

function initPipeline(){
  PIPELINE_STAGES=PIPELINE_DEFS.map(def=>({...def,status:'wait',detail:''}));
  PIPELINE_ACTIVE=true;
}

function setPipelineStage(id,status,detail=''){
  PIPELINE_STAGES=PIPELINE_STAGES.map(stage=>stage.id===id?{...stage,status,detail}:stage);
  const host=document.getElementById('pipeline-container');
  if(host) host.innerHTML=pipelineMarkup();
}

function pipelineMarkup(){
  if(!PIPELINE_ACTIVE||!PIPELINE_STAGES.length) return '';
  const icons={wait:'-',run:'...',done:'OK',warn:'!',error:'x'};
  const rows=PIPELINE_STAGES.map(stage=>{
    const cls=`pi-${stage.status}`;
    return `<div class="pipeline-stage"><div class="pipeline-icon ${cls}">${icons[stage.status]||'-'}</div><span class="pipeline-stage-label">${escapeHtml(stage.label)}</span><span class="pipeline-stage-detail">${escapeHtml(stage.detail)}</span></div>`;
  }).join('');
  return `<div class="pipeline-ui"><div class="pipeline-header">Retail architecture pipeline</div>${rows}</div>`;
}

async function callOpenAI(payload,options={}){
  const headers={'Content-Type':'application/json',...(options.headers||{})};
  const res=await fetch('/api/openai',{method:'POST',headers,body:JSON.stringify(payload)});
  let data=null;
  try{
    data=await res.json();
  }catch(err){
    throw new Error(`OpenAI proxy returned non-JSON response (${res.status}): ${err.message}`);
  }
  if(!res.ok){
    throw new Error(`OpenAI API error ${res.status}: ${data?.error?.message||JSON.stringify(data)}`);
  }
  return data;
}
const WEB_SEARCH_ENABLED=true;
const MERMAID_ARCHITECTURE_ICONS=new Set(['cloud','database','disk','internet','server']);
const MERMAID_ICON_FALLBACKS={
  queue:'server',
  storage:'disk',
  identity:'cloud',
  security:'cloud',
  observability:'cloud',
  device:'server'
};
const TIER_STACK_ITEM={type:'object',additionalProperties:false,required:['layer','rec','why','monthly_cost_est'],properties:{layer:{type:'string'},rec:{type:'string'},why:{type:'string'},monthly_cost_est:{type:'string'}}};
const TIER_BREAKDOWN={type:'object',additionalProperties:false,required:['llm_api','compute','storage','networking','tooling','observability_tooling','security','licensing_or_partner','contingency'],properties:{llm_api:{type:'string'},compute:{type:'string'},storage:{type:'string'},networking:{type:'string'},tooling:{type:'string'},observability_tooling:{type:'string'},security:{type:'string'},licensing_or_partner:{type:'string'},contingency:{type:'string'}}};
const EVIDENCE_STATUS_SCHEMA={type:'object',additionalProperties:false,required:['pricing','region_availability','model_currentness','data_residency','compliance'],properties:{pricing:{type:'string'},region_availability:{type:'string'},model_currentness:{type:'string'},data_residency:{type:'string'},compliance:{type:'string'}}};
const WORKLOAD_PRICING_ASSUMPTIONS_SCHEMA={type:'object',additionalProperties:false,required:['requests_per_day','turns_per_request','input_tokens_per_turn','output_tokens_per_turn','cache_hit_rate','model_routing_split','peak_multiplier'],properties:{requests_per_day:{type:'string'},turns_per_request:{type:'string'},input_tokens_per_turn:{type:'string'},output_tokens_per_turn:{type:'string'},cache_hit_rate:{type:'string'},model_routing_split:{type:'string'},peak_multiplier:{type:'string'}}};
const RESIDENCY_MATRIX_ITEM={type:'object',additionalProperties:false,required:['component','data_touched','region_or_residency','status','action'],properties:{component:{type:'string'},data_touched:{type:'string'},region_or_residency:{type:'string'},status:{type:'string'},action:{type:'string'}}};
const NFR_COVERAGE_ITEM={type:'object',additionalProperties:false,required:['nfr','target','mechanism','validation_needed'],properties:{nfr:{type:'string'},target:{type:'string'},mechanism:{type:'string'},validation_needed:{type:'string'}}};
export const RESPONSE_SCHEMA={
  type:'object',
  additionalProperties:false,
  required:['executive_summary','architecture_confidence','confidence_reason','assumptions','human_validation_needed','evidence_status','workload_pricing_assumptions','residency_matrix','tiers','nfr_coverage','risks','decisions','roadmap','next_steps','disclaimer'],
  properties:{
    executive_summary:{type:'string'},
    architecture_confidence:{type:'string',enum:['High','Medium','Low']},
    confidence_reason:{type:'string'},
    assumptions:{type:'array',items:{type:'string'}},
    human_validation_needed:{type:'array',items:{type:'string'}},
    evidence_status:EVIDENCE_STATUS_SCHEMA,
    workload_pricing_assumptions:WORKLOAD_PRICING_ASSUMPTIONS_SCHEMA,
    residency_matrix:{type:'array',items:RESIDENCY_MATRIX_ITEM},
    tiers:{
      type:'array',
      minItems:3,
      maxItems:3,
      items:{
        type:'object',
        additionalProperties:false,
        required:['id','label','tagline','monthly_total','budget_feasible','budget_note','stack','architecture_diagram','cost_breakdown','biggest_cost_driver'],
        properties:{
          id:{type:'string',enum:['conservative','recommended','optimised']},
          label:{type:'string'},
          tagline:{type:'string'},
          monthly_total:{type:'string'},
          budget_feasible:{type:'boolean'},
          budget_note:{type:'string'},
          stack:{type:'array',items:TIER_STACK_ITEM},
          architecture_diagram:{type:'string'},
          cost_breakdown:TIER_BREAKDOWN,
          biggest_cost_driver:{type:'string'}
        }
      }
    },
    nfr_coverage:{type:'array',items:NFR_COVERAGE_ITEM},
    risks:{
      type:'array',
      items:{
        type:'object',
        additionalProperties:false,
        required:['risk','severity','likelihood','fix'],
        properties:{risk:{type:'string'},severity:{type:'string'},likelihood:{type:'string'},fix:{type:'string'}}
      }
    },
    decisions:{
      type:'array',
      items:{
        type:'object',
        additionalProperties:false,
        required:['what','why'],
        properties:{what:{type:'string'},why:{type:'string'}}
      }
    },
    roadmap:{
      type:'array',
      items:{
        type:'object',
        additionalProperties:false,
        required:['phase','timeline','deliverables','owner','dependencies','done_when'],
        properties:{phase:{type:'string'},timeline:{type:'string'},deliverables:{type:'array',items:{type:'string'}},owner:{type:'string'},dependencies:{type:'array',items:{type:'string'}},done_when:{type:'string'}}
      }
    },
    next_steps:{type:'array',items:{type:'string'}},
    disclaimer:{type:'string'}
  }
};

export const SYSTEM_PROMPT=String.raw`# ArchitectIQ - Master System Prompt
# Version 4.0 Principal Solution Architect Review Prompt

## Role

You are ArchitectIQ Retail, operating as a principal-level retail Solution Architect and architecture review board in one system. Your work must withstand review by a retail CTO, enterprise architect, digital commerce lead, store technology lead, security architect, data architect, platform lead, finance owner, and delivery lead.

ArchitectIQ Retail focuses only on retail and retail-adjacent architecture: stores, POS, e-commerce, omnichannel inventory, loyalty/customer data, retail supply chain, fulfilment, payments, fraud, retail analytics, and retail platform modernisation. If an input is not retail-related, state that the request is outside the retail focus and either ask for the retail context or reframe only the retail-relevant parts.

You work for the retail client. You have no loyalty to any cloud, AI model, SaaS vendor, framework, diagramming convention, or consulting partner. Your only loyalty is to a defensible retail business outcome.

Your architecture must be:

- Outcome-led: technology follows the business problem.
- Constraint-correct: hard constraints are never softened for convenience.
- Evidence-aware: current facts are verified or marked as assumptions.
- Specific: recommendations name exact services/configurations only when justified.
- Comparative: credible alternatives are considered and rejected with reasons.
- Operable: the target team can run it after handover.
- Secure by design: security, privacy, auditability, and compliance appear at every relevant layer.
- Delivery-realistic: roadmap, budget, procurement, and team capacity are plausible.
- Human-reviewable: assumptions, trade-offs, risks, evidence gaps, and approval gates are visible.

Do not optimize for sounding confident. Optimize for being correct, useful, reviewable, and hard to misinterpret.

## Evidence And Currentness Contract

Treat all time-sensitive facts as untrusted until verified from live context or official provider documentation available during generation.

Time-sensitive facts include model names, model versions, retirement dates, pricing, context limits, service limits, region availability, compliance attestations, data residency, SaaS telemetry location, support access, product packaging, ERP editions, and licensing.

Rules:

1. Never write "latest" beside a static model/service name.
2. Never recommend deprecated, legacy, retired, preview-only, unavailable, or unverified services as final choices.
3. Never claim compliance, residency, or live pricing unless evidence exists in provided context or official current documentation.
4. If evidence is missing, say so in assumptions, evidence_status, residency_matrix, and human_validation_needed.
5. If official evidence conflicts with this prompt, client hard constraints still win. If no compliant option is verified, recommend a validation step or safer fallback rather than guessing.
6. Do not include markdown citations or source links inside normal architecture prose. If sources are needed, place them in evidence_status or human_validation_needed as verification notes.

## Architecture Board Quality Gate

Before finalizing, silently score the recommendation against this board. If any category would score below 8/10, revise before output.

- Business alignment: Is every major component tied to client value, risk, NFR, or constraint?
- Constraint handling: Are budget, residency, compliance, vendor exclusions, timeline, and team maturity respected?
- Currentness: Are current products/models/prices/regions verified or marked as assumptions?
- Platform choice: Were credible platform/SaaS/existing-stack alternatives compared?
- Security and compliance: Are trust boundaries, identity, encryption, logging, retention, and audit clear?
- Data architecture: Are ownership, lineage, lifecycle, quality, access, retention, and deletion handled?
- Integration architecture: Are ownership, idempotency, retries, dead letters, replay, rate limits, and reconciliation handled?
- AI production safety: Are evals, traceability, versioning, fallback, moderation/guardrails, cost controls, and human escalation handled?
- Operability: Are observability, runbooks, rollback, on-call ownership, and support model realistic?
- Cost realism: Are price ranges honest and tied to explicit usage assumptions?
- Delivery realism: Is the roadmap achievable with the stated team and timeline?
- Diagram value: Does the diagram show flows, boundaries, data stores, actors, and failure/fallback paths?
- Human approval: Can a human architect approve/reject the output from the evidence shown?

## Mandatory Constraint Gate

Apply this gate before choosing technology.

### C1. Hard constraints

Client hard constraints override convenience, popularity, and vendor preference. Vendor exclusions, data residency, sovereignty, compliance, security policy, procurement policy, hard budget, and hard timeline must be explicitly reflected in the design.

### C2. Data residency is end-to-end

Residency is not proven by putting compute in a local cloud region. Validate every data-touching path:

- Application data
- Backups and snapshots
- Object storage
- Prompt payloads and completions
- Embeddings and vector stores
- Moderation payloads
- Model/provider telemetry
- Logs, metrics, traces, eval datasets, prompt traces, and audit exports
- CDN/edge processing and edge logs
- SaaS metadata and admin data
- Support access, debugging bundles, and incident exports
- CRM, ERP, helpdesk, observability, analytics, and ticketing integrations

If a component cannot meet residency, choose one of: self-host in-region, use a region-compliant alternative, redact/minimize payloads, remove it from the critical path, or mark it as a human validation blocker.

### C3. Budget feasibility

budget_feasible is true only when the realistic operating range fits the stated budget. If the upper bound exceeds a hard budget, say conditionally feasible or false. Do not hide upper-bound risk.

### C4. Optional retail AI fallback and lock-in

If retail AI, personalization, recommendations, forecasting, or automated decisioning is explicitly in scope and the client requires vendor diversity or cross-provider resilience, same-cloud/same-vendor fallback is insufficient. If strict residency prevents verified cross-vendor fallback, state the conflict and present options: accept same-region same-vendor fallback, approve a verified cross-vendor in-region option, or narrow the requirement.

### C5. Retail process orchestration

Separate retail business orchestration from infrastructure workflow plumbing. POS, OMS, WMS, fulfilment, customer profile, payment-token, and inventory processes need explicit ownership, idempotency, retries, dead letters, reconciliation, and human exception handling.

### C6. Domain relevance

Apply only retail playbooks and retail-adjacent integration rules. If an input is not retail-related, state that ArchitectIQ Retail needs a retail context before generating an architecture.

## Principal Architect Reasoning Process

Expose concise rationale, not private chain-of-thought.

1. Frame the business problem and cost of inaction.
2. Reconstruct current state from inputs and research.
3. Separate facts from assumptions.
4. Identify hard constraints and NFRs.
5. Identify core workloads and data domains.
6. Compare platform, build/buy, data, integration, AI, security, and delivery options.
7. Select the simplest architecture that satisfies constraints with room to grow.
8. Name rejected alternatives and accepted risks.
9. Validate cost, delivery, operations, security, data residency, and compliance.
10. Produce an approval-ready architecture pack.

## Architecture Layers To Cover

Cover relevant layers explicitly:

1. Users, actors, channels, and external systems
2. Edge, ingress, and traffic controls
3. Identity, authorization, and privileged access
4. Network zones, trust boundaries, and egress controls
5. Application/runtime services
6. AI/model/orchestration layer when relevant
7. Data stores, object stores, vector/search, analytics, and audit stores
8. Integration, messaging, APIs, queues, retries, and replay
9. Security controls and compliance evidence
10. Observability, telemetry, audit, and incident response
11. CI/CD, release strategy, rollback, and environment separation
12. DR, backup, restore, and business continuity
13. Delivery roadmap, ownership, and human approval gates

## Domain Playbooks

### Retail, Omnichannel, Store Execution, And Commerce

Apply whenever the client is a retailer, marketplace, e-commerce business, store operator, franchise network, or retail group, regardless of company size.

First classify the retail workload:

- Store execution and omnichannel inventory: POS, store associate apps, store edge, offline checkout, inventory availability, click-and-collect, order routing, ERP/POS/OMS/WMS integration.
- Digital commerce: storefront, catalogue, search, cart, checkout, promotions, CDN/WAF, payment provider, loyalty, campaign peaks, fraud, fulfilment promises.
- Retail data and loyalty: customer 360, CDP, identity resolution, consent, segmentation, recommendations, campaign activation, analytics, data products.
- Supply chain and fulfilment: WMS, TMS, replenishment, demand forecasting, supplier integration, distribution centres, store replenishment, delivery orchestration.
- Retail security and compliance: PCI-DSS scope, PII/loyalty privacy, consent, tokenisation, fraud controls, device trust, store network segmentation, support access, audit evidence.

Required for retail outputs:

- Identify systems of record for product, price, promotion, basket/cart, order, payment token, customer/loyalty, inventory, reservation, fulfilment, returns, and audit.
- Separate channel reads from transaction writes so campaign traffic cannot break checkout, POS, or inventory commit paths.
- Define POS/e-commerce/ERP/OMS/WMS integration ownership, idempotency keys, retry policy, dead letters, replay, reconciliation, duplicate handling, and manual correction.
- If stores, POS, or offline trading are involved, define local autonomy, edge appliance HA/failure behavior, offline payment mode boundaries, queue durability, ordering, replay/idempotency, conflict policy, and reconnect acceptance tests.
- If payments are involved, keep raw PAN/SAD out of internal systems unless explicitly in PCI scope; define payment-provider/P2PE/tokenization boundary, network segmentation, logging controls, and QSA/human validation.
- If customer or loyalty data is involved, define encryption first: data classification, encryption in transit, encryption at rest, key ownership/rotation, secrets handling, log redaction, consent, tokenisation/pseudonymisation, retention, deletion, DSAR/erasure handling, regional data ownership, support access, and analytics minimisation.
- If global or multi-brand retail is involved, define regional/residency matrix for customer data, logs, telemetry, backups, support bundles, token vault metadata, and third-party SaaS processors.
- Roadmap must include pilot wave criteria, store/channel rollout gates, rollback triggers, operational owners, runbooks, game days, and measurable acceptance tests.

Never treat a retail store-edge or offline checkout architecture as an AI architecture unless AI/LLM/model functionality is explicitly in scope. If retail AI is in scope, still anchor the design in retail processes, data ownership, safety, consent, auditability, model fallback, and human review.

## Cost And Tiering Rules

Generate three tiers:

- Conservative: lowest production-safe path for current demand and near-term headroom.
- Recommended: production-grade target for stated 12-month scale and NFRs.
- Optimised: cost-engineered production design using right-sizing, commitments, caching, storage tiering, workload routing, and operational simplification.

Rules:

- State pricing basis: verified, partial, or assumption.
- Use explicit workload assumptions for LLM/API costs: requests/day, turns/request, input/output tokens, cache hit rate, model routing split, and peak multiplier where possible.
- If those assumptions are missing, create reasonable assumptions and mark them for validation.
- Break down compute, LLM/API, storage, networking, observability/tooling, security, licensing, partner/implementation, and contingency where relevant.
- For FinOps, identify unit drivers and levers: requests, transactions, data volume, egress, IOPS, queue throughput, log/trace retention, non-prod parity, reserved/committed spend, autoscaling limits, SaaS licensing, support plan, and contingency.
- Do not call a tier selected/recommended if it exceeds hard budget without a mitigation plan.
- Optimised may be cheaper than recommended only through credible commitments or engineering controls, not by silently reducing required capability.

## Scaling And Security Detail Rules

- Scaling must be described mechanically: autoscaling signal, queue lag SLO, connection pooling, cache hit target, backpressure, rate limit, quota, load-test scenario, degraded mode, and first expected bottleneck.
- Security must start with encryption and key management before tokenisation/masking: TLS 1.2+ or SSH equivalent in transit, KMS/HSM/CMEK/CSEK at rest, field/app-layer encryption for highly sensitive data, secret manager for credentials, key rotation owner, and logging exclusions.
- Sensitive-data claims should use annotation-style codes where useful: A1 secret-manager credentials, A2 system-to-system encrypted credentials, CA1 strong user auth/MFA, CA2 username/password, R2/R3 encryption at rest, T encryption in transit, C3/C5 data class, C5E app/PGP encryption, and trust-boundary/security-boundary evidence.

## Diagram Rules

Diagrams must help humans reason. They should show:

- Actors and channels
- Internal/external systems
- Regional/residency boundary where relevant
- Trust boundaries
- Runtime services
- Data stores
- Integration flows
- AI/model path
- Audit/logging path
- Human escalation path
- Fallback/degraded paths
- Critical ownership boundaries
- Security annotations for auth, encryption, data classification, external security boundary, and trust boundary.
- Network/provider legend for cloud, on-prem, SaaS, and third-party systems.
- Component-status legend for existing, updated, new, and supported-but-out-of-scope components.

Avoid diagrams that are only service inventories.

## Output Contract

Return only a raw JSON object. No markdown fences. No preamble. No text outside JSON.

Required top-level fields:

{
  "executive_summary": "3 concise sentences: business outcome, recommended architecture posture, biggest constraint/risk.",
  "architecture_confidence": "High | Medium | Low",
  "confidence_reason": "Why confidence is not higher, naming missing evidence.",
  "assumptions": ["Specific assumption requiring validation"],
  "human_validation_needed": ["Specific item a human Solution Architect must verify or approve"],
  "evidence_status": {
    "pricing": "verified | partial | assumption",
    "region_availability": "verified | partial | assumption",
    "model_currentness": "verified | partial | assumption",
    "data_residency": "verified | partial | assumption",
    "compliance": "verified | partial | assumption"
  },
  "workload_pricing_assumptions": {
    "requests_per_day": "number or assumption",
    "turns_per_request": "number or assumption",
    "input_tokens_per_turn": "number or assumption",
    "output_tokens_per_turn": "number or assumption",
    "cache_hit_rate": "percentage or assumption",
    "model_routing_split": "percentage by model/provider or assumption",
    "peak_multiplier": "number or assumption"
  },
  "residency_matrix": [
    {
      "component": "Service/vendor/tool",
      "data_touched": "Data category",
      "region_or_residency": "Verified region or assumption",
      "status": "compliant | conditionally compliant | not compliant | unknown",
      "action": "use | replace | self-host | redact | validate | remove"
    }
  ],
  "tiers": [
    {
      "id": "conservative | recommended | optimised",
      "label": "Conservative | Recommended | Optimised",
      "tagline": "One-sentence posture",
      "monthly_total": "$X,XXX-$Y,YYY/month",
      "budget_feasible": true,
      "budget_note": "Honest note including upper-bound risk",
      "stack": [
        {
          "layer": "Layer name",
          "rec": "Exact product/configuration or assumption requiring validation",
          "why": "Client-specific rationale plus rejected alternative",
          "monthly_cost_est": "$X-Y/month or assumption"
        }
      ],
      "architecture_diagram": "Valid Mermaid architecture-beta code. Must start with architecture-beta.",
      "cost_breakdown": {
        "llm_api": "$X/month",
        "compute": "$X/month",
        "storage": "$X/month",
        "networking": "$X/month",
        "observability_tooling": "$X/month",
        "security": "$X/month",
        "licensing_or_partner": "$X/month if relevant",
        "contingency": "$X/month if relevant"
      },
      "biggest_cost_driver": "One sentence with guardrail"
    }
  ],
  "nfr_coverage": [
    {
      "nfr": "Availability | Latency | RTO/RPO | Scalability | Security | Compliance | Cost | Operability | DR",
      "target": "Specific target or assumption",
      "mechanism": "How the design satisfies it",
      "validation_needed": "What must be verified"
    }
  ],
  "decisions": [
    {
      "what": "Chosen option and rejected alternative",
      "why": "Client-specific rationale, accepted risk, and mitigation"
    }
  ],
  "risks": [
    {
      "risk": "Client-specific risk",
      "severity": "High | Medium | Low",
      "likelihood": "High | Medium | Low",
      "fix": "Specific mitigation with owner, tool, threshold, runbook, or decision gate"
    }
  ],
  "roadmap": [
    {
      "phase": "Phase name",
      "timeline": "Scaled to client timeline",
      "deliverables": ["Specific deliverable"],
      "owner": "Role responsible",
      "dependencies": ["Dependency"],
      "done_when": "Verifiable definition of done"
    }
  ],
  "next_steps": ["Specific action - owner - deadline"],
  "disclaimer": "This recommendation is a starting point for human Solution Architect review and implementation validation. ArchitectIQ accepts no liability for implementation decisions made without professional review."
}

## Final Self-Review Before Output

Revise before final output if any of these are true:

- A tool or model is named without currentness evidence or assumption marking.
- Residency is claimed without a matrix.
- Live pricing is claimed without service-level pricing.
- Budget feasibility ignores upper-bound risk.
- AI tracing/eval tooling violates residency or is mandatory by vendor name.
- Cross-vendor fallback conflicts with residency and the conflict is hidden.
- Salesforce/CRM/ERP integration lacks system-of-record ownership.
- NFRs are generic.
- Risks could apply to any company.
- Diagram is only a service list.
- Team cannot operate the proposed stack.
- Human architect approval needs are unclear.`;
// -- Solution Architect Thinking Playbook ---
// Derived from transcript analysis as original principles, not stored transcripts.
// These rules are retrieved by scenario context and injected into generation and validation.
const ARCHITECT_THINKING_PLAYBOOK=[
  {id:'business-outcome-first',keywords:['all'],principle:'Start from the business outcome before selecting technology.',trigger:'Any scenario with an unclear or broad problem statement.',architect_question:'What measurable business outcome must this architecture improve, and what happens if it fails?',validation_rule:'Every major component must trace to a business requirement, NFR, risk, or constraint.',risk_if_ignored:'The design may optimise for tools instead of client value.'},
  {id:'nfr-first-class',keywords:['all'],principle:'Treat non-functional requirements as design constraints, not post-design checks.',trigger:'Any scenario with uptime, latency, RTO/RPO, compliance, scale, or budget constraints.',architect_question:'Which NFRs are hard constraints, and which are negotiable trade-offs?',validation_rule:'Availability, scalability, security, DR, cost, and compliance must have mechanisms and failure consequences.',risk_if_ignored:'The recommendation can look complete but fail in production or review.'},
  {id:'finops-unit-economics',keywords:['cost','budget','finops','pricing','monthly','reserved','savings','cloud spend','egress','iops','observability','license','licensing'],principle:'FinOps starts with workload drivers, unit economics, and cost controls, not only a monthly total.',trigger:'Any architecture with a budget, cloud services, SaaS, large data volume, or enterprise scale.',architect_question:'Which usage drivers, pricing SKUs, non-prod environments, support fees, egress, IOPS, log retention, and committed-spend assumptions drive the bill?',validation_rule:'Recommendation must name biggest cost drivers, right-sizing or commitment levers, observability/retention controls, non-prod parity assumptions, and FinOps owner validation.',risk_if_ignored:'The design may be architecturally sound but financially indefensible.'},
  {id:'scaling-mechanics',keywords:['scale','scaling','autoscale','peak','rps','transactions','concurrency','throughput','latency','queue','cache','consumer lag','burst','black friday','campaign'],principle:'Scalability is proven through bottleneck mechanics, backpressure, load tests, and degradation policy.',trigger:'Any scenario with peak traffic, high concurrency, event processing, low latency, or fast growth.',architect_question:'Where does the system bottleneck first, and what happens when read traffic, writes, queues, database connections, or downstream dependencies saturate?',validation_rule:'Recommendation must state autoscaling signals, quotas, connection pooling, cache strategy, backpressure, queue lag SLOs, peak test criteria, and degraded-mode behavior.',risk_if_ignored:'The architecture may say it scales but still collapse under real traffic shape.'},
  {id:'tradeoff-explicit',keywords:['all'],principle:'State alternatives, rejected options, accepted risks, and mitigations for every significant decision.',trigger:'Any recommendation that selects a cloud, database, integration pattern, security model, or delivery sequence.',architect_question:'What credible alternative was rejected, and what risk are we accepting by choosing this option?',validation_rule:'Decision rationale must include at least four explicit trade-offs tied to client constraints.',risk_if_ignored:'The output feels generic and cannot be defended by a senior architect.'},
  {id:'operability-handover',keywords:['all'],principle:'Design for the team that will operate the solution after handover.',trigger:'Any scenario with limited team size, junior engineers, tight timelines, or no dedicated platform team.',architect_question:'Can this team run, troubleshoot, secure, and evolve the architecture without heroic support?',validation_rule:'Roadmap must include observability, rollback, runbooks, ownership, and knowledge-transfer deliverables.',risk_if_ignored:'The design may be technically correct but operationally unrealistic.'},
  {id:'security-cross-cutting',keywords:['security','compliance','pii','phi','payment','fintech','health','government','audit','privacy','identity','mfa','sso'],principle:'Security is embedded across edge, network, application, data, integration, and operations layers.',trigger:'Sensitive data, regulated industries, identity systems, payment flows, health records, or audit-heavy operations.',architect_question:'Where can data, identity, credentials, or privileged access fail across each layer?',validation_rule:'Security controls must be named at each relevant layer with auditability and ownership.',risk_if_ignored:'Security becomes a generic checklist instead of a defensible architecture posture.'},
  {id:'encryption-before-tokenization',keywords:['pii','phi','payment','token','tokenization','tokenisation','masking','privacy','customer','loyalty','card','pan','sad','secret','kms','hsm','encryption'],principle:'Tokenization and masking do not replace encryption; encryption must be explicit at rest, in transit, key ownership, and application/field layer where data class requires it.',trigger:'Any sensitive data, credentials, payment-adjacent data, PII/PHI, support transcript, customer profile, audit log, or regulated workflow.',architect_question:'Which data is encrypted at rest, in transit, at field/application layer, who owns keys, how are secrets stored, and where are trust boundaries?',validation_rule:'Recommendation and diagrams must show TLS/SSH in transit, KMS/HSM/CMEK/CSEK at rest, secret-manager use, key rotation ownership, data class, tokenization/masking as additional controls, and log redaction.',risk_if_ignored:'The design can claim privacy controls while leaving the primary confidentiality control ambiguous.'},
  {id:'retail-domain-classification',keywords:['retail','e-commerce','ecommerce','commerce','store','stores','pos','checkout','catalogue','catalog','cart','promotion','loyalty','customer profile','inventory','warehouse','fulfilment','fulfillment','click and collect','marketplace'],principle:'Retail architecture starts by classifying the workload: store execution, digital commerce, loyalty/data, supply chain/fulfilment, or retail security/compliance.',trigger:'Any retailer, marketplace, store operator, franchise network, retail group, commerce platform, or customer/loyalty retail workload.',architect_question:'Which retail business capability is being changed, and which systems of record own product, price, promotion, order, payment token, customer, inventory, fulfilment, returns, and audit?',validation_rule:'Recommendation must name retail workload type, systems of record, channel boundaries, data ownership, integration contracts, and rollout/operability assumptions.',risk_if_ignored:'The output may look technically plausible but miss the retail process that actually drives value and risk.'},
  {id:'retail-store-edge-continuity',keywords:['store edge','offline checkout','offline trading','pos','point of sale','store associate','edge node','wan outage','internet dropout','local queue','queue replay','checkout continuity','ups','store appliance','barcode','cash register'],principle:'Store execution architecture must prove local trading continuity without weakening payment, identity, inventory, or audit controls.',trigger:'Stores, POS, offline trading, local edge appliances, associate apps, queue replay, or store network outage requirements.',architect_question:'What keeps checkout safe and auditable when WAN, power, identity, payment, or central inventory paths are degraded?',validation_rule:'Require edge HA/failure behavior, offline auth and payment boundaries, encrypted durable queues, ordering/idempotency, replay tests, conflict policy, reconnect criteria, field runbooks, and pilot acceptance gates.',risk_if_ignored:'Stores may keep trading but later create oversell, payment, privacy, audit, or reconciliation failures.'},
  {id:'retail-commerce-platform',keywords:['storefront','checkout','cart','catalogue','catalog','search','cdn','waf','promotion','campaign','black friday','peak trading','payment provider','fraud','order management','oms'],principle:'Retail commerce platforms must isolate customer-facing read traffic from critical checkout, order, payment, and inventory commit paths.',trigger:'E-commerce modernization, checkout, catalogue/search, campaign traffic, payment flow, fraud, promotions, or online order management.',architect_question:'Which traffic spike or dependency failure can stop customers from browsing, checking out, or receiving accurate fulfilment promises?',validation_rule:'Require CDN/WAF, catalogue/search strategy, cart/session handling, payment-provider boundary, fraud controls, promotion correctness, inventory availability freshness, peak testing, and graceful degradation.',risk_if_ignored:'Campaign peaks or catalogue/search failures can cascade into checkout and inventory accuracy incidents.'},
  {id:'retail-data-loyalty-governance',keywords:['loyalty','customer 360','customer data platform','cdp','personalisation','personalization','recommendation','segmentation','consent','identity resolution','campaign','analytics','profile'],principle:'Retail customer data and loyalty architectures must make consent, identity resolution, minimisation, activation, retention, deletion, and analytics ownership explicit.',trigger:'Loyalty, customer 360, CDP, personalisation, recommendations, campaign activation, segmentation, or analytics platforms.',architect_question:'Which customer identifiers, consent states, and derived segments are allowed to move into each activation channel and region?',validation_rule:'Require consent model, identity graph ownership, tokenisation/pseudonymisation, DSAR/erasure handling, retention, regional processing, lineage, campaign audit, and model/segment governance.',risk_if_ignored:'The retailer may create privacy exposure, ungoverned customer profiles, or campaign decisions that cannot be explained or deleted.'},
  {id:'retail-supply-chain-fulfilment',keywords:['wms','tms','warehouse','distribution centre','distribution center','fulfilment','fulfillment','replenishment','demand forecast','supplier','last mile','delivery','pick pack','ship from store','click and collect'],principle:'Retail supply chain architecture must connect demand, inventory, fulfilment promises, warehouse/store operations, and exception handling.',trigger:'WMS/TMS, replenishment, demand forecasting, supplier integration, distribution centres, delivery orchestration, click-and-collect, or ship-from-store.',architect_question:'How do inventory signals, fulfilment capacity, supplier constraints, and customer promises stay consistent during exceptions?',validation_rule:'Require inventory/fufilment ownership, reservation rules, exception queues, supplier/warehouse APIs, latency and batch boundaries, forecast feedback, manual overrides, and operations dashboards.',risk_if_ignored:'The design can improve one channel while making replenishment, substitutions, delivery promises, or stock accuracy worse.'},
  {id:'ai-production-safety',keywords:['ai','agent','agentic','llm','rag','copilot','model','prompt','vector','generation'],principle:'Production AI architecture must include traceability, fallback, cost control, moderation, and human escalation.',trigger:'AI agents, copilots, RAG, video generation, or model-based customer workflows.',architect_question:'How are model failures, unsafe outputs, token-cost spikes, and provider outages handled?',validation_rule:'Require tracing, evaluation, audit logs, token monitoring, model fallback, safety controls, and human handoff.',risk_if_ignored:'The AI system may be impressive in demo but unsafe, expensive, or unreliable in production.'},
  {id:'migration-dependency-map',keywords:['migration','legacy','erp','oracle','windows','vmware','hybrid','on-prem','active directory','sql server','citrix','ldap'],principle:'Migration design starts with dependency mapping, cutover risk, rollback, and business continuity.',trigger:'ERP replacement, legacy modernization, hybrid migration, server inventory, or on-prem to cloud transition.',architect_question:'Which systems, identities, integrations, data stores, and users break if this workload moves?',validation_rule:'Require phased waves, dependency discovery, rollback plan, DR validation, data migration controls, and support model.',risk_if_ignored:'The migration plan can cause outages even if the target architecture is sound.'},
  {id:'data-lifecycle-governance',keywords:['data','analytics','warehouse','pipeline','streaming','reporting','governance','retention','bigquery','snowflake','postgres','database'],principle:'Data architecture must cover lifecycle, ownership, quality, lineage, retention, access, and downstream consumption.',trigger:'Data platforms, reporting, analytics, AI pipelines, event streams, or integration-heavy systems.',architect_question:'Who owns each data product, how is quality proven, and how is data retained or deleted?',validation_rule:'Include data model, flow, storage, pipeline reliability, lineage, retention, privacy, and access controls.',risk_if_ignored:'The solution may move data successfully but fail governance, reporting, or AI reliability needs.'},
  {id:'delivery-governance',keywords:['timeline','budget','deadline','delivery','roadmap','fixed budget','hard deadline','mvp','weeks','months'],principle:'Architecture recommendations must be deliverable within the client timeline, budget, procurement path, and team capability.',trigger:'Fixed budgets, hard deadlines, MVPs, procurement constraints, or small teams.',architect_question:'What must be deferred, bought, simplified, or partner-led to make delivery realistic?',validation_rule:'Roadmap must identify dependencies, owners, definitions of done, and sequencing that reduces delivery risk.',risk_if_ignored:'A good target state may become an impossible project.'}
];

function getPlaybookText(state){
  const b=state?.basics||{};
  const sc=state?.scale||{};
  const c=state?.cost||{};
  const n=state?.nfr||{};
  const t=state?.team||{};
  return `${b.company||''} ${b.industry||''} ${b.domain||''} ${b.problem||''} ${b.stack||''} ${b.constraints||''} ${sc.usersNow||''} ${sc.users12m||''} ${sc.peak||''} ${sc.latency||''} ${sc.sla||''} ${sc.data||''} ${c.monthly||''} ${c.setup||''} ${Object.values(n).join(' ')} ${t.size||''} ${t.seniority||''} ${t.timeline||''} ${t.buildBuy||''} ${t.deploy||''} ${t.notes||''}`.toLowerCase();
}

function keywordMatchesArchitectPlaybook(haystack,keyword){
  const normalized=String(keyword||'').toLowerCase().trim();
  if(!normalized) return false;
  const escaped=normalized.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  if(normalized.length<=4 || /^[a-z0-9]+$/.test(normalized)){
    return new RegExp('(^|[^a-z0-9])'+escaped+'([^a-z0-9]|$)').test(haystack);
  }
  return haystack.includes(normalized);
}


function hasRetailSignals(text){
  return /\b(retail|e-?commerce|commerce|store|stores|pos|point\s+of\s+sale|checkout|cart|catalogue|catalog|promotion|loyalty|inventory|warehouse|wms|oms|fulfilment|fulfillment|click\s+and\s+collect|marketplace|payment|pci|customer\s+profile|store\s+associate|store\s+edge)\b/i.test(String(text||''));
}

function hasRetailStoreEdgeSignals(text){
  return /\b(pos|point\s+of\s+sale|store\s+edge|offline\s+(checkout|trading|mode)|checkout\s+continuity|wan\s+outage|internet\s+dropout|local\s+queue|queue\s+replay|edge\s+(node|appliance)|store\s+appliance|cash\s+register|associate\s+mobile|ups|p2pe)\b/i.test(String(text||''));
}

function hasRetailCommerceSignals(text){
  return /\b(e-?commerce|storefront|cart|checkout|catalogue|catalog|search|promotion|campaign|black\s+friday|payment\s+provider|fraud|oms|order\s+management|cdn|waf)\b/i.test(String(text||''));
}

function hasRetailDataSignals(text){
  return /\b(loyalty|customer\s+360|customer\s+data\s+platform|cdp|personalisation|personalization|recommendation|segmentation|consent|identity\s+resolution|campaign|analytics|profile)\b/i.test(String(text||''));
}

function hasRetailSupplyChainSignals(text){
  return /\b(wms|tms|warehouse|distribution\s+cent(re|er)|fulfilment|fulfillment|replenishment|demand\s+forecast|supplier|last\s+mile|delivery|pick\s+pack|ship\s+from\s+store|click\s+and\s+collect)\b/i.test(String(text||''));
}

function hasRetailAiSignals(text){
  return /\b(ai|artificial intelligence|agentic|ai agent|copilot|chatbot|llm|rag|prompt|embedding|vector store|model inference|recommendation model|forecast model|generative ai|langgraph|langchain|crewai|bedrock|openai|claude|gemini|mistral)\b/i.test(String(text||''));
}

function selectArchitectThinkingRules(state,limit=8){
  const haystack=getPlaybookText(state);
  const scored=ARCHITECT_THINKING_PLAYBOOK.map((rule,index)=>{
    const keywords=rule.keywords||[];
    const base=keywords.includes('all')?4:0;
    const hits=keywords.filter(k=>k!=='all'&&keywordMatchesArchitectPlaybook(haystack,k)).length;
    if(rule.id==='retail-store-edge-continuity'&&!hasRetailStoreEdgeSignals(haystack)){
      return {...rule,_score:0,_index:index};
    }
    if(rule.id==='retail-commerce-platform'&&!hasRetailCommerceSignals(haystack)){
      return {...rule,_score:0,_index:index};
    }
    if(rule.id==='retail-data-loyalty-governance'&&!hasRetailDataSignals(haystack)){
      return {...rule,_score:0,_index:index};
    }
    if(rule.id==='retail-supply-chain-fulfilment'&&!hasRetailSupplyChainSignals(haystack)){
      return {...rule,_score:0,_index:index};
    }
    return {...rule,_score:base+hits*3,_index:index};
  }).filter(rule=>rule._score>0);
  return scored.sort((a,b)=>b._score-a._score||a._index-b._index).slice(0,limit);
}

function buildArchitectThinkingPlaybookBlock(state){
  const rules=selectArchitectThinkingRules(state);
  if(!rules.length) return '';
  return `
SOLUTION ARCHITECT THINKING PLAYBOOK - DERIVED ORIGINAL RULES, NOT TRANSCRIPTS:
Apply these retrieved rules while generating this recommendation. Use them as reasoning constraints and reflect them in decisions, risks, roadmap, and validation language.
${rules.map((rule,i)=>`${i+1}. ${rule.principle}
   Trigger: ${rule.trigger}
   Architect question: ${rule.architect_question}
   Validation rule: ${rule.validation_rule}
   Risk if ignored: ${rule.risk_if_ignored}`).join('\n')}

MULTI-AGENT REVIEW LENSES TO SIMULATE BEFORE FINAL OUTPUT:
- Lead Solution Architect: end-to-end coherence, trade-offs, and client-ready recommendation.
- Security: identity, data protection, compliance, auditability, threat boundaries.
- Cloud/Infrastructure: network, compute, storage, resilience, regional fit, cloud choice.
- Data: data model, flow, ownership, quality, retention, analytics/AI readiness.
- DevOps/Platform: CI/CD, observability, rollback, runbooks, supportability.
- QA/NFR: performance, availability, DR, testability, acceptance criteria.
- Delivery/Governance: roadmap, dependencies, budget, procurement, team capability.
- Stakeholder: executive clarity, measurable business value, decision readiness.

HUMAN SOLUTION ARCHITECT APPROVAL EXPECTATION:
The output should make assumptions, risks, missing information, trade-offs, and confidence visible enough that a human Solution Architect can approve, revise, or reject it.
`;
}
const ARCHITECT_REVIEW_LENSES=[
  {name:'Lead Solution Architect',focus:'End-to-end coherence, trade-offs, client-ready recommendation'},
  {name:'Security',focus:'Identity, data protection, compliance, auditability, threat boundaries'},
  {name:'Cloud / Infrastructure',focus:'Network, compute, storage, resilience, regional fit, cloud choice'},
  {name:'Data',focus:'Data model, flow, ownership, quality, retention, AI readiness'},
  {name:'DevOps / Platform',focus:'CI/CD, observability, rollback, runbooks, supportability'},
  {name:'QA / NFR',focus:'Performance, availability, DR, testability, acceptance criteria'},
  {name:'Delivery / Governance',focus:'Roadmap, dependencies, budget, procurement, team capability'},
  {name:'Stakeholder',focus:'Executive clarity, measurable business value, decision readiness'}
];

function ruleDisplayName(rule){
  return String(rule?.id||'').split('-').filter(Boolean).map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join(' ')||'Architecture rule';
}

function statusFromValidation(validation){
  const verdict=validation?.verdict||'pending';
  if(verdict==='pass') return {label:'Pass',cls:'pass'};
  if(verdict==='fail') return {label:'Fail',cls:'fail'};
  if(verdict==='warn') return {label:'Warn',cls:'warn'};
  return {label:'Pending',cls:'pending'};
}

function humanReviewFocusItems(state,rules){
  const focus=['Cost assumptions','Compliance / regulatory fit','Cloud choice','Delivery feasibility'];
  const text=getPlaybookText(state);
  if(hasRetailSignals(text)) focus.push('Retail systems of record and rollout gates');
  if(hasRetailStoreEdgeSignals(text)) focus.push('Store-edge continuity and replay evidence');
  if(/pci|payment|pos|p2pe/i.test(text)) focus.push('PCI segmentation and payment scope');
  if(hasRetailAiSignals(text)) focus.push('Retail AI safety and model fallback');
  if((rules||[]).some(r=>r.id==='migration-dependency-map')) focus.push('Migration dependencies and rollback');
  return [...new Set(focus)].slice(0,6);
}

function buildArchitectureIntelligenceCard(state,validation){
  const rules=selectArchitectThinkingRules(state,6);
  const status=statusFromValidation(validation);
  const warnings=(validation?.warnings||[]).length;
  const violations=(validation?.constraint_violations||[]).length;
  const improvements=(validation?.improvements||[]).length;
  const ruleCards=rules.map(rule=>`<div class="intel-rule"><div class="intel-rule-top"><span class="intel-rule-name">${escapeHtml(ruleDisplayName(rule))}</span><span class="intel-rule-id">${escapeHtml(rule.id)}</span></div><div class="intel-rule-principle">${escapeHtml(rule.principle)}</div><div class="intel-rule-question">${escapeHtml(rule.architect_question)}</div></div>`).join('');
  const lenses=ARCHITECT_REVIEW_LENSES.map(lens=>`<div class="intel-lens"><span>${escapeHtml(lens.name)}</span><small>${escapeHtml(lens.focus)}</small></div>`).join('');
  const focusItems=humanReviewFocusItems(state,rules).map(item=>`<span>${escapeHtml(item)}</span>`).join('');
  return `<div class="intelligence-card"><div class="intelligence-head"><div><div class="intelligence-kicker">Architecture Intelligence</div><div class="intelligence-title">Retrieved playbook, specialist lenses, and human approval pack</div></div><span class="intel-status intel-${status.cls}">${status.label}</span></div><div class="intel-metrics"><div><strong>${rules.length}</strong><span>Playbook rules</span></div><div><strong>${ARCHITECT_REVIEW_LENSES.length}</strong><span>Review lenses</span></div><div><strong>${violations}</strong><span>Violations</span></div><div><strong>${warnings+improvements}</strong><span>Review notes</span></div></div><div class="intel-section-title">Applied playbook rules</div><div class="intel-rule-grid">${ruleCards}</div><div class="intel-section-title">Specialist review lenses</div><div class="intel-lens-grid">${lenses}</div><div class="human-approval"><div><div class="human-approval-label">Human Solution Architect approval</div><div class="human-approval-copy">Pending human review before client delivery. The AI output exposes assumptions, risks, trade-offs, validation notes, and decision rationale for approval or revision.</div></div><div class="human-focus-list">${focusItems}</div></div></div>`;
}

function retailWorkloadProfile(state){
  const text=getPlaybookText(state);
  const domain=String(state?.basics?.domain||'').toLowerCase();
  const segments=[];
  if(hasRetailStoreEdgeSignals(text)) segments.push('Store execution / omnichannel inventory');
  if(hasRetailCommerceSignals(text)) segments.push('Digital commerce / checkout');
  if(hasRetailSupplyChainSignals(text)) segments.push('Supply chain / fulfilment');
  if(hasRetailDataSignals(text)) segments.push('Retail data / loyalty');
  if(/payment|pci|p2pe|psp|fraud/i.test(text)) segments.push('Retail payments / PCI');
  if(/moderni[sz]ation|migration|multi-brand|franchise|legacy|erp|esb/i.test(text)) segments.push('Platform modernisation');
  if(hasRetailAiSignals(text)) segments.push('Retail AI / automated decisioning');
  const primary=domain.includes('store')?'Store execution / omnichannel inventory'
    :domain.includes('commerce')?'Digital commerce / checkout'
    :domain.includes('supply')||domain.includes('fulfil')?'Supply chain / fulfilment'
    :domain.includes('loyalty')||domain.includes('data')?'Retail data / loyalty'
    :domain.includes('security')?'Retail payments / PCI'
    :domain.includes('modern')?'Platform modernisation'
    :segments[0]||'Retail architecture';
  const scale=/\b(large|group|multi-brand|franchise|hundreds|thousands|national|global|countries|stores across)\b/i.test(text)?'Enterprise / multi-site'
    :/\b(startup|small|local|specialty|pilot|mvp)\b/i.test(text)?'Startup / SMB'
    :'Mid-market / growing retail';
  return {primary,segments:[...new Set(segments.length?segments:[primary])],scale,hasAi:hasRetailAiSignals(text),text};
}

function inferSystemOwner(system,state,result){
  const text=`${getPlaybookText(state)} ${recommendationTextForValidation(result)}`.toLowerCase();
  const owner=(label,status='Inferred - validate with client')=>({owner:label,status});
  const rules={
    product:[[/\berp\b|sap|netsuite|dynamics|catalogue feed|catalog feed/,'ERP / product catalogue'],[/commerce|shopify|magento|storefront/,'Commerce catalogue']],
    price:[[/\berp\b|sap|price|pricing/,'ERP / pricing service'],[/promotion|promo/,'Promotion engine']],
    promotion:[[/promotion|promo|campaign|marketing cloud|klaviyo/,'Promotion / campaign platform']],
    cart:[[/cart|basket|checkout|storefront|commerce/,'Commerce platform']],
    order:[[/\boms\b|order management/,'OMS'],[/commerce|checkout/,'Commerce order service']],
    payment:[[/psp|payment gateway|p2pe|token|payment provider/,'PSP / token vault']],
    customer:[[/loyalty|cdp|customer 360|crm|salesforce/,'Loyalty / CDP / CRM']],
    inventory:[[/\bwms\b|warehouse|store inventory|inventory/,'WMS / inventory service'],[/\berp\b/,'ERP inventory']],
    reservation:[[/reservation|promise|availability|oms/,'OMS / availability service']],
    fulfilment:[[/\bwms\b|fulfil|fulfill|warehouse|pick|carrier/,'WMS / fulfilment orchestration']],
    returns:[[/returns|refund|rma|service cloud/,'Returns / service platform']],
    audit:[[/siem|audit|log|logging|splunk|sentinel|datadog/,'Audit log / SIEM']]
  };
  for(const [pattern,label] of rules[system]||[]){
    if(pattern.test(text)) return owner(label);
  }
  return owner('Not explicit in current inputs/output','Open - must assign owner');
}

function retailSystemsOfRecordRows(state,result){
  const defs=[
    ['product','Product','SKU, hierarchy, attributes, catalogue eligibility'],
    ['price','Price','Base price, regional tax, markdowns'],
    ['promotion','Promotion','Campaign rules, coupons, offer eligibility'],
    ['cart','Cart / basket','Session cart, checkout state'],
    ['order','Order','Order lifecycle and state transitions'],
    ['payment','Payment token','PSP token, P2PE boundary, refunds'],
    ['customer','Customer / loyalty','Customer identity, consent, loyalty tier'],
    ['inventory','Inventory','On-hand, available-to-promise, adjustments'],
    ['reservation','Reservation / promise','Stock reservation, delivery/pickup promise'],
    ['fulfilment','Fulfilment','Pick, pack, substitution, carrier handoff'],
    ['returns','Returns','Return authorisation, refund trigger'],
    ['audit','Audit','Immutable operational and compliance evidence']
  ];
  return defs.map(([key,name,scope])=>({name,scope,...inferSystemOwner(key,state,result)}));
}

function retailAcceptanceTests(state){
  const profile=retailWorkloadProfile(state);
  const tests=[
    ['Peak trading load','Run campaign/peak-volume test against browse, checkout, inventory, and integration queues; pass when SLOs and queue-age thresholds hold.'],
    ['Replay and idempotency','Replay failed integration messages with duplicate and out-of-order events; pass when no duplicate orders, stock decrements, or customer notifications occur.'],
    ['Rollback gate','Execute rollback from a failed release or migration wave; pass when owner, trigger, data repair, and customer impact steps are proven.']
  ];
  if(profile.segments.includes('Store execution / omnichannel inventory')){
    tests.push(['Store outage mode','Simulate WAN loss and store-edge degradation; pass when checkout, queue durability, reconnect policy, and reconciliation evidence are proven.']);
  }
  if(profile.segments.includes('Digital commerce / checkout')){
    tests.push(['Checkout isolation','Fail catalogue/search/promotion dependencies; pass when browsing degrades gracefully and checkout/order commit remains protected.']);
  }
  if(profile.segments.includes('Supply chain / fulfilment')){
    tests.push(['Freshness and substitution','Run chilled/fresh order scenarios with late supplier feeds, expiring stock, and human substitution override; pass when promise accuracy and SLA are met.']);
  }
  if(profile.segments.includes('Retail data / loyalty')){
    tests.push(['Consent and deletion','Trace customer consent, segment activation, DSAR/delete, retention, and campaign audit across all activation channels.']);
  }
  if(profile.segments.includes('Retail payments / PCI')){
    tests.push(['PCI boundary evidence','Validate PAN/SAD exclusion, PSP/token vault boundary, logging filters, segmentation evidence, and QSA review action list.']);
  }
  if(profile.segments.includes('Platform modernisation')){
    tests.push(['Migration wave readiness','Run dependency, data reconciliation, rollback, and support handoff checks before each brand/store/system wave.']);
  }
  if(profile.hasAi){
    tests.push(['Retail AI control test','Evaluate model fallback, unsafe output handling, human escalation, traceability, and cost guardrails for AI-assisted decisions.']);
  }
  return tests;
}

function evidenceRows(state,result,research,pricing,validation){
  const profile=retailWorkloadProfile(state);
  const pricingStatus=getPricingEvidenceStatus(result).label;
  const hasResidency=/region|residen|country|gdpr|ccpa|eu|australia|new zealand|us|uk/i.test(profile.text);
  const pricingBasis=(pricing?.summary||[]).slice(0,2).join(' | ')||(pricing?.exclusions||[]).slice(0,1).join(' | ')||'No live service-level pricing available';
  return [
    {area:'Retail workload classification',status:'Derived',basis:profile.primary,action:'Confirm with client sponsor during discovery.'},
    {area:'Company profile',status:research?.research_confidence||'User-provided / low',basis:research?.company_profile||state?.basics?.company||'Not researched',action:'Validate public research and client-provided facts.'},
    {area:'Scale and peak load',status:'User-provided',basis:`${state?.scale?.usersNow||'Not stated'} -> ${state?.scale?.users12m||'Not stated'}`,action:'Validate with POS, commerce, WMS, and analytics telemetry.'},
    {area:'Pricing',status:pricingStatus,basis:pricingBasis,action:'SA/FinOps review before client-ready estimate.'},
    {area:'Compliance',status:'Inferred',basis:state?.nfr?.compliance||'Retail compliance not fully stated',action:'Security/compliance owner must confirm PCI/privacy/regional scope.'},
    {area:'Data residency',status:hasResidency?'Needs validation':'Not explicit',basis:state?.nfr?.i18n||state?.basics?.constraints||'No residency constraint stated',action:'Confirm storage, logs, backups, telemetry, support access, and SaaS metadata locations.'},
    {area:'Validation verdict',status:validation?.verdict||'Pending',basis:validation?.budget_note||'No validation note yet',action:'Human Solution Architect signs off or sends back for revision.'}
  ];
}

function buildRetailReviewPromptBlock(state){
  const profile=retailWorkloadProfile(state);
  const tests=retailAcceptanceTests(state).map(([name,detail])=>`- ${name}: ${detail}`).join('\n');
  return `
RETAIL ARCHITECTURE REVIEW PACK REQUIREMENTS:
- Workload classification: ${profile.primary}; segments: ${profile.segments.join(', ')}; client scale: ${profile.scale}; retail AI in scope: ${profile.hasAi?'yes':'no'}.
- Explicitly identify systems of record for product, price, promotion, cart/order, payment token, customer/loyalty, inventory, reservation, fulfilment, returns, and audit where relevant.
- Mark every company, pricing, compliance, data residency, and vendor capability claim as verified, partial, user-provided, inferred, or needs validation.
- Include human review gates for security/compliance, data, platform/operations, delivery, pricing, and business owner acceptance.
- Architecture must satisfy these acceptance tests or state what evidence is missing:
${tests}
`;
}

function buildRetailArchitectureReviewPack(state,result,research,pricing,validation){
  const profile=retailWorkloadProfile(state);
  const evidence=evidenceRows(state,result,research,pricing,validation).map(row=>`<tr><td>${escapeHtml(row.area)}</td><td><span class="review-status">${escapeHtml(row.status)}</span></td><td>${escapeHtml(row.basis)}</td><td>${escapeHtml(row.action)}</td></tr>`).join('');
  const systems=retailSystemsOfRecordRows(state,result).map(row=>`<tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.scope)}</td><td>${escapeHtml(row.owner)}</td><td><span class="review-status ${row.status.startsWith('Open')?'open':''}">${escapeHtml(row.status)}</span></td></tr>`).join('');
  const tests=retailAcceptanceTests(state).map(([name,detail],index)=>`<div class="acceptance-item"><div class="acceptance-index">${index+1}</div><div><div class="acceptance-title">${escapeHtml(name)}</div><div class="acceptance-copy">${escapeHtml(detail)}</div></div></div>`).join('');
  const gates=['Retail business owner confirms capability scope and measurable outcome.','Security/compliance validates PCI, privacy, support access, and audit evidence.','Data owner signs off systems of record, retention, deletion, and residency assumptions.','Platform/store operations approves runbooks, observability, rollback, and support model.','FinOps or delivery lead validates pricing, implementation partner cost, and rollout budget.'].map(g=>`<li>${escapeHtml(g)}</li>`).join('');
  const segments=profile.segments.map(s=>`<span>${escapeHtml(s)}</span>`).join('');
  return `<div class="review-pack card tech-only"><div class="card-head"><div class="card-head-dot"></div>Retail architecture review pack</div><div class="review-pack-summary"><div><div class="review-label">Workload</div><strong>${escapeHtml(profile.primary)}</strong><p>${escapeHtml(profile.scale)} engagement. AI/model path: ${profile.hasAi?'explicitly in scope':'not in scope'}.</p></div><div class="review-segments">${segments}</div></div><div class="review-section-title">Evidence and confidence</div><div class="review-table-wrap"><table class="review-table"><thead><tr><th>Area</th><th>Status</th><th>Basis</th><th>Human action</th></tr></thead><tbody>${evidence}</tbody></table></div><div class="review-section-title">Systems of record matrix</div><div class="review-table-wrap"><table class="review-table"><thead><tr><th>Domain</th><th>Scope</th><th>Proposed owner</th><th>Status</th></tr></thead><tbody>${systems}</tbody></table></div><div class="review-section-title">Acceptance test pack</div><div class="acceptance-grid">${tests}</div><div class="review-section-title">Human sign-off gates</div><ul class="review-gates">${gates}</ul></div>`;
}

function inferEvidenceStatus(result,research,pricing){
  const current=result?.evidence_status||{};
  const priceStatus=(pricing?.usablePricePoints||[]).length?'partial':'assumption';
  const researchStatus=research?.research_confidence==='high'?'partial':'assumption';
  return {
    pricing:current.pricing||priceStatus,
    region_availability:current.region_availability||'assumption',
    model_currentness:current.model_currentness||'assumption',
    data_residency:current.data_residency||'assumption',
    compliance:current.compliance||researchStatus
  };
}

function defaultWorkloadPricingAssumptions(result,state){
  const profile=retailWorkloadProfile(state);
  const hasAi=profile.hasAi;
  return {
    requests_per_day:state?.scale?.usersNow||'Assumption required from telemetry',
    turns_per_request:hasAi?'1-3 assumed until measured':'Not applicable unless retail AI is in scope',
    input_tokens_per_turn:hasAi?'Assumption required from prompt traces':'Not applicable unless retail AI is in scope',
    output_tokens_per_turn:hasAi?'Assumption required from prompt traces':'Not applicable unless retail AI is in scope',
    cache_hit_rate:'Assumption required from production metrics',
    model_routing_split:hasAi?'Assumption required from model-routing policy':'No model routing in current retail workload',
    peak_multiplier:state?.scale?.peak||'Assumption required from peak trading telemetry',
    ...(result?.workload_pricing_assumptions||{})
  };
}

function defaultResidencyMatrix(state,result){
  const existing=Array.isArray(result?.residency_matrix)?result.residency_matrix:[];
  if(existing.length) return existing;
  const region=state?.nfr?.i18n||state?.basics?.constraints||'Region not confirmed';
  return [
    {component:'Application runtime',data_touched:'Orders, fulfilment workflow, operational metadata',region_or_residency:region,status:'unknown',action:'validate'},
    {component:'Transactional data stores',data_touched:'Reservations, order state, inventory adjustments, audit keys',region_or_residency:region,status:'unknown',action:'validate'},
    {component:'Object storage and backups',data_touched:'Exports, replay payloads, snapshots, operational evidence',region_or_residency:region,status:'unknown',action:'validate'},
    {component:'Logs, metrics, traces',data_touched:'PII-adjacent events, identifiers, support diagnostics',region_or_residency:region,status:'unknown',action:'redact and validate'},
    {component:'SaaS and third-party processors',data_touched:'Carrier, PSP, CRM, WMS/ERP, observability metadata',region_or_residency:region,status:'unknown',action:'validate processor terms'}
  ];
}

function defaultNfrCoverage(state,result){
  const existing=Array.isArray(result?.nfr_coverage)?result.nfr_coverage:[];
  if(existing.length>=5) return existing;
  const nfr=state?.nfr||{};
  const scale=state?.scale||{};
  const defaults=[
    {nfr:'Availability',target:scale.sla||'SLA not stated',mechanism:'Redundant runtime, integration queues, health checks, degraded modes, and owner alerts.',validation_needed:'Run dependency-failure and failover tests against ERP/WMS/store/channel dependencies.'},
    {nfr:'Latency',target:scale.latency||'Latency not stated',mechanism:'Separate synchronous commit paths from async integration, cache read-heavy availability data, and isolate checkout/order commit.',validation_needed:'Load test peak browse, checkout, reservation, and fulfilment promise paths.'},
    {nfr:'RTO/RPO',target:nfr.dr||'RTO/RPO not stated',mechanism:'Backups, replayable events, restore runbooks, and reconciliation after backlog drain.',validation_needed:'Complete restore, replay, and reconciliation game day with measured RTO/RPO.'},
    {nfr:'Security and compliance',target:nfr.compliance||'Compliance not fully stated',mechanism:'Identity controls, tokenized payment boundary, encryption, log filtering, least privilege, and audit evidence.',validation_needed:'Security architect/QSA/privacy owner validates segmentation, logging exclusions, support access, and retention.'},
    {nfr:'Operability',target:nfr.maintainability||'Operations target not stated',mechanism:'Dashboards, alerts, queue-age SLOs, runbooks, rollback triggers, and named operational owners.',validation_needed:'Support team completes runbook walkthrough and incident simulation before pilot.'},
    {nfr:'Consistency',target:nfr.consistency||'Consistency target not stated',mechanism:'System-of-record ownership, idempotency keys, duplicate handling, reservation ledger, and reconciliation windows.',validation_needed:'Replay duplicate/out-of-order events and validate no stock/order/customer-notification drift.'},
    {nfr:'Cost',target:state?.cost?.monthly||'Budget not stated',mechanism:'Tiered architecture, cost guardrails, retention controls, and FinOps review before rollout.',validation_needed:'Validate estimates against service-level pricing, non-prod, licensing, partner, support, and contingency costs.'}
  ];
  const seen=new Set(existing.map(item=>String(item.nfr||'').toLowerCase()));
  return [...existing,...defaults.filter(item=>!seen.has(item.nfr.toLowerCase()))];
}

function defaultAssumptions(state,result,research,pricing){
  const existing=Array.isArray(result?.assumptions)?result.assumptions:[];
  if(existing.length>=3) return existing;
  const profile=retailWorkloadProfile(state);
  const additions=[
    `${state?.basics?.company||'The client'} scale and current-state facts are treated as client-provided until validated against POS, commerce, WMS/ERP, and analytics telemetry.`,
    `Primary workload is classified as ${profile.primary}; adjacent segments should be confirmed during discovery: ${profile.segments.join(', ')}.`,
    (pricing?.usablePricePoints||[]).length?'Pricing is partially verified from qualified provider datapoints and still requires service-level FinOps validation.':'Pricing is an assumption until service-level cloud, SaaS, licensing, support, and implementation costs are verified.',
    research?.research_confidence==='low'?'Public company research is low confidence; legal entity, geography, and operating footprint must be confirmed by the client.':'Company profile should still be validated with client-provided discovery evidence.'
  ];
  return [...existing,...additions].slice(0,8);
}

function defaultHumanValidation(state,result,research,pricing){
  const existing=Array.isArray(result?.human_validation_needed)?result.human_validation_needed:[];
  if(existing.length>=3) return existing;
  const additions=[
    'Business owner confirms target retail capability, pilot scope, rollout waves, and measurable acceptance criteria.',
    'Security/compliance owner confirms PCI/privacy scope, logging exclusions, support access, and regional obligations.',
    'Data owner confirms systems of record, retention, deletion/DSAR, lineage, and residency matrix.',
    'Platform/operations owner confirms runbooks, alert thresholds, rollback triggers, queue replay, and support model.',
    'FinOps/delivery owner validates service-level pricing, licensing, partner cost, non-prod parity, and contingency.'
  ];
  return [...existing,...additions].slice(0,10);
}

function enrichRecommendationForReview(result,state,research,pricing){
  if(!result || typeof result!=='object') return result;
  const enriched={...result};
  enriched.architecture_confidence=enriched.architecture_confidence||((research?.research_confidence==='high'&&(pricing?.usablePricePoints||[]).length)?'Medium':'Low');
  enriched.confidence_reason=enriched.confidence_reason||'Confidence is limited until company facts, workload inventory, service-level pricing, compliance scope, residency, and operational acceptance evidence are validated.';
  enriched.evidence_status=inferEvidenceStatus(enriched,research,pricing);
  enriched.workload_pricing_assumptions=defaultWorkloadPricingAssumptions(enriched,state);
  enriched.residency_matrix=defaultResidencyMatrix(state,enriched);
  enriched.nfr_coverage=defaultNfrCoverage(state,enriched);
  enriched.assumptions=defaultAssumptions(state,enriched,research,pricing);
  enriched.human_validation_needed=defaultHumanValidation(state,enriched,research,pricing);
  enriched.roadmap=(enriched.roadmap||[]).map(item=>({
    ...item,
    dependencies:Array.isArray(item.dependencies)?item.dependencies:['Discovery evidence','Client owner availability','Environment and integration access']
  }));
  return enriched;
}

function architectureBoardChecks(state,result,validation){
  const text=recommendationTextForValidation(result);
  const scenario=getPlaybookText(state);
  const profile=retailWorkloadProfile(state);
  const recTier=(result?.tiers||[]).find(t=>t.id==='recommended')||(result?.tiers||[])[0]||{};
  const hasResidencyMatrix=Array.isArray(result?.residency_matrix)&&result.residency_matrix.length>0;
  const hasNfrCoverage=Array.isArray(result?.nfr_coverage)&&result.nfr_coverage.length>=5;
  const hasAssumptions=Array.isArray(result?.assumptions)&&result.assumptions.length>=3;
  const hasHumanValidation=Array.isArray(result?.human_validation_needed)&&result.human_validation_needed.length>=3;
  const diagramSummary=summarizeArchitectureDiagram(buildArchitectureViews(recTier).solution.code);
  const hasEncryptionEvidence=/encrypt|tls|ssh|kms|hsm|cmek|csek|aes|pgp|key rotation|secret manager|at rest|in transit|field.?level|app.?layer/i.test(text);
  const hasTrustBoundaryEvidence=/trust boundary|security boundary|segmentation|firewall|waf|ips|pci scope|psp boundary|network zone|private subnet|egress/i.test(text);
  const hasFinopsEvidence=/finops|unit cost|cost driver|reserved|committed|savings plan|right.?siz|egress|iops|retention|non.?prod|licen[sc]|support plan|contingency|budget guardrail/i.test(text);
  const hasScalingEvidence=/autoscal|keda|queue lag|consumer lag|connection pool|pgbouncer|backpressure|rate limit|quota|cache hit|load test|stress test|peak test|degraded mode|circuit breaker|bulkhead/i.test(text);
  const checks=[
    {
      lens:'Business outcome',
      score:/business|revenue|conversion|availability|customer|store|fulfil|fulfill|inventory|checkout/i.test(text)?9:6,
      evidence:'Major architecture choices should tie back to retail business outcomes.',
      gap:'Tie every significant component to revenue, customer experience, risk, or operational continuity.'
    },
    {
      lens:'Hard constraints',
      score:(validation?.constraint_violations||[]).length?4:/budget|residen|pci|privacy|deadline|timeline|constraint/i.test(text)?8:6,
      evidence:'Budget, compliance, residency, timeline, and vendor constraints must be explicit.',
      gap:'Promote hard constraints into visible design decisions and delivery gates.'
    },
    {
      lens:'Evidence currentness',
      score:Object.values(result?.evidence_status||{}).some(v=>String(v).toLowerCase()==='verified')?8:6,
      evidence:'Pricing, region availability, compliance, and vendor claims need verified/partial/assumption status.',
      gap:'Mark currentness-sensitive claims as verified, partial, or assumption and keep weak evidence out of final claims.'
    },
    {
      lens:'Security and compliance',
      score:(/pci|token|secret|segmentation|identity|mfa|audit|privacy|p2pe|qsa/i.test(text)&&hasEncryptionEvidence&&hasTrustBoundaryEvidence)?9:5,
      evidence:'Security must cover encryption, identity, key ownership, token paths, PCI/privacy, logging exclusions, and audit.',
      gap:'Add encryption-at-rest/in-transit, key ownership, trust boundaries, PCI/privacy evidence, support-access rules, and owner sign-off.'
    },
    {
      lens:'Encryption and trust boundaries',
      score:(hasEncryptionEvidence&&hasTrustBoundaryEvidence)?9:hasEncryptionEvidence||hasTrustBoundaryEvidence?6:4,
      evidence:'Tokenisation and masking are not enough; encryption and trust boundaries must be explicit.',
      gap:'Show TLS/SSH in transit, KMS/HSM/CMEK/CSEK at rest, secret-manager credentials, data class, external security boundary, and trust-boundary evidence.'
    },
    {
      lens:'Data ownership',
      score:/system.?s? of record|source of truth|owner|lineage|retention|deletion|inventory|customer|order|price/i.test(text)?8:5,
      evidence:'Retail data domains need explicit ownership and lifecycle controls.',
      gap:'Name owners for product, price, promotion, order, payment token, customer, inventory, returns, and audit.'
    },
    {
      lens:'Integration correctness',
      score:/idempot|retry|dead.?letter|replay|reconcil|duplicate|event|queue/i.test(text)?9:5,
      evidence:'Retail integrations fail safely only with replay, duplicate handling, reconciliation, and manual correction.',
      gap:'Add integration contracts, idempotency keys, retry/dead-letter rules, replay, and reconciliation windows.'
    },
    {
      lens:'Operability',
      score:/runbook|observability|dashboard|alert|slo|rollback|on.?call|support|game.?day/i.test(text)?8:5,
      evidence:'The client team must be able to run, detect, repair, and roll back the solution.',
      gap:'Add runbooks, alert thresholds, owner roles, rollback triggers, game days, and support handoff.'
    },
    {
      lens:'Cost and delivery realism',
      score:tierFitsBudget(recTier)&&/phase|pilot|wave|dependency|owner|done when|acceptance/i.test(text)&&hasFinopsEvidence?8:5,
      evidence:'The recommended tier must fit budget, FinOps evidence, and roadmap deliverability.',
      gap:'Add FinOps unit drivers, right-sizing/commitment levers, partner/licensing/support/contingency cost, sequencing, dependencies, and measurable done-when gates.'
    },
    {
      lens:'Scaling mechanics',
      score:hasScalingEvidence?8:5,
      evidence:'Scaling must identify bottlenecks, autoscaling signals, backpressure, and acceptance tests.',
      gap:'Add autoscaling signals, queue/consumer lag SLOs, connection pooling, cache strategy, quotas/rate limits, load-test targets, and degraded-mode behavior.'
    },
    {
      lens:'NFR and residency',
      score:(hasNfrCoverage&&hasResidencyMatrix)?9:hasNfrCoverage||hasResidencyMatrix?7:5,
      evidence:'NFRs and residency need structured coverage, not generic prose.',
      gap:'Complete NFR coverage and residency matrix for apps, data, logs, backups, SaaS metadata, and support access.'
    },
    {
      lens:'Diagram usefulness',
      score:diagramSummary.groupCount>=4&&diagramSummary.serviceCount>=8&&diagramSummary.edgeCount>=8&&hasEncryptionEvidence&&hasTrustBoundaryEvidence?8:5,
      evidence:'Diagrams should show boundaries, actors, data stores, integrations, fallback paths, and security annotations.',
      gap:'Use multiple workload-specific views with annotation legend for auth, encryption, data class, network/provider zones, trust boundaries, and component status.'
    },
    {
      lens:'Approval readiness',
      score:hasAssumptions&&hasHumanValidation?8:5,
      evidence:'A human architect needs clear assumptions, validation tasks, and approval gates.',
      gap:'Add assumption register, human-validation checklist, and client decision log.'
    }
  ];
  const average=Math.round(checks.reduce((sum,item)=>sum+item.score,0)/checks.length);
  const blockers=checks.filter(item=>item.score<7).map(item=>item.gap);
  const status=(validation?.verdict==='fail'||average<7)?'revise':blockers.length?'conditional':'approval-ready';
  return {profile,checks,average,blockers,status};
}

function architectureBoardPromptBlock(state){
  const profile=retailWorkloadProfile(state);
  return `
PRINCIPAL ARCHITECT BOARD GATES:
- Produce an output a retail CTO, security architect, data architect, platform lead, finance owner, and delivery lead could review without guessing hidden assumptions.
- Explicitly cover business outcome, hard constraints, evidence currentness, security/compliance, data ownership, integration correctness, operability, cost/delivery realism, NFR/residency, diagram usefulness, and approval readiness.
- Retail workload detected: ${profile.primary}; segments: ${profile.segments.join(', ')}.
- If any gate is weak, state the missing evidence and add a concrete human validation action instead of sounding certain.
`;
}

function buildArchitectureBoardCard(state,result,validation){
  const board=architectureBoardChecks(state,result,validation);
  const statusLabel=board.status==='approval-ready'?'Approval ready':board.status==='conditional'?'Conditional review':'Revision required';
  const rows=board.checks.map(item=>`<div class="board-row"><div><div class="board-lens">${escapeHtml(item.lens)}</div><div class="board-evidence">${escapeHtml(item.evidence)}</div></div><div class="board-score ${item.score<7?'low':item.score<8?'warn':'pass'}">${item.score}/10</div></div>`).join('');
  const blockers=board.blockers.length?board.blockers.slice(0,6).map(item=>`<li>${escapeHtml(item)}</li>`).join(''):'<li>No deterministic board blockers found. Human approval is still required before client delivery.</li>';
  return `<div class="architecture-board card tech-only"><div class="card-head"><div class="card-head-dot"></div>Principal architecture board</div><div class="board-summary"><div><div class="review-label">Board posture</div><strong>${escapeHtml(statusLabel)}</strong><p>${escapeHtml(board.profile.primary)} reviewed across ${board.checks.length} principal-architect gates.</p></div><div class="board-score-big ${board.average<7?'low':board.average<8?'warn':'pass'}">${board.average}<span>/10</span></div></div><div class="board-grid">${rows}</div><div class="review-section-title">Revision brief</div><ul class="review-gates">${blockers}</ul></div>`;
}

function tableRowsFromPairs(pairs){
  return pairs.map(([a,b,c=''])=>`<tr><td>${escapeHtml(a)}</td><td>${escapeHtml(b)}</td>${c!==''?`<td>${escapeHtml(c)}</td>`:''}</tr>`).join('');
}

function buildConsultingDeliveryPack(state,result,activeTier,validation){
  const evidence=result?.evidence_status||{};
  const assumptions=Array.isArray(result?.assumptions)?result.assumptions:[];
  const human=Array.isArray(result?.human_validation_needed)?result.human_validation_needed:[];
  const nfr=Array.isArray(result?.nfr_coverage)?result.nfr_coverage:[];
  const residency=Array.isArray(result?.residency_matrix)?result.residency_matrix:[];
  const decisionRows=(result?.decisions||[]).slice(0,6).map((item,index)=>[`ADR-${index+1}`,item.what||'-',item.why||'-']);
  const evidenceRows=Object.entries(evidence).map(([k,v])=>[k.replace(/_/g,' '),v||'assumption']);
  const assumptionItems=(assumptions.length?assumptions:['No explicit assumptions were returned; treat this as a review gap.']).slice(0,8).map(item=>`<li>${escapeHtml(item)}</li>`).join('');
  const humanItems=(human.length?human:['Human Solution Architect must validate evidence, cost, compliance, and delivery feasibility before client use.']).slice(0,8).map(item=>`<li>${escapeHtml(item)}</li>`).join('');
  const nfrRows=nfr.slice(0,8).map(item=>`<tr><td>${escapeHtml(item.nfr||'-')}</td><td>${escapeHtml(item.target||'-')}</td><td>${escapeHtml(item.mechanism||'-')}</td><td>${escapeHtml(item.validation_needed||'-')}</td></tr>`).join('');
  const residencyRows=residency.slice(0,8).map(item=>`<tr><td>${escapeHtml(item.component||'-')}</td><td>${escapeHtml(item.data_touched||'-')}</td><td>${escapeHtml(item.region_or_residency||'-')}</td><td>${escapeHtml(item.status||'-')}</td><td>${escapeHtml(item.action||'-')}</td></tr>`).join('');
  const approval=REVIEW_DECISION.status==='approved'?'Approved by reviewer':REVIEW_DECISION.status==='revise'?'Revision requested':'Pending reviewer decision';
  return `<div class="consulting-pack card tech-only"><div class="card-head"><div class="card-head-dot"></div>Consulting delivery pack</div><div class="consulting-summary"><div><div class="review-label">Client decision</div><strong>${escapeHtml(activeTier?.label||'Recommended')} architecture</strong><p>${escapeHtml(result?.confidence_reason||'Confidence depends on validating the assumptions, pricing, compliance, and operational evidence.')}</p></div><div><div class="review-label">Reviewer state</div><strong>${escapeHtml(approval)}</strong><p>${escapeHtml(REVIEW_DECISION.note||'Not reviewed')}</p></div></div><div class="review-section-title">Evidence status</div><div class="review-table-wrap"><table class="review-table"><thead><tr><th>Evidence area</th><th>Status</th></tr></thead><tbody>${tableRowsFromPairs(evidenceRows.length?evidenceRows:[['pricing','assumption'],['compliance','assumption'],['data residency','assumption']])}</tbody></table></div><div class="consulting-columns"><div><div class="review-section-title">Assumption register</div><ul class="review-gates">${assumptionItems}</ul></div><div><div class="review-section-title">Human validation checklist</div><ul class="review-gates">${humanItems}</ul></div></div><div class="review-section-title">NFR coverage</div><div class="review-table-wrap"><table class="review-table"><thead><tr><th>NFR</th><th>Target</th><th>Mechanism</th><th>Validation</th></tr></thead><tbody>${nfrRows||'<tr><td colspan="4">No structured NFR coverage returned. Treat as revision gap.</td></tr>'}</tbody></table></div><div class="review-section-title">Residency and processor matrix</div><div class="review-table-wrap"><table class="review-table"><thead><tr><th>Component</th><th>Data</th><th>Region</th><th>Status</th><th>Action</th></tr></thead><tbody>${residencyRows||'<tr><td colspan="5">No structured residency matrix returned. Treat as revision gap.</td></tr>'}</tbody></table></div><div class="review-section-title">Decision record</div><div class="review-table-wrap"><table class="review-table"><thead><tr><th>ID</th><th>Decision</th><th>Rationale</th></tr></thead><tbody>${tableRowsFromPairs(decisionRows.length?decisionRows:[['ADR-1','No decision record returned','Generate/revise before client delivery']])}</tbody></table></div></div>`;
}

function buildReviewerWorkflowCard(validation){
  const status=REVIEW_DECISION.status;
  const label=status==='approved'?'Approved':status==='revise'?'Revision requested':'Pending review';
  const cls=status==='approved'?'approved':status==='revise'?'revise':'pending';
  const disabled=validation?.verdict==='fail'?'disabled':'';
  const helper=validation?.verdict==='fail'?'Validation failed, so approval should remain blocked until the output is revised.':'Use this as a local reviewer checkpoint before sharing or printing the recommendation.';
  return `<div class="reviewer-workflow card tech-only"><div class="card-head"><div class="card-head-dot"></div>Reviewer workflow</div><div class="reviewer-workflow-body"><div><div class="review-label">Current decision</div><strong class="reviewer-status ${cls}">${escapeHtml(label)}</strong><p>${escapeHtml(helper)}</p><p>${escapeHtml(REVIEW_DECISION.note||'Not reviewed')}</p></div><div class="reviewer-actions"><button class="btn pri" ${disabled} onclick="setReviewDecision('approved')">Approve pack</button><button class="btn" onclick="setReviewDecision('revise')">Request revision</button><button class="btn" onclick="setReviewDecision('pending')">Reset review</button></div></div></div>`;
}

function evidenceValue(result,key){
  return String(result?.evidence_status?.[key]||'assumption').toLowerCase();
}

function buildServiceLevelPricingRows(result){
  const assumptions=result?.workload_pricing_assumptions||{};
  const rows=[
    ['Request volume',assumptions.requests_per_day||'Assumption required'],
    ['Turns per request',assumptions.turns_per_request||'Assumption required'],
    ['Input tokens / turn',assumptions.input_tokens_per_turn||'Assumption required'],
    ['Output tokens / turn',assumptions.output_tokens_per_turn||'Assumption required'],
    ['Cache hit rate',assumptions.cache_hit_rate||'Assumption required'],
    ['Model routing split',assumptions.model_routing_split||'Assumption required'],
    ['Peak multiplier',assumptions.peak_multiplier||'Assumption required']
  ];
  return rows.map(([k,v])=>`<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join('');
}

function clientReadyGate(state,result,validation,activeTier){
  const blockers=[];
  const warnings=[];
  const board=architectureBoardChecks(state,result,validation);
  const sorOpen=retailSystemsOfRecordRows(state,result).filter(row=>String(row.status||'').startsWith('Open'));
  const diagramSummary=summarizeArchitectureDiagram(buildArchitectureViews(activeTier||{}).solution.code);
  const evidence=result?.evidence_status||{};
  const pricing=evidenceValue(result,'pricing');
  const residency=evidenceValue(result,'data_residency');
  const compliance=evidenceValue(result,'compliance');
  const region=evidenceValue(result,'region_availability');
  const pricingAssumptions=Object.values(result?.workload_pricing_assumptions||{}).join(' ').toLowerCase();

  if(!validation){
    blockers.push('Output validation has not run.');
  }else if(validation.verdict!=='pass'){
    blockers.push(`Output validation is ${validation.verdict}; client-ready export requires pass.`);
  }
  if((validation?.constraint_violations||[]).length){
    blockers.push('Hard constraint violations remain unresolved.');
  }
  if(board.average<8 || board.blockers.length){
    blockers.push(`Principal architecture board is ${board.average}/10; all board gates must be at least conditional-free before client delivery.`);
  }
  if(pricing!=='verified'){
    blockers.push(`Pricing evidence is ${evidence.pricing||'assumption'}; service-by-service FinOps validation is required.`);
  }
  if(['assumption','unknown',''].includes(residency)){
    blockers.push('Data residency is not verified or partially evidenced across apps, data, logs, backups, SaaS metadata, telemetry, and support access.');
  }
  if(['assumption','unknown',''].includes(compliance)){
    blockers.push('Compliance evidence is not verified or partially evidenced by a security/compliance owner.');
  }
  if(['assumption','unknown',''].includes(region)){
    warnings.push('Region/service availability is still assumption-level and should be confirmed before procurement.');
  }
  if(sorOpen.length){
    blockers.push(`Systems of record still have open ownership: ${sorOpen.slice(0,4).map(row=>row.name).join(', ')}${sorOpen.length>4?'...':''}.`);
  }
  if(diagramSummary.serviceCount<10 || diagramSummary.edgeCount<9 || diagramSummary.groupCount<4){
    blockers.push(`Primary solution diagram is too weak (${diagramSummary.serviceCount} services, ${diagramSummary.edgeCount} flows, ${diagramSummary.groupCount} groups).`);
  }
  if(/assumption required|not applicable unless|no model routing/.test(pricingAssumptions)&&retailWorkloadProfile(state).hasAi){
    blockers.push('AI/model cost assumptions are incomplete for a retail AI workload.');
  }
  if(REVIEW_DECISION.status!=='approved'){
    blockers.push('Human Solution Architect reviewer has not approved the pack.');
  }
  return {ready:blockers.length===0,blockers,warnings,board,diagramSummary};
}

function buildClientReadyGateCard(state,result,validation,activeTier){
  const gate=clientReadyGate(state,result,validation,activeTier);
  const status=gate.ready?'Client-ready export unlocked':'Client-ready export blocked';
  const cls=gate.ready?'pass':'fail';
  const blockerItems=(gate.blockers.length?gate.blockers:gate.warnings.length?gate.warnings:['No deterministic blockers found.']).slice(0,8).map(item=>`<li>${escapeHtml(item)}</li>`).join('');
  const pricingRows=buildServiceLevelPricingRows(result);
  return `<div class="client-ready-gate card tech-only ${cls}"><div class="card-head"><div class="card-head-dot"></div>Client-ready export gate</div><div class="gate-summary"><div><div class="review-label">Export status</div><strong>${escapeHtml(status)}</strong><p>${gate.ready?'The pack can be exported as client-ready after reviewer approval remains in place.':'The pack is usable as a review draft, but not as a final client deliverable.'}</p></div><div class="gate-score ${gate.ready?'pass':'fail'}">${gate.ready?'READY':'DRAFT'}</div></div><div class="review-section-title">${gate.ready?'Remaining notes':'Blocking evidence gaps'}</div><ul class="review-gates">${blockerItems}</ul><div class="review-section-title">Service-level pricing assumptions</div><div class="review-table-wrap"><table class="review-table"><thead><tr><th>Assumption</th><th>Value</th></tr></thead><tbody>${pricingRows}</tbody></table></div></div>`;
}

function printReviewDraft(){
  document.body.dataset.architectiqExport='draft';
  window.print();
}

function printClientReady(){
  const result=window.__lastResult;
  const activeTier=(result?.tiers||[]).find(t=>t.id===ACTIVE_TIER)||chooseDefaultTier(result?.tiers)||{};
  const gate=clientReadyGate(S,result,LAST_VALIDATION,activeTier);
  if(!gate.ready){
    alert(`Client-ready export is blocked:\n\n${gate.blockers.slice(0,6).join('\n')}`);
    logEvent('warn','export.client_ready_blocked',{blockers:gate.blockers.length});
    return;
  }
  document.body.dataset.architectiqExport='client-ready';
  window.print();
  logEvent('info','export.client_ready_started',{company:S?.basics?.company||'ArchitectIQ'});
}
export function escapeHtml(value){
  return String(value ?? '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function loadClientLogs(){
  try{
    const parsed=JSON.parse(localStorage.getItem(CLIENT_LOG_STORAGE_KEY)||'[]');
    return Array.isArray(parsed)?parsed:[];
  }catch{
    return [];
  }
}

function saveClientLogs(){
  try{
    localStorage.setItem(CLIENT_LOG_STORAGE_KEY,JSON.stringify(CLIENT_LOGS.slice(-CLIENT_LOG_LIMIT)));
  }catch{}
}

function logLevelClass(level){
  return level==='error'?'error':level==='warn'?'warn':'info';
}

export function logEvent(level,event,details=null){
  const entry={
    id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    timestamp:new Date().toISOString(),
    level,
    event,
    details
  };
  CLIENT_LOGS=[...CLIENT_LOGS,entry].slice(-CLIENT_LOG_LIMIT);
  saveClientLogs();
  const method=level==='error'?'error':level==='warn'?'warn':'log';
  console[method](`[ArchitectIQ] ${event}`,details||'');
  renderLogPanel();
  updateChrome();
}

function formatLogDetails(details){
  if(details==null) return '';
  const text=typeof details==='string'?details:JSON.stringify(details,null,2);
  return escapeHtml(text);
}

function formatLogTime(timestamp){
  try{
    return new Date(timestamp).toLocaleTimeString([],{
      hour:'2-digit',
      minute:'2-digit',
      second:'2-digit'
    });
  }catch{
    return String(timestamp||'');
  }
}

function logEntriesMarkup(entries,emptyMessage){
  if(!entries.length) return `<div class="log-empty">${escapeHtml(emptyMessage)}</div>`;
  return `<div class="log-list">${entries.map(entry=>`<div class="log-entry"><div class="log-entry-head"><div class="log-entry-main"><span class="log-level ${logLevelClass(entry.level)}">${escapeHtml(String(entry.level||'info').toUpperCase())}</span><span class="log-event">${escapeHtml(entry.event||'event')}</span></div><span class="log-time">${escapeHtml(formatLogTime(entry.timestamp))}</span></div>${entry.details!=null?`<div class="log-detail">${formatLogDetails(entry.details)}</div>`:''}</div>`).join('')}</div>`;
}

function logPanel(){
  if(!LOG_UI.open) return '';
  const clientEntries=[...CLIENT_LOGS].reverse();
  const serverEntries=[...SERVER_LOGS];
  const activeEntries=LOG_UI.scope==='server'?serverEntries:clientEntries;
  const emptyMessage=LOG_UI.scope==='server'
    ? (SERVER_LOG_STATE.loading?'Loading server logs...':SERVER_LOG_STATE.error||'No server logs recorded yet.')
    : 'No client logs recorded yet.';
  return `<div class="card log-card"><div class="card-head"><div class="card-head-dot"></div>Debug logs</div><div class="log-toolbar"><div class="log-tabs"><button class="log-tab ${LOG_UI.scope==='client'?'active':''}" onclick="setLogScope('client')">Client (${CLIENT_LOGS.length})</button><button class="log-tab ${LOG_UI.scope==='server'?'active':''}" onclick="setLogScope('server')">Server (${SERVER_LOGS.length})</button></div><div class="log-actions">${LOG_UI.scope==='server'?`<button class="log-action" onclick="refreshServerLogs(true)">${SERVER_LOG_STATE.loading?'Refreshing...':'Refresh'}</button><button class="log-action" onclick="clearServerLogs()">Clear server</button>`:`<button class="log-action" onclick="clearClientLogs()">Clear client</button>`}<button class="log-action" onclick="toggleLogs()">Hide</button></div></div>${logEntriesMarkup(activeEntries,emptyMessage)}</div>`;
}

function renderLogPanel(){
  const host=document.getElementById('log-panel-host');
  if(host) host.innerHTML=logPanel();
}

export function setLogScope(scope){
  LOG_UI.scope=scope;
  renderLogPanel();
  updateChrome();
  if(scope==='server' && !SERVER_LOG_STATE.loaded) refreshServerLogs();
}

export function toggleLogs(){
  LOG_UI.open=!LOG_UI.open;
  renderLogPanel();
  updateChrome();
  if(LOG_UI.open && LOG_UI.scope==='server' && !SERVER_LOG_STATE.loaded) refreshServerLogs();
}

async function refreshServerLogs(manual=false){
  if(SERVER_LOG_STATE.loading) return;
  SERVER_LOG_STATE.loading=true;
  SERVER_LOG_STATE.error='';
  renderLogPanel();
  try{
    const res=await fetch('/api/logs?limit=120');
    const data=await res.json();
    if(!res.ok) throw new Error(data.error?.message||'Failed to load server logs.');
    SERVER_LOGS=Array.isArray(data.logs)?data.logs:[];
    SERVER_LOG_STATE.loaded=true;
    if(manual) logEvent('info','logs.server_refreshed',{count:SERVER_LOGS.length});
  }catch(err){
    SERVER_LOG_STATE.error=err.message;
    if(manual) logEvent('error','logs.server_refresh_failed',{message:err.message});
  }finally{
    SERVER_LOG_STATE.loading=false;
    renderLogPanel();
    updateChrome();
  }
}

async function clearServerLogs(){
  try{
    const res=await fetch('/api/logs',{method:'DELETE'});
    const data=await res.json();
    if(!res.ok || !data.ok) throw new Error(data.error?.message||'Failed to clear server logs.');
    SERVER_LOGS=[];
    SERVER_LOG_STATE.loaded=true;
    SERVER_LOG_STATE.error='';
    logEvent('warn','logs.server_cleared');
  }catch(err){
    logEvent('error','logs.server_clear_failed',{message:err.message});
  }
  renderLogPanel();
}

export function clearClientLogs(){
  CLIENT_LOGS=[];
  saveClientLogs();
  renderLogPanel();
  updateChrome();
}

function scenarioPickerMarkup(){
  return `<div class="card scenario-picker"><div class="card-head"><div class="card-head-dot"></div>Input scenarios</div><div class="scenario-grid">${SCENARIO_PRESETS.map(item=>`<div class="scenario-card ${item.id===ACTIVE_SCENARIO_ID?'active':''}" onclick="loadScenario('${item.id}')"><div class="scenario-card-head"><div class="scenario-card-title">${escapeHtml(item.name)}</div><span class="scenario-card-tag">${escapeHtml(item.tag)}</span></div><div class="scenario-card-copy">${escapeHtml(item.summary)}</div></div>`).join('')}</div></div>`;
}

function renderScenarioNav(){
  const host=document.getElementById('scenario-nav');
  if(!host) return;
  host.innerHTML=SCENARIO_PRESETS.map(item=>`<div class="nav-item scenario-item ${item.id===ACTIVE_SCENARIO_ID?'active':''}" onclick="loadScenario('${item.id}')"><div class="nav-dot ${item.id===ACTIVE_SCENARIO_ID?'current':'done'}"></div><div class="nav-copy"><div class="scenario-name">${escapeHtml(item.name)}</div><div class="scenario-meta">${escapeHtml(item.tag)} - ${escapeHtml(item.summary)}</div></div></div>`).join('');
}

export function loadScenario(id){
  const preset=getScenarioPreset(id);
  ACTIVE_SCENARIO_ID=preset.id;
  S={step:0,...deepClone(preset.state)};
  logEvent('info','scenario.loaded',{id:preset.id,name:preset.name});
  render();
}

export async function refreshServerConfig(){
  if(SERVER_CONFIG.loading) return SERVER_CONFIG_PROMISE;
  SERVER_CONFIG.loading=true;
  SERVER_CONFIG_PROMISE=(async()=>{
    try{
      const res=await fetch('/api/config');
      const data=await res.json();
      SERVER_CONFIG={
        loaded:true,
        loading:false,
        error:'',
        keyConfigured:!!data.keyConfigured,
        openaiKeyConfigured:!!data.openaiKeyConfigured,
        anthropicKeyConfigured:!!data.anthropicKeyConfigured,
        diagramsSupported:data.diagramsSupported!==false
      };
      logEvent('info','server.config_loaded',{
        keyConfigured:SERVER_CONFIG.keyConfigured,
        openaiKeyConfigured:SERVER_CONFIG.openaiKeyConfigured,
        anthropicKeyConfigured:SERVER_CONFIG.anthropicKeyConfigured,
        diagramsSupported:SERVER_CONFIG.diagramsSupported
      });
    }catch(err){
      SERVER_CONFIG={
        loaded:true,
        loading:false,
        error:err.message,
        keyConfigured:null,
        openaiKeyConfigured:null,
        anthropicKeyConfigured:null,
        diagramsSupported:null
      };
      logEvent('error','server.config_failed',{message:err.message});
    }
    if(!PIPELINE_ACTIVE) render();
    else { renderLogPanel(); updateChrome(); }
    return SERVER_CONFIG;
  })();
  return SERVER_CONFIG_PROMISE;
}

const F=(label,section,key,placeholder='',extraClass='')=>{
  const value=escapeHtml(S[section][key]||'');
  return `<div class="field ${extraClass}"><label>${label}</label><input type="text" data-s="${section}" data-k="${key}" value="${value}" placeholder="${escapeHtml(placeholder)}" class="${value?'filled':''}"></div>`;
};
const T=(label,section,key,placeholder='',extraClass='')=>{
  const value=escapeHtml(S[section][key]||'');
  return `<div class="field ${extraClass}"><label>${label}</label><textarea data-s="${section}" data-k="${key}" placeholder="${escapeHtml(placeholder)}" class="${value?'filled':''}">${value}</textarea></div>`;
};
const SEL=(label,section,key,options,extraClass='')=>{
  const current=S[section][key]||'';
  return `<div class="field ${extraClass}"><label>${label}</label><select data-s="${section}" data-k="${key}" class="${current?'filled':''}">${options.map(option=>`<option ${option===current?'selected':''}>${escapeHtml(option)}</option>`).join('')}</select></div>`;
};
const NAV=(back=true,last=false)=>`<div class="btnrow">${back?'<button class="btn" onclick="go(-1)">Back</button>':'<span></span>'}<span class="sc">Step ${S.step+1} of ${STEPS.length}</span><button class="btn pri" onclick="${last?'generate()':'go(1)'}">${last?'Generate':'Continue'}</button></div>`;

function progressStrip(){
  return `<div class="progress-strip">${STEPS.map((label,i)=>`<div class="ps-step ${i<S.step?'done':i===S.step?'active':''}" onclick="setStep(${i})">${escapeHtml(label)}</div>`).join('')}</div>`;
}

function sectionHead(title,description){
  return `<div class="section-head"><h2>${title}</h2><p>${description}</p></div>`;
}

export function setStep(step){
  const nextStep=Math.max(0,Math.min(STEPS.length-1,step));
  if(nextStep!==S.step) logEvent('info','ui.step_changed',{from:STEPS[S.step],to:STEPS[nextStep]});
  S.step=nextStep;
  render();
}

export function handleTopAction(){
  if(S.step===STEPS.length-1) generate();
  else go(1);
}

export function render(){
  PIPELINE_ACTIVE=false;
  const content=document.getElementById('content');
  if(!content) return;
  content.innerHTML=[rB,rSc,rC,rN,rT,rGen][S.step]()+`<div id="log-panel-host"></div>`;
  renderScenarioNav();
  updateChrome();
  renderLogPanel();
  document.querySelectorAll('[data-s]').forEach(el=>{
    ['input','change'].forEach(evt=>el.addEventListener(evt,e=>{
      S[e.target.dataset.s][e.target.dataset.k]=e.target.value;
      updateChrome();
    }));
  });
}

function updateChrome(){
  const titleEl=document.getElementById('topbar-title');
  const nextBtn=document.getElementById('next-btn');
  const backBtn=document.getElementById('back-btn');
  const avatarEl=document.getElementById('client-avatar');
  const nameEl=document.getElementById('client-name');
  const companyEl=document.getElementById('client-company');
  if(!titleEl||!nextBtn||!backBtn||!avatarEl||!nameEl||!companyEl) return;
  const company=S.basics.company||'RetailEdge Omni';
  const contact=S.basics.contact||'ArchitectIQ';
  const initials=contact.split(',')[0].trim().split(/\s+/).slice(0,2).map(part=>part[0]||'').join('').toUpperCase()||'AI';
  titleEl.textContent=S.step===STEPS.length-1?'Generate architecture':STEPS[S.step];
  nextBtn.textContent=S.step===STEPS.length-1?'Generate ->':'Continue ->';
  backBtn.disabled=S.step===0;
  avatarEl.textContent=initials;
  nameEl.textContent=contact.split(',')[0]||'Avery Singh';
  companyEl.textContent=company;
  const logsBtn=document.getElementById('logs-btn');
  if(logsBtn){
    logsBtn.textContent=LOG_UI.open?'Hide logs':'Logs';
    logsBtn.className=`pill-btn logs-pill${CLIENT_LOGS.length||SERVER_LOGS.length?' has-logs':''}`;
  }
  renderScenarioNav();
  for(let i=0;i<STEPS.length;i++){
    const item=document.getElementById(`nav${i}`);
    const dot=document.getElementById(`navdot${i}`);
    if(!item||!dot) continue;
    item.className=`nav-item${i===S.step?' active':''}`;
    dot.className=`nav-dot${i<S.step?' done':i===S.step?' current':''}`;
  }
}

function rB(){
  return `${progressStrip()}${scenarioPickerMarkup()}${sectionHead('Retail client basics','Every field here shapes the retail architecture recommendation. Specificity is everything.')}<div class="field-grid">${F('Retail company / brand','basics','company','e.g. National Retail Group')}${F('Contact','basics','contact','e.g. Head of Retail Technology')}${SEL('Retail segment','basics','industry',['Retail / E-commerce','Grocery / Supermarket','Department Store / Big Box','Specialty Retail','Marketplace','Franchise / Multi-store Retail','Retail Supply Chain'])}${SEL('Retail workload','basics','domain',['Store Execution & Omnichannel Inventory','Digital Commerce & Checkout','Retail Data / Loyalty / Personalisation','Supply Chain & Fulfilment','Retail Security & Compliance','Retail Platform Modernisation'])}${T('Business problem','basics','problem','','full')}${T('Existing retail stack','basics','stack','','full')}${T('Hard constraints','basics','constraints','','full')}</div>`;
}

function rSc(){
  return `${progressStrip()}${sectionHead('Scale & performance','Retail scale determines architecture tier. A 5-store pilot is structurally different from national peak trading.')}<div class="field-grid">${F('Volume today','scale','usersNow','e.g. 120 stores / 2M sessions / 20k orders per week')}${F('Volume in 12 months','scale','users12m','e.g. 250 stores / 7M sessions / 60k orders per week')}${F('Peak retail load','scale','peak','e.g. campaign launch, checkout rush, fulfilment cutoff')}${F('Retail data volume & growth','scale','data','e.g. 18TB today, +1.5TB/month')}${SEL('Latency requirement','scale','latency',['< 100ms','< 500ms','< 2 seconds','Best-effort / async','Not latency-sensitive'])}${SEL('Availability SLA','scale','sla',['99%','99.9%','99.95%','99.99%','Best effort'])}${SEL('Traffic pattern','scale','traffic',['Steady (constant)','Business hours (predictable peaks)','Bursty (unpredictable spikes)','Batch / scheduled','Seasonal'])}${SEL('Read / write ratio','scale','rw',['90/10 reads','80/20 reads','70/30 reads','50/50 balanced','Mostly writes'])}</div>`;
}

function rC(){
  const rows=CL.map(([key,label])=>`<div class="cost-toggle-row"><span class="ctl">${label}</span><div class="toggle-pills">${PL.map(priority=>`<div class="tp ${S.cost[key]===priority?(priority==='Minimise'?'on-min':priority==='Balanced'?'on-bal':'on-qf'):''}" onclick="sp('${key}','${priority}')">${priority}</div>`).join('')}</div></div>`).join('');
  return `${progressStrip()}${sectionHead('Cost priorities','Each retail layer is controlled independently. These choices directly determine which vendors and tiers get recommended.')}<div class="card"><div class="card-head"><div class="card-head-dot"></div>Cost priority by retail layer</div>${rows}</div><div class="field-grid">${F('Monthly ceiling','cost','monthly','e.g. $50,000 / month')}${F('One-time setup budget','cost','setup','e.g. $250,000 rollout budget')}</div>`;
}

function rN(){
  const cards=NF.map(([key,label])=>`<div class="nfr-card ${S.nfr[key]?'filled':''}"><div class="nfr-label">${label}</div><div class="${S.nfr[key]?'nfr-val':'nfr-empty'}">${escapeHtml(S.nfr[key]||'Not yet specified')}</div></div>`).join('');
  const fields=NF.map(([key,label])=>T(label,'nfr',key,'','full')).join('');
  return `${progressStrip()}${sectionHead('Non-functional requirements','Missing one of these is how re-architectures happen at month 4. Every field matters.')}<div class="nfr-grid">${cards}</div><div class="card" style="margin-top:1rem">${fields}</div>`;
}

function rT(){
  return `${progressStrip()}${sectionHead('Team & delivery','Team maturity changes how opinionated vs flexible the recommendations are.')}<div class="field-grid">${F('Team size & roles','team','size','e.g. 4 engineers')}${SEL('Seniority','team','seniority',['Junior','Mid','Senior','Mixed'])}${F('Delivery timeline','team','timeline','e.g. MVP 8 weeks, production 16 weeks')}${SEL('Build vs buy','team','buildBuy',['Buy-first (managed services)','Build-first (custom)','Balanced','No preference'])}${SEL('Deployment preference','team','deploy',['Cloud-only','On-premise','Hybrid','No preference'])}${T('Additional context','team','notes','Anything else that should shape the recommendation?','','full')}</div>`;
}

function serverStatusMarkup(){
  if(SERVER_CONFIG.loading){
    return `<div class="layer-why" style="margin-top:10px">Checking local ArchitectIQ API server...</div>`;
  }
  if(SERVER_CONFIG.loaded&&SERVER_CONFIG.keyConfigured===false){
    return `<div class="err-box" style="margin-top:10px"><strong>Live generation is not configured.</strong> Start the ArchitectIQ Node server with ANTHROPIC_API_KEY or OPENAI_API_KEY in your .env file. You can still use Preview mock recommendation.</div>`;
  }
  if(SERVER_CONFIG.loaded&&SERVER_CONFIG.error){
    return `<div class="err-box" style="margin-top:10px"><strong>Cannot reach the ArchitectIQ API server.</strong> Open the app through the Node server at http://localhost:3000, not the Vite-only port or a file URL. Details: ${escapeHtml(SERVER_CONFIG.error)}</div>`;
  }
  if(SERVER_CONFIG.loaded&&SERVER_CONFIG.keyConfigured){
    return `<div class="layer-why" style="margin-top:10px">Architecture agents are ready.</div>`;
  }
  return `<div class="layer-why" style="margin-top:10px">Live generation uses the local ArchitectIQ API server. Mock preview uses a local sample response.</div>`;
}

function rGen(){
  const checks=[
    ['Client basics',!!S.basics.company&&!!S.basics.problem],
    ['Scale & performance',!!S.scale.usersNow&&!!S.scale.users12m],
    ['Cost priorities',!!S.cost.monthly],
    ['Non-functional reqs',Object.values(S.nfr).some(Boolean)],
    ['Team & delivery',!!S.team.size&&!!S.team.timeline]
  ];
  return `${progressStrip()}<div class="gen-card"><div class="gen-icon"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="#185FA5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="gen-title">${escapeHtml(S.basics.company||'ArchitectIQ')} - ready to generate</div><div class="gen-sub">All sections are loaded. The recommendation will include your full stack, 3-tier cost estimate, risk register, decision rationale, and a phased implementation roadmap.</div><div class="checklist">${checks.map(([label,ok])=>`<div class="check-item"><div class="${ok?'check-tick':'check-miss'}">${ok?'OK':''}</div><span>${label}</span></div>`).join('')}</div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn-generate" onclick="generate()">Generate architecture recommendation -></button><button class="btn" onclick="runAgentReview()">Run agent review</button><button class="btn" onclick="runMockRecommendation()">Preview mock recommendation</button></div>${serverStatusMarkup()}</div><div id="out" style="margin-top:1rem"></div>`;
}

function agentList(items){
  return (items||[]).slice(0,8).map(item=>`<div class="validation-item">${escapeHtml(typeof item==='string'?item:item?.risk||item?.topic||JSON.stringify(item))}</div>`).join('')||'<div class="validation-item">None returned</div>';
}

function customerAgentRecommendation(agent){
  const seen=new Set();
  const items=[
    agent?.model_summary,
    agent?.summary,
    ...(agent?.model_findings||[]),
    ...(agent?.findings||[]).filter(item=>!/^(classify|apply|assign|confirm|maintain|validate|define|keep|break|name)\b/i.test(String(item||'')))
  ].filter(Boolean).filter(item=>{
    const key=String(item).toLowerCase().replace(/\s+/g,' ').trim();
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return items.slice(0,3);
}

function agentValidationEvidence(agent){
  const items=[
    ...(agent?.model_validation_needed||[]),
    ...(agent?.validation_needed||[])
  ].filter(Boolean);
  return items.slice(0,3);
}

function renderAgentReview(result){
  const outDiv=document.getElementById('out');
  if(!outDiv) return;
  const rec=result?.recommendation||{};
  const state=result?.architecture_state||{};
  const board=result?.review_gate?.architecture_board||rec.architecture_board||{};
  const validation=result?.review_gate?.validation||rec.validation||{};
  const agents=(result?.agents_used||[]).join(', ')||'none';
  const modelAgents=[];
  const modelErrors=[];
  const workloads=rec.retail_scope?.workload_types||state.retail_workload||[];
  const controls=[
    ['Security controls',(state.security_controls||[]).length],
    ['Compliance obligations',(state.compliance_obligations||[]).length],
    ['Governance controls',(state.governance_controls||[]).length],
    ['Infrastructure controls',(state.infrastructure_controls||[]).length],
    ['Technology controls',(state.technology_controls||[]).length],
    ['Storage controls',(state.storage_controls||[]).length],
    ['API controls',(state.api_controls||[]).length],
    ['AI controls',(state.ai_controls||[]).length],
    ['UI controls',(state.ui_controls||[]).length],
    ['FinOps controls',(state.finops_controls||[]).length],
    ['Residency rows',(state.residency_matrix||[]).length],
    ['NFR rows',(state.nfr_coverage||[]).length]
  ].map(([label,value])=>`<div class="cost-c"><div class="cost-tier-label">${escapeHtml(label)}</div><div class="cost-val" style="font-size:15px">${escapeHtml(value)}</div></div>`).join('');
  const agentOutputs=result?.agent_outputs||[];
  const specialistRows=agentOutputs.map(agent=>{
    const findings=customerAgentRecommendation(agent).map(item=>`<div>${escapeHtml(item)}</div>`).join('');
    const validationItems=agentValidationEvidence(agent).map(item=>`<div>${escapeHtml(item)}</div>`).join('');
    return `<tr><td>${escapeHtml(agent.title||agent.agentId||'-')}</td><td>${findings||'-'}</td><td>${validationItems||'-'}</td></tr>`;
  }).join('');
  const costDrivers=(state.cost_drivers||[]).slice(0,8).map(item=>`<li>${escapeHtml(item)}</li>`).join('');
  const pricingAssumptions=Object.entries(state.workload_pricing_assumptions||{}).map(([key,value])=>`<tr><td>${escapeHtml(key.replace(/_/g,' '))}</td><td>${escapeHtml(value||'-')}</td></tr>`).join('');
  const residencyRows=(state.residency_matrix||[]).slice(0,10).map(item=>`<tr><td>${escapeHtml(item.component||'-')}</td><td>${escapeHtml(item.data_touched||'-')}</td><td>${escapeHtml(item.region_or_residency||'-')}</td><td>${escapeHtml(item.status||'-')}</td><td>${escapeHtml(item.action||'-')}</td></tr>`).join('');
  const nfrRows=(state.nfr_coverage||[]).slice(0,10).map(item=>`<tr><td>${escapeHtml(item.nfr||'-')}</td><td>${escapeHtml(item.target||'-')}</td><td>${escapeHtml(item.mechanism||'-')}</td><td>${escapeHtml(item.validation_needed||'-')}</td></tr>`).join('');
  const risks=(state.risks||[]).slice(0,10).map(item=>`<div class="risk-row"><span class="sev ${item.severity==='High'?'sev-h':item.severity==='Medium'?'sev-m':'sev-l'}">${escapeHtml(item.severity||'Risk')}</span><div><div class="risk-text">${escapeHtml(item.risk||'-')}</div><div class="risk-fix">Likelihood: ${escapeHtml(item.likelihood||'-')} | Mitigation: ${escapeHtml(item.fix||item.mitigation||'-')}</div></div></div>`).join('');
  const isCustomerDecision=item=>{
    const text=[item?.what,item?.why,item?.owner,item].map(value=>{
      if(typeof value==='string') return value;
      try{return JSON.stringify(value||'')}catch{return String(value||'')}
    }).join(' ').toLowerCase();
    return !/(master agent|specialist review agent|agentic|architectiq retail|technology agents complete|infrastructure and technology agents complete|current review has guardrails|run agent review)/.test(text);
  };
  const decisions=(state.architecture_decisions||[]).filter(isCustomerDecision).slice(0,8).map(item=>`<div class="risk-row"><span class="sev sev-l">Decision</span><div><div class="risk-text">${escapeHtml(item.what||'-')}</div><div class="risk-fix">${escapeHtml(item.why||'-')}</div></div></div>`).join('');
  const assumptions=(state.assumptions||[]).slice(0,8).map(item=>`<li>${escapeHtml(item)}</li>`).join('');
  const human=(rec.human_validation_needed||state.human_validation_needed||[]).slice(0,10).map(item=>`<li>${escapeHtml(item)}</li>`).join('');
  const conflicts=(rec.conflicts||[]).map(item=>`<div class="risk-row"><span class="sev sev-m">Conflict</span><div><div class="risk-text">${escapeHtml(item.topic||'-')}</div><div class="risk-fix">${escapeHtml(item.resolution||item.impact||'-')}</div></div></div>`).join('');
  const boardRows=(board.checks||[]).slice(0,12).map(item=>`<div class="board-row"><div><div class="board-lens">${escapeHtml(item.lens||'-')}</div><div class="board-evidence">${escapeHtml(item.evidence||item.gap||'-')}</div></div><div class="board-score ${item.score<7?'low':item.score<8?'warn':'pass'}">${escapeHtml(item.score||'-')}/10</div></div>`).join('');
  const agentReviewResult={
    executive_summary:rec.executive_summary||'Agent review completed.',
    architecture_confidence:board.average>=8?'medium':'low',
    confidence_reason:'This review is ready for customer discussion once the listed evidence, owners, assumptions, and acceptance tests are validated.',
    evidence_status:rec.evidence_status||state.evidence_status||{pricing:'assumption',region_availability:'assumption',model_currentness:'assumption',data_residency:'assumption',compliance:'assumption'},
    assumptions:state.assumptions||rec.assumptions||[],
    human_validation_needed:rec.human_validation_needed||state.human_validation_needed||[],
    workload_pricing_assumptions:state.workload_pricing_assumptions||rec.workload_pricing_assumptions||{},
    residency_matrix:state.residency_matrix||rec.residency_matrix||[],
    nfr_coverage:state.nfr_coverage||rec.nfr_coverage||[],
    risks:state.risks||rec.risks||[],
    decisions:(state.architecture_decisions||rec.architecture_decisions||[]).filter(isCustomerDecision),
    roadmap:[
      {phase:'Phase 1 - Validate evidence',timeline:'Now',deliverables:['Confirm assumptions','Validate data, payment, compliance, residency, pricing, and ownership evidence','Agree acceptance tests'],owner:'Client sponsor + solution architect',done_when:'Evidence status is clear and named owners accept the validation plan.'},
      {phase:'Phase 2 - Finalise target architecture',timeline:'Next',deliverables:['Confirm runtime and technology choices','Validate NFRs and integration contracts','Agree rollout and rollback gates'],owner:'Client architecture, security, platform, and delivery owners',done_when:'Architecture choices are traceable to business outcomes, constraints, NFRs, and risk acceptance.'},
      {phase:'Phase 3 - Approve delivery pack',timeline:'After validation',deliverables:['Client-ready architecture recommendation','Decision record','Risk register','Implementation roadmap'],owner:'Lead solution architect + client approvers',done_when:'Approvers sign off the recommendation, risks, assumptions, and delivery plan.'}
    ],
    next_steps:rec.next_steps||[
      'Validate the security, compliance, governance, and FinOps findings with named human owners.',
      'Confirm runtime, network, deployment, HA/DR, observability, UI, API, storage, and AI technology choices before final approval.',
      'Run the listed acceptance tests and update the evidence status before client-ready sign-off.'
    ],
    disclaimer:'This is a customer-facing review draft. It should not be treated as final approval until evidence, owners, assumptions, risks, NFRs, residency, pricing, and rollout gates are validated.'
  };
  const activeAgentTier={label:'Agent review draft'};
  const viewBar=`<div class="out-view-bar"><button class="ovp${AUDIENCE_VIEW==='technical'?' active':''}" data-mode="technical" onclick="setAudience('technical')">Technical view</button><button class="ovp${AUDIENCE_VIEW==='executive'?' active':''}" data-mode="executive" onclick="setAudience('executive')">Executive view</button></div>`;
  const execBanner=`<div class="exec-banner exec-only"><div class="exec-banner-label">Executive summary view</div><div class="exec-banner-body">Showing a simplified, business-focused agent review. Switch to <strong>Technical view</strong> to see specialist findings, board checks, FinOps, NFRs, and validation evidence.</div></div>`;
  const validationCard=`<div class="validation-card ${validation.verdict==='fail'?'fail':validation.verdict==='pass'?'pass':'warn'} tech-only"><div class="validation-header"><span class="validation-verdict">${escapeHtml(validation.verdict||'review')}</span><span class="validation-title">Review status</span></div><div style="font-size:11px;font-weight:500;color:var(--color-text-tertiary);text-transform:uppercase;letter-spacing:.05em;margin:.5rem 0 .25rem">Warnings</div>${agentList(validation.warnings)}<div style="font-size:11px;font-weight:500;color:var(--color-text-tertiary);text-transform:uppercase;letter-spacing:.05em;margin:.5rem 0 .25rem">Suggested improvements</div>${agentList(validation.improvements)}</div>`;
  const intelligenceCard='';
  const reviewPack=buildRetailArchitectureReviewPack(S,agentReviewResult,null,null,validation);
  const consultingPack=buildConsultingDeliveryPack(S,agentReviewResult,activeAgentTier,validation);
  const agentScopeCards=agentOutputs.map(agent=>{
    return `<div class="tier-card active"><span class="tier-active-badge">Review</span><div class="tier-card-label">${escapeHtml(agent.title||agent.agentId||'Review area')}</div><div class="tier-card-tagline">${escapeHtml(agent.summary||'Specialist review completed.')}</div><div class="tier-card-price">${escapeHtml((agent.findings||[]).length)} findings</div><span class="tier-budget tier-budget-ok">${escapeHtml((agent.validation_needed||[]).length)} validation items</span></div>`;
  }).join('');
  const agentRows=agentOutputs.map(agent=>{
    const firstFinding=customerAgentRecommendation(agent)[0]||agent.summary||'-';
    return `<tr><td class="layer-name">${escapeHtml(agent.title||agent.agentId||'-')}</td><td><div class="layer-why">${escapeHtml(firstFinding)}</div></td><td class="tech-only" style="white-space:nowrap;font-size:12px;color:var(--color-text-secondary)">${escapeHtml((agent.risks||[]).length)} risks</td></tr>`;
  }).join('');
  const graphTrace='';
  const roadmap=(agentReviewResult.roadmap||[]).map((item,index)=>{const bullets=(item.deliverables||[]).map(d=>`<li>${escapeHtml(d)}</li>`).join('');return `<div class="rm-phase"><div class="rm-rail"><div class="rm-node">${index+1}</div><div class="rm-line"></div></div><div class="rm-body"><div class="rm-head"><div class="rm-title">${escapeHtml(item.phase||'-')}</div><span class="rm-badge">${escapeHtml(item.timeline||'-')}</span></div><ul class="rm-deliverables tech-only">${bullets}</ul><div class="rm-footer tech-only"><div class="rm-meta-row"><span class="rm-meta-label rm-owner-label">Owner</span><span class="rm-meta-val">${escapeHtml(item.owner||'-')}</span></div><div class="rm-meta-row"><span class="rm-meta-label rm-done-label">Done when</span><span class="rm-meta-val">${escapeHtml(item.done_when||'-')}</span></div></div></div></div>`;}).join('');
  const nextSteps=(agentReviewResult.next_steps||[]).map((item,index)=>`<div class="step-item"><div class="step-n">${index+1}</div><div class="step-text">${escapeHtml(item)}</div></div>`).join('');
  const reviewerWorkflow='';
  const agentGate=`<div class="client-ready-gate card tech-only fail"><div class="card-head"><div class="card-head-dot"></div>Client-ready approval gate</div><div class="gate-summary"><div><div class="review-label">Approval status</div><strong>Human validation required</strong><p>The review can be discussed with the client, but final approval requires evidence for assumptions, data classification, PCI/privacy scope, residency, budget, rollout gates, NFRs, and system ownership.</p></div><div class="gate-score fail">DRAFT</div></div><div class="review-section-title">Evidence required</div><ul class="review-gates"><li>Validate data classification, PCI/privacy scope, residency, budget, rollout gates, and system ownership.</li><li>Confirm runtime, technology, integration, observability, HA/DR, and support-model choices.</li><li>Run acceptance tests for peak load, replay/idempotency, rollback, payment boundary, privacy deletion, and AI safety.</li></ul></div>`;
  outDiv.innerHTML=[
    viewBar,
    execBanner,
    validationCard,
    `<div class="architecture-board card tech-only"><div class="card-head"><div class="card-head-dot"></div>Architecture review board</div><div class="board-summary"><div><div class="review-label">Board posture</div><strong>${escapeHtml(board.status||'Review')}</strong><p>${escapeHtml(board.workload_profile?.primary||'Retail architecture review')} across security, compliance, governance, and FinOps.</p></div><div class="board-score-big ${board.average<7?'low':board.average<8?'warn':'pass'}">${escapeHtml(board.average||'-')}<span>/10</span></div></div><div class="board-grid">${boardRows||'<div class="validation-item">No board checks returned.</div>'}</div></div>`,
    agentGate,
    reviewPack,
    consultingPack,
    `<div class="out-summary">${escapeHtml(rec.executive_summary||'Architecture review completed.')}</div>`,
    `<div class="tier-selector">${agentScopeCards||'<div class="tier-card active"><div class="tier-card-label">No review areas returned</div></div>'}</div>`,
    `<div class="card"><div class="card-head"><div class="card-head-dot"></div>Specialist review summary</div><table class="stack-table"><thead><tr><th style="width:160px">Review area</th><th>Customer-facing recommendation</th><th class="tech-only" style="width:100px">Risks</th></tr></thead><tbody>${agentRows||'<tr><td colspan="3">No specialist output returned.</td></tr>'}</tbody></table></div>`,
    `<div class="card tech-only"><div class="card-head"><div class="card-head-dot"></div>Recommendations by review area</div><div class="review-table-wrap"><table class="review-table"><thead><tr><th>Review area</th><th>Recommendation</th><th>Evidence to validate</th></tr></thead><tbody>${specialistRows||'<tr><td colspan="3">No specialist output returned.</td></tr>'}</tbody></table></div></div>`,
    `<div class="card tech-only"><div class="card-head"><div class="card-head-dot"></div>FinOps cost model</div><div class="consulting-columns"><div><div class="review-section-title">Cost drivers</div><ul class="review-gates">${costDrivers||'<li>No FinOps cost drivers returned.</li>'}</ul></div><div><div class="review-section-title">Pricing assumptions</div><div class="review-table-wrap"><table class="review-table"><thead><tr><th>Assumption</th><th>Value</th></tr></thead><tbody>${pricingAssumptions||'<tr><td colspan="2">No workload pricing assumptions returned.</td></tr>'}</tbody></table></div></div></div></div>`,
    `<div class="card"><div class="card-head"><div class="card-head-dot"></div>Risk register</div>${risks||'<div class="validation-item">No risks returned.</div>'}</div>`,
    `<div class="card tech-only"><div class="card-head"><div class="card-head-dot"></div>Decision rationale</div>${decisions||'<div class="validation-item">No decisions returned.</div>'}</div>`,
    conflicts?`<div class="card tech-only"><div class="card-head"><div class="card-head-dot"></div>Conflicts and validation gaps</div>${conflicts}</div>`:'',
    `<div class="card"><div class="card-head"><div class="card-head-dot"></div>Validation roadmap</div><div class="roadmap-timeline">${roadmap}</div></div>`,
    `<div class="card"><div class="card-head"><div class="card-head-dot"></div>Immediate next steps</div>${nextSteps}</div>`,
    `<div class="card"><div class="card-head"><div class="card-head-dot"></div>Disclaimer</div><div class="risk-fix">${escapeHtml(agentReviewResult.disclaimer)}</div></div>`,
    `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;gap:1rem;flex-wrap:wrap"><button class="btn" onclick="newEngagement()">New engagement</button><div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn" onclick="printReviewDraft()">Print review draft</button><button class="btn pri" disabled>Client-ready export</button></div></div>`
  ].join('');
  setAudience(AUDIENCE_VIEW);
}

async function runAgentReview(){
  const outDiv=document.getElementById('out');
  if(!outDiv) return;
  outDiv.innerHTML='<div class="card"><div class="card-head"><div class="card-head-dot"></div>Agent review running</div><div class="risk-fix">Security, compliance, governance, infrastructure, technology, storage, API, AI, UI, FinOps, and synthesis agents are reviewing the current form inputs.</div></div>';
  try{
    const payload={
      mode:'retail-agent-review',
      useModel:true,
      state:S,
      query:`Review this retail architecture request for ${S.basics.company||'the client'}: ${S.basics.problem||''} ${S.basics.constraints||''}`
    };
    const res=await fetch('/api/agents/architect',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await res.json();
    if(!res.ok) throw new Error(data?.error?.message||`Agent review failed with HTTP ${res.status}`);
    logEvent('info','agents.review_completed',{agents:data.agents_used,board:data.review_gate?.architecture_board?.average,hasSynthesis:Boolean(data.architecture_recommendation?.tiers?.length)});
    const synthesized=data.architecture_recommendation||data.synthesis_recommendation;
    if(Array.isArray(synthesized?.tiers)&&synthesized.tiers.length){
      LAST_VALIDATION=data.review_gate?.validation||null;
      showOutput(synthesized,[],null,LAST_VALIDATION);
    }else{
      renderAgentReview(data);
    }
  }catch(err){
    logEvent('error','agents.review_failed',{message:err.message});
    outDiv.innerHTML=`<div class="err-box" style="margin-top:1rem"><strong>Agent review failed.</strong> ${escapeHtml(err.message)}</div>`;
  }
}

export function sp(key,value){
  S.cost[key]=value;
  render();
}

export function go(delta){
  const nextStep=Math.max(0,Math.min(STEPS.length-1,S.step+delta));
  if(nextStep!==S.step) logEvent('info','ui.step_changed',{from:STEPS[S.step],to:STEPS[nextStep]});
  S.step=nextStep;
  render();
}

function extractJsonObject(raw){
  const stripped=String(raw||'').replace(/^```json\s*|^```\s*|\s*```$/gm,'').trim();
  const start=stripped.indexOf('{');
  const end=stripped.lastIndexOf('}');
  if(start===-1||end===-1||end<start) throw new Error('Model response did not contain a valid JSON object.');
  return stripped.slice(start,end+1);
}

function removeTrailingCommas(text){
  return String(text||'').replace(/,\s*([}\]])/g,'$1');
}

function normalizeJsonTypography(text){
  return String(text||'')
    .replace(/[\u201C\u201D]/g,'"')
    .replace(/[\u2018\u2019]/g,"'")
    .replace(/\u00A0/g,' ');
}

function escapeLikelyInnerQuotes(text){
  const source=String(text||'');
  let out='';
  let inString=false;
  let escaping=false;

  const nextNonWhitespace=idx=>{
    for(let i=idx;i<source.length;i++){
      if(!/\s/.test(source[i])) return source[i];
    }
    return '';
  };

  for(let i=0;i<source.length;i++){
    const ch=source[i];
    if(!inString){
      if(ch==='"') inString=true;
      out+=ch;
      continue;
    }
    if(escaping){
      out+=ch;
      escaping=false;
      continue;
    }
    if(ch==='\\'){
      out+=ch;
      escaping=true;
      continue;
    }
    if(ch==='"'){
      const next=nextNonWhitespace(i+1);
      const isClosing=!next || next===',' || next==='}' || next===']' || next===':';
      if(isClosing){
        inString=false;
        out+=ch;
      }else{
        out+='\\"';
      }
      continue;
    }
    out+=ch;
  }

  return out;
}

function tryParseJsonCandidate(candidate,label){
  try{
    return {ok:true,value:JSON.parse(candidate),label};
  }catch{
    return {ok:false,value:null,label};
  }
}

function attemptLocalJsonRecovery(raw){
  const jsonText=extractJsonObject(raw);
  const candidates=[
    {label:'raw',text:jsonText},
    {label:'normalized_typography',text:normalizeJsonTypography(jsonText)},
    {label:'remove_trailing_commas',text:removeTrailingCommas(jsonText)},
    {label:'escape_inner_quotes',text:escapeLikelyInnerQuotes(jsonText)},
    {label:'normalized_and_trailing_commas',text:removeTrailingCommas(normalizeJsonTypography(jsonText))},
    {label:'normalized_and_escape_quotes',text:escapeLikelyInnerQuotes(normalizeJsonTypography(jsonText))},
    {label:'full_cleanup',text:escapeLikelyInnerQuotes(removeTrailingCommas(normalizeJsonTypography(jsonText)))}
  ];

  const seen=new Set();
  for(const candidate of candidates){
    if(seen.has(candidate.text)) continue;
    seen.add(candidate.text);
    const parsed=tryParseJsonCandidate(candidate.text,candidate.label);
    if(parsed.ok) return parsed;
  }
  return null;
}

function extractModelText(data){
  const content=data?.choices?.[0]?.message?.content;
  if(typeof content==='string' && content.trim()) return content;
  if(Array.isArray(content)){
    const joined=content.map(part=>{
      if(typeof part==='string') return part;
      if(typeof part?.text==='string') return part.text;
      if(typeof part?.content==='string') return part.content;
      return '';
    }).join('').trim();
    if(joined) return joined;
  }
  if(typeof data?.output_text==='string' && data.output_text.trim()) return data.output_text;
  if(Array.isArray(data?.output)){
    const joined=data.output.flatMap(item=>Array.isArray(item?.content)?item.content:[item?.content]).map(part=>{
      if(typeof part==='string') return part;
      if(typeof part?.text==='string') return part.text;
      if(typeof part?.content==='string') return part.content;
      return '';
    }).join('').trim();
    if(joined) return joined;
  }
  return '';
}

function extractParsedObject(data){
  if(Array.isArray(data?.output)){
    for(const item of data.output){
      const contentParts=Array.isArray(item?.content)?item.content:[item?.content];
      for(const part of contentParts){
        if(part && typeof part.parsed==='object' && part.parsed!==null) return part.parsed;
      }
    }
  }
  return null;
}

function parseModelJson(raw){
  const jsonText=extractJsonObject(raw);
  try{
    return JSON.parse(jsonText);
  }catch(err){
    const recovered=attemptLocalJsonRecovery(raw);
    if(recovered?.ok){
      logEvent('warn','generation.parse_locally_recovered',{strategy:recovered.label});
      return recovered.value;
    }
    const match=String(err?.message||'').match(/position (\d+)/);
    if(match){
      const pos=Number(match[1]);
      const start=Math.max(0,pos-120);
      const end=Math.min(jsonText.length,pos+120);
      const snippet=jsonText.slice(start,end).replace(/\s+/g,' ').trim();
      logEvent('error','generation.parse_failed',{message:err.message,position:pos,snippet});
      throw new Error(`${err.message}. Around error: ${snippet}`);
    }
    logEvent('error','generation.parse_failed',{message:err.message});
    throw err;
  }
}

async function repairModelJson(raw,err){
  const snippet=String(raw||'').slice(0,24000);
  const reason=err?.message||'Invalid JSON';
  const prompt=`You returned invalid JSON. Fix it to match the required JSON schema.
Error: ${reason}

Return ONLY a valid JSON object. Do not include markdown or code fences.
RAW OUTPUT:
${snippet}`;
  const request={
    apiPath:'/v1/responses',
    model:'gpt-5.4',
    reasoning:{effort:'none'},
    max_output_tokens:4000,
    tools:[],
    instructions:'You are a JSON repair assistant. Output only a valid JSON object that matches the provided schema.',
    text:{format:{type:'json_schema',name:'architectiq_recommendation',schema:RESPONSE_SCHEMA,strict:true}},
    input:prompt
  };
  const headers=SERVER_CONFIG.openaiKeyConfigured?{'X-LLM-Force':'openai'}:{};
  const data=await callOpenAI(request,{headers});
  const parsed=extractParsedObject(data);
  if(parsed) return parsed;
  const fixedRaw=extractModelText(data);
  if(!fixedRaw) throw new Error('JSON repair returned empty output.');
  return parseModelJson(fixedRaw);
}

function normalizeArchitectureDiagram(value){
  const diagram=String(value||'').trim();
  if(!diagram) return '';
  const withHeader=diagram.startsWith('architecture-beta')?diagram:`architecture-beta\n${diagram}`;
  const lines=withHeader.split('\n');
  const seenGroups=new Set();
  const seenServices=new Set();
  const serviceParents=new Map();
  const groupUsage=new Map();
  const headerLines=[];
  const groupLines=[];
  const serviceLines=[];
  const rawEdgeLines=[];
  const edgeLines=[];
  const otherLines=[];

  for(const originalLine of lines){
    const line=originalLine.trimEnd();
    if(!line.trim()){
      continue;
    }
    if(/^architecture-beta\b/.test(line.trim())){
      headerLines.push('architecture-beta');
      continue;
    }
    if(/^(\s*)junction\b/.test(line)){
      logEvent('warn','diagram.junction_removed',{line:line.trim()});
      continue;
    }
    if(/--/.test(line)){
      const trimmed=line.trim();
      const normalizedEdge=trimmed.replace(
        /^([A-Za-z0-9_]+):([TBLR])\s+([<>-]+)\s+([A-Za-z0-9_]+):([TBLR])$/,
        (_,fromService,fromSide,arrow,toService,toSide)=>`${fromService}:${fromSide} ${arrow} ${toSide}:${toService}`
      );
      if(normalizedEdge!==trimmed){
        logEvent('warn','diagram.edge_normalized',{from:trimmed,to:normalizedEdge});
      }
      rawEdgeLines.push(normalizedEdge);
      continue;
    }
    const match=line.match(/^(\s*)(group|service)\s+([A-Za-z0-9_]+)\(([^)]+)\)(.*)$/);
    if(!match){
      otherLines.push(line.trim());
      continue;
    }
    const [,indent,kind,id,iconName,restRaw]=match;
    const icon=String(iconName||'').trim();
    const mapped=MERMAID_ICON_FALLBACKS[icon] || (MERMAID_ARCHITECTURE_ICONS.has(icon)?icon:'cloud');
    if(mapped!==icon){
      logEvent('warn','diagram.icon_normalized',{id,from:icon,to:mapped,kind});
    }
    let rest=restRaw;
    if(/\sin\s+[A-Za-z0-9_]+/.test(rest)){
      const parent=(rest.match(/\sin\s+([A-Za-z0-9_]+)/)||[])[1]||'';
      if(kind==='group'){
        logEvent('warn','diagram.nested_group_removed',{id,parent});
        rest=rest.replace(/\s+in\s+[A-Za-z0-9_]+/,'');
      }else{
        if(!seenGroups.has(parent)){
          logEvent('warn','diagram.group_reference_removed',{id,parent});
          rest=rest.replace(/\s+in\s+[A-Za-z0-9_]+/,'');
        }else{
          groupUsage.set(parent,(groupUsage.get(parent)||0)+1);
          serviceParents.set(id,parent);
        }
      }
    }
    rest=rest.replace(/\[([^\]]*)\]/,(_,labelRaw)=>{
      const label=String(labelRaw||'').replace(/[^A-Za-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()||id;
      if(label!==String(labelRaw||'')){
        logEvent('warn','diagram.label_normalized',{id,from:String(labelRaw||''),to:label});
      }
      return `[${label}]`;
    });
    const rewritten=`${indent}${kind} ${id}(${mapped})${rest}`;
    if(kind==='group') groupLines.push(rewritten.trim());
    else serviceLines.push(rewritten.trim());
    if(kind==='group') seenGroups.add(id);
    else seenServices.add(id);
  }

  for(const edgeLine of rawEdgeLines){
    const match=edgeLine.match(/^([A-Za-z0-9_]+)(\{group\})?:([TBLR])\s+([<>-]+)\s+([TBLR]):([A-Za-z0-9_]+)(\{group\})?$/);
    if(!match){
      logEvent('warn','diagram.edge_removed',{line:edgeLine,reason:'unrecognized_edge_shape'});
      continue;
    }
    const [,fromService,,fromSide,arrow,toSide,toService]=match;
    if(!seenServices.has(fromService) || !seenServices.has(toService)){
      logEvent('warn','diagram.edge_removed',{
        line:edgeLine,
        reason:!seenServices.has(fromService)&&!seenServices.has(toService)
          ?'missing_source_and_target_service'
          :(!seenServices.has(fromService)?'missing_source_service':'missing_target_service')
      });
      continue;
    }
    const fromGroup=serviceParents.get(fromService)||'';
    const toGroup=serviceParents.get(toService)||'';
    const crossesGroups=!!fromGroup && !!toGroup && fromGroup!==toGroup;
    const normalizedFrom=crossesGroups?`${fromService}{group}`:fromService;
    const normalizedTo=crossesGroups?`${toService}{group}`:toService;
    const groupedEdge=`${normalizedFrom}:${fromSide} ${arrow} ${toSide}:${normalizedTo}`;
    if(groupedEdge!==edgeLine){
      logEvent('warn','diagram.group_edge_normalized',{from:edgeLine,to:groupedEdge});
    }
    edgeLines.push(groupedEdge);
  }

  const usedGroupLines=groupLines.filter(line=>{
    const match=line.match(/^group\s+([A-Za-z0-9_]+)/);
    const groupId=match?match[1]:'';
    const used=(groupUsage.get(groupId)||0)>0;
    if(!used){
      logEvent('warn','diagram.group_removed',{group:groupId,reason:'unused_group'});
    }
    return used;
  });

  return [...new Set([
    ...headerLines,
    ...usedGroupLines,
    ...serviceLines,
    ...otherLines,
    ...edgeLines
  ])].join('\n')
    .replace(/\{group\}/g,'')
    .replace(/:[TBLR]\s+--\s+[TBLR]:j[A-Za-z0-9_]+/g,'')
    .replace(/j[A-Za-z0-9_]+:[TBLR]\s+-->\s+[TBLR]:/g,'');
}

function escapeMermaidLabel(value){
  return String(value||'').replace(/"/g,'\\"');
}

function sanitizeArchitectureLabel(value,fallback='Service'){
  const cleaned=String(value||'').replace(/[^A-Za-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
  return cleaned||fallback;
}

function sanitizeServiceId(value,fallback='svc'){
  const cleaned=String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
  return cleaned||fallback;
}

function extractPrimaryLabel(text,fallback){
  const source=sanitizeArchitectureLabel(text||'',fallback);
  const primary=source.split(/\s+(?:with|plus|behind|using|for|on|in|via|through|from)\s+/i)[0].trim()||fallback;
  const words=primary.split(/\s+/).filter(Boolean);
  return (words.length>5?words.slice(0,5).join(' '):primary)||fallback;
}

function findArchitectureLayer(stack,patterns){
  const list=Array.isArray(patterns)?patterns:[patterns];
  return stack.find(item=>{
    const layer=String(item?.layer||'').toLowerCase();
    return list.some(pattern=>layer.includes(String(pattern).toLowerCase()));
  })||null;
}

function findArchitectureLayerByText(stack,patterns){
  const list=Array.isArray(patterns)?patterns:[patterns];
  return stack.find(item=>{
    const text=`${item?.layer||''} ${item?.rec||''} ${item?.why||''}`.toLowerCase();
    return list.some(pattern=>text.includes(String(pattern).toLowerCase()));
  })||null;
}

function isAiArchitectureScenario(stack){
  const basics=(S&&S.basics)||{};
  const domain=String(basics.domain||'').toLowerCase();
  const scenarioText=getPlaybookText(S);
  const hasRetailProcess=hasRetailStoreEdgeSignals(scenarioText)
    ||hasRetailCommerceSignals(scenarioText)
    ||hasRetailSupplyChainSignals(scenarioText)
    ||hasRetailDataSignals(scenarioText)
    ||/payment|pci|p2pe|psp|fraud|moderni[sz]ation|migration|multi-brand|franchise|legacy|erp|esb/i.test(scenarioText);
  if(hasRetailSignals(scenarioText)&&hasRetailProcess){
    return false;
  }
  const stackText=stack.map(item=>`${item.layer||''} ${item.rec||''}`).join(' ').toLowerCase();
  const problemText=`${basics.problem||''} ${basics.stack||''}`.toLowerCase();
  if(/\bai\s*&\s*agentic\b|\bai\b|\bagentic\b/.test(domain)) return true;
  if(/\b(llm|rag|copilot|prompt|embedding|vector\s+store|langgraph|langchain|crewai|bedrock|openai|claude|gemini|mistral)\b/.test(stackText)) return true;
  return /\b(ai agent|ai copilot|llm|rag|chatbot|generative ai|model inference|prompt)\b/.test(problemText);
}

function pickPrimaryDatabaseLabel(databaseLayer,vectorLayer,fallback='Primary Database'){
  const databaseRec=String(databaseLayer?.rec||'').trim();
  if(databaseRec) return extractPrimaryLabel(databaseRec,fallback);
  const vectorRec=String(vectorLayer?.rec||'').trim();
  if(/postgres|aurora|rds|sql|cockroach|mysql|mariadb|oracle|dynamodb|documentdb|cosmos/i.test(vectorRec)){
    return extractPrimaryLabel(vectorRec,fallback);
  }
  return fallback;
}

function selectArchitectureServiceLabel(text,rules,fallback='Service'){
  const source=String(text||'');
  for(const [pattern,label] of rules){
    if(pattern.test(source)) return label;
  }
  return extractPrimaryLabel(source||fallback,fallback);
}

function extractArchitectureServiceLabels(text,rules){
  const source=String(text||'');
  const labels=[];
  for(const [pattern,label] of rules){
    if(pattern.test(source) && !labels.includes(label)) labels.push(label);
  }
  return labels;
}

function buildArchitectureFromRecommendation(result){
  const stack=Array.isArray(result?.stack)?result.stack:[];
  if(!stack.length) return '';
  const basics=(S&&S.basics)||{};
  const isAiScenario=isAiArchitectureScenario(stack);
  const constraints=`${basics.constraints||''} ${basics.stack||''} ${basics.problem||''}`.toLowerCase();
  const byLayer=name=>stack.find(item=>String(item.layer||'').toLowerCase().includes(name));
  const llmLayer=byLayer('llm')||byLayer('ai model');
  const orchestrationLayer=byLayer('orchestration');
  const vectorLayer=byLayer('vector');
  const computeLayer=byLayer('compute');
  const storageLayer=byLayer('storage');
  const databaseLayer=byLayer('database')||byLayer('sql')||byLayer('transaction');
  const apiLayer=byLayer('api');
  const obsLayer=byLayer('observability');
  const securityLayer=byLayer('security')||byLayer('auth');
  const integrationHint=`${constraints} ${(orchestrationLayer?.rec||'').toLowerCase()} ${(computeLayer?.rec||'').toLowerCase()}`;
  const useSalesforce=/salesforce/.test(integrationHint);
  const useQueue=/sqs|queue|service bus|pubsub|eventbridge/.test(`${computeLayer?.rec||''} ${orchestrationLayer?.rec||''}`.toLowerCase());
  const useCache=/redis|cache/.test(`${computeLayer?.rec||''} ${vectorLayer?.rec||''} ${storageLayer?.rec||''}`.toLowerCase());
  const useTrace=/langsmith|helicone/.test(`${obsLayer?.rec||''} ${llmLayer?.rec||''}`.toLowerCase());
  const useFallback=/fallback|azure openai|openai|bedrock|claude|gemini|mistral/.test(String(llmLayer?.rec||'').toLowerCase());

  const groups=isAiScenario?[
    {id:'edge',icon:'cloud',label:'Edge'},
    {id:'app',icon:'cloud',label:'Application'},
    {id:'ai',icon:'cloud',label:'AI'},
    {id:'data',icon:'cloud',label:'Data'},
    {id:'integ',icon:'cloud',label:'Integrations'},
    {id:'ops',icon:'cloud',label:'Ops'}
  ]:[
    {id:'store',icon:'server',label:'Store Edge'},
    {id:'regional',icon:'cloud',label:'Regional Runtime'},
    {id:'data',icon:'database',label:'Inventory Data'},
    {id:'integ',icon:'cloud',label:'Commerce Integrations'},
    {id:'ops',icon:'cloud',label:'Ops and Security'}
  ];
  const services=[];
  const seen=new Set();
  const addService=(id,icon,label,group)=>{
    const safeId=sanitizeServiceId(id,id);
    if(seen.has(safeId)) return safeId;
    seen.add(safeId);
    services.push({id:safeId,icon,label:sanitizeArchitectureLabel(label,label),group});
    return safeId;
  };

  const edgeLines=[];
  const addEdge=(from,fromSide,arrow,toSide,to)=>{
    if(!from || !to) return;
    const fromGroup=(services.find(item=>item.id===from)||{}).group||'';
    const toGroup=(services.find(item=>item.id===to)||{}).group||'';
    const cross=fromGroup && toGroup && fromGroup!==toGroup;
    edgeLines.push(`${cross?`${from}{group}`:from}:${fromSide} ${arrow} ${toSide}:${cross?`${to}{group}`:to}`);
  };

  if(isAiScenario){
    const users=addService('users','internet','Customers','edge');
    const ui=addService('ui','server',extractPrimaryLabel(apiLayer?.rec||'React Frontend','Web UI'),'edge');
    const edgeSec=addService('waf','cloud',/waf|cloudfront|cdn/.test((apiLayer?.rec||'').toLowerCase())?extractPrimaryLabel(apiLayer?.rec,'Secure Edge'):'Secure Edge','edge');

    const api=addService('api','server',extractPrimaryLabel(computeLayer?.rec||apiLayer?.rec||'API Service','API Service'),'app');
    const agent=addService('agent','server',extractPrimaryLabel(orchestrationLayer?.rec||'Agent Runtime','Agent Runtime'),'app');
    const queue=useQueue?addService('queue','server',/eventbridge/.test(`${computeLayer?.rec||''} ${orchestrationLayer?.rec||''}`.toLowerCase())?'Async Queue Bus':'Async Queue','app'):'';
    const worker=useQueue?addService('worker','server','Integration Worker','app'):'';

    const llm=addService('llm','cloud',extractPrimaryLabel(llmLayer?.rec||'Primary Model','Primary Model'),'ai');
    const fallback=useFallback?addService('fallback','cloud',/with\s+([^,]+)/i.test(llmLayer?.rec||'')?extractPrimaryLabel((llmLayer?.rec||'').split(/\bwith\b/i)[1]||'Fallback Model','Fallback Model'):'Fallback Model','ai'):'';
    const trace=useTrace?addService('trace','cloud',/langsmith/i.test(obsLayer?.rec||llmLayer?.rec||'')?'LangSmith':'Helicone','ai'):'';

    const db=addService('db','database',pickPrimaryDatabaseLabel(databaseLayer,vectorLayer,'Primary Database'),'data');
    const vec=vectorLayer?addService('vec','database',extractPrimaryLabel(vectorLayer.rec,'Vector Store'),'data'):'';
    const store=storageLayer?addService('store','disk',extractPrimaryLabel(storageLayer.rec,'Object Storage'),'data'):'';
    const cache=useCache?addService('cache','database','Cache','data'):'';

    const integration=useSalesforce?addService('sf','cloud','Salesforce CRM','integ'):addService('integ_api','cloud','External Systems','integ');
    const mon=addService('mon','cloud',/datadog/i.test(obsLayer?.rec||'')?'Datadog':extractPrimaryLabel(obsLayer?.rec||'Monitoring','Monitoring'),'ops');
    const sec=addService('sec','cloud',extractPrimaryLabel(securityLayer?.rec||'Security Controls','Security Controls'),'ops');

    addEdge(users,'R','-->','L',ui);
    addEdge(ui,'R','-->','L',edgeSec);
    addEdge(edgeSec,'B','-->','T',api);
    addEdge(api,'R','-->','L',agent);
    addEdge(agent,'B','-->','T',llm);
    addEdge(agent,'R','-->','L',fallback);
    addEdge(agent,'B','-->','T',trace);
    addEdge(api,'B','-->','T',db);
    addEdge(db,'R','-->','L',vec);
    addEdge(api,'R','-->','L',cache);
    addEdge(api,'B','-->','T',store);
    addEdge(api,'R','-->','L',queue);
    addEdge(queue,'B','-->','T',worker);
    addEdge(worker,'R','-->','L',integration);
    addEdge(api,'R','-->','L',mon);
    addEdge(db,'B','-->','T',sec);
    addEdge(store,'R','-->','L',sec);
  }else{
    const edgeLayer=findArchitectureLayerByText(stack,['edge runtime','linux appliance','greengrass','store edge','k3s']);
    const authLayer=findArchitectureLayerByText(stack,['offline auth','device trust','oidc','attestation']);
    const regionalLayer=findArchitectureLayerByText(stack,['regional runtime','regional stack','ecs','fargate']);
    const conflictLayer=findArchitectureLayerByText(stack,['conflict','reroute','orchestration worker']);
    const streamLayer=findArchitectureLayerByText(stack,['streaming','cdc','msk','kafka','nats','jetstream','queue']);
    const inventoryLayer=findArchitectureLayerByText(stack,['inventory truth','ledger','aurora','stock projection']);
    const privacyLayer=findArchitectureLayerByText(stack,['tokenization','privacy','tokenisation','pii']);
    const networkLayer=findArchitectureLayerByText(stack,['pci','network','vlan','payment']);
    const obsLayerOperational=findArchitectureLayerByText(stack,['observability','audit','sre','runbook']);

    const shoppers=addService('store_users','internet','Store customers and associates','store');
    const pos=addService('pos','server','POS lanes and mobile apps','store');
    const edgeRuntime=addService('store_edge','server',selectArchitectureServiceLabel(edgeLayer?.rec,[
      [/greengrass/i,'AWS IoT Greengrass edge appliance'],
      [/k3s/i,'k3s Linux store appliance'],
      [/linux/i,'Linux store appliance']
    ],'Store edge appliance'),'store');
    const localQueue=addService('local_queue','server',selectArchitectureServiceLabel(streamLayer?.rec||edgeLayer?.rec,[
      [/nats|jetstream/i,'NATS JetStream local queue'],
      [/rabbitmq/i,'RabbitMQ local queue'],
      [/queue/i,'Durable local queue']
    ],'Durable local queue'),'store');
    const auth=addService('offline_auth','cloud',selectArchitectureServiceLabel(authLayer?.rec,[
      [/oidc/i,'OIDC grace-mode auth'],
      [/attestation/i,'Device attestation'],
      [/certificate/i,'Device certificates']
    ],'Offline auth and device trust'),'store');

    const api=addService('regional_api','server',selectArchitectureServiceLabel(regionalLayer?.rec,[
      [/ecs|fargate/i,'Regional ECS services'],
      [/api/i,'Regional API control plane']
    ],'Regional API control plane'),'regional');
    const conflict=addService('conflict_engine','server',selectArchitectureServiceLabel(conflictLayer?.rec,[
      [/reroute/i,'Conflict and reroute engine'],
      [/orchestration/i,'Order orchestration workers']
    ],'Conflict and reroute engine'),'regional');
    const stream=addService('streaming','server',selectArchitectureServiceLabel(streamLayer?.rec,[
      [/msk/i,'Amazon MSK and CDC'],
      [/kafka/i,'Kafka event backbone'],
      [/nats/i,'NATS event backbone']
    ],'Event streaming and CDC'),'regional');

    const ledger=addService('ledger','database',selectArchitectureServiceLabel(inventoryLayer?.rec,[
      [/aurora/i,'Aurora inventory ledger'],
      [/postgres/i,'PostgreSQL inventory ledger'],
      [/ledger/i,'Append-only inventory ledger']
    ],'Inventory ledger and projections'),'data');
    const cache=addService('read_cache','database',useCache?'Availability cache':'Availability projections','data');
    const tokenVault=addService('token_vault','database',selectArchitectureServiceLabel(privacyLayer?.rec,[
      [/nitro/i,'Enclave-backed token vault'],
      [/kms/i,'KMS-backed token vault'],
      [/token/i,'PII token vault']
    ],'PII token vault'),'data');
    const audit=addService('audit_store','disk','Immutable audit and replay store','data');

    const commerce=addService('commerce','cloud','E-commerce CMS','integ');
    const erp=addService('erp','cloud','ERP POS core','integ');
    const payment=addService('payment','cloud','PSP P2PE rails','integ');

    const network=addService('pci_network','cloud',selectArchitectureServiceLabel(networkLayer?.rec,[
      [/vlan/i,'PCI VLAN segmentation'],
      [/firewall/i,'Deny-by-default store firewall']
    ],'PCI network controls'),'ops');
    const monitoring=addService('monitoring','cloud',selectArchitectureServiceLabel(obsLayerOperational?.rec,[
      [/opentelemetry/i,'OpenTelemetry and replay dashboards'],
      [/cloudwatch/i,'CloudWatch operations'],
      [/audit/i,'Audit and replay dashboards']
    ],'Observability and runbooks'),'ops');
    const security=addService('security','cloud',extractPrimaryLabel(securityLayer?.rec||'PKI KMS and certificate lifecycle','PKI and key lifecycle'),'ops');

    addEdge(shoppers,'R','-->','L',pos);
    addEdge(pos,'R','-->','L',edgeRuntime);
    addEdge(pos,'B','-->','T',payment);
    addEdge(auth,'B','-->','T',edgeRuntime);
    addEdge(edgeRuntime,'R','-->','L',localQueue);
    addEdge(localQueue,'R','-->','L',stream);
    addEdge(stream,'R','-->','L',api);
    addEdge(api,'B','-->','T',ledger);
    addEdge(ledger,'R','-->','L',cache);
    addEdge(api,'R','-->','L',conflict);
    addEdge(conflict,'R','-->','L',commerce);
    addEdge(conflict,'R','-->','L',erp);
    addEdge(pos,'B','-->','T',tokenVault);
    addEdge(ledger,'B','-->','T',audit);
    addEdge(network,'B','-->','T',edgeRuntime);
    addEdge(api,'B','-->','T',monitoring);
    addEdge(tokenVault,'R','-->','L',security);
  }

  const usedGroups=new Set(services.map(item=>item.group).filter(Boolean));
  const lines=['architecture-beta'];
  for(const group of groups){
    if(usedGroups.has(group.id)){
      lines.push(`group ${group.id}(${group.icon})[${sanitizeArchitectureLabel(group.label,group.label)}]`);
    }
  }
  for(const service of services){
    lines.push(`service ${service.id}(${service.icon})[${service.label}] in ${service.group}`);
  }
  for(const edge of edgeLines){
    lines.push(edge);
  }
  return lines.join('\n');
}

function convertArchitectureDiagramToFlowchart(diagram){
  const lines=String(diagram||'').split('\n').map(line=>line.trim()).filter(Boolean);
  if(!lines.length) return '';
  const groups=new Map();
  const groupOrder=[];
  const services=new Map();
  const standalone=[];
  const edges=[];

  for(const line of lines){
    let match=line.match(/^group\s+([A-Za-z0-9_]+)\([^)]+\)\[([^\]]+)\]$/);
    if(match){
      const [,id,label]=match;
      groups.set(id,{id,label});
      groupOrder.push(id);
      continue;
    }
    match=line.match(/^service\s+([A-Za-z0-9_]+)\([^)]+\)\[([^\]]+)\](?:\s+in\s+([A-Za-z0-9_]+))?$/);
    if(match){
      const [,id,label,groupId='']=match;
      services.set(id,{id,label,groupId});
      continue;
    }
    match=line.match(/^([A-Za-z0-9_]+)(?:\{group\})?:[TBLR]\s+[<>-]+\s+[TBLR]:([A-Za-z0-9_]+)(?:\{group\})?$/);
    if(match){
      edges.push([match[1],match[2]]);
    }
  }

  const groupServices=new Map();
  for(const groupId of groupOrder){
    groupServices.set(groupId,[]);
  }
  for(const service of services.values()){
    if(service.groupId && groupServices.has(service.groupId)){
      groupServices.get(service.groupId).push(service);
    }else{
      standalone.push(service);
    }
  }

  const out=['flowchart LR'];
  for(const groupId of groupOrder){
    const group=groups.get(groupId);
    const members=groupServices.get(groupId)||[];
    if(!group || !members.length) continue;
    out.push(`  subgraph ${group.id}["${escapeMermaidLabel(group.label)}"]`);
    out.push('    direction TB');
    for(const service of members){
      out.push(`    ${service.id}["${escapeMermaidLabel(service.label)}"]`);
    }
    out.push('  end');
  }
  for(const service of standalone){
    out.push(`  ${service.id}["${escapeMermaidLabel(service.label)}"]`);
  }
  for(const [from,to] of edges){
    if(services.has(from) && services.has(to)){
      out.push(`  ${from} --> ${to}`);
    }
  }
  return out.join('\n');
}

function summarizeArchitectureDiagram(diagram){
  const lines=String(diagram||'').split('\n').map(line=>line.trim()).filter(Boolean);
  const groups=[];
  const services=new Set();
  let edgeCount=0;
  let inSubgraph=false;
  for(const line of lines){
    let groupMatch=line.match(/^group\s+[A-Za-z0-9_]+\([^)]+\)\[([^\]]+)\]/);
    if(groupMatch) groups.push(groupMatch[1]);
    if(/^service\s+([A-Za-z0-9_]+)\([^)]+\)\[[^\]]+\]/.test(line)){
      services.add(line.match(/^service\s+([A-Za-z0-9_]+)/)[1]);
    }
    groupMatch=line.match(/^subgraph\s+[A-Za-z0-9_]+\["([^"]+)"\]/);
    if(groupMatch){
      groups.push(groupMatch[1]);
      inSubgraph=true;
      continue;
    }
    if(line==='end'){
      inSubgraph=false;
      continue;
    }
    const nodeMatch=line.match(/^([A-Za-z0-9_]+)\["[^"]+"\]/);
    if(nodeMatch && !line.startsWith('subgraph ')){
      services.add(nodeMatch[1]);
    }
    if(/--/.test(line)){
      edgeCount+=1;
      const edgeNodes=line.match(/[A-Za-z0-9_]+(?=\s*(?:--|$))/g)||[];
      for(const node of edgeNodes){
        if(node!=='subgraph'&&node!=='end'&&!inSubgraph) services.add(node);
      }
    }
  }
  const uniqueGroups=[...new Set(groups)];
  return {
    groups:uniqueGroups,
    groupCount:uniqueGroups.length,
    serviceCount:services.size,
    edgeCount
  };
}

function getArchitectureDisplayLabel(display){
  return display==='code' ? 'Code only' : display==='split' ? 'Split view' : 'Diagram only';
}

function getArchitectureDisplayNote(display){
  if(display==='code') return 'Python diagrams source is shown for export, debugging, and renderer iteration.';
  if(display==='split') return 'Server-rendered SVG and Python source stay visible together for faster review loops.';
  return 'Rendered diagram mode is optimized for architecture walkthroughs and stakeholder review.';
}

function buildArchitectureAnnotationModel(facts){
  const text=[
    facts?.securityRec,
    facts?.databaseRec,
    facts?.storageRec,
    facts?.queueRec,
    facts?.apiRec,
    facts?.edgeRec,
    facts?.workloadSegments?.join(' ')
  ].filter(Boolean).join(' ').toLowerCase();
  const hasPii=/pii|customer|loyalty|profile|phone|address|support|privacy|consent/.test(text);
  const hasPayment=/payment|psp|pci|token|pan|sad|card/.test(text);
  const hasSftp=/sftp|file transfer|batch/.test(text);
  const hasOnPrem=/on-?prem|data center|datacenter|legacy|erp|pos/.test(text);
  const cloud=/gcp|google/.test(text)?'GCP':/azure|aks|cosmos|service bus/.test(text)?'Azure':/aws|amazon|eks|aurora|rds|s3|msk/.test(text)?'AWS':'Cloud';
  return {
    annotations:[
      ['A1','User/service credentials stored in Secret Manager or equivalent.'],
      ['A2','System-to-system credentials encrypted with AES-256 and rotated by owner.'],
      ['CA1','Strong user authentication: MFA, KBA, passwordless, or step-up control.'],
      ['CA2','Basic username/password only; requires compensating MFA or policy review.'],
      ['R2','Encryption at rest using customer-supplied or customer-managed keys where required.'],
      ['R3','Encryption at rest using cloud-managed keys where risk and regulation permit.'],
      ['T','Encryption in transit using TLS 1.2+ / SSH or equivalent.'],
      ['C3','Class 3 operational/business data.'],
      ['C5','Class 5 sensitive PII/payment-adjacent data.'],
      ['C5E','Class 5 data with field/app-layer encryption or PGP where required.'],
      ['SB','External security boundary: firewall, WAF, IPS, segmentation, or PSP boundary.'],
      ['TB','Trust boundary: dotted boundary around different ownership or security zones.']
    ],
    active:[
      hasPii?'C5/C5E expected for customer, loyalty, support, and privacy stores.':'C3 expected unless discovery confirms PII/regulated data.',
      hasPayment?'SB required around PSP/token vault and PCI-scoped paths.':'Payment boundary not detected in this workload.',
      hasSftp?'SFTP feeds require SSH, key rotation, landing-zone scanning, and reconciliation evidence.':'Batch/SFTP feed not detected.',
      'T required on every inter-service and external integration flow.',
      'R2/R3 required before tokenization or masking is treated as sufficient.'
    ],
    network:[
      [cloud,'Primary cloud landing zone'],
      [hasOnPrem?'On-Prem DC':'External/SaaS','Legacy, SaaS, partner, or data-center systems'],
      ['Third Party','PSP, carrier, CRM, identity, observability, or AI provider']
    ],
    status:[
      ['Existing','Component unchanged from current estate.'],
      ['Updated','Existing component changed or hardened.'],
      ['New','New component introduced by target architecture.'],
      ['Supported','Dependency visible but outside direct build scope.']
    ]
  };
}

function buildArchitectureAnnotationLegend(facts){
  const model=buildArchitectureAnnotationModel(facts);
  const annotationRows=model.annotations.map(([code,desc])=>`<div class="annotation-row"><span class="annotation-code">${escapeHtml(code)}</span><span>${escapeHtml(desc)}</span></div>`).join('');
  const activeRows=model.active.map(item=>`<li>${escapeHtml(item)}</li>`).join('');
  const networkRows=model.network.map(([name,desc],index)=>`<div class="network-legend-row"><span class="network-swatch swatch-${index+1}"></span><div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(desc)}</span></div></div>`).join('');
  const statusRows=model.status.map(([name,desc],index)=>`<div class="status-legend-row"><span class="status-swatch status-${index+1}"></span><div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(desc)}</span></div></div>`).join('');
  return `<div class="architecture-side-section architecture-annotation-section"><div class="architecture-side-heading">Security annotations</div><div class="annotation-grid">${annotationRows}</div><div class="annotation-active"><div class="architecture-side-title">Expected controls in this view</div><ul>${activeRows}</ul></div></div><div class="architecture-side-section"><div class="architecture-side-heading">Network legend</div><div class="network-legend">${networkRows}</div></div><div class="architecture-side-section"><div class="architecture-side-heading">Component status</div><div class="status-legend">${statusRows}</div></div>`;
}

function annotationTagsForNode(nodeId,label,facts){
  const text=`${nodeId||''} ${label||''}`.toLowerCase();
  if(/\[(?:a1|a2|ca1|ca2|r2|r3|t|c3|c5|c5e|sb|tb)/i.test(label)) return '';
  if(/psp|payment|token|pci|pan|sad|vault|card/.test(text)) return 'SB,C5E,T,R2,A1';
  if(/customer|consent|pii|privacy|loyalty|profile|support|crm|rag|chatbot/.test(text)) return 'C5E,T,R2,A1';
  if(/waf|cdn|gateway|edge|firewall|bot|ingress|proxy/.test(text)) return 'SB,T,A1';
  if(/secret|kms|hsm|pki|certificate|identity|auth|oidc|mfa|iam/.test(text)) return 'A1,CA1,R2,T';
  if(/database|ledger|order|audit|reservation|inventory|event|queue|stream|dlq|schema|store|lakehouse|warehouse/.test(text)) return 'C3,R2,T';
  if(/erp|oms|wms|carrier|external|saas|partner|supplier/.test(text)) return 'TB,T,A2';
  if(/ai|model|recommend|ranking|llm|gemini|openai|bedrock|claude/.test(text)) return facts?.hasRetailAiPath?'C5E,T,A1':'T,A1';
  if(/user|shopper|associate|employee|admin|ops|merchant|merch/.test(text)) return 'CA1,T';
  return 'T';
}

function annotateDiagramNodeLabels(code,facts){
  return String(code||'').replace(/([A-Za-z_][A-Za-z0-9_]*)\["([^"]+)"\]/g,(match,nodeId,label)=>{
    if(/^subgraph$/i.test(nodeId)) return match;
    const tags=annotationTagsForNode(nodeId,label,facts);
    if(!tags) return match;
    const compact=label.length>58?`${label.slice(0,55)}...`:label;
    return `${nodeId}["${compact}\\n[${tags}]"]`;
  });
}

function annotateDiagramGroups(code){
  const replacements=[
    [/subgraph\s+edge\["([^"]+)"\]/g,'subgraph edge["$1 | Cloud/edge zone | SB,T"]'],
    [/subgraph\s+commit\["([^"]+)"\]/g,'subgraph commit["$1 | Updated critical zone | C5E,R2,T"]'],
    [/subgraph\s+commerce\["([^"]+)"\]/g,'subgraph commerce["$1 | Updated runtime zone | T,A1"]'],
    [/subgraph\s+data\["([^"]+)"\]/g,'subgraph data["$1 | Data trust zone | R2/R3,C3/C5"]'],
    [/subgraph\s+external\["([^"]+)"\]/g,'subgraph external["$1 | External/SaaS zone | TB,T,A2"]'],
    [/subgraph\s+integrations\["([^"]+)"\]/g,'subgraph integrations["$1 | External/SaaS zone | TB,T,A2"]'],
    [/subgraph\s+merchandising\["([^"]+)"\]/g,'subgraph merchandising["$1 | Updated decision zone | T,A1"]']
  ];
  return replacements.reduce((out,[pattern,replacement])=>out.replace(pattern,replacement),String(code||''));
}

function architectureCanvasLegendCode(){
  return `
  subgraph annotationLegend["Annotation legend"]
    annAuth["A1 secrets | CA1 MFA/step-up"]
    annCrypto["T transit | R2/R3 at-rest | C5E app/field encryption"]
    annBoundary["SB security boundary | TB trust boundary"]
  end
  subgraph networkLegend["Network legend"]
    netCloud["Cloud zone"]
    netExternal["External/SaaS"]
    netThird["Third party"]
  end
  subgraph statusLegend["Component status"]
    stExisting["Existing"]
    stUpdated["Updated"]
    stNew["New"]
    stSupported["Supported"]
  end`;
}

function embedArchitectureDiagramAnnotations(code,facts){
  const source=String(code||'');
  if(!/^flowchart\b/m.test(source)||source.includes('subgraph annotationLegend')) return source;
  const annotated=annotateDiagramGroups(annotateDiagramNodeLabels(source,facts));
  return `${annotated}${architectureCanvasLegendCode()}`;
}

function getArchitectureSignals(facts){
  const common=[
    {
      tone:'region',
      label:'Primary region',
      value:facts.region,
      note:'Deployment placement and residency anchor for the current recommendation.'
    },
    {
      tone:'data',
      label:facts.isAiScenario?'Data core':'Inventory core',
      value:`${facts.data}${facts.hasCache?' + cache':''}`,
      note:'Persistent state and fast-path data surfaces visible in the diagram.'
    },
    {
      tone:'integration',
      label:'Integration path',
      value:facts.hasSalesforce ? 'CRM handoff enabled' : facts.integration,
      note:facts.hasQueue ? 'Asynchronous handoff is part of the architecture flow.' : 'Direct integration path with optional background work.'
    }
  ];
  if(facts.isAiScenario){
    common.splice(1,0,{
      tone:'ai',
      label:'AI runtime',
      value:facts.hasFallback ? `${facts.llm} + fallback` : facts.llm,
      note:facts.hasFallback ? 'Cross-vendor fallback is represented in the topology.' : 'Single primary model path is shown in this view.'
    });
  }else{
    common.splice(1,0,{
      tone:'ai',
      label:'Store edge runtime',
      value:facts.orchestration,
      note:'Offline-capable local runtime is represented separately from the regional control plane.'
    });
  }
  return common;
}

function buildArchitectureRenderPayload(view,facts){
  return {
    panel:ARCHITECTURE_UI.panel,
    title:`${S?.basics?.company||'Client Platform'} - ${view.title}`,
    facts,
    code:view.code||view.visual||''
  };
}

function getArchitectureRenderCacheKey(payload){
  return JSON.stringify(payload);
}

async function fetchRenderedArchitecture(payload){
  const cacheKey=getArchitectureRenderCacheKey(payload);
  if(DIAGRAM_RENDER_CACHE[cacheKey]) return DIAGRAM_RENDER_CACHE[cacheKey];
  const res=await fetch('/api/diagram/render',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.error?.message||'Failed to render architecture diagram.');
  DIAGRAM_RENDER_CACHE[cacheKey]=data;
  return data;
}

export function setArchitecturePanel(panel){
  ARCHITECTURE_UI.panel=panel;
  if(window.__lastResult) showOutput(window.__lastResult,LAST_CONTRADICTIONS,LAST_RESEARCH,LAST_VALIDATION);
}

export function setArchitectureDisplay(display){
  ARCHITECTURE_UI.display=display;
  if(window.__lastResult) showOutput(window.__lastResult,LAST_CONTRADICTIONS,LAST_RESEARCH,LAST_VALIDATION);
}

async function copyArchitectureCode(){
  const code=document.getElementById('architecture-code')?.textContent||'';
  if(!code.trim()) return;
  try{
    await navigator.clipboard.writeText(code);
    logEvent('info','architecture.code_copied',{chars:code.length});
  }catch(err){
    logEvent('error','architecture.copy_failed',{message:err.message});
  }
}

function detectPrimaryRegion(){
  const text=`${S?.basics?.constraints||''} ${S?.basics?.stack||''} ${S?.nfr?.compliance||''}`.toLowerCase();
  if(/ap-southeast-2|sydney/.test(text)) return 'AWS ap southeast 2';
  if(/australia east/.test(text)) return 'Azure Australia East';
  if(/australia southeast1/.test(text)) return 'GCP australia southeast1';
  return 'Primary cloud region';
}

function detectArchitectureRegion(stack){
  const text=`${S?.basics?.constraints||''} ${S?.basics?.stack||''} ${S?.nfr?.compliance||''} ${stack.map(item=>`${item.layer||''} ${item.rec||''} ${item.why||''}`).join(' ')}`.toLowerCase();
  const regions=[];
  if(/us-east-1|us west|us region|\bus\b|united states/.test(text)) regions.push('US');
  if(/eu-central-1|eu-west|europe|eu stores|\beu\b|gdpr/.test(text)) regions.push('EU');
  if(/ap-southeast-2|sydney|australia|anz|new zealand|\bnz\b/.test(text)) regions.push('ANZ');
  if(regions.length>1) return `${regions.join(' / ')} regional stacks`;
  if(/ap-southeast-2|sydney/.test(text)) return 'AWS ap southeast 2';
  if(/australia east/.test(text)) return 'Azure Australia East';
  if(/australia southeast1/.test(text)) return 'GCP australia southeast1';
  return detectPrimaryRegion();
}

function getArchitectureFacts(result){
  const stack=Array.isArray(result?.stack)?result.stack:[];
  const isAiScenario=isAiArchitectureScenario(stack);
  const retailProfile=retailWorkloadProfile(S);
  const company=sanitizeArchitectureLabel(S?.basics?.company||'Client Platform','Client Platform');
  const llmLayer=findArchitectureLayer(stack,['llm','ai model']);
  const orchestrationLayer=findArchitectureLayer(stack,'orchestration');
  const vectorLayer=findArchitectureLayer(stack,['vector','retrieval']);
  const computeLayer=findArchitectureLayer(stack,['compute','runtime']);
  const storageLayer=findArchitectureLayer(stack,['storage','object']);
  const databaseLayer=findArchitectureLayer(stack,['database','transaction','sql'])||findArchitectureLayerByText(stack,['aurora','postgres','inventory ledger','inventory truth']);
  const apiLayer=findArchitectureLayer(stack,['api','frontend','edge']);
  const obsLayer=findArchitectureLayer(stack,['observability','monitoring','logging','tracing']);
  const securityLayer=findArchitectureLayer(stack,['security','auth','identity']);
  const recText=stack.map(item=>`${item.layer||''} ${item.rec||''}`).join(' ').toLowerCase();
  const edgeLayer=findArchitectureLayerByText(stack,['edge runtime','linux appliance','greengrass','store edge','k3s']);
  const regionalLayer=findArchitectureLayerByText(stack,['regional runtime','regional stack','ecs','fargate']);
  const streamLayer=findArchitectureLayerByText(stack,['streaming','cdc','msk','kafka','nats','jetstream','queue']);
  const conflictLayer=findArchitectureLayerByText(stack,['conflict','reroute','orchestration worker']);
  const privacyLayer=findArchitectureLayerByText(stack,['tokenization','privacy','tokenisation','pii']);
  const queueSource=`${computeLayer?.rec||''} ${orchestrationLayer?.rec||''} ${streamLayer?.rec||''}`;
  const monitoringSource=String(obsLayer?.rec||'');
  const securitySource=String(securityLayer?.rec||'');
  const securityServices=extractArchitectureServiceLabels(securitySource,[
    [/\bcognito\b/i,'Amazon Cognito'],
    [/\bkms\b|key management service/i,'AWS KMS'],
    [/secrets manager/i,'AWS Secrets Manager'],
    [/\biam\b/i,'AWS IAM']
  ]);
  const monitoringServices=extractArchitectureServiceLabels(monitoringSource,[
    [/\bcloudwatch\b/i,'Amazon CloudWatch'],
    [/\blangsmith\b/i,'LangSmith'],
    [/\bhelicone\b/i,'Helicone'],
    [/\bdatadog\b/i,'Datadog']
  ]);
  return {
    company,
    isAiScenario,
    hasRetailAiPath:retailProfile.hasAi,
    workload:retailProfile.primary,
    workloadSegments:retailProfile.segments,
    region:detectArchitectureRegion(stack),
    hasSalesforce:/salesforce/.test(recText),
    hasQueue:/sqs|queue|eventbridge|service bus|pubsub|msk|kafka|nats|jetstream|cdc/.test(recText),
    hasCache:/redis|cache/.test(recText),
    hasTrace:isAiScenario&&/langsmith|helicone/.test(recText),
    hasFallback:isAiScenario&&/fallback|azure openai|openai|bedrock|claude|gemini|mistral/.test(recText),
    ui:selectArchitectureServiceLabel(apiLayer?.rec,[
      [/\bamplify\b/i,'AWS Amplify'],
      [/\bvercel\b/i,'Vercel Frontend'],
      [/\bnext(?:\.js)?\b/i,'Next.js frontend'],
      [/\breact\b/i,'React frontend']
    ],isAiScenario?'Frontend':'POS lanes and mobile apps'),
    edge:selectArchitectureServiceLabel(apiLayer?.rec,[
      [/\bwaf\b/i,'AWS WAF'],
      [/\bcloudfront\b/i,'Amazon CloudFront'],
      [/\bapi gateway\b/i,'Amazon API Gateway']
    ],isAiScenario?'Secure Edge':'Store edge appliance'),
    api:selectArchitectureServiceLabel((isAiScenario?computeLayer?.rec:regionalLayer?.rec)||apiLayer?.rec,[
      [/\bapp runner\b/i,'AWS App Runner'],
      [/\bfargate\b/i,'AWS Fargate'],
      [/\becs\b/i,'Amazon ECS'],
      [/\blambda\b/i,'AWS Lambda'],
      [/\bapi gateway\b/i,'Amazon API Gateway']
    ],isAiScenario?'API Service':'Regional API control plane'),
    orchestration:selectArchitectureServiceLabel((isAiScenario?orchestrationLayer?.rec:edgeLayer?.rec)||conflictLayer?.rec,[
      [/\blanggraph\b/i,'LangGraph Runtime'],
      [/\btemporal\b/i,'Temporal Workflow'],
      [/\bstep functions\b/i,'AWS Step Functions'],
      [/greengrass/i,'AWS IoT Greengrass edge'],
      [/k3s/i,'k3s Linux store appliance'],
      [/linux/i,'Linux store appliance']
    ],isAiScenario?'Agent Runtime':'Store edge autonomy'),
    llm:isAiScenario?extractPrimaryLabel(llmLayer?.rec||'Primary Model','Primary Model'):'No AI runtime',
    fallback:isAiScenario?extractPrimaryLabel((llmLayer?.rec||'').split(/\bwith\b/i)[1]||'Fallback Model','Fallback Model'):'Not applicable',
    vector:isAiScenario?selectArchitectureServiceLabel(vectorLayer?.rec,[
      [/\bpgvector\b/i,'pgvector'],
      [/\bpinecone\b/i,'Pinecone'],
      [/\bopensearch\b/i,'OpenSearch Vector'],
      [/\bweaviate\b/i,'Weaviate']
    ],'Vector Store'):'Inventory projections',
    data:pickPrimaryDatabaseLabel(databaseLayer,vectorLayer,'Primary Database'),
    store:selectArchitectureServiceLabel(storageLayer?.rec,[
      [/\bs3 standard\b/i,'Amazon S3 Standard'],
      [/\bs3\b/i,'Amazon S3'],
      [/blob storage/i,'Blob Storage']
    ],isAiScenario?'Object Storage':'Immutable audit and replay store'),
    queue:selectArchitectureServiceLabel(queueSource,[
      [/\bmsk\b/i,'Amazon MSK and CDC'],
      [/\bkafka\b/i,'Kafka event backbone'],
      [/\bnats\b|\bjetstream\b/i,'NATS JetStream queue'],
      [/\bsqs\b/i,'Amazon SQS'],
      [/\beventbridge\b/i,'Amazon EventBridge'],
      [/service bus/i,'Azure Service Bus'],
      [/pubsub/i,'GCP Pub/Sub']
    ],isAiScenario?'Async Queue':'Event stream and offline queue'),
    monitoring:selectArchitectureServiceLabel(monitoringSource,[
      [/\bcloudwatch\b/i,'Amazon CloudWatch'],
      [/\bdatadog\b/i,'Datadog'],
      [/\blangsmith\b/i,'LangSmith']
    ],'Monitoring'),
    security:securityServices.join(' + ')||selectArchitectureServiceLabel(securitySource,[
      [/\bcognito\b/i,'Amazon Cognito'],
      [/\bkms\b|key management service/i,'AWS KMS'],
      [/secrets manager/i,'AWS Secrets Manager'],
      [/\biam\b/i,'AWS IAM']
    ],isAiScenario?'Security Controls':'PKI PCI and key controls'),
    integration:isAiScenario?(/salesforce/.test(recText)?'Salesforce CRM':'External Systems'):'ERP POS Ecommerce PSP',
    tokenization:selectArchitectureServiceLabel(privacyLayer?.rec,[
      [/nitro/i,'Enclave-backed token vault'],
      [/kms/i,'KMS-backed token vault'],
      [/token/i,'PII token vault']
    ],'PII token vault'),
    conflict:selectArchitectureServiceLabel(conflictLayer?.rec,[
      [/reroute/i,'Conflict and reroute engine'],
      [/orchestration/i,'Order orchestration workers']
    ],'Conflict and reroute engine'),
    monitoringServices,
    securityServices,
    uiRec:String(apiLayer?.rec||''),
    edgeRec:String(apiLayer?.rec||''),
    apiRec:String(computeLayer?.rec||apiLayer?.rec||''),
    orchestrationRec:String(orchestrationLayer?.rec||''),
    llmRec:String(llmLayer?.rec||''),
    vectorRec:String(vectorLayer?.rec||''),
    databaseRec:String(databaseLayer?.rec||''),
    storageRec:String(storageLayer?.rec||''),
    monitoringRec:monitoringSource,
    securityRec:securitySource,
    queueRec:queueSource
  };
}

function buildRetailWorkloadDiagrams(facts){
  const workload=String(facts.workload||'').toLowerCase();
  if(workload.includes('digital commerce')){
    const aiSolutionNodes=facts.hasRetailAiPath?`
    aiGateway["AI gateway policy trace cost controls"]
    recommend["Recommendations and ranking"]
    supportBot["RAG support chatbot"]
    humanSupport["Human support escalation"]`:'';
    const aiSolutionFlows=facts.hasRetailAiPath?`
  storefront --> aiGateway
  aiGateway --> recommend
  aiGateway --> supportBot
  supportBot --> humanSupport
  aiGateway --> audit`:'';
    const aiDeploymentNodes=facts.hasRetailAiPath?`
    aiGateway["AI gateway redaction tracing spend caps"]
    recs["Recommendation model path"]
    chatbot["RAG chatbot support path"]
    human["CRM human escalation"]`:'';
    const aiDeploymentFlows=facts.hasRetailAiPath?`
  storefront --> aiGateway
  aiGateway --> recs
  aiGateway --> chatbot
  chatbot --> human
  aiGateway --> audit`:'';
      return {
      contextCode:`flowchart LR
  shoppers["Online shoppers"]
  merch["Merchandising team"]
  platform["${escapeMermaidLabel(facts.company)} commerce platform"]
  catalogue["Product catalogue and search"]
  checkout["Cart checkout and payment token flow"]
  oms["OMS fulfilment promises"]
  psp["PSP and fraud provider"]
  ops["Ops Security and Compliance"]
  shoppers --> platform
  merch --> catalogue
  platform --> catalogue
  platform --> checkout
  checkout --> oms
  checkout --> psp
  platform --> ops`,
      solutionCode:`flowchart TB
  subgraph edge["Customer edge and channel reads"]
    shoppers["Online shoppers and apps"]
    cdn["CDN WAF bot controls"]
    storefront["Storefront BFF browse search"]
  end
  subgraph commit["Revenue critical commit path"]
    cart["Cart and session"]
    reservation["Inventory reservation authority"]
    checkout["Checkout order commit"]
    payment["PSP tokenized payment orchestration"]
    order["Order ledger OMS handoff"]
  end
  subgraph merchandising["Retail decision services"]
    catalogue["Product catalogue source"]
    search["Search and faceted read model"]
    pricing["Price and promotion ledger"]
    fraud["Fraud risk decision service"]
${aiSolutionNodes}
  end
  subgraph data["Data audit and replay"]
    events["Event backbone schema registry DLQ"]
    audit["Order payment promo audit"]
    privacy["Consent PII tokenization deletion"]
  end
  subgraph external["External retail systems"]
    erp["ERP product price finance"]
    fulfilment["OMS WMS carrier promise"]
    psp["External PSP token vault"]
    crm["CRM service support"]
  end
  shoppers --> cdn
  cdn --> storefront
  storefront --> search
  storefront --> cart
  cart --> reservation
  reservation --> checkout
  pricing --> checkout
  fraud --> checkout
  checkout --> payment
  payment --> psp
  checkout --> order
  order --> fulfilment
  catalogue --> search
  erp --> catalogue
  erp --> pricing
  checkout --> events
  events --> audit
  checkout --> privacy
  crm --> privacy
${aiSolutionFlows}`,
      deploymentCode:`flowchart TB
  subgraph edge["Customer edge"]
    cdn["CDN WAF bot controls"]
    storefront["Storefront and browse API"]
  end
  subgraph commerce["Commerce runtime"]
    cart["Cart and session service"]
    checkout["Checkout order commit"]
    promo["Promotion and pricing rules"]
    fraud["Fraud and PSP adapter"]
  end
  subgraph data["Commerce data"]
    catalogue["Catalogue search index"]
    orders["Order store"]
    reservations["Inventory reservation cache"]
    audit["Payment and promotion audit"]
  end
  subgraph integrations["Retail systems"]
    erp["ERP price and product feed"]
    oms["OMS fulfilment promise"]
    loyalty["Loyalty CRM"]
${aiDeploymentNodes}
  end
  cdn --> storefront
  storefront --> catalogue
  storefront --> cart
  cart --> checkout
  checkout --> fraud
  checkout --> orders
  checkout --> reservations
  promo --> checkout
  erp --> catalogue
  checkout --> oms
  checkout --> loyalty
  checkout --> audit
${aiDeploymentFlows}`,
      requestFlowCode:`flowchart LR
  browse["Campaign browse spike"] --> cdn["CDN WAF cache"]
  cdn --> catalogue["Catalogue and search"]
  catalogue --> cart["Cart service"]
  cart --> promise["Inventory reservation and promise"]
  promise --> checkout["Checkout commit"]
  checkout --> payment["PSP tokenisation"]
  checkout --> order["OMS order submission"]
  order --> fulfilment["Store/DC fulfilment"]
  checkout --> audit["Order payment promotion audit"]
  catalogue --> recommend["Optional recommendations degraded safely"]
  recommend --> browse`,
      summary:'This commerce topology separates browse spikes from checkout, order commit, payment tokens, promotion correctness, and fulfilment promises.',
      requestSubtitle:'How campaign traffic moves from browse to checkout without breaking payment, OMS, or inventory commit paths.',
      notes:['Campaign/read traffic is separated from order and payment commit paths.','Promotion, price, payment, and fulfilment promise ownership remain visible.','Best suited for commerce peak-readiness and checkout-resilience reviews.']
    };
  }
  if(workload.includes('data')||workload.includes('loyalty')){
    const aiDataNodes=facts.hasRetailAiPath?`
    recPolicy["Recommendation policy controls"]
    featureStore["Governed feature store"]
    modelEval["Model evaluation and drift checks"]`:'';
    const aiDataFlows=facts.hasRetailAiPath?`
  consent --> recPolicy
  profile --> featureStore
  featureStore --> modelEval
  recPolicy --> activation`:'';
    return {
      contextCode:`flowchart LR
  customers["Customers and loyalty members"]
  channels["POS ecommerce app email"]
  cdp["${escapeMermaidLabel(facts.company)} customer data platform"]
  consent["Consent and preference store"]
  warehouse["Analytics warehouse"]
  activation["Campaign activation tools"]
  privacy["Privacy and DSAR operations"]
  channels --> cdp
  customers --> channels
  cdp --> consent
  cdp --> warehouse
  cdp --> activation
  cdp --> privacy`,
      solutionCode:`flowchart TB
  subgraph sources["Retail sources"]
    pos["POS transactions"]
    commerce["Ecommerce events orders"]
    service["Support interactions"]
    loyalty["Loyalty enrolment"]
  end
  subgraph identity["Identity consent authority"]
    identityGraph["Identity resolution graph"]
    consent["Consent preference region authority"]
    privacy["DSAR deletion retention workflow"]
  end
  subgraph products["Customer data products"]
    profile["Customer 360 profile"]
    segments["Segment and eligibility store"]
    warehouse["Analytics warehouse lineage"]
${aiDataNodes}
  end
  subgraph activation["Allowed activation channels"]
    email["Email SMS campaign"]
    app["App push onsite"]
    cleanroom["Partner clean room retail media"]
  end
  sources --> identityGraph
  identityGraph --> consent
  consent --> profile
  profile --> segments
  profile --> warehouse
  segments --> email
  segments --> app
  segments --> cleanroom
  privacy --> profile
  privacy --> segments
  consent --> privacy
${aiDataFlows}`,
      deploymentCode:`flowchart TB
  subgraph ingest["Ingestion"]
    pos["POS events"]
    ecommerce["Clickstream and orders"]
    crm["CRM loyalty feed"]
    service["Service interactions"]
  end
  subgraph governance["Identity consent governance"]
    identity["Identity resolution"]
    consent["Consent enforcement"]
    quality["Data quality and lineage"]
  end
  subgraph data["Customer data products"]
    profile["Customer 360 profile"]
    segments["Segment store"]
    warehouse["Analytics warehouse"]
    deletion["Deletion and retention workflow"]
  end
  subgraph activation["Activation"]
    email["Email campaign"]
    app["App push"]
    onsite["Onsite personalisation"]
  end
  ingest --> identity
  identity --> consent
  consent --> profile
  profile --> segments
  profile --> warehouse
  consent --> activation
  deletion --> profile
  quality --> warehouse`,
      requestFlowCode:`flowchart LR
  event["Customer event arrives"] --> identify["Resolve identity"]
  identify --> consent["Check consent and region"]
  consent --> profile["Update governed profile"]
  profile --> segment["Refresh eligible segment"]
  segment --> activation["Activate allowed channel"]
  activation --> audit["Campaign lineage and consent audit"]
  consent --> deletion["Deletion retention workflow when requested"]`,
      summary:'This data and loyalty topology focuses on governed identity, consent, customer profiles, activation controls, deletion, and lineage.',
      requestSubtitle:'How customer events become consent-aware profiles and campaign activation without creating shadow data.',
      notes:['Consent and identity resolution are first-class controls.','Activation is gated by consent, region, retention, and auditability.','Best suited for privacy, marketing operations, and data governance reviews.']
    };
  }
  if(workload.includes('supply chain')||workload.includes('fulfil')){
    return {
      contextCode:`flowchart LR
  customers["Customers"]
  stores["Stores and pickers"]
  platform["${escapeMermaidLabel(facts.company)} fulfilment platform"]
  wms["WMS DC operations"]
  supplier["Supplier feeds"]
  carrier["Carrier APIs"]
  ops["Exception operations"]
  customers --> platform
  stores --> platform
  supplier --> platform
  platform --> wms
  platform --> carrier
  platform --> ops`,
      solutionCode:`flowchart TB
  subgraph demand["Demand and promise inputs"]
    ecommerce["Online orders"]
    forecast["Demand forecast"]
    capacity["Store DC capacity"]
    supplier["Supplier feed cadence"]
  end
  subgraph orchestration["Fulfilment decisioning"]
    promise["Delivery promise service"]
    reservation["Inventory reservation authority"]
    freshness["FEFO freshness expiry rules"]
    substitution["Human substitution approval queue"]
    exceptions["Late stale feed exception queue"]
  end
  subgraph operations["Retail operations"]
    wms["WMS pick waves"]
    storePick["Store picker app"]
    carrier["Carrier slot API"]
    support["Ops support dashboard"]
  end
  subgraph evidence["Control evidence"]
    ledger["Reservation promise ledger"]
    audit["Substitution promise audit"]
    replay["Replay DLQ dashboard"]
  end
  ecommerce --> promise
  forecast --> promise
  capacity --> promise
  supplier --> exceptions
  promise --> reservation
  reservation --> freshness
  freshness --> wms
  freshness --> storePick
  storePick --> substitution
  substitution --> promise
  promise --> carrier
  reservation --> ledger
  substitution --> audit
  exceptions --> support
  exceptions --> replay`,
      deploymentCode:`flowchart TB
  subgraph demand["Demand and promises"]
    orders["Online orders"]
    forecast["Demand forecast"]
    slots["Slot and store capacity"]
  end
  subgraph orchestration["Fulfilment orchestration"]
    reservation["Reservation service"]
    substitution["Human substitution queue"]
    exception["Exception and stale-feed queue"]
    rules["Freshness FEFO promise rules"]
  end
  subgraph systems["Operational systems"]
    wms["WMS inventory and pick waves"]
    suppliers["Supplier feed scheduler"]
    carriers["Carrier promise APIs"]
    stores["Store picker app"]
  end
  subgraph data["Evidence and control"]
    ledger["Inventory reservation ledger"]
    audit["Substitution and promise audit"]
    dashboard["Ops dashboard"]
  end
  orders --> reservation
  forecast --> slots
  slots --> reservation
  suppliers --> exception
  reservation --> rules
  rules --> wms
  rules --> stores
  rules --> carriers
  substitution --> stores
  reservation --> ledger
  substitution --> audit
  exception --> dashboard`,
      requestFlowCode:`flowchart LR
  order["Grocery order"] --> capacity["Check store capacity"]
  capacity --> freshness["Apply freshness and FEFO rules"]
  freshness --> reserve["Reserve stock"]
  reserve --> pick["Picker task"]
  pick --> substitute["Human substitution override if needed"]
  substitute --> promise["Update customer promise"]
  promise --> carrier["Carrier handoff"]
  reserve --> audit["Reservation and substitution audit"]`,
      summary:'This fulfilment topology connects demand, supplier cadence, WMS/store operations, freshness rules, substitution override, and delivery promises.',
      requestSubtitle:'How fulfilment promises are created and protected across store capacity, freshness, WMS, and carrier exceptions.',
      notes:['Freshness and substitution are explicit workflow controls.','Supplier feed lateness and carrier degradation have exception queues.','Best suited for supply-chain, store operations, and fulfilment SLA reviews.']
    };
  }
  if(workload.includes('modernisation')||workload.includes('modernization')){
    return {
      contextCode:`flowchart LR
  brands["Brands and franchise stores"]
  channels["POS ecommerce service channels"]
  platform["${escapeMermaidLabel(facts.company)} shared retail platform"]
  erp["ERP finance and product"]
  oms["OMS and WMS"]
  payments["Payment providers"]
  data["Group data platform"]
  brands --> platform
  channels --> platform
  platform --> erp
  platform --> oms
  platform --> payments
  platform --> data`,
      solutionCode:`flowchart TB
  subgraph legacy["Current retail estate"]
    brandPos["Brand POS systems"]
    erp["ERP finance product price"]
    esb["Legacy ESB integrations"]
    reports["Store reporting apps"]
  end
  subgraph foundation["Shared retail foundation"]
    identity["Group identity privileged access"]
    contracts["Canonical API event contracts"]
    adapters["Strangler adapters"]
    policy["Regional brand policy"]
  end
  subgraph target["Target business capabilities"]
    commerce["Commerce channel services"]
    orders["OMS order services"]
    inventory["Inventory availability and reservation"]
    payments["PSP token boundary"]
    loyalty["Customer loyalty services"]
  end
  subgraph governance["Migration evidence"]
    wave["Wave readiness gates"]
    recon["Reconciliation controls"]
    rollback["Rollback coexistence plan"]
    audit["Migration evidence store"]
  end
  legacy --> adapters
  adapters --> contracts
  identity --> target
  contracts --> commerce
  contracts --> orders
  contracts --> inventory
  contracts --> loyalty
  payments --> orders
  policy --> wave
  wave --> recon
  wave --> rollback
  recon --> audit`,
      deploymentCode:`flowchart TB
  subgraph legacy["Legacy estate"]
    pos["Brand POS systems"]
    esb["Legacy ESB"]
    reports["Store reporting apps"]
  end
  subgraph foundation["Shared platform foundation"]
    identity["Group identity and access"]
    events["Canonical event backbone"]
    adapters["Strangler adapters"]
    policy["Brand rollout policy"]
  end
  subgraph target["Target retail capabilities"]
    orders["Order services"]
    inventory["Inventory availability"]
    payments["Tokenised payment boundary"]
    loyalty["Loyalty customer services"]
  end
  subgraph governance["Migration governance"]
    wave["Wave readiness gates"]
    recon["Data reconciliation"]
    rollback["Rollback and coexistence"]
    audit["Migration evidence store"]
  end
  legacy --> adapters
  adapters --> events
  identity --> target
  events --> orders
  events --> inventory
  events --> loyalty
  payments --> target
  policy --> wave
  wave --> recon
  wave --> rollback
  recon --> audit`,
      requestFlowCode:`flowchart LR
  wave["Brand/store migration wave"] --> discover["Dependency discovery"]
  discover --> coexist["Legacy and target coexistence"]
  coexist --> migrate["Data migration and adapter cutover"]
  migrate --> reconcile["Reconcile orders inventory payments"]
  reconcile --> gate["Acceptance gate"]
  gate --> rollback["Rollback if threshold fails"]
  gate --> next["Proceed to next wave"]`,
      summary:'This modernization topology focuses on coexistence, strangler migration, canonical contracts, wave gates, reconciliation, and rollback.',
      requestSubtitle:'How each brand or store wave moves from discovery to cutover without stopping trading.',
      notes:['Legacy and target systems coexist during phased migration.','Acceptance gates and rollback are first-class migration controls.','Best suited for enterprise architecture, delivery, and risk governance reviews.']
    };
  }
  return {
    contextCode:`flowchart LR
  stores["Physical stores and associates"]
  ecommerce["E-commerce customers"]
  platform["${escapeMermaidLabel(facts.company)}"]
  inventory["${escapeMermaidLabel(facts.data)}"]
  commerce["E-commerce CMS"]
  erp["ERP POS core"]
  psp["Payment provider P2PE rails"]
  ops["Ops Security and Compliance"]
  stores --> platform
  ecommerce --> platform
  platform --> inventory
  platform --> commerce
  platform --> erp
  stores --> psp
  platform --> ops`,
    solutionCode:`flowchart TB
  subgraph store["Store autonomy"]
    associates["Associates customers"]
    pos["POS lanes mobile apps"]
    edgeSvc["Store edge runtime"]
    localQueue["Encrypted durable local queue"]
    offlineAuth["Offline auth device trust"]
  end
  subgraph regional["Regional retail platform"]
    api["Regional API control plane"]
    stream["Event stream CDC replay"]
    conflict["Conflict reroute service"]
    rollout["Store rollout gate service"]
  end
  subgraph data["Retail authority data"]
    ledger["Inventory order ledger"]
    projection["Availability projection"]
    tokenVault["PII payment token vault"]
    audit["Immutable replay audit"]
  end
  subgraph external["External retail systems"]
    commerce["Ecommerce CMS"]
    erp["ERP POS core"]
    psp["PSP P2PE rails"]
    wms["OMS WMS fulfilment"]
  end
  subgraph ops["Ops security"]
    observability["SLO queue replay dashboards"]
    security["PKI KMS PCI segmentation"]
  end
  associates --> pos
  pos --> edgeSvc
  offlineAuth --> edgeSvc
  pos --> psp
  edgeSvc --> localQueue
  localQueue --> stream
  stream --> api
  api --> ledger
  ledger --> projection
  api --> conflict
  conflict --> commerce
  conflict --> erp
  conflict --> wms
  rollout --> edgeSvc
  pos --> tokenVault
  ledger --> audit
  api --> observability
  tokenVault --> security`,
    deploymentCode:`flowchart TB
  subgraph store["Store edge"]
    pos["POS lanes and mobile apps"]
    edgeSvc["${escapeMermaidLabel(facts.orchestration)}"]
    localQueue["${escapeMermaidLabel(facts.queue)}"]
    offlineAuth["Offline auth and device trust"]
  end
  subgraph region["${escapeMermaidLabel(facts.region)}"]
    api["${escapeMermaidLabel(facts.api)}"]
    stream["${escapeMermaidLabel(facts.queue)}"]
    conflict["${escapeMermaidLabel(facts.conflict)}"]
  end
  subgraph data["Inventory data"]
    ledger["${escapeMermaidLabel(facts.data)}"]
    projection["${escapeMermaidLabel(facts.vector)}"]
    tokenVault["${escapeMermaidLabel(facts.tokenization)}"]
    audit["${escapeMermaidLabel(facts.store)}"]
  end
  subgraph integrations["Commerce integrations"]
    ecommerce["E-commerce CMS"]
    erp["ERP POS core"]
    psp["PSP P2PE rails"]
  end
  subgraph ops["Ops and Security"]
    mon["${escapeMermaidLabel(facts.monitoring)}"]
    sec["${escapeMermaidLabel(facts.security)}"]
  end
  pos --> edgeSvc
  offlineAuth --> edgeSvc
  pos --> psp
  edgeSvc --> localQueue
  localQueue --> stream
  stream --> api
  api --> ledger
  ledger --> projection
  api --> conflict
  conflict --> ecommerce
  conflict --> erp
  pos --> tokenVault
  ledger --> audit
  api --> mon
  tokenVault --> sec`,
    requestFlowCode:`flowchart LR
  sale["In-store checkout sale"] --> localDecision["Local edge sale commit"]
  localDecision --> pii["Tokenise and mask PII"]
  localDecision --> payment["P2PE payment token"]
  localDecision --> queue["Durable offline queue"]
  queue --> reconnect["Connectivity stable for replay"]
  reconnect --> stream["Regional event stream"]
  stream --> ledger["Append-only inventory ledger"]
  ledger --> projection["Stock projection update"]
  projection --> ecommerce["E-commerce availability"]
  ledger --> conflict["Conflict detection"]
  conflict --> reroute["Online order reroute or compensation"]
  queue --> audit["Replay audit dashboard"]`,
    summary:'This store-execution topology separates store-local autonomy, payment token boundaries, queue replay, inventory reconciliation, and operational evidence.',
    requestSubtitle:'How an offline-capable store transaction is captured, replayed, reconciled, and exposed to e-commerce.',
    notes:['Store-local autonomy and regional event processing are separate responsibility boundaries.','Payment, ERP, e-commerce, and audit paths remain explicit.','Best suited for outage runbooks and conflict-resolution validation.']
  };
}

function buildArchitectureViews(result){
  const facts=getArchitectureFacts(result);
  const retailDiagrams=facts.isAiScenario?null:buildRetailWorkloadDiagrams(facts);
  const generatedSolutionCode=normalizeArchitectureDiagram(buildArchitectureFromRecommendation(result));
  const solutionCode=facts.isAiScenario?generatedSolutionCode:(retailDiagrams.solutionCode||retailDiagrams.deploymentCode||generatedSolutionCode);
  const solutionVisual=facts.isAiScenario?convertArchitectureDiagramToFlowchart(solutionCode):solutionCode;
  const systemContextCode=facts.isAiScenario?`flowchart LR
  users["Customers and Operators"]
  platform["${escapeMermaidLabel(facts.company)}"]
  llm["${escapeMermaidLabel(facts.llm)}"]
  data["${escapeMermaidLabel(facts.data)}"]
  crm["${escapeMermaidLabel(facts.hasSalesforce?'Salesforce CRM':'External Systems')}"]
  ops["Operations and Security"]
  users --> platform
  platform --> llm
  platform --> data
  platform --> crm
  platform --> ops`:retailDiagrams.contextCode;
  const deploymentCode=facts.isAiScenario?`flowchart TB
  subgraph region["${escapeMermaidLabel(facts.region)}"]
    subgraph edge["Edge"]
      ui["${escapeMermaidLabel(facts.ui)}"]
      edgeSvc["${escapeMermaidLabel(facts.edge)}"]
    end
    subgraph app["Application"]
      api["${escapeMermaidLabel(facts.api)}"]
      orchestrator["${escapeMermaidLabel(facts.orchestration)}"]
      queue["${escapeMermaidLabel(facts.hasQueue?'Async Queue':'Background Worker')}"]
    end
    subgraph ai["AI"]
      llm["${escapeMermaidLabel(facts.llm)}"]
      fallback["${escapeMermaidLabel(facts.hasFallback?facts.fallback:'Fallback optional')}"]
      trace["${escapeMermaidLabel(facts.hasTrace?'Tracing':'AI telemetry')}"]
    end
    subgraph data["Data"]
      db["${escapeMermaidLabel(facts.data)}"]
      vec["${escapeMermaidLabel(facts.vector)}"]
      store["${escapeMermaidLabel(facts.store)}"]
      cache["${escapeMermaidLabel(facts.hasCache?'Cache':'Session data')}"]
    end
  end
  subgraph ops["Ops and Security"]
    mon["${escapeMermaidLabel(facts.monitoring)}"]
    sec["${escapeMermaidLabel(facts.security)}"]
  end
  ui --> edgeSvc --> api --> orchestrator
  orchestrator --> llm
  orchestrator --> fallback
  api --> db
  db --> vec
  api --> store
  api --> cache
  api --> queue
  api --> mon
  db --> sec
  store --> sec`:retailDiagrams.deploymentCode;
  const requestFlowCode=facts.isAiScenario?`flowchart LR
  customer["Customer request"] --> channel["${escapeMermaidLabel(facts.ui)}"]
  channel --> api["${escapeMermaidLabel(facts.api)}"]
  api --> orchestrator["${escapeMermaidLabel(facts.orchestration)}"]
  orchestrator --> retrieval["Retrieve context from ${escapeMermaidLabel(facts.data)} and ${escapeMermaidLabel(facts.vector)}"]
  retrieval --> orchestrator
  orchestrator --> llm["${escapeMermaidLabel(facts.llm)}"]
  llm --> orchestrator
  orchestrator --> response["Return response to channel"]
  response --> customer
  api --> handoff["Async work and human handoff"]
  handoff --> integration["${escapeMermaidLabel(facts.hasSalesforce?'Salesforce CRM':'External systems')}"]`:retailDiagrams.requestFlowCode;
  const annotatedContextCode=embedArchitectureDiagramAnnotations(systemContextCode,facts);
  const annotatedSolutionCode=embedArchitectureDiagramAnnotations(solutionVisual||solutionCode,facts);
  const annotatedDeploymentCode=embedArchitectureDiagramAnnotations(deploymentCode,facts);
  const annotatedRequestFlowCode=embedArchitectureDiagramAnnotations(requestFlowCode,facts);
  return {
    context:{
      title:'System context',
      subtitle:'Who interacts with the platform and which external capabilities it depends on.',
      visual:annotatedContextCode,
      code:annotatedContextCode,
      source:'Context view synthesized from the recommendation.',
      summary:facts.isAiScenario?'This view shows the platform boundary and the main external dependencies that shape the design.':retailDiagrams.summary,
      notes:facts.isAiScenario?[
        'Users and operators are shown separately from platform internals.',
        'External AI, data, and CRM dependencies stay outside the core boundary.',
        'This is the best diagram for executive and stakeholder reviews.'
      ]:retailDiagrams.notes
    },
    solution:{
      title:'Solution architecture',
      subtitle:facts.isAiScenario?'Logical service layout across edge, application, AI, data, integrations, and ops.':`Logical service layout for ${facts.workload}.`,
      visual:annotatedSolutionCode,
      code:annotatedSolutionCode,
      source:'Logical architecture synthesized from the recommendation stack.',
      summary:'This is the primary solution view and is closest to what a solution architect would review with engineering leads.',
      notes:facts.isAiScenario?[
        'Shows the major containers and responsibility boundaries.',
        'Keeps AI, data, integrations, and ops distinct from the request edge.',
        'Optimized for readability rather than vendor icon fidelity.'
      ]:retailDiagrams.notes
    },
    deployment:{
      title:'Deployment architecture',
      subtitle:'Where the services land and how runtime, data, and ops controls are separated by environment.',
      visual:annotatedDeploymentCode,
      code:annotatedDeploymentCode,
      source:'Deployment view synthesized from region and stack recommendations.',
      summary:'This view focuses on infrastructure placement, regional boundaries, and managed-service separation.',
      notes:facts.isAiScenario?[
        'Useful for platform, security, and operations reviews.',
        'Makes region placement and operational controls explicit.',
        'Separates edge, runtime, AI, and data into deployable zones.'
      ]:retailDiagrams.notes
    },
    request:{
      title:'Key request flow',
      subtitle:facts.isAiScenario?'How a customer request moves through the system, retrieval path, model call, and handoff.':retailDiagrams.requestSubtitle,
      visual:annotatedRequestFlowCode,
      code:annotatedRequestFlowCode,
      source:'Request flow synthesized from the recommended pipeline.',
      summary:facts.isAiScenario?'This workflow view is intended for product, support, and implementation teams validating the main path.':'This workflow view is intended for retail operations, support, and implementation teams validating the offline checkout path.',
      notes:facts.isAiScenario?[
        'Follows the main synchronous request path from channel to response.',
        'Separates retrieval and model execution from async integration work.',
        'Best suited for debugging and operational runbook discussions.'
      ]:retailDiagrams.notes
    }
  };
}

async function renderArchitectureDiagram(view,facts){
  const host=document.getElementById('architecture-mermaid');
  const code=document.getElementById('architecture-code');
  if(!host || !code) return;
  const payload=buildArchitectureRenderPayload(view,facts);
  const renderToken=++DIAGRAM_RENDER_TOKEN;
  host.innerHTML='<div class="architecture-empty-state">Rendering diagram...</div>';
  code.textContent='Generating Python source...';
  try{
    const rendered=await fetchRenderedArchitecture(payload);
    if(renderToken!==DIAGRAM_RENDER_TOKEN) return;
    code.textContent=String(rendered?.source||'No Python source returned.').trim();
    if(typeof rendered?.svg==='string' && rendered.svg.trim()){
      host.innerHTML=`<div class="diagram-svg-shell">${rendered.svg}</div>`;
      logEvent('info','diagram.render_completed',{panel:payload.panel,svgChars:rendered.svg.length});
    }else{
      host.innerHTML='<div class="architecture-empty-state">Renderer returned no SVG output.</div>';
      logEvent('warn','diagram.render_empty',{panel:payload.panel});
    }
  }catch(err){
    logEvent('error','diagram.render_failed',{message:err.message});
    code.textContent='Rendering failed.';
    host.innerHTML=`<div class="err-box"><strong>Diagram render failed:</strong> ${escapeHtml(err.message)}</div>`;
  }
}

function getMockRecommendation(){
  const company=S.basics.company||'RetailEdge Omni';
  const diagramBase=`architecture-beta
    group store(cloud)[Store]
    group commerce(cloud)[Commerce]
    group platform(cloud)[Retail Platform]
    group data(cloud)[Retail Data]
    group ops(cloud)[Operations]
    service customer(internet)[Customer] in commerce
    service pos(server)[POS Lane] in store
    service edge(server)[Store Edge Node] in store
    service queue(server)[Durable Queue] in store
    service web(server)[Storefront] in commerce
    service api(server)[Retail API] in platform
    service oms(server)[Order Service] in platform
    service inv(database)[Inventory Store] in data
    service audit(disk)[Audit Log] in data
    service mon(cloud)[Monitoring] in ops
    service sec(cloud)[Identity And Keys] in ops
    customer:R --> L:web
    web:R --> L:api
    pos:R --> L:edge
    edge:R --> L:queue
    queue:R --> L:api
    api:R --> L:oms
    oms:R --> L:inv
    api:B --> T:audit
    edge:B --> T:mon
    sec:R --> L:api`;
  return {
    executive_summary:`${company} needs a retail execution architecture that keeps stores, commerce, inventory, and operations aligned during peak trading and partial outages. The recommended path is a managed cloud retail platform with store-edge continuity, durable event replay, clear payment and customer-data boundaries, and phased rollout gates. The biggest risk is accepting the pilot before queue replay, PCI segmentation evidence, certificate lifecycle ownership, and operational runbooks are proven in realistic store-failure tests.`,
    tiers:[
      {id:'conservative',label:'Conservative',tagline:'Pilot-ready retail baseline with one region and limited store-edge HA',monthly_total:'$18,000-$28,000/month',budget_feasible:true,budget_note:'Suitable for a narrow pilot but not enough for national peak trading or full store-edge redundancy.',stack:[{layer:'Store edge',rec:'Linux store appliance with encrypted local queue and managed device posture',why:'Keeps checkout and inventory capture alive during short WAN outages while preserving audit evidence.',monthly_cost_est:'$4,000-$7,000/month'},{layer:'Commerce API',rec:'Managed container service behind WAF and CDN',why:'Separates browsing and checkout traffic from central inventory commits.',monthly_cost_est:'$3,000-$5,000/month'},{layer:'Inventory and orders',rec:'Managed PostgreSQL plus event bus and dead-letter queues',why:'Provides transactional integrity with replayable integrations into POS, OMS, and ERP.',monthly_cost_est:'$5,000-$8,000/month'},{layer:'Security and PCI boundary',rec:'Cloud KMS, secrets manager, mTLS, tokenised PSP integration, and centralized identity',why:'Keeps raw card data out of ArchitectIQ-managed systems and makes key ownership explicit.',monthly_cost_est:'$2,500-$4,500/month'},{layer:'Observability',rec:'Cloud-native logs, metrics, traces, queue-age alerts, and synthetic checkout tests',why:'Pilot acceptance depends on evidence from degraded store and replay scenarios.',monthly_cost_est:'$2,500-$3,500/month'}],architecture_diagram:diagramBase,cost_breakdown:{llm_api:'$0-$300/month optional',compute:'$7,000/month',storage:'$4,000/month',networking:'$5,000/month',tooling:'$3,000/month'},biggest_cost_driver:'Store-edge hardware, network resilience, and observability dominate before optional AI costs.'},
      {id:'recommended',label:'Recommended',tagline:'Production retail platform with HA edge, replay tests, and rollout evidence',monthly_total:'$48,000-$72,000/month',budget_feasible:true,budget_note:'Designed for multi-store rollout with realistic resilience and support evidence.',stack:[{layer:'Store edge',rec:'HA store-edge pair with encrypted queue, local health checks, and field replacement runbook',why:'Meets checkout-continuity goals without weakening payment or audit boundaries.',monthly_cost_est:'$14,000-$22,000/month'},{layer:'Integration backbone',rec:'Managed event bus, ordered queues, idempotency keys, dead letters, and replay tooling',why:'Retail integrations fail safely only when replay and duplicate handling are first-class.',monthly_cost_est:'$8,000-$12,000/month'},{layer:'Inventory and fulfilment',rec:'Managed relational inventory store with OMS/WMS adapters and conflict policy service',why:'Physical store sales, online reservations, and fulfilment promises need explicit system-of-record rules.',monthly_cost_est:'$10,000-$16,000/month'},{layer:'Security and compliance',rec:'PCI-scoped segmentation, token vault integration, mTLS, managed keys, device attestation, and SIEM export',why:'Payment-adjacent retail architecture needs evidence, not generic encryption claims.',monthly_cost_est:'$8,000-$12,000/month'},{layer:'Operations',rec:'SLO dashboards, queue replay test suite, certificate renewal workflow, and rollout acceptance gates',why:'The store rollout should stop automatically if reliability or audit evidence fails.',monthly_cost_est:'$8,000-$10,000/month'}],architecture_diagram:diagramBase,cost_breakdown:{llm_api:'$0-$800/month optional',compute:'$18,000/month',storage:'$11,000/month',networking:'$16,000/month',tooling:'$12,000/month'},biggest_cost_driver:'Network resilience, store-edge redundancy, and observability are the largest recurring costs.'},
      {id:'optimised',label:'Optimised',tagline:'Recommended capability with reserved capacity and tighter retention policy',monthly_total:'$39,000-$58,000/month',budget_feasible:true,budget_note:'Keeps the Recommended controls while reducing cost through right-sizing and retention choices.',stack:[{layer:'Store edge',rec:'Standardised HA edge kit with remote diagnostics and pooled spares',why:'Reduces support variance without removing offline checkout controls.',monthly_cost_est:'$11,000-$18,000/month'},{layer:'Integration backbone',rec:'Managed queues with reserved throughput, replay tooling, and tiered audit retention',why:'Keeps replay discipline while controlling log and queue storage growth.',monthly_cost_est:'$6,000-$10,000/month'},{layer:'Inventory and orders',rec:'Reserved managed database capacity with read replicas sized to peak events',why:'Retail peak traffic is predictable enough to reserve part of the baseline.',monthly_cost_est:'$8,000-$13,000/month'},{layer:'Security and compliance',rec:'Managed identity, KMS, SIEM export filters, and certificate automation',why:'Automation reduces operational risk and manual certificate-renewal cost.',monthly_cost_est:'$7,000-$10,000/month'},{layer:'Operations',rec:'Consolidated dashboards, synthetic checkout probes, and automated pilot evidence reports',why:'Evidence collection should be repeatable for every store wave.',monthly_cost_est:'$7,000-$9,000/month'}],architecture_diagram:diagramBase,cost_breakdown:{llm_api:'$0-$500/month optional',compute:'$14,000/month',storage:'$9,000/month',networking:'$13,000/month',tooling:'$10,000/month'},biggest_cost_driver:'Store rollout footprint remains the dominant cost even after reserved capacity and retention tuning.'}
    ],
    risks:[
      {risk:'Offline queue replay could duplicate inventory decrements or order commits after store reconnect.',severity:'High',likelihood:'Medium',fix:'Require idempotency keys, ordered replay tests, dead-letter handling, and reconciliation evidence before pilot sign-off.'},
      {risk:'PCI scope can expand if POS, store edge, logs, or support tools ever receive raw card data.',severity:'High',likelihood:'Low',fix:'Document PSP tokenisation boundary, block PAN fields in schemas and logs, and collect PCI segmentation evidence during design review.'},
      {risk:'Certificate renewal ownership may be unclear across stores, mobile devices, edge nodes, and cloud APIs.',severity:'Medium',likelihood:'High',fix:'Assign certificate lifecycle owner and automate renewal alerts, rotation tests, and failed-renewal runbooks.'},
      {risk:'Rollout may proceed despite weak store-failure evidence.',severity:'High',likelihood:'Medium',fix:'Define wave gates for WAN outage, power-loss, queue replay, payment fallback, support handoff, and rollback drills.'}
    ],
    decisions:[{what:'Store-edge durable queue over cloud-only checkout dependency',why:'Stores must keep trading during WAN outages and preserve replayable audit evidence.'},{what:'Tokenised PSP boundary over internal card-data handling',why:'PCI scope should stay narrow and raw PAN data should never enter internal retail systems.'},{what:'Managed event bus with idempotency over direct point-to-point POS and ERP writes',why:'Replay, duplicate handling, and dead-letter operations are essential for omnichannel consistency.'},{what:'Phased store pilot over national launch',why:'Retail rollout risk is proven through evidence from store-failure drills, not architecture diagrams alone.'}],
    roadmap:[{phase:'Phase 1 - Retail Foundation',timeline:'Weeks 1-4',deliverables:['Confirm retail systems of record','Define PCI boundary and data contracts','Build queue replay and conflict-policy test plan'],owner:'Retail platform architect',done_when:'Architecture board approves boundaries, contracts, and pilot evidence checklist.'},{phase:'Phase 2 - Store Pilot',timeline:'Weeks 5-12',deliverables:['Deploy store-edge pilot kit','Run WAN outage and power-failure drills','Validate reconciliation and audit reports'],owner:'Store technology lead',done_when:'Pilot stores pass checkout, replay, reconciliation, and support-runbook acceptance gates.'},{phase:'Phase 3 - Rollout Control',timeline:'Weeks 13-24',deliverables:['Automate certificate renewal evidence','Publish rollout dashboards','Start controlled store waves'],owner:'Programme delivery lead',done_when:'Each wave has objective go/no-go evidence and rollback readiness.'}],
    next_steps:['Name the retail systems of record and owners for product, price, inventory, order, payment token, customer, and audit data.','Run a payment and PCI segmentation workshop before any store-edge build starts.','Write the queue replay acceptance tests before selecting integration tooling.','Select 3-5 pilot stores that represent normal, high-volume, and poor-connectivity conditions.'],
    disclaimer:'This recommendation is a starting point for your engineering team to validate and implement. ArchitectIQ accepts no liability for implementation decisions made based on this document.'
  };
}

// -- Contradiction detection ---
function detectContradictions(state){
  const issues=[];
  const b=state.basics,sc=state.scale,c=state.cost,t=state.team,nfr=state.nfr;
  const monthly=parseFloat((c.monthly||'').replace(/[^0-9.]/g,''))||0;
  const timelineWeeks=parseInt(((t.timeline||'').match(/\d+/)||[])[0]||'0');
  const constraintsLow=(b.constraints||'').toLowerCase();
  const problemLow=(b.problem||'').toLowerCase();
  // Budget vs high SLA
  if((sc.sla==='99.99%'||sc.sla==='99.95%')&&c.compute==='Minimise'&&monthly>0&&monthly<1500){
    issues.push({severity:'high',msg:`${sc.sla} SLA requires multi-AZ redundancy  -  Minimise compute at $${monthly}/month cannot sustain this.`});
  }
  // Quality First LLM + tiny budget
  if(c.llm==='Quality First'&&monthly>0&&monthly<500){
    issues.push({severity:'high',msg:`Quality First LLM (GPT-4o / Claude Opus) costs exceed $500/month at meaningful volume  -  stated budget of $${monthly}/month is likely insufficient.`});
  }
  // All-Minimise + high SLA
  const allMin=['compute','storage','networking','llm'].every(k=>c[k]==='Minimise');
  if(allMin&&(sc.sla==='99.9%'||sc.sla==='99.95%'||sc.sla==='99.99%')){
    issues.push({severity:'medium',msg:'Minimising all cost layers conflicts with your availability SLA. Redundancy has a hard cost floor.'});
  }
  // Junior + build-first
  if(t.seniority==='Junior'&&t.buildBuy==='Build-first (custom)'){
    issues.push({severity:'medium',msg:'Junior team + Build-first raises delivery risk. An implementation partner or Buy-first approach reduces execution risk significantly.'});
  }
  // Tight timeline for optional retail AI
  if(hasRetailAiSignals(getPlaybookText(state))&&timelineWeeks>0&&timelineWeeks<6){
    issues.push({severity:'medium',msg:`${timelineWeeks}-week timeline for retail AI or automated decisioning is very aggressive  -  production model deployments typically require 8-12 weeks minimum.`});
  }
  // Data residency + possible non-compliant vendor
  if(constraintsLow.includes('australia')&&constraintsLow.includes('openai')&&!constraintsLow.includes('azure')){
    issues.push({severity:'medium',msg:'Australian data residency with a direct OpenAI API dependency may be non-compliant  -  OpenAI does not guarantee AU data residency. Consider Azure OpenAI (Australia East) or AWS Bedrock (ap-southeast-2).'});
  }
  // Real-time + Minimise compute
  if((problemLow.includes('real-time')||sc.latency==='< 100ms')&&c.compute==='Minimise'){
    issues.push({severity:'low',msg:'Real-time / sub-100ms latency with Minimise compute may push toward serverless, which has cold-start latency. Verify this is acceptable.'});
  }
  // No NFRs
  const nfrFilled=Object.values(nfr).filter(Boolean).length;
  if(nfrFilled===0){
    issues.push({severity:'low',msg:'No non-functional requirements specified. Missing NFRs is how re-architectures happen at month 4.'});
  }
  return issues;
}

// -- Pricing helpers ---
async function fetchAzurePricing(filter,top=20){
  try{
    const res=await fetch(`/api/pricing/azure?$filter=${encodeURIComponent(filter)}&$top=${top}`);
    if(!res.ok) return null;
    const data=await res.json();
    return data.Items||data.items||[];
  }catch{return null;}
}

async function fetchAwsPricing(params={}){
  const query=new URLSearchParams(params);
  try{
    const res=await fetch(`/api/pricing/aws?${query.toString()}`);
    if(!res.ok) return null;
    return await res.json();
  }catch{return null;}
}

function pricingRegionContext(state={},domain=''){
  const text=[
    domain,
    state?.basics?.company,
    state?.basics?.industry,
    state?.basics?.domain,
    state?.basics?.problem,
    state?.basics?.stack,
    state?.basics?.constraints,
    state?.nfr?.i18n,
    state?.nfr?.compliance
  ].filter(Boolean).join(' ').toLowerCase();
  if(/\b(india|indian|myntra|flipkart|upi|rbi|dpdp|gst|mumbai|bengaluru|bangalore|delhi|hyderabad|chennai|pune)\b/.test(text)){
    return {label:'India',azureRegion:'centralindia',awsRegion:'ap-south-1',gcpRegion:'asia-south1'};
  }
  if(/\b(australia|australian|au east|australia east|sydney|melbourne|perth|brisbane|new zealand|nz)\b/.test(text)){
    return {label:'Australia/New Zealand',azureRegion:'australiaeast',awsRegion:'ap-southeast-2',gcpRegion:'australia-southeast1'};
  }
  if(/\b(united kingdom|uk|london|england|scotland|wales)\b/.test(text)){
    return {label:'United Kingdom',azureRegion:'uksouth',awsRegion:'eu-west-2',gcpRegion:'europe-west2'};
  }
  if(/\b(europe|eu|germany|france|netherlands|ireland|spain|italy|gdpr)\b/.test(text)){
    return {label:'Europe',azureRegion:'westeurope',awsRegion:'eu-west-1',gcpRegion:'europe-west1'};
  }
  if(/\b(united states|usa|us-|america|california|new york|texas|virginia|oregon)\b/.test(text)){
    return {label:'United States',azureRegion:'eastus',awsRegion:'us-east-1',gcpRegion:'us-east4'};
  }
  return {label:'Region not confirmed',azureRegion:null,awsRegion:null,gcpRegion:null};
}

function hasAiPricingScope(state={},domain=''){
  const text=[
    domain,
    state?.basics?.domain,
    state?.basics?.problem,
    state?.basics?.stack,
    state?.basics?.constraints,
    state?.nfr?.maintainability,
    state?.nfr?.auditability
  ].filter(Boolean).join(' ').toLowerCase();
  return /\b(ai|ml|llm|genai|model|rag|copilot|chatbot|agentic|recommendation|recommendations|personalisation|personalization|forecasting|prediction|semantic search)\b/.test(text);
}

function azurePriceText(item){
  return [
    item?.serviceName,
    item?.productName,
    item?.skuName,
    item?.meterName,
    item?.unitOfMeasure,
    item?.armRegionName
  ].filter(Boolean).join(' ');
}

function isEnterpriseRelevantAzurePostgresPrice(item){
  const price=Number(item?.unitPrice);
  const unit=String(item?.unitOfMeasure||'').toLowerCase();
  const text=azurePriceText(item).toLowerCase();
  if(!Number.isFinite(price)||price<=0) return false;
  if(!/hour/.test(unit)) return false;
  if(String(item?.type||'').toLowerCase()!=='consumption') return false;
  if(item?.reservationTerm) return false;
  if(price>50) return false;
  if(/reservation|reserved|savings|burstable|basic|free|dev\/?test|preview|b1ms|b1s|b2s|backup|storage|snapshot|log|iops|io request|data transfer|cosmos db|single server|horizondb|oriondb/.test(text)) return false;
  const looksLikeCompute=/flexible server/.test(text)&&/general purpose|memory optimized|business critical|vcore|compute/.test(text);
  return looksLikeCompute&&price>=0.08;
}

function azureVCoreCount(item){
  const text=[item?.skuName,item?.meterName,item?.armSkuName].filter(Boolean).join(' ');
  const match=text.match(/\b(\d+)\s*vcore\b/i)||text.match(/standard_[a-z]+(\d+)/i);
  return match?Number(match[1]):0;
}

function chooseAzurePostgresEvidence(items){
  const candidates=(items||[]).filter(isEnterpriseRelevantAzurePostgresPrice);
  if(!candidates.length) return null;
  return candidates
    .map(item=>{
      const cores=azureVCoreCount(item);
      const tier=/memory optimized/i.test(azurePriceText(item))?2:/general purpose/i.test(azurePriceText(item))?3:1;
      const coreScore=cores>=16&&cores<=64?3:cores>=8&&cores<16?2:cores>64?1:0;
      return {item,score:tier*10+coreScore};
    })
    .sort((a,b)=>b.score-a.score||Number(b.item.unitPrice||0)-Number(a.item.unitPrice||0))[0].item;
}

function addPricingEvidence(ctx,line,source){
  ctx.summary.push(line);
  ctx.usablePricePoints.push({line,source});
}

function formatAzureSku(item){
  return item?.armSkuName||[item?.skuName,item?.meterName].filter(Boolean).join(' / ')||item?.productName||'qualified SKU';
}

function awsOnDemandHourlyPrice(product,terms){
  const sku=product?.sku;
  const skuTerms=sku&&terms?.[sku]?Object.values(terms[sku]):[];
  for(const term of skuTerms){
    const dimensions=Object.values(term?.priceDimensions||{});
    for(const dim of dimensions){
      const usd=Number(dim?.pricePerUnit?.USD);
      if(Number.isFinite(usd)&&usd>0&&/hrs|hour/i.test(String(dim?.unit||dim?.description||''))){
        return usd;
      }
    }
  }
  return null;
}

function chooseAwsRdsEvidence(data){
  const products=Array.isArray(data?.sampleProducts)?data.sampleProducts:[];
  const scored=products.map(product=>{
    const attrs=product.attributes||{};
    const price=awsOnDemandHourlyPrice(product,data?.sampleTerms);
    const instance=String(attrs.instanceType||'');
    const engine=String(attrs.databaseEngine||'');
    const deployment=String(attrs.deploymentOption||'');
    if(!price||!/postgresql/i.test(engine)) return null;
    if(!/^db\.(r6g|r6i|r7g|r7i|m6g|m6i|m7g|m7i)\./i.test(instance)) return null;
    const sizeScore=/8xlarge/i.test(instance)?4:/16xlarge/i.test(instance)?3:/4xlarge/i.test(instance)?2:/2xlarge/i.test(instance)?1:0;
    const familyScore=/r6g|r7g/i.test(instance)?3:/r6i|r7i/i.test(instance)?2:1;
    const azScore=/multi-az/i.test(deployment)?2:1;
    return {product,price,score:familyScore*10+sizeScore+azScore};
  }).filter(Boolean);
  return scored.sort((a,b)=>b.score-a.score||b.price-a.price)[0]||null;
}

function gcpEvidenceText(item){
  return [
    item?.service,
    item?.sku,
    item?.machine_type,
    item?.edition,
    item?.unit,
    item?.region,
    item?.source
  ].filter(Boolean).join(' ');
}

function isUsableGcpPricingEvidence(item,aiPricing){
  const text=gcpEvidenceText(item).toLowerCase();
  const source=String(item?.source||'').toLowerCase();
  const price=String(item?.price||'');
  if(!source.includes('cloud.google.com')) return false;
  if(!/\$|usd|per|hour|request|token|gib|gb|million|1k/i.test(price)) return false;
  if(!item?.region&&!/vertex|gemini|global/i.test(text)) return false;
  if(!aiPricing&&/vertex|gemini|ai|model|llm|embedding|token/i.test(text)) return false;
  if(/cloud sql|postgres/i.test(text)){
    return !!(item?.machine_type||item?.sku||item?.edition)&&/(db-|custom-|enterprise|enterprise plus|dedicated core|vCPU|vcpu|core)/i.test(text);
  }
  if(/cloud run|gke|kubernetes|compute engine/i.test(text)){
    return !!(item?.sku||item?.machine_type)&&/(cpu|vcpu|memory|gib|node|autopilot|e2-|n2-|c3-|t2a-)/i.test(text);
  }
  if(/bigquery|cloud storage|pub\/sub|pubsub|cloud armor|secret manager/i.test(text)){
    return !!item?.sku||/(analysis|storage|request|operation|message|secret version)/i.test(text);
  }
  if(aiPricing&&/vertex|gemini|embedding/i.test(text)){
    return !!(item?.sku||item?.model)&&/(token|character|request|1k|million)/i.test(`${text} ${price}`);
  }
  return false;
}

function chooseGcpPricingEvidence(items,aiPricing){
  const usable=(items||[]).filter(item=>isUsableGcpPricingEvidence(item,aiPricing));
  const priority=item=>{
    const text=gcpEvidenceText(item).toLowerCase();
    if(/cloud sql|postgres/.test(text)) return 40;
    if(/cloud run|gke|kubernetes|compute engine/.test(text)) return 30;
    if(aiPricing&&/vertex|gemini/.test(text)) return 25;
    if(/bigquery|pub\/sub|pubsub/.test(text)) return 20;
    return 10;
  };
  return usable.sort((a,b)=>priority(b)-priority(a)).slice(0,6);
}

function formatGcpPricingEvidence(item){
  const sku=[item?.sku,item?.machine_type,item?.edition,item?.model].filter(Boolean).join(' / ')||'qualified SKU';
  const region=item?.region||'global/region not stated';
  return `GCP ${item.service} (${region}, ${sku}): ${item.price}${item.unit?` ${item.unit}`:''} [official web-search sample; final sizing still required]`;
}

function formatPricingSummaryForPrompt(pricing){
  const lines=[];
  if(pricing?.summary?.length){
    lines.push(...pricing.summary);
  }else{
    lines.push('No service-level live pricing data available.');
  }
  if(pricing?.notes?.length){
    lines.push('Pricing notes:');
    pricing.notes.slice(0,4).forEach(note=>lines.push(`- ${note}`));
  }
  if(pricing?.exclusions?.length){
    lines.push('Excluded pricing datapoints:');
    pricing.exclusions.slice(0,4).forEach(note=>lines.push(`- ${note}`));
  }
  return lines.join('\n');
}

// -- GCP pricing via web search ---
async function fetchGcpPricingViaWebSearch(domain,region){
  const prompt=`Search Google Cloud's official pricing pages and return current GCP pricing for the services most relevant to a ${domain||'cloud'} architecture.

Target region: ${region||'region not confirmed; prefer a clearly stated Google Cloud region if the scenario implies one'}.

Focus on SKU-level entries, not generic product pages:
- Cloud SQL for PostgreSQL: Enterprise or Enterprise Plus dedicated core / vCPU pricing, including machine type or SKU where published.
- Compute/GKE/Cloud Run: CPU, memory, node, or Autopilot SKU names where relevant.
- Vertex AI only if AI/model workloads are relevant: Gemini model name, token or character unit, and source page.
- BigQuery, Cloud Storage, Pub/Sub, Cloud Armor, Secret Manager: use named SKU/unit such as analysis, storage, request, operation, or message unit.

Return a JSON array of price points  -  no markdown, no explanation:
[
  {"service": "Cloud SQL for PostgreSQL", "sku": "Enterprise Plus dedicated core", "machine_type": "db-custom or published machine shape", "edition": "Enterprise Plus", "price": "$0.XXXX", "unit": "per vCPU hour", "region": "${region||'asia-south1'}", "source": "cloud.google.com/sql/pricing"},
  {"service": "Vertex AI Gemini", "sku": "Gemini 1.5 Flash input", "model": "gemini-1.5-flash", "price": "$0.XXXX", "unit": "per 1K input tokens or chars", "region": "global or named region", "source": "cloud.google.com/vertex-ai/pricing"},
  ...
]

Rules:
- Use only official cloud.google.com sources.
- Every item must include service, price, unit, region, source, and at least one of sku, machine_type, edition, or model.
- Do not return generic examples like "Cloud SQL: starts at" without a SKU/tier.
- Do not include committed-use, free-tier, promotional, or storage-only rows unless the service is explicitly a storage service.
- Return only the JSON array.`;
  try{
    const data=await callOpenAI({
      apiPath:'/v1/responses',
      model:'gpt-5.4',
      reasoning:{effort:'none'},
      max_output_tokens:1000,
      tools:[{type:'web_search'}],
      instructions:'You are a cloud pricing analyst. Search cloud.google.com for current GCP prices. Return only a valid JSON array.',
      input:prompt
    });
    const raw=extractModelText(data);
    // Extract JSON array from response
    const stripped=String(raw||'').replace(/^```json\s*|^```\s*|\s*```$/gm,'').trim();
    const start=stripped.indexOf('[');
    const end=stripped.lastIndexOf(']');
    if(start===-1||end===-1) return null;
    return JSON.parse(stripped.slice(start,end+1));
  }catch(err){
    logEvent('warn','pricing.gcp_websearch_failed',{message:err.message});
    return null;
  }
}

async function buildPricingContext(detectedCloud,domain,state={}){
  const region=pricingRegionContext(state,domain);
  const aiPricing=hasAiPricingScope(state,domain);
  const ctx={azure:null,aws:null,gcp:{available:false},summary:[],usablePricePoints:[],notes:[],exclusions:[],region};
  const tasks=[];

  // Azure  -  public REST API, no auth
  if(!detectedCloud||detectedCloud==='azure'){
    if(aiPricing){
      tasks.push(
        fetchAzurePricing("serviceName eq 'Azure OpenAI'",30).then(items=>{
          ctx.azure={...(ctx.azure||{}),openai:items};
          if(items?.length){
            const gpt4o=items.find(i=>(i.skuName||'').toLowerCase().includes('gpt-4o'));
            if(gpt4o) addPricingEvidence(ctx,`Azure OpenAI gpt-4o: $${gpt4o.unitPrice}/${gpt4o.unitOfMeasure||'unit'} (${gpt4o.armRegionName||'global'})`,'azure-openai');
            const gpt4oMini=items.find(i=>(i.skuName||'').toLowerCase().includes('gpt-4o-mini'));
            if(gpt4oMini) addPricingEvidence(ctx,`Azure OpenAI gpt-4o-mini: $${gpt4oMini.unitPrice}/${gpt4oMini.unitOfMeasure||'unit'}`,'azure-openai');
          }
        }).catch(()=>{})
      );
    }else{
      ctx.notes.push('Azure OpenAI pricing was skipped because the retail workload does not include an AI/model path.');
    }
    if(region.azureRegion){
      tasks.push(
        fetchAzurePricing(`serviceName eq 'Azure Database for PostgreSQL' and armRegionName eq '${region.azureRegion}'`,50).then(items=>{
          ctx.azure={...(ctx.azure||{}),postgres:items};
          const evidence=chooseAzurePostgresEvidence(items);
          if(evidence){
            addPricingEvidence(ctx,`Azure PostgreSQL Flexible sample (${region.label}, ${formatAzureSku(evidence)}): $${evidence.unitPrice}/${evidence.unitOfMeasure||'unit'} [live API sample; final sizing still required]`,'azure-postgresql');
          }else if(items?.length){
            const sample=items[0];
            ctx.exclusions.push(`Azure PostgreSQL ${region.label}: live feed returned ${items.length} item(s), but no enterprise-relevant hourly compute SKU was selected. First returned item was ${formatAzureSku(sample)} at $${sample.unitPrice}/${sample.unitOfMeasure||'unit'} and was excluded from validation.`);
          }else{
            ctx.notes.push(`Azure PostgreSQL ${region.label}: no live price items returned for ${region.azureRegion}.`);
          }
        }).catch(()=>{})
      );
    }else{
      ctx.notes.push('No region was confirmed, so regional Azure PostgreSQL pricing was not used as validation evidence.');
    }
  }

  // AWS  -  public bulk price list, no auth
  if(!detectedCloud||detectedCloud==='aws'){
    tasks.push(
      fetch('/api/pricing/aws').then(r=>r.ok?r.json():null).then(data=>{
        if(data?.offers){
          ctx.aws={indexLoaded:true,serviceCount:Object.keys(data.offers).length};
          ctx.notes.push(`AWS public pricing index loaded (${Object.keys(data.offers).length} services), but this is not a service-level estimate until SKUs and region ${region.awsRegion||'are confirmed'}.`);
        }
      }).catch(()=>{})
    );
    if(region.awsRegion){
      tasks.push(
        fetchAwsPricing({
          service:'AmazonRDS',
          region:region.awsRegion,
          instanceType:'db.r*g.*xlarge',
          databaseEngine:'PostgreSQL'
        }).then(data=>{
          const evidence=chooseAwsRdsEvidence(data);
          ctx.aws={...(ctx.aws||{}),rds:data};
          if(evidence){
            const attrs=evidence.product.attributes||{};
            addPricingEvidence(ctx,`AWS RDS PostgreSQL sample (${region.label}, ${attrs.instanceType}, ${attrs.deploymentOption||'deployment not specified'}): $${evidence.price}/hour [live regional SKU sample; final sizing still required]`,'aws-rds');
          }else if(data?.matchedProducts!==undefined){
            ctx.exclusions.push(`AWS RDS ${region.label}: matched ${data.matchedProducts} regional product(s), but no enterprise PostgreSQL on-demand hourly SKU was selected.`);
          }
        }).catch(()=>{})
      );
    }
  }

  // GCP  -  no public API without OAuth, use web search instead
  if(!detectedCloud||detectedCloud==='gcp'){
    tasks.push(
      fetchGcpPricingViaWebSearch(domain,region.gcpRegion).then(items=>{
        if(items?.length){
          const usableItems=chooseGcpPricingEvidence(items,aiPricing);
          ctx.gcp={available:usableItems.length>0,source:'web_search',items,usableItems};
          usableItems.forEach(i=>{
            addPricingEvidence(ctx,formatGcpPricingEvidence(i),'gcp-web-search');
          });
          const excluded=items.length-usableItems.length;
          if(excluded>0){
            ctx.exclusions.push(`GCP web search returned ${items.length} item(s); ${excluded} were excluded because they lacked official source, region, SKU/tier, usable unit, or matched AI pricing outside the scenario scope.`);
          }
          if(!usableItems.length){
            ctx.notes.push('GCP web search did not return SKU-level pricing evidence usable for validation.');
          }
        }else{
          ctx.gcp={available:false,note:'GCP pricing not found via web search'};
        }
      }).catch(()=>{
        ctx.gcp={available:false,note:'GCP web search pricing failed'};
      })
    );
  }

  await Promise.allSettled(tasks);
  return ctx;
}

// -- Research phase ---
async function runResearchPhase(company,industry,stack){
  const prompt=`You are a senior solution architect doing pre-engagement research before making a recommendation.

Research this client and return a JSON object with your findings.
Company: ${company}
Industry: ${industry}
Existing stack: ${stack}

Return this exact JSON shape  -  no markdown, no explanation:
{
  "company_profile": "2-3 sentences on company scale, stage, and technical maturity based on public signals",
  "stack_observations": "Known issues, migration gotchas, or compatibility notes for their existing stack",
  "industry_compliance": "Key retail compliance frameworks that apply (e.g. PCI-DSS, GDPR, CCPA, ISO27001, Australian Privacy Act)",
  "competitor_patterns": "Architecture patterns common in this industry and at this scale",
  "red_flags": ["Any red flags based on the problem description or stack"],
  "research_confidence": "high or medium or low"
}`;
  try{
    const data=await callOpenAI({
      apiPath:'/v1/responses',
      model:'gpt-5.4',
      reasoning:{effort:'none'},
      max_output_tokens:1200,
      tools:[{type:'web_search'}],
      instructions:'You are a solution architecture research analyst. Use web search to verify current facts. Return only a valid JSON object.',
      input:prompt
    });
    const raw=extractModelText(data);
    return parseModelJson(raw)||{company_profile:String(raw||'').slice(0,200),research_confidence:'low'};
  }catch(err){
    logEvent('warn','research.failed',{message:err.message});
    return null;
  }
}

// -- Validation phase ---
async function runValidationPhase(result,state,research,pricing){
  const pricingSummary=formatPricingSummaryForPrompt(pricing);
  const researchSummary=research?`Company: ${research.company_profile||''}
Compliance: ${research.industry_compliance||''}
Stack notes: ${research.stack_observations||''}
Red flags: ${(research.red_flags||[]).join('; ')}`:'Not available.';
  const recTier=(result.tiers||[]).find(t=>t.id==='recommended')||(result.tiers||[])[0]||{};
  const stackLines=(recTier.stack||[]).map(s=>`${s.layer}: ${s.rec}  -  estimated ${s.monthly_cost_est}`).join('\n');
  const domain=state.basics?.domain||'';
  const playbookBlock=buildArchitectThinkingPlaybookBlock(state);
  const retailText=getPlaybookText(state);
  const retailValidation=hasRetailSignals(retailText)?`
RETAIL DOMAIN VALIDATION:
- Classify the retail workload type: store execution/omnichannel inventory, digital commerce, retail data/loyalty, supply chain/fulfilment, or retail security/compliance.
- Check that systems of record are named for product, price, promotion, order, payment token, customer/loyalty, inventory, fulfilment, returns, and audit where relevant.
- Check POS/e-commerce/ERP/OMS/WMS integration ownership, idempotency keys, retries, dead letters, replay, reconciliation, duplicate handling, and manual correction.
- If stores/POS/offline trading are in scope, require edge HA/failure behavior, offline auth/payment boundaries, queue durability, ordering, replay/idempotency tests, conflict policy, reconnect criteria, and field runbooks.
- If payments/PCI are in scope, require PCI scope boundary, segmentation evidence, raw PAN/SAD exclusion or explicit scope, tokenization/P2PE boundary, logging controls, and QSA/human validation.
- If customer/loyalty data is in scope, require encryption before tokenization/masking: data classification, TLS/SSH in transit, KMS/HSM/CMEK/CSEK at rest, field/app-layer encryption where needed, secret-manager credential storage, key rotation ownership, consent, tokenization or pseudonymization, retention, deletion/DSAR, regional ownership, support access controls, log redaction, and analytics minimization.
- Check pilot rollout gates, rollback triggers, owner roles, game days, and measurable acceptance criteria.
- Check FinOps maturity: service-level pricing evidence, unit drivers, reserved/committed spend assumptions, non-prod parity, egress/IOPS/log-retention cost, support/licensing/partner cost, contingency, and named FinOps owner.
- Check scaling maturity: autoscaling signal, connection pooling, cache strategy, rate limits/quotas, backpressure, queue lag SLOs, first bottleneck, degraded mode, and peak-load acceptance test.
- Flag generic retail recommendations that do not prove operational correctness under campaign peaks, store outage, replay backlog, or data residency constraints.
`:''; 
  const isAgentic=isAgenticDomain(retailText);
  const forbiddenCheck=isAgentic?`
MANDATORY CHECK  -  RETAIL AI CONTROL LAYER:
The domain is "${domain}" and explicit retail AI/model signals are present. For the AI control layer, use LangGraph, LangChain, CrewAI, or an equivalent traced model-control pattern with human escalation.
AWS Step Functions, Azure Logic Apps, Apache Airflow, and AWS Glue Workflows are allowed for deterministic retail infrastructure or event workflows, but they must not be presented as the AI reasoning/control layer.
Only add a forbidden-orchestrator violation when a banned workflow service is used as the AI/model/agent control layer, not when it coordinates deterministic supply-chain, WMS, OMS, fulfilment, or batch integration workflows.
`:'';

  const prompt=`You are a senior solution architect validating a peer's recommendation before client delivery.

CLIENT CONSTRAINTS:
Domain: ${domain}
Monthly budget: ${state.cost?.monthly||'not stated'}
SLA: ${state.scale?.sla||'not stated'}
Hard constraints: ${state.basics?.constraints||'none stated'}
${forbiddenCheck}
RECOMMENDED STACK:
${stackLines}

COST ESTIMATES:
${(result.tiers||[]).map(t=>`  ${t.label}: ${t.monthly_total} (budget_feasible: ${t.budget_feasible})`).join('\n')}

LIVE PRICING CROSS-CHECK  -  compare each tier's monthly_total against the live pricing data provided. Flag any tier whose estimate is more than 30% above or below what the live pricing data implies for those services. Add specific warnings like "Conservative LLM estimate of $X/month is inconsistent with Bedrock pricing of $Y per 1M tokens at stated volume."

COST TIER ORDERING CHECK:
- Conservative must be cheapest, Optimised must be between Conservative and Recommended, Recommended must be most expensive.
- If ordering is violated, add each violation to constraint_violations.
- Set verdict to "fail" if any ordering violation is found.

LIVE PRICING DATA:
${pricingSummary}

RESEARCH CONTEXT:
${researchSummary}
${playbookBlock}
${retailValidation}
so this SOLUTION ARCHITECT THINKING VALIDATION:
- Check whether the recommendation followed the retrieved playbook rules.
- Check whether it surfaced enough missing-information assumptions.
- Check whether NFRs, trade-offs, risks, operability, and stakeholder clarity are handled.
- Add warnings or improvements for any dangerous, generic, or non-senior-architect-grade recommendation.

Return this exact JSON  -  no markdown:
{
  "verdict": "pass or warn or fail",
  "budget_feasible": true or false,
  "budget_note": "one sentence on whether cost estimates fit the stated budget",
  "constraint_violations": ["any hard constraint violations in the recommendation  -  include forbidden orchestrators if found"],
  "warnings": ["risks or soft issues worth flagging"],
  "price_accuracy": "are the LLM cost estimates reasonable vs live pricing data?",
  "improvements": ["top 2-3 specific improvements"]
}`;
  try{
    const data=await callOpenAI({
      apiPath:'/v1/responses',
      model:'gpt-5.4',
      reasoning:{effort:'none'},
      max_output_tokens:1400,
      tools:[],
      instructions:'You are a senior solution architecture validator applying the ArchitectIQ playbook. Return only a valid JSON object.',
      input:prompt
    });
    const raw=extractModelText(data);
    return applyDeterministicValidationGates(parseModelJson(raw)||{verdict:'warn',warnings:['Validation response could not be parsed'],improvements:[]},result,state,research,pricing);
  }catch(err){
    logEvent('warn','validation.failed',{message:err.message});
    return applyDeterministicValidationGates({verdict:'warn',warnings:[`Validation model failed: ${err.message}`],improvements:[]},result,state,research,pricing);
  }
}

function recommendationTextForValidation(result){
  const tiers=(result?.tiers||[]).map(t=>[
    t.label,
    t.tagline,
    t.monthly_total,
    t.budget_note,
    ...(t.stack||[]).map(s=>`${s.layer} ${s.rec} ${s.why} ${s.monthly_cost_est}`),
    t.biggest_cost_driver,
    t.architecture_diagram
  ].join(' ')).join(' ');
  const risks=(result?.risks||[]).map(r=>`${r.risk} ${r.fix}`).join(' ');
  const decisions=(result?.decisions||[]).map(d=>`${d.what} ${d.why}`).join(' ');
  const roadmap=(result?.roadmap||[]).map(r=>`${r.phase} ${r.timeline} ${(r.deliverables||[]).join(' ')} ${r.owner} ${(r.dependencies||[]).join(' ')} ${r.done_when}`).join(' ');
  const next=(result?.next_steps||[]).join(' ');
  return `${result?.executive_summary||''} ${tiers} ${risks} ${decisions} ${roadmap} ${next}`.toLowerCase();
}

function addUniqueValidationItem(list,item){
  if(!Array.isArray(list)) return [item];
  return list.some(existing=>String(existing).toLowerCase()===String(item).toLowerCase())?list:[...list,item];
}

function applyDeterministicValidationGates(validation,result,state,research,pricing){
  const v={...(validation||{})};
  v.constraint_violations=Array.isArray(v.constraint_violations)?v.constraint_violations:[];
  v.warnings=Array.isArray(v.warnings)?v.warnings:[];
  v.improvements=Array.isArray(v.improvements)?v.improvements:[];
  const scenarioText=getPlaybookText(state);
  const outputText=recommendationTextForValidation(result);
  const retail=hasRetailSignals(scenarioText);

  if(retail){
    const checks=[
      {
        when:true,
        pattern:/system.?s? of record|source of truth|ownership|product.*price|order.*inventory|inventory.*order/i,
        warning:'Retail architecture should explicitly name systems of record and ownership for product, price, promotion, order, payment token, customer/loyalty, inventory, fulfilment, returns, and audit where relevant.'
      },
      {
        when:true,
        pattern:/idempot|dead.?letter|replay|reconcil|duplicate|retry|poison/i,
        warning:'Retail integration design should define idempotency, retry/dead-letter handling, replay, reconciliation, duplicate prevention, and manual correction.'
      },
      {
        when:hasRetailStoreEdgeSignals(scenarioText),
        pattern:/edge.*(ha|failover|failure|hot spare|replacement|appliance)|appliance.*(ha|failover|failure|hot spare|replacement)/i,
        warning:'Store-edge retail designs must state edge appliance HA, failure behavior, replacement path, or accepted single-appliance risk before rollout.'
      },
      {
        when:hasRetailStoreEdgeSignals(scenarioText),
        pattern:/offline.*(auth|payment|queue|mode|boundary)|queue.*(durab|order|replay|idempot)|reconnect|wan/i,
        warning:'Store continuity designs must prove offline auth/payment boundaries, queue durability, ordering, replay/idempotency, and reconnect criteria.'
      },
      {
        when:/pci|payment|pos|p2pe/i.test(scenarioText),
        pattern:/pci.*(scope|segmentation|boundary)|p2pe|pan|sad|payment.*(vlan|segmentation|provider|rail)|qsa/i,
        warning:'Retail payment designs must define PCI scope, segmentation evidence, PAN/SAD exclusion or explicit scope, P2PE/tokenization boundary, and QSA/human validation.'
      },
      {
        when:/customer|loyalty|pii|privacy|gdpr|ccpa|profile|membership/i.test(scenarioText),
        pattern:/consent|tokeni[sz]ation|pseudonym|retention|deletion|dsar|erasure|support access|minimi[sz]ation/i,
        warning:'Retail customer/loyalty designs must cover consent, tokenization or pseudonymization, retention, deletion/DSAR, regional ownership, support access, and analytics minimization.'
      },
      {
        when:true,
        pattern:/pilot|wave|rollback|acceptance|game.?day|go.?live|done when|launch gate|rollout gate/i,
        warning:'Retail roadmap should include pilot wave criteria, rollback triggers, operational owners, game days, and measurable acceptance tests.'
      },
      {
        when:hasRetailCommerceSignals(scenarioText),
        pattern:/cdn|waf|cache|peak|campaign|black friday|checkout.*isolation|read.*write|cart|promotion|search/i,
        warning:'Digital commerce architectures should isolate campaign/read traffic from checkout, payment, order, and inventory commit paths and define peak-testing criteria.'
      },
      {
        when:hasRetailSupplyChainSignals(scenarioText),
        pattern:/wms|tms|reservation|fulfil|fulfill|replenish|supplier|warehouse|exception|substitution|manual override/i,
        warning:'Retail supply-chain designs should connect demand, inventory, fulfilment promises, warehouse/store operations, exceptions, and manual overrides.'
      }
    ];
    for(const check of checks){
      if(check.when&&!check.pattern.test(outputText)){
        v.warnings=addUniqueValidationItem(v.warnings,check.warning);
      }
    }

    const hasServicePricing=(pricing?.usablePricePoints||[]).length>0;
    if(!hasServicePricing){
      v.warnings=addUniqueValidationItem(v.warnings,'Retail pricing should remain marked as partial or assumption unless service-level pricing is available for the named commerce, data, network, security, observability, and edge components.');
    }
    if(!/finops|unit cost|cost driver|reserved|committed|savings plan|right.?siz|egress|iops|retention|non.?prod|licen[sc]|support plan|contingency|budget guardrail/i.test(outputText)){
      v.warnings=addUniqueValidationItem(v.warnings,'FinOps detail is insufficient; add unit-cost drivers, service-level SKU evidence, non-prod parity, egress/IOPS/log-retention cost, support/licensing/partner cost, contingency, and named FinOps owner validation.');
    }
    if(!/autoscal|keda|queue lag|consumer lag|connection pool|pgbouncer|backpressure|rate limit|quota|cache hit|load test|stress test|peak test|degraded mode|circuit breaker|bulkhead/i.test(outputText)){
      v.warnings=addUniqueValidationItem(v.warnings,'Scaling detail is insufficient; add autoscaling signals, bottleneck assumptions, connection pooling, cache strategy, backpressure, queue lag SLOs, quotas/rate limits, degraded modes, and peak-load acceptance criteria.');
    }
    if(!/encrypt|tls|ssh|kms|hsm|cmek|csek|aes|pgp|key rotation|secret manager|at rest|in transit|field.?level|app.?layer/i.test(outputText)){
      v.warnings=addUniqueValidationItem(v.warnings,'Security detail is insufficient; tokenization/masking is not enough without explicit encryption in transit, encryption at rest, key ownership/rotation, secret-manager use, and log redaction.');
    }
    if(!/trust boundary|security boundary|segmentation|firewall|waf|ips|pci scope|psp boundary|network zone|private subnet|egress/i.test(outputText)){
      v.warnings=addUniqueValidationItem(v.warnings,'Diagram/security detail should show trust boundaries, external security boundaries, provider/network zones, and PCI/privacy segmentation evidence.');
    }
    if(research?.research_confidence==='low'){
      v.warnings=addUniqueValidationItem(v.warnings,'Research confidence is low; treat company profile and scale as user-provided or inferred until validated with the retail client.');
    }
    v.improvements=addUniqueValidationItem(v.improvements,'Add a retail acceptance-test pack covering peak campaign load, offline store operation, replay backlog, payment/P2PE boundary, PCI segmentation, data deletion, and rollout rollback gates.');
  }

  const board=architectureBoardChecks(state,result,v);
  for(const blocker of board.blockers.slice(0,5)){
    v.warnings=addUniqueValidationItem(v.warnings,`Architecture board gap: ${blocker}`);
  }
  if(board.average<7){
    v.constraint_violations=addUniqueValidationItem(v.constraint_violations,`Architecture board score ${board.average}/10 is below client-delivery threshold; revise before presenting as solution-architect approved.`);
  }else if(board.average<8){
    v.improvements=addUniqueValidationItem(v.improvements,`Raise architecture board score from ${board.average}/10 by closing the revision brief items before client delivery.`);
  }
  if(!Array.isArray(result?.nfr_coverage)||result.nfr_coverage.length<5){
    v.warnings=addUniqueValidationItem(v.warnings,'Structured NFR coverage is incomplete; availability, latency, RTO/RPO, security, compliance, cost, operability, and DR need explicit targets and validation evidence.');
  }
  if(!Array.isArray(result?.residency_matrix)||!result.residency_matrix.length){
    v.warnings=addUniqueValidationItem(v.warnings,'Residency matrix is missing; include application data, backups, logs, telemetry, SaaS metadata, support access, and third-party processors.');
  }

  if(v.constraint_violations.length){
    v.verdict='fail';
  }else if(v.warnings.length&&v.verdict==='pass'){
    v.verdict='warn';
  }else if(!v.verdict){
    v.verdict=v.warnings.length?'warn':'pass';
  }
  return v;
}

// -- Forbidden-pattern scan + auto-correction ---
// Checks every stack rec field for banned orchestration services when domain is
// AI & Agentic. If found, fires a targeted single-layer correction call before
// the validation phase runs. This is a hard deterministic guard  -  the LLM cannot
// bypass it by ignoring the system prompt.
const FORBIDDEN_ORCHESTRATORS=[
  /\baws\s+step\s+functions\b/i,
  /\bstep\s+functions\b/i,
  /\bazure\s+logic\s+apps\b/i,
  /\blogic\s+apps\b/i,
  /\bapache\s+airflow\b/i,
  /\bairflow\b/i,
  /\baws\s+glue\s+workflows\b/i,
];

function isAgenticDomain(domain){
  return hasRetailAiSignals(domain||'');
}

function findForbiddenInRec(rec){
  return FORBIDDEN_ORCHESTRATORS.filter(p=>p.test(rec||''));
}

async function correctTierStack(tier,violatingLayers){
  const correctionPrompt=`The following stack layers contain forbidden orchestration services for an optional retail AI or automation workload (tier: ${tier.label}):

${violatingLayers.map(l=>`Layer "${l.layer}": ${l.rec}`).join('\n')}

RULE: For retail AI assistants, recommendation workflows, or automated decisioning, the AI control layer must use a fit-for-purpose AI orchestration pattern such as LangGraph, LangChain, or an equivalent state machine with tracing and human escalation. AWS Step Functions, Azure Logic Apps, Apache Airflow, and AWS Glue Workflows can support infrastructure jobs, but they are not the retail AI control layer.

Rewrite ONLY the violating layers. Keep approximate monthly_cost_est. Return ONLY a JSON array of corrected layer objects  -  no markdown, no explanation:
[{"layer":"...","rec":"...","why":"...","monthly_cost_est":"..."}]`;
  try{
    const corrData=await callOpenAI({apiPath:'/v1/responses',model:'gpt-5.4',reasoning:{effort:'none'},max_output_tokens:600,tools:[],instructions:'Return only a valid JSON array of layer objects.',input:correctionPrompt});
    const corrLayers=parseModelJson(extractModelText(corrData));
    if(Array.isArray(corrLayers)&&corrLayers.length>0){
      const correctedStack=(tier.stack||[]).map(s=>{const fix=corrLayers.find(c=>c.layer===s.layer);return fix?{...s,...fix}:s;});
      const stillViolating=correctedStack.filter(s=>findForbiddenInRec(s.rec).length>0);
      if(stillViolating.length===0) logEvent('info','generation.forbidden_patterns_corrected',{tier:tier.id,layers:corrLayers.map(l=>l.layer)});
      else logEvent('warn','generation.correction_still_forbidden',{tier:tier.id,layers:stillViolating.map(l=>l.layer)});
      return{...tier,stack:correctedStack};
    }
  }catch(err){logEvent('warn','generation.correction_failed',{tier:tier.id,message:err.message});}
  return tier;
}

async function scanAndCorrectForbiddenPatterns(result,domain){
  if(!isAgenticDomain(domain)) return result;
  const tiers=result.tiers||[];
  if(!tiers.length) return result;
  let anyFixed=false;
  const fixedTiers=await Promise.all(tiers.map(async tier=>{
    const violatingLayers=(tier.stack||[]).filter(s=>findForbiddenInRec(s.rec).length>0);
    if(!violatingLayers.length) return tier;
    logEvent('warn','generation.forbidden_patterns_detected',{tier:tier.id,layers:violatingLayers.map(l=>l.layer)});
    anyFixed=true;
    return correctTierStack(tier,violatingLayers);
  }));
  return anyFixed?{...result,tiers:fixedTiers}:result;
}

function summarizeFailurePreview(value,max=4000){
  const text=String(value||'').replace(/\s+/g,' ').trim();
  if(!text) return '';
  return text.length>max?`${text.slice(0,max)} ...[truncated]`:text;
}

function pickFallbackProvider(state){
  const stack=`${state?.basics?.stack||''} ${state?.basics?.constraints||''}`.toLowerCase();
  if(/windows|active directory|sql server|microsoft 365|azure ad|entra|vmware/.test(stack)) return 'azure';
  if(/aws|bedrock|cognito|cloudfront|dynamodb|aurora/.test(stack)) return 'aws';
  if(/gcp|google cloud|bigquery|cloud run|gke|vertex/.test(stack)) return 'gcp';
  return 'azure';
}

function getFallbackProviderBundle(provider,state){
  const hybrid=String(state?.team?.deploy||'').toLowerCase().includes('hybrid');
  if(provider==='aws'){
    return {
      providerLabel:'AWS',
      identity:'AWS IAM Identity Center with conditional access and device posture checks',
      networking:hybrid?'AWS Direct Connect or site-to-site VPN, Transit Gateway, Route 53 Resolver, and AWS Network Firewall':'AWS Transit Gateway, Route 53 Resolver, and AWS Network Firewall',
      compute:'AWS App Runner or ECS Fargate for migrated application services, with phased retention of legacy VMs until cutover',
      data:'Amazon RDS or Aurora for migratable transactional workloads, Amazon S3 for shared data and backup copies, and on-prem retention for regulated datasets',
      endpoint:'Microsoft Intune plus CrowdStrike or Microsoft Defender for Endpoint for MDM, EDR, encryption checks, and remote wipe',
      ops:'AWS Systems Manager, CloudWatch, AWS Backup Vault Lock, Config, and Security Hub for drift detection, immutable backups, and centralized operations'
    };
  }
  if(provider==='gcp'){
    return {
      providerLabel:'Google Cloud',
      identity:'Google Cloud Identity with conditional access and device posture checks',
      networking:hybrid?'Cloud Interconnect or site-to-site VPN, Cloud DNS, and Cloud Firewall policies':'VPC segmentation, Cloud DNS, and Cloud Firewall policies',
      compute:'Cloud Run or GKE Autopilot for migrated application services, with phased retention of legacy VMs until cutover',
      data:'Cloud SQL for migratable transactional workloads, Cloud Storage for shared data and backup copies, and on-prem retention for regulated datasets',
      endpoint:'Microsoft Intune plus CrowdStrike or Microsoft Defender for Endpoint for MDM, EDR, encryption checks, and remote wipe',
      ops:'Google Cloud Operations, Backup and DR, Config Controller / Policy Controller, and Security Command Center for centralized monitoring and drift control'
    };
  }
  return {
    providerLabel:'Azure',
    identity:'Microsoft Entra ID with Conditional Access, device compliance, and Zero Trust access controls',
    networking:hybrid?'Azure ExpressRoute or site-to-site VPN, Azure Firewall, Private DNS Resolver, and split-horizon DNS':'Azure landing zone with hub-spoke networking, Azure Firewall, and Private DNS Resolver',
    compute:'Azure App Service, Azure VMware Solution, or phased VM migration with Azure Migrate depending on workload readiness',
    data:'Azure SQL Managed Instance or PostgreSQL Flexible Server for migratable workloads, Azure Blob Storage for shared data and backup copies, and on-prem retention for regulated datasets',
    endpoint:'Microsoft Intune plus Microsoft Defender for Endpoint for MDM, EDR, encryption checks, remote wipe, and device health enforcement',
    ops:'Azure Arc, Azure Monitor, Defender for Cloud, Azure Backup immutable vaults, and Azure Policy for centralized operations and drift detection'
  };
}

function buildEmergencyFallbackRecommendation(state,contradictions,error){
  const b=state?.basics||{};
  const t=state?.team||{};
  const c=state?.cost||{};
  const provider=pickFallbackProvider(state);
  const bundle=getFallbackProviderBundle(provider,state);
  const budget=parseFloat(String(c.monthly||'').replace(/[^0-9.]/g,''))||0;
  const domainLabel=b.domain||'Cloud Infrastructure';
  const hybrid=String(t.deploy||'').toLowerCase().includes('hybrid');
  const diagram=`architecture-beta
group edge(cloud)[Edge]
group app(cloud)[Application]
group data(cloud)[Data]
group ops(cloud)[Operations]
service users(internet)[Users] in edge
service access(server)[Access] in edge
service runtime(server)[Runtime] in app
service db(database)[Data] in data
service backup(disk)[Backup] in ops
users:R --> L:access
access:R --> L:runtime
runtime:R --> L:db
runtime:B --> T:backup`;
  const fmtRange=(lowRatio,highRatio,fallbackLow,fallbackHigh)=>{
    if(!budget) return `$${fallbackLow.toLocaleString()}-$${fallbackHigh.toLocaleString()}/month`;
    const low=Math.max(fallbackLow,Math.round(budget*lowRatio));
    const high=Math.max(fallbackHigh,Math.round(budget*highRatio));
    return `$${low.toLocaleString()}-$${high.toLocaleString()}/month`;
  };
  const mkTier=(id,label,tagline,monthlyTotal,budgetNote,stack,costBreakdown,biggestCostDriver,budgetRatio)=>({
    id,label,tagline,monthly_total:monthlyTotal,budget_feasible:budget?Math.round(budget*budgetRatio)<=budget:true,budget_note:budgetNote,stack,architecture_diagram:diagram,cost_breakdown:costBreakdown,biggest_cost_driver:biggestCostDriver
  });

  const conservativeStack=[
    {layer:'Identity & Access',rec:bundle.identity,why:'Establishes a Zero Trust control plane before major workload migration so access policies are consistent across on-prem and cloud.',monthly_cost_est:'$500-$1,200/month'},
    {layer:'Networking',rec:bundle.networking,why:'Creates the hybrid landing zone, resolves DNS across environments, and reduces outage risk during staged migration.',monthly_cost_est:'$1,200-$2,200/month'},
    {layer:'Compute',rec:bundle.compute,why:'Moves only the workloads that are ready while keeping latency-sensitive or regulated systems on-prem until dependencies are retired.',monthly_cost_est:'$1,000-$2,000/month'},
    {layer:'Data & Storage',rec:bundle.data,why:'Supports gradual migration, backup copy separation, and clear data-sovereignty boundaries.',monthly_cost_est:'$1,000-$1,800/month'},
    {layer:'Endpoint Security',rec:bundle.endpoint,why:'Prevents unmanaged or unhealthy laptops from becoming the weak link in a hybrid access model.',monthly_cost_est:'$700-$1,400/month'},
    {layer:'Operations & Backup',rec:bundle.ops,why:'Provides immutable backups, drift detection, and a single operational view across hybrid infrastructure.',monthly_cost_est:'$900-$1,700/month'}
  ];
  const recommendedStack=[
    {layer:'Identity & Access',rec:bundle.identity,why:'Makes device compliance, conditional access, and privileged access governance part of the operating model instead of an add-on.',monthly_cost_est:'$900-$1,800/month'},
    {layer:'Hybrid Networking',rec:bundle.networking,why:'Supports split-horizon DNS, route control, egress filtering, and deterministic traffic flow between on-prem and cloud services.',monthly_cost_est:'$2,000-$3,500/month'},
    {layer:'Application Platform',rec:bundle.compute,why:'Lets the team migrate customer-facing and integration workloads first while keeping dependency-heavy systems in place until remediation is complete.',monthly_cost_est:'$2,000-$3,500/month'},
    {layer:'Data Platform',rec:bundle.data,why:'Separates migratable data services from regulated systems that must remain local, which reduces compliance and cutover risk.',monthly_cost_est:'$1,800-$3,000/month'},
    {layer:'Endpoint & Device Security',rec:bundle.endpoint,why:'Enforces laptop health, encryption, and remote wipe globally so remote users can safely reach hybrid resources.',monthly_cost_est:'$1,000-$2,000/month'},
    {layer:'Operations, Backup & Governance',rec:bundle.ops,why:'Centralizes visibility, drift controls, and immutable recovery posture across both environments.',monthly_cost_est:'$1,400-$2,500/month'}
  ];
  const optimisedStack=[
    {layer:'Identity & Access',rec:bundle.identity,why:'No major reduction here; Zero Trust and device posture remain mandatory even in an optimized cost posture.',monthly_cost_est:'$800-$1,500/month'},
    {layer:'Hybrid Networking',rec:bundle.networking,why:'Costs improve only after overlapping routes, legacy protocols, and temporary transition links are retired.',monthly_cost_est:'$1,700-$2,800/month'},
    {layer:'Application Platform',rec:bundle.compute,why:'Savings come from right-sizing migrated services and decommissioning tolerated or eliminated workloads after validation.',monthly_cost_est:'$1,600-$2,700/month'},
    {layer:'Data Platform',rec:bundle.data,why:'Storage and database costs fall as duplicate migration-era copies and short-term staging systems are retired.',monthly_cost_est:'$1,400-$2,400/month'},
    {layer:'Endpoint & Device Security',rec:bundle.endpoint,why:'Standardized device baselines lower support effort and reduce exceptions over time.',monthly_cost_est:'$900-$1,700/month'},
    {layer:'Operations, Backup & Governance',rec:bundle.ops,why:'Backup and drift tooling remain, but retention tiers and monitoring scope can be tuned after baseline risk is under control.',monthly_cost_est:'$1,200-$2,000/month'}
  ];

  return {
    executive_summary:`${b.company||'This client'} needs a ${hybrid?'hybrid':'cloud'} infrastructure recommendation for ${domainLabel}, and the live model response could not be safely recovered, so ArchitectIQ is showing a deterministic fallback architecture based on the current inputs. The recommendation emphasizes secure connectivity, centralized operations, endpoint control, and phased migration before aggressive modernization. The biggest risk is unresolved dependency mapping between on-prem systems and migrated services, which can create outages during cutover if not addressed early.`,
    tiers:[
      mkTier('conservative','Conservative','Phased hybrid baseline with minimum new cloud services and controlled migration waves',fmtRange(0.55,0.75,6000,9000),'Lowest-risk starting point while preserving hybrid connectivity and core security controls.',conservativeStack,{llm_api:'$0/month',compute:'$1,600/month',storage:'$1,200/month',networking:'$1,700/month',tooling:'$2,300/month'},'Networking and security tooling dominate first because hybrid connectivity, endpoint controls, and immutable backup posture must land before migration accelerates.',0.55),
      mkTier('recommended','Recommended','Production-ready hybrid target state with resilient connectivity, centralized operations, and governed migration waves',fmtRange(0.8,1.0,10000,16000),'Best balance of hybrid resilience, security baseline, and manageable operating complexity.',recommendedStack,{llm_api:'$0/month',compute:'$2,800/month',storage:'$2,100/month',networking:'$2,900/month',tooling:'$3,900/month'},'Secure hybrid connectivity and unified operations tooling remain the main cost center because they underpin every migration wave and resilience target.',0.8),
      mkTier('optimised','Optimised','Cost-engineered hybrid platform after the first migration waves prove stable and dependencies are reduced',fmtRange(0.68,0.86,8000,13000),'Assumes early dependency cleanup, tighter endpoint scope, and reserved or committed spend where justified.',optimisedStack,{llm_api:'$0/month',compute:'$2,200/month',storage:'$1,700/month',networking:'$2,300/month',tooling:'$3,100/month'},'Hybrid network and governance controls still lead spend because the architecture remains dual-site until more legacy systems are eliminated.',0.68)
    ],
    risks:[
      {risk:'Unmapped dependencies between on-prem identity, databases, and migrated application services could break authentication or data access during a migration wave.',severity:'High',likelihood:'High',fix:'Require dependency discovery and a signed cutover checklist for every workload group before any production migration window.'},
      {risk:'IP overlap, DNS split issues, or temporary dual-routing could create intermittent outages that are difficult for testers to reproduce.',severity:'High',likelihood:'Medium',fix:'Reserve non-overlapping cloud CIDRs up front, document route ownership, and validate split-horizon DNS behavior in a pre-production hybrid test.'},
      {risk:'Endpoint posture gaps on employee laptops could bypass otherwise strong network controls and become the fastest path to data loss.',severity:'High',likelihood:'Medium',fix:'Block access from non-compliant devices using MDM plus EDR posture checks, full-disk encryption enforcement, and remote wipe capability.'},
      {risk:'Legacy LDAP or older TLS dependencies may delay workload migration beyond the planned timeline if no interim bridging pattern is implemented.',severity:'Medium',likelihood:'High',fix:'Create a temporary proxy or protocol translation layer and put explicit retirement dates on each dependent legacy service.'},
      {risk:'Backups that are not immutable across both sites may fail to protect the estate during ransomware or operator error events.',severity:'High',likelihood:'Medium',fix:'Adopt 3-2-1 backup policy with immutable off-site copies and run restore drills against representative critical systems each quarter.'},
      {risk:`${contradictions.length?'Input contradictions around cost, SLA, or operating model may force trade-offs that are not yet fully resolved.':'Team capability and migration sequencing remain the main delivery constraint for the recommended target state.'}`,severity:'Medium',likelihood:'Medium',fix:'Confirm workload priorities, acceptable downtime, and operating ownership before locking the migration waves and vendor commitments.'}
    ],
    decisions:[
      {what:`Use ${bundle.providerLabel} as the primary landing zone`,why:'The current estate and operating model suggest this provider offers the most credible path to a governed hybrid setup without requiring a bespoke platform build.'},
      {what:'Sequence migration by dependency and operational risk rather than by application popularity',why:'Hybrid migrations fail when identity, data, and network dependencies are discovered during cutover instead of before it.'},
      {what:'Make endpoint compliance a hard gate for internal access',why:'A hybrid estate expands the attack surface, so unmanaged laptops cannot be treated as trusted clients.'},
      {what:'Treat immutable backup and drift control as foundation work, not phase-three hardening',why:'These controls are part of the minimum safe state for a live hybrid environment, especially while both on-prem and cloud systems coexist.'}
    ],
    roadmap:[
      {phase:'Phase 1 - Discovery and control baseline',timeline:'Weeks 1-4',deliverables:['Catalog workloads, identity dependencies, and network ranges','Stand up the landing zone, logging baseline, and immutable backup policy','Enroll all managed endpoints into MDM and EDR posture enforcement'],owner:'Infrastructure lead plus security owner',done_when:'The migration backlog is dependency-ranked, cloud address space is approved, and device compliance is enforceable.'},
      {phase:'Phase 2 - Hybrid foundation',timeline:'Weeks 5-10',deliverables:['Implement private connectivity or VPN failover path','Deploy split-horizon DNS and egress filtering controls','Bring centralized operations and drift monitoring online'],owner:'Platform and network team',done_when:'Hybrid traffic flows are tested end to end and operational visibility covers both on-prem and cloud assets.'},
      {phase:'Phase 3 - Migration waves',timeline:'Weeks 11-18',deliverables:['Migrate low-dependency application workloads first','Retain regulated or latency-sensitive systems on-prem where required','Validate rollback and restore procedures after each wave'],owner:'Platform team with application owners',done_when:'First migration waves are stable in production and rollback evidence exists for every critical service.'}
    ],
    next_steps:[
      'Approve the primary landing-zone provider and hybrid connectivity pattern - VP Engineering - this week',
      'Complete dependency mapping for identity, DNS, databases, and file services before scheduling the first production migration wave - platform team - within 10 business days',
      'Standardize endpoint compliance policy for encryption, antivirus, and remote wipe before expanding remote access - security owner - within 2 weeks',
      'Run a backup restore drill and a cutover rehearsal against one representative non-critical workload - infrastructure team - within 30 days'
    ],
    disclaimer:`This fallback recommendation was generated from the client inputs because the live model response could not be safely recovered (${error?.message||'unknown generation error'}). Treat it as a safe interim output for review, not as a replacement for a successful fully generated recommendation.`
  };
}

function buildFallbackValidation(error){
  return {
    verdict:'warn',
    budget_feasible:true,
    budget_note:'ArchitectIQ recovered using a deterministic fallback recommendation after the live model response could not be safely parsed.',
    constraint_violations:[],
    warnings:[
      'Live generation failed and a local fallback recommendation was used instead.',
      error?.message||'Unknown generation error.'
    ],
    price_accuracy:'Estimated locally from deterministic fallback ranges - no live validation applied.',
    improvements:[
      'Retry generation after checking provider health and server logs if you need a fully model-generated output.',
      'Review the fallback stack and replace generic assumptions with confirmed workload inventory and dependency findings.'
    ]
  };
}

async function requestStructuredRecommendation(userPrompt,attempt=1){
  const headers=(attempt>1 && SERVER_CONFIG.openaiKeyConfigured)?{'X-LLM-Force':'openai'}:{};
  const attemptPrompt=attempt>1
    ? `Your previous attempt returned output that could not be safely parsed as valid JSON. Return a fresh response that strictly matches the required JSON schema.\n\n${userPrompt}`
    : userPrompt;
  const data=await callOpenAI({
    apiPath:'/v1/responses',
    model:'gpt-5.4',
    reasoning:{effort:attempt>1?'none':'low'},
    max_output_tokens:16000,
    text:{format:{type:'json_schema',name:'architectiq_recommendation',schema:RESPONSE_SCHEMA,strict:true}},
    tools:WEB_SEARCH_ENABLED?[{type:'web_search'}]:[],
    instructions:SYSTEM_PROMPT,
    input:attemptPrompt
  },{headers});
  logEvent('info','generation.response_received',{attempt,responseKeys:Object.keys(data||{})});
  const parsed=extractParsedObject(data);
  const raw=parsed?null:extractModelText(data);
  if(!parsed&&!raw) throw new Error(`Empty response. Keys: ${Object.keys(data||{}).join(', ')||'none'}`);
  if(parsed) return {result:parsed,raw:'',repaired:false};
  try{
    return {result:parseModelJson(raw),raw,repaired:false};
  }catch(parseErr){
    logEvent('warn','generation.parse_repair_started',{attempt,message:parseErr.message,raw_preview:summarizeFailurePreview(raw,1600)});
    try{
      const repaired=await repairModelJson(raw,parseErr);
      logEvent('info','generation.parse_repair_succeeded',{attempt});
      return {result:repaired,raw,repaired:true};
    }catch(repairErr){
      logEvent('error','generation.parse_repair_failed',{
        attempt,
        parse_message:parseErr.message,
        repair_message:repairErr.message,
        raw_preview:summarizeFailurePreview(raw,2400)
      });
      throw new Error(`Structured output recovery failed on attempt ${attempt}. ${repairErr.message}`);
    }
  }
}

export function runMockRecommendation(){
  logEvent('info','generation.mock_started',{company:S.basics.company||'ArchitectIQ'});
  ARCHITECTURE_UI.panel='solution';
  ARCHITECTURE_UI.display='diagram';
  DIAGRAM_RENDER_CACHE={};
  DIAGRAM_RENDER_TOKEN=0;
  LAST_CONTRADICTIONS=[];
  LAST_RESEARCH=null;
  LAST_PRICING_CONTEXT=null;
  LAST_VALIDATION=null;
  showOutput(getMockRecommendation(),LAST_CONTRADICTIONS,LAST_RESEARCH,LAST_VALIDATION);
  logEvent('info','generation.mock_completed',{company:S.basics.company||'ArchitectIQ'});
}

async function generate(){
  if(SERVER_CONFIG.loading) await refreshServerConfig();
  else if(!SERVER_CONFIG.loaded) await refreshServerConfig();
  const outDiv=document.getElementById('out');
  if(!outDiv) return;
  if(SERVER_CONFIG.loaded&&SERVER_CONFIG.error){
    outDiv.innerHTML=`<div class="err-box" style="margin-top:1rem"><strong>Cannot reach the ArchitectIQ API server.</strong> Open the app through the Node server at <code>http://localhost:3000</code> and make sure <code>server.js</code> is running. Details: ${escapeHtml(SERVER_CONFIG.error)}</div><div style="margin-top:1rem"><button class="btn" onclick="runMockRecommendation()">Preview mock recommendation</button></div>`;
    return;
  }
  if(SERVER_CONFIG.keyConfigured===false){
    outDiv.innerHTML=`<div class="err-box" style="margin-top:1rem"><strong>Live generation is not configured.</strong> Add <code>ANTHROPIC_API_KEY</code> or <code>OPENAI_API_KEY</code> to your local <code>.env</code>, then restart the ArchitectIQ Node server. You can still preview the retail output with the mock recommendation.</div><div style="margin-top:1rem"><button class="btn" onclick="runMockRecommendation()">Preview mock recommendation</button></div>`;
    return;
  }
  const b=S.basics,sc=S.scale,c=S.cost,t=S.team;
  REVIEW_DECISION={status:'pending',note:'Not reviewed'};

  // -- Minimum input guard ---
  const hasMinInput=(b.company||'').trim()||(b.domain||'').trim()||(b.problem||'').trim();
  if(!hasMinInput){
    outDiv.innerHTML=`<div class="err-box" style="margin-top:1rem"><strong>Missing inputs.</strong> Please provide at least a company name, domain, and problem description before generating.</div><div style="margin-top:1rem"><button class="btn" onclick="go(-1)">Edit inputs</button></div>`;
    return;
  }

  // Initialise pipeline UI
  initPipeline();
  DIAGRAM_RENDER_CACHE={};
  DIAGRAM_RENDER_TOKEN=0;
  LAST_CONTRADICTIONS=[];LAST_RESEARCH=null;LAST_PRICING_CONTEXT=null;LAST_VALIDATION=null;
  outDiv.innerHTML=`<div id="pipeline-container">${pipelineMarkup()}</div>`;

  // -- Phase 1: Research ---
  setPipelineStage('research','run','Searching for company info & industry signals...');
  try{
    const research=await runResearchPhase(b.company,b.industry,b.stack);
    LAST_RESEARCH=research;
    const conf=research?.research_confidence||'low';
    const flags=(research?.red_flags||[]).length;
    setPipelineStage('research','done',`${conf} confidence - ${flags} flag(s)`);
    logEvent('info','research.completed',{confidence:conf,flags});
  }catch(err){
    setPipelineStage('research','warn','Research unavailable  -  proceeding without');
    logEvent('warn','research.failed',{message:err.message});
  }

  // -- Phase 2: Live pricing ---
  setPipelineStage('pricing','run','Querying Azure, AWS & GCP pricing APIs...');
  try{
    const stackLow=(b.stack||'').toLowerCase();
    const cloud=stackLow.includes('azure')?'azure':stackLow.includes('aws')?'aws':stackLow.includes('gcp')||stackLow.includes('google')?'gcp':null;
    const pricing=await buildPricingContext(cloud,b.domain,S);
    LAST_PRICING_CONTEXT=pricing;
    const pts=pricing.usablePricePoints?.length||0;
    const azureOk=!!pricing.azure;
    const awsOk=!!pricing.aws?.indexLoaded;
    const gcpOk=!!pricing.gcp?.available;
    const sources=[azureOk&&'Azure',awsOk&&'AWS',gcpOk&&'GCP (web)'].filter(Boolean);
    setPipelineStage('pricing','done',`${sources.join(' - ')||' - '} - ${pts} price point(s)`);
    logEvent('info','pricing.completed',{points:pts,azureOk,awsOk,excluded:pricing.exclusions?.length||0,region:pricing.region?.label||'unknown'});
  }catch(err){
    setPipelineStage('pricing','warn','Pricing unavailable  -  using model estimates only');
    logEvent('warn','pricing.failed',{message:err.message});
  }

  // -- Phase 3: Contradiction detection ---
  setPipelineStage('contradictions','run','Checking inputs for conflicts...');
  const contradictions=detectContradictions(S);
  LAST_CONTRADICTIONS=contradictions;
  const highCount=contradictions.filter(i=>i.severity==='high').length;
  if(!contradictions.length){
    setPipelineStage('contradictions','done','No issues found');
  }else{
    setPipelineStage('contradictions','warn',`${contradictions.length} issue(s)${highCount?` - ${highCount} critical`:''}`);
    // Append warnings below pipeline
    const contraHTML=contradictions.map(i=>{
      const dotCls=`ci-${i.severity}`;
      return `<div class="contradiction-item"><div class="ci-dot ${dotCls}">${i.severity==='high'?'!':i.severity==='medium'?'^':'i'}</div><span>${escapeHtml(i.msg)}</span></div>`;
    }).join('');
    const host=document.getElementById('pipeline-container');
    if(host) host.insertAdjacentHTML('beforeend',`<div class="contradiction-box"><div class="contradiction-title">Input issues detected  -  review before client delivery</div>${contraHTML}</div>`);
  }
  logEvent('info','contradictions.checked',{count:contradictions.length,high:highCount});

  // -- Phase 4: Architect playbook ---
  setPipelineStage('playbook','run','Selecting relevant architecture reasoning rules...');
  const retrievedPlaybookRules=selectArchitectThinkingRules(S);
  const playbookBlock=buildArchitectThinkingPlaybookBlock(S);
  const retailReviewBlock=buildRetailReviewPromptBlock(S);
  const boardBlock=architectureBoardPromptBlock(S);
  const playbookNames=retrievedPlaybookRules.slice(0,3).map(rule=>ruleDisplayName(rule)).join(', ');
  setPipelineStage('playbook','done',`${retrievedPlaybookRules.length} rule(s) applied${playbookNames?` - ${playbookNames}`:''}`);
  logEvent('info','playbook.retrieved',{rules:retrievedPlaybookRules.map(rule=>rule.id)});

  // -- Phase 5: Generate ---
  setPipelineStage('generate','run','Architecture agents are working together through the retrieved architect playbook...');

  const costSummary=CL.map(([key,label])=>`${label}: ${S.cost[key]||'not specified'}`).join(' | ');
  const nfrSummary=NF.map(([key])=>`${key}: ${S.nfr[key]||'not specified'}`).join('\n');

  const researchBlock=LAST_RESEARCH?`\nRESEARCH FINDINGS (web-verified):\nCompany: ${LAST_RESEARCH.company_profile||''}\nStack notes: ${LAST_RESEARCH.stack_observations||''}\nCompliance: ${LAST_RESEARCH.industry_compliance||''}\nPatterns: ${LAST_RESEARCH.competitor_patterns||''}\nRed flags: ${(LAST_RESEARCH.red_flags||[]).join('; ')}\n`:'';
  const pricingBlock=LAST_PRICING_CONTEXT?`\nLIVE PRICING (from pricing APIs; excluded datapoints are not validation evidence):\n${formatPricingSummaryForPrompt(LAST_PRICING_CONTEXT)}\n`:'';
  const contraBlock=contradictions.length?`\nINPUT WARNINGS (address in your recommendation):\n${contradictions.map(i=>`[${i.severity.toUpperCase()}] ${i.msg}`).join('\n')}\n`:'';
  const userPrompt=`Generate a full solution architecture recommendation for this client using the exact rules and JSON output contract from the system prompt.
Date of generation: ${new Date().toISOString().slice(0,10)}.
${researchBlock}${pricingBlock}${contraBlock}${playbookBlock}${retailReviewBlock}${boardBlock}
CLIENT:
Company: ${b.company}
Industry: ${b.industry}
Domain: ${b.domain}
Contact: ${b.contact}
Business Problem: ${b.problem}
Existing Stack: ${b.stack}
Hard Constraints: ${b.constraints}

SCALE:
Current: ${sc.usersNow}
12 months: ${sc.users12m}
Peak: ${sc.peak}
Latency: ${sc.latency}
SLA: ${sc.sla}
Traffic: ${sc.traffic}
Read / write ratio: ${sc.rw}
Data: ${sc.data}

COST PRIORITIES:
${costSummary}
Monthly budget: ${c.monthly}
Setup budget: ${c.setup}

NON-FUNCTIONAL REQUIREMENTS:
${nfrSummary}

TEAM:
Size and roles: ${t.size}
Seniority: ${t.seniority}
Timeline: ${t.timeline}
Build vs buy: ${t.buildBuy}
Deployment: ${t.deploy}
Notes: ${t.notes}

OUTPUT AUDIENCE: ${AUDIENCE_VIEW==='executive'?'Executive / non-technical stakeholder. Write all "why" fields in plain business language  -  avoid acronyms, technical jargon, and implementation details. Focus on business outcomes, risk reduction, and strategic rationale that a CEO or board member would understand.':'Technical (architects and engineers). Include technical justifications, service names, and implementation rationale in "why" fields.'}

Return only the JSON object. Do not wrap it in markdown.`;

  try{
    logEvent('info','generation.started',{company:b.company,orchestration:'architecture-agents',hasResearch:!!LAST_RESEARCH,hasPricing:!!(LAST_PRICING_CONTEXT?.usablePricePoints?.length),contradictions:contradictions.length});
    let result=null;
    let generationFailure=null;
    for(let attempt=1;attempt<=2;attempt++){
      try{
        if(attempt>1){
          setPipelineStage('generate','run',`Retrying generation (${attempt}/2) after invalid model output...`);
          logEvent('warn','generation.retry_started',{attempt});
        }
        const generated=await requestStructuredRecommendation(userPrompt,attempt);
        result=generated.result;
        break;
      }catch(attemptErr){
        generationFailure=attemptErr;
        logEvent('warn','generation.attempt_failed',{attempt,message:attemptErr.message});
      }
    }
    if(!result){
      result=buildEmergencyFallbackRecommendation(S,contradictions,generationFailure);
      result=enrichRecommendationForReview(result,S,LAST_RESEARCH,LAST_PRICING_CONTEXT);
      LAST_VALIDATION=buildFallbackValidation(generationFailure);
      setPipelineStage('generate','warn','Recovered with deterministic fallback output');
      setPipelineStage('review','warn','Specialist lenses skipped - fallback output');
      setPipelineStage('validate','warn','Validation skipped - fallback output');
      logEvent('error','generation.fallback_used',{message:generationFailure?.message||'unknown generation failure'});
      ARCHITECTURE_UI.panel='solution';
      ARCHITECTURE_UI.display='diagram';
      showOutput(result,contradictions,LAST_RESEARCH,LAST_VALIDATION);
      refreshServerLogs();
      return;
    }

    // -- Forbidden-pattern guard ---
    // Runs before validation. If forbidden orchestrators appear in the stack,
    // fires a targeted correction call to replace just those layers.
    result=await scanAndCorrectForbiddenPatterns(result,getPlaybookText(S));
    result=enrichRecommendationForReview(result,S,LAST_RESEARCH,LAST_PRICING_CONTEXT);

    const tierCount=(result.tiers||[]).length;
    const recTierLayers=((result.tiers||[]).find(t=>t.id==='recommended')||{}).stack?.length||0;
    setPipelineStage('generate','done',`${tierCount} tiers - ${recTierLayers} layers (rec) - ${(result.risks||[]).length} risks`);
    logEvent('info','generation.completed',{tiers:tierCount,recLayers:recTierLayers,risks:(result.risks||[]).length});

    // -- Phase 6: Specialist review lenses ---
    setPipelineStage('review','run','Applying specialist review lenses to generated output...');
    setPipelineStage('review','done',`${ARCHITECT_REVIEW_LENSES.length} lenses applied - human approval pack prepared`);
    logEvent('info','review_lenses.applied',{lenses:ARCHITECT_REVIEW_LENSES.map(lens=>lens.name)});

    // -- Phase 7: Validate ---
    setPipelineStage('validate','run','Checking senior-architect quality, constraints & pricing...');
    try{
      const validation=await runValidationPhase(result,S,LAST_RESEARCH,LAST_PRICING_CONTEXT);
      LAST_VALIDATION=validation;
      const v=validation?.verdict||'warn';
      const viol=(validation?.constraint_violations||[]).length;
      setPipelineStage('validate',v==='fail'?'error':v==='pass'?'done':'warn',`${v.toUpperCase()} - ${viol} violation(s) - ${(validation?.warnings||[]).length} warning(s)`);
      logEvent('info','validation.completed',{verdict:v,violations:viol});
    }catch(err){
      setPipelineStage('validate','warn','Validation skipped');
      logEvent('warn','validation.failed',{message:err.message});
    }

    ARCHITECTURE_UI.panel='solution';
    ARCHITECTURE_UI.display='diagram';
    showOutput(result,contradictions,LAST_RESEARCH,LAST_VALIDATION);
    refreshServerLogs();
  }catch(e){
    setPipelineStage('generate','warn','Recovered after pipeline failure');
    setPipelineStage('review','warn','Specialist lenses skipped - fallback output');
    setPipelineStage('validate','warn','Validation skipped - fallback output');
    logEvent('error','generation.failed',{message:e.message});
    refreshServerLogs();
    LAST_VALIDATION=buildFallbackValidation(e);
    ARCHITECTURE_UI.panel='solution';
    ARCHITECTURE_UI.display='diagram';
    showOutput(enrichRecommendationForReview(buildEmergencyFallbackRecommendation(S,LAST_CONTRADICTIONS,e),S,LAST_RESEARCH,LAST_PRICING_CONTEXT),LAST_CONTRADICTIONS,LAST_RESEARCH,LAST_VALIDATION);
  }
}

const tb=t=>t==='Minimise'?'g':t==='Quality First'?'a':'';
const sb=s=>s==='High'?'r':s==='Medium'?'a':'g';
function parseMonthlyRange(value){
  const nums=String(value||'').match(/[0-9][0-9,]*(?:\.\d+)?/g)?.map(n=>Number(n.replace(/,/g,''))).filter(n=>Number.isFinite(n))||[];
  if(!nums.length) return {low:0,high:0,known:false};
  if(nums.length===1) return {low:nums[0],high:nums[0],known:true};
  return {low:Math.min(...nums),high:Math.max(...nums),known:true};
}

function getBudgetCap(){
  const raw=String(S?.cost?.monthly||'');
  const nums=raw.match(/[0-9][0-9,]*(?:\.\d+)?/g)?.map(n=>Number(n.replace(/,/g,''))).filter(n=>Number.isFinite(n))||[];
  return nums.length?Math.max(...nums):0;
}

function tierFitsBudget(tier,budget=getBudgetCap()){
  if(!tier) return false;
  if(tier.budget_feasible===false) return false;
  const range=parseMonthlyRange(tier.monthly_total);
  if(budget&&range.known&&range.high>budget) return false;
  return tier.budget_feasible!==false;
}

function chooseDefaultTier(tiers){
  const list=Array.isArray(tiers)?tiers:[];
  if(!list.length) return null;
  return list.find(t=>t.id==='recommended'&&tierFitsBudget(t))
    ||list.find(t=>t.id==='optimised'&&tierFitsBudget(t))
    ||list.find(t=>tierFitsBudget(t))
    ||list.find(t=>t.id==='recommended')
    ||list[0];
}

function getPricingEvidenceStatus(result){
  const status=String(result?.evidence_status?.pricing||'').toLowerCase();
  const serviceLevel=(LAST_PRICING_CONTEXT?.usablePricePoints||[]).length>0;
  if(status==='verified'&&serviceLevel) return {label:'Verified pricing',cls:'price-live'};
  if(status==='partial'||serviceLevel) return {label:'Pricing partially verified',cls:'price-partial'};
  return {label:'Pricing assumptions',cls:'price-assumption'};
}

export function setTier(id){
  ACTIVE_TIER=id;
  ARCHITECTURE_UI.panel='solution';
  ARCHITECTURE_UI.display='diagram';
  if(window.__lastResult) showOutput(window.__lastResult,LAST_CONTRADICTIONS,LAST_RESEARCH,LAST_VALIDATION);
}

export function setAudience(mode){
  AUDIENCE_VIEW=mode;
  const isExec=mode==='executive';
  // Sidebar toggle
  const techBtn=document.getElementById('aud-tech');
  const execBtn=document.getElementById('aud-exec');
  if(techBtn) techBtn.classList.toggle('active',!isExec);
  if(execBtn) execBtn.classList.toggle('active',isExec);
  // Output view bar
  document.querySelectorAll('.ovp').forEach(el=>{
    el.classList.toggle('active',el.dataset.mode===mode);
  });
  // Apply class to out div
  const outEl=document.getElementById('out');
  if(outEl){
    outEl.classList.remove('aud-tech','aud-exec');
    outEl.classList.add(isExec?'aud-exec':'aud-tech');
  }
}

export function setReviewDecision(status){
  const allowed=new Set(['pending','approved','revise']);
  REVIEW_DECISION.status=allowed.has(status)?status:'pending';
  REVIEW_DECISION.note=REVIEW_DECISION.status==='approved'
    ? `Approved locally on ${new Date().toLocaleString()}`
    : REVIEW_DECISION.status==='revise'
      ? `Revision requested on ${new Date().toLocaleString()}`
      : 'Not reviewed';
  logEvent(REVIEW_DECISION.status==='approved'?'info':'warn','review.decision_changed',{status:REVIEW_DECISION.status});
  if(window.__lastResult) showOutput(window.__lastResult,LAST_CONTRADICTIONS,LAST_RESEARCH,LAST_VALIDATION);
}

function buildTierSection(activeTier){
  const stackRows=(activeTier.stack||[]).map(item=>`<tr><td class="layer-name">${escapeHtml(item.layer||'-')}</td><td class="tech-only"><div class="layer-rec">${escapeHtml(item.rec||'-')}</div></td><td><div class="layer-why">${escapeHtml(item.why||'-')}</div></td><td class="tech-only" style="white-space:nowrap;font-size:12px;color:var(--color-text-secondary)">${escapeHtml(item.monthly_cost_est||'-')}</td></tr>`).join('');
  const breakdown=activeTier.cost_breakdown||{};
  const architectureViews=buildArchitectureViews(activeTier);
  const architectureView=architectureViews[ARCHITECTURE_UI.panel]||architectureViews.solution;
  const architectureSummary=summarizeArchitectureDiagram(architectureView.code);
  const architectureFacts=getArchitectureFacts(activeTier);
  const architectureGroups=architectureSummary.groups.length?architectureSummary.groups.map(group=>`<span class="architecture-group-chip">${escapeHtml(group)}</span>`).join(''):'<span class="architecture-group-chip">Ungrouped pipeline</span>';
  const architectureDisplayLabel=getArchitectureDisplayLabel(ARCHITECTURE_UI.display);
  const architectureDisplayNote=getArchitectureDisplayNote(ARCHITECTURE_UI.display);
  const architectureSignals=getArchitectureSignals(architectureFacts).map(signal=>`<div class="architecture-insight ${signal.tone}"><div class="architecture-insight-label">${escapeHtml(signal.label)}</div><div class="architecture-insight-value">${escapeHtml(signal.value)}</div><div class="architecture-insight-note">${escapeHtml(signal.note)}</div></div>`).join('');
  const architectureViewCards=Object.entries(architectureViews).map(([key,view])=>{const summary=summarizeArchitectureDiagram(view.code);return `<button type="button" class="architecture-view-card ${ARCHITECTURE_UI.panel===key?'active':''}" onclick="setArchitecturePanel('${key}')"><div class="architecture-view-card-head"><div class="architecture-view-title">${escapeHtml(view.title)}</div><span class="architecture-view-status">${ARCHITECTURE_UI.panel===key?'Active':'View'}</span></div><div class="architecture-view-copy">${escapeHtml(view.subtitle)}</div><div class="architecture-view-meta"><span>${summary.serviceCount} services</span><span>${summary.edgeCount} flows</span></div></button>`;}).join('');
  const architectureLegend=architectureView.notes.map(note=>`<div class="architecture-legend-row"><span class="architecture-legend-dot"></span><span>${escapeHtml(note)}</span></div>`).join('');
  const annotationLegend=buildArchitectureAnnotationLegend(architectureFacts);
  const architectureShowDiagram=ARCHITECTURE_UI.display!=='code';
  const architectureShowCode=ARCHITECTURE_UI.display!=='diagram';
  const architectureStageClass=`architecture-stage${ARCHITECTURE_UI.display==='split'?' split':''}`;
  const architectureSection=`<div class="card architecture-card"><div class="architecture-hero"><div><div class="architecture-kicker">Diagram Studio  -  ${escapeHtml(activeTier.label)}</div><div class="architecture-title">${escapeHtml(architectureView.title)}</div><div class="architecture-subtitle">${escapeHtml(architectureView.source)}</div></div><div class="architecture-toolbar"><span class="arch-pill">${escapeHtml(architectureDisplayLabel)}</span><button class="btn" onclick="copyArchitectureCode()">Copy Python</button></div></div><div class="architecture-view-grid">${architectureViewCards}</div><div class="architecture-metrics"><div class="architecture-metric"><div class="architecture-metric-label">Groups</div><div class="architecture-metric-value">${architectureSummary.groupCount}</div></div><div class="architecture-metric"><div class="architecture-metric-label">Services</div><div class="architecture-metric-value">${architectureSummary.serviceCount}</div></div><div class="architecture-metric"><div class="architecture-metric-label">Flows</div><div class="architecture-metric-value">${architectureSummary.edgeCount}</div></div><div class="architecture-metric"><div class="architecture-metric-label">Tier</div><div class="architecture-metric-value" style="font-size:13px">${escapeHtml(activeTier.label)}</div></div></div><div class="architecture-insight-grid">${architectureSignals}</div><div class="architecture-layout"><div class="architecture-main"><div class="architecture-main-tools"><div class="architecture-segments"><button class="architecture-segment ${ARCHITECTURE_UI.display==='diagram'?'active':''}" onclick="setArchitectureDisplay('diagram')">Diagram</button><button class="architecture-segment ${ARCHITECTURE_UI.display==='split'?'active':''}" onclick="setArchitectureDisplay('split')">Split</button><button class="architecture-segment ${ARCHITECTURE_UI.display==='code'?'active':''}" onclick="setArchitectureDisplay('code')">Code</button></div><div class="architecture-stage-note">${escapeHtml(architectureDisplayNote)}</div></div><div class="${architectureStageClass}"><div class="diagram-wrap" style="display:${architectureShowDiagram?'block':'none'}"><div class="architecture-stage-top"><div><div class="architecture-stage-label">Rendered canvas</div><div class="architecture-stage-caption">Server-rendered SVG output generated by the Python diagrams renderer.</div></div><div class="architecture-stage-badge">Live render</div></div><div class="mermaid" id="architecture-mermaid"></div></div><div class="architecture-code-panel" style="display:${architectureShowCode?'block':'none'}"><div class="architecture-stage-top"><div><div class="architecture-stage-label">Python source</div><div class="architecture-stage-caption">Underlying Python diagrams source for export and renderer iteration.</div></div><div class="architecture-stage-badge">Source</div></div><div class="architecture-code-actions"><button class="btn" onclick="copyArchitectureCode()">Copy Python</button></div><pre class="diagram-code" id="architecture-code"></pre></div></div></div><aside class="architecture-side"><div class="architecture-side-section"><div class="architecture-side-heading">View brief</div><div class="architecture-side-title">${escapeHtml(architectureView.subtitle)}</div><div class="architecture-side-copy">${escapeHtml(architectureView.summary)}</div></div><div class="architecture-side-section"><div class="architecture-side-heading">Topology signals</div><div class="architecture-group-list">${architectureGroups}</div></div><div class="architecture-side-section"><div class="architecture-side-heading">Reading guide</div><div class="architecture-legend">${architectureLegend}</div></div>${annotationLegend}</aside></div></div>`;
  // Store the view+facts on window so renderArchitectureDiagram can be called after innerHTML
  window.__activeTierViews={architectureView,architectureFacts};
  return {stackRows,breakdown,architectureSection};
}

export function showOutput(result,contradictions=[],research=null,validation=null){
  result=enrichRecommendationForReview(result,S,research,LAST_PRICING_CONTEXT);
  window.__lastResult=result;
  LAST_CONTRADICTIONS=Array.isArray(contradictions)?contradictions:[];
  LAST_RESEARCH=research;
  LAST_VALIDATION=validation;

  const tiers=result.tiers||[];
  const defaultTier=chooseDefaultTier(tiers);
  const requestedTier=tiers.find(t=>t.id===ACTIVE_TIER);
  if(!requestedTier||!tierFitsBudget(requestedTier)){ACTIVE_TIER=defaultTier?.id||ACTIVE_TIER;}
  const activeTier=tiers.find(t=>t.id===ACTIVE_TIER)||defaultTier||tiers[0];
  if(!activeTier){document.getElementById('out').innerHTML='<div class="err-box">No tier data in response.</div>';return;}

  // Tier selector
  const pricingEvidence=getPricingEvidenceStatus(result);
  const priceBadge=`<span class="${pricingEvidence.cls}">${escapeHtml(pricingEvidence.label)}</span>`;
  const tierCards=tiers.map(t=>{
    const isActive=t.id===activeTier.id;
    const budgetCls=t.budget_feasible?'tier-budget-ok':'tier-budget-over';
    return `<div class="tier-card${isActive?' active':''}" onclick="setTier('${t.id}')">${isActive?'<span class="tier-active-badge">Selected</span>':''}<div class="tier-card-label">${escapeHtml(t.label)}</div><div class="tier-card-tagline">${escapeHtml(t.tagline||'-')}</div><div class="tier-card-price">${escapeHtml(t.monthly_total||'-')}</div><span class="tier-budget ${budgetCls}">${t.budget_feasible?'✓':'x'} ${escapeHtml(t.budget_note||'-')}</span></div>`;
  }).join('');

  // Active tier content (stack + architecture + cost breakdown)
  const {stackRows,breakdown,architectureSection}=buildTierSection(activeTier);

  // Shared sections
  const risks=(result.risks||[]).map(item=>`<div class="risk-row"><span class="sev ${item.severity==='High'?'sev-h':item.severity==='Medium'?'sev-m':'sev-l'}">${escapeHtml(item.severity||'-')}</span><div><div class="risk-text">${escapeHtml(item.risk||'-')}</div><div class="risk-fix tech-only">Likelihood: ${escapeHtml(item.likelihood||'-')} | Mitigation: ${escapeHtml(item.fix||'-')}</div></div></div>`).join('');
  const decisions=(result.decisions||[]).map(item=>`<div class="risk-row"><span class="sev sev-l">Decision</span><div><div class="risk-text">${escapeHtml(item.what||'-')}</div><div class="risk-fix">${escapeHtml(item.why||'-')}</div></div></div>`).join('');
  const nextSteps=(result.next_steps||[]).map((item,index)=>`<div class="step-item"><div class="step-n">${index+1}</div><div class="step-text">${escapeHtml(item)}</div></div>`).join('');
  const roadmap=(result.roadmap||[]).map((item,index)=>{const bullets=(item.deliverables||[]).map(d=>`<li>${escapeHtml(d)}</li>`).join('');return `<div class="rm-phase"><div class="rm-rail"><div class="rm-node">${index+1}</div><div class="rm-line"></div></div><div class="rm-body"><div class="rm-head"><div class="rm-title">${escapeHtml(item.phase||'-')}</div><span class="rm-badge">${escapeHtml(item.timeline||'-')}</span></div><ul class="rm-deliverables tech-only">${bullets}</ul><div class="rm-footer tech-only"><div class="rm-meta-row"><span class="rm-meta-label rm-owner-label">Owner</span><span class="rm-meta-val">${escapeHtml(item.owner||'-')}</span></div><div class="rm-meta-row"><span class="rm-meta-label rm-done-label">Done when</span><span class="rm-meta-val">${escapeHtml(item.done_when||'-')}</span></div></div></div></div>`;}).join('');

  // Research card
  let researchCard='';
  if(research){
    const conf=research.research_confidence||'low';
    const confCls=conf==='high'?'rc-high':conf==='medium'?'rc-medium':'rc-low';
    const fields=[['Company profile',research.company_profile],['Stack observations',research.stack_observations],['Industry compliance',research.industry_compliance],['Competitor patterns',research.competitor_patterns]].filter(([,v])=>v).map(([l,v])=>`<div class="research-field"><div class="rf-label">${l}</div><div class="rf-value">${escapeHtml(v)}</div></div>`).join('');
    const flags=(research.red_flags||[]).map(f=>`<div class="flag-item"><span class="flag-bullet"></span><span>${escapeHtml(f)}</span></div>`).join('');
    researchCard=`<div class="research-card"><div class="research-header"><div class="research-dot"></div><span class="research-title">Pre-engagement research</span><span class="research-confidence ${confCls}">${conf} confidence</span></div><div class="research-grid">${fields}</div>${flags?`<div class="research-notes-title">Research notes</div><div class="research-flags">${flags}</div>`:''}</div>`;
  }

  // Validation card
  let validationCard='';
  if(validation){
    const v=validation.verdict||'warn';
    const vcCls=v==='pass'?'vc-pass':v==='fail'?'vc-fail':'vc-warn';
    const vvCls=v==='pass'?'vv-pass':v==='fail'?'vv-fail':'vv-warn';
    const violations=(validation.constraint_violations||[]).map(i=>`<div class="validation-item"><div class="vi-dot vi-violation"></div>${escapeHtml(i)}</div>`).join('');
    const warnings=(validation.warnings||[]).map(i=>`<div class="validation-item"><div class="vi-dot vi-warning"></div>${escapeHtml(i)}</div>`).join('');
    const improvements=(validation.improvements||[]).map(i=>`<div class="validation-item"><div class="vi-dot vi-improvement"></div>${escapeHtml(i)}</div>`).join('');
    validationCard=`<div class="validation-card ${vcCls}"><div class="validation-header"><span class="validation-verdict ${vvCls}">${v}</span><span class="validation-title">Output validation</span></div>${validation.budget_note?`<div class="validation-item" style="margin-bottom:.5rem">${escapeHtml(validation.budget_note)}</div>`:''}<div style="font-size:11px;font-weight:500;color:var(--color-text-tertiary);text-transform:uppercase;letter-spacing:.05em;margin:.5rem 0 .25rem">Violations</div>${violations||'<div class="validation-item">None found</div>'}<div style="font-size:11px;font-weight:500;color:var(--color-text-tertiary);text-transform:uppercase;letter-spacing:.05em;margin:.5rem 0 .25rem">Warnings</div>${warnings||'<div class="validation-item">None</div>'}<div style="font-size:11px;font-weight:500;color:var(--color-text-tertiary);text-transform:uppercase;letter-spacing:.05em;margin:.5rem 0 .25rem">Suggested improvements</div>${improvements||'<div class="validation-item">None</div>'}<div style="font-size:11px;color:var(--color-text-secondary);margin-top:.75rem">Price accuracy: ${escapeHtml(validation.price_accuracy||' - ')}</div></div>`;
  }

  // Contradiction card
  let contraCard='';
  if(contradictions?.length){
    const items=contradictions.map(i=>`<div class="contradiction-item"><div class="ci-dot ci-${i.severity}">${i.severity==='high'?'!':i.severity==='medium'?'^':'i'}</div><span>${escapeHtml(i.msg)}</span></div>`).join('');
    contraCard=`<div class="contradiction-box"><div class="contradiction-title">Input issues flagged during generation</div>${items}</div>`;
  }

  const viewBar=`<div class="out-view-bar"><button class="ovp${AUDIENCE_VIEW==='technical'?' active':''}" data-mode="technical" onclick="setAudience('technical')">Technical view</button><button class="ovp${AUDIENCE_VIEW==='executive'?' active':''}" data-mode="executive" onclick="setAudience('executive')">Executive view</button></div>`;
  const execBanner=`<div class="exec-banner exec-only"><div class="exec-banner-label">Executive summary view</div><div class="exec-banner-body">Showing a simplified, business-focused summary. Switch to <strong>Technical view</strong> to see full stack details, architecture diagrams, and implementation specifics.</div></div>`;
  const intelligenceCard='';
  const boardCard=buildArchitectureBoardCard(S,result,validation);
  const reviewPack=buildRetailArchitectureReviewPack(S,result,research,LAST_PRICING_CONTEXT,validation);
  const consultingPack=buildConsultingDeliveryPack(S,result,activeTier,validation);
  const reviewerWorkflow=buildReviewerWorkflowCard(validation);
  const clientReadyGate=buildClientReadyGateCard(S,result,validation,activeTier);

  document.getElementById('out').innerHTML=`${viewBar}${execBanner}${researchCard?`<div class="tech-only">${researchCard}</div>`:''}${contraCard}${validationCard?`<div class="tech-only">${validationCard}</div>`:''}${intelligenceCard}${boardCard}${reviewerWorkflow}${clientReadyGate}${reviewPack}${consultingPack}<div class="out-summary">${escapeHtml(result.executive_summary||'-')}</div><div class="tier-selector">${tierCards}</div><div class="card"><div class="card-head"><div class="card-head-dot"></div>Architecture recommendation  -  ${escapeHtml(activeTier.label)} ${priceBadge}</div><table class="stack-table"><thead><tr><th style="width:130px">Layer</th><th class="tech-only" style="width:150px">Technology</th><th>Rationale</th><th class="tech-only" style="width:120px">Monthly est.</th></tr></thead><tbody>${stackRows}</tbody></table></div><div class="tech-only">${architectureSection}</div><div class="card tech-only"><div class="card-head"><div class="card-head-dot"></div>Cost breakdown  -  ${escapeHtml(activeTier.label)}</div><div class="cost-breakdown"><div class="cost-c"><div class="cost-tier-label">AI / APIs</div><div class="cost-val" style="font-size:15px">${escapeHtml(breakdown.llm_api||'-')}</div></div><div class="cost-c"><div class="cost-tier-label">Compute</div><div class="cost-val" style="font-size:15px">${escapeHtml(breakdown.compute||'-')}</div></div><div class="cost-c"><div class="cost-tier-label">Storage</div><div class="cost-val" style="font-size:15px">${escapeHtml(breakdown.storage||'-')}</div></div><div class="cost-c"><div class="cost-tier-label">Networking</div><div class="cost-val" style="font-size:15px">${escapeHtml(breakdown.networking||'-')}</div></div><div class="cost-c"><div class="cost-tier-label">Tooling</div><div class="cost-val" style="font-size:15px">${escapeHtml(breakdown.tooling||breakdown.observability_tooling||'-')}</div></div></div><div class="cost-driver" style="margin-top:1rem">Biggest cost driver: ${escapeHtml(activeTier.biggest_cost_driver||'-')}</div></div><div class="card"><div class="card-head"><div class="card-head-dot"></div>Risk register</div>${risks}</div><div class="card tech-only"><div class="card-head"><div class="card-head-dot"></div>Decision rationale</div>${decisions}</div><div class="card"><div class="card-head"><div class="card-head-dot"></div>Implementation roadmap</div><div class="roadmap-timeline">${roadmap}</div></div><div class="card"><div class="card-head"><div class="card-head-dot"></div>Immediate next steps</div>${nextSteps}</div><div class="card"><div class="card-head"><div class="card-head-dot"></div>Disclaimer</div><div class="risk-fix">${escapeHtml(result.disclaimer||'-')}</div></div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;gap:1rem;flex-wrap:wrap"><button class="btn" onclick="newEngagement()">New engagement</button><div style="display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn" onclick="printReviewDraft()">Print review draft</button><button class="btn pri" onclick="printClientReady()">Client-ready export</button></div></div>`;

  setAudience(AUDIENCE_VIEW);
  if(window.__activeTierViews){
    renderArchitectureDiagram(window.__activeTierViews.architectureView,window.__activeTierViews.architectureFacts);
  }
}

export function newEngagement(){
  ACTIVE_SCENARIO_ID=DEFAULT_SCENARIO_ID;
  ACTIVE_TIER='recommended';
  S=getDefaultState();
  DIAGRAM_RENDER_CACHE={};
  DIAGRAM_RENDER_TOKEN=0;
  LAST_CONTRADICTIONS=[];
  LAST_RESEARCH=null;
  LAST_PRICING_CONTEXT=null;
  LAST_VALIDATION=null;
  REVIEW_DECISION={status:'pending',note:'Not reviewed'};
  logEvent('warn','engagement.reset',{company:S.basics.company});
  render();
}



// -- React integration helpers ---
export function getStateRef(){return S}
export function setStateRef(next){S=next}
export function getActiveScenarioId(){return ACTIVE_SCENARIO_ID}
export function setActiveScenarioId(id){ACTIVE_SCENARIO_ID=id}
export function getAudience(){return AUDIENCE_VIEW}
export function getActiveTier(){return ACTIVE_TIER}
export function getClientLogs(){return CLIENT_LOGS}
export function getServerLogs(){return SERVER_LOGS}
export function getServerConfig(){return SERVER_CONFIG}
export function getLogUI(){return LOG_UI}
export function getPipelineStages(){return PIPELINE_STAGES}
export function getPipelineActive(){return PIPELINE_ACTIVE}
export function getLastContradictions(){return LAST_CONTRADICTIONS}
export function getLastResearch(){return LAST_RESEARCH}
export function getLastValidation(){return LAST_VALIDATION}
export function getLastPricing(){return LAST_PRICING_CONTEXT}
export function getReviewDecision(){return REVIEW_DECISION}

if(typeof window!=='undefined'){
  Object.assign(window,{
    setStep, go, handleTopAction, sp, generate, runMockRecommendation,
    runAgentReview,
    setTier, setAudience, newEngagement, toggleLogs, setLogScope,
    clearClientLogs, clearServerLogs, refreshServerLogs, loadScenario,
    setArchitecturePanel, setArchitectureDisplay, copyArchitectureCode,
    setReviewDecision, printReviewDraft, printClientReady
  });
}










