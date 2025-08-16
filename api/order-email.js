// api/order-email.js
import nodemailer from "nodemailer";

// โดเมนที่อนุญาตให้เรียก API นี้ได้ (เพิ่ม/ลบได้)
const ALLOW_ORIGINS = [
  "https://artytl.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
];

function setCors(res, origin) {
  if (ALLOW_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  setCors(res, origin);

  // preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!ALLOW_ORIGINS.includes(origin))
    return res.status(403).json({ error: "origin not allowed" });

  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  // บางที body อาจเป็น string
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "invalid JSON" }); }
  }

  const { email } = body || {};
  if (!email) return res.status(400).json({ error: "email required" });

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: "ยืนยันคำสั่งซื้อ",
      text: "ขอบคุณสำหรับการสั่งซื้อ",
      html: "<p>ขอบคุณสำหรับการสั่งซื้อ 🎉</p>",
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

