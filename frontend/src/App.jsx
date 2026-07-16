import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import DropZone from './components/DropZone.jsx';
import ChatBar from './components/ChatBar.jsx';
import DashboardView from './components/DashboardView.jsx';
import logo from './assets/logo.svg';
import { uploadZip, analyzeGitUrl } from './api.js';

export default function App() {
  const [status,        setStatus]        = useState('idle');
  const [loadingLabel,  setLoadingLabel]  = useState('');
  const [errorMessage,  setErrorMessage]  = useState('');
  const [projectName,   setProjectName]   = useState('');
  const [result,        setResult]        = useState(null);
  const [projects,      setProjects]      = useState([]);

  function reset() {
    setStatus('idle');
    setErrorMessage('');
    setResult(null);
    setProjectName('');
  }

  async function handleFile(file) {
    setStatus('loading');
    setLoadingLabel(`Analyzing ${file.name}…`);
    try {
      const { projectName: name, result: res } = await uploadZip(file);
      const pName = name || file.name;
      setProjectName(pName);
      setResult(res);
      setStatus('done');
      // Add to sidebar history (deduplicate)
      setProjects(prev => {
        const exists = prev.find(p => p.name === pName);
        if (exists) return prev;
        return [{ name: pName, result: res }, ...prev].slice(0, 10);
      });
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Could not reach the analysis server.');
      setStatus('error');
    }
  }

  async function handleGitUrl(url) {
    setStatus('loading');
    setLoadingLabel('Cloning and analyzing repository…');
    try {
      const { projectName: name, result: res } = await analyzeGitUrl(url);
      const pName = name || url;
      setProjectName(pName);
      setResult(res);
      setStatus('done');
      setProjects(prev => {
        const exists = prev.find(p => p.name === pName);
        if (exists) return prev;
        return [{ name: pName, result: res }, ...prev].slice(0, 10);
      });
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Could not reach the analysis server.');
      setStatus('error');
    }
  }

  function handleSelectProject(p) {
    setProjectName(p.name);
    setResult(p.result);
    setStatus('done');
  }

  const isDone = status === 'done' && result;

  return (
<<<<<<< HEAD
    <div className="app">
      <Sidebar
        onNewChat={reset}
        projects={projects}
        activeProject={projectName}
        onSelectProject={handleSelectProject}
      />

      <main className="main">
        {isDone ? (
          /* ── Dashboard view ── */
          <DashboardView
            result={result}
            projectName={projectName}
            onReset={reset}
          />
        ) : (
          /* ── Landing / upload view ── */
          <div className="landing">
            {/* Subtle grid background */}
            <div className="bg-grid" />

            {/* Logo */}
            <div className="logo-wrap">
              <img className="logo-img" src={logo} alt="FlowGen logo" />
              <p style={{
                fontSize: 13,
                color: 'var(--muted)',
                marginTop: 10,
                letterSpacing: '0.04em',
                fontFamily: 'var(--font-mono)',
              }}>
                Code architecture visualizer
              </p>
            </div>

            {/* Drop Zone */}
            <DropZone
              status={status}
              loadingLabel={loadingLabel}
              errorMessage={errorMessage}
              onFile={handleFile}
              onGitUrl={handleGitUrl}
              onReset={reset}
            />

            {/* Feature hints */}
            {status === 'idle' && (
              <div style={{
                display: 'flex',
                gap: 28,
                marginTop: 8,
              }}>
                {[
                  { icon: '⬡', label: 'Call Graph' },
                  { icon: '◈', label: 'Dep Graph' },
                  { icon: '✦', label: 'AI Summaries' },
                  { icon: '</>', label: 'Code Viewer' },
                ].map(f => (
                  <div key={f.label} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)',
                  }}>
                    <span style={{ color: 'var(--accent)', fontSize: 13 }}>{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat bar — shown on landing only */}
        {!isDone && (
          <ChatBar
            onGitUrl={handleGitUrl}
            placeholder="Paste a git URL to analyze, or ask something…"
          />
        )}
      </main>
    </div>
=======
    <BrowserRouter>
      <Routes>
        <Route path="/Home"     element={<Home />} />
        <Route path="/Features"     element={<Features />} />
        <Route path="/Demos"     element={<Demos />} />
        <Route path="/Help"  element={<Help />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
>>>>>>> 3588a6188676b383697558ed91d1c26bbf4dc701
  );
}
