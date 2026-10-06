import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "./AdminDashboard.css";
import "./ManageUsers.css";
import { FiEdit, FiTrash2 } from "react-icons/fi";

export default function ManageUsers() {
  const location = useLocation();
  const [activeRole, setActiveRole] = useState(location.state?.role || "student");
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    name: "", email: "", password: "", role: "student", batch: "",
    profileImage: null, phone: "", emergencyContact: "", dob: "", gender: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchBatches = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/batches");
      setBatches(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchUsers(); fetchBatches(); }, []);

  const filteredUsers = users
    .filter((u) => u.role === activeRole)
    .sort((a, b) => {
      const batchA = a.batch?.name || "zzz";
      const batchB = b.batch?.name || "zzz";
      return batchA.localeCompare(batchB);
    });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, profileImage: file });
    setPreview(URL.createObjectURL(file));
  };

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return alert("Please enter a name");
    if (!form.email.trim()) return alert("Please enter an email");
    if (!editUser && !form.password.trim()) return alert("Please enter a password");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      if (form.password) formData.append("password", form.password);
      formData.append("role", form.role);
      formData.append("phone", form.phone);
      formData.append("emergencyContact", form.emergencyContact);
      formData.append("dob", form.dob);
      formData.append("gender", form.gender);

      // ✅ only append batch if it has a value — empty string causes backend error for coach/admin
      if (form.batch && form.batch.trim() !== "") {
        formData.append("batch", form.batch);
      }

      if (form.profileImage) formData.append("profileImage", form.profileImage);

      if (editUser) {
        await axios.put(`http://localhost:5000/api/users/${editUser._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      } else {
        await axios.post("http://localhost:5000/api/users", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      await fetchUsers();
      setShowModal(false);
      setEditUser(null);
      setForm(emptyForm);
      setPreview(null);
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      alert("Failed to save user ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (u) => {
    setEditUser(u);
    setForm({
      name: u.name || "",
      email: u.email || "",
      password: "",
      role: u.role || "student",
      batch: u.batch?._id || "",
      profileImage: null,
      phone: u.phone || "",
      emergencyContact: u.emergencyContact || "",
      dob: u.dob || "",
      gender: u.gender || "",
    });
    setPreview(u.profileImage ? `http://localhost:5000${u.profileImage}` : null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      await fetchUsers();
    } catch (err) { console.log(err); }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditUser(null);
    setForm(emptyForm);
    setPreview(null);
  };

  const overlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
  };

  const boxStyle = {
    background: "var(--card, #fff)",
    color: "var(--text, #111)",
    borderRadius: "16px",
    padding: "24px",
    width: "420px",
    maxWidth: "90vw",
    maxHeight: "85vh",
    overflowY: "auto",
    border: "1px solid var(--border, #e5e7eb)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid var(--border, #e5e7eb)",
    background: "var(--bg, #fff)",
    color: "var(--text, #111)",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>User Management</h1>
        <button
          className="primary-btn"
          onClick={() => { setEditUser(null); setForm(emptyForm); setPreview(null); setShowModal(true); }}
        >
          + Add User
        </button>
      </div>

      <div className="role-tabs">
        {["admin", "coach", "student"].map((role) => (
          <button
            key={role}
            className={activeRole === role ? "role-btn active" : "role-btn"}
            onClick={() => setActiveRole(role)}
          >
            {role.toUpperCase()}S
          </button>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th><th>Name</th><th>Email</th>
              <th>Phone</th><th>Age</th><th>Batch</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u._id} style={{ cursor: "pointer" }} onClick={() => setViewUser(u)}>
                <td>
                  {u.profileImage ? (
                    <img src={`http://localhost:5000${u.profileImage}`} alt="profile"
                      style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%", background: "#ff7a18",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: "600", fontSize: "16px"
                    }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || "-"}</td>
                <td>{calculateAge(u.dob)}</td>
                <td>{u.batch?.name || "-"}</td>
                <td>
                  <div className="action-btns">
                    <button className="prog-edit-btn" title="Edit"
                      onClick={(e) => { e.stopPropagation(); handleEdit(u); }}>
                      <FiEdit />
                    </button>
                    <button className="prog-delete-btn" title="Delete"
                      onClick={(e) => { e.stopPropagation(); handleDelete(u._id); }}>
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "30px", opacity: 0.6 }}>
                  No {activeRole}s found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewUser && ReactDOM.createPortal(
        <div style={overlayStyle} onClick={() => setViewUser(null)}>
          <div style={{ ...boxStyle, width: "500px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0 }}>User Details</h3>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              {viewUser.profileImage ? (
                <img src={`http://localhost:5000${viewUser.profileImage}`} alt="profile"
                  style={{ width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: "72px", height: "72px", borderRadius: "50%", background: "#ff7a18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "26px", fontWeight: "600", flexShrink: 0
                }}>
                  {viewUser.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 style={{ margin: 0 }}>{viewUser.name}</h2>
                <p style={{ margin: "4px 0 0", opacity: 0.6 }}>{viewUser.role}</p>
              </div>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid var(--border, #e5e7eb)", margin: "4px 0" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { label: "Email", value: viewUser.email },
                { label: "Phone", value: viewUser.phone || "-" },
                { label: "Date of Birth", value: viewUser.dob || "-" },
                { label: "Age", value: calculateAge(viewUser.dob) },
                { label: "Gender", value: viewUser.gender || "-" },
                { label: "Batch", value: viewUser.batch?.name || "-" },
                { label: "Emergency Contact", value: viewUser.emergencyContact || "-" },
                { label: "Role", value: viewUser.role },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ opacity: 0.6, fontSize: "12px", margin: "0 0 3px" }}>{label}</p>
                  <p style={{ margin: 0, fontWeight: 500 }}>{value}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <button className="primary-btn" onClick={() => setViewUser(null)}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && ReactDOM.createPortal(
        <div style={overlayStyle} onClick={closeModal}>
          <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0 }}>{editUser ? "Edit User" : "Add User"}</h3>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {preview ? (
                <img src={preview} alt="preview"
                  style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%", background: "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", color: "#94a3b8", flexShrink: 0
                }}>👤</div>
              )}
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: "13px" }} />
            </div>

            <input style={inputStyle} name="name" placeholder="Full Name *" value={form.name} onChange={handleChange} />
            <input style={inputStyle} name="email" placeholder="Email Address *" value={form.email} onChange={handleChange} />
            <input style={inputStyle} type="password" name="password"
              placeholder={editUser ? "New Password (leave blank to keep)" : "Password *"}
              value={form.password} onChange={handleChange} />
            <input style={inputStyle} name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
            <input style={inputStyle} name="emergencyContact" placeholder="Emergency Contact" value={form.emergencyContact} onChange={handleChange} />
            <input style={inputStyle} name="dob" type="date" value={form.dob} onChange={handleChange} />

            <select style={inputStyle} name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <select style={inputStyle} name="role" value={form.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="coach">Coach</option>
              <option value="student">Student</option>
            </select>

            {/* ✅ only show batch selector for students */}
            {form.role === "student" && (
              <select style={inputStyle} name="batch" value={form.batch} onChange={handleChange}>
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button
                className="primary-btn"
                onClick={handleSubmit}
                disabled={saving}
                style={{ opacity: saving ? 0.7 : 1, minWidth: "90px" }}
              >
                {saving ? "Saving..." : editUser ? "Update" : "Save"}
              </button>
              <button
                onClick={closeModal}
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
        </div>,
        document.body
      )}
    </div>
  );
}