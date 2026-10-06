import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import "./AttendanceReport.css";

export default function AttendanceReport() {

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const [selectedDate, setSelectedDate] = useState(currentDay);
  const [selectedBatch, setSelectedBatch] = useState("All Batches");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const [records, setRecords] = useState([]);
  const [batches, setBatches] = useState([]);

  // ================= FETCH ATTENDANCE =================
  const fetchAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/attendance");
      setRecords(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FETCH BATCHES =================
  const fetchBatches = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/batches");
      setBatches(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchBatches();
  }, []);

  const formattedDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`;

  // ================= FILTER =================
  const filteredRecords = records.filter((r) => {
    const matchDate = r.date === formattedDate;
    const matchBatch =
      selectedBatch === "All Batches" ||
      r.batchId?.name === selectedBatch;
    const matchStatus =
      selectedStatus === "All Status" ||
      r.status === selectedStatus;
    return matchDate && matchBatch && matchStatus;
  });

  // ✅ GROUP BY BATCH
  const groupedByBatch = filteredRecords.reduce((acc, r) => {
    const batchName = r.batchId?.name || "Unknown Batch";
    if (!acc[batchName]) acc[batchName] = [];
    acc[batchName].push(r);
    return acc;
  }, {});

  const present = filteredRecords.filter((r) => r.status === "Present").length;
  const absent  = filteredRecords.filter((r) => r.status === "Absent").length;
  const late    = filteredRecords.filter((r) => r.status === "Late").length;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Attendance Management</h1>
          <p className="subtitle">Real attendance data</p>
        </div>
      </div>

      <div className="attendance-layout">

        {/* LEFT SIDE */}
        <div>
          <div className="calendar-card">
            <h3>Select Date</h3>
            <div className="calendar">
              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                return (
                  <button
                    key={day}
                    className={selectedDate === day ? "day active" : "day"}
                    onClick={() => setSelectedDate(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div>

          {/* FILTERS */}
          <div className="attendance-filters">
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option>All Batches</option>
              {batches.map((b) => (
                <option key={b._id}>{b.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option>All Status</option>
              <option>Present</option>
              <option>Absent</option>
              <option>Late</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="attendance-table">

            {/* ✅ DATE AS MAIN HEADER */}
            <h3>
              Attendance for {today.toLocaleString("default", { month: "long" })} {selectedDate}, {currentYear}
            </h3>

            {filteredRecords.length === 0 ? (
              <p className="no-data">No records for this date</p>
            ) : (
              // ✅ RENDER EACH BATCH AS A SECTION
              Object.entries(groupedByBatch).map(([batchName, batchRecords]) => (
                <div key={batchName} className="batch-section">

                  {/* ✅ BATCH NAME AS SECTION HEADER */}
                  <div className="batch-header">
                    {batchName}
                  </div>

                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {batchRecords.map((r) => (
                        <tr key={r._id}>

                          <td>
                            <div className="student-cell">
                              {r.studentId?.profileImage ? (
                                <img
                                  src={`http://localhost:5000${r.studentId.profileImage}`}
                                  alt=""
                                  className="attendance-avatar"
                                />
                              ) : (
                                <div className="attendance-avatar avatar-placeholder">
                                  {r.studentId?.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                              )}
                              <span className="student-name">
                                {r.studentId?.name || "Unknown"}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span className={`badge ${r.status.toLowerCase()}`}>
                              {r.status}
                            </span>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            )}

            {/* SUMMARY */}
            {filteredRecords.length > 0 && (
              <div style={{ marginTop: 15 }}>
                Present: {present} | Absent: {absent} | Late: {late}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}