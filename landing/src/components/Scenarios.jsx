import { useRef, useEffect } from 'react'

const SCENARIOS = [
  { company: 'RetailEdge Omni', tag: 'Store Edge', color: '#D97706', desc: 'Store-resilient omnichannel inventory, offline checkout, POS sync, PCI boundaries, and queue replay controls.' },
  { company: 'RetailLoop', tag: 'Retail Data', color: '#2563EB', desc: 'Real-time personalization, customer profile governance, experiment lineage, and merchandising activation.' },
  { company: 'LocalCart Retail', tag: 'Digital Commerce', color: '#059669', desc: 'Checkout, catalogue, payment, fraud, and order-management architecture for a growing specialty retailer.' },
  { company: 'StoreFleet Grocery', tag: 'Fulfilment', color: '#7C3AED', desc: 'Grocery replenishment, warehouse integration, substitution handling, click-and-collect, and delivery promise accuracy.' },
  { company: 'LoyaltySphere', tag: 'Loyalty/CDP', color: '#DC2626', desc: 'Customer 360, consent, identity resolution, segmentation, campaign activation, and deletion workflows.' },
  { company: 'RetailGroup One', tag: 'Modernisation', color: '#0F766E', desc: 'Multi-brand retail platform modernisation across POS, OMS, ERP, WMS, payments, identity, and regional rollout.' },
]

function useReveal(ref, delay = 0) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => el.classList.add('visible'), delay); obs.disconnect() }
    }, { threshold: 0.06 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, delay])
}

function ScenarioCard({ s, index }) {
  const ref = useRef(null)
  useReveal(ref, index * 40)

  return (
    <article ref={ref} className="reveal" style={{ display: 'block' }}>
      <div className="glass" style={{
        padding: '22px', height: '100%',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = `${s.color}40`
          e.currentTarget.style.transform = 'translateY(-3px)'
          e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px ${s.color}20`
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>{s.company}</span>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 5, flexShrink: 0,
            background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}28`,
          }}>{s.tag}</span>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.55, marginBottom: 16 }}>{s.desc}</p>
        <div style={{ fontSize: 12.5, color: s.color, fontWeight: 600, opacity: 0.8 }}>ArchitectIQ use case</div>
      </div>
    </article>
  )
}

export default function Scenarios() {
  const headRef = useRef(null)
  useReveal(headRef)

  return (
    <section id="scenarios" style={{ padding: '120px 24px', background: 'var(--bg2)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

      {/* blob */}
      <div className="mesh-blob" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 70%)', top: '20%', right: -100, position: 'absolute' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div ref={headRef} className="reveal" style={{ marginBottom: 52 }}>
          <p className="section-label" style={{ marginBottom: 14 }}>Scenario presets</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 800, letterSpacing: '-1.5px', color: 'var(--text)', lineHeight: 1.12, marginBottom: 12 }}>
            Retail architecture engagements.<br />
            <span style={{ color: 'var(--muted)', fontWeight: 300 }}>Ready to generate in one click.</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 480 }}>
            Each use case focuses on a retail capability, its operational pressure, and the constraints a retail architecture board would expect to see.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {SCENARIOS.map((s, i) => <ScenarioCard key={i} s={s} index={i} />)}
        </div>
      </div>
    </section>
  )
}



