"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "أنشئ حسابك",
    body: "سجّل كمسافر، أو كمالك شركة سياحية، أو كصاحب فندق أو مطعم أو مزرعة. كل دور يرى أدواته وصلاحياته فقط.",
    tone: "from-plum to-orchid",
  },
  {
    title: "ابنِ الاتفاق إن لزم",
    body: "الشركة ترسل دعوة شراكة برسالة واضحة. الشريك يقبل أو يرفض. بدون قبول: لا دليل ولا باقة ولا مراسلة.",
    tone: "from-orchid to-plum-light",
  },
  {
    title: "احجز وتابع",
    body: "المسافر يحجز مقعداً أو باقة أو إقامة. الإشعارات تصل للأطراف المعنية، والحجوزات تتجمع في لوحة واحدة.",
    tone: "from-fuchsia-brand to-orchid",
  },
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
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

export default function LandingJourney() {
  const { ref, visible } = useInView<HTMLElement>();

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid">
          مسار الاستخدام
        </p>
        <h2 className="mt-3 font-display text-3xl text-plum sm:text-4xl">
          من التسجيل إلى التأكيد
        </h2>
        <p className="mt-4 text-sm leading-8 text-dusk/65 sm:text-base">
          ثلاث خطوات عملية تعكس تشغيل المنصة كما هي — بدون زخرفة فارغة.
        </p>
      </div>

      <ol className="relative mt-14 grid gap-5 md:grid-cols-3">
        <div
          aria-hidden
          className="pointer-events-none absolute start-[16%] end-[16%] top-10 hidden h-0.5 bg-gradient-to-l from-plum/20 via-orchid/40 to-fuchsia-brand/20 md:block"
        />
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className={cn(
              "relative flex flex-col rounded-3xl bg-white p-6 text-center ring-1 ring-plum/10 shadow-sm",
              "transition duration-500 hover:-translate-y-1.5 hover:shadow-orchid",
              "motion-reduce:hover:translate-y-0",
              visible
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0",
              "motion-reduce:translate-y-0 motion-reduce:opacity-100"
            )}
            style={{ transitionDelay: visible ? `${i * 120}ms` : "0ms" }}
          >
            <span
              className={cn(
                "landing-float motion-reduce:animate-none mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br font-data text-lg font-bold text-white shadow-orchid",
                step.tone
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-5 text-lg font-bold text-dusk">{step.title}</h3>
            <p className="mt-3 text-sm leading-7 text-dusk/60">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
