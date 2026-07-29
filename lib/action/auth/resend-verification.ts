"use server";

import { prisma } from "@/lib/prisma";
import { createAndSendVerificationToken } from "@/lib/action/auth/verify-email";

export async function resendVerificationEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { error: "أدخل البريد الإلكتروني" };
  }

  const user = await prisma.user.findFirst({
    where: {
      email: { equals: normalized, mode: "insensitive" },
      isDeleted: false,
    },
    select: { id: true, name: true, email: true, emailVerified: true },
  });

  if (!user) {
    return { error: "لا يوجد حساب بهذا البريد" };
  }

  if (user.emailVerified) {
    return { error: "تم التحقق من هذا البريد مسبقاً. يمكنك تسجيل الدخول." };
  }

  const sent = await createAndSendVerificationToken({
    email: user.email,
    name: user.name,
  });

  if (!sent.ok) {
    return { error: sent.error };
  }

  return {
    success:
      "تم إرسال رابط التفعيل إلى بريدك. تحقق من صندوق الوارد.",
  };
}
