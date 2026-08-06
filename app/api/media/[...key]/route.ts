import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { createS3Client, getS3Bucket, isS3Configured } from "@/lib/aws-s3";

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

type Params = { params: { key: string[] } };

/**
 * وسيط قراءة من S3 بمفاتيح التطبيق — يعمل حتى لو الـ bucket غير عام.
 * مثال: /api/media/tourism/home-slider/123.jpg
 */
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    if (!isS3Configured()) {
      return NextResponse.json({ error: "S3 not configured" }, { status: 500 });
    }

    const parts = params.key ?? [];
    if (parts.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const key = parts.map(decodeURIComponent).join("/");
    if (!key || key.includes("..")) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const client = createS3Client();
    const out = await client.send(
      new GetObjectCommand({
        Bucket: getS3Bucket(),
        Key: key,
      })
    );

    if (!out.Body) {
      return NextResponse.json({ error: "Empty object" }, { status: 404 });
    }

    const bytes = Buffer.from(await out.Body.transformToByteArray());
    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    const type =
      out.ContentType || MIME[ext] || "application/octet-stream";

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[api/media]", error);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
