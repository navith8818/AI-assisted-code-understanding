import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.jsx';
import DropZone from './components/DropZone.jsx';
import ChatBar from './components/ChatBar.jsx';
import DashboardView from './components/DashboardView.jsx';
import AuthModal from './components/AuthModal.jsx';
import logo from './assets/logo.svg';
import {
  uploadZip,
  analyzeGitUrl,
  fetchProjects,
  fetchProjectAnalysis,
  deleteProject,
  fetchCurrentUser,
  setAuthToken,
} from './api.js';

export default function App() {
  const [status, setStatus] = useState('idle');
  const [loadingLabel, setLoadingLabel] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [projectName, setProjectName] = useState('');
  const [result, setResult] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);

  // Projects / History & Search
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Authentication
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('login');

  // Sidebar minimization preference
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(() => {
    try {
      return localStorage.getItem('flowgen_sidebar_minimized') === 'true';
    } catch {
      return false;
    }
  });

  // Notification Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? '' : current));
    }, 3500);
  }, []);

  function toggleSidebarMinimize() {
    setIsSidebarMinimized((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('flowgen_sidebar_minimized', String(next));
      } catch {}
      return next;
    });
  }

  // Load projects from MongoDB backend
  const loadProjects = useCallback(async (search = '') => {
    try {
      const items = await fetchProjects(search);
      setProjects(items);
    } catch (err) {
      console.warn('Could not load project history:', err);
    }
  }, []);

  // Initial user auth & projects load
  useEffect(() => {
    async function init() {
      try {
        const currentUser = await fetchCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.warn('Error verifying auth session:', err);
      } finally {
        loadProjects('');
      }
    }
    init();
  }, [loadProjects]);

  // Handle Search input change with debounced API search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects(searchTerm);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, loadProjects]);

  function reset() {
    setStatus('idle');
    setErrorMessage('');
    setResult(null);
    setProjectName('');
    setActiveProjectId(null);
  }

  // Handle file upload
  async function handleFile(file) {
    setStatus('loading');
    setLoadingLabel(`Analyzing ${file.name}…`);
    try {
      const { projectName: name, result: res } = await uploadZip(file);
      const pName = name || file.name;
      setProjectName(pName);
      setResult(res);
      setActiveProjectId(res.project_id || null);
      setStatus('done');
      // Refresh project list from MongoDB
      loadProjects(searchTerm);
      showToast(`Analyzed ${pName} successfully`);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Could not reach the analysis server.');
      setStatus('error');
    }
  }

  // Handle Git URL
  async function handleGitUrl(url) {
    setStatus('loading');
    setLoadingLabel('Cloning and analyzing repository…');
    try {
      const { projectName: name, result: res } = await analyzeGitUrl(url);
      const pName = name || url;
      setProjectName(pName);
      setResult(res);
      setActiveProjectId(res.project_id || null);
      setStatus('done');
      // Refresh project list from MongoDB
      loadProjects(searchTerm);
      showToast(`Analyzed ${pName} successfully`);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Could not reach the analysis server.');
      setStatus('error');
    }
  }

  // Handle clicking a project from history
  async function handleSelectProject(projectItem) {
    if (projectItem.result) {
      setProjectName(projectItem.name);
      setResult(projectItem.result);
      setActiveProjectId(projectItem.id || null);
      setStatus('done');
      return;
    }

    if (!projectItem.id) {
      return;
    }

    setStatus('loading');
    setLoadingLabel(`Loading analysis for ${projectItem.name}…`);
    try {
      const analysisData = await fetchProjectAnalysis(projectItem.id);
      setProjectName(analysisData.project_name || projectItem.name);
      setResult(analysisData);
      setActiveProjectId(projectItem.id);
      setStatus('done');
    } catch (err) {
      console.error('Failed to load project analysis:', err);
      showToast(`Error: ${err.message}`);
      setStatus('idle');
    }
  }

  // Handle project deletion from MongoDB history
  async function handleDeleteProject(projectId, e) {
    e?.stopPropagation();
    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (activeProjectId === projectId) {
        reset();
      }
      showToast('Project removed from history');
    } catch (err) {
      console.error('Delete error:', err);
      showToast(`Failed to delete: ${err.message}`);
    }
  }

  // Auth Handlers
  function handleOpenAuth(tab = 'login') {
    setAuthInitialTab(tab);
    setAuthModalOpen(true);
  }

  function handleAuthSuccess(token, userProfile) {
    setUser(userProfile);
    loadProjects('');
    showToast(`Welcome back, ${userProfile.username}!`);
  }

  function handleLogout() {
    setAuthToken(null);
    setUser(null);
    reset();
    loadProjects('');
    showToast('Logged out successfully');
  }

  const isDone = status === 'done' && result;

  return (
    <div className={`app ${isSidebarMinimized ? 'sidebar-is-minimized' : ''}`}>
      {/* ── Sidebar ── */}
      <Sidebar
        onNewChat={reset}
        projects={projects}
        activeProject={activeProjectId || projectName}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        isMinimized={isSidebarMinimized}
        onToggleMinimize={toggleSidebarMinimize}
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* ── Main Workspace ── */}
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

            {/* Top right quick auth badge on landing page */}
            {!user && (
              <div className="landing-top-bar">
                <button
                  type="button"
                  className="landing-auth-btn"
                  onClick={() => handleOpenAuth('login')}
                >
                  Sign In / Register
                </button>
              </div>
            )}

            {/* Logo */}
            <div className="logo-wrap">
              <img className="logo-img" src={logo} alt="FlowGen logo" />
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--muted)',
                  marginTop: 10,
                  letterSpacing: '0.04em',
                  fontFamily: 'var(--font-mono)',
                }}
              >
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
              <div
                style={{
                  display: 'flex',
                  gap: 28,
                  marginTop: 8,
                }}
              >
                {[
                  { icon: '⬡', label: 'Call Graph' },
                  { icon: '◈', label: 'Dep Graph' },
                  { icon: '✦', label: 'AI Summaries' },
                  { icon: '</>', label: 'Code Viewer' },
                ].map((f) => (
                  <div
                    key={f.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 11,
                      color: 'var(--muted)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span style={{ color: 'var(--accent)', fontSize: 13 }}>
                      {f.icon}
                    </span>
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

      {/* ── Authentication Modal ── */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialTab={authInitialTab}
      />

      {/* ── Toast Notification ── */}
      {toastMessage && (
        <div className="toast-notification" role="status">
          <span className="toast-dot" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
