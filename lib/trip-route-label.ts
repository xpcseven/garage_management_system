/**
 * عرض «المحافظة» في المسار: يُفضَّل حقل المنطقة `region` (محافظة)،
 * وإلا يُستخدم اسم المدينة.
 */
export function governorateDisplayName(
  cityName: string,
  region: string | null | undefined
): string {
  const r = region?.trim();
  if (r && r.length > 0) return r;
  return cityName.trim() || "—";
}
