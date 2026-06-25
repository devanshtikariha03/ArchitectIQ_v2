// Sidebar mirrors the ArchitectIQ.html aside structure exactly so the
// legacy renderScenarioNav()/updateChrome() helpers can update it via
// document.getElementById lookups.
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-row"><img className="logo-icon" src="/architectiq-icon.png" alt="ArchitectIQ" /><div className="logo-mark">Architect<span>IQ</span></div></div>
        <div className="logo-sub">Retail architecture engine</div>
      </div>
      <div className="nav-section">
        <div className="nav-label">Engagement</div>
        <div className="nav-item" onClick={() => window.setStep && window.setStep(0)} id="nav0"><div className="nav-dot" id="navdot0"></div>Client basics</div>
        <div className="nav-item" onClick={() => window.setStep && window.setStep(1)} id="nav1"><div className="nav-dot" id="navdot1"></div>Scale & performance</div>
        <div className="nav-item" onClick={() => window.setStep && window.setStep(2)} id="nav2"><div className="nav-dot" id="navdot2"></div>Cost priorities</div>
        <div className="nav-item" onClick={() => window.setStep && window.setStep(3)} id="nav3"><div className="nav-dot" id="navdot3"></div>Non-functional reqs</div>
        <div className="nav-item" onClick={() => window.setStep && window.setStep(4)} id="nav4"><div className="nav-dot" id="navdot4"></div>Team & delivery</div>
        <div className="nav-item" onClick={() => window.setStep && window.setStep(5)} id="nav5"><div className="nav-dot" id="navdot5"></div>Generate</div>
      </div>
      <div className="nav-section" style={{ marginTop: '.75rem' }}>
        <div className="nav-label">Scenarios</div>
        <div id="scenario-nav"></div>
      </div>
      <div className="aud-toggle-section">
        <div className="aud-label">Audience</div>
        <div className="aud-toggle">
          <button className="aud-opt active" id="aud-tech" onClick={() => window.setAudience && window.setAudience('technical')}>Technical</button>
          <button className="aud-opt" id="aud-exec" onClick={() => window.setAudience && window.setAudience('executive')}>Executive</button>
        </div>
      </div>
      <div className="nav-bottom">
        <div className="client-chip">
          <div className="client-avatar" id="client-avatar">JO</div>
          <div>
            <div className="client-name" id="client-name">Avery Singh</div>
            <div className="client-co" id="client-company">RetailEdge Omni</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

