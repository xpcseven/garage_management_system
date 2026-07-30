import { v4 as uuidv4 } from "uuid";

export const VERIFICATION_EXPIRY_HOURS = 24;
export const VERIFICATION_TOKEN_EXPIRY_MS =
  VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000;

const SITE_NAME = "Ashuor Tourism";

export function createVerificationTokenValue(): string {
  return uuidv4();
}

export function verificationExpiryDate(): Date {
  return new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS);
}

export function getAppBaseUrl(): string {
  const explicit = process.env.EMAIL_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const nextAuth = process.env.NEXTAUTH_URL?.trim();
  if (nextAuth) return nextAuth.replace(/\/$/, "");

  const website = process.env.NEXT_WEBSITE_URL?.trim();
  if (website) return website.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }

  return "http://localhost:3000";
}

export function buildVerificationUrl(token: string): string {
  return `${getAppBaseUrl()}/auth/verify-email?token=${encodeURIComponent(token)}`;
}

function sanitizeName(name?: string): string {
  return (name?.trim() || "Member").replace(/[<>&"']/g, "");
}

function smtpUser(): string | undefined {
  return (
    process.env.SMTP_USER?.trim() ||
    process.env.GMAIL_USER?.trim() ||
    undefined
  );
}

function smtpPass(): string | undefined {
  const raw =
    process.env.SMTP_PASS?.trim() ||
    process.env.GMAIL_APP_PASSWORD?.trim() ||
    "";
  const pass = raw.replace(/\s+/g, "");
  return pass || undefined;
}

function smtpFromAddress(): string {
  const configured = process.env.SMTP_FROM?.trim().replace(/^["']|["']$/g, "");
  if (configured) return configured;

  const user = smtpUser();
  if (user && !user.endsWith("@gmail.com")) {
    return `"${SITE_NAME}" <${user}>`;
  }

  if (user) return `"${SITE_NAME}" <${user}>`;
  return `"${SITE_NAME}" <noreply@ashuor.com>`;
}

function replyToAddress(): string | undefined {
  return (
    process.env.EMAIL_REPLY_TO?.trim() ||
    process.env.SMTP_REPLY_TO?.trim() ||
    smtpUser()
  );
}

function mailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() ||
      (smtpUser() && smtpPass())
  );
}

type MailContent = {
  subject: string;
  text: string;
  html: string;
  recipient: string;
  displayName: string;
};

function buildMailContent(
  to: string,
  token: string,
  name?: string
): MailContent {
  const verifyUrl = buildVerificationUrl(token);
  const displayName = sanitizeName(name);
  const recipient = to.trim().toLowerCase();
  const siteUrl = getAppBaseUrl();

  // عنوان مختلط — أقل عرضة للتصنيف كسبام من العربية فقط
  const subject = `${SITE_NAME} — Activate your account / تفعيل حسابك`;

  const text = `${SITE_NAME}
${siteUrl}

Hello ${displayName},

Please activate your account by opening this link:
${verifyUrl}

This link expires in ${VERIFICATION_EXPIRY_HOURS} hours.
If you did not create an account, you can ignore this message.

---
مرحباً ${displayName},

لتفعيل حسابك افتح الرابط:
${verifyUrl}

صلاحية الرابط ${VERIFICATION_EXPIRY_HOURS} ساعة.
إذا لم تنشئ حساباً، تجاهل هذه الرسالة.

${SITE_NAME}
${siteUrl}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#222;background:#fff">
  <p style="margin:0 0 16px">Hello ${displayName},</p>
  <p style="margin:0 0 16px">Please activate your ${SITE_NAME} account:</p>
  <p style="margin:0 0 20px">
    <a href="${verifyUrl}" style="color:#1a56db">${verifyUrl}</a>
  </p>
  <p style="margin:0 0 16px;color:#555">Link expires in ${VERIFICATION_EXPIRY_HOURS} hours.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p dir="rtl" style="margin:0 0 16px">مرحباً ${displayName}،</p>
  <p dir="rtl" style="margin:0 0 16px">لتفعيل حسابك في ${SITE_NAME}:</p>
  <p dir="rtl" style="margin:0 0 20px">
    <a href="${verifyUrl}" style="color:#1a56db">${verifyUrl}</a>
  </p>
  <p dir="rtl" style="margin:0;color:#555">صلاحية الرابط ${VERIFICATION_EXPIRY_HOURS} ساعة.</p>
  <p style="margin:24px 0 0;font-size:13px;color:#888">${SITE_NAME} · ${siteUrl}</p>
</body>
</html>`;

  return { subject, text, html, recipient, displayName };
}

function formatRecipient(name: string, email: string): string {
  const safe = name.replace(/"/g, "");
  return `"${safe}" <${email}>`;
}

async function sendViaSmtp(content: MailContent): Promise<void> {
  const nodemailer = await import("nodemailer");
  const user = smtpUser();
  const pass = smtpPass();
  if (!user || !pass) {
    throw new Error("SMTP غير مضبوط");
  }

  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? 587);
  const secure = process.env.SMTP_SECURE === "true";

  const transport = nodemailer.default.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { minVersion: "TLSv1.2" },
  });

  await transport.verify();

  const from = smtpFromAddress();
  const replyTo = replyToAddress();

  const info = await transport.sendMail({
    from,
    to: formatRecipient(content.displayName, content.recipient),
    replyTo: replyTo || undefined,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });

  console.info("[email] SMTP sent OK", {
    host,
    from,
    to: content.recipient,
    messageId: info.messageId,
  });
}

async function sendViaResend(content: MailContent): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("RESEND_API_KEY غير مضبوط");

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    `"${SITE_NAME}" <noreply@ashuor.com>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [content.recipient],
      reply_to: replyToAddress() || undefined,
      subject: content.subject,
      text: content.text,
      html: content.html,
      tags: [{ name: "category", value: "account-verification" }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend failed: ${res.status} ${body}`);
  }

  console.info("[email] Resend sent OK", { from, to: content.recipient });
}

/**
 * إرسال بريد تفعيل الحساب.
 * الأولوية: Resend (نطاق مُوثَّق) → SMTP مخصص → Gmail.
 */
export async function sendVerificationEmail(
  to: string,
  token: string,
  name?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const content = buildMailContent(to, token, name);

  if (!mailConfigured()) {
    console.error("[email] mail not configured");
    return {
      ok: false,
      error:
        "مزود البريد غير مضبوط. أضف RESEND_API_KEY (مُفضّل) أو SMTP/Gmail في .env",
    };
  }

  console.info("[email] sending verification", { to: content.recipient });

  const providers: Array<{ name: string; send: () => Promise<void> }> = [];

  if (process.env.RESEND_API_KEY?.trim()) {
    providers.push({ name: "resend", send: () => sendViaResend(content) });
  }

  if (smtpUser() && smtpPass()) {
    providers.push({ name: "smtp", send: () => sendViaSmtp(content) });
  }

  let lastError: unknown;

  for (const provider of providers) {
    try {
      await provider.send();
      return { ok: true };
    } catch (e) {
      lastError = e;
      console.error(`[email] ${provider.name} failed`, e);
    }
  }

  const msg = lastError instanceof Error ? lastError.message : "";
  if (
    msg.includes("Invalid login") ||
    msg.includes("BadCredentials") ||
    msg.includes("EAUTH")
  ) {
    return {
      ok: false,
      error: "فشل إرسال البريد — تحقق من إعدادات SMTP/Gmail في .env",
    };
  }

  return { ok: false, error: "تعذر إرسال رسالة التفعيل إلى بريدك" };
}
