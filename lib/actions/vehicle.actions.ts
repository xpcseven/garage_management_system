"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import { GarageRole, TransportType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type VehicleRow = {
  id: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  color: string | null;
  totalSeats: number;
  transportType: TransportType;
  isActive: boolean;
  garageId: string | null;
  garageName: string | null;
  driverName: string | null;
};

async function vehicleWhereForUser(userId: string, role: string) {
  if (role === UserRole.SUPER_ADMIN) {
    return {};
  }
  if (role === UserRole.GARAGE_OWNER) {
    const owned = await prisma.garage.findMany({
      where: { ownerId: userId, isDeleted: false },
      select: { id: true },
    });
    const garageIds = owned.map((g) => g.id);
    return {
      OR: [
        { ownerId: userId },
        ...(garageIds.length ? [{ garageId: { in: garageIds } }] : []),
      ],
    };
  }
  return { ownerId: userId };
}

export async function getVehiclesForUser(): Promise<VehicleRow[]> {
  const session = await auth();
  if (!session?.user) return [];
  const where = await vehicleWhereForUser(session.user.id, session.user.role);
  const list = await prisma.vehicle.findMany({
    where,
    orderBy: { plateNumber: "asc" },
    include: {
      garage: { select: { name: true } },
    },
  });
  return list.map((v) => ({
    id: v.id,
    brand: v.brand,
    model: v.model,
    year: v.year,
    plateNumber: v.plateNumber,
    color: v.color,
    totalSeats: v.totalSeats,
    transportType: v.transportType,
    isActive: v.isActive,
    garageId: v.garageId,
    garageName: v.garage?.name ?? null,
    driverName: v.driverName ?? null,
  }));
}

export async function getGarageOptionsForVehicle(): Promise<
  { id: string; name: string }[]
> {
  const session = await auth();
  if (!session?.user) return [];
  if (session.user.role === UserRole.SUPER_ADMIN) {
    const g = await prisma.garage.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return g;
  }
  if (session.user.role === UserRole.GARAGE_OWNER) {
    const g = await prisma.garage.findMany({
      where: { ownerId: session.user.id, isDeleted: false },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    return g;
  }
  const member = await prisma.garageMember.findMany({
    where: {
      userId: session.user.id,
      role: GarageRole.GARAGE_ADMIN,
    },
    include: { garage: { select: { id: true, name: true, isDeleted: true } } },
  });
  return member
    .filter((m) => !m.garage.isDeleted)
    .map((m) => ({ id: m.garage.id, name: m.garage.name }));
}

export async function createVehicle(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const plateNumber = String(formData.get("plateNumber") ?? "").trim();
  const year = Number(formData.get("year"));
  const totalSeats = Number(formData.get("totalSeats"));
  const color = String(formData.get("color") ?? "").trim() || null;
  const transportType = String(
    formData.get("transportType") ?? "INTERNAL"
  ) as TransportType;
  const garageIdRaw = String(formData.get("garageId") ?? "").trim();
  const garageId = garageIdRaw || null;
  const driverName = String(formData.get("driverName") ?? "").trim() || null;

  if (!brand || !model || !plateNumber || !year || !totalSeats) {
    return { error: "أكمل الحقول المطلوبة" };
  }

  if (session.user.role === UserRole.GARAGE_OWNER) {
    if (!garageId) {
      return { error: "يجب اختيار الشركة السياحية لإضافة المركبة إلى أسطولك" };
    }
  }

  if (garageId && !driverName) {
    return { error: "أدخل اسم السائق المعيّن لهذه المركبة في الشركة السياحية" };
  }

  if (garageId) {
    const g = await prisma.garage.findFirst({
      where: { id: garageId, isDeleted: false },
    });
    if (!g) return { error: "شركة سياحية غير صالحة" };
    const allowed =
      session.user.role === UserRole.SUPER_ADMIN ||
      g.ownerId === session.user.id ||
      (await prisma.garageMember.findFirst({
        where: {
          garageId,
          userId: session.user.id,
          role: GarageRole.GARAGE_ADMIN,
        },
      }));
    if (!allowed) return { error: "لا يمكنك ربط المركبة بهذه الشركة السياحية" };
  }

  try {
    await prisma.vehicle.create({
      data: {
        brand,
        model,
        year,
        plateNumber,
        color,
        totalSeats,
        transportType,
        ownerId: session.user.id,
        garageId,
        driverName,
        isActive: true,
      },
    });
    revalidatePath("/vehicles");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر الإنشاء (ربما اللوحة مكررة)" };
  }
}

export async function updateVehicle(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "معرّف المركبة مفقود" };

  const v = await prisma.vehicle.findUnique({ where: { id } });
  if (!v) return { error: "المركبة غير موجودة" };

  const canEdit =
    session.user.role === UserRole.SUPER_ADMIN ||
    v.ownerId === session.user.id ||
    (v.garageId &&
      (await prisma.garage.findFirst({
        where: { id: v.garageId, ownerId: session.user.id },
      }))) ||
    (v.garageId &&
      (await prisma.garageMember.findFirst({
        where: {
          garageId: v.garageId,
          userId: session.user.id,
          role: GarageRole.GARAGE_ADMIN,
        },
      })));

  if (!canEdit) return { error: "لا تملك صلاحية التعديل" };

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const year = Number(formData.get("year"));
  const totalSeats = Number(formData.get("totalSeats"));
  const color = String(formData.get("color") ?? "").trim() || null;
  const isActive = formData.get("isActive") === "true";
  const transportType = String(
    formData.get("transportType") ?? v.transportType
  ) as TransportType;
  const driverName = String(formData.get("driverName") ?? "").trim() || null;

  if (!brand || !model || !year || !totalSeats) {
    return { error: "أكمل الحقول المطلوبة" };
  }

  if (v.garageId && !driverName) {
    return { error: "اسم السائق مطلوب للمركبات المرتبطة بشركة سياحية" };
  }

  try {
    await prisma.vehicle.update({
      where: { id },
      data: {
        brand,
        model,
        year,
        totalSeats,
        color,
        isActive,
        transportType,
        driverName: v.garageId ? driverName : null,
      },
    });
    revalidatePath("/vehicles");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر التحديث" };
  }
}
