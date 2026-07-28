const fs = require("fs");
const nodemailer = require("nodemailer");

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

const user = process.env.GMAIL_USER || process.env.SMTP_USER;
const pass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "").replace(
  /\s+/g,
  ""
);

if (!user || !pass) {
  console.error("SMTP FAIL: ضع GMAIL_USER و GMAIL_APP_PASSWORD في .env");
  process.exit(1);
}

console.log("Trying Gmail SMTP for:", user);
console.log("App password length:", pass.length, "(يجب أن تكون 16 حرفاً)");

const t = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
});

t.verify()
  .then(() => {
    console.log("SMTP OK for", user);
    process.exit(0);
  })
  .catch((e) => {
    console.error("SMTP FAIL:", e.message);
    console.error(`
السبب: Google رفض اسم المستخدم أو كلمة مرور التطبيق.
الحل:
  1) سجّل دخول إلى الحساب: ${user}
  2) فعّل التحقق بخطوتين
  3) أنشئ App Password من: https://myaccount.google.com/apppasswords
  4) ضع القيمة الجديدة في GMAIL_APP_PASSWORD (16 حرفاً بدون مسافات)
  5) أعد تشغيل npm run dev ثم شغّل هذا السكربت مجدداً
`);
    process.exit(1);
  });
