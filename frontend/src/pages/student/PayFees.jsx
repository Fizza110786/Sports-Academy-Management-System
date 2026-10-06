import { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import "./PayFees.css";

function PayFees() {
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [payments, setPayments] = useState([]);
  const [plan, setPlan] = useState("monthly");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const upiId = "fizza.fathima550@kotak";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const progRes = await axios.get("http://localhost:5000/api/programs");
      setPrograms(progRes.data);

      const batchRes = await axios.get("http://localhost:5000/api/batches");
      const myBatch = batchRes.data.find((b) =>
        b.students?.some((s) => s._id === user._id || s === user._id)
      );

      if (myBatch) {
        const progName = myBatch.program?.name || myBatch.program;
        const prog = progRes.data.find(
          (p) =>
            p.name === progName ||
            p._id === myBatch.program?._id ||
            p._id === myBatch.program
        );
        if (prog) setSelectedProgram(prog);
      }

      const payRes = await axios.get("http://localhost:5000/api/payments");
      const myPayments = payRes.data.filter(
        (p) => p.student?._id === user._id || p.student === user._id
      );
      setPayments(myPayments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalFee = selectedProgram ? Number(selectedProgram.fee) : 0;

  const paidAmount = payments
    .filter((p) => p.status === "Verified")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const remainingAmount = Math.max(0, totalFee - paidAmount);
  const pendingAmount = remainingAmount;
  const isFullyPaid = remainingAmount === 0;

  useEffect(() => {
    if (!selectedProgram) return;
    const base = Number(selectedProgram.fee) || 0;

    let calculated = 0;
    if (plan === "monthly") calculated = Math.round(base / 12);
    if (plan === "quarterly") calculated = Math.round(base / 4);
    if (plan === "yearly") calculated = base;

    const capped = Math.min(calculated, remainingAmount);
    setAmount(capped);
  }, [plan, selectedProgram, payments]);

  const upiString =
    amount > 0
      ? `upi://pay?pa=${upiId}&pn=Sports Academy&am=${amount}&cu=INR`
      : "";

  const handleSubmit = async () => {
    if (!transactionId) return alert("Enter Transaction ID");
    if (!amount) return alert("Select program");
    if (!screenshot) return alert("Upload screenshot ❗");

    if (isFullyPaid) {
      return alert("Your fees are already fully paid! No payment needed.");
    }

    if (amount > remainingAmount) {
      return alert(`You can only pay up to ₹${remainingAmount} (remaining balance).`);
    }

    try {
      const formData = new FormData();
      formData.append("student", user._id);
      formData.append("amount", amount);
      formData.append("method", "UPI");
      formData.append("status", "Pending");
      formData.append("transactionId", transactionId);
      formData.append("date", new Date().toISOString());
      formData.append("screenshot", screenshot);

      // ✅ FIXED — added Content-Type header so multer receives the file
      await axios.post("http://localhost:5000/api/payments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Payment submitted ✅");
      setTransactionId("");
      setScreenshot(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error submitting payment ❌");
    }
  };

  if (loading) return <div className="payfees-page">Loading...</div>;

  return (
    <div className="payfees-page">

      <div className="payfees-header">
        <div>
          <h1>Pay Fees</h1>
          <p>Make fee payment using UPI</p>
        </div>
      </div>

      <div className="fees-overview">
        <div className="overview-card total">
          <p>Total Fees</p>
          <h3>₹{totalFee}</h3>
        </div>
        <div className="overview-card paid">
          <p>Paid</p>
          <h3>₹{paidAmount}</h3>
        </div>
        <div className="overview-card pending">
          <p>Remaining</p>
          <h3>₹{pendingAmount}</h3>
        </div>
      </div>

      {isFullyPaid ? (
        <div style={{
          marginTop: "30px",
          padding: "30px",
          borderRadius: "16px",
          background: "rgba(34,197,94,0.08)",
          border: "1px solid #22c55e",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
          <h2 style={{ color: "#22c55e", margin: "0 0 8px" }}>Fees Fully Paid!</h2>
          <p style={{ opacity: 0.7 }}>
            You have paid ₹{paidAmount} out of ₹{totalFee}. No further payment is needed.
          </p>
        </div>
      ) : (
        <div className="payment-section">
          <h2>Pay Fees</h2>

          <div className="form-group">
            <label>Select Program</label>
            <select
              value={selectedProgram?._id || ""}
              onChange={(e) => {
                const prog = programs.find((p) => p._id === e.target.value);
                setSelectedProgram(prog || null);
              }}
            >
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — ₹{p.fee}/year
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Plan</label>
            <select value={plan} onChange={(e) => setPlan(e.target.value)}>
              <option value="monthly">
                Monthly — ₹{selectedProgram ? Math.min(Math.round(Number(selectedProgram.fee) / 12), remainingAmount) : 0}
              </option>
              <option value="quarterly">
                Quarterly — ₹{selectedProgram ? Math.min(Math.round(Number(selectedProgram.fee) / 4), remainingAmount) : 0}
              </option>
              <option value="yearly">
                Yearly — ₹{selectedProgram ? Math.min(Number(selectedProgram.fee), remainingAmount) : 0}
              </option>
            </select>
          </div>

          {selectedProgram && (
            <div style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: "rgba(249,115,22,0.08)",
              border: "1px solid rgba(249,115,22,0.3)",
              fontSize: "14px",
              marginBottom: "8px",
              color: "#f97316",
            }}>
              Remaining balance: ₹{remainingAmount} — amount capped to avoid overpayment
            </div>
          )}

          {upiString ? (
            <div className="qr-box">
              <QRCode value={upiString} size={200} />
              <p>Scan to pay ₹{amount}</p>
            </div>
          ) : (
            <div className="qr-box">
              <div className="qr-placeholder">Select program to generate QR</div>
            </div>
          )}

          <div className="upi-row">
            <input value={upiId} readOnly />
            <button onClick={() => navigator.clipboard.writeText(upiId)}>Copy</button>
          </div>

          <div className="form-group">
            <label>Transaction ID</label>
            <input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Upload Screenshot</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files[0])}
            />
          </div>

          <button className="submit-btn" onClick={handleSubmit}>
            Submit Payment
          </button>
        </div>
      )}
    </div>
  );
}

export default PayFees;