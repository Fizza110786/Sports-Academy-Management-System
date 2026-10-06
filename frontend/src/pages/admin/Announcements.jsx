import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import "./Announcements.css";
import { FiTrash2, FiEdit2 } from "react-icons/fi";

export default function AnnouncementManagement() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const emptyForm = {
    title: "",
    message: "",
    audience: "All",
  };

  const [form, setForm] = useState(emptyForm);

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/announcements");
      setItems(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (editItem) {
      await axios.put(
        `http://localhost:5000/api/announcements/${editItem._id}`,
        { ...form, postedBy: user?.name, postedRole: user?.role }
      );
    } else {
      await axios.post("http://localhost:5000/api/announcements", {
        ...form,
        postedBy: user?.name,
        postedRole: user?.role,
      });
    }
    setShowModal(false);
    setEditItem(null);
    setForm(emptyForm);
    fetchAnnouncements();
  };

  const handleEdit = (a) => {
    setEditItem(a);
    setForm({
      title: a.title,
      message: a.message,
      audience: a.audience,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/announcements/${id}`);
    fetchAnnouncements();
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Announcements</h1>
          <p className="subtitle">Important updates and notifications</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            setEditItem(null);
            setForm(emptyForm);
            setShowModal(true);
          }}
        >
          + New Announcement
        </button>
      </div>

      <div className="announcement-list">
        {items.map((a) => {
          const isOwner =
            a.postedBy === user?.name && a.postedRole === user?.role;

          const isWithin24Hours =
            new Date() - new Date(a.createdAt) < 24 * 60 * 60 * 1000;

          const isEdited =
            new Date(a.updatedAt).getTime() !==
            new Date(a.createdAt).getTime();

          return (
            <div key={a._id} className="announcement-card">
              <div className="card-left">
                <h3>{a.title}</h3>
                <p>{a.message}</p>

                <small>
                  {a.postedBy
                    ? `Posted by ${a.postedBy} • `
                    : "Posted by Admin • "}
                  {new Date(a.createdAt).toLocaleDateString()}
                  {isEdited && " • Edited"}
                </small>
              </div>

              <div className="card-right">
                <span className="badge">{a.audience}</span>

                {isOwner && isWithin24Hours && (
                  <div className="card-actions-row">
                    <button
                      className="ann-btn edit"
                      onClick={() => handleEdit(a)}
                      title="Edit"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button
                      className="ann-btn delete"
                      onClick={() => handleDelete(a._id)}
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editItem ? "Edit Announcement" : "New Announcement"}</h3>

            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
            />

            <textarea
              name="message"
              placeholder="Message"
              value={form.message}
              onChange={handleChange}
            />

            <select
              name="audience"
              onChange={handleChange}
              value={form.audience}
            >
              <option>All</option>
              <option>Students</option>
              <option>Coaches</option>
            </select>

            <div className="modal-actions">
              <button className="primary-btn" onClick={handleSubmit}>
                {editItem ? "Update" : "Save"}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditItem(null);
                  setForm(emptyForm);
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