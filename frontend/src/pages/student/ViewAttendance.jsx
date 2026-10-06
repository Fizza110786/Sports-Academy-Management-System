import { useState, useEffect } from "react";
import axios from "axios";
import "./ViewAttendance.css";

function MyAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const user = JSON.parse(localStorage.getItem("user"));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // ================= FETCH ATTENDANCE =================
  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/attendance");
      // filter by student ID
      const myRecords = res.data.filter(
        (r) => r.studentId?._id === user._id || r.studentId === user._id
      );
      setAttendanceRecords(myRecords);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= GET STATUS FOR A DATE =================
  const getStatusForDate = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const record = attendanceRecords.find((r) => r.date === dateStr);
    return record ? record.status : null;
  };

  // ================= CALCULATE ATTENDANCE % =================
  const totalRecords = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(
    (r) => r.status === "Present"
  ).length;
  const attendancePct = totalRecords > 0
    ? Math.round((presentCount / totalRecords) * 100)
    : 0;

  // ================= RECENT RECORDS =================
  const recentRecords = [...attendanceRecords]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="attendance-page">
      <h1>My Attendance</h1>
      <p className="subtitle">View your attendance records</p>

      <div className="attendance-container">
        {/* LEFT — CALENDAR */}
        <div className="attendance-card">
          <h3>Select Month</h3>

          <div className="calendar-wrapper">
            <div className="calendar-month-row">
              <div className="calendar-month-controls">
                {/* ✅ prev month */}
                <span
                  className="calendar-arrow"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(currentYear - 1);
                    } else {
                      setCurrentMonth(currentMonth - 1);
                    }
                  }}
                >
                  ‹
                </span>

                <span>{monthNames[currentMonth]} {currentYear}</span>

                {/* ✅ next month */}
                <span
                  className="calendar-arrow"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (currentMonth === 11) {
                      setCurrentMonth(0);
                      setCurrentYear(currentYear + 1);
                    } else {
                      setCurrentMonth(currentMonth + 1);
                    }
                  }}
                >
                  ›
                </span>
              </div>
            </div>

            <div className="calendar-days">
              {days.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="calendar-grid">
              {/* ✅ empty cells for first day offset */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="calendar-day empty" />
              ))}

              {/* ✅ real days with attendance status */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((date) => {
                const status = getStatusForDate(date);
                return (
                  <div
                    key={date}
                    className={`calendar-day ${
                      status === "Present"
                        ? "present"
                        : status === "Absent"
                        ? "absent"
                        : status === "Late"
                        ? "late"
                        : ""
                    }`}
                  >
                    {date}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="attendance-right">
          {/* OVERALL ATTENDANCE */}
          <div className="attendance-card">
            <div className="attendance-top">
              <h3>Overall Attendance</h3>
              <span className="attendance-badge">{attendancePct}%</span>
            </div>

            <div className="attendance-bar">
              <div
                className="attendance-progress"
                style={{ width: `${attendancePct}%` }}
              />
            </div>

            {/* ✅ summary */}
            <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "13px" }}>
              <span style={{ color: "#22c55e" }}>✓ Present: {presentCount}</span>
              <span style={{ color: "#ef4444" }}>
                ✗ Absent: {attendanceRecords.filter(r => r.status === "Absent").length}
              </span>
              <span style={{ color: "#f59e0b" }}>
                ⏱ Late: {attendanceRecords.filter(r => r.status === "Late").length}
              </span>
            </div>
          </div>

          {/* RECENT RECORDS */}
          <div className="attendance-card">
            <h3>Recent Records</h3>

            {recentRecords.length === 0 ? (
              <p style={{ opacity: 0.6 }}>No attendance records found</p>
            ) : (
              <div className="record-list">
                {recentRecords.map((item, index) => (
                  <div key={index} className="record-item">
                    <span>{item.date}</span>
                    <span
                      className={`record-status ${
                        item.status === "Present"
                          ? "status-present"
                          : item.status === "Late"
                          ? "status-late"
                          : "status-absent"
                      }`}
                    >
                      {item.status === "Present"
                        ? "✔"
                        : item.status === "Late"
                        ? "⏱"
                        : "✖"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyAttendance;