"use server";
import { unlink } from "fs/promises";
import {
  getUploadFileNameFromUrl,
  getUploadPathCandidates,
} from "@/lib/uploadStorage";

export async function deleteImage(imageUrl: string) {
  const fileName = getUploadFileNameFromUrl(imageUrl);
  if (!fileName) {
    throw new Error("Invalid upload URL");
  }

  const candidatePaths = getUploadPathCandidates(fileName);
  let lastError: unknown = null;

  for (const filePath of candidatePaths) {
    try {
      await unlink(filePath);
      return { success: true, message: "Image deleted successfully" };
    } catch (error) {
      lastError = error;
    }
  }

  console.error("Error deleting image:", lastError);
  throw lastError;
}
