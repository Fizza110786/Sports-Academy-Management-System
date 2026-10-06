import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import { FiCalendar, FiCheckCircle, FiCreditCard } from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";

function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [attendancePct, setAttendancePct] = useState(null);
  const [nextSession, setNextSession] = useState(null);
  const [feeStatus, setFeeStatus] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];

      // ================= ATTENDANCE =================
      const attRes = await axios.get("http://localhost:5000/api/attendance");
      const myRecords = attRes.data.filter(
        (r) => r.studentId?._id === user._id || r.studentId === user._id
      );
      const presentCount = myRecords.filter((r) => r.status === "Present").length;
      const pct =
        myRecords.length > 0
          ? Math.round((presentCount / myRecords.length) * 100)
          : 0;
      setAttendancePct(pct);

      // ================= SCHEDULES (FIXED) =================
      const schedRes = await axios.get("http://localhost:5000/api/schedules");
      const batchRes = await axios.get("http://localhost:5000/api/batches");

      // ✅ find student's batch
      const myBatch = batchRes.data.find((b) =>
        b.students?.some((s) => s._id === user._id || s === user._id)
      );

      // ✅ filter schedules (batch + future)
      const mySchedules = schedRes.data.filter((s) => {
        const isMyBatch =
          myBatch &&
          (String(s.batch) === String(myBatch._id) ||
            s.batch?._id === myBatch._id);

        const isFuture = s.date >= todayStr;

        return isMyBatch && isFuture;
      });

      // ✅ sort by date
      mySchedules.sort((a, b) => new Date(a.date) - new Date(b.date));

      // ✅ next session
      setNextSession(mySchedules.length > 0 ? mySchedules[0] : null);

      // ✅ upcoming sessions (limit 3)
      setUpcomingSessions(mySchedules.slice(0, 3));

      // ================= PAYMENTS =================
      const payRes = await axios.get("http://localhost:5000/api/payments");
      const myPayments = payRes.data.filter(
        (p) => p.student?._id === user._id || p.student === user._id
      );
      const hasVerified = myPayments.some((p) => p.status === "Verified");
      const hasPending = myPayments.some((p) => p.status === "Pending");
      if (hasVerified) setFeeStatus("Paid");
      else if (hasPending) setFeeStatus("Pending");
      else setFeeStatus("Unpaid");

      // ================= PERFORMANCE =================
      const perfRes = await axios.get(
        `http://localhost:5000/api/performance?studentName=${encodeURIComponent(
          user.name
        )}`
      );
      if (perfRes.data.length > 0) {
        const avg = Math.round(
          perfRes.data.reduce((sum, p) => sum + p.rating, 0) /
            perfRes.data.length
        );
        const grades = ["", "D", "C", "B", "A", "A+"];
        setPerformance(grades[avg] || "N/A");
      } else {
        setPerformance("N/A");
      }

      // ================= ANNOUNCEMENTS =================
      const annRes = await axios.get("http://localhost:5000/api/announcements");

      const filtered = annRes.data
        .filter((a) => {
          if (a.audience === "All" || a.audience === "Students") return true;

          if (
            myBatch &&
            (String(a.batchId) === String(myBatch._id) ||
              a.batchId?._id === myBatch._id)
          )
            return true;

          return false;
        })
        .slice(0, 3);

      setAnnouncements(filtered);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const feeStatusColor = {
    Paid: "#22c55e",
    Pending: "#f59e0b",
    Unpaid: "#ef4444",
  };

  const getDayLabel = (dateVal) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    if (dateVal === today) return "today";
    if (dateVal === tomorrowStr) return "tomorrow";
    return "upcoming";
  };

  if (loading) return <div className="student-dashboard">Loading...</div>;

  return (
    <div className="student-dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>
            Welcome back, {user?.name || "Student"}! Keep up the great work
          </p>
        </div>

        <button
          className="pay-btn"
          onClick={() => navigate("/student/pay-fees")}
        >
          <FiCreditCard /> Pay Fees
        </button>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div
          className="stat-card"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/student/attendance")}
        >
          <div className="stat-info">
            <span>Attendance</span>
            <h2>{attendancePct !== null ? `${attendancePct}%` : "-"}</h2>
          </div>
          <div className="icon-box success">
            <FiCheckCircle />
          </div>
        </div>

        <div
          className="stat-card"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/student/schedule")}
        >
          <div className="stat-info">
            <span>Next Session</span>
            <h2>{nextSession ? nextSession.title : "No session"}</h2>
            {nextSession && (
              <p style={{ fontSize: "12px", opacity: 0.7 }}>
                {nextSession.time}
              </p>
            )}
          </div>
          <div className="icon-box warning">
            <FiCalendar />
          </div>
        </div>

        <div
          className="stat-card"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/student/pay-fees")}
        >
          <div className="stat-info">
            <span>Fee Status</span>
            <h2 style={{ color: feeStatusColor[feeStatus] }}>
              {feeStatus || "-"}
            </h2>
          </div>
          <div className="icon-box primary">
            <FiCreditCard />
          </div>
        </div>

        <div
          className="stat-card"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/student/progress")}
        >
          <div className="stat-info">
            <span>Performance</span>
            <h2>{performance || "-"}</h2>
          </div>
          <div className="icon-box gold">
            <FaTrophy />
          </div>
        </div>
      </div>

      {/* LOWER GRID */}
      <div className="dashboard-grid">
        {/* Upcoming Sessions */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Upcoming Sessions</h3>
            <span
              className="link"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/student/schedule")}
            >
              Full Schedule
            </span>
          </div>

          {upcomingSessions.length === 0 ? (
            <p style={{ opacity: 0.6, fontSize: "14px" }}>
              No upcoming sessions
            </p>
          ) : (
            upcomingSessions.map((s) => (
              <div key={s._id} className="session-item">
                <div className="session-icon">
                  <FiCalendar />
                </div>
                <div>
                  <strong>{s.title}</strong>
                  <p>
                    {s.time}{" "}
                    {s.coach?.name ? `• ${s.coach.name}` : ""}
                  </p>
                </div>
                <span className={`badge ${getDayLabel(s.date)}`}>
                  {getDayLabel(s.date)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Announcements */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Announcements</h3>
            <span
              className="link"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/student/announcements")}
            >
              View All
            </span>
          </div>

          {announcements.length === 0 ? (
            <p style={{ opacity: 0.6, fontSize: "14px" }}>
              No announcements
            </p>
          ) : (
            announcements.map((a) => (
              <div
                key={a._id}
                className={`announcement-item ${
                  a.priority === "high" ? "urgent" : ""
                }`}
              >
                <strong>{a.title}</strong>
                <p>{a.message}</p>
                {a.priority === "high" && (
                  <span className="badge urgent-badge">Urgent</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;