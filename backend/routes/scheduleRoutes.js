const express = require("express");
const router = express.Router();

const {
  getSchedules,
  createSchedule,
  deleteSchedule,
  updateSchedule,
} = require("../controllers/scheduleController");

router.get("/", getSchedules);  // ← removed protect, handled in controller via query param
router.post("/", createSchedule);
router.put("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

module.exports = router;