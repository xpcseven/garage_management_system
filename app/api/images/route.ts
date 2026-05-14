import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Step 2

function getContentType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();

  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    case ".pdf":
      return "application/pdf";
    default:
      return null;
  }
}

function sanitizePublicPath(value: string | null) {
  if (!value) return null;

  const normalized = value.replace(/^\/+/, "");
  if (!normalized || normalized.includes("..")) return null;

  return normalized;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageName = sanitizePublicPath(searchParams.get("imageName"));
  const fallbackName = sanitizePublicPath(searchParams.get("fallback"));

  if (!imageName) {
    return NextResponse.json(
      { error: "Image name not provided" },
      { status: 400 }
    );
  }

  const fileCandidates = [path.join(process.cwd(), "public", imageName)];
  if (fallbackName) {
    fileCandidates.push(path.join(process.cwd(), "public", fallbackName));
  }

  try {
    for (const filePath of fileCandidates) {
      if (!fs.existsSync(filePath)) continue;

      const contentType = getContentType(filePath);
      if (!contentType) {
        return NextResponse.json(
          { error: "Unsupported image format" },
          { status: 415 }
        );
      }

      const imageBuffer = fs.readFileSync(filePath);
      return new NextResponse(imageBuffer, {
        headers: { "Content-Type": contentType },
      });
    }

    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error reading image file" },
      { status: 500 }
    );
  }
}
