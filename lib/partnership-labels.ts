import type { BusinessPartnerType } from "@prisma/client";

export function partnerLabel(type: BusinessPartnerType | string) {
  if (type === "HOTEL") return "فندق";
  if (type === "RESTAURANT") return "مطعم";
  return "مزرعة";
}

export const PARTNERSHIP_STATUS_AR: Record<string, string> = {
  PENDING: "بانتظار الرد",
  ACCEPTED: "مقبولة",
  REJECTED: "مرفوضة",
  CANCELLED: "ملغاة",
  ENDED: "منتهية",
};
