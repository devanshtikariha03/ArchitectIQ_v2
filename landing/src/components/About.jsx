import { useEffect, useRef } from 'react'

const FOUNDERS = [
  {
    name: 'Devansh Tikariha',
    initials: 'DT',
    image: '/devansh-tikariha.png',
    linkedin: 'https://www.linkedin.com/in/devanshtikariha',
    description: 'Devansh Tikariha is an AI engineer and data science professional with hands-on experience building machine learning systems across healthcare, financial automation, and education technology. His expertise spans deep learning, computer vision, large language models, retrieval-augmented generation, and scalable AI deployment with practical experience across Microsoft Azure services. He has developed quantum-enhanced diagnostic models for medical imaging, adversarial attack detection for CT scans, AI-driven debt collection workflows handling tens of thousands of calls, and personalized learning tools for exam preparation. Devansh has co-authored peer-reviewed IEEE publications and is an inventor on a patented smart solar-powered safety helmet for continuous communication and safety monitoring. He is currently pursuing a Master of Data Science at the University of Western Australia.',
    accent: '#E8472A',
  },
  {
    name: 'Krishna Chaitanya',
    initials: 'KC',
    image: '/krishna-chaitanya.png',
    linkedin: 'https://www.linkedin.com/in/krishnachaitanya24?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    description: 'Krishna Chaitanya is a Data Scientist and Technical Operations professional with a Bachelor’s in Computer Science Engineering, specializing in AI and machine learning, and is pursuing a Master of Data Science at the University of Western Australia. He combines advanced analytics, institutional compliance, and technical operations across education, technology, and community services. His experience includes a Generative AI internship at Capgemini, where he worked on machine learning architectures, neural networks, predictive algorithms, and retrieval-augmented systems. Krishna has developed data-driven NDIS workflows using Deputy and QuickBooks, supported lifecycle maintenance planning for an 80-vehicle fleet, managed institutional data integrity at KCBT, built automated ETL pipelines and business intelligence structures, and resolved Level 1 and Level 2 IT infrastructure challenges.',
    accent: '#2563EB',
  },
]

export default function About() {
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add('visible')
        observer.disconnect()
      }
    }, { threshold: 0.08 })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" style={{ padding: '120px 24px', position: 'relative', overflow: 'hidden' }}>
      <div className="section-divider" />
      <div className="mesh-blob" style={{ width: 440, height: 440, background: 'radial-gradient(circle, rgba(232,71,42,0.08) 0%, transparent 70%)', bottom: -180, left: -120 }} />

      <div ref={ref} className="reveal" style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div style={{ maxWidth: 680, marginBottom: 32 }}>
          <p className="section-label" style={{ marginBottom: 14 }}>About ArchitectIQ</p>
          <h2 style={{ fontSize: 'clamp(34px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-1.8px', lineHeight: 1.1, marginBottom: 18 }}>
            Architecture expertise,<br />made easier to apply.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.75 }}>
            ArchitectIQ is being built to help teams move from a complex retail brief to a grounded architecture recommendation—bringing research, cloud pricing, diagrams, risks, and rollout planning into one focused workflow.
          </p>
        </div>

        <div className="glass" style={{
          maxWidth: 780,
          marginBottom: 32,
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          borderColor: 'rgba(232,71,42,0.22)',
          background: 'rgba(232,71,42,0.04)',
        }}>
          <p style={{ flex: '1 1 420px', fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.65 }}>
            ArchitectIQ has been offered a place in UWA&apos;s VentureUP incubator. Read more about ArchitectIQ in the{' '}
            <a
              href="https://www.ventureuwa.com.au/business-directory"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}
            >
              Venture UWA Business Directory →
            </a>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {FOUNDERS.map((founder) => (
            <article key={founder.name} className="glass" style={{ padding: 30, display: 'flex', gap: 22, alignItems: 'flex-start' }}>
              {founder.image ? (
                <img
                  src={founder.image}
                  alt={`${founder.name}, cofounder of ArchitectIQ`}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 22,
                    flexShrink: 0,
                    objectFit: 'cover',
                    border: `1px solid ${founder.accent}30`,
                    boxShadow: '0 12px 30px rgba(15,23,42,0.14)',
                  }}
                />
              ) : (
                <div aria-hidden="true" style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  background: `${founder.accent}14`,
                  border: `1px solid ${founder.accent}30`,
                  color: founder.accent,
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: '-0.4px',
                }}>
                  {founder.initials}
                </div>
              )}
              <div>
                <p style={{ fontSize: 12, color: founder.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7 }}>
                  Cofounder
                </p>
                <h3 style={{ fontSize: 21, letterSpacing: '-0.5px', marginBottom: 10 }}>{founder.name}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--muted)', lineHeight: 1.65 }}>{founder.description}</p>
                {founder.linkedin && (
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${founder.name} on LinkedIn`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      marginTop: 16,
                      color: '#0A66C2',
                      fontSize: 13.5,
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <span aria-hidden="true" style={{ fontSize: 16 }}>in</span>
                    Connect on LinkedIn →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
