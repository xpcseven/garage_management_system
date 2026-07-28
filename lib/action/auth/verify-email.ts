"use server";

import { prisma } from "@/lib/prisma";
import {
  createVerificationTokenValue,
  sendVerificationEmail,
  verificationExpiryDate,
} from "@/lib/email";

export async function verifyEmail(token: string) {
  const raw = token.trim();
  if (!raw) {
    return { error: "رابط التحقق غير صالح" };
  }

  const row = await prisma.verificationToken.findUnique({
    where: { token: raw },
  });

  if (!row) {
    return { error: "رابط التحقق غير صالح أو منتهٍ" };
  }

  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.verificationToken.delete({ where: { id: row.id } }).catch(() => {});
    return {
      error: "انتهت صلاحية رابط التحقق — اطلب رابطاً جديداً من صفحة تسجيل الدخول",
    };
  }

  const email = row.email;

  await prisma.$transaction(async (tx) => {
    await tx.user.updateMany({
      where: { email: { equals: email, mode: "insensitive" } },
      data: { emailVerified: true, isActive: true },
    });
    await tx.verificationToken.deleteMany({
      where: { email: { equals: email, mode: "insensitive" } },
    });
  });

  return { success: true as const };
}

export async function createAndSendVerificationToken(params: {
  email: string;
  name?: string;
}): Promise<{ ok: true; token: string } | { ok: false; error: string; token: string }> {
  const email = params.email.trim().toLowerCase();
  const token = createVerificationTokenValue();

  await prisma.verificationToken.deleteMany({
    where: { email: { equals: email, mode: "insensitive" } },
  });

  await prisma.verificationToken.create({
    data: {
      email,
      token,
      expiresAt: verificationExpiryDate(),
    },
  });

  const sent = await sendVerificationEmail(email, token, params.name);
  if (!sent.ok) {
    return { ok: false, error: sent.error, token };
  }
  return { ok: true, token };
}
