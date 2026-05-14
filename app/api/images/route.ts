import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

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

  // Define the path to the image
  const filePath = path.join(process.cwd(), "public", imageName); // Ensure you include "uploads" in the path

  try {
    // Check if the file exists
    if (fs.existsSync(filePath)) {
      const imageBuffer = fs.readFileSync(filePath);

      // Determine the content type based on the file extension
      const ext = path.extname(imageName).toLowerCase();
      let contentType;

      switch (ext) {
        case ".jpg":
        case ".jpeg":
          contentType = "image/jpeg";
          break;
        case ".png":
          contentType = "image/png";
          break;
        case ".pdf":
          contentType = "application/pdf";
          break;
        default:
          return NextResponse.json(
            { error: "Unsupported image format" },
            { status: 415 } // Unsupported Media Type
          );
      }

      return new NextResponse(imageBuffer, {
        headers: { "Content-Type": contentType },
      });
    } else {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error reading image file" },
      { status: 500 }
    );
  }
}
