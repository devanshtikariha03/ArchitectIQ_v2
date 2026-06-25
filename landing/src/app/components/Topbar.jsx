export default function Topbar() {
  return (
    <div className="topbar">
      <div className="topbar-title" id="topbar-title">Client basics</div>
      <div className="topbar-right">
        <button className="pill-btn" id="back-btn" onClick={() => window.go && window.go(-1)}>Back</button>
        <button className="pill-btn logs-pill" id="logs-btn" onClick={() => window.toggleLogs && window.toggleLogs()}>Logs</button>
        <button className="pill-btn pri" id="next-btn" onClick={() => window.handleTopAction && window.handleTopAction()}>Continue</button>
      </div>
    </div>
  );
}
