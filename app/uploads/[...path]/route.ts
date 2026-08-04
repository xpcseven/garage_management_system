import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join, normalize } from "path";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  pdf: "application/pdf",
};

function uploadRoot() {
  return (
    process.env.UPLOAD_DIR?.trim() ||
    join(process.cwd(), "public", "uploads")
  );
}

type Params = { params: { path: string[] } };

/** Serve files from UPLOAD_DIR (persistent path outside deploy checkout) */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const parts = params.path ?? [];
    if (parts.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const relative = parts.join("/");
    if (relative.includes("..") || relative.includes("\\")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const root = uploadRoot();
    const filePath = normalize(join(root, relative));
    if (!filePath.startsWith(normalize(root))) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    await stat(filePath);
    const buf = await readFile(filePath);
    const ext = relative.split(".").pop()?.toLowerCase() ?? "";
    const type = MIME[ext] ?? "application/octet-stream";

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
