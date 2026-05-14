"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type SlideItem = {
  src: string;
  title: string;
};

const fallbackTourismCards: SlideItem[] = [
  { src: "/System/Tourism_Images/all-hadar_01.png", title: "مدينة الحضر الاثرية" },

];

type Props = {
  slides?: SlideItem[];
  allowFallback?: boolean;
};

export default function Tourism_Img_Component({
  slides = [],
  allowFallback = true,
}: Props) {
  const tourismCards =
    slides.length > 0 ? slides : allowFallback ? fallbackTourismCards : [];
  const [index, setIndex] = useState(0);
  const total = tourismCards.length;

  if (total === 0) {
    return (
      <section className="space-y-5 p-4">
        <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 sm:h-80 lg:h-[28rem]">
          لا توجد صور نشطة في السلايدر حالياً.
        </div>
      </section>
    );
  }

  const nextSlide = () => setIndex((prev) => (prev + 1) % total);
  const prevSlide = () => setIndex((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    setIndex(0);
  }, [total]);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 3500);
    return () => clearInterval(t);
  }, [total]);

  return (
    <section className="space-y-5 p-4">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200">
        <article className="group relative h-72 sm:h-80 lg:h-[28rem]">
          <Image
            src={tourismCards[index].src}
            alt={tourismCards[index].title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute bottom-0 z-10 w-full p-4 text-white sm:p-6">
            <h3 className="text-lg font-semibold sm:text-2xl">
              {tourismCards[index].title}
            </h3>
          </div>
        </article>

        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-white hover:bg-black/65"
          aria-label="الصورة السابقة"
        >
          ❮
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-white hover:bg-black/65"
          aria-label="الصورة التالية"
        >
          ❯
        </button>
      </div>

      <div className="flex justify-center gap-2">
        {tourismCards.map((item, i) => (
          <button
            key={`${item.src}-${i}`}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`الانتقال إلى ${item.title}`}
            className={`h-2.5 w-2.5 rounded-full transition ${
              i === index ? "bg-purple-600" : "bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-700">معالم سياحية من العراق</h2>
        <p className="mt-1 text-xl text-muted-foreground text-purple-400">
          مجموعة صور تعبّر عن أبرز الوجهات السياحية والأثرية.
        </p>
      </div>
    </section>
  );
}