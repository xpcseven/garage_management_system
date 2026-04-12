"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const getUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  } catch {
    return null;
  }
};

export async function getUserByUsername(username: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    return user;
  } catch (error) {
    console.log(error);
  }
}

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

