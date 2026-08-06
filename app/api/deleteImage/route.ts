import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createS3Client,
  getS3Bucket,
  isS3Configured,
} from "@/lib/aws-s3";
import { extractS3Key } from "@/lib/aws-s3";

export const runtime = "nodejs";

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    let key = typeof body?.key === "string" ? body.key.trim() : "";

    if (!key && typeof body?.url === "string") {
      key = extractS3Key(body.url) || "";
    }

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    if (!isS3Configured()) {
      return NextResponse.json(
        { error: "AWS S3 غير مضبوط" },
        { status: 500 }
      );
    }

    const s3 = createS3Client();
    await s3.send(
      new DeleteObjectCommand({
        Bucket: getS3Bucket(),
        Key: key,
      })
    );

    return NextResponse.json({ message: "Deleted successfully", key });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
