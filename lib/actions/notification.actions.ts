"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { NotificationType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data ?? undefined,
    },
  });
}

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data: unknown;
};

export async function getMyNotifications(limit = 30): Promise<NotificationRow[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const list = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return list.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
    data: n.data,
  }));
}

export async function getUnreadNotificationCount(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;
  return prisma.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
}

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "غير مصرح" };

  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { isRead: true, readAt: new Date() },
  });
  revalidatePath("/home");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return { error: "غير مصرح" };

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  revalidatePath("/home");
  return { success: true };
}
