import { useState, useEffect } from "react";
import axios from "axios";
import { FiEdit2 } from "react-icons/fi";
import "./StudentProfile.css";

export default function StudentProfile() {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    age: "",
    emergencyContact: "",
    academy: "",
    batch: "",
    joined: "",
  });

  const [stats, setStats] = useState({
    attendance: 0,
    performance: "",
    fees: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchUserData();
  }, []);

  // ================= FETCH USER =================
  const fetchUserData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");

      const myData = res.data.find(
        (u) => String(u._id) === String(user._id)
      );

      if (!myData) return;

      setProfile({
        name: myData.name || "",
        email: myData.email || "",
        phone: myData.phone || "",
        address: myData.address || "",
        gender: myData.gender || "",
        age: myData.age || "",
        emergencyContact: myData.emergencyContact || "",
        academy: myData.academy || "Cricket Academy",
        batch: myData.batch?.name || "Batch",
        joined: myData.createdAt || "",
      });

      setStats({
        attendance: myData.attendance || 0,
        performance: myData.performance || "N/A",
        fees: myData.feesStatus || "Pending",
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        profile
      );

      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (loading) return <div className="modern-profile">Loading...</div>;

  return (
    <div className="modern-profile">

      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.name?.charAt(0)?.toUpperCase()}
        </div>

        <div>
          <h2>{profile.name}</h2>
          <p>{profile.academy} • {profile.batch}</p>
        </div>

        <button
          className="edit-toggle"
          onClick={() => setEditMode(!editMode)}
        >
          <FiEdit2 /> {editMode ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="profile-content">

        {/* PERSONAL INFO */}
        <div className="profile-section">
          <h3>Personal Information</h3>

          <div className="info-grid">

            <div>
              <label>Email</label>
              <input name="email" value={profile.email} disabled={!editMode} onChange={handleChange} />
            </div>

            <div>
              <label>Phone</label>
              <input name="phone" value={profile.phone} disabled={!editMode} onChange={handleChange} />
            </div>

            <div>
              <label>Address</label>
              <input name="address" value={profile.address} disabled={!editMode} onChange={handleChange} />
            </div>

            <div>
              <label>Gender</label>
              <input name="gender" value={profile.gender} disabled={!editMode} onChange={handleChange} />
            </div>

            <div>
              <label>Age</label>
              <input name="age" value={profile.age} disabled={!editMode} onChange={handleChange} />
            </div>

            <div>
              <label>Emergency Contact</label>
              <input name="emergencyContact" value={profile.emergencyContact} disabled={!editMode} onChange={handleChange} />
            </div>

            <div>
              <label>Joined</label>
              <input
                disabled
                value={
                  profile.joined
                    ? new Date(profile.joined).toLocaleDateString()
                    : "N/A"
                }
              />
            </div>

          </div>

          {editMode && (
            <button className="save-modern" onClick={handleSave}>
              Save Changes
            </button>
          )}
        </div>

        {/* STATS */}
        <div className="profile-stats">
          <div className="stat-box">
            <h4>Attendance</h4>
            <span>{stats.attendance}%</span>
          </div>

          <div className="stat-box">
            <h4>Performance</h4>
            <span>{stats.performance}</span>
          </div>

          <div className="stat-box">
            <h4>Fees</h4>
            <span>{stats.fees}</span>
          </div>
        </div>

      </div>
    </div>
  );
}