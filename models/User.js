const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["recruiter", "job_seeker", "admin"], required: true },
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  interestedCategories: [String], // For job alerts
  resumeText: { type: String, default: "" }, // Store extracted text
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
