import { useState, useRef, useEffect, useCallback } from 'react';
import GraphPanel from './GraphPanel.jsx';
import CodeViewer from './CodeViewer.jsx';

const TYPE_COLOR = {
  function: '#00e5ff',
  class:    '#00ffa3',
  method:   '#ffb800',
  file:     '#7c3aed',
};

function extractSnippet(fullCode, startLine, maxLines = 60) {
  if (!fullCode || !startLine) return fullCode || '';
  const lines = fullCode.split('\n');
  const start = Math.max(0, startLine - 1);
  const end   = Math.min(lines.length, start + maxLines);
  return lines.slice(start, end).join('\n');
}

// ── Tiny AI summary component ─────────────────────────────
function AiSummary({ loading, summary }) {
  if (!loading && !summary) return null;
  return (
    <div className="ai-summary-box">
      {loading ? (
        <div className="ai-summary-loading">
          <span style={{ color: 'var(--accent)', fontSize: 10, letterSpacing: '0.05em' }}>AI THINKING</span>
          <div className="ai-dot-pulse">
            <span /><span /><span />
          </div>
        </div>
      ) : (
        <span style={{ whiteSpace: 'pre-wrap' }}>{summary}</span>
      )}
    </div>
  );
}

export default function DashboardView({ result, projectName, onReset }) {
  const [graphType,    setGraphType]    = useState('call_graph');
  const [searchTerm,   setSearchTerm]   = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [note,         setNote]         = useState('');
  const [codeContent,  setCodeContent]  = useState('');
  const [codeFile,     setCodeFile]     = useState('');
  const [codeLine,     setCodeLine]     = useState(null);
  const [aiSummary,    setAiSummary]    = useState('');
  const [aiLoading,    setAiLoading]    = useState(false);
  const cyRef = useRef(null);

  // Fit graph on type/search change
  useEffect(() => {
    const cy = cyRef.current;
    if (cy) {
      cy.resize();
      cy.fit(undefined, 40);
    }
  }, [graphType, searchTerm]);

  // Build element counts
  const graph = result?.[graphType];
  const nodeCount = (graph?.nodes || []).length;
  const edgeCount = (graph?.edges || []).length;
  const st = result?.symbol_table;
  const stats = st ? {
    functions: Object.keys(st.functions || {}).length,
    classes:   Object.keys(st.classes   || {}).length,
    methods:   Object.values(st.classes  || {})
                     .reduce((a, c) => a + Object.keys(c.methods || {}).length, 0),
  } : null;

  // Collect all nodes from result for metadata lookup
  const allNodes = [
    ...(result?.call_graph?.nodes || []),
    ...(result?.dep_graph?.nodes  || []),
  ];

  const handleNodeClick = useCallback(async (nodeId) => {
    if (!nodeId) {
      // Clicked background — clear selection
      setSelectedNode(null);
      setCodeContent('');
      setCodeFile('');
      setCodeLine(null);
      setAiSummary('');
      setNote('');
      const cy = cyRef.current;
      if (cy) cy.elements().removeClass('highlighted faded');
      return;
    }

    setSelectedNode(nodeId);
    setNote('');
    setAiSummary('');
    setAiLoading(false);

    // Highlight neighborhood in graph
    const cy = cyRef.current;
    if (cy) {
      cy.elements().removeClass('highlighted faded');
      const node         = cy.$(`#${CSS.escape(nodeId)}`);
      const neighborhood = node.closedNeighborhood();
      neighborhood.addClass('highlighted');
      cy.elements().not(neighborhood).addClass('faded');
    }

    // Find node metadata from call_graph or dep_graph nodes
    const nodeEl = allNodes.find(n => n.data.id === nodeId);
    const file   = nodeEl?.data?.file;
    const line   = nodeEl?.data?.line;
    const type   = nodeEl?.data?.type || 'function';

    if (!file) return;  // no file info — nothing to show

    // Update file display immediately (so UI feels instant)
    setCodeFile(file);
    setCodeLine(line || null);

    // ── Fetch source code from backend ──────────────────────
    try {
      const res = await fetch('http://localhost:8000/api/file-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_name: projectName,
          file_path:    file,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const fullCode = data.content || '';
        setCodeContent(fullCode);

        // ── AI summary from code snippet ───────────────────
        const snippet  = extractSnippet(fullCode, line);
        const cacheKey = `ai:${projectName}:${nodeId}`;
        const cached   = sessionStorage.getItem(cacheKey);

        if (cached) {
          setAiSummary(cached);
        } else {
          setAiLoading(true);
          try {
            const aiRes = await fetch('http://localhost:8000/api/explain', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ node_id: nodeId, snippet, type }),
            });
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              const summary = aiData.summary || aiData.explanation || '';
              setAiSummary(summary);
              if (summary) sessionStorage.setItem(cacheKey, summary);
            }
          } catch { /* AI is optional — silently skip */ }
          finally { setAiLoading(false); }
        }
      } else {
        setCodeContent(`// Could not load file: ${file}\n// Status: ${res.status}`);
      }
    } catch (err) {
      console.error('File fetch error:', err);
      setCodeContent(`// Network error loading: ${file}`);
    }
  }, [allNodes, projectName]);

  const fitGraph = () => {
    const cy = cyRef.current;
    if (cy) cy.fit(undefined, 40);
  };

  const selectedNodeEl = selectedNode
    ? allNodes.find(n => n.data.id === selectedNode)
    : null;

  return (
    <div className="dashboard anim-fade-in">

      {/* ── Top bar ── */}
      <div className="dash-topbar">
        <div className="dash-topbar-left">
          <div className="dash-project-badge">
            <div className="dash-project-badge-dot" />
            <span>{projectName}</span>
          </div>
        </div>

        <div className="dash-graph-tabs">
          {[['call_graph', 'Call Graph'], ['dep_graph', 'Dependencies']].map(([key, label]) => (
            <button
              key={key}
              className={`dash-tab-btn${graphType === key ? ' active' : ''}`}
              onClick={() => { setGraphType(key); setSelectedNode(null); }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          className="graph-search"
          style={{ position: 'static', transform: 'none', width: 180 }}
          placeholder="Search nodes…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <div className="dash-stats">
          <span className="dash-stat-chip"><b>{nodeCount}</b> nodes</span>
          <span className="dash-stat-chip"><b>{edgeCount}</b> edges</span>
          {stats && <>
            <span className="dash-stat-chip"><b>{stats.functions}</b> fn</span>
            <span className="dash-stat-chip green"><b>{stats.classes}</b> cls</span>
            <span className="dash-stat-chip amber"><b>{stats.methods}</b> mth</span>
          </>}
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button className="dash-fit-btn" onClick={fitGraph}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
            Fit
          </button>
          <button className="dash-reset-btn" onClick={onReset} title="Upload another project">
            ✕ Close
          </button>
        </div>
      </div>

      {/* ── Legend bar ── */}
      <div className="dash-legend">
        {Object.entries(TYPE_COLOR).map(([type, color]) => (
          <div key={type} className="legend-item">
            <div className="legend-dot" style={{ background: color }} />
            <span>{type}</span>
          </div>
        ))}
        <div className="legend-item" style={{ gap: 4 }}>
          <div className="legend-dot" style={{ background: 'transparent', border: '2px solid white', borderRadius: '50%' }} />
          <span>entry point</span>
        </div>
      </div>

      {/* ── Main split ── */}
      <div className="dash-split">

        {/* ── Graph panel (left 55%) ── */}
        <div className="graph-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span className="panel-title-icon">⬡</span>
              Flow Architecture
            </div>
            <span className="panel-sub">
              {graphType === 'call_graph' ? 'call graph' : 'dependency graph'}
            </span>
          </div>
          <div className="cy-container" style={{ position: 'relative' }}>
            <GraphPanel
              result={result}
              graphType={graphType}
              searchTerm={searchTerm}
              onNodeClick={handleNodeClick}
              selectedNode={selectedNode}
              cyRef={cyRef}
            />
          </div>
        </div>

        {/* ── Right panel (code + inspector) ── */}
        <div className="right-panel">
          <div className="panel-header">
            <div className="panel-title">
              <span className="panel-title-icon">{'</>'}</span>
              What Is Inside?
            </div>
            {selectedNode && (
              <button
                style={{ background: 'transparent', border: 'none', color: 'var(--muted)',
                         cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                onClick={() => handleNodeClick(null)}
              >
                Clear
              </button>
            )}
          </div>

          {/* Node inspector */}
          {selectedNode && selectedNodeEl && (
            <div className="node-inspector">
              <div className="node-inspector-top">
                <span
                  className="node-type-badge"
                  style={{ background: TYPE_COLOR[selectedNodeEl.data.type] || '#5a5a7a' }}
                >
                  {(selectedNodeEl.data.type || 'node').toUpperCase()}
                </span>
                <span className="node-name">{selectedNode}</span>
              </div>
              {selectedNodeEl.data.file && (
                <div className="node-meta">
                  📄 {selectedNodeEl.data.file}
                  {selectedNodeEl.data.line ? ` : line ${selectedNodeEl.data.line}` : ''}
                </div>
              )}
              <AiSummary loading={aiLoading} summary={aiSummary} />
            </div>
          )}

          {/* Notes */}
          {selectedNode && (
            <div className="node-notes">
              <textarea
                className="note-textarea"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add notes about this node…"
              />
              <button
                className="note-save-btn"
                onClick={() => {
                  // Notes saved locally for now
                  const key = `note:${projectName}:${selectedNode}`;
                  localStorage.setItem(key, note);
                }}
              >
                Save
              </button>
            </div>
          )}

          {/* Code viewer */}
          <CodeViewer
            code={codeContent}
            filename={codeFile}
            targetLine={codeLine}
          />
        </div>
      </div>
    </div>
  );
}
