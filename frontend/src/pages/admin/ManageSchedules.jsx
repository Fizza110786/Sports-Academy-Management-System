import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import "./ManageSchedules.css";
import { FiClock, FiMapPin, FiTrash2, FiEdit2 } from "react-icons/fi";

export default function ManageSchedules() {

  const today = new Date();
  const todayDate = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const [currentMonth, setCurrentMonth] = useState(todayMonth);
  const [currentYear, setCurrentYear] = useState(todayYear);
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [selectedBatch, setSelectedBatch] = useState("All Batches");
  const [showModal, setShowModal] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [batches, setBatches] = useState([]);
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const buildDateStr = (day) => {
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${currentYear}-${m}-${d}`;
  };

  const selectedDateStr = buildDateStr(selectedDate);

  const emptyForm = {
    date: selectedDateStr,
    batch: "",
    coach: "",
    title: "", // ✅ kept
    time: "",
    location: "Ground 1",
    status: "Upcoming",
  };

  const [form, setForm] = useState(emptyForm);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/schedules", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/batches");
      setBatches(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    fetchSchedules();
    fetchBatches();
  }, []);

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    const selectedBatchObj = batches.find((b) => b._id === batchId);
    const coachId = selectedBatchObj?.coach?._id || selectedBatchObj?.coach || "";
    setForm({ ...form, batch: batchId, coach: coachId });
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const filteredSchedules = schedules.filter((s) => {
    const matchBatch =
      selectedBatch === "All Batches" ||
      s.batch?._id === selectedBatch ||
      s.batch === selectedBatch;
    const matchDate = s.date === selectedDateStr;
    return matchBatch && matchDate;
  });

  const handleEdit = (s) => {
    setEditId(s._id);
    setForm({
      date: s.date,
      batch: s.batch?._id || s.batch || "",
      coach: s.coach?._id || s.coach || "",
      title: s.title || "",
      time: s.time || "",
      location: s.location || "Ground 1",
      status: s.status || "Upcoming",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.batch) return alert("Please select a batch");
    if (!form.time.trim()) return alert("Please enter a time");
    try {
      if (editId) {
        await axios.put(
          `http://localhost:5000/api/schedules/${editId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEditId(null);
      } else {
        await axios.post("http://localhost:5000/api/schedules", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      await fetchSchedules();
      setShowModal(false);
      setForm({ ...emptyForm, date: selectedDateStr });
    } catch (err) {
      console.log(err);
      alert("Failed to save schedule ❌");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchSchedules();
    } catch (err) { console.log(err); }
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDate(1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDate(1);
  };

  const getCoachName = (batchId) => {
    const b = batches.find((b) => b._id === batchId);
    return b?.coach?.name || "";
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid var(--border, #e5e7eb)",
    background: "var(--bg, #fff)",
    color: "var(--text, #111)",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Training Schedules</h1>
          <p className="subtitle">View and manage all training schedules</p>
        </div>
        <button
          className="primary-btn"
          onClick={() => {
            setEditId(null);
            setForm({ ...emptyForm, date: selectedDateStr });
            setShowModal(true);
          }}
        >
          + Add Schedule
        </button>
      </div>

      <div className="schedule-layout">

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

          <select
            className="program-filter"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="All Batches">All Batches</option>
            {batches.map((b) => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="sessions">
          <div className="sessions-header">
            <h3>{monthNames[currentMonth]} {selectedDate}, {currentYear}</h3>
            <span className="count">{filteredSchedules.length} Sessions</span>
          </div>

          {filteredSchedules.length === 0 && (
            <div className="no-data">No sessions for this day</div>
          )}

          {filteredSchedules.map((s) => (
            <div className="session-card" key={s._id}>
              {/* ✅ title shown */}
              <div className="session-title">{s.title || s.batch?.name || "-"}</div>
              <div className="session-coach">{s.coach?.name || "-"}</div>
              <div className="session-time"><FiClock /> {s.time}</div>
              <div className="session-location"><FiMapPin /> {s.location}</div>
              <div style={{
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "13px",
                background: "rgba(255,122,24,0.12)",
                color: "#ff7a18",
                fontWeight: "500",
                whiteSpace: "nowrap",
              }}>
                {s.batch?.name || "-"}
              </div>
              <div className="action-btns" style={{ marginLeft: "auto" }}>
                <button className="prog-edit-btn" onClick={() => handleEdit(s)} title="Edit">
                  <FiEdit2 />
                </button>
                <button className="prog-delete-btn" onClick={() => handleDelete(s._id)} title="Delete">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "var(--card, #fff)", color: "var(--text, #111)",
              borderRadius: "16px", padding: "24px", width: "420px",
              maxWidth: "90vw", maxHeight: "85vh", overflowY: "auto",
              border: "1px solid var(--border, #e5e7eb)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              display: "flex", flexDirection: "column", gap: "12px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0 }}>{editId ? "Edit Schedule" : "Add Schedule"}</h3>

            <select name="date" value={form.date} onChange={handleChange} style={inputStyle}>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dateStr = buildDateStr(day);
                return (
                  <option key={day} value={dateStr}>
                    {monthNames[currentMonth]} {day}, {currentYear}
                  </option>
                );
              })}
            </select>

            <select name="batch" value={form.batch} onChange={handleBatchChange} style={inputStyle}>
              <option value="">Select Batch *</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>

            {form.batch && (
              <div style={{
                padding: "10px 12px", borderRadius: "8px",
                border: "1px solid var(--border, #e5e7eb)",
                background: "var(--bg, #f9fafb)",
                fontSize: "14px", color: "var(--text, #111)", opacity: 0.8,
              }}>
                Coach: {getCoachName(form.batch) || "No coach assigned"}
              </div>
            )}

            {/* ✅ title input kept */}
            <input
              name="title"
              placeholder="Session title *"
              value={form.title}
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              name="time"
              placeholder="e.g. 6:00 AM - 8:00 AM *"
              value={form.time}
              onChange={handleChange}
              style={inputStyle}
            />

            <select name="location" value={form.location} onChange={handleChange} style={inputStyle}>
              <option value="Ground 1">Ground 1</option>
              <option value="Ground 2">Ground 2</option>
              <option value="Indoor Court">Indoor Court</option>
              <option value="Court 2">Court 2</option>
            </select>

            <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button className="primary-btn" onClick={handleSave}>
                {editId ? "Update" : "Save"}
              </button>
              <button
                onClick={() => { setShowModal(false); setEditId(null); }}
                style={{
                  padding: "10px 18px", borderRadius: "10px",
                  border: "1px solid var(--border, #e5e7eb)",
                  background: "transparent", color: "var(--text, #111)", cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}