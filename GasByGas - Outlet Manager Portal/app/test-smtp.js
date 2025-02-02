const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const testSMTP = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true", // Use true for port 465 (secure), false for port 587 (non-secure)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM, // Sender address
      to: "imijanab1979@gmail.com", // Replace with your email address to test
      subject: "SMTP Test Email",
      text: "This is a test email to verify SMTP configuration.",
    });

    console.log("Email sent successfully! Message ID:", info.messageId);
  } catch (error) {
    console.error("Error sending test email:", error.message);
  }
};

testSMTP();
