"use server";

import { RegisterSchema } from "@/schemas";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getUserByEmail } from "../user.action";
import { GarageRole, JobType, Role } from "@prisma/client";
import { createAndSendVerificationToken } from "@/lib/action/auth/verify-email";

export async function getActiveGaragesForDriverRegistration(): Promise<
  { id: string; name: string }[]
> {
  return prisma.garage.findMany({
    where: { isDeleted: false, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  try {
    const validateFields = RegisterSchema.safeParse(values);

    if (!validateFields.success) {
      const first = validateFields.error.flatten().fieldErrors;
      const msg =
        first.jobTypes?.[0] ||
        first.garageIds?.[0] ||
        first.isIndependentDriver?.[0] ||
        first.role?.[0] ||
        Object.values(first).flat()[0] ||
        "بيانات غير صالحة";
      return { error: msg };
    }

    const {
      name,
      password,
      role,
      jobTypes,
      isIndependentDriver,
      isCompanyDriver,
      garageIds,
    } = validateFields.data;
    const email = validateFields.data.email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUserEmail = await getUserByEmail(email);
    if (existingUserEmail) {
      if (!existingUserEmail.emailVerified || !existingUserEmail.isActive) {
        return {
          error:
            "هذا البريد مسجّل لكن غير مفعّل. استخدم «إعادة إرسال رابط التحقق» من صفحة الدخول.",
          code: "EMAIL_NOT_VERIFIED" as const,
          emailForResend: existingUserEmail.email,
        };
      }
      return { error: "البريد مستخدم مسبقاً" };
    }

    const prismaRole = role as Role;
    const uniqueJobTypes = [...new Set(jobTypes)] as JobType[];
    const uniqueGarageIds = [...new Set(garageIds)];

    if (prismaRole === Role.DRIVER && isCompanyDriver) {
      const validGarages = await prisma.garage.findMany({
        where: {
          id: { in: uniqueGarageIds },
          isDeleted: false,
          isActive: true,
        },
        select: { id: true },
      });
      if (validGarages.length !== uniqueGarageIds.length) {
        return { error: "بعض الشركات السياحية المختارة غير صالحة" };
      }
    }

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: prismaRole,
          isActive: false,
          emailVerified: false,
        },
      });

      if (prismaRole === Role.GARAGE_OWNER && uniqueJobTypes.length > 0) {
        await tx.userJobPreference.createMany({
          data: uniqueJobTypes.map((jobType) => ({
            userId: created.id,
            jobType,
          })),
          skipDuplicates: true,
        });
      }

      if (prismaRole === Role.DRIVER && uniqueJobTypes.length > 0) {
        const profile = await tx.driverProfile.create({
          data: {
            userId: created.id,
            isFreelancer: Boolean(isIndependentDriver),
            isVerified: false,
            isActive: true,
          },
        });
        await tx.driverJob.createMany({
          data: uniqueJobTypes.map((jobType) => ({
            driverId: profile.id,
            jobType,
            isActive: true,
          })),
          skipDuplicates: true,
        });

        if (isCompanyDriver && uniqueGarageIds.length > 0) {
          await tx.garageMember.createMany({
            data: uniqueGarageIds.map((garageId) => ({
              userId: created.id,
              garageId,
              role: GarageRole.DRIVER,
            })),
            skipDuplicates: true,
          });
        }
      }

      return created;
    });

    const mailed = await createAndSendVerificationToken({
      email: user.email,
      name: user.name,
    });

    console.info("[register] verification email result", {
      email: user.email,
      ok: mailed.ok,
      error: !mailed.ok ? mailed.error : undefined,
    });

    if (!mailed.ok) {
      return {
        success:
          "تم إنشاء حسابك. تعذر إرسال رسالة التحقق الآن — افتح صفحة الدخول واستخدم «إعادة إرسال رابط التحقق».",
        warning: mailed.error,
        code: "EMAIL_SEND_FAILED" as const,
        emailForResend: user.email,
      };
    }

    return {
      success:
        "تم إنشاء حسابك وهو معطّل مؤقتاً. أرسلنا رابط التفعيل إلى بريدك — افتح الرابط لتفعيل الحساب وتسجيل الدخول.",
    };
  } catch (error) {
    console.error("[register]", error);
    const detail =
      error instanceof Error && process.env.NODE_ENV !== "production"
        ? ` (${error.message})`
        : "";
    return {
      error: `تعذر إنشاء الحساب. تحقق من الاتصال بقاعدة البيانات.${detail}`,
    };
  }
}
