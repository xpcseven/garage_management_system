const FALLBACK_TOURISM_IMAGE = "/System/Tourism_Images/all-hadar_02.png";

/** يحوّل روابط مطلقة (مثل localhost من بيئة التطوير) إلى مسار نسبي يعمل على السيرفر */
export function normalizePublicImageSrc(
  url: string | null | undefined
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/")) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "tr.ashuor.com" ||
      host.endsWith(".ashuor.com")
    ) {
      return parsed.pathname + parsed.search;
    }

    if (host.includes("amazonaws.com")) {
      return trimmed;
    }

    return null;
  } catch {
    return null;
  }
}

export function resolvePublicImageSrc(
  url: string | null | undefined,
  fallback: string = FALLBACK_TOURISM_IMAGE
): string {
  return normalizePublicImageSrc(url) ?? fallback;
}

export { FALLBACK_TOURISM_IMAGE };
