import { useEffect, useState } from "react";
import axios from "axios";
import "./PaymentHistory.css";
import { FiDownload } from "react-icons/fi";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payments");
      const myPayments = res.data.filter(
        (p) => p.student?._id === user._id || p.student === user._id
      );
      setPayments(myPayments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ open screenshot using window.open instead of <a> tag
  const handleDownload = (screenshotUrl) => {
    window.open(`http://localhost:5000${screenshotUrl}`, "_blank");
  };

  if (loading) return <div className="payment-history-page">Loading...</div>;

  return (
    <div className="payment-history-page">
      <div className="page-header">
        <h1>Payment History</h1>
        <p>View all your fee transactions</p>
      </div>

      <div className="history-card">
        {payments.length === 0 ? (
          <p style={{ padding: "20px", opacity: 0.6 }}>
            No payment records found
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>₹{p.amount}</td>
                  <td>
                    {p.date
                      ? new Date(p.date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>{p.method || "-"}</td>
                  <td>{p.transactionId || "-"}</td>
                  <td>
                    <span className={`status ${p.status?.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {/* ✅ FIXED — using onClick instead of <a> tag */}
                    {p.screenshot ? (
                      <FiDownload
                        className="download-icon"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDownload(p.screenshot)}
                      />
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}