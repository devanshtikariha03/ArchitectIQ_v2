import { useRef, useEffect } from 'react'

const ROWS = [
  { before: '3-5 days of stakeholder workshops',        after: '15 minutes from form to full output' },
  { before: 'Manual Lucidchart sessions',               after: '4 Mermaid diagram views, auto-generated' },
  { before: 'Pricing guesses from outdated blog posts', after: 'Live prices from official Azure/AWS/GCP APIs' },
  { before: 'Contradictions found in review (too late)','after': 'Contradiction detection before generation' },
  { before: 'Risk register in week 3, if ever',         after: 'Risk register in every output, automatic' },
  { before: 'Roadmap written separately by a PM',       after: 'Phased roadmap with owners & done-when' },
]

export default function BeforeAfter() {
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) e.target.classList.add('visible')
    }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section style={{ padding: '120px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="reveal" style={{ marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 800, letterSpacing: '-1.5px', color: 'white', lineHeight: 1.12 }}>
            Before vs. After.
          </h2>
        </div>

        <div ref={ref} className="reveal" style={{
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        }}>
          {/* header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '16px 24px', background: 'rgba(239,68,68,0.06)', borderBottom: '1px solid rgba(255,255,255,0.07)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Without ArchitectIQ</span>
            </div>
            <div style={{ padding: '16px 24px', background: 'rgba(52,211,153,0.06)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.1em' }}>With ArchitectIQ</span>
            </div>
          </div>

          {/* rows */}
          {ROWS.map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: i < ROWS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ padding: '16px 24px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#EF4444', flexShrink: 0, marginTop: 2, fontSize: 12 }}>x</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{row.before}</span>
              </div>
              <div style={{ padding: '16px 24px', display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(52,211,153,0.02)' }}>
                <span style={{ color: '#34D399', flexShrink: 0, marginTop: 2, fontSize: 12 }}>✓</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, fontWeight: 500 }}>{row.after}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

