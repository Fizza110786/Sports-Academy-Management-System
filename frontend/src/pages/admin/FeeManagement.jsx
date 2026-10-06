import { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import "./AdminDashboard.css";
import "./FeeManagement.css";

export default function FeeManagement() {

  const [programs, setPrograms] = useState([]);

  // ================= QR STATES =================
  const [showQR, setShowQR] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [plan, setPlan] = useState("monthly");
  const [amount, setAmount] = useState(0);

  // ================= FETCH PROGRAMS =================
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

  // ================= AUTO UPDATE AMOUNT =================
  useEffect(() => {
    setShowQRCode(false);
    if (!selectedProgram) {
      setAmount(0);
      return;
    }
    const program = programs.find(
      (p) => p.name.toLowerCase() === selectedProgram.toLowerCase()
    );
    if (program) {
      const baseFee = Number(program.fee) || 0;
      // ✅ ONLY CHANGE — yearly is base, divide for monthly/quarterly
      if (plan === "monthly") setAmount(Math.round(baseFee / 12));
      if (plan === "quarterly") setAmount(Math.round(baseFee / 4));
      if (plan === "yearly") setAmount(baseFee);
    } else {
      setAmount(0);
    }
  }, [selectedProgram, plan, programs]);

  // ================= UPI STRING =================
  const upiString =
    selectedProgram && amount
      ? `upi://pay?pa=academy@upi&pn=Sports Academy&am=${amount}&cu=INR`
      : "";

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h1>Fee Structure</h1>
          <p className="subtitle">
            Fee structure for all programs
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            setShowQR(true);
            setShowQRCode(false);
            setSelectedProgram("");
            setAmount(0);
          }}
        >
          Generate QR Code
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="fee-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Program</th>
              <th>Monthly</th>
              <th>Quarterly</th>
              <th>Yearly</th>
            </tr>
          </thead>

          <tbody>
            {programs.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                {/* ✅ ONLY CHANGE — yearly is base fee, divide for others */}
                <td>₹{Math.round(Number(p.fee) / 12) || 0}</td>
                <td>₹{Math.round(Number(p.fee) / 4) || 0}</td>
                <td>₹{Number(p.fee) || 0}</td>
              </tr>
            ))}

            {programs.length === 0 && (
              <tr>
                <td colSpan="4" className="no-data">
                  No programs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= QR MODAL ================= */}
      {showQR && (
        <div className="modal">
          <div className="modal-content">
            <h3>Generate Payment QR</h3>

            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p._id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>

            <select value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>

            <input value={amount} readOnly placeholder="Amount" />

            {selectedProgram && amount > 0 && (
              <button
                className="primary-btn"
                style={{ width: "100%", marginTop: "10px" }}
                onClick={() => setShowQRCode(true)}
              >
                Generate QR
              </button>
            )}

            {showQRCode && upiString && (
              <div style={{ margin: "20px auto", textAlign: "center" }}>
                <QRCode value={upiString} size={200} />
              </div>
            )}

            <div className="modal-actions">
              <button onClick={() => setShowQR(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}