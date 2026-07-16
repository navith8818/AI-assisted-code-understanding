import { useEffect, useRef } from 'react';

// ── Syntax token highlighter (no deps) ──────────────────────
const KEYWORDS = /\b(function|class|return|const|let|var|if|else|for|while|do|switch|case|break|continue|new|delete|typeof|instanceof|import|export|default|from|async|await|try|catch|finally|throw|yield|extends|super|this|null|undefined|true|false|def|in|is|not|and|or|pass|with|as|lambda|global|nonlocal|raise|elif|int|float|double|void|bool|char|string|static|public|private|protected|virtual|override|struct|enum|namespace|using|include|#include|#define|printf|cout|cin|endl|std)\b/g;

function tokenize(line) {
  // Very simple tokenizer for visual effect
  const result = [];
  let i = 0;
  const str = line;

  while (i < str.length) {
    // String literals
    if (str[i] === '"' || str[i] === "'" || str[i] === '`') {
      const q = str[i];
      let j = i + 1;
      while (j < str.length && str[j] !== q) {
        if (str[j] === '\\') j++;
        j++;
      }
      result.push({ type: 'string', text: str.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    // Comments
    if (str[i] === '/' && str[i + 1] === '/') {
      result.push({ type: 'comment', text: str.slice(i) });
      break;
    }
    if (str[i] === '#') {
      result.push({ type: 'comment', text: str.slice(i) });
      break;
    }
    // Numbers
    if (/\d/.test(str[i])) {
      let j = i;
      while (j < str.length && /[\d.]/.test(str[j])) j++;
      result.push({ type: 'number', text: str.slice(i, j) });
      i = j;
      continue;
    }
    // Word
    if (/[a-zA-Z_$]/.test(str[i])) {
      let j = i;
      while (j < str.length && /[\w$]/.test(str[j])) j++;
      const word = str.slice(i, j);
      const isKeyword = KEYWORDS.test(word);
      KEYWORDS.lastIndex = 0;
      result.push({ type: isKeyword ? 'keyword' : 'ident', text: word });
      i = j;
      continue;
    }
    // Punctuation / operator
    result.push({ type: 'punct', text: str[i] });
    i++;
  }
  return result;
}

const TOKEN_COLOR = {
  keyword: '#c792ea',
  string:  '#c3e88d',
  number:  '#f78c6c',
  comment: '#546e7a',
  ident:   '#82aaff',
  punct:   'rgba(255,255,255,0.6)',
};

function CodeLine({ lineNumber, content, isHighlighted }) {
  const tokens = tokenize(content);
  return (
    <div className={`code-line${isHighlighted ? ' highlighted' : ''}`}>
      <span className="code-line-num">{lineNumber}</span>
      <span className="code-line-content">
        {tokens.map((t, i) => (
          <span key={i} style={{ color: TOKEN_COLOR[t.type] || 'inherit' }}>{t.text}</span>
        ))}
      </span>
    </div>
  );
}

export default function CodeViewer({ code, filename, targetLine }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (targetLine && scrollRef.current) {
      const lineEl = scrollRef.current.querySelector(`[data-line="${targetLine}"]`);
      if (lineEl) {
        lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [code, targetLine]);

  return (
    <div className="code-viewer">
      <div className="code-viewer-header">
        <div className="code-file-name">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          {filename
            ? <><span>{filename.split('/').pop()}</span></>
            : <span style={{ opacity: 0.4 }}>No file loaded</span>
          }
        </div>
        {targetLine && (
          <span style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
            line {targetLine}
          </span>
        )}
      </div>

      {!code ? (
        <div className="code-empty">
          <div className="code-empty-icon">{'</>'}</div>
          <div className="code-empty-text">Click a node to view its source</div>
        </div>
      ) : (
        <div className="code-scroll" ref={scrollRef}>
          <pre>
            {code.split('\n').map((line, i) => {
              const lineNum = i + 1;
              return (
                <div key={lineNum} data-line={lineNum}>
                  <CodeLine
                    lineNumber={lineNum}
                    content={line}
                    isHighlighted={targetLine && lineNum === targetLine}
                  />
                </div>
              );
            })}
          </pre>
        </div>
      )}
    </div>
  );
}
