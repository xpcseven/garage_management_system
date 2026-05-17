"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageUsers } from "@/lib/permissions";

export type UserAdminRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export async function getUsersForAdmin(): Promise<UserAdminRow[]> {
  const session = await auth();
  if (!session?.user || !canManageUsers(session.user.role)) {
    return [];
  }

  const rows = await prisma.user.findMany({
    where: { isDeleted: false },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return rows.map((u) => ({
    ...u,
    role: String(u.role),
    createdAt: u.createdAt.toISOString(),
  }));
}
