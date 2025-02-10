const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");
const socketIo = require("socket.io");
const cron = require("node-cron");
require("dotenv").config(); // Correct placement

connectDB(); // Connect to DB

const app = express();
const server = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  //store user connection
  socket.io("user_connected", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.io}`);
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    }
  });
});

// Routes

/* Auth
------------------------------------- */
app.use("/api/auth", require("./routes/authRoutes"));

/* Jobs
------------------------------------- */
app.use("/api/jobs", require("./routes/jobRoutes")(io));

/* Users
------------------------------------- */
app.use("/api/users", require("./routes/userRoutes"));

/* Admin
------------------------------------- */
app.use("/api/admin", require("./routes/adminRoute"));

app.use("/uploads", express.static("uploads")); // Serve uploaded files if needed

cron.schedule("0 9 * * MON", async () => {
  console.log("Sending weekly job digest...");

  try {
    const jobs = await Job.find({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
    if (jobs.length === 0) return;

    const jobSeekers = await User.find({ role: "job_seeker" });

    jobSeekers.forEach((user) => {
      const jobList = jobs.map((job) => `<li>${job.title} at ${job.company}</li>`).join("");
      sendEmail(
        user.email,
        "Weekly Job Digest",
        "Here are the latest job postings from this week.",
        `<p>Here are the latest jobs:</p><ul>${jobList}</ul>`
      );
    });

    console.log("Job digest sent.");
  } catch (err) {
    console.error("Error sending job digest:", err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server, io, onlineUsers };
