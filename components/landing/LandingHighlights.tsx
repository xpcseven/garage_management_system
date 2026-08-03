"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = [
  {
    title: "خريطة المقاعد",
    body: "اختر مقعداً أو أكثر على مخطط المركبة، مع تحديث فوري للتوفر أثناء الحجز.",
    icon: "💺",
  },
  {
    title: "باقات مع شركاء",
    body: "البرنامج يضم شركاء مقبولين فقط. عند الحجز تُنشأ طلبات فرعية لدى الفندق أو المطعم أو المزرعة.",
    icon: "🗺️",
  },
  {
    title: "دليل الشركاء",
    body: "بعد قبول الدعوة يظهر الفندق والمطعم والمزرعة في دليل الشركة للمسافر — مع إمكانية إخفائهم دون إنهاء الشراكة.",
    icon: "📒",
  },
  {
    title: "مراسلة الشراكة",
    body: "محادثة نصية داخل الشراكات المقبولة فقط لتنسيق التواريخ والسعة قبل الموسم.",
    icon: "💬",
  },
  {
    title: "إشعارات لحظية",
    body: "دعوات، ردود، رسائل، وضمّ للباقة — تصل كإشعار داخل النظام لصاحب الحساب المعني.",
    icon: "🔔",
  },
  {
    title: "حجوزات موحّدة",
    body: "رحلات وبرامج وفنادق ومطاعم ومزارع في قائمة واحدة للمسافر لمتابعة الحالة بوضوح.",
    icon: "📋",
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
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

export default function LandingHighlights() {
  const { ref, visible } = useInView<HTMLElement>();

  return (
    <section
      ref={ref}
      className="border-y border-plum/10 bg-gradient-to-b from-mist via-white to-mist/60 py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid">
            قدرات التشغيل
          </p>
          <h2 className="mt-3 font-display text-3xl text-plum sm:text-4xl">
            ما الذي يجعل التجربة مختلفة؟
          </h2>
          <p className="mt-4 text-sm leading-8 text-dusk/65 sm:text-base">
            ليست قوائم منفصلة. المنصة تربط الاتفاق بين الشركة والشركاء قبل أن
            يصل العرض إلى المسافر — فالحجوزات تبقى منظمة وقابلة للمتابعة.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map((h, i) => (
            <article
              key={h.title}
              className={cn(
                "rounded-3xl bg-white p-6 ring-1 ring-plum/10 shadow-sm",
                "transition duration-500 hover:-translate-y-1 hover:shadow-plum hover:ring-orchid/25",
                "motion-reduce:hover:translate-y-0",
                visible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-5 opacity-0",
                "motion-reduce:translate-y-0 motion-reduce:opacity-100"
              )}
              style={{ transitionDelay: visible ? `${i * 70}ms` : "0ms" }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-plum/10 to-orchid/15 text-2xl">
                {h.icon}
              </div>
              <h3 className="mt-4 text-lg font-bold text-dusk">{h.title}</h3>
              <p className="mt-2 text-sm leading-7 text-dusk/60">{h.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
