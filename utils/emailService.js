const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a job alert email to a user.
 */

const sendJobAlert = async (email, jobs) => {
  const jobList = jobs.map((job) => `<li><b>${job.title}</b> at ${job.company} - ${job.location}</li>`).join("");

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🔥 New Job Matches for You!",
    html: `<p>Hey! We found some jobs matching your profile:</p>
           <ul>${jobList}</ul>
           <p>Apply soon before they expire!</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

module.exports = { sendJobAlert };