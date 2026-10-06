import { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import "./AdminDashboard.css";
import "./Reports.css";

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ec4899", "#14b8a6"];

export default function Reports() {
  const [range, setRange] = useState("This Month");

  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeStudents: 0,
    avgAttendance: 0,
    growthRate: 0,
  });

  const [revenueTrend, setRevenueTrend]       = useState([]);
  const [revenueByProgram, setRevenueByProgram] = useState([]);
  const [loading, setLoading]                 = useState(true);

  // ================= FETCH REPORTS =================
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/reports?range=${range}`
        );

        setStats({
          totalRevenue   : res.data.totalRevenue   || 0,
          activeStudents : res.data.activeStudents || 0,
          avgAttendance  : res.data.avgAttendance  || 0,
          growthRate     : res.data.growthRate     || 0,
        });

        setRevenueTrend(res.data.revenueTrend       || []);
        setRevenueByProgram(res.data.revenueByProgram || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [range]);

  // ================= EXPORT CSV =================
  const handleExport = () => {
    if (revenueTrend.length === 0) return alert("No data to export.");
    const rows = [
      ["Period", "Revenue"],
      ...revenueTrend.map((r) => [r.month, r.revenue]),
    ];
    const csv     = rows.map((r) => r.join(",")).join("\n");
    const blob    = new Blob([csv], { type: "text/csv" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href        = url;
    a.download    = `report-${range.replace(" ", "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const growthColor = stats.growthRate >= 0 ? "#22c55e" : "#ef4444";

  return (
    <div className="admin-dashboard">
      {/* ================= HEADER ================= */}
      <div className="admin-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="subtitle">Comprehensive reports and insights</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>

          <button className="primary-btn" onClick={handleExport}>
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="revenue-grid">
        <div className="revenue-card">
          <p>💰 Total Revenue</p>
          <h2>₹{stats.totalRevenue.toLocaleString()}</h2>
        </div>

        <div className="revenue-card">
          <p>🎓 Active Students</p>
          <h2>{stats.activeStudents}</h2>
        </div>

        <div className="revenue-card">
          <p>📅 Avg Attendance</p>
          <h2>
            {stats.avgAttendance > 0 ? `${stats.avgAttendance}%` : "—"}
          </h2>
        </div>

        <div className="revenue-card">
          <p>📈 Growth Rate</p>
          <h2 style={{ color: growthColor }}>
            {stats.growthRate > 0 ? "+" : ""}{stats.growthRate}%
          </h2>
        </div>
      </div>

      {/* ================= CHARTS ================= */}
      <div className="charts">

        {/* REVENUE TREND */}
        <div className="chart-card">
          <h3>Revenue Trend</h3>
          <p className="subtitle" style={{ marginBottom: "12px" }}>
            {range === "This Month" ? "Daily collection" : "Monthly collection"}
          </p>

          {loading ? (
            <p style={{ opacity: 0.5 }}>Loading...</p>
          ) : revenueTrend.every((r) => r.revenue === 0) ? (
            <p style={{ opacity: 0.5 }}>No revenue data for this period</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  fill="rgba(249,115,22,0.15)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* REVENUE BY PROGRAM */}
        <div className="chart-card">
          <h3>Revenue by Program</h3>
          <p className="subtitle" style={{ marginBottom: "12px" }}>
            Fee collection per program
          </p>

          {loading ? (
            <p style={{ opacity: 0.5 }}>Loading...</p>
          ) : revenueByProgram.length === 0 ? (
            <p style={{ opacity: 0.5 }}>No program revenue data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByProgram}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {revenueByProgram.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}