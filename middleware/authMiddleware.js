const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  console.log(token);

  if (!token) return res.status(401).json({ message: "Access Denied: No Token" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified.user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};
