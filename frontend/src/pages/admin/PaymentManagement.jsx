import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import "./PaymentManagement.css";
import { FiCheck, FiX, FiEye } from "react-icons/fi";

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [viewScreenshot, setViewScreenshot] = useState(null);

  // ================= LOAD PAYMENTS =================
  const fetchPayments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payments");
      setPayments(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // ================= SUMMARY =================
  const stats = useMemo(() => {
    let collected = 0,
      pending = 0,
      rejected = 0;

    payments.forEach((p) => {
      if (p.status === "Verified") collected += p.amount;
      else if (p.status === "Pending") pending += p.amount;
      else rejected += p.amount;
    });

    return { collected, pending, rejected };
  }, [payments]);

  // ================= STATUS UPDATE =================
  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/payments/${id}`, { status });
      fetchPayments();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h1>Payment Management</h1>
          <p className="subtitle">Verify, reject and manage payments</p>
        </div>
      </div>

      {/* ================= CARDS ================= */}
      <div className="revenue-grid">
        <div className="revenue-card">
          <p>Total Collected</p>
          <h2 className="green">₹{stats.collected}</h2>
        </div>

        <div className="revenue-card">
          <p>Pending Verification</p>
          <h2 className="orange">₹{stats.pending}</h2>
        </div>

        <div className="revenue-card">
          <p>Rejected</p>
          <h2 className="red">₹{stats.rejected}</h2>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="fee-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Method</th>
              <th>Transaction ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td>{p.student?.name}</td>
                <td>₹{p.amount}</td>
                <td>{new Date(p.date).toLocaleDateString()}</td>
                <td>{p.method}</td>
                <td>{p.transactionId || "-"}</td>

                <td>
                  <span className={`status-badge ${p.status.toLowerCase()}`}>
                    {p.status}
                  </span>
                </td>

                <td>
                  <div className="action-btns">

                    {/* ✅ VIEW SCREENSHOT */}
                    {p.screenshot && (
                      <button
                        className="prog-edit-btn"
                        title="View Screenshot"
                        onClick={() => setViewScreenshot(p.screenshot)}
                      >
                        <FiEye />
                      </button>
                    )}

                    {/* ✅ VERIFY */}
                    {p.status === "Pending" && (
                      <button
                        style={{
                          background: "#22c55e",
                          border: "none",
                          color: "white",
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "15px",
                        }}
                        title="Verify"
                        onClick={() => updateStatus(p._id, "Verified")}
                      >
                        <FiCheck />
                      </button>
                    )}

                    {/* ✅ REJECT */}
                    {p.status === "Pending" && (
                      <button
                        style={{
                          background: "#ef4444",
                          border: "none",
                          color: "white",
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "15px",
                        }}
                        title="Reject"
                        onClick={() => updateStatus(p._id, "Rejected")}
                      >
                        <FiX />
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            ))}

            {payments.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No payments
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= SCREENSHOT MODAL ================= */}
      {viewScreenshot && (
        <div className="modal">
          <div className="modal-content">
            <h3>Payment Screenshot</h3>

            <img
              src={`http://localhost:5000${viewScreenshot}`}
              alt="screenshot"
              style={{
                width: "100%",
                borderRadius: "10px",
                marginTop: "10px",
              }}
            />

            <div className="modal-actions">
              <button onClick={() => setViewScreenshot(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}