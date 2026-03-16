import { useState, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [projects, setProjects]     = useState([]);
  const [graphData, setGraphData]   = useState(null);  // current graph shown
  const [graphType, setGraphType]   = useState("call_graph");
  const [status, setStatus]         = useState("");
  const [selectedNode, setSelected] = useState(null);
  const [note, setNote]             = useState("");
  const navigate                    = useNavigate();

  // Load projects on page open
  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch {
      navigate("/login");   // token expired → back to login
    }
  };

  // Upload zip and analyze
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus("Analyzing... please wait");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await API.post("/analyze", formData);
      setStatus("Done!");
      showGraph(res.data);          // show graph immediately
      loadProjects();               // refresh project list
    } catch (err) {
      setStatus("Error: " + (err.response?.data?.detail || "upload failed"));
    }
  };

  // Load a past analysis
  const loadAnalysis = async (projectId) => {
    const res = await API.get(`/projects/${projectId}/analyses`);
    if (res.data.length > 0) showGraph(res.data[0]);
  };

  const showGraph = (analysis) => {
    setGraphData(analysis);
    setSelected(null);
  };

  // What graph to display right now
  const currentElements = graphData
    ? (graphType === "call_graph" ? graphData.call_graph : graphData.dep_graph)
    : null;

  // Save annotation on selected node
  const saveNote = async () => {
    if (!selectedNode || !graphData) return;
    await API.post(`/analyses/${graphData.id}/annotations`, {
      node_id: selectedNode,
      note: note,
      color: "#FFD700",
    });
    setNote("");
    setStatus(`Note saved on "${selectedNode}"`);
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.page}>
      {/* ── Sidebar ── */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>CodeAnalyzer</h2>

        {/* Upload */}
        <div style={styles.section}>
          <p style={styles.label}>Upload Project (.zip)</p>
          <input type="file" accept=".zip" onChange={handleUpload}
                 style={styles.fileInput} />
          {status && <p style={styles.status}>{status}</p>}
        </div>

        {/* Past projects */}
        <div style={styles.section}>
          <p style={styles.label}>Past Projects</p>
          {projects.length === 0 && <p style={styles.muted}>No projects yet</p>}
          {projects.map(p => (
            <div key={p.id} style={styles.projectItem}
                 onClick={() => loadAnalysis(p.id)}>
              📁 {p.name}
            </div>
          ))}
        </div>

        {/* Graph type toggle */}
        {graphData && (
          <div style={styles.section}>
            <p style={styles.label}>Graph Type</p>
            <button style={graphType==="call_graph" ? styles.activeBtn : styles.btn}
                    onClick={() => setGraphType("call_graph")}>
              Call Graph
            </button>
            <button style={graphType==="dep_graph" ? styles.activeBtn : styles.btn}
                    onClick={() => setGraphType("dep_graph")}>
              Dependency
            </button>
          </div>
        )}

        {/* Annotation panel */}
        {selectedNode && (
          <div style={styles.section}>
            <p style={styles.label}>Note on: <b>{selectedNode}</b></p>
            <textarea style={styles.textarea} value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Add a note..." />
            <button style={styles.saveBtn} onClick={saveNote}>Save Note</button>
          </div>
        )}

        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </div>

      {/* ── Graph Area ── */}
      <div style={styles.main}>
        {!currentElements ? (
          <div style={styles.empty}>
            <h3>Upload a .zip of your project to see the graph</h3>
            <p>Supports Python, C, C++, JavaScript</p>
          </div>
        ) : (
          <CytoscapeComponent
            elements={currentElements.nodes.concat(currentElements.edges)}
            style={{ width: "100%", height: "100%" }}
            layout={{ name: "breadthfirst", directed: true, padding: 20 }}
            stylesheet={cytoscapeStyle}
            cy={(cy) => {
              // When user clicks a node, show it in sidebar
              cy.on("tap", "node", (evt) => {
                setSelected(evt.target.id());
              });
            }}
          />
        )}
      </div>
    </div>
  );
}

// Cytoscape node/edge visual styles
const cytoscapeStyle = [
  {
    selector: "node",
    style: {
      label: "data(id)",
      "background-color": "#4f46e5",
      color: "#fff",
      "font-size": "10px",
      "text-valign": "center",
      "text-halign": "center",
      width: 60, height: 60,
    },
  },
  {
    selector: 'node[type = "class"]',
    style: { "background-color": "#10b981" },
  },
  {
    selector: 'node[type = "method"]',
    style: { "background-color": "#f59e0b" },
  },
  {
    selector: "edge",
    style: {
      width: 2,
      "line-color": "#94a3b8",
      "target-arrow-color": "#94a3b8",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
    },
  },
];

const styles = {
  page:        { display:"flex", height:"100vh", fontFamily:"sans-serif" },
  sidebar:     { width:"280px", background:"#1e1e2e", color:"white",
                 padding:"1.5rem", overflowY:"auto", flexShrink:0 },
  main:        { flex:1, background:"#f8fafc" },
  logo:        { marginBottom:"2rem", color:"#a78bfa" },
  section:     { marginBottom:"1.5rem" },
  label:       { fontSize:"0.75rem", color:"#94a3b8",
                 textTransform:"uppercase", marginBottom:"0.5rem" },
  fileInput:   { color:"white", fontSize:"0.85rem" },
  status:      { color:"#86efac", fontSize:"0.8rem", marginTop:"0.5rem" },
  muted:       { color:"#64748b", fontSize:"0.85rem" },
  projectItem: { padding:"0.5rem", borderRadius:"4px", cursor:"pointer",
                 marginBottom:"0.25rem", background:"#2d2d3f",
                 fontSize:"0.85rem",
                 ":hover":{ background:"#3d3d4f" } },
  btn:         { display:"block", width:"100%", padding:"0.4rem",
                 marginBottom:"0.5rem", background:"#2d2d3f",
                 color:"white", border:"none", borderRadius:"4px",
                 cursor:"pointer" },
  activeBtn:   { display:"block", width:"100%", padding:"0.4rem",
                 marginBottom:"0.5rem", background:"#4f46e5",
                 color:"white", border:"none", borderRadius:"4px",
                 cursor:"pointer" },
  textarea:    { width:"100%", height:"80px", background:"#2d2d3f",
                 color:"white", border:"1px solid #4b5563",
                 borderRadius:"4px", padding:"0.5rem",
                 boxSizing:"border-box" },
  saveBtn:     { marginTop:"0.5rem", padding:"0.4rem 1rem",
                 background:"#10b981", color:"white",
                 border:"none", borderRadius:"4px", cursor:"pointer" },
  logoutBtn:   { position:"absolute", bottom:"1rem", padding:"0.4rem 1rem",
                 background:"#ef4444", color:"white",
                 border:"none", borderRadius:"4px", cursor:"pointer" },
  empty:       { display:"flex", flexDirection:"column",
                 alignItems:"center", justifyContent:"center",
                 height:"100%", color:"#94a3b8" },
};