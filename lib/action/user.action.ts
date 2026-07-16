"use server";

import { prisma } from "@/lib/prisma";

export const getUserByEmail = async (email: string) => {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: normalized, mode: "insensitive" },
      },
    });

    return user;
  } catch {
    return null;
  }
};

export const getUserAuthById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  } catch {
    return null;
  }
};

