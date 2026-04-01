import { useState, useRef } from "react";
import { useNavigate }       from "react-router-dom";
import "./UploadBox.css";
import Button from "../Shared/Button.jsx";
import API    from "../../api.js";

export default function UploadBox() {
  const [dragging, setDragging] = useState(false);
  const [file,     setFile]     = useState(null);
  const [status,   setStatus]   = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const inputRef  = useRef(null);
  const navigate  = useNavigate();

  // ── Drag events ────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true);  };
  const onDragLeave = (e) => { e.preventDefault(); setDragging(false); };
  const onDrop      = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  };

  // ── File input change ──────────────────────────────────────
  const onFileChange = (e) => {
    const picked = e.target.files[0];
    if (picked) validateAndSet(picked);
  };

  const validateAndSet = (f) => {
    setError("");
    if (!f.name.endsWith(".zip")) {
      setError("Only .zip files are supported.");
      setFile(null);
      return;
    }
    setFile(f);
    setStatus(f.name);
  };

  // ── Upload ─────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a .zip file first.");
      return;
    }

    setLoading(true);
    setError("");
    setStatus("Analyzing… this may take a moment.");

    const fd = new FormData();
    fd.append("file", file);

    try {
      await API.post("/analyze", fd);
      setStatus("Done! Redirecting…");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      const msg = err.response?.data?.detail;
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError(msg || "Upload failed. Please try again.");
      }
      setLoading(false);
    }
  };

  // ── Click the hidden input ─────────────────────────────────
  const openPicker = () => inputRef.current?.click();

  return (
    <div className="box_main">

      <div className="text_box">
        <h2>Upload Source Code</h2>
        <p>
          Upload your codebase to explore its logic visually,
          trace execution paths, and understand how everything
          fits together.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`drop_zone ${dragging ? "dragging" : ""} ${file ? "has_file" : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openPicker}
      >
        {/* Hidden real input */}
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          onChange={onFileChange}
          style={{ display: "none" }}
        />

        {file ? (
          <>
            <span className="drop_icon">📦</span>
            <span className="drop_filename">{file.name}</span>
            <span className="drop_sub">Click to change file</span>
          </>
        ) : (
          <>
            <span className="drop_icon">⬆</span>
            <span className="drop_label">
              Drag & drop your <strong>.zip</strong> here
            </span>
            <span className="drop_sub">or click to browse</span>
          </>
        )}
      </div>

      {/* Status / error */}
      {status && !error && (
        <p className="upload_status">{status}</p>
      )}
      {error && (
        <p className="upload_error">{error}</p>
      )}

      {/* Upload button */}
      <div className="input_box">
        <Button
          text={loading ? "Analyzing…" : "Upload & Analyze"}
          onClick={handleUpload}
          disabled={loading}
        />
      </div>

    </div>
  );
}