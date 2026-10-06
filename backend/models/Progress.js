const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  batting: { type: Number, default: 0 },
  bowling: { type: Number, default: 0 },
  fielding: { type: Number, default: 0 },
  fitness: { type: Number, default: 0 },
  grade: { type: String, default: "N/A" },
}, { timestamps: true });

module.exports = mongoose.model("Progress", progressSchema);