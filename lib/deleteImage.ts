"use server";

import { unlink } from "fs/promises";
import { join } from "path";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { isManagedUploadUrl } from "@/lib/image-storage";

function s3Configured() {
  return Boolean(
    process.env.AWS_S3_BUCKET?.trim() &&
      process.env.AWS_ACCESS_KEY_ID?.trim() &&
      process.env.AWS_SECRET_ACCESS_KEY?.trim() &&
      process.env.AWS_REGION?.trim()
  );
}

function extractS3Key(imageUrl: string): string | null {
  const u = imageUrl.trim();
  if (u.startsWith("/uploads/")) {
    return u.replace(/^\//, "");
  }
  try {
    const parsed = new URL(u);
    const path = parsed.pathname.replace(/^\//, "");
    if (path.startsWith("uploads/")) return path;
    return null;
  } catch {
    return null;
  }
}

export async function deleteImage(imageUrl: string) {
  try {
    if (!isManagedUploadUrl(imageUrl)) {
      return { success: false, message: "Not a managed upload URL" };
    }

    const key = extractS3Key(imageUrl);

    if (s3Configured() && key && !imageUrl.startsWith("/uploads/")) {
      const client = new S3Client({
        region: process.env.AWS_REGION!.trim(),
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!.trim(),
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!.trim(),
        },
      });
      await client.send(
        new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!.trim(),
          Key: key,
        })
      );
      return { success: true, message: "Image deleted successfully" };
    }

    // Local file (or leftover relative path on disk)
    const fileName = imageUrl.replace(/^.*\/uploads\//, "").replace(/^\//, "");
    if (!fileName || fileName.includes("..")) {
      return { success: false, message: "Invalid path" };
    }
    const filePath = join(process.cwd(), "public", "uploads", fileName);
    await unlink(filePath);
    return { success: true, message: "Image deleted successfully" };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { success: false, message: "Delete failed" };
  }
}
