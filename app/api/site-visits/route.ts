import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GLOBAL_ID = "global";

async function getVisitCount(): Promise<number> {
  const rows = await prisma.$queryRaw<Array<{ visitCount: number }>>`
    SELECT "visitCount" FROM "SiteStats" WHERE id = ${GLOBAL_ID}
  `;
  return rows[0]?.visitCount ?? 0;
}

export async function GET() {
  try {
    const count = await getVisitCount();
    return NextResponse.json({ count });
  } catch (e) {
    console.error("site-visits GET", e);
    return NextResponse.json({ error: "تعذر قراءة العداد" }, { status: 500 });
  }
}

export async function POST() {
  try {
    await prisma.$executeRaw`
      INSERT INTO "SiteStats" (id, "visitCount", "updatedAt")
      VALUES (${GLOBAL_ID}, 1, NOW())
      ON CONFLICT (id) DO UPDATE
      SET "visitCount" = "SiteStats"."visitCount" + 1,
          "updatedAt" = NOW()
    `;
    const count = await getVisitCount();
    return NextResponse.json({ count });
  } catch (e) {
    console.error("site-visits POST", e);
    return NextResponse.json({ error: "تعذر تحديث العداد" }, { status: 500 });
  }
}
