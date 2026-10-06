import { useEffect, useState } from "react";
import axios from "axios";
import "./CoachBatches.css";

function CoachBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBatch, setExpandedBatch] = useState(null);

  useEffect(() => {
    fetchCoachBatches();
  }, []);

  const fetchCoachBatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user._id) {
        console.error("User ID missing");
        setLoading(false);
        return;
      }

      const res = await axios.get(
        `http://localhost:5000/api/batches/coach/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBatches(res.data);
    } catch (err) {
      console.error("Error fetching coach batches:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="batches-page">
        <h2>Loading batches...</h2>
      </div>
    );
  }

  return (
    <div className="batches-page">
      <div className="batches-header">
        <h1>My Batches</h1>
        <p>View and manage your assigned batches</p>
      </div>

      {batches.length === 0 ? (
        <div className="empty-state">
          <h3>No batches assigned yet</h3>
          <p>Please contact admin.</p>
        </div>
      ) : (
        <div className="batches-grid">
          {batches.map((batch) => (
            <div key={batch._id} className="batch-card">

              <div className="batch-top">
                <div>
                  <h3>
                    {batch.program?.name} - {batch.name}
                  </h3>
                </div>
                <span className="badge active">
                  {batch.status}
                </span>
              </div>

              {/* ❌ REMOVED STUDENT COUNT LINE */}
              <div className="batch-info">
              </div>

              <div className="recent-students">
                <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>
                  Students ({batch.students?.length || 0})
                </h2>

                {expandedBatch !== batch._id &&
                  batch.students?.slice(0, 3).map((student) => (
                    <div key={student._id} className="student-row">
                      <span>{student.name}</span>
                    </div>
                  ))}
              </div>

              <button
                className="view-btn"
                onClick={() =>
                  setExpandedBatch(
                    expandedBatch === batch._id ? null : batch._id
                  )
                }
              >
                {expandedBatch === batch._id
                  ? "Hide Students ↑"
                  : "View All Students →"}
              </button>

              {expandedBatch === batch._id && (
                <div style={{ marginTop: "16px" }}>
                  {batch.students?.length === 0 ? (
                    <p>No students in this batch</p>
                  ) : (
                    batch.students.map((s) => (
                      <div
                        key={s._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 0",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        {s.profileImage ? (
                          <img
                            src={`http://localhost:5000${s.profileImage}`}
                            alt=""
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: "#ff7a18",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "600",
                            }}
                          >
                            {s.name?.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <strong>{s.name}</strong>
                          <p style={{ fontSize: "13px", opacity: 0.6 }}>
                            {s.email}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CoachBatches;