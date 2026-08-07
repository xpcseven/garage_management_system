"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import { GarageRole } from "@prisma/client";
import { canCreateGarage } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { notifyAllPassengers } from "@/lib/actions/notification.actions";

export type GarageRow = {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  ownerId: string;
};

const garageSelect = {
  id: true,
  name: true,
  description: true,
  phone: true,
  address: true,
  isActive: true,
  ownerId: true,
} as const;

export async function getGaragesForUser(): Promise<GarageRow[]> {
  const session = await auth();
  if (!session?.user) return [];
  const userId = session.user.id;
  const role = session.user.role;

  if (role === UserRole.SUPER_ADMIN) {
    return prisma.garage.findMany({
      where: { isDeleted: false },
      orderBy: { name: "asc" },
      select: garageSelect,
    });
  }
  if (role === UserRole.GARAGE_OWNER) {
    return prisma.garage.findMany({
      where: { isDeleted: false, ownerId: userId },
      orderBy: { name: "asc" },
      select: garageSelect,
    });
  }
  const memberOf = await prisma.garageMember.findMany({
    where: { userId },
    select: { garageId: true },
  });
  const ids = memberOf.map((m) => m.garageId);
  if (ids.length === 0) return [];
  return prisma.garage.findMany({
    where: { isDeleted: false, id: { in: ids } },
    orderBy: { name: "asc" },
    select: garageSelect,
  });
}

export async function createGarage(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canCreateGarage(session.user.role)) {
    return { error: "لا تملك صلاحية إنشاء شركة سياحية" };
  }
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "اسم الشركة السياحية مطلوب" };
  const description =
    String(formData.get("description") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim();
  if (!address) return { error: "موقع الشركة السياحية مطلوب" };

  const ownerId =
    session.user.role === UserRole.SUPER_ADMIN
      ? String(formData.get("ownerId") ?? "").trim() || session.user.id
      : session.user.id;

  try {
    const garage = await prisma.garage.create({
      data: {
        name,
        description,
        phone,
        address,
        ownerId,
        isActive: true,
      },
    });
    revalidatePath("/garages");
    revalidatePath("/home");
    revalidatePath("/passenger/garages");

    try {
      await notifyAllPassengers({
        type: "NEW_GARAGE",
        title: "شركة سياحية جديدة",
        body: `أُضيفت شركة «${name}» ويمكنك تصفّح رحلاتها الآن.`,
        data: { garageId: garage.id, href: `/passenger/garages/${garage.id}` },
      });
    } catch (e) {
      console.error("notify passengers garage", e);
    }

    return { success: true };
  } catch {
    return { error: "تعذر إنشاء الشركة السياحية" };
  }
}

export async function updateGarage(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "معرّف الشركة السياحية مفقود" };

  const existing = await prisma.garage.findFirst({
    where: { id, isDeleted: false },
  });
  if (!existing) return { error: "الشركة السياحية غير موجودة" };

  const isOwner = existing.ownerId === session.user.id;
  const isSuper = session.user.role === UserRole.SUPER_ADMIN;
  const isGarageAdmin = await prisma.garageMember.findFirst({
    where: {
      garageId: id,
      userId: session.user.id,
      role: GarageRole.GARAGE_ADMIN,
    },
  });
  if (!isOwner && !isSuper && !isGarageAdmin) {
    return { error: "لا تملك صلاحية تعديل هذه الشركة السياحية" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description =
    String(formData.get("description") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim();
  const isActive = formData.get("isActive") === "true";
  if (!name) return { error: "اسم الشركة السياحية مطلوب" };
  if (!address) return { error: "موقع الشركة السياحية مطلوب" };

  try {
    await prisma.garage.update({
      where: { id },
      data: { name, description, phone, address, isActive },
    });
    revalidatePath("/garages");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر التحديث" };
  }
}

export type GarageDriverRow = {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  joinedAt: string;
};

async function assertCanManageGarageDrivers(garageId: string) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" as const, session: null };

  const garage = await prisma.garage.findFirst({
    where: { id: garageId, isDeleted: false },
  });
  if (!garage) return { error: "الشركة غير موجودة" as const, session: null };

  const allowed =
    session.user.role === UserRole.SUPER_ADMIN ||
    garage.ownerId === session.user.id ||
    (await prisma.garageMember.findFirst({
      where: {
        garageId,
        userId: session.user.id,
        role: GarageRole.GARAGE_ADMIN,
      },
    }));

  if (!allowed) return { error: "ليس لديك صلاحية" as const, session: null };
  return { error: null, session, garage };
}

export async function getDriversLinkedToGarage(
  garageId: string
): Promise<GarageDriverRow[]> {
  const access = await assertCanManageGarageDrivers(garageId);
  if (access.error) return [];

  const members = await prisma.garageMember.findMany({
    where: { garageId, role: GarageRole.DRIVER },
    orderBy: { joinedAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return members
    .filter((m) => m.user.role === UserRole.DRIVER)
    .map((m) => ({
      membershipId: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      joinedAt: m.joinedAt.toISOString(),
    }));
}

/** للشركات السياحية: ربط سائق مسجّل مسبقاً عبر بريده */
export async function linkDriverToGarageByEmail(formData: FormData) {
  const garageId = String(formData.get("garageId") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const access = await assertCanManageGarageDrivers(garageId);
  if (access.error) return { error: access.error };
  if (!email) return { error: "أدخل بريد السائق" };

  const driver = await prisma.user.findFirst({
    where: {
      email,
      role: UserRole.DRIVER,
      isDeleted: false,
      isActive: true,
    },
    include: { driverProfile: true },
  });
  if (!driver) {
    return { error: "لا يوجد سائق مفعّل بهذا البريد" };
  }

  try {
    await prisma.garageMember.upsert({
      where: {
        userId_garageId: { userId: driver.id, garageId },
      },
      create: {
        userId: driver.id,
        garageId,
        role: GarageRole.DRIVER,
      },
      update: {
        role: GarageRole.DRIVER,
      },
    });
    revalidatePath("/garages");
    revalidatePath("/vehicles");
    return { success: true };
  } catch {
    return { error: "تعذر ربط السائق بالشركة" };
  }
}

export async function unlinkDriverFromGarage(formData: FormData) {
  const garageId = String(formData.get("garageId") ?? "").trim();
  const userId = String(formData.get("userId") ?? "").trim();
  const access = await assertCanManageGarageDrivers(garageId);
  if (access.error) return { error: access.error };
  if (!userId) return { error: "معرّف السائق مفقود" };

  await prisma.garageMember.deleteMany({
    where: { garageId, userId, role: GarageRole.DRIVER },
  });

  // فك تعيين المركبات المرتبطة بهذا السائق في الشركة
  await prisma.vehicle.updateMany({
    where: { garageId, driverId: userId },
    data: { driverId: null, driverName: null },
  });

  revalidatePath("/garages");
  revalidatePath("/vehicles");
  return { success: true };
}
