const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
  studentName: { type: String, required: true },

  // ✅ ADD THIS
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  batchName: { type: String, required: true },
  skill: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  coachId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Performance", performanceSchema);