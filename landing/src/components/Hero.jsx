import { useEffect, useRef, useState } from 'react'

const STAGES = [
  { id: 1, label: 'Retail Research', detail: 'Company - Stores - Channels - Red flags', color: '#4F8EFF' },
  { id: 2, label: 'Live Pricing', detail: 'Azure REST - AWS Bulk - GCP verified', color: '#A78BFA' },
  { id: 3, label: 'Retail Gates', detail: 'PCI - Edge - Inventory - Rollout', color: '#FBBF24' },
  { id: 4, label: 'Generate', detail: 'Retail stack - Diagrams - Costs', color: '#34D399' },
  { id: 5, label: 'Validate', detail: 'Acceptance gates - Constraint check', color: '#F472B6' },
]

function PipelineCard() {
  const [active, setActive] = useState(0)
  const [completed, setCompleted] = useState([])

  useEffect(() => {
    const id = setInterval(() => {
      setActive(prev => {
        const next = (prev + 1) % STAGES.length
        if (next === 0) setCompleted([])
        else setCompleted(c => [...c, prev])
        return next
      })
    }, 1100)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      width: 340,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
    }}>
      {/* header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className="pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8472A' }} />
        <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Pipeline - Running
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
          {[...Array(3)].map((_, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? '#FF5F57' : i === 1 ? '#FEBC2E' : '#28C840' }} />)}
        </div>
      </div>

      {/* stages */}
      <div style={{ padding: '20px' }}>
        {STAGES.map((stage, i) => {
          const isDone = completed.includes(i)
          const isActive = active === i
          return (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < STAGES.length - 1 ? 4 : 0 }}>
              {/* left rail */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700,
                  background: isDone ? 'rgba(52,211,153,0.15)' : isActive ? `${stage.color}22` : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isDone ? 'rgba(52,211,153,0.4)' : isActive ? stage.color : 'rgba(255,255,255,0.1)'}`,
                  transition: 'all 0.4s',
                  color: isDone ? '#34D399' : isActive ? stage.color : 'rgba(255,255,255,0.2)',
                }}>
                  {isDone ? '✓' : <span style={{ fontSize: 8 }}>{stage.id}</span>}
                </div>
                {i < STAGES.length - 1 && (
                  <div style={{ width: 1, height: 20, background: isDone ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)', margin: '3px 0' }} />
                )}
              </div>
              {/* content */}
              <div style={{ paddingBottom: i < STAGES.length - 1 ? 12 : 0 }}>
                <div className="mono" style={{
                  fontSize: 12.5, fontWeight: 600,
                  color: isDone ? 'rgba(255,255,255,0.3)' : isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)',
                  marginBottom: 2,
                  transition: 'all 0.4s',
                }}>
                  {isActive && <span className="pulse" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: stage.color, marginRight: 6, verticalAlign: 'middle' }} />}
                  {stage.label}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', transition: 'all 0.4s' }}>
                  {stage.detail}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* output preview */}
      <div style={{ margin: '0 20px 20px', padding: '12px 14px', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Output ready</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
          Retail stack - 4 diagrams - 3-tier costs<br />Risk register - Rollout plan - Next steps
        </div>
      </div>
    </div>
  )
}

function StatPill({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{label}</div>
    </div>
  )
}

export default function Hero() {
  const ref = useRef(null)
  useEffect(() => { setTimeout(() => ref.current?.classList.add('visible'), 80) }, [])

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '120px 24px 80px' }}>
      {/* mesh blobs */}
      <div className="mesh-blob" style={{ width: 600, height: 600, background: 'radial-gradient(circle, rgba(232,71,42,0.12) 0%, transparent 70%)', top: -100, left: -100 }} />
      <div className="mesh-blob" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(79,142,255,0.08) 0%, transparent 70%)', top: 200, right: -100 }} />
      <div className="mesh-blob" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)', bottom: 0, left: '40%' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 80, alignItems: 'center' }}>

          {/* left */}
          <div ref={ref} className="reveal">
            {/* pill badge */}
            <div className="badge" style={{
              background: 'rgba(232,71,42,0.1)', color: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(232,71,42,0.25)', marginBottom: 28,
            }}>
              <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#E8472A', display: 'inline-block' }} />
              Retail Architecture - 5-Stage Pipeline - Live Cloud Pricing
            </div>

            {/* headline */}
            <h1 style={{
              fontSize: 'clamp(48px, 6.5vw, 80px)',
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: '-3px',
              marginBottom: 24,
              color: 'white',
            }}>
              Architecture in<br />
              <span style={{
                background: 'linear-gradient(135deg, #E8472A 0%, #FF6B35 50%, #FBBF24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>15 minutes.</span><br />
              <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>Not 5 days.</span>
            </h1>

            {/* sub */}
            <p style={{
              fontSize: 18, lineHeight: 1.7,
              color: 'rgba(255,255,255,0.5)',
              maxWidth: 500, marginBottom: 40,
              fontWeight: 400,
            }}>
              Describe your retail client engagement. ArchitectIQ researches the company,
              fetches live cloud pricing from Azure, AWS, and GCP, then generates
              a complete retail architecture  -  stack, diagrams, costs, risks, and rollout plan.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 52 }}>
              <a href="#how-it-works" className="btn-primary" style={{ fontSize: 15, padding: '14px 28px' }}>
                Explore ArchitectIQ
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#output" className="btn-ghost" style={{ fontSize: 15, padding: '14px 28px' }}>
                See example output
              </a>
            </div>

            {/* stats */}
            <div style={{
              display: 'flex', gap: 40, paddingTop: 40,
              borderTop: '1px solid rgba(255,255,255,0.07)',
              flexWrap: 'wrap',
            }}>
              <StatPill value="5" label="Pipeline stages" />
              <StatPill value="3" label="Live pricing APIs" />
              <StatPill value="4" label="Diagram views" />
              <StatPill value="6" label="Retail presets" />
            </div>
          </div>

          {/* right */}
          <div className="hidden lg:block" style={{ flexShrink: 0 }}>
            <PipelineCard />
          </div>
        </div>
      </div>
    </section>
  )
}



