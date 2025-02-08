const express = require("express");
const Job = require("../models/Job");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/* ---------------------------- Get all jobs (Public) ---------------------------- */
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().populate("recruiter", "name email");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* ---------------------------- Get job by ID (Public) ---------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("recruiter", "name email");
    if (!job) return res.status(404).json({ message: "Job Not Found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* ---------------------- Create a new job (Recruiter Only) ---------------------- */
router.post("/", authMiddleware, roleMiddleware(["recruiter"]), async (req, res) => {
  try {
    const { title, description, company, location, salary, category, experienceLevel, type, status, deadline } = req.body;

    const job = new Job({
      title,
      description,
      company,
      location,
      salary,
      category,
      experienceLevel,
      type,
      status: status || "Active",
      deadline,
      recruiter: req.user.id,
      postedBy: req.user.id
    });

    await job.save();
    res.status(201).json({ message: "Job Created", job });
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ---------------------- Update a job (Recruiter Only) ---------------------- */
router.put("/:id", authMiddleware, roleMiddleware(["recruiter"]), async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized to edit this job" });

    // Allow only certain fields to be updated
    const allowedUpdates = ["title", "description", "company", "location", "salary", "category", "experienceLevel", "type", "status", "deadline"];
    const updates = Object.keys(req.body).reduce((obj, key) => {
      if (allowedUpdates.includes(key)) obj[key] = req.body[key];
      return obj;
    }, {});

    job = await Job.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* ---------------------- Delete a job (Recruiter Only) ---------------------- */
router.delete("/:id", authMiddleware, roleMiddleware(["recruiter"]), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized to delete this job" });

    await job.deleteOne();
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

/* ---------------------- Apply for a job (Job Seeker Only) ---------------------- */
router.post("/apply/:jobId", authMiddleware, roleMiddleware(["job_seeker"]), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const user = req.user.id;
    if (job.applicants.includes(user))
      return res.status(400).json({ message: "Already applied for this job" });

    job.applicants.push(user);
    await job.save();
    res.json({ message: "Job application successful" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
