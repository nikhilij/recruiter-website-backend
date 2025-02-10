const express = require("express");
const Job = require("../models/Job");
const User = require("../models/User");
const sendEmail = require("../config/email");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

module.exports = (io) => {
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

  /* ------------------ Get Job Recommendations (Job Seeker) ------------------ */
  router.get("/recommend", authMiddleware, async (req, res) => {
    try {
      const user = req.user;
      if (!user.resumeText) return res.status(400).json({ message: "Upload a resume to get recommendations." });

      // Fetch all jobs
      const jobs = await Job.find();
      if (jobs.length === 0) return res.json({ message: "No jobs available." });

      // Compute job matches
      const matchedJobs = computeSimilarity(user.resumeText, jobs);

      res.json({ recommendedJobs: matchedJobs });
    } catch (err) {
      console.error("Job recommendation error:", err);
      res.status(500).json({ message: "Server Error" });
    }
  });

  /* ---------------------- Create a new job (Recruiter Only) ---------------------- */
  router.post("/", authMiddleware, roleMiddleware(["recruiter"]), async (req, res) => {
    try {
      const { title, description, company, location, salary, category, experienceLevel, type, status, deadline } =
        req.body;

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
        postedBy: req.user.id,
      });

      await job.save();

      // emit push notification to all connecte job seekers
      io.emit("newJob", { message: `New job posted : ${title}`, job });

      // Find users who subscribed to this job category
      const jobSeekers = await User.find({ role: "job_seeker", interestedCategories: category });

      jobSeekers.forEach((user) => {
        sendEmail(
          user.email,
          `New Job Alert: ${title}`,
          `A new job "${title}" has been posted in ${category}.`,
          `<p>A new job <strong>${title}</strong> at <strong>${company}</strong> has been posted in ${category}.</p>`
        );
      });

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
      const allowedUpdates = [
        "title",
        "description",
        "company",
        "location",
        "salary",
        "category",
        "experienceLevel",
        "type",
        "status",
        "deadline",
      ];
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
      const job = await Job.findById(req.params.jobId).populate("recruiter", "name email");
      if (!job) return res.status(404).json({ message: "Job not found" });

      const user = req.user.id;
      if (job.applicants.includes(user)) return res.status(400).json({ message: "Already applied for this job" });

      job.applicants.push(user);
      await job.save();

      // Notify recruiter about new job application
      io.to(job.recruiter.toString()).emit("jobApplication", {
        message: `New application for ${job.title}`,
        applicantId: user,
      });

      // Send Email Notification to Recruiter
      sendEmail(
        job.recruiter.email,
        `New Application for ${job.title}`,
        `A new candidate has applied for your job "${job.title}".`,
        `<p>A new candidate has applied for your job <strong>${job.title}</strong>.</p>`
      );

      res.json({ message: "Job application successful" });
    } catch (err) {
      res.status(500).json({ message: "Server Error" });
    }
  });

  return router;
};
