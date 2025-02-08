const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function createAdmin() {
  const hashedPassword = await bcrypt.hash("Admin123", 10);

  const adminUser = new User({
    name: "Admin User",
    email: "admin@example.com",
    password: hashedPassword,
    role: "admin",
  });

  await adminUser.save();
  console.log("Admin user created successfully!");
  mongoose.connection.close();
}

createAdmin();
