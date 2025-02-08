const express = require("express");
const Job = require("../models/Job");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

//public
// get all jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find().populate("recruiter", "name email");
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

//public
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("recruiter", "name email");
    if (!job) return res.status(404).json({ message: "Job Not Found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// create job (recruiter only)
router.post("/", authMiddleware, roleMiddleware(["recruiter"]), async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;
    const job = new Job({ title, description, company, location, salary, recruiter: req.user.id });
    await job.save();
    res.status(201).json({ message: "Job Created", job });
  } catch (err) {
    console.error("Error creating job:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// apply for job (job seeker only){}
router.post("/apply/:jobId", authMiddleware, roleMiddleware(["job_seeker"]), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    job.applicants.push(req.user.id);
    await job.save();
    res.json({ message: "Job application successfull" });
  } catch (err) {
    res.status(201).json({ message: "Server Error" });
  }
});

//

module.exports = router;
