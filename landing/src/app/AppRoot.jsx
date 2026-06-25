import { useEffect, useRef } from 'react';
import './app.css';
import * as legacy from './utils/legacy.js';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';

// AppRoot mounts the same DOM skeleton ArchitectIQ.html relied on, then hands
// off to the legacy render pipeline (preserves every behaviour: scenarios,
// 6-step form, generate(), pipeline UI, output, audience toggle, logs).
export default function AppRoot() {
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    try {
      legacy.logEvent('info', 'app.loaded', { reactRoute: '/app' });
      legacy.render();
      legacy.refreshServerConfig();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('AppRoot init failed', err);
    }
  }, []);

  return (
    <div className="app-root">
      <main className="container">
        <div className="shell" id="shell">
          <Sidebar />
          <section className="main">
            <Topbar />
            <div className="content" id="content" />
          </section>
        </div>
      </main>
    </div>
  );
}
