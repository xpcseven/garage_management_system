"use server";

import { RegisterSchema } from "@/schemas";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getUserByEmail } from "../user.action";
import { JobType, Role } from "@prisma/client";

export async function register(values: z.infer<typeof RegisterSchema>) {
  try {
    const validateFields = RegisterSchema.safeParse(values);

    if (!validateFields.success) {
      const first = validateFields.error.flatten().fieldErrors;
      const msg =
        first.jobTypes?.[0] ||
        first.role?.[0] ||
        Object.values(first).flat()[0] ||
        "بيانات غير صالحة";
      return { error: msg };
    }

    const { email, name, password, role, jobTypes } = validateFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUserEmail = await getUserByEmail(email);
    if (existingUserEmail) {
      return { error: "البريد مستخدم مسبقاً" };
    }

    const prismaRole = role as Role;
    const uniqueJobTypes = [...new Set(jobTypes)] as JobType[];

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: prismaRole,
          isActive: true,
        },
      });

      if (prismaRole === Role.GARAGE_OWNER && uniqueJobTypes.length > 0) {
        await tx.userJobPreference.createMany({
          data: uniqueJobTypes.map((jobType) => ({
            userId: user.id,
            jobType,
          })),
          skipDuplicates: true,
        });
      }

      if (prismaRole === Role.DRIVER && uniqueJobTypes.length > 0) {
        const profile = await tx.driverProfile.create({
          data: {
            userId: user.id,
            isFreelancer: true,
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
      }
    });

    return { success: "تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول." };
  } catch (error) {
    console.error(error);
    return { error: "تعذر إنشاء الحساب. تحقق من الاتصال بقاعدة البيانات." };
  }
}
