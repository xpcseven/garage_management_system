"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import {
  BusinessPartnerType,
  PartnershipStatus,
  TourismApprovalStatus,
} from "@prisma/client";
import { createNotification } from "@/lib/actions/notification.actions";
import { partnerLabel } from "@/lib/partnership-labels";
import { revalidatePath } from "next/cache";

const ACTIVE_STATUSES: PartnershipStatus[] = [
  PartnershipStatus.PENDING,
  PartnershipStatus.ACCEPTED,
];

export type PartnerCandidate = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  imageUrl: string | null;
  cityName: string | null;
};

export type PartnershipRow = {
  id: string;
  partnerType: BusinessPartnerType;
  status: PartnershipStatus;
  inviteMessage: string;
  responseMessage: string | null;
  isPublicOnDirectory: boolean;
  invitedAt: string;
  respondedAt: string | null;
  garageId: string;
  garageName: string;
  partnerId: string;
  partnerName: string;
  partnerAddress: string | null;
  partnerPhone: string | null;
  partnerImageUrl: string | null;
};

async function userCanManageGarage(userId: string, role: string, garageId: string) {
  if (role === UserRole.SUPER_ADMIN) return true;
  const garage = await prisma.garage.findFirst({
    where: { id: garageId, isDeleted: false },
  });
  if (!garage) return false;
  if (garage.ownerId === userId) return true;
  const member = await prisma.garageMember.findFirst({
    where: { garageId, userId, role: "GARAGE_ADMIN" },
  });
  return !!member;
}

function mapPartnership(p: {
  id: string;
  partnerType: BusinessPartnerType;
  status: PartnershipStatus;
  inviteMessage: string;
  responseMessage: string | null;
  isPublicOnDirectory: boolean;
  invitedAt: Date;
  respondedAt: Date | null;
  garageId: string;
  garage: { name: string };
  hotelId: string | null;
  restaurantId: string | null;
  farmId: string | null;
  hotel: { id: string; name: string; address: string | null; phone: string | null; imageUrl: string | null } | null;
  restaurant: { id: string; name: string; address: string | null; phone: string | null; imageUrl: string | null } | null;
  farm: { id: string; name: string; address: string | null; phone: string | null; imageUrl: string | null } | null;
}): PartnershipRow {
  const partner =
    p.hotel ?? p.restaurant ?? p.farm;
  return {
    id: p.id,
    partnerType: p.partnerType,
    status: p.status,
    inviteMessage: p.inviteMessage,
    responseMessage: p.responseMessage,
    isPublicOnDirectory: p.isPublicOnDirectory,
    invitedAt: p.invitedAt.toISOString(),
    respondedAt: p.respondedAt?.toISOString() ?? null,
    garageId: p.garageId,
    garageName: p.garage.name,
    partnerId: partner?.id ?? "",
    partnerName: partner?.name ?? "—",
    partnerAddress: partner?.address ?? null,
    partnerPhone: partner?.phone ?? null,
    partnerImageUrl: partner?.imageUrl ?? null,
  };
}

const partnershipInclude = {
  garage: { select: { name: true } },
  hotel: {
    select: { id: true, name: true, address: true, phone: true, imageUrl: true },
  },
  restaurant: {
    select: { id: true, name: true, address: true, phone: true, imageUrl: true },
  },
  farm: {
    select: { id: true, name: true, address: true, phone: true, imageUrl: true },
  },
} as const;

export async function getGaragesForPartnership(): Promise<
  { id: string; name: string }[]
