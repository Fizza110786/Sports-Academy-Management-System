import { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import "./CoachAnnouncements.css";

export default function CoachAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    targetRole: "Student",
    batchId: ""
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const fetchAnnouncements = async () => {
    const res = await axios.get("http://localhost:5000/api/announcements");
    setAnnouncements(res.data);
  };

  const fetchBatches = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/batches/coach/${user._id}`
    );
    setBatches(res.data);
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchBatches();
  }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item._id);
      setForm({
        title: item.title,
        message: item.message,
        targetRole: "Student",
        batchId: item.batchId || ""
      });
    } else {
      setEditingId(null);
      setForm({
        title: "",
        message: "",
        targetRole: "Student",
        batchId: ""
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.message)
      return alert("Fill all fields");

    if (!form.batchId)
      return alert("Please select batch");

    if (editingId) {
      await axios.put(
        `http://localhost:5000/api/announcements/${editingId}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await axios.post(
        "http://localhost:5000/api/announcements",
        {
          ...form,
          createdBy: user._id,
          postedBy: user.name,
          postedRole: user.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    setShowModal(false);
    fetchAnnouncements();
  };

  const handleDelete = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/announcements/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchAnnouncements();
  };

  return (
    <div className="announcement-page">
      <div className="announcement-header">
        <h1>Announcements</h1>
        <button className="create-btn" onClick={() => openModal()}>
          <FiPlus /> Create Announcement
        </button>
      </div>

      <div className="announcement-list">
        {announcements.length === 0 ? (
          <p className="no-data">No announcements yet</p>
        ) : (
          announcements.map((item) => {
            const isOwner = item.postedBy === user.name;

            const isWithin24Hours =
              new Date() - new Date(item.createdAt) < 24 * 60 * 60 * 1000;

            const isEdited =
              new Date(item.updatedAt).getTime() !==
              new Date(item.createdAt).getTime();

            return (
              <div key={item._id} className="announcement-card">
                <div className="card-left">
                  <h3>{item.title}</h3>
                  <p>{item.message}</p>

                  <small>
                    {item.postedBy
                      ? `Posted by ${item.postedBy} • `
                      : item.createdBy?.name
                      ? `Posted by ${item.createdBy.name} • `
                      : ""}
                    {new Date(item.createdAt).toLocaleDateString()}
                    {isEdited && " • Edited"}
                  </small>
                </div>

                <div className="card-right">
                  <div className="card-actions">

                    {isOwner && isWithin24Hours && (
                      <>
                        <button
                          className="ann-btn edit"
                          onClick={() => openModal(item)}
                        >
                          <FiEdit2 size={14} />
                        </button>

                        <button
                          className="ann-btn delete"
                          onClick={() => handleDelete(item._id)}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </>
                    )}

                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-box">
            <h3>
              {editingId ? "Edit Announcement" : "Create Announcement"}
            </h3>

            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <textarea
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />

            <select
              value={form.batchId}
              onChange={(e) => setForm({ ...form, batchId: e.target.value })}
            >
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>

            <select value="Student" disabled>
              <option>Student</option>
            </select>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button className="save-btn" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}