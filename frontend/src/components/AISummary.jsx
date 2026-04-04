import { useState, useEffect } from "react";

export default function AISummary({ summary, loading, nodeId }) {

  // Parse markdown-like bold and headers into styled spans
  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      // ## Header
      if (line.startsWith("## ")) {
        return (
          <p key={i} style={s.mdHeader}>
            {line.replace("## ", "")}
          </p>
        );
      }
      // **bold** text
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((part, j) =>
        j % 2 === 1
          ? <strong key={j} style={s.mdBold}>{part}</strong>
          : part
      );
      // Numbered list lines
      if (/^\d+\./.test(line)) {
        return (
          <p key={i} style={s.mdListItem}>{rendered}</p>
        );
      }
      // Empty line → spacer
      if (line.trim() === "") {
        return <div key={i} style={{height: 6}} />;
      }
      return <p key={i} style={s.mdLine}>{rendered}</p>;
    });
  };

  if (!nodeId) return null;

  return (
    <div style={s.container}>

      {/* Header */}
      <div style={s.header}>
        <span style={s.geminiIcon}>✦</span>
        <span style={s.title}>AI Summary</span>
        {loading && <span style={s.dot} />}
      </div>

      {/* Content */}
      <div style={s.body}>
        {loading ? (
          <div style={s.loadingBox}>
            <div style={s.spinner} />
            <p style={s.loadingText}>Analyzing with Gemini…</p>
          </div>
        ) : summary ? (
          <div style={s.summaryText}>
            {renderMarkdown(summary)}
          </div>
        ) : (
          <p style={s.emptyText}>No summary available.</p>
        )}
      </div>

    </div>
  );
}

const s = {
  container:   { marginTop:"1rem",
                 background:"var(--surface2)",
                 border:"1px solid #2a2a5a",
                 borderRadius:10, overflow:"hidden" },
  header:      { display:"flex", alignItems:"center", gap:6,
                 padding:"0.6rem 0.75rem",
                 background:"linear-gradient(135deg,#1a1a3a,#12122a)",
                 borderBottom:"1px solid #2a2a5a" },
  geminiIcon:  { color:"#7c3aed", fontSize:14, flexShrink:0 },
  title:       { fontSize:11, fontFamily:"var(--font-head)",
                 fontWeight:700, color:"#a78bfa",
                 letterSpacing:1, textTransform:"uppercase" },
  dot:         { width:6, height:6, borderRadius:"50%",
                 background:"#7c3aed", marginLeft:"auto",
                 animation:"pulse 1.2s ease infinite" },
  body:        { padding:"0.75rem", maxHeight:320,
                 overflowY:"auto" },
  loadingBox:  { display:"flex", flexDirection:"column",
                 alignItems:"center", gap:10, padding:"1rem 0" },
  spinner:     { width:24, height:24, borderRadius:"50%",
                 border:"2px solid #2a2a5a",
                 borderTop:"2px solid #7c3aed",
                 animation:"spin 0.8s linear infinite" },
  loadingText: { fontSize:11, color:"var(--muted)",
                 fontFamily:"var(--font-mono)" },
  summaryText: { fontSize:11, fontFamily:"var(--font-mono)",
                 lineHeight:1.7, color:"var(--text)" },
  mdHeader:    { fontSize:11, fontWeight:700, color:"#a78bfa",
                 marginBottom:4, marginTop:8,
                 fontFamily:"var(--font-head)",
                 textTransform:"uppercase", letterSpacing:0.5 },
  mdBold:      { color:"var(--accent)", fontWeight:600 },
  mdListItem:  { paddingLeft:10, borderLeft:"2px solid #2a2a5a",
                 marginBottom:4, color:"var(--text)" },
  mdLine:      { marginBottom:3, color:"#c0c0d8" },
  emptyText:   { color:"var(--muted)", fontSize:11,
                 fontFamily:"var(--font-mono)" },
};