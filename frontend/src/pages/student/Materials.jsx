import { useState, useEffect } from "react";
import axios from "axios";
import { FiSearch, FiDownload, FiPlay } from "react-icons/fi";
import "./Materials.css";

function Materials() {
  const [search, setSearch] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchMaterials();
  }, []);

  // ================= FETCH MATERIALS =================
  const fetchMaterials = async () => {
    try {
      // ✅ get all batches to find student's coach
      const batchRes = await axios.get("http://localhost:5000/api/batches");
      const myBatch = batchRes.data.find((b) =>
        b.students?.some(
          (s) => s._id === user._id || s === user._id
        )
      );

      // ✅ get all materials
      const matRes = await axios.get("http://localhost:5000/api/materials");

      if (myBatch && myBatch.coach) {
        const coachId = myBatch.coach?._id || myBatch.coach;
        // ✅ filter materials by student's coach only
        const filtered = matRes.data.filter(
          (m) => m.coachId === coachId ||
            m.coachId?._id === coachId ||
            String(m.coachId) === String(coachId)
        );
        setMaterials(filtered);
      } else {
        // no batch — show all
        setMaterials(matRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (fileUrl) => {
    window.open(`http://localhost:5000${fileUrl}`, "_blank");
  };

  const filtered = materials.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="materials-page">Loading...</div>;

  return (
    <div className="materials-page">
      <div className="materials-header">
        <div>
          <h1>Training Materials</h1>
          <p>Access training videos and documents</p>
        </div>
      </div>

      {/* Search */}
      <div className="materials-search">
        <FiSearch />
        <input
          type="text"
          placeholder="Search materials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <p style={{ opacity: 0.6, marginTop: "20px" }}>
          No materials available
        </p>
      ) : (
        <div className="materials-grid">
          {filtered.map((item) => (
            <div key={item._id} className="material-card">
              <div className="material-top">
                <div className={`material-icon ${item.type}`}>
                  {item.type === "video" ? "🎥" : "📄"}
                </div>

                <div>
                  <h4>{item.title}</h4>
                  <span>{item.coachName}</span>
                </div>
              </div>

              <div className="material-meta">
                <span>{item.size || "-"}</span>
                <span>
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <button
                className="material-btn"
                onClick={() => handleOpen(item.fileUrl)}
              >
                {item.type === "video" ? (
                  <><FiPlay /> Play</>
                ) : (
                  <><FiDownload /> Download</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Materials;