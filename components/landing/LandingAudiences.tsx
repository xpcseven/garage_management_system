"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const AUDIENCES = [
  {
    title: "المسافر",
    subtitle: "احجز وتابع بسهولة",
    body: "رحلات بمقاعد واضحة، برامج سياحية، فنادق ومطاعم ومزارع وشركات معتمدة — وكل حجوزاتك في قائمة واحدة بحالة مفهومة.",
    points: ["خريطة مقاعد", "باقات متكاملة", "متابعة موحّدة"],
    href: "/auth/register",
    cta: "سجّل كمسافر",
    tone: "from-plum to-orchid",
    soft: "bg-plum/5 ring-plum/15",
    accent: "text-plum",
  },
  {
    title: "الشركة السياحية",
    subtitle: "شغّل أسطولك وشركاءك",
    body: "أدِر المركبات والسائقين والرحلات والبرامج، وأرسل دعوات شراكة للفنادق والمطاعم والمزارع، ثم نسّق عبر المراسلة بعد القبول.",
    points: ["رحلات وبرامج", "دعوات شراكة", "حجز من اللوحة"],
    href: "/auth/register",
    cta: "أنشئ حساب شركة",
    tone: "from-orchid to-fuchsia-brand",
    soft: "bg-orchid/5 ring-orchid/20",
    accent: "text-orchid-dark",
  },
  {
    title: "شركاء الضيافة",
    subtitle: "فندق · مطعم · مزرعة",
    body: "استقبل دعوات الشراكة، اقبل أو ارفض برسالة، واستقبل حجوزات مباشرة أو طلبات ضمن باقات الشركات المرتبطة بك.",
    points: ["دعوات واردة", "حجوزات PENDING", "ظهور في الدليل"],
    href: "/auth/register",
    cta: "انضم كشريك",
    tone: "from-fuchsia-brand to-plum-light",
    soft: "bg-fuchsia-soft/60 ring-fuchsia-brand/15",
    accent: "text-fuchsia-brand",
  },
] as const;

function useInView<T extends HTMLElement>(margin = "0px 0px -10% 0px") {
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
      { rootMargin: margin, threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [margin]);

  return { ref, visible };
}

export default function LandingAudiences() {
  const { ref, visible } = useInView<HTMLElement>();

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid">
          لمن المنصة؟
        </p>
        <h2 className="mt-3 font-display text-3xl text-plum sm:text-4xl">
          ثلاثة أدوار… منظومة واحدة
        </h2>
        <p className="mt-4 text-sm leading-8 text-dusk/65 sm:text-base">
          مسافر يحجز، شركة تشغّل، وشريك ضيافة يستقبل — كلٌّ بأدواته دون أن يطغى
          دور على آخر.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {AUDIENCES.map((a, i) => (
          <article
            key={a.title}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-3xl p-6 ring-1 transition duration-500",
              "hover:-translate-y-1.5 hover:shadow-orchid motion-reduce:hover:translate-y-0",
              a.soft,
              visible
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0",
              "motion-reduce:translate-y-0 motion-reduce:opacity-100"
            )}
            style={{ transitionDelay: visible ? `${i * 100}ms` : "0ms" }}
          >
            <div
              className={cn(
                "mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white shadow-md",
                a.tone
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <h3 className={cn("text-xl font-bold", a.accent)}>{a.title}</h3>
            <p className="mt-1 text-xs font-medium text-dusk/45">{a.subtitle}</p>
            <p className="mt-4 flex-1 text-sm leading-7 text-dusk/70">{a.body}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {a.points.map((p) => (
                <li
                  key={p}
                  className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-dusk/60 ring-1 ring-plum/10"
                >
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href={a.href}
              className={cn(
                "mt-6 inline-flex items-center gap-1 text-sm font-semibold transition group-hover:gap-2",
                a.accent
              )}
            >
              {a.cta}
              <span aria-hidden>←</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
