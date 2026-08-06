"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export type LandingSlide = {
  id: string;
  src: string;
  title: string;
};

const FALLBACK: LandingSlide[] = [
  {
    id: "fallback",
    src: "/System/Tourism_Images/all-hadar_02.png",
    title: "الحضر الأثرية",
  },
];

const DESTINATIONS = [
  { href: "/passenger/trips", label: "رحلات", tone: "bg-plum" },
  { href: "/passenger/tourism-programs", label: "برامج", tone: "bg-orchid" },
  { href: "/passenger/hotels", label: "فنادق", tone: "bg-plum-light" },
  { href: "/passenger/restaurants", label: "مطاعم", tone: "bg-fuchsia-brand" },
  { href: "/passenger/farms", label: "مزارع", tone: "bg-orchid-dark" },
  { href: "/passenger/garages", label: "شركات", tone: "bg-dusk-muted" },
] as const;

type Props = {
  slides?: LandingSlide[];
};

export default function LandingHero({ slides }: Props) {
  const list = slides && slides.length > 0 ? slides : FALLBACK;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [list.length]);

  useEffect(() => {
    if (list.length <= 1) return;
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % list.length);
    }, 5000);
    return () => clearInterval(t);
  }, [list.length]);

  const current = list[index] ?? list[0];

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-plum-dark text-white">
      <div className="absolute inset-0">
          <Image
          key={current.id}
          src={current.src}
          alt={current.title}
          fill
          priority
          unoptimized={
            current.src.startsWith("/api/media/") ||
            current.src.includes("amazonaws.com")
          }
          className="object-cover landing-kenburns motion-reduce:animate-none"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-plum-dark via-plum-dark/70 to-plum-dark/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(168,85,247,0.35),transparent_45%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6 sm:pb-14">
        <div className="max-w-2xl space-y-5 text-start">
          <p className="landing-reveal font-display text-3xl text-orchid-light sm:text-4xl md:text-5xl">
            آشور للسياحة والسفر
          </p>
          <h1 className="landing-reveal landing-reveal-delay-1 text-2xl font-bold leading-snug sm:text-3xl md:text-4xl">
            رحلتك العراقية من مقعد واحد إلى باقة كاملة
          </h1>
          <p className="landing-reveal landing-reveal-delay-2 max-w-xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
            احجز رحلات وبرامج سياحية، واكتشف فنادق ومطاعم ومزارع وشركاء معتمدين —
            في منصة واحدة للسفر داخل العراق.
          </p>
          <div className="landing-reveal landing-reveal-delay-3 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-xl border-0 bg-orchid px-8 text-white hover:bg-orchid-light"
            >
              <Link href="/auth/register">ابدأ الحجز</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-xl border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/tourism-places">استكشف المعالم</Link>
            </Button>
          </div>
        </div>

        {/* توقيع الصفحة: شريط تذكرة السفر */}
        <div className="landing-reveal landing-reveal-delay-4 landing-pass-glow motion-reduce:animate-none relative mt-10 overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
          <div className="pointer-events-none absolute inset-y-0 start-1/3 w-0 border-e border-dashed border-white/35" />
          <span className="pointer-events-none absolute -top-2 start-[calc(33.333%-0.5rem)] size-4 rounded-full bg-plum-dark" />
          <span className="pointer-events-none absolute -bottom-2 start-[calc(33.333%-0.5rem)] size-4 rounded-full bg-plum-dark" />

          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0 text-start">
              <p className="font-data text-[11px] uppercase tracking-[0.2em] text-orchid-light">
                Boarding Pass
              </p>
              <p className="mt-1 truncate text-sm font-semibold">
                اختر وجهتك — {current.title}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {DESTINATIONS.map((d) => (
                <Link
                  key={d.href}
                  href={d.href}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:hover:translate-y-0 ${d.tone}`}
                >
                  {d.label}
                </Link>
              ))}
            </div>
          </div>

          {list.length > 1 && (
            <div className="flex justify-center gap-1.5 border-t border-white/15 px-4 py-3">
              {list.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={item.title}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-orchid-light" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
