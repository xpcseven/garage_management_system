import { IRAQI_GOVERNORATES } from "@/lib/constants/iraqi-governorates";

/** مناطق / محافظات شائعة للحج والعمرة والسياحة */
export const SAUDI_REGIONS = [
  "مكة المكرمة",
  "المدينة المنورة",
  "الرياض",
  "جدة",
  "الطائف",
  "المنطقة الشرقية",
  "عسير",
  "تبوك",
  "حائل",
  "القصيم",
  "جازان",
  "نجران",
  "الباحة",
  "الجوف",
  "الحدود الشمالية",
] as const;

export const UAE_EMIRATES = [
  "أبوظبي",
  "دبي",
  "الشارقة",
  "عجمان",
  "أم القيوين",
  "رأس الخيمة",
  "الفجيرة",
] as const;

export const JORDAN_GOVERNORATES = [
  "عمّان",
  "إربد",
  "الزرقاء",
  "البلقاء",
  "المفرق",
  "الكرك",
  "معان",
  "الطفيلة",
  "عجلون",
  "جرش",
  "مادبا",
  "العقبة",
] as const;

export const TURKEY_PROVINCES = [
  "إسطنبول",
  "أنقرة",
  "إزمير",
  "بورصة",
  "أنطاليا",
  "طرابزون",
  "غازي عنتاب",
  "قونية",
] as const;

export const EGYPT_GOVERNORATES = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الأقصر",
  "أسوان",
  "جنوب سيناء",
  "البحر الأحمر",
  "شرم الشيخ",
] as const;

export const COUNTRY_GOVERNORATES: Record<string, readonly string[]> = {
  العراق: IRAQI_GOVERNORATES,
  "المملكة العربية السعودية": SAUDI_REGIONS,
  "الإمارات العربية المتحدة": UAE_EMIRATES,
  الأردن: JORDAN_GOVERNORATES,
  تركيا: TURKEY_PROVINCES,
  مصر: EGYPT_GOVERNORATES,
};

export const TOURISM_COUNTRIES = Object.keys(COUNTRY_GOVERNORATES);

export function findCountryForGovernorate(
  governorate: string | null | undefined
): string {
  const g = governorate?.trim();
  if (!g) return "";
  for (const [country, list] of Object.entries(COUNTRY_GOVERNORATES)) {
    if (list.includes(g)) return country;
  }
  return "";
}

export function governoratesForCountry(country: string): readonly string[] {
  return COUNTRY_GOVERNORATES[country] ?? [];
}
