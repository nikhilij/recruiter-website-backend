const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: Number },
  category: { type: String, enum: ["IT", "Healthcare", "Finance", "Marketing", "Others"], required: true },
  experienceLevel: { type: String, enum: ["Entry", "Mid", "Senior"], required: true },
  type: { type: String, enum: ["Full-time", "Part-time", "Contract", "Remote"], required: true },
  status: { type: String, enum: ["Active", "Closed", "Pending"], default: "Active" },
  deadline: { type: Date, required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model("Job", JobSchema);
