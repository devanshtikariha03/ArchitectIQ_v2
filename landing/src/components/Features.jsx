import { useEffect, useRef } from 'react'

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="#4F8EFF" strokeWidth="1.5"/>
        <path d="M10 6v4l3 2" stroke="#4F8EFF" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    color: '#4F8EFF',
    title: 'Live cloud pricing',
    body: 'Real numbers from Azure, AWS, and GCP official APIs for retail workloads, injected into the generation prompt.',
    wide: true,
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="#A78BFA" strokeWidth="1.5"/>
        <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="#A78BFA" strokeWidth="1.5"/>
        <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="#A78BFA" strokeWidth="1.5"/>
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="#A78BFA" strokeWidth="1.5"/>
      </svg>
    ),
    color: '#A78BFA',
    title: '4 diagram views',
    body: 'System Context, Solution, Deployment, and Retail Flow views covering stores, commerce, data, fulfilment, and operations.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3L17 17H3L10 3Z" stroke="#FBBF24" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 9v4" stroke="#FBBF24" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="14.5" r="0.5" fill="#FBBF24" stroke="#FBBF24"/>
      </svg>
    ),
    color: '#FBBF24',
    title: 'Retail gate checks',
    body: 'Catches budget vs. SLA clashes, missing edge failover, PCI boundary gaps, weak replay tests, and rollout ambiguity.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="8" r="3.5" stroke="#34D399" strokeWidth="1.5"/>
        <path d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    color: '#34D399',
    title: 'Pre-engagement research',
    body: 'Web-searches your retail client before generating: company profile, store/channel signals, compliance requirements, and red flags.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10h14M3 5h14M3 15h8" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    color: '#F472B6',
    title: '3-tier cost breakdown',
    body: 'Conservative, Recommended, and Optimised tiers with compute, data, networking, security, tooling, and optional AI costs.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 10l4 4 8-8" stroke="#E8472A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#E8472A',
    title: 'Output validation',
    body: 'A second pass checks retail constraints, budget feasibility, pricing, PCI scope, edge continuity, and acceptance criteria.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 6h10M5 10h10M5 14h6" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    color: '#60A5FA',
    title: 'Risk register',
    body: 'Retail-specific risks for checkout, inventory, payments, customer data, integrations, peak trading, and store rollout.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="5" cy="5" r="2" stroke="#FB923C" strokeWidth="1.5"/>
        <circle cx="5" cy="15" r="2" stroke="#FB923C" strokeWidth="1.5"/>
        <circle cx="15" cy="10" r="2" stroke="#FB923C" strokeWidth="1.5"/>
        <path d="M7 5.5l6 3.5M7 14.5l6-3.5" stroke="#FB923C" strokeWidth="1.5"/>
      </svg>
    ),
    color: '#FB923C',
    title: 'Phased roadmap',
    body: 'Pilot, rollout, owner, evidence, and done-when criteria adapted to store, commerce, data, or fulfilment timelines.',
  },
]

function useReveal(ref, delay = 0) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => el.classList.add('visible'), delay); obs.disconnect() }
    }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
}

function FeatureCard({ feature, index }) {
  const ref = useRef(null)
  useReveal(ref, index * 45)

  return (
    <div ref={ref} className={`reveal glass glow-border ${feature.wide ? 'lg:col-span-2' : ''}`}
      style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 16, transition: 'border-color 0.2s, background 0.2s' }}
    >
      {/* icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 11,
        background: `${feature.color}12`,
        border: `1px solid ${feature.color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {feature.icon}
      </div>

      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 8, letterSpacing: '-0.3px' }}>{feature.title}</h3>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.42)' }}>{feature.body}</p>
      </div>
    </div>
  )
}

export default function Features() {
  const headRef = useRef(null)
  useReveal(headRef)

  return (
    <section style={{ padding: '120px 24px', background: 'var(--bg2)', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={headRef} className="reveal" style={{ marginBottom: 56, maxWidth: 600 }}>
          <p className="section-label" style={{ marginBottom: 14 }}>Features</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 800, letterSpacing: '-1.5px', color: 'white', lineHeight: 1.12 }}>
            Everything a senior architect<br />
            <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>would spend a week producing.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} index={i} />)}
        </div>
      </div>
    </section>
  )
}

