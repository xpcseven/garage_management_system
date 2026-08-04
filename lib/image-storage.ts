import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

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

export function s3Configured() {
  return Boolean(
    process.env.AWS_S3_BUCKET?.trim() &&
      process.env.AWS_ACCESS_KEY_ID?.trim() &&
      process.env.AWS_SECRET_ACCESS_KEY?.trim() &&
      process.env.AWS_REGION?.trim()
  );
}

function getS3Client() {
  return new S3Client({
    region: process.env.AWS_REGION!.trim(),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!.trim(),
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!.trim(),
    },
  });
}

function publicObjectUrl(key: string): string {
  const custom = process.env.AWS_S3_PUBLIC_URL?.trim().replace(/\/$/, "");
  if (custom) return `${custom}/${key}`;
  const bucket = process.env.AWS_S3_BUCKET!.trim();
  const region = process.env.AWS_REGION!.trim();
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function localUploadDir() {
  return (
    process.env.UPLOAD_DIR?.trim() ||
    join(process.cwd(), "public", "uploads")
  );
}

export type StoreImageResult =
  | { success: true; path: string }
  | { success: false; error: string };

/** True for local /uploads paths or absolute S3/CDN URLs we manage */
export function isManagedUploadUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const u = url.trim();
  if (u.startsWith("/uploads/")) return true;
  if (/^https?:\/\//i.test(u) && u.includes("/uploads/")) return true;
  const custom = process.env.AWS_S3_PUBLIC_URL?.trim();
  if (custom && u.startsWith(custom.replace(/\/$/, ""))) return true;
  return false;
}

export async function storeImageFile(file: File): Promise<StoreImageResult> {
  try {
    if (!file || file.size === 0) {
      return { success: false, error: "لم يتم اختيار ملف" };
    }

    const ext = resolveExtension(file);
    if (!ext) {
      return {
        success: false,
        error: "امتداد الصورة غير مدعوم. استخدم PNG أو JPG أو WEBP",
      };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const safeBase =
      file.name.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "_").slice(0, 80) ||
      "image";
    const uniqueFileName = `${uuidv4()}-${safeBase}.${ext}`;
    const key = `uploads/${uniqueFileName}`;
    const contentType =
      file.type && file.type.startsWith("image/")
        ? file.type
        : `image/${ext === "jpg" ? "jpeg" : ext}`;

    // Prefer S3 whenever credentials exist (production server)
    if (s3Configured()) {
      try {
        const client = getS3Client();
        await client.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!.trim(),
            Key: key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
          })
        );
        return { success: true, path: publicObjectUrl(key) };
      } catch (error) {
        console.error("storeImageFile S3 error", error);
        const detail =
          error instanceof Error ? error.message : "فشل الرفع إلى التخزين السحابي";
        // In production do not silently fall back to local (files vanish on deploy)
        if (process.env.NODE_ENV === "production") {
          return {
            success: false,
            error: `تعذر رفع الصورة إلى السيرفر (S3): ${detail}`,
          };
        }
        // Dev: fall through to local disk
      }
    } else if (process.env.NODE_ENV === "production") {
      console.warn(
        "storeImageFile: AWS S3 env vars missing in production — using local UPLOAD_DIR"
      );
    }

    // Local disk (dev, or production with UPLOAD_DIR outside deploy folder)
    const uploadDir = localUploadDir();
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, uniqueFileName), buffer);
    return { success: true, path: `/uploads/${uniqueFileName}` };
  } catch (error) {
    console.error("storeImageFile", error);
    const message =
      error instanceof Error ? error.message : "فشل حفظ الصورة";
    return { success: false, error: message };
  }
}

export async function storeImagesFromFormData(
  formData: FormData,
  fieldName = "placeImages"
): Promise<StoreImageResult[]> {
  const files = formData
    .getAll(fieldName)
    .filter((f): f is File => f instanceof File && f.size > 0);
  const results: StoreImageResult[] = [];
  for (const file of files) {
    results.push(await storeImageFile(file));
  }
  return results;
}
