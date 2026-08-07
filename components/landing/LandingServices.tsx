"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const PILLARS = [
  {
    href: "/passenger/garages",
    kicker: "شركات",
    title: "شركات سياحية معتمدة",
    body: "اختر شركة موثوقة، اطّلع على رحلاتها وبرامجها وشركائها من فنادق ومطاعم ومزارع، ثم احجز من نفس المسار.",
    cta: "اعرض الشركات",
    icon: "🚌",
    tone: "from-plum to-orchid",
    soft: "bg-plum/5 ring-plum/15",
    accent: "text-plum",
  },
  {
    href: "/passenger/trips",
    kicker: "نقل",
    title: "رحلات بمقاعد واضحة",
    body: "خريطة مقاعد حيّة، حجز لعدة أفراد، وإضافة أمتعة اختيارية — دون تخمين أو تواصل خارج المنصة.",
    cta: "احجز رحلة",
    icon: "💺",
    tone: "from-orchid to-plum-light",
    soft: "bg-orchid/5 ring-orchid/20",
    accent: "text-orchid-dark",
  },
  {
    href: "/passenger/tourism-programs",
    kicker: "باقات",
    title: "برامج سياحية متكاملة",
    body: "مسار نقل + شركاء مشمولون في الباقة. عند الحجز تُنشأ طلبات لدى الفندق أو المطعم أو المزرعة تلقائياً.",
    cta: "استعرض البرامج",
    icon: "🗺️",
    tone: "from-fuchsia-brand to-orchid",
    soft: "bg-fuchsia-soft/60 ring-fuchsia-brand/15",
    accent: "text-fuchsia-brand",
  },
] as const;

const QUICK = [
  { href: "/passenger/hotels", label: "فنادق", hint: "غرف وإقامات", icon: "🏨" },
  {
    href: "/passenger/restaurants",
    label: "مطاعم",
    hint: "طاولات وضيافة",
    icon: "🍽️",
  },
  { href: "/passenger/farms", label: "مزارع", hint: "استراحات ومناسبات", icon: "🌿" },
  { href: "/tourism-places", label: "معالم", hint: "وجهات للزيارة", icon: "🏛️" },
  {
    href: "/passenger/freelance-trips",
    label: "رحلات حرة",
    hint: "خيارات إضافية",
    icon: "🚐",
  },
  { href: "/bookings", label: "حجوزاتي", hint: "تتطلب تسجيل الدخول", icon: "📋" },
] as const;

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

export default function LandingServices() {
  const { ref, visible } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-y border-plum/10 bg-gradient-to-b from-white via-mist/80 to-white py-20 sm:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -end-20 top-10 h-56 w-56 rounded-full bg-orchid/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid">
            خدمات المنصة
          </p>
          <h2 className="mt-3 font-display text-3xl text-plum sm:text-4xl">
            منصة واحدة لمسار سفرك كاملاً
          </h2>
          <p className="mt-4 text-sm leading-8 text-dusk/65 sm:text-base">
            آشور تجمع النقل والضيافة والشراكات في تجربة عربية واضحة: تختار،
            تحجز، وتتابع — دون تشتيت بين تطبيقات متعددة.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PILLARS.map((item, i) => (
            <article
              key={item.href}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-3xl p-6 ring-1 transition duration-500",
                "hover:-translate-y-1.5 hover:shadow-orchid motion-reduce:hover:translate-y-0",
                item.soft,
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-6 opacity-0",
                "motion-reduce:translate-y-0 motion-reduce:opacity-100"
              )}
              style={{ transitionDelay: visible ? `${i * 100}ms` : "0ms" }}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-md",
                    item.tone
                  )}
                >
                  {item.icon}
                </span>
                <span className="font-data text-xs tracking-[0.18em] text-dusk/35">
                  {String(i + 1).padStart(2, "0")} · {item.kicker}
                </span>
              </div>

              <h3 className={cn("mt-5 text-xl font-bold", item.accent)}>
                {item.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-dusk/65">
                {item.body}
              </p>

              <Link
                href={item.href}
                className={cn(
                  "mt-6 inline-flex items-center gap-1 text-sm font-semibold transition group-hover:gap-2",
                  item.accent
                )}
              >
                {item.cta}
                <span aria-hidden>←</span>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-14">
          <p className="text-center font-data text-[11px] uppercase tracking-[0.2em] text-dusk/40">
            مسارات سريعة
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 ring-1 ring-plum/10",
                  "transition duration-300 hover:-translate-y-0.5 hover:shadow-plum hover:ring-orchid/25",
                  "motion-reduce:hover:translate-y-0",
                  visible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0",
                  "motion-reduce:translate-y-0 motion-reduce:opacity-100"
                )}
                style={{
                  transitionDelay: visible ? `${280 + i * 50}ms` : "0ms",
                }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-plum/10 to-orchid/15 text-lg">
                  {l.icon}
                </span>
                <span className="min-w-0 text-start">
                  <span className="block text-sm font-bold text-dusk group-hover:text-plum">
                    {l.label}
                  </span>
                  <span className="text-xs text-dusk/45">{l.hint}</span>
                </span>
                <span
                  aria-hidden
                  className="ms-auto text-orchid opacity-0 transition group-hover:opacity-100"
                >
                  ←
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
