import nodemailer from "nodemailer";

const ALLOW = [
  "https://artytl.github.io",
  "https://artytl-dvd-sale.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
];

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  if (origin && ALLOW.includes(origin)) res.setHeader("Access-Control-Allow-Origin", origin);
  else if (!origin) res.setHeader("Access-Control-Allow-Origin", "*"); // allow curl/server-to-server
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ✅ ENV sanity check (จะฟ้องชื่อคีย์ที่หาย)
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_FROM"];
  const missing = required.filter((k) => !process.env[k] || String(process.env[k]).trim() === "");
  if (missing.length) return res.status(500).json({ error: `Missing env: ${missing.join(", ")}` });

  // parse body
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "invalid JSON" }); }
  }
  const { email } = body || {};
  if (!email) return res.status(400).json({ error: "email required" });

  try {
    const port = Number(process.env.SMTP_PORT);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,            // smtp.gmail.com
      port,                                   // 465
      secure: port === 465,                   // 465 = SSL
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: process.env.MAIL_FROM,            // "DVD Shop <artyt.sun@gmail.com>"
      to: email,
      subject: "ยืนยันคำสั่งซื้อ",
      text: "ขอบคุณสำหรับการสั่งซื้อ",
      html: "<p>ขอบคุณสำหรับการสั่งซื้อ 🎉</p>",
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
