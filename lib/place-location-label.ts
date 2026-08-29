/** تسمية موقع المعلم للعرض (دولة · محافظة أو مدينة) */
export function placeLocationLabel(
  p: {
    country?: string | null;
    governorate?: string | null;
    cityName?: string | null;
    cityRegion?: string | null;
  },
  fallback = "—"
): string {
  if (p.country?.trim() && p.governorate?.trim()) {
    return `${p.country.trim()} · ${p.governorate.trim()}`;
  }
  if (p.governorate?.trim()) return p.governorate.trim();
  if (p.country?.trim()) return p.country.trim();
  if (p.cityName?.trim()) {
    return p.cityRegion?.trim()
      ? `${p.cityName.trim()} — ${p.cityRegion.trim()}`
      : p.cityName.trim();
  }
  return fallback;
}
