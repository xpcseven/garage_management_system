export function buildSafeImageSrc(
  imageUrl: string | null | undefined,
  fallbackPath = "/System/Tourism_Images/all-hadar_01.png"
) {
  if (!imageUrl) return fallbackPath;

  if (!imageUrl.startsWith("/")) {
    return imageUrl;
  }

  const normalizedImagePath = imageUrl.replace(/^\/+/, "");
  const normalizedFallbackPath = fallbackPath.replace(/^\/+/, "");

  return `/api/images?imageName=${encodeURIComponent(
    normalizedImagePath
  )}&fallback=${encodeURIComponent(normalizedFallbackPath)}`;
}
