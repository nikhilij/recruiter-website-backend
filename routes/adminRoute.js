const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const User = require("../models/User");
const Job = require("../models/Job");

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)

router.get("/users", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (Admin only)

router.delete("/users/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/admin/jobs
// @desc    Get all job postings (Admin only)

router.get("/jobs", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   DELETE /api/admin/jobs/:id
// @desc    Delete a job posting (Admin only)

router.delete("/jobs/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});
module.exports = router;
