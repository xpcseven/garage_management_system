"use server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(data: FormData) {
  try {
    const file = data.get("file") as File | null;
    if (!file) {
      throw new Error("No file uploaded");
    }

    // Validate MIME type
    if (!file.type.startsWith("image/")) {
      throw new Error("Invalid file type. Only images are allowed.");
    }

    // Validate file extension
    const validExtensions = ["png", "jpg", "jpeg", "gif"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!validExtensions.includes(fileExtension || "")) {
      throw new Error("Invalid file extension");
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the path where the image will be stored within your project
    const uploadDir = join(process.cwd(), "public", "uploads");

    // Create the directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Generate a unique name for the image using UUID
    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const filePath = join(uploadDir, uniqueFileName);

    // Save the image with the unique name
    await writeFile(filePath, buffer);

    // Return the relative path for accessing the image
    const relativePath = `/uploads/${uniqueFileName}`;
    return { success: true, path: relativePath };
  } catch (error) {
    throw error;
  }
}
