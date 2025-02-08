const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");
require("dotenv").config(); // Correct placement

connectDB(); // Connect to DB

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes

/* Auth
------------------------------------- */
app.use("/api/auth", require("./routes/authRoutes"));

/* Jobs
------------------------------------- */
app.use("/api/jobs", require("./routes/jobRoutes"));

/* Users
------------------------------------- */
app.use("/api/users", require("./routes/userRoutes"));

/* Admin
------------------------------------- */
app.use("/api/admin", require("./routes/adminRoute"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
