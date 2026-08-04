"use server";

import { storeImageFile } from "@/lib/image-storage";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import {
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function s3Configured() {
  return Boolean(
    process.env.AWS_S3_BUCKET?.trim() &&
      process.env.AWS_ACCESS_KEY_ID?.trim() &&
      process.env.AWS_SECRET_ACCESS_KEY?.trim() &&
      process.env.AWS_REGION?.trim()
  );
}

function publicObjectUrl(key: string): string {
  const custom = process.env.AWS_S3_PUBLIC_URL?.trim().replace(/\/$/, "");
  if (custom) return `${custom}/${key}`;
  const bucket = process.env.AWS_S3_BUCKET!.trim();
  const region = process.env.AWS_REGION!.trim();
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/** رفع ملف عام (صور عبر image-storage، PDF عبر S3 أو محلي) */
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
    const result = await storeImageFile(file);
    if (!result.success) throw new Error(result.error);
    return { success: true, path: result.path };
  }

  // PDF
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uniqueFileName = `${uuidv4()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
  const key = `uploads/${uniqueFileName}`;

  if (s3Configured()) {
    const client = new S3Client({
      region: process.env.AWS_REGION!.trim(),
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!.trim(),
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!.trim(),
      },
    });
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!.trim(),
        Key: key,
        Body: buffer,
        ContentType: "application/pdf",
      })
    );
    return { success: true, path: publicObjectUrl(key) };
  }

  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, uniqueFileName), buffer);
  return { success: true, path: `/uploads/${uniqueFileName}` };
}
