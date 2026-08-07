"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { loginWithCallback } from "@/routes";

/** يظهر للزائر بدل نموذج الحجز */
export default function LoginToBookPrompt({
  callbackPath,
  title = "الحجز يتطلب تسجيل الدخول",
  description = "تصفّح التفاصيل بحرية، ثم سجّل الدخول لإتمام الحجز.",
}: {
  callbackPath: string;
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-orchid/10 px-5 py-6 text-start ring-1 ring-orchid/25 dark:bg-orchid/15 dark:ring-orchid/30">
      <p className="font-display text-lg text-dusk dark:text-foreground">
        {title}
      </p>
      <p className="mt-2 text-sm leading-7 text-dusk/65 dark:text-muted-foreground">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          asChild
          className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
        >
          <Link href={loginWithCallback(callbackPath)}>تسجيل الدخول للحجز</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-xl border-plum/20 dark:border-orchid/30"
        >
          <Link href="/auth/register">إنشاء حساب</Link>
        </Button>
      </div>
    </div>
  );
}
