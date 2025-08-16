// api/order-email.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // ✅ CORS: เปิดกว้างให้ทุก origin ไปก่อน เพื่อตัดปัญหา Failed to fetch
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ✅ เช็ค ENV ให้ชัด
  const need = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_FROM"];
  const miss = need.filter(k => !process.env[k] || String(process.env[k]).trim() === "");
  if (miss.length) return res.status(500).json({ error: `Missing env: ${miss.join(", ")}` });

  // รองรับกรณี body เป็น string
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "invalid JSON" }); }
  }
  const { email } = body || {};
  if (!email) return res.status(400).json({ error: "email required" });

  try {
    const port = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,        // smtp.gmail.com
      port,
      secure: port === 465,               // 465 = SSL
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.verify(); // ถ้า credential ผิด จะ throw ที่นี่

    await transporter.sendMail({
      from: process.env.MAIL_FROM,        // "DVD Shop <artyt.sun@gmail.com>"
      to: email,
      subject: "ยืนยันคำสั่งซื้อ",
      text: "ขอบคุณสำหรับการสั่งซื้อ",
      html: "<p>ขอบคุณสำหรับการสั่งซื้อ 🎉</p>",
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
