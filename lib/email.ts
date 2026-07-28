import { v4 as uuidv4 } from "uuid";

export const VERIFICATION_EXPIRY_HOURS = 24;
export const VERIFICATION_TOKEN_EXPIRY_MS =
  VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000;

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

function gmailUser(): string | undefined {
  return (
    process.env.GMAIL_USER?.trim() ||
    process.env.SMTP_USER?.trim() ||
    undefined
  );
}

function gmailAppPassword(): string | undefined {
  const raw =
    process.env.GMAIL_APP_PASSWORD?.trim() ||
    process.env.SMTP_PASS?.trim() ||
    "";
  const pass = raw.replace(/\s+/g, "");
  return pass || undefined;
}

function mailConfigured(): boolean {
  return Boolean(
    (gmailUser() && gmailAppPassword()) || process.env.RESEND_API_KEY?.trim()
  );
}

async function createGmailTransport() {
  const nodemailer = await import("nodemailer");
  const user = gmailUser();
  const pass = gmailAppPassword();
  if (!user || !pass) {
    throw new Error("Gmail غير مضبوط (GMAIL_USER / GMAIL_APP_PASSWORD)");
  }

  const transport = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  await transport.verify();
  return { transport, user };
}

async function sendViaGmail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const { transport, user } = await createGmailTransport();

  const from =
    process.env.SMTP_FROM?.trim().replace(/^["']|["']$/g, "") ||
    `Ashuor Tourism <${user}>`;

  const info = await transport.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });

  console.info("[email] Gmail sent OK", {
    to: opts.to,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  });
}

async function sendViaResend(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY غير مضبوط");
  }
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend failed: ${res.status} ${body}`);
  }

  console.info("[email] Resend sent OK", { to: opts.to });
}

/**
 * إرسال بريد تأكيد الحساب.
 * الأولوية: Gmail SMTP ثم Resend.
 */
export async function sendVerificationEmail(
  to: string,
  token: string,
  name?: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const verifyUrl = buildVerificationUrl(token);
  const displayName = name?.trim() || "المستخدم";
  const recipient = to.trim().toLowerCase();

  const subject = "تأكيد بريدك الإلكتروني — التحقق من الحساب";
  const text = `مرحباً ${displayName}،

شكراً لتسجيلك. أكّد بريدك عبر الرابط التالي (صالح لمدة ${VERIFICATION_EXPIRY_HOURS} ساعة):
${verifyUrl}

إذا لم تطلب إنشاء حساب، تجاهل هذه الرسالة.`;

  const html = `
  <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.7;color:#1e293b;max-width:560px;margin:0 auto">
    <h2 style="color:#6d28d9">تأكيد بريدك الإلكتروني</h2>
    <p>مرحباً <strong>${displayName}</strong>،</p>
    <p>اضغط الزر أدناه لتأكيد حسابك. الرابط صالح لمدة ${VERIFICATION_EXPIRY_HOURS} ساعة.</p>
    <p style="margin:28px 0;text-align:center">
      <a href="${verifyUrl}" style="background:#6d28d9;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;display:inline-block">تأكيد البريد</a>
    </p>
    <p style="font-size:13px;color:#64748b">أو انسخ الرابط:<br/><a href="${verifyUrl}">${verifyUrl}</a></p>
  </div>`;

  if (!mailConfigured()) {
    console.error("[email] mail not configured — missing GMAIL_* or RESEND_API_KEY");
    return {
      ok: false,
      error:
        "مزود البريد غير مضبوط. أضف GMAIL_USER و GMAIL_APP_PASSWORD أو RESEND_API_KEY",
    };
  }

  console.info("[email] sending verification", { to: recipient });

  try {
    let lastError: unknown;

    if (gmailUser() && gmailAppPassword()) {
      try {
        await sendViaGmail({
          to: recipient,
          subject,
          text,
          html,
        });
        return { ok: true };
      } catch (e) {
        lastError = e;
        console.error("[email] Gmail failed, trying Resend if configured…", e);
      }
    }

    if (process.env.RESEND_API_KEY?.trim()) {
      await sendViaResend({ to: recipient, subject, text, html });
      return { ok: true };
    }

    throw lastError ?? new Error("لا يوجد مزود بريد بديل");
  } catch (e) {
    console.error("[email] send failed", e);
    const msg = e instanceof Error ? e.message : "";
    if (
      msg.includes("Invalid login") ||
      msg.includes("BadCredentials") ||
      msg.includes("EAUTH")
    ) {
      return {
        ok: false,
        error:
          "فشل إرسال البريد — تحقق من GMAIL_APP_PASSWORD وأعد تشغيل السيرفر.",
      };
    }
    return { ok: false, error: "تعذر إرسال رسالة التأكيد إلى بريدك" };
  }
}
