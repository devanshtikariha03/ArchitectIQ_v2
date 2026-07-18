const https = require('https');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const AGENT_LLM_MODEL = process.env.AGENT_LLM_MODEL || process.env.OPENAI_AGENT_MODEL || 'gpt-5.5';

function extractResponseText(body) {
  if (body?.output_parsed && typeof body.output_parsed === 'object') return JSON.stringify(body.output_parsed);
  if (body?.parsed && typeof body.parsed === 'object') return JSON.stringify(body.parsed);
  if (typeof body?.output_text === 'string') return body.output_text.trim();
  if (Array.isArray(body?.output)) {
    return body.output
      .flatMap(item => [
        item?.content,
        item?.text,
        item?.output_text,
        item?.parsed,
        item?.arguments,
      ])
      .flatMap(part => Array.isArray(part) ? part : [part])
      .map(extractResponsePartText)
      .join('')
      .trim();
  }
  return '';
}

function extractResponsePartText(part) {
  if (!part) return '';
  if (typeof part === 'string') return part;
  if (typeof part?.text === 'string') return part.text;
  if (typeof part?.output_text === 'string') return part.output_text;
  if (typeof part?.content === 'string') return part.content;
  if (typeof part?.arguments === 'string') return part.arguments;
  if (typeof part?.refusal === 'string') return part.refusal;
  if (part?.parsed && typeof part.parsed === 'object') return JSON.stringify(part.parsed);
  if (part?.json && typeof part.json === 'object') return JSON.stringify(part.json);
  if (part?.value && typeof part.value === 'object') return JSON.stringify(part.value);
  if (Array.isArray(part?.content)) return part.content.map(extractResponsePartText).join('');
  return '';
}

function parseJsonObject(text) {
  const raw = String(text || '').replace(/^```json\s*|^```\s*|\s*```$/gm, '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1 || end < start) return null;
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function callOpenAIResponses(payload) {
  return new Promise((resolve, reject) => {
    if (!OPENAI_API_KEY) return resolve(null);
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/responses',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          return reject(new Error(`OpenAI returned HTTP ${res.statusCode}: ${data.slice(0, 240)}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error(`OpenAI response was not JSON: ${err.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(120000, () => {
      req.destroy(new Error('Agent model request timed out after 120 seconds.'));
    });
    req.write(body);
    req.end();
  });
}

const SPECIALIST_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'findings', 'risks', 'validation_needed', 'assumptions'],
  properties: {
    summary: { type: 'string', maxLength: 520 },
    findings: {
      type: 'array',
      maxItems: 4,
      items: { type: 'string', maxLength: 360 },
    },
    risks: {
      type: 'array',
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['risk', 'severity', 'likelihood', 'fix'],
        properties: {
          risk: { type: 'string', maxLength: 320 },
          severity: { type: 'string', maxLength: 40 },
          likelihood: { type: 'string', maxLength: 40 },
          fix: { type: 'string', maxLength: 360 },
        },
      },
    },
    validation_needed: {
      type: 'array',
      maxItems: 4,
      items: { type: 'string', maxLength: 320 },
    },
    assumptions: {
      type: 'array',
      maxItems: 3,
      items: { type: 'string', maxLength: 280 },
    },
  },
};

function responseDiagnostics(data) {
  const details = [];
  if (data?.status) details.push(`status=${data.status}`);
  if (data?.incomplete_details?.reason) details.push(`reason=${data.incomplete_details.reason}`);
  if (data?.error?.message) details.push(`error=${data.error.message}`);
  return details.length ? ` (${details.join(', ')})` : '';
}

async function runSpecialistModel({ agentId, title, system, input, maxOutputTokens = 3200 }) {
  if (!OPENAI_API_KEY) return null;
  const payload = {
    model: AGENT_LLM_MODEL,
    reasoning: { effort: 'low' },
    max_output_tokens: maxOutputTokens,
    instructions: `${system}

Return a compact JSON object only. Do not repeat the deterministic review. Add only net-new specialist judgement.
Limits: summary <= 3 sentences, findings <= 4, risks <= 3, validation_needed <= 4, assumptions <= 3.`,
    input,
    text: {
      format: {
        type: 'json_schema',
        name: `${agentId}_review`,
        schema: SPECIALIST_SCHEMA,
        strict: true,
      },
    },
  };

  const data = await callOpenAIResponses(payload);
  const responseText = extractResponseText(data);
  const parsed = parseJsonObject(responseText);
  if (!parsed) {
    const preview = responseText
      ? responseText.replace(/\s+/g, ' ').slice(0, 260)
      : JSON.stringify(data || {}).replace(/\s+/g, ' ').slice(0, 260);
    throw new Error(`${title || agentId} model response could not be parsed as JSON${responseDiagnostics(data)}. Preview: ${preview || 'empty response'}`);
  }
  return {
    ...parsed,
    model: AGENT_LLM_MODEL,
    provider: 'openai',
  };
}

function mergeModelReview(base, modelReview) {
  if (!modelReview) return base;
  const mergeList = (a, b, limit = 20) => [...(a || []), ...(b || [])].filter(Boolean).slice(0, limit);
  return {
    ...base,
    status: 'completed_with_model',
    summary: modelReview.summary || base.summary,
    findings: mergeList(base.findings, modelReview.findings),
    risks: mergeList(base.risks, modelReview.risks, 12),
    validation_needed: mergeList(base.validation_needed, modelReview.validation_needed, 14),
    assumptions: mergeList(base.assumptions, modelReview.assumptions, 10),
    model_review: {
      enabled: true,
      provider: modelReview.provider || 'openai',
      model: modelReview.model,
    },
    model_summary: modelReview.summary || '',
    model_findings: modelReview.findings || [],
    model_risks: modelReview.risks || [],
    model_validation_needed: modelReview.validation_needed || [],
    model_assumptions: modelReview.assumptions || [],
    statePatch: {
      ...(base.statePatch || {}),
      risks: mergeList(base.statePatch?.risks, modelReview.risks, 12),
      human_validation_needed: mergeList(base.statePatch?.human_validation_needed, modelReview.validation_needed, 14),
      assumptions: mergeList(base.statePatch?.assumptions, modelReview.assumptions, 10),
    },
  };
}

module.exports = {
  mergeModelReview,
  runSpecialistModel,
};
