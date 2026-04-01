import { useState, useEffect, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape      from "cytoscape";
import dagre          from "cytoscape-dagre";
import API from "../api";
import CodeViewer from "../components/CodeViewer";
import { fetchFileCode } from "../api";
import { useNavigate, Link} from "react-router-dom";
import logo from "../sources/logo.svg"

// ── Node type colors ──────────────────────────────────────
const TYPE_COLOR = {
  function: "#00e5ff",
  class:    "#00ffa3",
  method:   "#ffb800",
  file:     "#7c3aed",
};

const TYPE_LABEL = {
  function: "FN",
  class:    "CLS",
  method:   "MTH",
  file:     "FILE",
};

// ── Cytoscape stylesheet ──────────────────────────────────
const CY_STYLE = [
  {
    selector: "node",
    style: {
      shape:                "roundrectangle",
      "background-color":   "data(color)",
      "border-width":       2,
      "border-color":       "data(borderColor)",

      // ── Text fixes ──────────────────────────────
      label:                "data(id)",      // show the node id as label
      color:                "#000000",       // white text — visible on all colors
      "font-size":          "20px",
      "font-family":        "JetBrains Mono, monospace",
      "font-weight":        "600",
      "text-valign":        "center",
      "text-halign":        "center",
      "text-wrap":          "wrap",
      "text-max-width":     "190px",
      "text-overflow-wrap": "anywhere",
      // ─────────────────────────────────────────────

      width:                200,
      height:               50,
      "transition-property": "border-color, border-width",
      "transition-duration": "0.2s",
    },
  },
  {
    selector: "node:selected",
    style: {
      "border-color":  "#ffffff",
      "border-width":  3,
      "font-weight":   "800",
    },
  },
  {
    selector: "node.highlighted",
    style: {
      "border-color":  "#ffffff",
      "border-width":  3,
      "font-size":     "22px",
      opacity:         1,
    },
  },
  {
    selector: "node.faded",
    style: { opacity: 0.15 },
  },
  {
    selector: "edge",
    style: {
      width:                 2,
      "line-color":          "#4a4a6a",
      "target-arrow-color":  "#4a4a6a",
      "target-arrow-shape":  "triangle",
      "curve-style":         "taxi",
      "taxi-direction":      "downward",
      "taxi-turn":           "50%",
      opacity:               0.9,
    },
  },
  {
    selector: "edge.highlighted",
    style: {
      "line-color":          "#00e5ff",
      "target-arrow-color":  "#00e5ff",
      width:                  3,
      opacity:                1,
    },
  },
  {
    selector: "edge.faded",
    style: { opacity: 0.04 },
  },
];

cytoscape.use(dagre); 

export default function Dashboard() {
  const [projects, setProjects]       = useState([]);
  const [analyses, setAnalyses]       = useState([]);
  const [activeAnalysis, setActive]   = useState(null);
  const [graphType, setGraphType]     = useState("call_graph");
  const [selectedNode, setSelected]   = useState(null);
  const [note, setNote]               = useState("");
  const [annotations, setAnnotations] = useState([]);
  const [status, setStatus]           = useState("");
  const [statusType, setStatusType]   = useState("info"); // info | error | success
  const [sideTab, setSideTab]         = useState("projects"); // projects | node
  const [searchTerm, setSearch]       = useState("");
  const cyRef = useRef(null);
  const navigate = useNavigate();

  const [codeContent, setCodeContent]   = useState("");
  const [codeFile, setCodeFile]         = useState("");
  const [codeLine, setCodeLine]         = useState(null);
  const [showCode, setShowCode]         = useState(false);
  

  useEffect(() => { loadProjects(); }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (cy) {
      // Ensure Cytoscape resizes to final container dimensions
      cy.resize();
      // Reset viewport to (0, 0) zoom level 1, then fit to graph
      cy.pan({ x: 0, y: 0 });
      cy.zoom(1.5);
      cy.fit(undefined, 40);
    }
  }, [activeAnalysis, graphType, searchTerm]);

  const notify = (msg, type = "info") => {
    setStatus(msg); setStatusType(type);
    setTimeout(() => setStatus(""), 3000);
  };

  const loadProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch { navigate("/login"); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    notify("Analyzing project…", "info");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await API.post("/analyze", fd);
      notify("Analysis complete!", "success");
      setActive(res.data);
      setGraphType("call_graph");
      setSelected(null);
      loadProjects();
    } catch (err) {
      notify(err.response?.data?.detail || "Upload failed", "error");
    }
    e.target.value = "";
  };

  const handleDeleteProject = async (projectId, projectName) => {
  // Ask user to confirm before deleting
  const confirmed = window.confirm(
    `Delete "${projectName}"?\n\nThis will also delete all its analyses. This cannot be undone.`
  );
  if (!confirmed) return;

  try {
    await API.delete(`/projects/${projectId}`);
    notify(`"${projectName}" deleted`, "success");

    // If deleted project was currently open, clear the view
    if (activeAnalysis?.project_id === projectId) {
      setActive(null);
      setCodeContent("");
      setCodeFile("");
      setCodeLine(null);
      setSelected(null);
    }

    // Refresh project list
    await loadProjects();
  } catch (err) {
    notify(err.response?.data?.detail || "Delete failed", "error");
  }
};

  const loadAnalysis = async (projectId) => {
    try {
      const res = await API.get(`/projects/${projectId}/analyses`);
      if (res.data.length > 0) {
        setActive(res.data[0]);
        setAnalyses(res.data);
        setGraphType("call_graph");
        setSelected(null);
        setSideTab("projects");
        notify("Project loaded", "success");
      }
    } catch { notify("Failed to load", "error"); }
  };

  // When a node is clicked — highlight its neighborhood
  const handleNodeClick = async (nodeId) => {
  setSelected(nodeId);
  setSideTab("node");
  setNote("");

  // Load annotations for this node
  if (activeAnalysis) {
    try {
      const res = await API.get(`/analyses/${activeAnalysis.id}/annotations`);
      const ann = res.data.find(a => a.node_id === nodeId);
      if (ann) setNote(ann.note);
      setAnnotations(res.data);
    } catch {}
  }

  // Highlight neighborhood in graph
  const cy = cyRef.current;
  if (cy) {
    cy.elements().removeClass("highlighted faded");
    const node         = cy.$(`#${CSS.escape(nodeId)}`);
    const neighborhood = node.closedNeighborhood();
    neighborhood.addClass("highlighted");
    cy.elements().not(neighborhood).addClass("faded");
  }

  // ── Fetch source file for this node ──────────────────────
  if (!activeAnalysis) return;
  const nodeEl = elements.find(e => e.data.id === nodeId);
  const file   = nodeEl?.data?.file;
  const line   = nodeEl?.data?.line;

  if (file) {
    try {
      const { fetchFileCode } = await import("../api");
      const code = await fetchFileCode(activeAnalysis.id, file);
      setCodeContent(code);
      setCodeFile(file);
      setCodeLine(line || null);
    } catch (err) {
      console.error("Could not load file:", err);
      setCodeContent("// Could not load file: " + file);
      setCodeFile(file);
      setCodeLine(null);
    }
  }
};

  const clearHighlight = () => {
    const cy = cyRef.current;
    if (cy) cy.elements().removeClass("highlighted faded");
    setSelected(null);
    setSideTab("projects");
  };

  const fitGraph = () => {
    const cy = cyRef.current;
    if (cy) cy.fit(undefined, 40);
  };

  const saveNote = async () => {
    if (!selectedNode || !activeAnalysis) return;
    try {
      await API.post(`/analyses/${activeAnalysis.id}/annotations`, {
        node_id: selectedNode, note, color: "#00e5ff",
      });
      notify("Note saved", "success");
    } catch { notify("Save failed", "error"); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Build elements with colors injected
  const buildElements = () => {
  if (!activeAnalysis) return [];
  const graph = activeAnalysis[graphType];
  if (!graph) return [];

  // Find which nodes have NO incoming edges — these are entry points
  const hasIncoming = new Set(
    (graph.edges || []).map(e => e.data.target)
  );

  const nodes = (graph.nodes || [])
    .filter(n => !searchTerm ||
      n.data.id.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(n => {
      const isEntry = !hasIncoming.has(n.data.id);
      return {
        data: {
          ...n.data,
          color:       TYPE_COLOR[n.data.type] || "#5a5a7a",
          borderColor: isEntry ? "#ffffff" : (TYPE_COLOR[n.data.type] || "#5a5a7a"),
        }
      };
    });

  const nodeIds = new Set(nodes.map(n => n.data.id));
  const edges = (graph.edges || [])
    .filter(e => nodeIds.has(e.data.source) && nodeIds.has(e.data.target))
    .map(e => ({ data: e.data }));

  return [...nodes, ...edges];
};

  const elements    = buildElements();
  const nodeCount   = elements.filter(e => !e.data.source).length;
  const edgeCount   = elements.filter(e =>  e.data.source).length;

  // Stats from symbol table
  const st = activeAnalysis?.symbol_table;
  const stats = st ? {
    functions: Object.keys(st.functions || {}).length,
    classes:   Object.keys(st.classes   || {}).length,
    methods:   Object.values(st.classes || {})
                     .reduce((a,c) => a + Object.keys(c.methods||{}).length, 0),
  } : null;

  return (
    <div style={layout.root}>

      {/* ══ LEFT SIDEBAR ══════════════════════════════════════ */}
      <aside style={layout.sidebar}>

        {/* Logo */}
        <Link to = "/Home">
          <div style={ui.logo}>
            <img src= {logo} alt="logo" width="150px" />
          </div>
        </Link>

        {/* Upload */}
        <label style={ui.uploadBtn}>
          <input type="file" accept=".zip" onChange={handleUpload}
                 style={{display:"none"}} />
          + Upload Project
        </label>

        {/* Status bar */}
        {status && (
          <div style={{...ui.statusBar,
            background: statusType==="error"  ? "rgba(255,68,102,0.1)"  :
                        statusType==="success" ? "rgba(0,255,163,0.1)"  :
                                                 "rgba(0,229,255,0.1)",
            borderColor: statusType==="error"  ? "var(--red)"   :
                         statusType==="success" ? "var(--green)" :
                                                  "var(--accent)",
            color:       statusType==="error"  ? "var(--red)"   :
                         statusType==="success" ? "var(--green)" :
                                                  "var(--accent)",
          }}>
            {status}
          </div>
        )}

        {/* Tabs */}
        <div style={ui.tabs}>
          {["projects", "node"].map(t => (
            <button key={t} onClick={() => setSideTab(t)}
                    style={{...ui.tab, ...(sideTab===t ? ui.tabActive : {})}}>
              {t === "projects" ? "Projects" : "Inspector"}
            </button>
          ))}
        </div>

        {/* ── Projects tab ── */}
        {sideTab === "projects" && (
  <div style={ui.tabContent}>
    {projects.length === 0
      ? <p style={ui.muted}>No projects yet. Upload a .zip</p>
      : projects.map(p => (
          <div key={p.id}
               style={{
                 ...ui.projectRow,
                 ...(activeAnalysis?.project_id === p.id
                     ? ui.projectRowActive : {}),
               }}>

            {/* Click name area to load */}
            <div style={ui.projectClickArea}
                 onClick={() => loadAnalysis(p.id)}>
              <span style={ui.projectIcon}>◈</span>
              <div style={{overflow:"hidden"}}>
                <div style={ui.projectName} title={p.name}>{p.name}</div>
                <div style={ui.projectDate}>
                  {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Delete button */}
            <button
              style={ui.deleteBtn}
              title="Delete project"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProject(p.id, p.name);
              }}>
              ✕
            </button>

          </div>
        ))
    }
  </div>
)}

        {/* ── Node inspector tab ── */}
        {sideTab === "node" && (
          <div style={ui.tabContent}>
            {!selectedNode
              ? <p style={ui.muted}>Click any node in the graph to inspect it.</p>
              : (
                <>
                  <div style={ui.nodeCard}>
                    <div style={{
                      ...ui.nodeTypeBadge,
                      background: TYPE_COLOR[
                        elements.find(e=>e.data.id===selectedNode)?.data?.type
                      ] || "#5a5a7a",
                    }}>
                      {elements.find(e=>e.data.id===selectedNode)?.data?.type?.toUpperCase()}
                    </div>
                    <div style={ui.nodeName}>{selectedNode}</div>
                    {(() => {
                      const el = elements.find(e=>e.data.id===selectedNode);
                      return el?.data?.file
                        ? <div style={ui.nodeMeta}>
                            📄 {el.data.file}
                            {el.data.line ? ` : ${el.data.line}` : ""}
                          </div>
                        : null;
                    })()}
                  </div>

                  <label style={ui.label}>ANNOTATION</label>
                  <textarea
                    style={ui.textarea}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add notes about this node…"
                  />
                  <button style={ui.saveBtn} onClick={saveNote}>
                    Save Note
                  </button>
                  <button style={ui.clearBtn} onClick={clearHighlight}>
                    Clear Selection
                  </button>
                </>
              )
            }
          </div>
        )}

        {/* Logout */}
        <button style={ui.logoutBtn} onClick={logout}>Sign Out</button>
      </aside>

      {/* ══ MAIN AREA ════════════════════════════════════════ */}
      <main style={layout.main}>

  {/* ── Top toolbar ── */}
  <div style={toolbar.bar}>
    <div style={toolbar.group}>
      {[
        ["call_graph", "Call Graph"],
        ["dep_graph",  "Dependencies"],
      ].map(([key, label]) => (
        <button key={key}
                style={{...toolbar.btn,
                  ...(graphType===key ? toolbar.btnActive : {})}}
                onClick={() => { setGraphType(key); clearHighlight(); }}>
          {label}
        </button>
      ))}
    </div>

    <input
      style={toolbar.search}
      placeholder="Search nodes…"
      value={searchTerm}
      onChange={e => setSearch(e.target.value)}
    />

    <div style={toolbar.group}>
      {activeAnalysis && (
        <div style={toolbar.stats}>
          <span style={{color:"var(--accent)"}}>⬡ {nodeCount} nodes</span>
          <span style={{color:"var(--muted)", margin:"0 8px"}}>|</span>
          <span style={{color:"var(--muted)"}}>→ {edgeCount} edges</span>
        </div>
      )}
      <button style={toolbar.btn} onClick={fitGraph} title="Fit graph">⊞ Fit</button>
    </div>
  </div>

  {/* ── Legend ── */}
  {activeAnalysis && (
    <div style={legend.bar}>
      {Object.entries(TYPE_COLOR).map(([type, color]) => (
        <div key={type} style={legend.item}>
          <div style={{...legend.dot, background: color}} />
          <span>{type}</span>
        </div>
      ))}
      {stats && (
        <div style={legend.statGroup}>
          <span style={legend.stat}>
            <b style={{color:"var(--accent)"}}>{stats.functions}</b> functions
          </span>
          <span style={legend.stat}>
            <b style={{color:"var(--green)"}}>{stats.classes}</b> classes
          </span>
          <span style={legend.stat}>
            <b style={{color:"var(--amber)"}}>{stats.methods}</b> methods
          </span>
        </div>
      )}
    </div>
  )}

  {/* ── Split area: Code viewer (always visible) + Graph ── */}
  <div style={layout.splitArea}>

    {/* Code panel — always visible */}
    <div style={layout.codePanel}>
      <CodeViewer
        code={codeContent}
        filename={codeFile}
        targetLine={codeLine}
      />
    </div>

    {/* Graph canvas */}
    <div style={layout.canvas}>
      {!activeAnalysis ? (
        <div style={empty.box}>
          <div style={empty.icon}>⬡</div>
          <h2 style={empty.title}>No project loaded</h2>
          <p style={empty.sub}>
            Upload a <code>.zip</code> of your Python, C, C++ or JS project
          </p>
        </div>
      ) : elements.length === 0 ? (
        <div style={empty.box}>
          <div style={empty.icon}>∅</div>
          <h2 style={empty.title}>No user-defined symbols found</h2>
          <p style={empty.sub}>
            {searchTerm
              ? `No nodes match "${searchTerm}"`
              : "The analyzer found no functions, classes or methods"}
          </p>
        </div>
      ) : (
        <CytoscapeComponent
          key={`${activeAnalysis.id}-${graphType}-${searchTerm}`}
          elements={elements}
          style={{ width:"100", height:"100%" }}
          layout={{
            name:             "dagre",       // directed acyclic graph — top to bottom
            rankDir:          "TB",          // TB = Top to Bottom
            ranker:           "longest-path",// puts main/entry functions at the top
            nodeSep:          60,            // horizontal space between nodes
            rankSep:          80,            // vertical space between ranks
            edgeSep:          20,
            padding:          40,
            animate:          true,
            animationDuration:500,
            fit:              true,
          }}
          stylesheet={CY_STYLE}
          cy={(cy) => {
            cyRef.current = cy;
            cy.on("tap", "node", (evt) => {
              handleNodeClick(evt.target.id());
            });
            cy.on("tap", (evt) => {
              if (evt.target === cy) clearHighlight();
            });
          }}
        />
      )}
    </div>
  </div>
</main>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────
const layout = {
  root:      { display:"flex", height:"100vh", overflow:"hidden",
               background:"var(--bg)" },
  sidebar:   { width:260, background:"var(--surface)",
               borderRight:"1px solid var(--border)",
               display:"flex", flexDirection:"column",
               padding:"1.25rem", gap:"0.75rem",
               overflow:"hidden", flexShrink:0 },
  main:      { flex:1, width:"100%", display:"flex", flexDirection:"column",
               overflow:"hidden" },
  splitArea: { flex:1, display:"flex", overflow:"hidden", gap:0, margin:0, padding:0 },

  // Code panel — always visible, fixed width, resizable feel
  codePanel: { flex: "0 0 40%", width:"100%", minWidth:280, maxWidth:700,
               borderRight:"1px solid var(--border)",
               display:"flex", flexDirection:"column",
               overflow:"hidden", background:"#1e1e2e" },

  canvas:    { flex:"1 1 60%", minWidth:0, overflow:"hidden" }
};
const ui = {
  logo:        { fontFamily:"var(--font-head)", fontSize:18, fontWeight:800,
                 letterSpacing:1, paddingBottom:"1rem",
                 borderBottom:"1px solid var(--border)", marginBottom:"0.25rem" },
  uploadBtn:   { display:"block", padding:"0.6rem",
                 background:"linear-gradient(135deg,var(--accent2),#4f46e5)",
                 color:"white", borderRadius:8, textAlign:"center",
                 cursor:"pointer", fontFamily:"var(--font-head)",
                 fontWeight:700, fontSize:12, letterSpacing:1,
                 transition:"opacity 0.2s", userSelect:"none" },
  statusBar:   { padding:"0.5rem 0.75rem", borderRadius:6,
                 border:"1px solid", fontSize:11,
                 animation:"fadeUp 0.3s ease" },
  tabs:        { display:"flex", gap:4, marginTop:"0.25rem" },
  tab:         { flex:1, padding:"0.4rem", background:"var(--surface2)",
                 border:"1px solid var(--border)", borderRadius:6,
                 color:"var(--muted)", cursor:"pointer",
                 fontFamily:"var(--font-mono)", fontSize:11 },
  tabActive:   { background:"var(--surface2)", borderColor:"var(--accent)",
                 color:"var(--accent)" },
  tabContent:  { flex:1, overflowY:"auto", paddingTop:"0.5rem" },
  muted:       { color:"var(--muted)", fontSize:11,
                 lineHeight:1.6, marginTop:"0.5rem" },
  projectRow:  { display:"flex", alignItems:"center", gap:10,
                 padding:"0.6rem 0.5rem", borderRadius:8, cursor:"pointer",
                 marginBottom:4, border:"1px solid transparent",
                 transition:"background 0.15s" },
  projectRowActive: { background:"var(--surface2)",
                      borderColor:"var(--border)" },
  projectIcon: { color:"var(--accent)", fontSize:16 },
  projectName: { fontSize:12, fontWeight:500,
                 whiteSpace:"nowrap", overflow:"hidden",
                 textOverflow:"ellipsis", maxWidth:160 },
  projectDate: { fontSize:10, color:"var(--muted)", marginTop:2 },
  nodeCard:    { background:"var(--surface2)", border:"1px solid var(--border)",
                 borderRadius:10, padding:"0.75rem", marginBottom:"0.75rem" },
  nodeTypeBadge: { display:"inline-block", padding:"2px 8px",
                   borderRadius:4, fontSize:9, fontWeight:700,
                   color:"var(--bg)", letterSpacing:1, marginBottom:6 },
  nodeName:    { fontSize:13, fontWeight:600, wordBreak:"break-all",
                 fontFamily:"var(--font-mono)" },
  nodeMeta:    { fontSize:10, color:"var(--muted)", marginTop:4 },
  label:       { display:"block", fontSize:9, letterSpacing:2,
                 color:"var(--muted)", marginBottom:6, marginTop:4 },
  textarea:    { width:"100%", height:90, background:"var(--surface2)",
                 border:"1px solid var(--border)", borderRadius:8,
                 padding:"0.6rem", color:"var(--text)",
                 fontFamily:"var(--font-mono)", fontSize:11,
                 resize:"vertical", outline:"none" },
  saveBtn:     { width:"100%", marginTop:6, padding:"0.5rem",
                 background:"var(--accent)", color:"var(--bg)",
                 border:"none", borderRadius:6, cursor:"pointer",
                 fontFamily:"var(--font-head)", fontWeight:700,
                 fontSize:11, letterSpacing:1 },
  clearBtn:    { width:"100%", marginTop:4, padding:"0.4rem",
                 background:"transparent", color:"var(--muted)",
                 border:"1px solid var(--border)", borderRadius:6,
                 cursor:"pointer", fontFamily:"var(--font-mono)", fontSize:11 },
  logoutBtn:   { marginTop:"auto", padding:"0.5rem",
                 background:"transparent", color:"var(--muted)",
                 border:"1px solid var(--border)", borderRadius:6,
                 cursor:"pointer", fontFamily:"var(--font-mono)", fontSize:11 },

  projectClickArea: { display:"flex", alignItems:"center", gap:10,
                      flex:1, overflow:"hidden", cursor:"pointer" },

  deleteBtn:        { background:"transparent",
                      border:"1px solid transparent",
                      color:"var(--muted)", cursor:"pointer",
                      fontSize:11, padding:"3px 6px",
                      borderRadius:4, flexShrink:0,
                      transition:"all 0.15s",
                      lineHeight:1,
                      ":hover":{ color:"var(--red)",
                                borderColor:"var(--red)" } },
};

const toolbar = {
  bar:       { display:"flex", alignItems:"center", gap:12,
               padding:"0.75rem 1.25rem",
               borderBottom:"1px solid var(--border)",
               background:"var(--surface)", flexShrink:0 },
  group:     { display:"flex", alignItems:"center", gap:6 },
  btn:       { padding:"0.35rem 0.75rem",
               background:"var(--surface2)",
               border:"1px solid var(--border)", borderRadius:6,
               color:"var(--muted)", cursor:"pointer",
               fontFamily:"var(--font-mono)", fontSize:11,
               transition:"all 0.15s" },
  btnActive: { borderColor:"var(--accent)", color:"var(--accent)",
               background:"rgba(0,229,255,0.08)" },
  search:    { flex:1, maxWidth:280, padding:"0.35rem 0.75rem",
               background:"var(--surface2)", border:"1px solid var(--border)",
               borderRadius:6, color:"var(--text)",
               fontFamily:"var(--font-mono)", fontSize:11, outline:"none" },
  stats:     { display:"flex", alignItems:"center",
               fontSize:11, fontFamily:"var(--font-mono)" },
};

const legend = {
  bar:       { display:"flex", alignItems:"center", gap:20, flexWrap:"wrap",
               padding:"0.5rem 1.25rem",
               borderBottom:"1px solid var(--border)",
               background:"var(--surface)", flexShrink:0 },
  item:      { display:"flex", alignItems:"center", gap:6,
               fontSize:10, color:"var(--muted)" },
  dot:       { width:10, height:10, borderRadius:"50%" },
  statGroup: { marginLeft:"auto", display:"flex", gap:16 },
  stat:      { fontSize:10, color:"var(--muted)" },
};

const empty = {
  box:   { display:"flex", flexDirection:"column", alignItems:"center",
           justifyContent:"center", height:"100%", gap:12 },
  icon:  { fontSize:64, color:"var(--border)" },
  title: { fontFamily:"var(--font-head)", fontSize:20,
           color:"var(--muted)", fontWeight:600 },
  sub:   { color:"var(--muted)", fontSize:12, opacity:0.7 },
};