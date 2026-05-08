"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import { GarageRole } from "@prisma/client";
import { canCreateGarage } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

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
    await prisma.garage.create({
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
