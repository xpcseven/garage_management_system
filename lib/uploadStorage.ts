import path from "path";

const DEFAULT_UPLOAD_DIR = path.join("public", "uploads");
export const UPLOADS_URL_PREFIX = "/uploads/";

function stripUnsafePathCharacters(value: string) {
  return value.replace(/[\\/:*?"<>|]+/g, "-");
}

export function sanitizeUploadFileName(originalName: string) {
  const extension = path.extname(originalName).toLowerCase();
  const rawBaseName = path.basename(originalName, extension);
  const normalizedBaseName = rawBaseName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  const safeBaseName = stripUnsafePathCharacters(normalizedBaseName)
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "")
    .toLowerCase();

  return `${safeBaseName || "file"}${extension}`;
}

export function getUploadDir() {
  const configuredUploadDir = process.env.UPLOAD_DIR?.trim();
  if (!configuredUploadDir) {
    return path.join(process.cwd(), DEFAULT_UPLOAD_DIR);
  }

  return path.isAbsolute(configuredUploadDir)
    ? configuredUploadDir
    : path.join(process.cwd(), configuredUploadDir);
}

export function getLegacyUploadDir() {
  return path.join(process.cwd(), DEFAULT_UPLOAD_DIR);
}

export function buildUploadFileUrl(fileName: string) {
  return `${UPLOADS_URL_PREFIX}${fileName}`;
}

export function decodeUploadFileName(fileName: string) {
  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
}

export function isSafeUploadFileName(fileName: string) {
  return Boolean(fileName) && !fileName.includes("/") && !fileName.includes("\\");
}

export function getUploadFileNameFromUrl(fileUrl: string) {
  if (!fileUrl.startsWith(UPLOADS_URL_PREFIX)) {
    return null;
  }

  const fileName = decodeUploadFileName(fileUrl.slice(UPLOADS_URL_PREFIX.length));
  return isSafeUploadFileName(fileName) ? fileName : null;
}

export function getUploadPathCandidates(fileName: string) {
  const primaryDir = getUploadDir();
  const legacyDir = getLegacyUploadDir();

  if (primaryDir === legacyDir) {
    return [path.join(primaryDir, fileName)];
  }

  return [path.join(primaryDir, fileName), path.join(legacyDir, fileName)];
}

export function getUploadMimeType(fileName: string) {
  switch (path.extname(fileName).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}
