const User = require("../models/User");
const Program = require("../models/Program");
const Payment = require("../models/Payment");

exports.getReports = async (req, res) => {
  try {
    const { range } = req.query;

    // ================= DATE RANGE =================
    const now = new Date();
    let startDate, prevStartDate, prevEndDate, rangeEnd;

    if (range === "Last Month") {
      startDate     = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      rangeEnd      = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      prevEndDate   = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59);
    } else if (range === "This Year") {
      startDate     = new Date(now.getFullYear(), 0, 1);
      rangeEnd      = now;
      prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
      prevEndDate   = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
    } else {
      // This Month (default)
      startDate     = new Date(now.getFullYear(), now.getMonth(), 1);
      rangeEnd      = now;
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEndDate   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    }

    // ================= REVENUE (uses `date` field) =================
    const payments = await Payment.find({
      status: "Verified",
      date: { $gte: startDate, $lte: rangeEnd },
    });

    const prevPayments = await Payment.find({
      status: "Verified",
      date: { $gte: prevStartDate, $lte: prevEndDate },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const prevRevenue  = prevPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const growthRate = prevRevenue === 0
      ? (totalRevenue > 0 ? 100 : 0)
      : Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100);

    // ================= STUDENTS =================
    const activeStudents = await User.countDocuments({ role: "student" });

    // ================= ATTENDANCE =================
    // ✅ FIX: Attendance `date` is stored as "YYYY-MM-DD" string
    // so compare as string range instead of Date objects
    let avgAttendance = 0;
    try {
      const Attendance = require("../models/Attendance");

      // ✅ build string versions of the date range
      const pad = (n) => String(n).padStart(2, "0");
      const toStr = (d) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      const startStr = toStr(startDate);
      const endStr   = toStr(rangeEnd);

      // ✅ query using string comparison — works with "YYYY-MM-DD" stored dates
      const attendanceRecords = await Attendance.find({
        date: { $gte: startStr, $lte: endStr },
      });

      if (attendanceRecords.length > 0) {
        const presentCount = attendanceRecords.filter(
          (a) => a.status === "Present" || a.present === true
        ).length;
        avgAttendance = Math.round((presentCount / attendanceRecords.length) * 100);
      }
    } catch (e) {
      console.log("Attendance fetch error:", e.message);
    }

    // ================= REVENUE TREND =================
    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun",
                    "Jul","Aug","Sep","Oct","Nov","Dec"];
    let revenueTrend = [];

    if (range === "This Year" || range === "Last Month") {
      const monthly = {};
      payments.forEach((p) => {
        const m = new Date(p.date).getMonth();
        monthly[m] = (monthly[m] || 0) + Number(p.amount || 0);
      });
      revenueTrend = MONTHS.map((month, i) => ({
        month,
        revenue: monthly[i] || 0,
      }));
    } else {
      // This Month — group by day
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daily = {};
      payments.forEach((p) => {
        const day = new Date(p.date).getDate();
        daily[day] = (daily[day] || 0) + Number(p.amount || 0);
      });
      revenueTrend = Array.from({ length: daysInMonth }, (_, i) => ({
        month: `${i + 1}`,
        revenue: daily[i + 1] || 0,
      }));
    }

    // ================= REVENUE BY METHOD =================
    const methodMap = {};
    payments.forEach((p) => {
      const key = p.method || "Other";
      methodMap[key] = (methodMap[key] || 0) + Number(p.amount || 0);
    });
    const revenueByProgram = Object.entries(methodMap).map(([name, revenue]) => ({
      name,
      revenue,
    }));

    // ================= DASHBOARD STATS =================
    const students = await User.countDocuments({ role: "student" });
    const coaches  = await User.countDocuments({ role: "coach" });
    const programs = await Program.countDocuments();

    const allVerifiedPayments = await Payment.find({ status: "Verified" });
    const allRevenue = allVerifiedPayments.reduce(
      (sum, p) => sum + Number(p.amount || 0), 0
    );

    // Monthly revenue for dashboard chart
    const yearStart = new Date(`${now.getFullYear()}-01-01`);
    const yearEnd   = new Date(`${now.getFullYear()}-12-31`);
    const yearPayments = await Payment.find({
      status: "Verified",
      date: { $gte: yearStart, $lte: yearEnd },
    });

    const monthlyMap = {};
    yearPayments.forEach((p) => {
      const m = new Date(p.date).getMonth();
      monthlyMap[m] = (monthlyMap[m] || 0) + Number(p.amount || 0);
    });
    const monthlyRevenue = MONTHS.map((month, i) => ({
      month,
      revenue: monthlyMap[i] || 0,
    }));

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email");

    res.json({
      // Reports page
      totalRevenue,
      activeStudents,
      avgAttendance,
      growthRate,
      revenueTrend,
      revenueByProgram,

      // Dashboard
      students,
      coaches,
      programs,
      revenue: allRevenue,
      monthlyRevenue,
      recentUsers,
    });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ message: err.message });
  }
};