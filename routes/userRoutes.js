const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ✅ Get logged-in user profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Fix: Use `req.user.id`
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get applied jobs for the logged-in user
router.get("/applications", authMiddleware, roleMiddleware(["job_seeker"]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "appliedJobs",
      select: "-_id title company location", // Fix: Select only necessary fields
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.appliedJobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

/* ---------------- Upload & Extract Resume (Job Seeker Only) ---------------- */
router.post("/upload-resume", authMiddleware, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const resumePath = req.file.path;

    // Read and parse PDF
    const dataBuffer = fs.readFileSync(resumePath);
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text;

    // Save extracted text in the database
    await User.findByIdAndUpdate(req.user.id, { resumeText: extractedText });

    // Delete file after processing (no storage cost)
    fs.unlinkSync(resumePath);

    res.json({ message: "Resume uploaded and processed successfully", extractedText });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
