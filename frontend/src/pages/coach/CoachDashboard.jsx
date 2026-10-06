import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CoachDashboard.css";

function CoachDashboard() {
  const [batches, setBatches] = useState([]);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, present: 0 });
  const [announcements, setAnnouncements] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    fetchBatches();
    fetchSchedules();
    fetchAttendance();
    fetchAnnouncements();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/batches/coach/${user._id}`
      );
      setBatches(res.data);
      const total = res.data.reduce(
        (sum, b) => sum + (b.students?.length || 0), 0
      );
      setTotalStudents(total);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/schedules", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const todayStr = new Date().toISOString().split("T")[0];

      const filtered = res.data
        .filter(
          (s) =>
            (s.coach?._id === user._id || s.coach === user._id) &&
            s.date >= todayStr
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

      setTodaySchedules(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const batchRes = await axios.get(
        `http://localhost:5000/api/batches/coach/${user._id}`
      );
      const batchWithStudents = batchRes.data.find(
        (b) => b.students?.length > 0
      );
      if (!batchWithStudents) return;

      const dateStr = new Date().toISOString().split("T")[0];
      const res = await axios.get(
        `http://localhost:5000/api/attendance/${batchWithStudents._id}/${dateStr}`
      );

      const total = res.data.length;
      const present = res.data.filter((r) => r.status === "Present").length;
      setAttendanceStats({ total, present });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/announcements");

      const filtered = res.data
        .filter((a) => a.audience === "All" || a.audience === "Coaches")
        .slice(0, 3);

      setAnnouncements(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const attendancePct =
    attendanceStats.total > 0
      ? Math.round(
          (attendanceStats.present / attendanceStats.total) * 100
        )
      : 0;

  return (
    <div className="coach-dashboard">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1 style={{ color: "#ff7a18" }}>Coach Dashboard</h1>
          <p>Good morning, {user?.name}! Here's your schedule for today.</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => navigate("/coach/attendance")}
        >
          Mark Attendance
        </button>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="card" onClick={() => navigate("/coach/batches")} style={{ cursor: "pointer" }}>
          <p className="stat-title">Total Students</p>
          <h2 className="stat-value">{totalStudents}</h2>
        </div>

        <div className="card" onClick={() => navigate("/coach/schedule")} style={{ cursor: "pointer" }}>
          <p className="stat-title">Today's Sessions</p>
          <h2 className="stat-value">{todaySchedules.length}</h2>
        </div>

        <div className="card" onClick={() => navigate("/coach/attendance")} style={{ cursor: "pointer" }}>
          <p className="stat-title">Today's Attendance</p>
          <h2 className="stat-value">{attendancePct}%</h2>
        </div>

        <div className="card" onClick={() => navigate("/coach/batches")} style={{ cursor: "pointer" }}>
          <p className="stat-title">My Batches</p>
          <h2 className="stat-value">{batches.length}</h2>
        </div>
      </div>

      {/* MIDDLE */}
      <div className="dashboard-middle">

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* MY BATCHES */}
          <div
            className="card"
            onClick={() => navigate("/coach/batches")}
            style={{
              cursor: "pointer",
              borderLeft: "6px solid #ff7a18",
              background: "var(--card)"
            }}
          >
            <h2 className="card-title">My Batches</h2>

            {batches.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No batches assigned</p>
            ) : (
              batches.map((batch) => (
                <div key={batch._id} className="batch-item">
                  <div>
                    <h4>{batch.program?.name} - {batch.name}</h4>
                    <p>{batch.timing}</p>
                  </div>
                  <span>{batch.students?.length || 0} students</span>
                </div>
              ))
            )}
          </div>

          {/* ANNOUNCEMENTS */}
          <div
            className="card"
            onClick={() => navigate("/coach/announcements")}
            style={{
              cursor: "pointer",
              borderLeft: "6px solid #3b82f6",
              background: "var(--card)"
            }}
          >
            <h2 className="card-title">Announcements</h2>

            {announcements.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No announcements</p>
            ) : (
              announcements.map((a) => (
                <div key={a._id} className="session-item">
                  <div>
                    <h4>{a.title}</h4>
                    <p style={{ fontSize: "13px", opacity: 0.7 }}>
                      {a.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* RIGHT */}
        <div
          className="card"
          onClick={() => navigate("/coach/schedule")}
          style={{ cursor: "pointer" }}
        >
          <h2 className="card-title">Upcoming Sessions</h2>

          {todaySchedules.length === 0 ? (
            <p style={{ opacity: 0.6 }}>No sessions today</p>
          ) : (
            todaySchedules.map((s) => (
              <div key={s._id} className="session-item">
                <div>
                  <h4>{s.title}</h4>
                  <p>
                    📅 {new Date(s.date).toLocaleDateString("en-GB")} • {s.time} • {s.location}
                  </p>
                </div>
                <span className={`badge ${s.status?.toLowerCase()}`}>
                  {s.status}
                </span>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}

export default CoachDashboard;