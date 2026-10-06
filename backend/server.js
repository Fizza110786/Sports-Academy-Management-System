const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= DATABASE =================
mongoose
  .connect("mongodb://127.0.0.1:27017/sports-academy")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// ================= ROUTES =================
const authRoutes = require("./routes/authRoutes");
const batchRoutes = require("./routes/batchRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const programRoutes = require("./routes/programRoutes");
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const settingRoutes = require("./routes/settingRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const feeRoutes = require("./routes/feeRoutes");         // ✅ ADDED
const paymentRoutes = require("./routes/paymentRoutes"); // ✅ ADDED
const performanceRoutes = require("./routes/performanceRoutes"); // ✅ ADD
const materialRoutes = require("./routes/materialRoutes"); // ✅ ADD
const progressRoutes = require("./routes/progressRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/fees", feeRoutes);         // ✅ ADDED
app.use("/api/payments", paymentRoutes); // ✅ ADDED
app.use("/api/performance", performanceRoutes); // ✅ ADD
app.use("/api/materials", materialRoutes); // ✅ ADD
app.use("/api/progress", progressRoutes);      

// ================= START SERVER =================
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});