> {
  const session = await auth();
  if (!session?.user) return [];
  if (session.user.role === UserRole.SUPER_ADMIN) {
    return prisma.garage.findMany({
      where: { isDeleted: false, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }
  if (session.user.role !== UserRole.GARAGE_OWNER) return [];
  return prisma.garage.findMany({
    where: { isDeleted: false, ownerId: session.user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function listPartnerCandidates(
  partnerType: BusinessPartnerType,
  garageId: string
): Promise<PartnerCandidate[]> {
  const session = await auth();
  if (!session?.user) return [];
  const ok = await userCanManageGarage(
    session.user.id,
    session.user.role,
    garageId
  );
  if (!ok) return [];

  const existing = await prisma.businessPartnership.findMany({
    where: {
      garageId,
      partnerType,
      status: { in: ACTIVE_STATUSES },
    },
    select: { hotelId: true, restaurantId: true, farmId: true },
  });

  const excludeIds = new Set(
    existing
      .map((e) => e.hotelId ?? e.restaurantId ?? e.farmId)
      .filter(Boolean) as string[]
  );

  if (partnerType === "HOTEL") {
    const list = await prisma.hotel.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        approvalStatus: TourismApprovalStatus.APPROVED,
        ...(excludeIds.size
          ? { id: { notIn: [...excludeIds] } }
          : {}),
      },
      orderBy: { name: "asc" },
      include: { city: { select: { name: true } } },
    });
    return list.map((h) => ({
      id: h.id,
      name: h.name,
      address: h.address,
      phone: h.phone,
      imageUrl: h.imageUrl,
      cityName: h.city?.name ?? null,
    }));
  }

  if (partnerType === "RESTAURANT") {
    const list = await prisma.restaurant.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        approvalStatus: TourismApprovalStatus.APPROVED,
        ...(excludeIds.size
          ? { id: { notIn: [...excludeIds] } }
          : {}),
      },
      orderBy: { name: "asc" },
      include: { city: { select: { name: true } } },
    });
    return list.map((r) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      phone: r.phone,
      imageUrl: r.imageUrl,
      cityName: r.city?.name ?? null,
    }));
  }

  const list = await prisma.farm.findMany({
    where: {
      isDeleted: false,
      isActive: true,
      approvalStatus: TourismApprovalStatus.APPROVED,
      ...(excludeIds.size ? { id: { notIn: [...excludeIds] } } : {}),
    },
    orderBy: { name: "asc" },
    include: { city: { select: { name: true } } },
  });
  return list.map((f) => ({
    id: f.id,
    name: f.name,
    address: f.address,
    phone: f.phone,
    imageUrl: f.imageUrl,
    cityName: f.city?.name ?? null,
  }));
}

export async function sendPartnershipInvite(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };

  const garageId = String(formData.get("garageId") ?? "").trim();
  const partnerType = String(
    formData.get("partnerType") ?? ""
  ).trim() as BusinessPartnerType;
  const partnerId = String(formData.get("partnerId") ?? "").trim();
  const inviteMessage = String(formData.get("inviteMessage") ?? "").trim();

  if (!garageId || !partnerId || !inviteMessage) {
    return { error: "أكمل بيانات الدعوة والرسالة" };
  }
  if (!["HOTEL", "RESTAURANT", "FARM"].includes(partnerType)) {
    return { error: "نوع الشريك غير صالح" };
  }

  const ok = await userCanManageGarage(
    session.user.id,
    session.user.role,
    garageId
  );
  if (!ok) return { error: "ليس لديك صلاحية على هذه الشركة" };

  const garage = await prisma.garage.findFirst({
    where: { id: garageId, isDeleted: false },
    select: { id: true, name: true },
  });
  if (!garage) return { error: "الشركة غير موجودة" };

  let ownerId: string | null = null;
  let partnerName = "";

  if (partnerType === "HOTEL") {
    const hotel = await prisma.hotel.findFirst({
      where: {
        id: partnerId,
        isDeleted: false,
        isActive: true,
        approvalStatus: TourismApprovalStatus.APPROVED,
      },
    });
    if (!hotel) return { error: "الفندق غير متاح للشراكة" };
    ownerId = hotel.ownerId;
    partnerName = hotel.name;
  } else if (partnerType === "RESTAURANT") {
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: partnerId,
        isDeleted: false,
        isActive: true,
        approvalStatus: TourismApprovalStatus.APPROVED,
      },
    });
    if (!restaurant) return { error: "المطعم غير متاح للشراكة" };
    ownerId = restaurant.ownerId;
    partnerName = restaurant.name;
  } else {
    const farm = await prisma.farm.findFirst({
      where: {
        id: partnerId,
        isDeleted: false,
        isActive: true,
        approvalStatus: TourismApprovalStatus.APPROVED,
      },
    });
    if (!farm) return { error: "المزرعة غير متاحة للشراكة" };
    ownerId = farm.ownerId;
    partnerName = farm.name;
  }

  const duplicate = await prisma.businessPartnership.findFirst({
    where: {
      garageId,
      partnerType,
      status: { in: ACTIVE_STATUSES },
      ...(partnerType === "HOTEL"
        ? { hotelId: partnerId }
        : partnerType === "RESTAURANT"
          ? { restaurantId: partnerId }
          : { farmId: partnerId }),
    },
  });
  if (duplicate) {
    return { error: "توجد دعوة أو شراكة نشطة بالفعل مع هذا الطرف" };
  }

  const created = await prisma.businessPartnership.create({
    data: {
      garageId,
      partnerType,
      hotelId: partnerType === "HOTEL" ? partnerId : null,
      restaurantId: partnerType === "RESTAURANT" ? partnerId : null,
      farmId: partnerType === "FARM" ? partnerId : null,
      status: PartnershipStatus.PENDING,
      inviteMessage,
      invitedByUserId: session.user.id,
    },
  });

  if (ownerId) {
    await createNotification({
      userId: ownerId,
      type: "PARTNERSHIP_INVITE",
      title: "دعوة شراكة جديدة",
      body: `دعوة من «${garage.name}» للشراكة مع «${partnerName}»: ${inviteMessage.slice(0, 120)}`,
      data: { partnershipId: created.id },
    });
  }

  revalidatePath("/partnerships");
  revalidatePath("/partnership-invites");
  return { success: true };
}

