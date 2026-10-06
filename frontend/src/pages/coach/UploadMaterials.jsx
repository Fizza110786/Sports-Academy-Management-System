import { useState, useEffect } from "react";
import axios from "axios";
import "./UploadMaterials.css";

function UploadMaterials() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [materials, setMaterials] = useState([]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("video");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/materials?coachId=${user._id}`
      );
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle("");
    setType("video");
    setFile(null);
    setFileName("");
    setShowModal(false);
  };

  const handleUpload = async () => {
    if (!title || !file) {
      alert("Please fill all fields and select a file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("type", type);
      formData.append("coachId", user._id);
      formData.append("coachName", user.name);
      formData.append("file", file);

      await axios.post("http://localhost:5000/api/materials", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchMaterials();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/materials/${id}`);
      fetchMaterials();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = (fileUrl) => {
    window.open(`http://localhost:5000${fileUrl}`, "_blank");
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (type === "video") {
      const allowed = ["video/mp4", "video/mkv", "video/avi", "video/mov", "video/webm"];
      if (!allowed.includes(selectedFile.type)) {
        alert("Please upload a valid video file (mp4, mkv, avi, mov, webm)");
        e.target.value = "";
        return;
      }
    }

    if (type === "pdf") {
      const allowed = ["application/pdf"];
      if (!allowed.includes(selectedFile.type)) {
        alert("Please upload a valid PDF file");
        e.target.value = "";
        return;
      }
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const filteredMaterials = materials.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="materials-page">

      <div className="materials-header">
        <div>
          <h1>Training Materials</h1>
          <p>Upload and manage training resources</p>
        </div>
        <button className="upload-btn" onClick={() => setShowModal(true)}>
          ⬆ Upload Material
        </button>
      </div>

      <div className="materials-search">
        <input
          type="text"
          placeholder="Search materials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredMaterials.length === 0 ? (
        <p style={{ opacity: 0.6 }}>No materials uploaded yet</p>
      ) : (
        <div className="materials-grid">
          {filteredMaterials.map((item) => (
            <div key={item._id} className="material-card">

              <div className="material-top">
                <div className={`material-icon ${item.type}`}>
                  {item.type === "video" ? "🎥" : "📄"}
                </div>
                <div className="material-info">
                  <h4>{item.title}</h4>
                  <span>{item.coachName}</span>
                </div>
              </div>

              <div className="material-meta">
                <span>{item.size}</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="material-actions-row">
                {item.fileUrl && (
                  <button
                    className="material-download-btn"
                    onClick={() => handleOpen(item.fileUrl)}
                  >
                    {item.type === "video" ? "▶ Play" : "⬇ Download"}
                  </button>
                )}

                {/* ✅ renamed to mat-delete-btn to avoid any global conflicts */}
                <button
                  onClick={() => handleDelete(item._id)}
                  className="mat-delete-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/>
                    <path d="M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal modern-modal">

            <button className="modal-close" onClick={resetForm}>✕</button>

            <h3>Upload Training Material</h3>
            <p className="modal-subtitle">Share resources with your students</p>

            <label className="modal-label">Title</label>
            <input
              type="text"
              placeholder="Enter material title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="modal-label">Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setFile(null);
                setFileName("");
              }}
            >
              <option value="video">Video</option>
              <option value="pdf">PDF / Document</option>
            </select>

            <label className="modal-label">
              File
              <span style={{ fontSize: "12px", opacity: 0.6, marginLeft: "6px" }}>
                {type === "video" ? "(mp4, mkv, avi, mov, webm)" : "(pdf only)"}
              </span>
            </label>
            <div
              className="file-upload-box"
              style={{ position: "relative" }}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <input
                id="fileInput"
                type="file"
                style={{ display: "none" }}
                accept={
                  type === "video"
                    ? "video/mp4,video/mkv,video/avi,video/mov,video/webm"
                    : "application/pdf"
                }
                onChange={handleFileChange}
              />
              <span className="upload-plus">+</span>
              <span>{fileName || "Click to upload"}</span>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={resetForm}>Cancel</button>
              <button className="save-btn" onClick={handleUpload}>Upload</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default UploadMaterials;