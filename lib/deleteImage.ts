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

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ENOENT"
  );
}

export async function deleteImage(imageUrl: string) {
  try {
    if (!isManagedUploadUrl(imageUrl)) {
      return { success: true, message: "Nothing to delete" };
    }

    const key = extractS3Key(imageUrl);

    // Absolute S3/CDN URL → delete from S3
    if (s3Configured() && key && /^https?:\/\//i.test(imageUrl.trim())) {
      try {
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
      } catch (error) {
        // Object already gone — OK
        if (!isNotFoundError(error)) {
          console.warn("S3 delete skipped/failed:", error);
        }
      }
      return { success: true, message: "Image deleted successfully" };
    }

    // Local /uploads/... (or leftover relative path)
    const fileName = imageUrl.replace(/^.*\/uploads\//, "").replace(/^\//, "");
    if (!fileName || fileName.includes("..")) {
      return { success: true, message: "Invalid path ignored" };
    }

    const uploadRoot =
      process.env.UPLOAD_DIR?.trim() ||
      join(process.cwd(), "public", "uploads");
    const filePath = join(uploadRoot, fileName);

    try {
      await unlink(filePath);
    } catch (error) {
      // File already missing (common after redeploy) — not a failure
      if (!isNotFoundError(error)) {
        console.warn("Local delete skipped/failed:", error);
      }
    }

    return { success: true, message: "Image deleted successfully" };
  } catch (error) {
    // Never throw — DB row deletion must not fail because of a missing file
    console.warn("deleteImage soft-fail:", error);
    return { success: true, message: "Delete skipped" };
  }
}
