import { useState, useRef } from 'react';

function formatRelativeDate(isoStr) {
  if (!isoStr) return '';
  try {
    const date = new Date(isoStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function Sidebar({
  onNewChat,
  projects = [],
  activeProject,
  onSelectProject,
  onDeleteProject,
  searchTerm = '',
  onSearchChange,
  isMinimized = false,
  onToggleMinimize,
  user = null,
  onOpenAuth,
  onLogout,
}) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Filter projects by search term
  const filteredProjects = projects.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.source && p.source.toLowerCase().includes(term))
    );
  });

  const userInitial = user?.username ? user.username[0].toUpperCase() : '?';

  function handleSearchClickMinimized() {
    if (isMinimized) {
      onToggleMinimize?.();
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);
    }
  }

  return (
    <aside className={`sidebar ${isMinimized ? 'minimized' : ''}`}>
      {/* ── Sidebar Header ── */}
      <div className="sidebar-header">
        {!isMinimized ? (
          <>
            <div className="brand-wrap">
              <span className="brand-dot" />
              <span className="brand">FLOW GEN</span>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="sidebar-icon-btn"
                onClick={onToggleMinimize}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="minimized-header">
            <button
              type="button"
              className="sidebar-icon-btn expand-btn"
              onClick={onToggleMinimize}
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ── Navigation Actions ── */}
      <nav className="nav">
        <button
          type="button"
          className="nav-item new-chat-btn"
          onClick={onNewChat}
          title={isMinimized ? 'New Analyzer' : undefined}
        >
          <span className="nav-icon-circle">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          {!isMinimized && <span className="nav-label">New Analyzer</span>}
        </button>

        {isMinimized && (
          <button
            type="button"
            className="nav-item"
            onClick={handleSearchClickMinimized}
            title="Search analyzers"
          >
            <span className="nav-icon-plain">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
          </button>
        )}
      </nav>

      {/* ── Search Bar (Expanded Mode) ── */}
      {!isMinimized && (
        <div className="sidebar-search-wrap">
          <div className="sidebar-search-box">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              className="sidebar-search-input"
              placeholder="Search analyzers..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="sidebar-search-clear"
                onClick={() => onSearchChange?.('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Code Analyzer History / Projects List ── */}
      <div className="sidebar-projects">
        {!isMinimized && (
          <div className="sidebar-section-header">
            <span className="sidebar-section-label">History</span>
            {searchTerm && (
              <span className="sidebar-section-badge">
                {filteredProjects.length} found
              </span>
            )}
          </div>
        )}

        {filteredProjects.length > 0 ? (
          filteredProjects.map((p) => {
            const isSelected = activeProject === p.name || activeProject === p.id;
            return (
              <div
                key={p.id || p.name}
                className={`sidebar-project-item ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectProject?.(p)}
                title={`${p.name}${p.created_at ? ' • ' + formatRelativeDate(p.created_at) : ''}`}
              >
                <span className="sidebar-project-icon">
                  {p.source === 'git' ? '⌥' : '◈'}
                </span>

                {!isMinimized && (
                  <div className="sidebar-project-info">
                    <span className="sidebar-project-name">{p.name}</span>
                    {p.created_at && (
                      <span className="sidebar-project-date">
                        {formatRelativeDate(p.created_at)}
                      </span>
                    )}
                  </div>
                )}

                {!isMinimized && onDeleteProject && p.id && (
                  <button
                    type="button"
                    className="sidebar-project-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete analysis "${p.name}"?`)) {
                        onDeleteProject(p.id, e);
                      }
                    }}
                    title="Delete analysis"
                    aria-label="Delete analysis"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })
        ) : (
          !isMinimized && (
            <div className="sidebar-empty-state">
              {searchTerm ? (
                <>
                  <p>No matching analyzers</p>
                  <button
                    type="button"
                    className="sidebar-clear-btn"
                    onClick={() => onSearchChange?.('')}
                  >
                    Clear filter
                  </button>
                </>
              ) : (
                <p>No past analyzers yet</p>
              )}
            </div>
          )
        )}
      </div>

      {/* ── Account / Profile Footer ── */}
      <div className="sidebar-footer">
        {user ? (
          <div className="profile-container">
            <div
              className="profile"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              title={isMinimized ? `${user.username} (${user.email || 'User'})\nClick to log out` : undefined}
            >
              <div className="avatar">{userInitial}</div>
              {!isMinimized && (
                <div className="profile-details">
                  <span className="profile-name">{user.username}</span>
                  {user.email && <span className="profile-email">{user.email}</span>}
                </div>
              )}
              {!isMinimized && (
                <button
                  type="button"
                  className="profile-logout-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout?.();
                  }}
                  title="Log out"
                  aria-label="Log out"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Minimized profile popover menu */}
            {isMinimized && profileMenuOpen && (
              <div className="minimized-profile-menu">
                <div className="menu-user-info">
                  <strong>{user.username}</strong>
                  {user.email && <span>{user.email}</span>}
                </div>
                <button
                  type="button"
                  className="menu-logout-btn"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout?.();
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="unauth-footer">
            {!isMinimized ? (
              <button
                type="button"
                className="profile-login-btn"
                onClick={() => onOpenAuth?.('login')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>Sign In / Register</span>
              </button>
            ) : (
              <button
                type="button"
                className="minimized-login-btn"
                onClick={() => onOpenAuth?.('login')}
                title="Sign In / Register"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
