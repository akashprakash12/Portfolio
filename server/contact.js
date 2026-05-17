import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Environment variables:
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, RECIPIENT_EMAIL
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  RECIPIENT_EMAIL = "akashprakash7032@gmail.com",
} = process.env;

let transporter;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/contact", async (req, res) => {
  const { name, email, projectType, message } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const finalMessage = message && String(message).trim().length ? String(message) : "Contact request";
  const subject = `${name} — ${projectType || "Contact Request"}`;
  const text = `${finalMessage}\n\n---\nFrom: ${name} <${email}>\nProject type: ${projectType || "N/A"}`;

  // If transporter configured, attempt to send email
  if (transporter) {
    try {
      await transporter.sendMail({
        from: SMTP_USER,
        to: RECIPIENT_EMAIL,
        subject,
        text,
        replyTo: email,
      });
      return res.json({ ok: true, sent: true });
    } catch (err) {
      console.error("Error sending email:", err);
      return res.status(500).json({ error: "Failed to send email" });
    }
  }

  // If no SMTP configured, return the email content so the frontend can fallback.
  return res.json({ ok: true, sent: false, subject, text, to: RECIPIENT_EMAIL });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Contact server listening on http://localhost:${port}`);
});
