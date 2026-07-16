import { useRef, useState } from 'react';
import { isGitUrl } from '../api.js';

export default function DropZone({ status, loadingLabel, errorMessage, onFile, onGitUrl, onReset }) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  function handleClick() {
    if (status === 'idle' || status === 'error') fileInputRef.current?.click();
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }
  function handleDragLeave(e) {
    e.preventDefault();
    setDragging(false);
  }
  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { onFile(file); return; }
    const text = e.dataTransfer.getData('text');
    if (text && isGitUrl(text.trim())) onGitUrl(text.trim());
  }
  function handleFileInputChange(e) {
    const file = e.target.files[0];
    if (file) onFile(file);
    e.target.value = '';
  }

  return (
    <>
      <div
        className={`drop-zone${dragging ? ' dragging' : ''}`}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Animated grid background */}
        <div className="bg-grid" />

        {status === 'idle' && (
          <>
            <div className="drop-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div className="drop-icon-arrow">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
            <p className="drop-text">
              Drag & drop your <strong style={{ color: 'var(--accent)' }}>.zip</strong> or a git URL
            </p>
            <p className="drop-sub">Supports Python · C · C++ · JavaScript projects</p>
          </>
        )}

        {status === 'loading' && (
          <>
            <div className="spinner" />
            <p className="status-text">{loadingLabel}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="status-text error-text">{errorMessage}</p>
            <button className="remove-btn" onClick={(e) => { e.stopPropagation(); onReset(); }}>
              Try again
            </button>
          </>
        )}
      </div>

      <input
        type="file"
        id="file-input"
        ref={fileInputRef}
        accept=".zip"
        onChange={handleFileInputChange}
      />
    </>
  );
}
