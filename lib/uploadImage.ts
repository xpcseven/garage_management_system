"use server";

import { storeImageFile, type StoreImageResult } from "@/lib/image-storage";

export type UploadImageResult = StoreImageResult;

export async function uploadImage(data: FormData): Promise<UploadImageResult> {
  const file = data.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "لم يتم اختيار ملف" };
  }
  return storeImageFile(file);
}
