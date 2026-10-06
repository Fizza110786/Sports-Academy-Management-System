const Performance = require("../models/Performance");
const User = require("../models/User"); // ✅ ADDED (needed for fallback)

// ================= GET =================
exports.getPerformance = async (req, res) => {
  try {
    const { coachId, studentId } = req.query;

    console.log("🔍 req.query:", req.query);  // ADD THIS

    let filter = {};

    if (coachId) {
      filter.coachId = coachId;
    }

    if (studentId) {
      const user = await User.findById(studentId);

      console.log("🔍 studentId:", studentId);
      console.log("🔍 user found:", user);
      console.log("🔍 user.name:", user?.name);

      filter = {
        ...filter,
        $or: [
          { studentId: studentId },
          { studentName: user?.name }
        ]
      };
    }

    const data = await Performance.find(filter)
      .populate("coachId", "name")
      .sort({ createdAt: -1 });

    console.log("🔍 filter used:", JSON.stringify(filter));
    console.log("🔍 records found:", data.length);

    const result = data.map((item) => ({
      ...item.toObject(),
      coachName: item.coachId?.name || "Coach",
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: err.message });
  }
};
// ================= CREATE =================
exports.createPerformance = async (req, res) => {
  try {
    const item = await Performance.create(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE =================
exports.updatePerformance = async (req, res) => {
  try {
    const item = await Performance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE =================
exports.deletePerformance = async (req, res) => {
  try {
    await Performance.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};