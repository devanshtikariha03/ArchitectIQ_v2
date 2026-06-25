#!/usr/bin/env node
'use strict';
/**
 * ArchitectIQ — Test Report Generator
 *
 * Usage:
 *   node test-harness/report.js
 *   node test-harness/report.js --open     # auto-open in browser (Windows/Mac/Linux)
 *
 * Reads:  test-harness/results/*.json
 * Writes: test-harness/results/report.html
 */

const fs   = require('fs');
const path = require('path');

const RESULTS_DIR = path.join(__dirname, 'results');
const OUT_FILE    = path.join(RESULTS_DIR, 'report.html');
const AUTO_OPEN   = process.argv.includes('--open');

// ── Load all result files ─────────────────────────────────────────────────────
if (!fs.existsSync(RESULTS_DIR)) {
  console.error('No results/ directory found. Run stress tests first:\n  node test-harness/stress.js\n  node test-harness/stress-llm.js');
  process.exit(1);
}

const files = fs.readdirSync(RESULTS_DIR)
  .filter(f => f.endsWith('.json'))
  .sort()
  .map(f => {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, f), 'utf8'));
      return { file: f, ...raw };
    } catch {
      return null;
    }
  })
  .filter(Boolean);

if (files.length === 0) {
  console.error('No JSON result files found in test-harness/results/.\nRun: node test-harness/stress.js');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function counts(results) {
  return {
    pass : results.filter(r => r.status === 'PASS').length,
    fail : results.filter(r => r.status === 'FAIL').length,
    warn : results.filter(r => r.status === 'WARN').length,
    skip : results.filter(r => r.status === 'SKIP').length,
    total: results.length,
  };
}

function scoreColor(c) {
  if (c.fail > 0) return '#ef4444';
  if (c.warn > 0) return '#f59e0b';
  return '#22c55e';
}

function fmt(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-AU', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    });
  } catch { return iso; }
}

function suiteName(filename) {
  if (filename.startsWith('stress-llm-')) return 'LLM Suite';
  if (filename.startsWith('stress-'))    return 'Core Suite';
  return filename.replace('.json', '');
}

function statusBadge(s) {
  const cfg = {
    PASS: ['#166534', '#dcfce7', '✓'],
    FAIL: ['#991b1b', '#fee2e2', '✗'],
    WARN: ['#92400e', '#fef3c7', '⚠'],
    SKIP: ['#374151', '#f3f4f6', '○'],
  }[s] || ['#374151', '#f3f4f6', '?'];
  return `<span class="badge" style="background:${cfg[1]};color:${cfg[0]}">${cfg[2]} ${s}</span>`;
}

// ── Group results by category ─────────────────────────────────────────────────
function groupByCategory(results) {
  const map = {};
  for (const r of results) {
    if (!map[r.category]) map[r.category] = [];
    map[r.category].push(r);
  }
  return map;
}