export async function listOutgoingPartnerships(
  garageId?: string
): Promise<PartnershipRow[]> {
  const session = await auth();
  if (!session?.user) return [];

  let garageFilter: string[] = [];
  if (session.user.role === UserRole.SUPER_ADMIN) {
    if (garageId) garageFilter = [garageId];
  } else if (session.user.role === UserRole.GARAGE_OWNER) {
    const mine = await prisma.garage.findMany({
      where: { ownerId: session.user.id, isDeleted: false },
      select: { id: true },
    });
    garageFilter = mine.map((g) => g.id);
    if (garageId) {
      if (!garageFilter.includes(garageId)) return [];
      garageFilter = [garageId];
    }
  } else {
    return [];
  }

  const list = await prisma.businessPartnership.findMany({
    where: garageFilter.length
      ? { garageId: { in: garageFilter } }
      : undefined,
    orderBy: { invitedAt: "desc" },
    include: partnershipInclude,
  });
  return list.map(mapPartnership);
}

export async function listIncomingInvites(): Promise<PartnershipRow[]> {
  const session = await auth();
  if (!session?.user) return [];

  const role = session.user.role;
  const where =
    role === UserRole.HOTEL_OWNER
      ? {
          partnerType: BusinessPartnerType.HOTEL,
          hotel: { ownerId: session.user.id, isDeleted: false },
        }
      : role === UserRole.RESTAURANT_OWNER
        ? {
            partnerType: BusinessPartnerType.RESTAURANT,
            restaurant: { ownerId: session.user.id, isDeleted: false },
          }
        : role === UserRole.FARM_OWNER
          ? {
              partnerType: BusinessPartnerType.FARM,
              farm: { ownerId: session.user.id, isDeleted: false },
            }
          : role === UserRole.SUPER_ADMIN
            ? {}
            : null;

  if (where === null) return [];

  const list = await prisma.businessPartnership.findMany({
    where,
    orderBy: { invitedAt: "desc" },
    include: partnershipInclude,
  });
  return list.map(mapPartnership);
}

export async function respondToPartnershipInvite(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };

  const id = String(formData.get("id") ?? "").trim();
  const accept = formData.get("accept") === "true";
  const responseMessage =
    String(formData.get("responseMessage") ?? "").trim() || null;
  if (!id) return { error: "معرّف الدعوة مفقود" };

  const row = await prisma.businessPartnership.findUnique({
    where: { id },
    include: {
      garage: { select: { name: true, ownerId: true } },
      hotel: { select: { ownerId: true, name: true } },
      restaurant: { select: { ownerId: true, name: true } },
      farm: { select: { ownerId: true, name: true } },
    },
  });
  if (!row || row.status !== PartnershipStatus.PENDING) {
    return { error: "الدعوة غير متاحة للرد" };
  }

  const partnerOwnerId =
    row.hotel?.ownerId ?? row.restaurant?.ownerId ?? row.farm?.ownerId;
  const partnerName =
    row.hotel?.name ?? row.restaurant?.name ?? row.farm?.name ?? "الشريك";

  if (
    session.user.role !== UserRole.SUPER_ADMIN &&
    partnerOwnerId !== session.user.id
  ) {
    return { error: "ليس لديك صلاحية الرد على هذه الدعوة" };
  }

  await prisma.businessPartnership.update({
    where: { id },
    data: {
      status: accept
        ? PartnershipStatus.ACCEPTED
        : PartnershipStatus.REJECTED,
      responseMessage,
      respondedByUserId: session.user.id,
      respondedAt: new Date(),
    },
  });

  await createNotification({
    userId: row.garage.ownerId,
    type: accept ? "PARTNERSHIP_ACCEPTED" : "PARTNERSHIP_REJECTED",
    title: accept ? "تم قبول دعوة الشراكة" : "تم رفض دعوة الشراكة",
    body: accept
      ? `قبل «${partnerName}» الشراكة مع «${row.garage.name}»`
      : `رفض «${partnerName}» الشراكة مع «${row.garage.name}»`,
    data: { partnershipId: id },
  });

  revalidatePath("/partnerships");
  revalidatePath("/partnership-invites");
  revalidatePath(`/passenger/garages/${row.garageId}`);
  return { success: true };
}

