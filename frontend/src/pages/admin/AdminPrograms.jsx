import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import "./AdminPrograms.css";
import { FiTrash2, FiPlus, FiEdit2 } from "react-icons/fi";

export default function AdminPrograms() {
  const emptyForm = {
    name: "",
    fee: "",
    category: "",
  };

  const [programs, setPrograms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // ================= FETCH =================
  const fetchPrograms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/programs");
      setPrograms(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    try {
      if (!form.name) return;

      if (editItem) {
        await axios.put(
          `http://localhost:5000/api/programs/${editItem._id}`,
          { ...form, fee: Number(form.fee) }
        );
      } else {
        await axios.post("http://localhost:5000/api/programs", {
          ...form,
          fee: Number(form.fee),
        });
      }

      fetchPrograms();
      setShowModal(false);
      setEditItem(null);
      setForm(emptyForm);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (p) => {
    setEditItem(p);
    setForm({
      name: p.name,
      fee: p.fee,
      category: p.category || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/programs/${id}`);
      fetchPrograms();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Programs</h1>
          <p className="subtitle">Manage academy programs</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            setEditItem(null);
            setForm(emptyForm);
            setShowModal(true);
          }}
        >
          <FiPlus /> Add Program
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Fee</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {programs.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.category || "-"}</td>
              <td>₹{p.fee}</td>
              <td>
                <div className="action-btns">
                  <button
                    className="prog-edit-btn"
                    onClick={() => handleEdit(p)}
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    className="prog-delete-btn"
                    onClick={() => handleDelete(p._id)}
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
            <h3>{editItem ? "Edit Program" : "Add Program"}</h3>

            <input
              name="name"
              placeholder="Program Name"
              value={form.name}
              onChange={handleChange}
            />

            <input
              name="fee"
              type="number"
              placeholder="Fee"
              value={form.fee}
              onChange={handleChange}
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
            </select>

            <div className="modal-actions">
              <button className="primary-btn" onClick={handleSubmit}>
                {editItem ? "Update" : "Save"}
              </button>

              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}