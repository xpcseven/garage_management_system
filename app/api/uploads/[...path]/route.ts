import { access, readFile } from "fs/promises";
import { NextResponse } from "next/server";
import {
  decodeUploadFileName,
  getUploadMimeType,
  getUploadPathCandidates,
  isSafeUploadFileName,
} from "@/lib/uploadStorage";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    path?: string[];
  };
};

export async function GET(_: Request, { params }: RouteContext) {
  const pathSegments = params.path ?? [];
  if (pathSegments.length !== 1) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const fileName = decodeUploadFileName(pathSegments[0]);
  if (!isSafeUploadFileName(fileName)) {
    return NextResponse.json({ error: "Invalid image path" }, { status: 400 });
  }

  for (const filePath of getUploadPathCandidates(fileName)) {
    try {
      await access(filePath);
      const fileBuffer = await readFile(filePath);

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": getUploadMimeType(fileName),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // Try the next configured location.
    }
  }

  return NextResponse.json({ error: "Image not found" }, { status: 404 });
}
