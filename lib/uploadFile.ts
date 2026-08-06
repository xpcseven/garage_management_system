"use server";

import { storeImageFile } from "@/lib/image-storage";
import { putObjectToS3, isS3Configured } from "@/lib/aws-s3";
import { S3_FOLDERS } from "@/lib/s3-folders";
import { v4 as uuidv4 } from "uuid";

/** رفع ملف عام — صور وPDF إلى AWS فقط */
export async function uploadFile(data: FormData) {
  const file = data.get("file") as File | null;
  if (!file) {
    throw new Error("No file uploaded");
  }

  const validTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!validTypes.includes(file.type)) {
    throw new Error(
      "Invalid file type. Only PDF, JPEG, PNG, WEBP, and GIF files are allowed."
    );
  }

  if (file.type.startsWith("image/")) {
    const result = await storeImageFile(file, S3_FOLDERS.uploads);
    if (!result.success) throw new Error(result.error);
    return { success: true, path: result.path, url: result.path };
  }

  if (!isS3Configured()) {
    throw new Error("AWS S3 غير مضبوط");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uniqueFileName = `${Date.now()}-${uuidv4()}.pdf`;
  const key = `tourism/${S3_FOLDERS.documents}/${uniqueFileName}`;
  const url = await putObjectToS3({
    key,
    body: buffer,
    contentType: "application/pdf",
  });
  return { success: true, path: url, url };
}
