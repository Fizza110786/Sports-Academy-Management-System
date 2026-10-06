const Schedule = require("../models/Schedule");
const mongoose = require("mongoose");

// ================= GET =================
exports.getSchedules = async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    if (user) {
      if (user.role === "admin") {
        query = {};
      }
      if (user.role === "coach") {
        query.coach = new mongoose.Types.ObjectId(user._id);
      }
      if (user.role === "student" && user.batch) {
        query.batch = new mongoose.Types.ObjectId(user.batch);
      }
    } else {
      const { studentBatch } = req.query;
      if (studentBatch && mongoose.Types.ObjectId.isValid(studentBatch)) {
        query.batch = new mongoose.Types.ObjectId(studentBatch);
      }
    }

    const schedules = await Schedule.find(query)
      .populate("coach", "name")
      .populate("batch", "name");

    res.json(schedules);
  } catch (err) {
    console.error("SCHEDULE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================= CREATE =================
exports.createSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE =================
exports.deleteSchedule = async (req, res) => {
  try {
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE =================
exports.updateSchedule = async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};