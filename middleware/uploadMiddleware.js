const multer = require("multer");
const path = require("path");

// Storage engine: Save files temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure 'uploads' folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File type validation
const fileFilter = (req, file, cb) => {
  const fileTypes = /pdf|docx|doc|txt/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  }
  cb(new Error("Only PDF, DOCX, DOC, and TXT files are allowed!"));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
