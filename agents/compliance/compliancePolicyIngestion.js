const fs = require('fs');
const path = require('path');

const KNOWLEDGE_DIR = path.join(__dirname, 'knowledge');
const CUSTOMER_POLICY_DIR = path.join(__dirname, 'customer-policies');

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'compliance-policy';
}

function linesForSection(content, heading) {
  const escapedHeading = String(heading).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^##\\s+${escapedHeading}\\s*$([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`, 'im');
  const match = content.match(pattern);
  if (!match) return [];
  return match[1]
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => /^[-*]\s+/.test(line))
    .map(line => line.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean);
}

function fieldValue(content, label) {
  const match = content.match(new RegExp(`^${label}:\\s*(.+)$`, 'im'));
  return match ? match[1].trim() : '';
}

function policyFreshness({ effectiveDate, reviewBy, owner, version }) {
  const notes = [];
  const now = new Date();
  let status = 'current';
  if (!version || version === 'unversioned') {
    status = 'needs_review';
    notes.push('Policy version is missing.');
  }
  if (!owner || owner === 'not stated') {
    status = 'needs_review';
    notes.push('Policy owner is missing.');
  }
  if (!effectiveDate || effectiveDate === 'not stated') {
    status = 'needs_review';
    notes.push('Effective date is missing.');
  } else {
    const effective = new Date(effectiveDate);
    if (Number.isNaN(effective.getTime())) {
      status = 'needs_review';
      notes.push('Effective date is not machine-readable.');
    } else {
      const ageDays = Math.floor((now - effective) / 86400000);
      if (ageDays > 365) {
        status = 'stale';
        notes.push(`Policy effective date is ${ageDays} days old.`);
      }
    }
  }
  if (!reviewBy || reviewBy === 'not stated') {
    if (status === 'current') status = 'partial';
    notes.push('Review-By date is missing.');
  } else {
    const review = new Date(reviewBy);
    if (Number.isNaN(review.getTime())) {
      status = 'needs_review';
      notes.push('Review-By date is not machine-readable.');
    } else if (review < now) {
      status = 'stale';
      notes.push('Review-By date has passed.');
    }
  }
  return { status, notes };
}

function parseMarkdownPolicy(filePath, kind) {
  const content = fs.readFileSync(filePath, 'utf8');
  const title = (content.match(/^#\s+(.+)$/m) || [])[1] || path.basename(filePath, '.md');
  const tags = fieldValue(content, 'Tags')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  const version = fieldValue(content, 'Version') || 'unversioned';
  const effectiveDate = fieldValue(content, 'Effective-Date') || 'not stated';
  const reviewBy = fieldValue(content, 'Review-By') || 'not stated';
  const owner = fieldValue(content, 'Owner') || 'not stated';
  const id = fieldValue(content, 'ID') || slug(path.basename(filePath, '.md'));
  const freshness = policyFreshness({ effectiveDate, reviewBy, owner, version });
  return {
    id,
    title,
    tags,
    version,
    effective_date: effectiveDate,
    review_by: reviewBy,
    freshness_status: freshness.status,
    freshness_notes: freshness.notes,
    owner,
    source: kind,
    source_path: path.relative(process.cwd(), filePath),
    controls: linesForSection(content, 'Controls'),
    risks: linesForSection(content, 'Risks'),
    validation_needed: linesForSection(content, 'Validation Needed'),
    citations: linesForSection(content, 'Citations').map(item => ({
      source_id: id,
      title,
      snippet: item,
      source_path: path.relative(process.cwd(), filePath),
      version,
      effective_date: effectiveDate,
      review_by: reviewBy,
      freshness_status: freshness.status,
    })),
  };
}

function readMarkdownPolicies(dirPath, kind) {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath)
    .filter(file => file.toLowerCase().endsWith('.md'))
    .map(file => path.join(dirPath, file))
    .map(filePath => {
      try {
        return parseMarkdownPolicy(filePath, kind);
      } catch (err) {
        return {
          id: slug(path.basename(filePath, '.md')),
          title: path.basename(filePath, '.md'),
          tags: ['parse-error'],
          source: kind,
          source_path: path.relative(process.cwd(), filePath),
          controls: [],
          risks: [`Policy file could not be parsed: ${err.message}`],
          validation_needed: [`Fix compliance policy markdown parse error in ${path.relative(process.cwd(), filePath)}.`],
          citations: [],
          freshness_status: 'parse-error',
          freshness_notes: [`Policy file could not be parsed: ${err.message}`],
        };
      }
    });
}

function loadCompliancePolicyDocuments() {
  return [
    ...readMarkdownPolicies(KNOWLEDGE_DIR, 'architectiq-compliance-knowledge'),
    ...readMarkdownPolicies(CUSTOMER_POLICY_DIR, 'customer-compliance-policy-pack'),
  ];
}

module.exports = {
  CUSTOMER_POLICY_DIR,
  KNOWLEDGE_DIR,
  loadCompliancePolicyDocuments,
  parseMarkdownPolicy,
  policyFreshness,
};
