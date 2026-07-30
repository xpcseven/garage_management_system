/**
 * يحاكي مسار إرسال بريد التحقق بعد التسجيل (بدون إنشاء مستخدم).
 * Usage: node scripts/simulate-register-email.js user@example.com
 */
const fs = require("fs");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  process.env[m[1].trim()] = v;
}

const to = (process.argv[2] || "").trim().toLowerCase();
if (!to) {
  console.error("Usage: node scripts/simulate-register-email.js user@example.com");
  process.exit(1);
}

const user = process.env.GMAIL_USER;
const pass = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");
const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
const token = uuidv4();
const verifyUrl = `${baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { user, pass },
});

transport
  .verify()
  .then(() =>
    transport.sendMail({
      from: `Ashuor Tourism <${user}>`,
      to,
      subject: "تأكيد بريدك الإلكتروني — التحقق من الحساب",
      text: `رابط التأكيد:\n${verifyUrl}`,
      html: `<p dir="rtl"><a href="${verifyUrl}">تأكيد البريد</a></p>`,
    })
  )
  .then((info) => {
    console.log("Verification email simulation OK");
    console.log("to:", to);
    console.log("messageId:", info.messageId);
    console.log("url:", verifyUrl);
    process.exit(0);
  })
  .catch((e) => {
    console.error("FAIL:", e.message);
    process.exit(1);
  });
