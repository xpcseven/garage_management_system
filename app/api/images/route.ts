import { access, readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import {
  decodeUploadFileName,
  getUploadFileNameFromUrl,
  getUploadMimeType,
  getUploadPathCandidates,
  isSafeUploadFileName,
} from "@/lib/uploadStorage";

export const dynamic = "force-dynamic"; // Step 2

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageName = searchParams.get("imageName");

  if (!imageName) {
    return NextResponse.json(
      { error: "Image name not provided" },
      { status: 400 }
    );
  }

  const fileName = imageName.startsWith("/uploads/")
    ? getUploadFileNameFromUrl(imageName)
    : decodeUploadFileName(imageName);

  if (!fileName || !isSafeUploadFileName(fileName)) {
    return NextResponse.json({ error: "Invalid image path" }, { status: 400 });
  }

  try {
    for (const filePath of getUploadPathCandidates(fileName)) {
      try {
        await access(filePath);
        const imageBuffer = await readFile(filePath);

        return new NextResponse(imageBuffer, {
          headers: { "Content-Type": getUploadMimeType(fileName) },
        });
      } catch {
        // Try the next configured location.
      }
    }

    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error reading image file" },
      { status: 500 }
    );
  }
}
