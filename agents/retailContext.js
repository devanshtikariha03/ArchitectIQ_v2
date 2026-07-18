function stringifyParts(parts) {
  return parts
    .flat()
    .filter(value => value !== undefined && value !== null && value !== '')
    .map(value => {
      if (typeof value === 'string') return value;
      try {
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    })
    .join('\n');
}

function buildRetailText({ query = '', context = {}, state = {} } = {}) {
  return stringifyParts([
    query,
    context,
    state.business_context,
    state.functional_requirements,
    state.non_functional_requirements,
    state.constraints,
    state.existing_systems,
    state.data_classification,
    state.basics,
    state.scale,
    state.cost,
    state.nfr,
    state.team,
  ]);
}

function hasAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text));
}

function getRetailSignals(input) {
  const text = buildRetailText(input).toLowerCase();
  const signals = {
    retail: hasAny(text, [/\bretail\b/, /\be-?commerce\b/, /\bstore\b/, /\bpos\b/, /\bcheckout\b/, /\binventory\b/, /\bloyalty\b/, /\bwms\b/, /\boms\b/, /\bfulfilment\b/, /\bfulfillment\b/]),
    storeEdge: hasAny(text, [/\bstore edge\b/, /\boffline checkout\b/, /\boffline trading\b/, /\bpos\b/, /\bpoint of sale\b/, /\bwan outage\b/, /\blocal queue\b/, /\bqueue replay\b/, /\bassociate mobile\b/, /\bstore appliance\b/]),
    commerce: hasAny(text, [/\be-?commerce\b/, /\bstorefront\b/, /\bcart\b/, /\bcheckout\b/, /\bcatalogue\b/, /\bcatalog\b/, /\bsearch\b/, /\bpromotion\b/, /\bcampaign\b/, /\bcdn\b/, /\bwaf\b/, /\bfraud\b/, /\bstored value\b/, /\bvoucher\b/, /\bbenefit redemption\b/]),
    loyaltyData: hasAny(text, [/\bloyalty\b/, /\bcustomer 360\b/, /\bcdp\b/, /\bpersonalisation\b/, /\bpersonalization\b/, /\brecommendation\b/, /\bsegmentation\b/, /\bconsent\b/, /\bidentity resolution\b/, /\bprofile\b/]),
    supplyChain: hasAny(text, [/\bwms\b/, /\btms\b/, /\bwarehouse\b/, /\bfulfilment\b/, /\bfulfillment\b/, /\breplenishment\b/, /\bsupplier\b/, /\blast mile\b/, /\bdelivery\b/, /\bclick and collect\b/, /\bship from store\b/]),
    payments: hasAny(text, [/\bpayment\b/, /\bpayments\b/, /\bpci\b/, /\bpci-dss\b/, /\bpan\b/, /\bsad\b/, /\bpsp\b/, /\bp2pe\b/, /\btoken vault\b/, /\bcard\b/, /\bcardholder\b/, /\bchd\b/, /\bcde\b/, /\bstored credential\b/, /\bstored credentials\b/, /\bacquirer token\b/]),
    customerData: hasAny(text, [/\bpii\b/, /\bcustomer\b/, /\bloyalty\b/, /\bprofile\b/, /\bphone\b/, /\baddress\b/, /\bprivacy\b/, /\bgdpr\b/, /\bccpa\b/, /\bdpdp\b/, /\bprivacy act\b/]),
    retailAi: hasAny(text, [/\bai\b/, /\bagentic\b/, /\bllm\b/, /\brag\b/, /\bembedding\b/, /\bvector\b/, /\bchatbot\b/, /\bmodel\b/, /\brecommendation model\b/]),
    multiRegion: hasAny(text, [/\bglobal\b/, /\bmulti-brand\b/, /\bmulti brand\b/, /\beu\b/, /\buk\b/, /\bus\b/, /\baustralia\b/, /\bnew zealand\b/, /\bindia\b/, /\bregional\b/, /\bresidency\b/, /\bsovereignty\b/]),
    franchise: hasAny(text, [/\bfranchise\b/, /\bbrand migration\b/, /\bmulti-store\b/, /\bstore rollout\b/]),
  };

  const workloadTypes = [];
  if (signals.storeEdge) workloadTypes.push('store execution and omnichannel inventory');
  if (signals.commerce) workloadTypes.push('digital commerce');
  if (signals.loyaltyData) workloadTypes.push('retail data and loyalty');
  if (signals.supplyChain) workloadTypes.push('supply chain and fulfilment');
  if (signals.payments || signals.customerData) workloadTypes.push('retail security and compliance');
  if (!workloadTypes.length && signals.retail) workloadTypes.push('retail-adjacent platform modernisation');

  return { ...signals, workloadTypes, text };
}

function retailEvidence(items) {
  return (items || []).map(item => ({
    source: item.source || 'retrieved-context',
    note: item.title || String(item).slice(0, 120),
  }));
}

module.exports = {
  buildRetailText,
  getRetailSignals,
  retailEvidence,
};
