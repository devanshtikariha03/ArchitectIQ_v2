import { useEffect, useRef } from 'react'

const STEPS = [
  {
    n: '01', color: '#4F8EFF',
    title: 'Fill the engagement form',
    body: 'Describe your client  -  company, scale, budget, compliance, team, and constraints. Six focused steps, under 5 minutes.',
    chips: ['Company profile', 'Budget & scale', 'Compliance needs', 'Team makeup', 'Hard constraints'],
  },
  {
    n: '02', color: '#A78BFA',
    title: 'Watch the 5-stage pipeline',
    body: 'The AI researches your client, pulls live pricing from Azure, AWS, and GCP APIs, detects contradictions, generates the architecture, then validates the output.',
    chips: ['Web research', 'Live pricing', 'Contradiction check', 'Generation', 'Validation'],
  },
  {
    n: '03', color: '#34D399',
    title: 'Get the full package',
    body: 'A complete, ready-to-present architecture recommendation  -  everything a senior architect would produce in a week-long engagement.',
    chips: ['Cloud stack', '4 Mermaid diagrams', '3-tier costs', 'Risk register', 'Phased roadmap'],
  },
]

function useReveal(ref, delay = 0) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => el.classList.add('visible'), delay); obs.disconnect() }
    }, { threshold: 0.12 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
}

function Step({ step, index }) {
  const ref = useRef(null)
  useReveal(ref, index * 100)

  return (
    <div ref={ref} className="reveal glass glow-border" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* number */}
      <div style={{
        fontSize: 13, fontWeight: 800, letterSpacing: '-0.5px',
        fontFamily: 'JetBrains Mono, monospace',
        color: step.color,
        opacity: 0.8,
      }}>{step.n}</div>

      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 10, letterSpacing: '-0.4px' }}>{step.title}</h3>
        <p style={{ fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.45)' }}>{step.body}</p>
      </div>

      {/* chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {step.chips.map((chip, i) => (
          <span key={i} style={{
            padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
            background: `${step.color}12`,
            color: step.color,
            border: `1px solid ${step.color}25`,
          }}>{chip}</span>
        ))}
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const headRef = useRef(null)
  useReveal(headRef)

  return (
    <section id="how-it-works" style={{ padding: '120px 24px', position: 'relative' }}>
      {/* subtle divider glow */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '60%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div ref={headRef} className="reveal" style={{ marginBottom: 56, maxWidth: 560 }}>
          <p className="section-label" style={{ marginBottom: 14 }}>How it works</p>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 50px)', fontWeight: 800, letterSpacing: '-1.5px', color: 'white', lineHeight: 1.12 }}>
            Three steps.<br />
            <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>One complete architecture.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {STEPS.map((step, i) => <Step key={i} step={step} index={i} />)}
        </div>
      </div>
    </section>
  )
}

