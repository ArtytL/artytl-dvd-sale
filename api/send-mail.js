import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { to, orderNumber, items, shippingCost, total, paymentLink } = req.body;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const itemList = items.map(item => `- ${item.name}: ${item.price} บาท`).join('\n');

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject: 'ขอบคุณสำหรับการสั่งซื้อสินค้า',
      text: `ขอบคุณสำหรับการสั่งสินค้าออเดอร์ (หมายเลขออเดอร์ #${orderNumber})\n\n` +
            `รายการสินค้า:\n${itemList}\n- ค่าส่ง: ${shippingCost} บาท\n\n` +
            `รวมยอดชำระ: ${total} บาท\n\n` +
            `สำหรับการโอนเงิน: บัญชี ธ.กรุงเทพ 047-007-8908 อาทิตย์ เลิศรักษ์มงคล\n\n` +
            `กรุณากดลิงก์นี้เพื่อแจ้งชำระเงิน: ${paymentLink}`,
    };
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `Mini Shop <${process.env.MAIL_USER}>`,
      to,
      bcc,
      subject,
      text: message,
    });

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
