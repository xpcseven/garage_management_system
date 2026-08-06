import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * إعدادات AWS بنفس أسلوب clinic_management_system
 * المتغيرات: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET
 */
export function getS3Bucket(): string {
  return (
    process.env.AWS_S3_BUCKET?.trim() ||
    process.env.AWS_BUCKET_NAME?.trim() ||
    ""
  );
}

export function getS3Region(): string {
  return process.env.AWS_REGION?.trim() || "";
}

export function isS3Configured(): boolean {
  return Boolean(
    getS3Bucket() &&
      getS3Region() &&
      process.env.AWS_ACCESS_KEY_ID?.trim() &&
      process.env.AWS_SECRET_ACCESS_KEY?.trim()
  );
}

export function createS3Client(): S3Client {
  return new S3Client({
    region: getS3Region(),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!.trim(),
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!.trim(),
    },
  });
}

export function publicS3Url(s3Key: string): string {
  const bucket = getS3Bucket();
  const region = getS3Region();
  return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
}

/** رفع بايتات إلى S3 — نفس PutObject في مشروع العيادة */
export async function putObjectToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  const bucket = getS3Bucket();
  if (!bucket || !isS3Configured()) {
    throw new Error("AWS S3 غير مضبوط (AWS_S3_BUCKET / المفاتيح / المنطقة)");
  }

  const s3 = createS3Client();
  // بدون ACL — كثير من الـ buckets الحديثة تمنع ACL؛ القراءة عبر /api/media
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    })
  );

  // مسار وسيط عام للتطبيق (يتجنب 403 عند Block Public Access)
  return `/api/media/${params.key}`;
}

/** استخراج مفتاح S3 من رابط مباشر أو /api/media/... أو /uploads/... */
export function extractS3Key(imageUrl: string): string | null {
  const u = imageUrl.trim();
  if (!u) return null;

  if (u.startsWith("/api/media/")) {
    return decodeURIComponent(u.replace(/^\/api\/media\//, ""));
  }

  if (u.startsWith("/uploads/")) {
    return u.replace(/^\//, "");
  }

  try {
    const parsed = new URL(u);
    let path = parsed.pathname.replace(/^\//, "");
    const bucket = getS3Bucket();
    if (bucket && path.startsWith(`${bucket}/`)) {
      path = path.slice(bucket.length + 1);
    }
    return path || null;
  } catch {
    if (u.includes("/") && !u.includes(" ")) return u.replace(/^\//, "");
    return null;
  }
}
