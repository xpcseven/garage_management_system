import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

/** نفس أسلوب clinic_management_system */
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    // اختياري — مثل clinicId/folder في مشروع العيادة
    const folder =
      (formData.get("folder") as string | null)?.trim() || "uploads";
    const prefix =
      (formData.get("prefix") as string | null)?.trim() ||
      (formData.get("clinicId") as string | null)?.trim() ||
      "tourism";

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    const bucket = process.env.AWS_S3_BUCKET?.trim();
    const region = process.env.AWS_REGION?.trim();
    if (!bucket || !region) {
      return NextResponse.json(
        { error: "AWS_S3_BUCKET / AWS_REGION غير مضبوطين" },
        { status: 500 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}.${fileExtension}`;
    const s3Key = `${prefix}/${folder}/${fileName}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: file.type || "application/octet-stream",
    });

    await s3.send(uploadCommand);

    const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
    // وسيط محلي يعمل بدون جعل الـ bucket عاماً
    const proxyUrl = `/api/media/${s3Key}`;

    // url/path للواجهة — proxy حتى لا يظهر 403 من next/image
    return NextResponse.json({
      url: proxyUrl,
      path: proxyUrl,
      s3Url,
      key: s3Key,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const code =
      typeof error === "object" &&
      error !== null &&
      "Code" in error &&
      typeof (error as { Code?: string }).Code === "string"
        ? (error as { Code: string }).Code
        : "";
    const message =
      error instanceof Error ? error.message : "Upload failed";

    if (code === "AccessDenied" || message.includes("AccessDenied")) {
      return NextResponse.json(
        {
          error:
            "رفض AWS: المستخدم tourism-management لا يملك صلاحية s3:PutObject على الـ bucket. أضف سياسة IAM تسمح بـ PutObject/GetObject/DeleteObject على tourism-management-image/*",
          code: "AccessDenied",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: message || "Upload failed" },
      { status: 500 }
    );
  }
}
