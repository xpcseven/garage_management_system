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

const to = process.argv[2];
if (!to) {
  console.error("Usage: node scripts/test-send-email.js recipient@email.com");
  process.exit(1);
}

const user = process.env.GMAIL_USER || process.env.SMTP_USER;
const pass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "").replace(
  /\s+/g,
  ""
);

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: { user, pass },
});

transport
  .sendMail({
    from: `Ashuor Tourism <${user}>`,
    to,
    subject: "اختبار إرسال البريد — Ashuor Tourism",
    text: "إذا وصلتك هذه الرسالة فإعداد Gmail يعمل بنجاح.",
    html: "<p dir='rtl'>إذا وصلتك هذه الرسالة فإعداد Gmail يعمل بنجاح.</p>",
  })
  .then(() => {
    console.log("Email sent OK to", to);
    process.exit(0);
  })
  .catch((e) => {
    console.error("Send FAIL:", e.message);
    process.exit(1);
  });
