"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-plum-dark/70 px-3 py-2 backdrop-blur-md">
          <Image
            src="/System/flags.png"
            alt=""
            width={72}
            height={24}
            className="h-5 w-auto rounded-sm object-cover"
          />
          <Link
            href="/"
            className="font-display text-sm tracking-wide text-white sm:text-base"
          >
            آشور للسياحة والسفر
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            <Link href="/auth/login">تسجيل الدخول</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
          >
            <Link href="/auth/register">إنشاء حساب</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
