import { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit2 } from "react-icons/fi";
import "./CoachProfile.css";

export default function CoachProfile() {
  const [editMode, setEditMode] = useState(false);
  const [batches, setBatches] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dob: user?.dob || "",
    gender: user?.gender || "",
  });

  // ================= FETCH BATCHES =================
  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/batches/coach/${user._id}`
      );
      setBatches(res.data);

      // ✅ count total students across all batches
      const total = res.data.reduce(
        (sum, b) => sum + (b.students?.length || 0), 0
      );
      setTotalStudents(total);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        form
      );

      // ✅ update localStorage
      const updated = { ...user, ...form };
      localStorage.setItem("user", JSON.stringify(updated));

      setEditMode(false);
      alert("Profile updated ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to update ❌");
    }
  };

  // ✅ get initials from name
  const getInitials = (name) => {
    if (!name) return "C";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="coach-profile-container">

      {/* HEADER */}
      <div className="coach-profile-header">
        <div className="coach-avatar">
          {user?.profileImage ? (
            <img
              src={`http://localhost:5000${user.profileImage}`}
              alt="profile"
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
            />
          ) : (
            getInitials(user?.name)
          )}
        </div>

        <div className="coach-info">
          <h2>{user?.name || "Coach"}</h2>
          <p>Coach • {user?.email}</p>
        </div>

        <button
          className="coach-edit-btn"
          onClick={() => setEditMode(!editMode)}
        >
          <FiEdit2 /> {editMode ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="coach-profile-content">

        {/* LEFT — PERSONAL INFO */}
        <div className="coach-profile-card">
          <h3>Personal Information</h3>

          <div className="coach-grid">

            <div>
              <label>Name</label>
              <input
                disabled={!editMode}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label>Email</label>
              <input
                disabled={!editMode}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label>Phone</label>
              <input
                disabled={!editMode}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>

            <div>
              <label>Date of Birth</label>
              <input
                type={editMode ? "date" : "text"}
                disabled={!editMode}
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                placeholder="Date of birth"
              />
            </div>

            <div>
              <label>Gender</label>
              {editMode ? (
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <input disabled value={form.gender || "-"} />
              )}
            </div>

            <div>
              <label>Role</label>
              <input disabled value={user?.role || "coach"} />
            </div>

          </div>

          {editMode && (
            <button className="coach-save-btn" onClick={handleSave}>
              Save Changes
            </button>
          )}
        </div>

        {/* RIGHT — STATS */}
        <div className="coach-stats">

          <div className="coach-stat-box">
            <h4>Batches</h4>
            <span>{batches.length}</span>
          </div>

          <div className="coach-stat-box">
            <h4>Students</h4>
            <span>{totalStudents}</span>
          </div>

          <div className="coach-stat-box">
            <h4>Joined</h4>
            <span style={{ fontSize: "14px" }}>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })
                : "-"}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}