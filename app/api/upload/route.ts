import { auth } from "@/auth";
import { storeImageFile } from "@/lib/image-storage";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "لم يتم إرسال ملف" }, { status: 400 });
    }

    const result = await storeImageFile(file);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ path: result.path });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "فشل رفع الصورة";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
