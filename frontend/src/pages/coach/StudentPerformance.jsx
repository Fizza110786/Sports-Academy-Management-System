import { useState, useEffect } from "react";
import axios from "axios";
import ReactDOM from "react-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "./StudentPerformance.css";

function StudentPerformance() {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);

  const [student, setStudent] = useState("");
  const [batch, setBatch] = useState("");
  const [skill, setSkill] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchFeedback();
    fetchStudentsAndBatches();
  }, []);

  const fetchFeedback = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/performance?coachId=${user._id}`
      );
      setFeedbackList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentsAndBatches = async () => {
    try {
      const batchRes = await axios.get(
        `http://localhost:5000/api/batches/coach/${user._id}`
      );
      setBatches(batchRes.data);

      const allStudents = [];
      batchRes.data.forEach((b) => {
        b.students?.forEach((s) => {
          if (!allStudents.find((x) => x._id === s._id)) {
            allStudents.push(s);
          }
        });
      });
      setStudents(allStudents);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setStudent("");
    setBatch("");
    setSkill("");
    setRating(0);
    setComment("");
    setEditingId(null);
    setShowModal(false);
  };

  const handleSave = async () => {
    if (!student || !batch || !skill || !rating || !comment) {
      alert("Please fill all fields");
      return;
    }

    try {
      // ✅ FIX: get selected student object
      const selectedStudent = students.find((s) => s.name === student);

      const payload = {
        studentName: student,
        studentId: selectedStudent?._id, // ✅ ADDED (CRITICAL FIX)
        batchName: batch,
        skill,
        rating,
        comment,
        coachId: user._id,
      };

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/performance/${editingId}`,
          payload
        );
      } else {
        await axios.post("http://localhost:5000/api/performance", payload);
      }

      fetchFeedback();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setStudent(item.studentName);
    setBatch(item.batchName);
    setSkill(item.skill);
    setRating(item.rating);
    setComment(item.comment);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/performance/${id}`);
      fetchFeedback();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="performance-page">
      <div className="performance-header">
        <div>
          <h1>Student Performance</h1>
          <p>Track and record student progress</p>
        </div>

        <button
          className="add-btn"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add Feedback
        </button>
      </div>

      <div className="performance-list">
        {feedbackList.length === 0 && (
          <p style={{ opacity: 0.6 }}>No feedback added yet</p>
        )}

        {feedbackList.map((item) => (
          <div key={item._id} className="performance-card">
            <div className="card-icon">📈</div>

            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr auto", gap: "0 16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h4 style={{ margin: 0, fontWeight: 600 }}>{item.studentName}</h4>
                <span style={{ fontSize: "13px", opacity: 0.6 }}>
                  {item.batchName} • {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <p style={{ margin: "4px 0 0 0", fontSize: "14px", opacity: 0.85 }}>
                  {item.comment}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                <div className="skill-badge">{item.skill}</div>
                <div style={{ display: "flex", gap: "3px" }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span
                      key={num}
                      style={{ fontSize: "18px", color: num <= item.rating ? "#facc15" : "#cbd5e1" }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="perf-btn edit" onClick={() => handleEdit(item)} title="Edit">
                    <FiEdit2 size={14} />
                  </button>
                  <button className="perf-btn delete" onClick={() => handleDelete(item._id)} title="Delete">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && ReactDOM.createPortal(
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingId ? "Edit Feedback" : "Add Feedback"}</h3>

            <select value={student} onChange={(e) => setStudent(e.target.value)}>
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s._id} value={s.name}>{s.name}</option>
              ))}
            </select>

            <select value={batch} onChange={(e) => setBatch(e.target.value)}>
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b._id} value={b.name}>{b.name}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            />

            <div className="modal-rating">
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={num}
                  className={`star clickable ${num <= rating ? "filled" : ""}`}
                  onClick={() => setRating(num)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              placeholder="Comments..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={resetForm}>Cancel</button>
              <button className="save-feedback" onClick={handleSave}>
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default StudentPerformance;