// ── Build per-run HTML blocks ─────────────────────────────────────────────────
function runBlock(run, idx) {
  const c      = counts(run.results);
  const color  = scoreColor(c);
  const name   = suiteName(run.file);
  const cats   = groupByCategory(run.results);
  const pass   = Math.round((c.pass / c.total) * 100);

  const catBlocks = Object.entries(cats).map(([cat, tests]) => {
    const cc = counts(tests);
    const rows = tests.map(t => `
      <tr class="test-row" data-status="${t.status}">
        <td>${statusBadge(t.status)}</td>
        <td class="test-name">${esc(t.name)}</td>
        <td class="test-detail">${esc(t.detail)}</td>
        <td class="test-ms">${t.ms > 0 ? t.ms + 'ms' : '—'}</td>
      </tr>`).join('');

    const catColor = scoreColor(cc);
    return `
      <div class="cat-block">
        <div class="cat-header" style="border-left:3px solid ${catColor}">
          <span class="cat-name">${esc(cat)}</span>
          <span class="cat-counts">
            <span class="ct-pass">${cc.pass} pass</span>
            ${cc.fail ? `<span class="ct-fail">${cc.fail} fail</span>` : ''}
            ${cc.warn ? `<span class="ct-warn">${cc.warn} warn</span>` : ''}
          </span>
        </div>
        <table class="test-table">
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }).join('');

  return `
    <div class="run-card" id="run-${idx}">
      <div class="run-header" onclick="toggleRun(${idx})">
        <div class="run-title">
          <span class="run-suite">${esc(name)}</span>
          <span class="run-file">${esc(run.file)}</span>
        </div>
        <div class="run-meta">
          <span class="run-date">${fmt(run.ran)}</span>
          <div class="run-bar-wrap" title="${pass}% pass">
            <div class="run-bar" style="width:${pass}%;background:${color}"></div>
          </div>
          <span class="run-score" style="color:${color}">${pass}%</span>
          <span class="run-counts">
            <span class="ct-pass">${c.pass}✓</span>
            ${c.fail ? `<span class="ct-fail">${c.fail}✗</span>` : ''}
            ${c.warn ? `<span class="ct-warn">${c.warn}⚠</span>` : ''}
            <span class="ct-total"> / ${c.total}</span>
          </span>
          <span class="run-chevron" id="chev-${idx}">▾</span>
        </div>
      </div>
      <div class="run-body" id="body-${idx}">
        <div class="filter-bar">
          Filter:
          <button onclick="filterRun(${idx},'ALL')" class="fb active" data-f="ALL">All</button>
          <button onclick="filterRun(${idx},'FAIL')" class="fb" data-f="FAIL">Fail</button>
          <button onclick="filterRun(${idx},'WARN')" class="fb" data-f="WARN">Warn</button>
          <button onclick="filterRun(${idx},'PASS')" class="fb" data-f="PASS">Pass</button>
        </div>
        ${catBlocks}
      </div>
    </div>`;
}

// ── Summary row per run ───────────────────────────────────────────────────────
function summaryRow(run, idx) {
  const c     = counts(run.results);
  const color = scoreColor(c);
  const pass  = Math.round((c.pass / c.total) * 100);
  const suite = suiteName(run.file);
  return `
    <tr onclick="document.getElementById('run-${idx}').scrollIntoView({behavior:'smooth'})" style="cursor:pointer">
      <td>${idx + 1}</td>
      <td><strong>${esc(suite)}</strong></td>
      <td>${fmt(run.ran)}</td>
      <td style="color:#22c55e;font-weight:600">${c.pass}</td>
      <td style="color:#ef4444;font-weight:600">${c.fail}</td>
      <td style="color:#f59e0b;font-weight:600">${c.warn}</td>
      <td>${c.total}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          <div style="flex:1;background:#1e293b;border-radius:3px;height:8px;min-width:80px">
            <div style="height:8px;border-radius:3px;background:${color};width:${pass}%"></div>
          </div>
          <span style="color:${color};font-weight:700;font-size:13px">${pass}%</span>
        </div>
      </td>
    </tr>`;
}

// ── Overall aggregate ─────────────────────────────────────────────────────────
const allResults = files.flatMap(f => f.results);
const overall    = counts(allResults);
const overallPct = Math.round((overall.pass / overall.total) * 100);
const overallCol = scoreColor(overall);

// ── Full HTML ─────────────────────────────────────────────────────────────────
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ArchitectIQ — Stress Test Report</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f172a;color:#e2e8f0;font-size:14px;line-height:1.5}
  a{color:#60a5fa}

  /* ── layout ── */
  .page{max-width:1100px;margin:0 auto;padding:32px 20px 80px}

  /* ── header ── */
  .page-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;flex-wrap:wrap;gap:16px}
  .logo{font-size:22px;font-weight:700;letter-spacing:-0.5px}
  .logo span{color:#818cf8}
  .generated{font-size:12px;color:#64748b}

  /* ── overall scorecard ── */
  .scorecard{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:32px}
  .sc-cell{background:#1e293b;border-radius:10px;padding:16px;text-align:center}
  .sc-val{font-size:36px;font-weight:800;line-height:1}
  .sc-label{font-size:11px;color:#64748b;margin-top:6px;text-transform:uppercase;letter-spacing:.5px}

  /* ── summary table ── */
  .section-title{font-size:16px;font-weight:600;margin-bottom:12px;color:#cbd5e1}
  table{width:100%;border-collapse:collapse;background:#1e293b;border-radius:10px;overflow:hidden;margin-bottom:32px}
  th{padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b;background:#162032}
  td{padding:10px 12px;border-top:1px solid #0f172a}
  tr:hover td{background:#162032}

  /* ── run cards ── */
  .run-card{background:#1e293b;border-radius:10px;margin-bottom:16px;overflow:hidden}
  .run-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;cursor:pointer;gap:12px;flex-wrap:wrap}
  .run-header:hover{background:#162032}
  .run-title{display:flex;flex-direction:column}
  .run-suite{font-size:15px;font-weight:700}
  .run-file{font-size:11px;color:#64748b;margin-top:2px}
  .run-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .run-date{font-size:12px;color:#64748b}
  .run-bar-wrap{width:80px;height:7px;background:#0f172a;border-radius:4px;overflow:hidden}
  .run-bar{height:100%;border-radius:4px;transition:width .3s}
  .run-score{font-weight:700;font-size:14px}
  .run-counts{font-size:12px;display:flex;gap:6px}
  .run-chevron{color:#64748b;transition:transform .2s;user-select:none}
  .run-chevron.open{transform:rotate(180deg)}
  .run-body{display:none;padding:0 16px 16px}
  .run-body.open{display:block}

  /* ── filter bar ── */
  .filter-bar{display:flex;align-items:center;gap:6px;margin-bottom:12px;font-size:12px;color:#64748b;padding-top:4px}
  .fb{background:#0f172a;color:#94a3b8;border:1px solid #1e293b;border-radius:5px;padding:3px 10px;cursor:pointer;font-size:11px}
  .fb:hover{background:#1e293b}
  .fb.active{background:#3730a3;color:#fff;border-color:#3730a3}

  /* ── categories ── */
  .cat-block{margin-bottom:14px}
  .cat-header{display:flex;justify-content:space-between;padding:8px 10px;background:#162032;border-radius:6px 6px 0 0;align-items:center}
  .cat-name{font-weight:600;font-size:13px}
  .cat-counts{display:flex;gap:8px;font-size:11px}

  /* ── test table ── */
  .test-table{width:100%;border-collapse:collapse;background:#0f172a;border-radius:0 0 6px 6px;overflow:hidden;margin-bottom:4px}
  .test-table td{padding:7px 10px;border-top:1px solid #1e293b;vertical-align:top}
  .test-table tr:hover td{background:#0d1524}
  .test-row[data-status="PASS"].hide{display:none}
  .test-row[data-status="FAIL"].hide{display:none}
  .test-row[data-status="WARN"].hide{display:none}
  .test-row[data-status="SKIP"].hide{display:none}
  .test-name{font-size:13px;max-width:440px}
  .test-detail{font-size:11px;color:#64748b;max-width:280px;word-break:break-word}
  .test-ms{font-size:11px;color:#475569;text-align:right;white-space:nowrap}

  /* ── badges ── */
  .badge{display:inline-block;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:600;white-space:nowrap}

  /* ── count colors ── */
  .ct-pass{color:#22c55e}
  .ct-fail{color:#ef4444}
  .ct-warn{color:#f59e0b}
  .ct-total{color:#64748b}

  /* ── empty state ── */
  .empty{text-align:center;color:#475569;padding:40px}
</style>
</head>
<body>
<div class="page">

  <div class="page-header">
    <div class="logo">Architect<span>IQ</span> — Stress Test Report</div>
    <div class="generated">Generated ${fmt(new Date().toISOString())} · ${files.length} run${files.length !== 1 ? 's' : ''}</div>
  </div>

  <div class="scorecard">
    <div class="sc-cell">
      <div class="sc-val" style="color:${overallCol}">${overallPct}%</div>
      <div class="sc-label">Pass rate (all runs)</div>
    </div>
    <div class="sc-cell">
      <div class="sc-val" style="color:#22c55e">${overall.pass}</div>
      <div class="sc-label">Passed</div>
    </div>
    <div class="sc-cell">
      <div class="sc-val" style="color:#ef4444">${overall.fail}</div>
      <div class="sc-label">Failed</div>
    </div>
    <div class="sc-cell">
      <div class="sc-val" style="color:#f59e0b">${overall.warn}</div>
      <div class="sc-label">Warnings</div>
    </div>
    <div class="sc-cell">
      <div class="sc-val" style="color:#94a3b8">${overall.total}</div>
      <div class="sc-label">Total checks</div>
    </div>
    <div class="sc-cell">
      <div class="sc-val" style="color:#818cf8">${files.length}</div>
      <div class="sc-label">Test runs</div>
    </div>
  </div>

  <div class="section-title">Run Summary</div>
  <table>
    <thead>
      <tr>
        <th>#</th><th>Suite</th><th>Run at</th>
        <th>Pass</th><th>Fail</th><th>Warn</th><th>Total</th><th>Score</th>
      </tr>
    </thead>
    <tbody>
      ${files.map((f, i) => summaryRow(f, i)).join('')}
    </tbody>
  </table>

  <div class="section-title">Test Details</div>
  ${files.map((f, i) => runBlock(f, i)).join('')}

</div>

<script>
function toggleRun(idx) {
  const body = document.getElementById('body-' + idx);
  const chev = document.getElementById('chev-' + idx);
  const open = body.classList.toggle('open');
  chev.classList.toggle('open', open);
}

function filterRun(idx, status) {
  const body = document.getElementById('body-' + idx);
  // Update active button
  body.querySelectorAll('.fb').forEach(b => b.classList.toggle('active', b.dataset.f === status));
  // Show/hide rows
  body.querySelectorAll('.test-row').forEach(row => {
    if (status === 'ALL') {
      row.classList.remove('hide');
    } else {
      row.classList.toggle('hide', row.dataset.status !== status);
    }
  });
}

// Auto-expand runs that have failures
document.addEventListener('DOMContentLoaded', () => {
  ${files.map((f, i) => {
    const c = counts(f.results);
    return c.fail > 0 ? `toggleRun(${i});` : '';
  }).filter(Boolean).join('\n  ')}
});
</script>
</body>
</html>`;

// ── Write output ──────────────────────────────────────────────────────────────
fs.writeFileSync(OUT_FILE, html, 'utf8');
console.log(`\n  ✓ Report written: ${OUT_FILE}`);
console.log(`  ${files.length} run(s) · ${overall.total} checks · ${overall.pass} pass · ${overall.fail} fail · ${overall.warn} warn\n`);

if (AUTO_OPEN) {
  const open =
    process.platform === 'win32' ? `start "${OUT_FILE}"` :
    process.platform === 'darwin' ? `open "${OUT_FILE}"` :
    `xdg-open "${OUT_FILE}"`;
  require('child_process').exec(open, err => {
    if (err) console.error('  Could not open browser:', err.message);
  });
}
