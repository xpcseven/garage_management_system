"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { isManagedUploadUrl } from "@/lib/image-storage";
import {
  createS3Client,
  extractS3Key,
  getS3Bucket,
  isS3Configured,
} from "@/lib/aws-s3";

/** حذف كائن واحد من AWS S3 */
export async function deleteImage(imageUrl: string) {
  try {
    if (!imageUrl?.trim()) {
      return { success: true, message: "Empty" };
    }

    if (!isManagedUploadUrl(imageUrl) && !extractS3Key(imageUrl)) {
      return { success: true, message: "Nothing to delete" };
    }

    const key = extractS3Key(imageUrl);
    if (!key) {
      console.warn("[deleteImage] could not extract key", imageUrl);
      return { success: false, message: "Invalid key" };
    }

    if (!isS3Configured()) {
      console.warn("[deleteImage] S3 not configured, skip", key);
      return { success: false, message: "S3 not configured" };
    }

    const s3 = createS3Client();
    await s3.send(
      new DeleteObjectCommand({
        Bucket: getS3Bucket(),
        Key: key,
      })
    );

    console.info("[deleteImage] S3 deleted", { key });
    return { success: true, message: "Deleted successfully" };
  } catch (error) {
    console.error("[deleteImage] failed", imageUrl, error);
    return { success: false, message: "Delete failed" };
  }
}

/** حذف عدة صور من AWS */
export async function deleteImages(urls: (string | null | undefined)[]) {
  const unique = [...new Set(urls.filter(Boolean) as string[])];
  for (const url of unique) {
    await deleteImage(url);
  }
}
