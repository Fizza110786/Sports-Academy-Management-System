import { useState, useEffect } from "react";
import axios from "axios";
import "./Schedule.css";
import { FiClock, FiMapPin } from "react-icons/fi";

function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const formattedDate = `${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][
    new Date(currentYear, currentMonth, selectedDate).getDay()
  ]}, ${monthNames[currentMonth]} ${selectedDate}, ${currentYear}`;

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    console.log("🔍 user.batch:", user?.batch); // ✅ MOVED HERE
    try {
      const res = await axios.get(
        `http://localhost:5000/api/schedules?studentBatch=${user?.batch}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("🔍 schedules received:", res.data); // ✅ ADDED
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const buildDateStr = (day) => {
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${currentYear}-${m}-${d}`;
  };

  const filteredSchedules = schedules.filter(
    (s) => s.date === buildDateStr(selectedDate)
  );

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else setCurrentMonth(currentMonth - 1);
    setSelectedDate(1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else setCurrentMonth(currentMonth + 1);
    setSelectedDate(1);
  };

  return (
    <div className="schedule-page">
      <h1>My Schedule</h1>
      <p className="subtitle">View your upcoming training sessions</p>

      <div className="schedule-container">

        <div className="schedule-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <button onClick={prevMonth} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "18px", color: "var(--text)" }}>‹</button>
            <h3 style={{ margin: 0 }}>{monthNames[currentMonth]} {currentYear}</h3>
            <button onClick={nextMonth} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "18px", color: "var(--text)" }}>›</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", marginBottom: "6px" }}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
              <span key={d} style={{ fontSize: "11px", opacity: 0.5 }}>{d}</span>
            ))}
          </div>

          <div className="calendar">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const isToday = day === todayDate && currentMonth === todayMonth && currentYear === todayYear;
              return (
                <button
                  key={day}
                  className={selectedDate === day ? "day active" : "day"}
                  style={isToday && selectedDate !== day ? { border: "2px solid #ff7a18" } : {}}
                  onClick={() => setSelectedDate(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sessions-section">
          <div className="sessions-header">
            <h3>{formattedDate}</h3>
            <span className="session-count">{filteredSchedules.length} Sessions</span>
          </div>

          {filteredSchedules.length === 0 ? (
            <p style={{ opacity: 0.6, marginTop: "20px" }}>No sessions for this day</p>
          ) : (
            filteredSchedules.map((s) => (
              <div key={s._id} className="session-card">
                <div className="session-icon">🕒</div>
                <div className="session-info">
                  <h4>{s.title || s.batch?.name || "-"}</h4>
                  <div className="session-meta">
                    <span><FiClock /> {s.time}</span>
                    <span><FiMapPin /> {s.location}</span>
                    <span>{s.coach?.name || "Coach"}</span>
                  </div>
                </div>
                <div style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  background: "rgba(255,122,24,0.12)",
                  color: "#ff7a18",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  marginLeft: "auto",
                }}>
                  {s.status || "-"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Schedule;