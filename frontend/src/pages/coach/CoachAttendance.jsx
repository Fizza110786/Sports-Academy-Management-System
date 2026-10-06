import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./CoachAttendance.css";

function CoachAttendance() {
  const [students, setStudents] = useState([]);
  const [batchId, setBatchId] = useState(null);
  const [batchName, setBatchName] = useState("");
  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [previousAttendance, setPreviousAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const isToday = selectedDate === today;

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (batchId) {
      fetchExistingAttendance();
    }
  }, [selectedDate, batchId]);

  // ================= FETCH STUDENTS =================
  const fetchStudents = async () => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return;

      const user = JSON.parse(rawUser);
      const coachId = user._id;

      const res = await axios.get(
        `http://localhost:5000/api/batches/coach/${coachId}`
      );

      const batchWithStudents = res.data.find(
        (batch) => batch.students && batch.students.length > 0
      );

      if (batchWithStudents) {
        setBatchId(batchWithStudents._id);
        setBatchName(batchWithStudents.name);
        setStudents(batchWithStudents.students);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH EXISTING ATTENDANCE =================
  const fetchExistingAttendance = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/attendance/${batchId}/${selectedDate}`
      );

      const existing = {};
      res.data.forEach((record) => {
        if (record.studentId?._id) {
          existing[String(record.studentId._id)] = record.status;
        }
      });

      setAttendance(existing);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= MARK STATUS =================
  const markStatus = (studentId, status) => {
    if (!isToday) return;
    setAttendance((prev) => ({
      ...prev,
      [String(studentId)]: status,
    }));
  };

  // ================= SAVE ATTENDANCE =================
  const saveAttendance = async () => {
    if (!isToday) return alert("You can only save attendance for today!");

    try {
      const token = localStorage.getItem("token");

      if (!batchId) return alert("No batch found");
      if (Object.keys(attendance).length === 0)
        return alert("Mark attendance first");

      const records = Object.keys(attendance).map((studentId) => ({
        studentId,
        batchId,
        status: attendance[studentId],
        date: selectedDate,
      }));

      await axios.post(
        "http://localhost:5000/api/attendance",
        { records },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      alert("Failed to save attendance ❌");
    }
  };

  // ================= FETCH PREVIOUS =================
  const fetchPreviousAttendance = async () => {
    if (!batchId) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/attendance/${batchId}/${selectedDate}`
      );
      setPreviousAttendance(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= PREVIEW EXCEL =================
  const previewExcel = async () => {
    if (!batchId) return alert("No batch found");

    try {
      const res = await axios.get(
        `http://localhost:5000/api/attendance/batch/${batchId}`
      );

      const data = res.data;

      if (data.length === 0) {
        alert("No attendance data found");
        return;
      }

      const dates = [...new Set(data.map((r) => r.date))].sort();

      const studentMap = {};
      data.forEach((r) => {
        if (r.studentId) {
          studentMap[r.studentId._id] = r.studentId.name;
        }
      });

      const rows = Object.entries(studentMap).map(([id, name]) => {
        const row = { "Student Name": name };
        dates.forEach((date) => {
          const record = data.find(
            (r) => r.studentId?._id === id && r.date === date
          );
          row[date] = record ? record.status : "-";
        });
        return row;
      });

      setPreviewData({ rows, dates });

    } catch (err) {
      console.error(err);
      alert("Failed to fetch attendance ❌");
    }
  };

  // ================= DOWNLOAD EXCEL =================
  const downloadExcel = () => {
    if (!previewData) return;

    const worksheet = XLSX.utils.json_to_sheet(previewData.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `Attendance_${batchName}.xlsx`);
  };

  if (loading) return <div className="attendance-page">Loading...</div>;

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <h1>Mark Attendance</h1>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {savedSuccess && (
            <span style={{ color: "#22c55e", fontWeight: "600" }}>
              ✅ Saved!
            </span>
          )}
          {isToday && (
            <button className="save-btn" onClick={saveAttendance}>
              {Object.keys(attendance).length > 0 &&
              students.every((s) => attendance[String(s._id)])
                ? "Update Attendance"
                : "Save Attendance"}
            </button>
          )}
        </div>
      </div>

      {/* DATE SECTION */}
      <div className="date-section">
        <div className="date-input-wrapper">
          <span className="date-icon">📅</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setPreviousAttendance([]);
              setPreviewData(null);
            }}
            className="date-input"
          />
        </div>

        <button className="export-btn" onClick={previewExcel}>
          📊 Preview Excel
        </button>
      </div>

      {/* VIEW ONLY NOTICE */}
      {!isToday && (
        <div style={{
          background: "#fef3c7",
          border: "1px solid #f59e0b",
          borderRadius: "10px",
          padding: "10px 16px",
          marginBottom: "16px",
          color: "#92400e",
          fontWeight: "500"
        }}>
          👁 View only — You can only mark attendance for today ({today})
        </div>
      )}

      {students.length === 0 ? (
        <div className="empty-state">
          <h3>No students found</h3>
        </div>
      ) : (
        <div className="attendance-list">
          {students.map((student) => (
            <div key={student._id} className="student-row">
              <div className="student-info">
                {student.profileImage && (
                  <img
                    src={`http://localhost:5000${student.profileImage}`}
                    alt=""
                    className="attendance-avatar"
                  />
                )}
                <span>{student.name}</span>
              </div>

              <div className="actions">
                <button
                  className={`present ${
                    attendance[String(student._id)] === "Present" ? "active" : ""
                  }`}
                  onClick={() => markStatus(String(student._id), "Present")}
                  style={{ opacity: isToday ? 1 : 0.5, cursor: isToday ? "pointer" : "not-allowed" }}
                >
                  ✓
                </button>

                <button
                  className={`absent ${
                    attendance[String(student._id)] === "Absent" ? "active" : ""
                  }`}
                  onClick={() => markStatus(String(student._id), "Absent")}
                  style={{ opacity: isToday ? 1 : 0.5, cursor: isToday ? "pointer" : "not-allowed" }}
                >
                  ✗
                </button>

                <button
                  className={`late ${
                    attendance[String(student._id)] === "Late" ? "active" : ""
                  }`}
                  onClick={() => markStatus(String(student._id), "Late")}
                  style={{ opacity: isToday ? 1 : 0.5, cursor: isToday ? "pointer" : "not-allowed" }}
                >
                  Late
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EXCEL PREVIEW TABLE */}
      {previewData && (
        <div className="preview-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3>📊 Attendance Preview — {batchName}</h3>
            {/* ✅ ONLY CHANGE — new icon button classes */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                className="icon-btn-download"
                onClick={downloadExcel}
                title="Download Excel"
              >
                ⬇
              </button>
              <button
                className="icon-btn-close"
                onClick={() => setPreviewData(null)}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  {previewData.dates.map((date) => (
                    <th key={date}>{date}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.rows.map((row, i) => (
                  <tr key={i}>
                    <td><strong>{row["Student Name"]}</strong></td>
                    {previewData.dates.map((date) => (
                      <td key={date}>
                        <span style={{
                          color:
                            row[date] === "Present" ? "#22c55e" :
                            row[date] === "Absent" ? "#ef4444" :
                            row[date] === "Late" ? "#f59e0b" : "#94a3b8"
                        }}>
                          {row[date]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PREVIOUS SECTION */}
      {previousAttendance.length > 0 && (
        <div className="previous-section">
          <h3>
            Attendance —
            <span style={{ color: "#ff7a00", marginLeft: "8px" }}>
              {new Date(selectedDate).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </h3>

          {previousAttendance.map((item) => (
            <div key={item._id} className="previous-row">
              <div className="student-info">
                {item.studentId?.profileImage && (
                  <img
                    src={`http://localhost:5000${item.studentId.profileImage}`}
                    alt=""
                    className="attendance-avatar"
                  />
                )}
                <div>
                  <span>{item.studentId?.name}</span>
                  <p style={{ fontSize: "12px", opacity: 0.6, margin: 0 }}>
                    {item.date}
                  </p>
                </div>
              </div>

              <span className={`badge ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CoachAttendance;