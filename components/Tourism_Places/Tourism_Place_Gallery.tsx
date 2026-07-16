"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  alt: string;
  className?: string;
};

export default function Tourism_Place_Gallery({ images, alt, className = "" }: Props) {
  const slides = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const total = slides.length;

  useEffect(() => {
    setIndex(0);
  }, [total]);

  if (total === 0) {
    return (
      <div
        className={`min-h-48 w-full bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700 ${className}`}
      />
    );
  }

  if (total === 1) {
    return (
      <div className={`relative w-full overflow-hidden bg-slate-100 ${className}`}>
        <div className="flex justify-center px-3 pt-2 sm:px-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slides[0]}
            alt={alt}
            className="mx-auto block h-auto w-full max-w-5xl rounded-lg sm:rounded-xl"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  const current = slides[index];

  return (
    <div className={`relative w-full overflow-hidden bg-slate-100 ${className}`}>
      <div className="relative mx-auto max-w-5xl px-3 pt-2 sm:px-5">
        <div className="relative h-64 sm:h-80 lg:h-[28rem] overflow-hidden rounded-lg sm:rounded-xl">
          <Image
            src={current}
            alt={`${alt} — ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1200px"
            priority={index === 0}
          />
        </div>

        <button
          type="button"
          onClick={() => setIndex((prev) => (prev - 1 + total) % total)}
          className="absolute left-5 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-white hover:bg-black/65 sm:left-8"
          aria-label="الصورة السابقة"
        >
          ❮
        </button>
        <button
          type="button"
          onClick={() => setIndex((prev) => (prev + 1) % total)}
          className="absolute right-5 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 px-3 py-2 text-white hover:bg-black/65 sm:right-8"
          aria-label="الصورة التالية"
        >
          ❯
        </button>
      </div>

      <div className="mt-3 flex justify-center gap-2 pb-2">
        {slides.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`صورة ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition ${
              i === index ? "bg-purple-600" : "bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-4 gap-2 px-3 pb-3 sm:grid-cols-6 sm:px-5">
        {slides.map((src, i) => (
          <button
            key={`thumb-${src}-${i}`}
            type="button"
            onClick={() => setIndex(i)}
            className={`relative aspect-[4/3] overflow-hidden rounded-md border-2 transition ${
              i === index ? "border-purple-600" : "border-transparent opacity-80 hover:opacity-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
