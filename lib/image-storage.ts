import {
  isS3Configured,
  putObjectToS3,
  getS3Bucket,
  getS3Region,
} from "@/lib/aws-s3";
import { S3_FOLDERS } from "@/lib/s3-folders";

export { S3_FOLDERS } from "@/lib/s3-folders";
export type { S3Folder } from "@/lib/s3-folders";

const ALLOWED_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
]);

const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/bmp": "bmp",
};

function resolveExtension(file: File): string | null {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ALLOWED_EXTENSIONS.has(fromName)) return fromName;

  const fromMime = MIME_TO_EXT[(file.type || "").toLowerCase()];
  if (fromMime) return fromMime;

  if ((file.type || "").startsWith("image/")) return "jpg";
  if (fromName) return null;
  return "jpg";
}

export { isS3Configured as s3Configured };

export type StoreImageResult =
  | { success: true; path: string; url?: string }
  | { success: false; error: string };

/** True for proxy /uploads / S3 URLs we manage */
export function isManagedUploadUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const u = url.trim();
  if (u.startsWith("/api/media/")) return true;
  if (u.startsWith("/uploads/")) return true;
  if (/^https?:\/\//i.test(u) && u.includes(".amazonaws.com/")) return true;
  const bucket = getS3Bucket();
  if (bucket && u.includes(`${bucket}.s3.`)) return true;
  return false;
}

/**
 * رفع صورة إلى AWS S3 فقط (لا يوجد حفظ محلي).
 * يُرجع مسار `/api/media/...` للعرض عبر الوسيط.
 */
export async function storeImageFile(
  file: File,
  folder: string = S3_FOLDERS.uploads
): Promise<StoreImageResult> {
  try {
    if (!file || file.size === 0) {
      return { success: false, error: "لم يتم اختيار ملف" };
    }

    if (!isS3Configured()) {
      return {
        success: false,
        error:
          "إعدادات AWS غير مكتملة. أضف AWS_ACCESS_KEY_ID و AWS_SECRET_ACCESS_KEY و AWS_REGION و AWS_S3_BUCKET",
      };
    }

    const ext = resolveExtension(file);
    if (!ext) {
      return {
        success: false,
        error: "امتداد الصورة غير مدعوم. استخدم PNG أو JPG أو WEBP",
      };
    }

    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "") || "uploads";
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const s3Key = `tourism/${safeFolder}/${fileName}`;
    const contentType =
      file.type && file.type.startsWith("image/")
        ? file.type
        : `image/${ext === "jpg" ? "jpeg" : ext}`;

    const fileUrl = await putObjectToS3({
      key: s3Key,
      body: buffer,
      contentType,
    });

    console.info("[storeImageFile] S3 OK", {
      bucket: getS3Bucket(),
      region: getS3Region(),
      key: s3Key,
      url: fileUrl,
    });

    return { success: true, path: fileUrl, url: fileUrl };
  } catch (error) {
    console.error("storeImageFile / Upload error:", error);
    const message =
      error instanceof Error ? error.message : "فشل رفع الصورة إلى AWS";
    return { success: false, error: message };
  }
}

export async function storeImagesFromFormData(
  formData: FormData,
  fieldName = "placeImages",
  folder: string = S3_FOLDERS.uploads
): Promise<StoreImageResult[]> {
  const files = formData
    .getAll(fieldName)
    .filter((f): f is File => f instanceof File && f.size > 0);
  const results: StoreImageResult[] = [];
  for (const file of files) {
    results.push(await storeImageFile(file, folder));
  }
  return results;
}

/** يجمع النتائج ويُرجع أول خطأ إن وُجد */
export function collectUploadResults(results: StoreImageResult[]): {
  urls: string[];
  error?: string;
} {
  const urls: string[] = [];
  for (const r of results) {
    if (!r.success) {
      return { urls, error: r.error };
    }
    if (!urls.includes(r.path)) urls.push(r.path);
  }
  return { urls };
}
