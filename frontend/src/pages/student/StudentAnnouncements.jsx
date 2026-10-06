import { useState, useEffect } from "react";
import axios from "axios";
import "./StudentAnnouncements.css";
import { FiSearch, FiBell } from "react-icons/fi";

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // ================= FETCH ANNOUNCEMENTS =================
  const fetchAnnouncements = async () => {
    try {
      const [annRes, batchRes] = await Promise.all([
        axios.get("http://localhost:5000/api/announcements"),
        axios.get("http://localhost:5000/api/batches"),
      ]);

      const announcementsData = annRes.data;
      const batches = batchRes.data;

      // ✅ Find student's batch
      const myBatch = batches.find((b) =>
        b.students?.some(
          (s) => s._id === user._id || s === user._id
        )
      );

      const myBatchId = myBatch?._id;
      const myCoachId =
        myBatch?.coachId?._id || myBatch?.coachId;

      // ================= FILTER LOGIC =================
      const filtered = announcementsData.filter((a) => {
        const creatorId = a.createdBy?._id || a.createdBy;

        // ✅ Admin announcements
        if (
          a.createdBy?.role === "admin" ||
          a.postedBy === "Admin"
        ) {
          return true;
        }

        // ✅ Only student's batch coach announcements
        if (
          myCoachId &&
          String(creatorId) === String(myCoachId)
        ) {
          return true;
        }

        return false;
      });

      setAnnouncements(filtered);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH FILTER =================
  const filteredSearch = announcements.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.message.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="announcements-page">Loading...</div>;

  return (
    <div className="announcements-page">
      <div className="page-header">
        <h1>Announcements</h1>
        <p>Important updates and notifications</p>
      </div>

      {/* Search */}
      <div className="search-box">
        <FiSearch />
        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Announcement List */}
      {filteredSearch.length === 0 ? (
        <p style={{ opacity: 0.6, marginTop: "20px" }}>
          No announcements found
        </p>
      ) : (
        <div className="announcement-list">
          {filteredSearch.map((item) => (
            <div key={item._id} className="announcement-card">
              <div className="announcement-icon">
                <FiBell />
              </div>

              <div className="announcement-content">
                <div className="announcement-top">
                  <div>
                    <h3>{item.title}</h3>

                    {/* ✅ Show who posted */}
                    <span className="meta">
                      {item.createdBy?.name ||
                        item.postedBy ||
                        "Admin"}
                      {" • "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Audience badge */}
                  <div className="badges">
                    <span className="target-badge">
                      {item.audience || "All"}
                    </span>
                  </div>
                </div>

                <p className="message">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}