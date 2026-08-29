"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canManageCities } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export type CityRow = {
  id: string;
  name: string;
  country: string | null;
  region: string | null;
  isActive: boolean;
};

const citySelect = {
  id: true,
  name: true,
  country: true,
  region: true,
  isActive: true,
} as const;

/** مدن نشطة للنماذج والبحث (عام بدون تسجيل) */
export async function getActiveCitiesPublic(): Promise<CityRow[]> {
  const rows = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ country: "asc" }, { name: "asc" }],
    select: citySelect,
  });
  return rows;
}

export async function getCities(): Promise<CityRow[]> {
  const session = await auth();
  if (!session?.user || !canManageCities(session.user.role)) {
    return [];
  }
  const rows = await prisma.city.findMany({
    orderBy: [{ country: "asc" }, { name: "asc" }],
    select: citySelect,
  });
  return rows;
}

export async function createCity(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageCities(session.user.role)) {
    return { error: "لا تملك صلاحية إضافة مدينة" };
  }
  const name = String(formData.get("name") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim() || null;
  const region = String(formData.get("region") ?? "").trim() || null;
  if (!name) return { error: "اسم المدينة مطلوب" };
  if (!country) return { error: "الدولة مطلوبة" };
  try {
    await prisma.city.create({
      data: { name, country, region, isActive: true },
    });
    revalidatePath("/cities");
    revalidatePath("/tourism_places");
    revalidatePath("/home");
    revalidatePath("/trips");
    revalidatePath("/passenger/trips");
    return { success: true };
  } catch {
    return { error: "تعذر الإنشاء (ربما الاسم مكرر)" };
  }
}

export async function updateCity(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canManageCities(session.user.role)) {
    return { error: "لا تملك صلاحية التعديل" };
  }
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim() || null;
  const region = String(formData.get("region") ?? "").trim() || null;
  const isActive = formData.get("isActive") === "true";
  if (!id || !name) return { error: "بيانات غير كاملة" };
  if (!country) return { error: "الدولة مطلوبة" };
  try {
    await prisma.city.update({
      where: { id },
      data: { name, country, region, isActive },
    });
    revalidatePath("/cities");
    revalidatePath("/tourism_places");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر التحديث" };
  }
}

export async function deleteCity(id: string) {
  const session = await auth();
  if (!session?.user || !canManageCities(session.user.role)) {
    return { error: "لا تملك صلاحية الحذف" };
  }
  const used = await prisma.trip.count({
    where: {
      OR: [{ fromCityId: id }, { toCityId: id }],
    },
  });
  if (used > 0) {
    return { error: "المدينة مرتبطة برحلات ولا يمكن حذفها" };
  }
  const stops = await prisma.tripStop.count({ where: { cityId: id } });
  if (stops > 0) {
    return { error: "المدينة مستخدمة كمحطة ولا يمكن حذفها" };
  }
  try {
    await prisma.city.delete({ where: { id } });
    revalidatePath("/cities");
    revalidatePath("/tourism_places");
    revalidatePath("/home");
    return { success: true };
  } catch {
    return { error: "تعذر الحذف" };
  }
}
