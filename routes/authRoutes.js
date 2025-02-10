const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const { authLimiter } = require("../middleware/rateLimitMiddleware");
require("dotenv").config();

const router = express.Router();

/* ---------------------------- Generate Tokens ---------------------------- */
const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

  return { accessToken, refreshToken };
};

/* ---------------------------- Register Route ---------------------------- */
router.post(
  "/register",
  authLimiter,
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Email is required").isEmail(),
    check("password", "Password must be at least 6 characters long").isLength({
      min: 6,
    }),
    check("role", "Role must be recruiter or job_seeker").isIn(["recruiter", "job_seeker"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: "User already exists" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({ name, email, password: hashedPassword, role });
      await user.save();

      const tokens = generateTokens(user);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      // Set JWTs as HTTP-only cookies
      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000,
      });

      res.status(201).json({ accessToken: tokens.accessToken, message: "Registration Successful" });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
  }
);

/* ---------------------------- Login Route ---------------------------- */
router.post(
  "/login",
  authLimiter,
  [check("email", "Please Include a valid Email").isEmail(), check("password", "Password is required").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Invalid Email/Password" });

      const tokens = generateTokens(user);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });

      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000,
      });

      res.json({ accessToken: tokens.accessToken });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
);

/* ---------------------------- Refresh Token Route ---------------------------- */
router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "Refresh Token Required" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid Refresh Token" });

    const tokens = generateTokens(user);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.json({ accessToken: tokens.accessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid or Expired Refresh Token" });
  }
});

/* ---------------------------- Logout Route ---------------------------- */
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
