import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import "./ManageBatches.css";
import { FiTrash2, FiEdit2 } from "react-icons/fi";

export default function ManageBatches() {
  const emptyForm = {
    name: "",
    program: "",
    coach: "",
    ageGroup: "",
    status: "Active",
  };

  const [batches, setBatches] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [coaches, setCoaches] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editBatch, setEditBatch] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchBatches = async () => {
    const res = await axios.get("http://localhost:5000/api/batches");
    setBatches(res.data);
  };

  const fetchPrograms = async () => {
    const res = await axios.get("http://localhost:5000/api/programs");
    setPrograms(res.data);
  };

  const fetchCoaches = async () => {
    const res = await axios.get("http://localhost:5000/api/users");
    setCoaches(res.data.filter((u) => u.role === "coach"));
  };

  useEffect(() => {
    fetchBatches();
    fetchPrograms();
    fetchCoaches();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (editBatch) {
      await axios.put(
        `http://localhost:5000/api/batches/${editBatch._id}`,
        form
      );
    } else {
      await axios.post("http://localhost:5000/api/batches", form);
    }

    fetchBatches();
    setShowModal(false);
    setEditBatch(null);
    setForm(emptyForm);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/batches/${id}`);
    fetchBatches();
  };

  const handleEdit = (b) => {
    setEditBatch(b);

    setForm({
      name: b.name,
      program: b.program?._id || "",
      coach: b.coach?._id || "",
      ageGroup: b.ageGroup || "",
      status: b.status,
    });

    setShowModal(true);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Batch Management</h1>

        <button
          className="primary-btn"
          onClick={() => {
            setEditBatch(null);
            setForm(emptyForm);
            setShowModal(true);
          }}
        >
          + Create Batch
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: "30%" }}>Name</th> {/* ✅ FIX */}
            <th>Program</th>
            <th>Coach</th>
            <th>Age Group</th>
            <th>Students</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {batches.map((b) => (
            <tr key={b._id}>
              
              {/* ✅ FIX */}
              <td style={{ whiteSpace: "normal", width: "30%" }}>
                {b.name}
              </td>

              <td>{b.program?.name}</td>
              <td>{b.coach?.name}</td>
              <td>{b.ageGroup?.name || b.ageGroup || "-"}</td>
              <td>{b.students?.length || 0}</td>

              <td>
                <div className="action-btns">
                  <button
                    className="prog-edit-btn"
                    onClick={() => handleEdit(b)}
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    className="prog-delete-btn"
                    onClick={() => handleDelete(b._id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editBatch ? "Edit Batch" : "Create Batch"}</h3>

            <input
              name="name"
              placeholder="Batch Name"
              value={form.name}
              onChange={handleChange}
            />

            <select name="program" value={form.program} onChange={handleChange}>
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select name="ageGroup" value={form.ageGroup} onChange={handleChange}>
              <option value="">Select Age Group</option>
              <option value="Under 12">Under 12</option>
              <option value="Under 18">Under 18</option>
              <option value="Adult">Adult</option>
              <option value="All Ages">All Ages</option>
            </select>

            <select name="coach" value={form.coach} onChange={handleChange}>
              <option value="">Select Coach</option>
              {coaches.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button className="primary-btn" onClick={handleSubmit}>
                {editBatch ? "Update" : "Save"}
              </button>

              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}