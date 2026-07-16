export default function Sidebar({ onNewChat, projects = [], activeProject, onSelectProject }) {
  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <span className="brand">FLOW GEN</span>
        <div className="header-icons">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
      </div>

      {/* Nav */}
      <nav className="nav">
        <button className="nav-item" onClick={onNewChat}>
          <span className="nav-icon-circle">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>New Chat</span>
        </button>

        <button className="nav-item">
          <span className="nav-icon-plain">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
            </svg>
          </span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>Projects</span>
        </button>
      </nav>

      {/* Projects list */}
      {projects.length > 0 && (
        <div className="sidebar-projects">
          <div className="sidebar-section-label">Recent</div>
          {projects.map((p, i) => (
            <button
              key={i}
              className={`sidebar-project-item${activeProject === p.name ? ' active' : ''}`}
              onClick={() => onSelectProject?.(p)}
            >
              <span className="sidebar-project-icon">◈</span>
              <span className="sidebar-project-name" title={p.name}>{p.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Profile */}
      <div className="profile">
        <div className="avatar">D</div>
        <span className="profile-name">Dinal Nirath</span>
      </div>
    </aside>
  );
}
