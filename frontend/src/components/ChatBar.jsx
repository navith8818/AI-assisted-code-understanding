import { useState } from 'react';
import { isGitUrl } from '../api.js';

export default function ChatBar({ onGitUrl, placeholder = 'Paste a git URL, or ask something…' }) {
  const [value, setValue] = useState('');

  function handleKeyDown(e) {
    if (e.key !== 'Enter') return;
    const trimmed = value.trim();
    if (!trimmed) return;
    if (isGitUrl(trimmed)) {
      onGitUrl(trimmed);
      setValue('');
    } else {
      console.log('No chat backend connected yet. Message:', trimmed);
      setValue('');
    }
  }

  return (
    <div className="chat-bar-wrap">
      <div className="chat-bar">
        {/* Gemini-style star icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2 L13.8 9.5 L21 12 L13.8 14.5 L12 22 L10.2 14.5 L3 12 L10.2 9.5 Z"
                fill="#5b9bff" opacity="0.9"/>
        </svg>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {value && (
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.4)" strokeWidth="2"
            style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={() => setValue('')}
          >
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        )}
      </div>
    </div>
  );
}
