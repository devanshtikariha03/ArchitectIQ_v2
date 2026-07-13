import { useState, useEffect } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 24px',
      transition: 'all 0.3s',
    }}>
      <nav style={{
        maxWidth: 1100,
        margin: '16px auto 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        borderRadius: 14,
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.76)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${scrolled ? 'rgba(15,23,42,0.12)' : 'rgba(15,23,42,0.08)'}`,
        transition: 'all 0.3s',
        boxShadow: scrolled ? '0 12px 36px rgba(15,23,42,0.10)' : 'none',
      }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src="/architectiq-icon.png"
            alt="ArchitectIQ"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              objectFit: 'cover',
              boxShadow: '0 1px 4px rgba(15,23,42,0.12)',
            }}
          />
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            ArchitectIQ
          </span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[['#how-it-works','How it works'],['#output','Output'],['#scenarios','Scenarios']].map(([href, label]) => (
            <a key={href} href={href} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 13.5, fontWeight: 500,
              color: 'var(--muted)', textDecoration: 'none',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.target.style.color = 'var(--text)'; e.target.style.background = 'rgba(15,23,42,0.06)' }}
            onMouseLeave={e => { e.target.style.color = 'var(--muted)'; e.target.style.background = 'transparent' }}
            >{label}</a>
          ))}
        </div>

        <a href="#about" className="btn-primary" style={{ padding: '9px 20px', fontSize: 13.5 }}>
          Meet the founders
        </a>
      </nav>
    </header>
  )
}

