import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingCta() {
  return (
    <section className="relative overflow-hidden py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(139,92,246,0.18),transparent_50%)]"
      />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl text-plum sm:text-4xl">
          آشور للسياحة والسفر
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-dusk/70 sm:text-base">
          أنت على بعد خطوة من تنظيم رحلتك — احجز مقعداً، باقة، أو إقامة لدى
          شركائنا.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-xl px-8">
            <Link href="/auth/register">إنشاء حساب</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl px-8">
            <Link href="/auth/login">الدخول للنظام</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
