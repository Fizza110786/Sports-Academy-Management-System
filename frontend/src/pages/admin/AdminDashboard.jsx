import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    coaches: 0,
    programs: 0,
    revenue: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [chartData, setChartData] = useState([]);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/reports");

      setStats({
        students: res.data.students || 0,
        coaches: res.data.coaches || 0,
        programs: res.data.programs || 0,
        revenue: res.data.revenue || 0,
      });

      setRecentUsers(res.data.recentUsers || []);
      setChartData(res.data.monthlyRevenue || []);
    } catch (err) {
      console.log("Dashboard load error:", err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/schedules");

      const todayStr = new Date().toISOString().split("T")[0];

      const filtered = res.data
        .filter((s) => s.date >= todayStr)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

      setSchedules(filtered);
    } catch (err) {
      console.log("Schedules load error:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchSchedules();
  }, []);

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="subtitle">
            Welcome back! Here's what's happening at your academy.
          </p>
        </div>
        <button
          className="primary-btn"
          onClick={() => navigate("/admin/announcements")}
        >
          🔔 New Announcement
        </button>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: "4px solid #3b82f6", cursor: "pointer" }}
          onClick={() => navigate("/admin/users", { state: { role: "student" } })}>
          <p style={{ color: "#3b82f6", fontWeight: "600" }}>🎓 Total Students</p>
          <h2 style={{ color: "#3b82f6" }}>{stats.students}</h2>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #22c55e", cursor: "pointer" }}
          onClick={() => navigate("/admin/users", { state: { role: "coach" } })}>
          <p style={{ color: "#22c55e", fontWeight: "600" }}>🏋️ Active Coaches</p>
          <h2 style={{ color: "#22c55e" }}>{stats.coaches}</h2>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #f97316", cursor: "pointer" }}
          onClick={() => navigate("/admin/programs")}>
          <p style={{ color: "#f97316", fontWeight: "600" }}>📋 Programs</p>
          <h2 style={{ color: "#f97316" }}>{stats.programs}</h2>
        </div>

        <div className="stat-card" style={{ borderLeft: "4px solid #a855f7", cursor: "pointer" }}
          onClick={() => navigate("/admin/payments")}>
          <p style={{ color: "#a855f7", fontWeight: "600" }}>💰 Revenue</p>
          <h2 style={{ color: "#a855f7" }}>₹{stats.revenue}</h2>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div
        className="content-grid"
        style={{ gridTemplateColumns: "minmax(0, 1.6fr) minmax(420px, 1.4fr)" }}
      >

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          <div className="card">
            <h3>Revenue Overview</h3>
            <p className="subtitle">Monthly fee collection trends</p>

            {chartData.length === 0 ? (
              <p style={{ opacity: 0.6, marginTop: "16px" }}>No revenue data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    fill="rgba(249,115,22,0.15)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="dashboard-section">
            <h3>Recent Enrollments</h3>

            {recentUsers.length === 0 ? (
              <p>No recent users</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>

        {/* RIGHT */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2>Upcoming Sessions</h2>
            <span
              style={{ fontSize: "13px", color: "#f97316", cursor: "pointer" }}
              onClick={() => navigate("/admin/schedules")}
            >
              View All →
            </span>
          </div>

          {schedules.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No schedules found</p>
          ) : (
            schedules.map((s) => (
              <div
                key={s._id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  padding: "14px",
                  marginBottom: "12px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "var(--card)"
                }}
                onClick={() => navigate("/admin/schedules", { state: { date: s.date } })}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: "14px" }}>
                    {s.title}
                  </h4>

                  <p style={{ fontSize: "13px", opacity: 0.7 }}>
                    📅 {new Date(s.date).toLocaleDateString("en-GB")} • 🕐 {s.time}
                  </p>

                  <p style={{ fontSize: "13px", opacity: 0.7 }}>
                    📍 {s.location} • 👤 {s.coach?.name || "Coach"}
                  </p>

                  <p style={{ fontSize: "13px", opacity: 0.7 }}>
                    🏷 {s.batch?.name || "Batch"}
                  </p>
                </div>

                <span
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "12px"
                  }}
                >
                  Upcoming
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}