"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import { PartnershipStatus } from "@prisma/client";
import { createNotification } from "@/lib/actions/notification.actions";
import { revalidatePath } from "next/cache";

export type PartnershipMessageRow = {
  id: string;
  body: string;
  senderUserId: string;
  senderName: string;
  createdAt: string;
  isMine: boolean;
};

async function canAccessPartnership(userId: string, role: string, partnershipId: string) {
  const row = await prisma.businessPartnership.findUnique({
    where: { id: partnershipId },
    include: {
      garage: { select: { ownerId: true, name: true } },
      hotel: { select: { ownerId: true, name: true } },
      restaurant: { select: { ownerId: true, name: true } },
      farm: { select: { ownerId: true, name: true } },
    },
  });
  if (!row || row.status !== PartnershipStatus.ACCEPTED) return null;

  if (role === UserRole.SUPER_ADMIN) return row;

  if (row.garage.ownerId === userId) return row;
  const member = await prisma.garageMember.findFirst({
    where: {
      garageId: row.garageId,
      userId,
      role: "GARAGE_ADMIN",
    },
  });
  if (member) return row;

  const partnerOwner =
    row.hotel?.ownerId ?? row.restaurant?.ownerId ?? row.farm?.ownerId;
  if (partnerOwner === userId) return row;

  return null;
}

export async function getPartnershipThread(partnershipId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const row = await canAccessPartnership(
    session.user.id,
    session.user.role,
    partnershipId
  );
  if (!row) return null;

  const partner = row.hotel ?? row.restaurant ?? row.farm;

  const messages = await prisma.partnershipMessage.findMany({
    where: { partnershipId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true } } },
  });

  await prisma.partnershipMessage.updateMany({
    where: {
      partnershipId,
      senderUserId: { not: session.user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  return {
    partnershipId: row.id,
    garageName: row.garage.name,
    partnerName: partner?.name ?? "—",
    partnerType: row.partnerType,
    messages: messages.map(
      (m): PartnershipMessageRow => ({
        id: m.id,
        body: m.body,
        senderUserId: m.senderUserId,
        senderName: m.sender.name,
        createdAt: m.createdAt.toISOString(),
        isMine: m.senderUserId === session.user.id,
      })
    ),
  };
}

export async function sendPartnershipMessage(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };

  const partnershipId = String(formData.get("partnershipId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!partnershipId || !body) return { error: "اكتب رسالة" };

  const row = await canAccessPartnership(
    session.user.id,
    session.user.role,
    partnershipId
  );
  if (!row) return { error: "المحادثة غير متاحة" };

  await prisma.partnershipMessage.create({
    data: {
      partnershipId,
      senderUserId: session.user.id,
      body,
    },
  });

  const recipientIds = new Set<string>();
  recipientIds.add(row.garage.ownerId);
  const partnerOwner =
    row.hotel?.ownerId ?? row.restaurant?.ownerId ?? row.farm?.ownerId;
  if (partnerOwner) recipientIds.add(partnerOwner);
  recipientIds.delete(session.user.id);

  for (const userId of recipientIds) {
    await createNotification({
      userId,
      type: "PARTNERSHIP_MESSAGE",
      title: "رسالة شراكة جديدة",
      body: body.slice(0, 140),
      data: { partnershipId },
    });
  }

  revalidatePath(`/partnership-messages/${partnershipId}`);
  return { success: true };
}

export async function listMyPartnershipChats() {
  const session = await auth();
  if (!session?.user) return [];

  const role = session.user.role;
  const where =
    role === UserRole.GARAGE_OWNER
      ? {
          status: PartnershipStatus.ACCEPTED,
          garage: { ownerId: session.user.id },
        }
      : role === UserRole.HOTEL_OWNER
        ? {
            status: PartnershipStatus.ACCEPTED,
            hotel: { ownerId: session.user.id },
          }
        : role === UserRole.RESTAURANT_OWNER
          ? {
              status: PartnershipStatus.ACCEPTED,
              restaurant: { ownerId: session.user.id },
            }
          : role === UserRole.FARM_OWNER
            ? {
                status: PartnershipStatus.ACCEPTED,
                farm: { ownerId: session.user.id },
              }
            : role === UserRole.SUPER_ADMIN
              ? { status: PartnershipStatus.ACCEPTED }
              : null;

  if (!where) return [];

  const list = await prisma.businessPartnership.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      garage: { select: { name: true } },
      hotel: { select: { name: true } },
      restaurant: { select: { name: true } },
      farm: { select: { name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true },
      },
    },
  });

  return list.map((p) => ({
    id: p.id,
    title: `${p.garage.name} ↔ ${p.hotel?.name ?? p.restaurant?.name ?? p.farm?.name ?? "—"}`,
    lastMessage: p.messages[0]?.body ?? "ابدأ المحادثة",
    updatedAt: (p.messages[0]?.createdAt ?? p.updatedAt).toISOString(),
  }));
}
