import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

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

export type StoreImageResult =
  | { success: true; path: string }
  | { success: false; error: string };

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
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const safeBase =
      file.name.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "_").slice(0, 80) ||
      "image";
    const uniqueFileName = `${uuidv4()}-${safeBase}.${ext}`;
    await writeFile(join(uploadDir, uniqueFileName), buffer);

    return { success: true, path: `/uploads/${uniqueFileName}` };
  } catch (error) {
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
