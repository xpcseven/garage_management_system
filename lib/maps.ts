/** Open Google Maps for a stored location (URL, coords, or address text). */
export function placeMapsUrl(location: string | null | undefined): string | null {
  const trimmed = location?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}
