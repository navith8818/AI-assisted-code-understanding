import Editor        from "@monaco-editor/react";
import { useRef, useEffect } from "react";

export default function CodeViewer({ code, filename, targetLine }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    if (targetLine) scrollToLine(editor, monaco, targetLine);
  };

  // Re-scroll whenever the target line changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current && targetLine) {
      scrollToLine(editorRef.current, monacoRef.current, targetLine);
    }
  }, [targetLine, code]);   // also re-run when code changes (new file loaded)

  const scrollToLine = (editor, monaco, line) => {
    if (!line || line < 1) return;

    // Clear previous highlights
    const model = editor.getModel();
    if (!model) return;
    editor.deltaDecorations(
      model.getAllDecorations()
           .filter(d => d.options.className === "hl-line")
           .map(d => d.id),
      []
    );

    // Add new highlight on the target line
    editor.deltaDecorations([], [
      {
        range: new monaco.Range(line, 1, line, 9999),
        options: {
          isWholeLine: true,
          className:   "hl-line",
        },
      },
    ]);

    // Smooth scroll so the line appears centered
    editor.revealLineInCenter(line, monaco.editor.ScrollType.Smooth);
  };

  const getLang = (fname) => {
    if (!fname) return "plaintext";
    const ext = fname.split(".").pop().toLowerCase();
    return { py:"python", js:"javascript",
             c:"c", h:"c", cpp:"cpp", hpp:"cpp" }[ext] || "plaintext";
  };

  return (
    <div style={s.panel}>

      {/* Header bar */}
      <div style={s.header}>
        {filename ? (
          <div style={s.fileInfo}>
            <span style={s.dot} />
            <span style={s.filename} title={filename}>{filename}</span>
            {targetLine && (
              <span style={s.lineTag}>line {targetLine}</span>
            )}
          </div>
        ) : (
          <span style={s.placeholder}>Code Viewer</span>
        )}
      </div>

      {/* Editor or empty state */}
      {code ? (
        <>
          <style>{`
            .hl-line {
              background: rgba(255,184,0,0.18) !important;
              border-left: 3px solid #ffb800 !important;
            }
          `}</style>
          <div style={{ flex:1, overflow:"hidden" }}>
            <Editor
              height="100%"
              language={getLang(filename)}
              value={code}
              theme="vs-dark"
              onMount={handleMount}
              options={{
                readOnly:             true,
                fontSize:             12,
                fontFamily:           "JetBrains Mono, monospace",
                lineNumbers:          "on",
                minimap:              { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap:             "off",
                glyphMargin:          false,
                folding:              true,
                renderLineHighlight:  "none",
                scrollbar: {
                  vertical:               "visible",
                  horizontal:             "visible",
                  verticalScrollbarSize:  6,
                  horizontalScrollbarSize:6,
                },
              }}
            />
          </div>
        </>
      ) : (
        <div style={s.empty}>
          <div style={s.emptyIcon}>{"{ }"}</div>
          <p style={s.emptyTitle}>Click any node</p>
          <p style={s.emptyText}>
            to jump to its definition<br/>in the source file
          </p>
        </div>
      )}
    </div>
  );
}

const s = {
  panel:       { display:"flex", flexDirection:"column",
                 height:"100%", background:"#1e1e2e" },
  header:      { display:"flex", alignItems:"center",
                 padding:"0 0.75rem", height:38, flexShrink:0,
                 background:"#12121a",
                 borderBottom:"1px solid var(--border)" },
  fileInfo:    { display:"flex", alignItems:"center",
                 gap:8, overflow:"hidden", width:"100%" },
  dot:         { width:8, height:8, borderRadius:"50%",
                 background:"var(--amber)", flexShrink:0 },
  filename:    { fontSize:11, fontFamily:"var(--font-mono)",
                 color:"var(--text)", overflow:"hidden",
                 textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 },
  lineTag:     { fontSize:10, color:"var(--amber)",
                 fontFamily:"var(--font-mono)", flexShrink:0,
                 background:"rgba(255,184,0,0.12)",
                 padding:"1px 6px", borderRadius:4 },
  placeholder: { fontSize:11, color:"var(--muted)",
                 fontFamily:"var(--font-mono)" },
  empty:       { flex:1, display:"flex", flexDirection:"column",
                 alignItems:"center", justifyContent:"center",
                 gap:8 },
  emptyIcon:   { fontSize:36, color:"var(--border)",
                 fontFamily:"var(--font-mono)", fontWeight:700 },
  emptyTitle:  { fontSize:13, color:"var(--muted)",
                 fontFamily:"var(--font-head)", fontWeight:600 },
  emptyText:   { fontSize:11, color:"var(--muted)", textAlign:"center",
                 lineHeight:1.8, fontFamily:"var(--font-mono)" },
};