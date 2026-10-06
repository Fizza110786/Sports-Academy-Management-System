import { useState, useEffect } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import "./Settings.css";

export default function Settings() {
  const emptyForm = {
    academyName: "",
    email: "",
    phone: "",
    address: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
  };

  const [form, setForm] = useState(emptyForm);

  // ================= LOAD =================
  const fetchSettings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/settings");
      setForm(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ================= SAVE =================
  const handleSave = async () => {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/settings",
        form
      );

      // 🔥 update form state with latest DB values
      setForm(res.data);

      alert("Settings saved successfully ✅");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>System Settings</h1>
          <p className="subtitle">
            Manage academy configuration and preferences
          </p>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-grid">
          <div className="form-group">
            <label>Academy Name</label>
            <input
              name="academyName"
              value={form.academyName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Contact Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Currency</label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Timezone</label>
            <select
              name="timezone"
              value={form.timezone}
              onChange={handleChange}
            >
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        <div className="settings-actions">
          <button className="primary-btn" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}