export async function cancelPartnershipInvite(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };

  const row = await prisma.businessPartnership.findUnique({
    where: { id },
  });
  if (!row || row.status !== PartnershipStatus.PENDING) {
    return { error: "لا يمكن إلغاء هذه الدعوة" };
  }
  const ok = await userCanManageGarage(
    session.user.id,
    session.user.role,
    row.garageId
  );
  if (!ok) return { error: "غير مصرح" };

  await prisma.businessPartnership.update({
    where: { id },
    data: { status: PartnershipStatus.CANCELLED, endedAt: new Date() },
  });
  revalidatePath("/partnerships");
  revalidatePath("/partnership-invites");
  return { success: true };
}

export async function endPartnership(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };

  const row = await prisma.businessPartnership.findUnique({
    where: { id },
    include: {
      garage: { select: { ownerId: true } },
      hotel: { select: { ownerId: true } },
      restaurant: { select: { ownerId: true } },
      farm: { select: { ownerId: true } },
    },
  });
  if (!row || row.status !== PartnershipStatus.ACCEPTED) {
    return { error: "الشراكة غير نشطة" };
  }

  const partnerOwnerId =
    row.hotel?.ownerId ?? row.restaurant?.ownerId ?? row.farm?.ownerId;
  const canGarage = await userCanManageGarage(
    session.user.id,
    session.user.role,
    row.garageId
  );
  const canPartner =
    session.user.role === UserRole.SUPER_ADMIN ||
    partnerOwnerId === session.user.id;

  if (!canGarage && !canPartner) return { error: "غير مصرح" };

  await prisma.businessPartnership.update({
    where: { id },
    data: { status: PartnershipStatus.ENDED, endedAt: new Date() },
  });
  revalidatePath("/partnerships");
  revalidatePath("/partnership-invites");
  revalidatePath(`/passenger/garages/${row.garageId}`);
  return { success: true };
}

export async function setPartnershipDirectoryVisibility(
  id: string,
  isPublic: boolean
) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };

  const row = await prisma.businessPartnership.findUnique({ where: { id } });
  if (!row || row.status !== PartnershipStatus.ACCEPTED) {
    return { error: "الشراكة غير نشطة" };
  }
  const ok = await userCanManageGarage(
    session.user.id,
    session.user.role,
    row.garageId
  );
  if (!ok) return { error: "غير مصرح" };

  await prisma.businessPartnership.update({
    where: { id },
    data: { isPublicOnDirectory: isPublic },
  });
  revalidatePath("/partnerships");
  revalidatePath(`/passenger/garages/${row.garageId}`);
  return { success: true };
}

export async function listAcceptedPartnersForGarage(garageId: string) {
  const list = await prisma.businessPartnership.findMany({
    where: {
      garageId,
      status: PartnershipStatus.ACCEPTED,
      isPublicOnDirectory: true,
    },
    orderBy: { respondedAt: "desc" },
    include: partnershipInclude,
  });
  return list.map(mapPartnership);
}

export async function listAcceptedPartnershipsForGarageOwner(
  garageId: string
): Promise<PartnershipRow[]> {
  const session = await auth();
  if (!session?.user) return [];
  const ok = await userCanManageGarage(
    session.user.id,
    session.user.role,
    garageId
  );
  if (!ok) return [];

  const list = await prisma.businessPartnership.findMany({
    where: { garageId, status: PartnershipStatus.ACCEPTED },
    orderBy: { respondedAt: "desc" },
    include: partnershipInclude,
  });
  return list.map(mapPartnership);
}

export async function assertAcceptedPartnership(opts: {
  garageId: string;
  partnershipId: string;
}) {
  return prisma.businessPartnership.findFirst({
    where: {
      id: opts.partnershipId,
      garageId: opts.garageId,
      status: PartnershipStatus.ACCEPTED,
    },
  });
}
