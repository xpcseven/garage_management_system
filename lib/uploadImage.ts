"use server";

import { storeImageFile, type StoreImageResult } from "@/lib/image-storage";
import { S3_FOLDERS } from "@/lib/s3-folders";

export type UploadImageResult = StoreImageResult;

/** رفع صورة عبر Server Action إلى AWS S3 */
export async function uploadImage(data: FormData): Promise<UploadImageResult> {
  const file = data.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "لم يتم اختيار ملف" };
  }
  const folderRaw = data.get("folder");
  const folder =
    typeof folderRaw === "string" && folderRaw.trim()
      ? folderRaw.trim()
      : S3_FOLDERS.uploads;
  return storeImageFile(file, folder);
}
