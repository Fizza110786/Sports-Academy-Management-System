const express = require("express");
const router = express.Router();
const Progress = require("../models/Progress");

router.get("/:studentId", async (req, res) => {
  try {
    const progress = await Progress.findOne({ studentId: req.params.studentId });
    if (!progress) return res.json({ batting: 0, bowling: 0, fielding: 0, fitness: 0, grade: "N/A" });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const existing = await Progress.findOne({ studentId: req.body.studentId });
    if (existing) {
      const updated = await Progress.findByIdAndUpdate(existing._id, req.body, { new: true });
      return res.json(updated);
    }
    const item = await Progress.create(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;