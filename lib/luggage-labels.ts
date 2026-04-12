/** قيم آمنة للعميل — بدون استيراد Prisma */

export type LuggageKindValue =
  | "LARGE_BAG"
  | "MEDIUM_BAG"
  | "SACK"
  | "CARTON";

export const LUGGAGE_KIND_OPTIONS: { value: LuggageKindValue; label: string }[] = [
  { value: "LARGE_BAG", label: "حقيبة كبيرة" },
  { value: "MEDIUM_BAG", label: "حقيبة متوسطة" },
  { value: "SACK", label: "كيس" },
  { value: "CARTON", label: "كارتون" },
];

export function luggageKindLabel(kind: string): string {
  const o = LUGGAGE_KIND_OPTIONS.find((x) => x.value === kind);
  return o?.label ?? kind;
}

/** ما يُرسل من نموذج الحجز إلى الإجراء الخادمي */
export type BookTripLuggagePayload = {
  kind: LuggageKindValue;
  weightKg?: string;
  dimensions?: string;
  quantity?: number;
};
