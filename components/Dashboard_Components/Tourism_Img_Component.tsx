"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FALLBACK_TOURISM_IMAGE,
  normalizePublicImageSrc,
} from "@/lib/image-src";

export type TourismSliderCard = {
  id: string;
  src: string;
  title: string;
};

const fallbackCards: TourismSliderCard[] = [
  {
    id: "fallback-hadar",
    src: FALLBACK_TOURISM_IMAGE,
    title: "الحضر الأثرية",
  },
];

type Props = {
  slides?: TourismSliderCard[];
};

function toUsableCards(slides?: TourismSliderCard[]): TourismSliderCard[] {
  if (!slides?.length) return fallbackCards;

  const usable = slides
    .map((s) => {
      const src = normalizePublicImageSrc(s.src);
      if (!src) return null;
      return { id: s.id, src, title: s.title };
    })
    .filter((s): s is TourismSliderCard => s !== null);

  return usable.length > 0 ? usable : fallbackCards;
}

export default function Tourism_Img_Component({ slides }: Props) {
  const tourismCards = useMemo(() => toUsableCards(slides), [slides]);

  const [index, setIndex] = useState(0);
  const total = tourismCards.length;

  const nextSlide = () => setIndex((prev) => (prev + 1) % total);
  const prevSlide = () => setIndex((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    setIndex(0);
  }, [total]);

  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 3500);
    return () => clearInterval(t);
  }, [total]);

  if (total === 0) return null;

  const current = tourismCards[index] ?? tourismCards[0];

  return (
    <section className="space-y-5 p-4">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200">
        <article className="group relative h-72 sm:h-80 lg:h-[28rem]">
          {/* img بدل next/image لتجنب خطأ hostname مع روابط قاعدة البيانات */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.src}
            alt={current.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="absolute bottom-0 z-10 w-full p-4 text-white sm:p-6">
            <h3 className="text-lg font-semibold sm:text-2xl">{current.title}</h3>
          </div>
        </article>

        {total > 1 && (
          <>
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
          </>
        )}
      </div>

      {total > 1 && (
        <div className="flex justify-center gap-2">
          {tourismCards.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`الانتقال إلى ${item.title}`}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === index
                  ? "bg-purple-600"
                  : "bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}

      <div className="text-center">
        <h2 className="text-2xl font-bold text-purple-700">
          معالم سياحية من العراق
        </h2>
        <p className="mt-1 text-xl text-muted-foreground text-purple-400">
          مجموعة صور تعبّر عن أبرز الوجهات السياحية والأثرية.
        </p>
      </div>
    </section>
  );
}
