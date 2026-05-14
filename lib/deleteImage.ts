"use server";
import { unlink } from "fs/promises";
import { join } from "path";

export async function deleteImage(imageUrl: string) {
  try {
    // Define the base directory where the uploads are stored
    const uploadDir = join(process.cwd(), "public", "uploads");

    // Construct the absolute path to the image
    const filePath = join(uploadDir, imageUrl.replace("/uploads/", ""));

    // Delete the file
    await unlink(filePath);

    return { success: true, message: "Image deleted successfully" };
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}
