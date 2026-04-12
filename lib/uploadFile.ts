"use server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export async function uploadFile(data: FormData) {
  // تغيير اسم الدالة إلى uploadFile
  try {
    const file = data.get("file") as File | null;
    if (!file) {
      throw new Error("No file uploaded");
    }

    // تحقق من نوع الملف
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ]; // أضف الأنواع المسموح بها هنا
    if (!validTypes.includes(file.type)) {
      throw new Error(
        "Invalid file type. Only PDF, JPEG, and PNG files are allowed."
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the path where the file will be stored within your project
    const uploadDir = join(process.cwd(), "public", "uploads");

    // Create the directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Generate a unique name for the file using UUID
    const uniqueFileName = `${uuidv4()}-${file.name}`;
    const filePath = join(uploadDir, uniqueFileName);

    // Save the file with the unique name
    await writeFile(filePath, buffer);

    const relativePath = `/uploads/${uniqueFileName}`;
    return { success: true, path: relativePath };
  } catch (error) {
    throw error;
  }
}
