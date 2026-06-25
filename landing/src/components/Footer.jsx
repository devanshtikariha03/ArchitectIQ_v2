import { useRef, useEffect } from 'react'

export default function Footer() {
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) e.target.classList.add('visible')
    }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* CTA section */}
      <section style={{ padding: '120px 24px', background: 'var(--bg2)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(15,23,42,0.10), transparent)' }} />

        {/* glow */}
        <div className="mesh-blob" style={{ width: 600, height: 400, background: 'radial-gradient(circle, rgba(232,71,42,0.1) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', position: 'absolute' }} />

        <div ref={ref} className="reveal" style={{ maxWidth: 640, margin: '0 auto', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <h2 style={{
            fontSize: 'clamp(40px, 5.5vw, 68px)',
            fontWeight: 900, letterSpacing: '-2.5px',
            color: 'var(--text)', lineHeight: 1.08,
          }}>
            Ready to generate<br />
            your next<br />
            <span style={{
              background: 'linear-gradient(135deg, #E8472A, #FF6B35, #FBBF24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>architecture?</span>
          </h2>

          <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 400 }}>
            No account. No credit card.<br />Fill the form, get the full output.
          </p>

          <a href="/app" className="btn-primary" style={{ fontSize: 16, padding: '16px 40px', marginTop: 8 }}>
            Generate architecture
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>

          <p style={{ fontSize: 12, color: 'var(--subtle)' }}>
            Uses live Azure - AWS - GCP pricing APIs
          </p>
        </div>
      </section>

      {/* footer bar */}
      <footer style={{ padding: '28px 24px', borderTop: '1px solid rgba(15,23,42,0.10)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src="/architectiq-icon.png"
              alt="ArchitectIQ"
              style={{ width: 28, height: 28, borderRadius: 7, objectFit: 'cover' }}
            />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>ArchitectIQ</span>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            {[['#how-it-works','How it works'],['#output','Output'],['#scenarios','Scenarios'],'/app,Launch App'].map((item, i) => {
              const [href, label] = Array.isArray(item) ? item : item.split(',')
              return (
                <a key={i} href={href} style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text)'}
                  onMouseLeave={e => e.target.style.color = 'var(--muted)'}
                >{label}</a>
              )
            })}
          </div>

          <span style={{ fontSize: 12, color: 'var(--subtle)' }}>(c) 2026 ArchitectIQ</span>
        </div>
      </footer>
    </>
  )
}



