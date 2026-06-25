import { useState, useRef, useEffect } from 'react'

const TABS = [
  { id: 'stack',   label: 'Stack' },
  { id: 'cost',    label: 'Cost' },
  { id: 'risk',    label: 'Risks' },
  { id: 'roadmap', label: 'Roadmap' },
]

const STACK = [
  { layer: 'Store Edge',   tech: 'HA edge nodes + encrypted queue', cost: '$18k/mo', note: 'Offline checkout, replay, and field runbooks' },
  { layer: 'Commerce API', tech: 'Managed containers + WAF/CDN',    cost: '$9k/mo',  note: 'Browse traffic isolated from checkout commits' },
  { layer: 'Inventory',    tech: 'PostgreSQL + event bus',          cost: '$13k/mo', note: 'Idempotent POS, OMS, ERP, and WMS sync' },
  { layer: 'Security',     tech: 'KMS + mTLS + PSP tokenisation',   cost: '$10k/mo', note: 'PCI scope boundary and certificate ownership' },
  { layer: 'Operations',   tech: 'SLO dashboards + replay tests',   cost: '$8k/mo',  note: 'Rollout gates backed by outage evidence' },
]

const RISKS = [
  { sev: 'High',   color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   text: 'Queue replay duplicates inventory decrements after reconnect', fix: 'Idempotency keys + ordered replay acceptance tests' },
  { sev: 'High',   color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   text: 'PCI scope expands if store logs receive card data',              fix: 'PSP tokenisation boundary + schema/log PAN blockers' },
  { sev: 'Medium', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  text: 'Certificate renewal ownership is unclear across stores',        fix: 'Named owner + automated renewal and failure drills' },
]

const ROADMAP = [
  { phase: 'Phase 1  -  Retail Foundation', time: 'Weeks 1-4',   color: '#4F8EFF', items: ['Systems-of-record map', 'PCI boundary', 'Replay and conflict test plan'] },
  { phase: 'Phase 2  -  Store Pilot',       time: 'Weeks 5-12',  color: '#A78BFA', items: ['Deploy edge kit', 'WAN outage drills', 'Reconciliation evidence'] },
  { phase: 'Phase 3  -  Rollout Control',   time: 'Weeks 13-24', color: '#34D399', items: ['Certificate automation', 'Wave dashboards', 'Go/no-go gates'] },
]

function useReveal(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
}

export default function OutputShowcase() {
  const [tab, setTab] = useState('stack')
  const headRef = useRef(null)
  const bodyRef = useRef(null)
  useReveal(headRef)
  useReveal(bodyRef)

  return (
    <section id="output" style={{ padding: '120px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* head */}
        <div ref={headRef} className="reveal" style={{ marginBottom: 48 }}>
          <p className="section-label" style={{ marginBottom: 14 }}>Example output</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 800, letterSpacing: '-1.5px', color: 'white', lineHeight: 1.12, marginBottom: 12 }}>
            See what you actually get.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', maxWidth: 500 }}>
            Based on <strong style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>RetailEdge Omni</strong>  -  a store-resilient omnichannel scenario.
            Offline checkout, POS sync, PCI scope, inventory accuracy, and phased rollout gates.
          </p>
        </div>

        {/* showcase panel */}
        <div ref={bodyRef} className="reveal" style={{
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.09)',
          background: 'rgba(255,255,255,0.025)',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }}>
          {/* top bar */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', gap: 6, marginRight: 8 }}>
              {['#FF5F57','#FEBC2E','#28C840'].map((c, i) => <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c, opacity: 0.8 }} />)}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {TABS.map(t => (
                <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 5, background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)', fontWeight: 600 }}>✓ Live pricing</span>
              <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 5, background: 'rgba(79,142,255,0.1)', color: '#4F8EFF', border: '1px solid rgba(79,142,255,0.2)', fontWeight: 600 }}>✓ Validated</span>
            </div>
          </div>

          {/* content */}
          <div style={{ padding: 28, minHeight: 300 }}>

            {tab === 'stack' && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                  <thead>
                    <tr>
                      {['Layer', 'Technology', 'Monthly', 'Notes'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 14px 14px', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {STACK.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="mono" style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: 12 }}>{r.layer}</td>
                        <td className="mono" style={{ padding: '13px 14px', color: '#FB923C', fontSize: 12 }}>{r.tech}</td>
                        <td className="mono" style={{ padding: '13px 14px', color: 'white', fontWeight: 700, fontSize: 13 }}>{r.cost}</td>
                        <td style={{ padding: '13px 14px', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 10, fontSize: 13.5, color: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: 'white', fontWeight: 700 }}>Total (Recommended tier):</span>  $58k/mo
                  <span style={{ marginLeft: 12, color: '#34D399', fontWeight: 600 }}>✓ Store pilot ready</span>
                </div>
              </div>
            )}

            {tab === 'cost' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                {[
                  { label: 'Conservative', total: '$24k/mo', ok: true,  note: 'Narrow pilot', items: ['Edge baseline: $7k', 'Commerce API: $5k', 'Inventory: $8k', 'Ops: $4k'] },
                  { label: 'Recommended',  total: '$58k/mo', ok: true,  note: 'Store rollout ready', items: ['HA edge: $18k', 'Event backbone: $10k', 'Inventory/OMS: $14k', 'Security/Ops: $16k'], active: true },
                  { label: 'Optimised',    total: '$47k/mo', ok: true, note: 'Reserved + tuned', items: ['Standard edge kit: $14k', 'Reserved DB: $9k', 'Tiered audit: $6k', 'Automation: $18k'] },
                ].map((tier, i) => (
                  <div key={i} style={{
                    padding: 22, borderRadius: 14,
                    background: tier.active ? 'rgba(232,71,42,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${tier.active ? 'rgba(232,71,42,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {tier.label}
                      {tier.active && <span style={{ fontSize: 10, background: 'rgba(232,71,42,0.2)', color: '#E8472A', padding: '2px 6px', borderRadius: 4 }}>Selected</span>}
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 900, color: 'white', letterSpacing: '-1.5px', marginBottom: 4 }}>{tier.total}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>{tier.note}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
                      {tier.items.map((item, j) => (
                        <div key={j} className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{item}</div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: tier.ok ? '#34D399' : '#EF4444' }}>
                      {tier.ok ? '✓ Feasible' : 'x Needs revision'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'risk' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {RISKS.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, flexShrink: 0, height: 'fit-content', background: r.bg, color: r.color, border: `1px solid ${r.color}33` }}>{r.sev}</span>
                    <div>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500, marginBottom: 5 }}>{r.text}</div>
                      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.3)' }}>Mitigation: {r.fix}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'roadmap' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {ROADMAP.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${p.color}18`, border: `1px solid ${p.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: p.color }}>{i + 1}</div>
                      {i < ROADMAP.length - 1 && <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.07)', margin: '4px 0' }} />}
                    </div>
                    <div style={{ paddingBottom: 28 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{p.phase}</span>
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: `${p.color}15`, color: p.color, fontWeight: 600, border: `1px solid ${p.color}25` }}>{p.time}</span>
                      </div>
                      {p.items.map((item, j) => (
                        <div key={j} style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.4)', marginBottom: 4, display: 'flex', gap: 8 }}>
                          <span style={{ color: p.color, opacity: 0.7 }}>-&gt;</span> {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}


