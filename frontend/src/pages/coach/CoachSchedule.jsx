import "./CoachSchedule.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { FiClock, FiMapPin } from "react-icons/fi";

export default function CoachSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [schedules, setSchedules] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  // ✅ get token + user
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); // ✅ ADDED

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/schedules", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ FILTER ONLY LOGGED-IN COACH
      const filtered = res.data.filter(
        (s) =>
          s.coach?._id === user._id || s.coach === user._id
      );

      setSchedules(filtered);

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

  const formattedDate = `${["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][
    new Date(currentYear, currentMonth, selectedDate).getDay()
  ]}, ${monthNames[currentMonth]} ${selectedDate}, ${currentYear}`;

  const prevMonth = () => {
    if (currentMonth === 0) { 
      setCurrentMonth(11); 
      setCurrentYear(currentYear - 1); 
    }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDate(1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { 
      setCurrentMonth(0); 
      setCurrentYear(currentYear + 1); 
    }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDate(1);
  };

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h1>My Schedule</h1>
        <p>View your training schedule</p>
      </div>

      <div className="schedule-grid">

        <div className="calendar-card">
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
          <div className="date-title">
            <h3>{formattedDate}</h3>
            <span className="session-count">{filteredSchedules.length} Sessions</span>
          </div>

          {filteredSchedules.length === 0 ? (
            <div style={{ opacity: 0.6, marginTop: "20px" }}>
              No sessions for this day
            </div>
          ) : (
            filteredSchedules.map((s) => (
              <div key={s._id} className="session-card">
                <div className="session-icon">⏱</div>
                <div className="session-details">
                  <h4>{s.title || s.batch?.name || "-"}</h4>
                  <div className="session-meta">
                    <span><FiClock /> {s.time}</span>
                    <span><FiMapPin /> {s.location}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}