"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/prisma/UserRole.enum";
import { GarageRole, TransportType, VehicleCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  countBookableSeats,
  VEHICLE_CATEGORY_LABELS,
} from "@/lib/vehicle-seat-layouts";
import { resolveVehicleSeatLayout } from "@/lib/vehicle-models";

export type VehicleRow = {
  id: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  color: string | null;
  totalSeats: number;
  category: VehicleCategory;
  categoryLabel: string;
  transportType: TransportType;
  isActive: boolean;
  garageId: string | null;
  garageName: string | null;
  driverId: string | null;
  driverName: string | null;
};

export type GarageDriverOption = {
  id: string;
  name: string;
  email: string;
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
      driver: { select: { id: true, name: true } },
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
    category: v.category,
    categoryLabel: VEHICLE_CATEGORY_LABELS[v.category] ?? v.category,
    transportType: v.transportType,
    isActive: v.isActive,
    garageId: v.garageId,
    garageName: v.garage?.name ?? null,
    driverId: v.driverId ?? null,
    driverName: v.driver?.name ?? v.driverName ?? null,
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

/** سائقو الشركة المرتبطون (GarageMember DRIVER) — لاختيارهم عند إضافة مركبة */
export async function getLinkedDriversForGarages(
  garageIds: string[]
): Promise<Record<string, GarageDriverOption[]>> {
  const session = await auth();
  if (!session?.user || garageIds.length === 0) return {};

  const uniqueIds = [...new Set(garageIds.filter(Boolean))];
  const result: Record<string, GarageDriverOption[]> = {};
  for (const id of uniqueIds) result[id] = [];

  const ownedOrAdmin = await prisma.garage.findMany({
    where: {
      id: { in: uniqueIds },
      isDeleted: false,
      ...(session.user.role === UserRole.SUPER_ADMIN
        ? {}
        : {
            OR: [
              { ownerId: session.user.id },
              {
                members: {
                  some: {
                    userId: session.user.id,
                    role: GarageRole.GARAGE_ADMIN,
                  },
                },
              },
            ],
          }),
    },
    select: { id: true },
  });
  const allowed = new Set(ownedOrAdmin.map((g) => g.id));
  if (allowed.size === 0) return result;

  const members = await prisma.garageMember.findMany({
    where: {
      garageId: { in: Array.from(allowed) },
      role: GarageRole.DRIVER,
      user: {
        role: UserRole.DRIVER,
        isDeleted: false,
        isActive: true,
      },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  for (const m of members) {
    const list = result[m.garageId] ?? (result[m.garageId] = []);
    list.push({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
    });
  }
  return result;
}

async function resolveAssignedDriver(
  garageId: string | null,
  driverIdRaw: string
): Promise<
  | { error: string }
  | { driverId: string | null; driverName: string | null }
> {
  const driverId = driverIdRaw.trim() || null;
  if (!garageId) {
    return { driverId: null, driverName: null };
  }
  if (!driverId) {
    return { error: "اختر سائقاً مرتبطاً بهذه الشركة السياحية" };
  }

  const membership = await prisma.garageMember.findFirst({
    where: {
      garageId,
      userId: driverId,
      role: GarageRole.DRIVER,
      user: {
        role: UserRole.DRIVER,
        isDeleted: false,
        isActive: true,
      },
    },
    include: { user: { select: { name: true } } },
  });
  if (!membership) {
    return {
      error: "السائق غير مرتبط بهذه الشركة. اربط السائق أولاً من صفحة الشركات.",
    };
  }
  return { driverId, driverName: membership.user.name };
}

function parseCategory(raw: string): VehicleCategory {
  const allowed = Object.keys(VEHICLE_CATEGORY_LABELS) as VehicleCategory[];
  if (allowed.includes(raw as VehicleCategory)) return raw as VehicleCategory;
  return VehicleCategory.SEDAN;
}

export async function createVehicle(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح" };

  const brand = String(formData.get("brand") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const plateNumber = String(formData.get("plateNumber") ?? "").trim();
  const year = Number(formData.get("year"));
  const modelId = String(formData.get("modelId") ?? "").trim() || null;
  const category = parseCategory(String(formData.get("category") ?? "SEDAN"));
  const layout = resolveVehicleSeatLayout({
    modelId,
    brand,
    model,
    category,
  });
  const totalSeats = countBookableSeats(layout);
  const color = String(formData.get("color") ?? "").trim() || null;
  const transportType = String(
    formData.get("transportType") ?? "INTERNAL"
  ) as TransportType;
  const garageIdRaw = String(formData.get("garageId") ?? "").trim();
  const garageId = garageIdRaw || null;
  const driverIdRaw = String(formData.get("driverId") ?? "").trim();

  if (!brand || !model || !plateNumber || !year || !totalSeats) {
    return { error: "أكمل الحقول المطلوبة" };
  }

  if (session.user.role === UserRole.GARAGE_OWNER) {
    if (!garageId) {
      return { error: "يجب اختيار الشركة السياحية لإضافة المركبة إلى أسطولك" };
    }
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

  const assigned = await resolveAssignedDriver(garageId, driverIdRaw);
  if ("error" in assigned) return { error: assigned.error };

  try {
    await prisma.vehicle.create({
      data: {
        brand,
        model,
        year,
        plateNumber,
        color,
        totalSeats,
        category,
        seatLayoutJson: layout,
        transportType,
        ownerId: session.user.id,
        garageId,
        driverId: assigned.driverId,
        driverName: assigned.driverName,
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
  const modelId = String(formData.get("modelId") ?? "").trim() || null;
  const category = parseCategory(
    String(formData.get("category") ?? v.category)
  );
  const layout = resolveVehicleSeatLayout({
    modelId,
    brand,
    model,
    category,
  });
  const totalSeats = countBookableSeats(layout);
  const color = String(formData.get("color") ?? "").trim() || null;
  const isActive = formData.get("isActive") === "true";
  const transportType = String(
    formData.get("transportType") ?? v.transportType
  ) as TransportType;
  const driverIdRaw = String(formData.get("driverId") ?? "").trim();

  if (!brand || !model || !year || !totalSeats) {
    return { error: "أكمل الحقول المطلوبة" };
  }

  const assigned = await resolveAssignedDriver(v.garageId, driverIdRaw);
  if ("error" in assigned) return { error: assigned.error };

  try {
    await prisma.vehicle.update({
      where: { id },
      data: {
        brand,
        model,
        year,
        totalSeats,
        category,
        seatLayoutJson: layout,
        color,
        isActive,
        transportType,
        driverId: v.garageId ? assigned.driverId : null,
        driverName: v.garageId ? assigned.driverName : null,
      },
    });
    revalidatePath("/vehicles");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر التحديث" };
  }
}
