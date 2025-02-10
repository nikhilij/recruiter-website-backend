const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
// const authMiddleware = require("./middleware/authMiddleware");
// const roleMiddleware = require("./middleware/roleMiddleware");
// const upload = require("./middleware/uploadMiddleware");
const socketIO = require("socket.io");
const cron = require("node-cron");
const helmet = require("helmet");
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
app.use(cors({origin:process.env.CLIENT_URL,credentials:true})); // Enable cookies across origins
app.use(express.json());
app.use(helmet()); // Adds security headers
app.use(cookieParser());

/*  Cybersecurity terms 🥲🥲
✅ This protects against common vulnerabilities like XSS, clickjacking, and MIME sniffing. */

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

  //store user connection
  socket.on("user_connected", (userId) => {
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

/* --------------------- Cron Job: Send Job Alerts Every 24 Hours --------------------- */
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Running job alert cron job...");

  try {
    const users = await User.find({ role: "job_seeker", resumeText: { $exists: true } });

    for (const user of users) {
      const jobs = await Job.find();
      const matchedJobs = computeSimilarity(user.resumeText, jobs);

      if (matchedJobs.length > 0) {
        await sendJobAlert(user.email, matchedJobs);
      }
    }

    console.log("✅ Job alerts sent successfully.");
  } catch (err) {
    console.error("❌ Error in job alert cron job:", err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server, io, onlineUsers };
