/**
 * تحويل رابط S3 إلى مسار وسيط /api/media/... حتى تظهر الصور
 * حتى لو الـ bucket غير عام (403 على الرابط المباشر).
 */
export function toDisplayImageUrl(
  url: string | null | undefined
): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();

  if (u.startsWith("/api/media/")) return u;
  if (u.startsWith("/uploads/")) return u;

  try {
    const parsed = new URL(u);
    if (!parsed.hostname.includes("amazonaws.com")) return u;
    const key = parsed.pathname.replace(/^\//, "");
    if (!key) return u;
    return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;
  } catch {
    return u;
  }
}

/** رابط مطلق للموبايل/واجهات خارجية */
export function toAbsoluteDisplayImageUrl(
  url: string | null | undefined,
  baseUrl?: string
): string | null {
  const display = toDisplayImageUrl(url);
  if (!display) return null;
  if (/^https?:\/\//i.test(display)) return display;
  const base = (
    baseUrl ||
    process.env.NEXT_WEBSITE_URL ||
    process.env.NEXTAUTH_URL ||
    ""
  )
    .trim()
    .replace(/\/$/, "");
  if (!base) return display;
  return `${base}${display.startsWith("/") ? "" : "/"}${display}`;
}
