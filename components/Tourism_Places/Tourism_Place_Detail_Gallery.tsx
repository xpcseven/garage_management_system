"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
};

function GalleryTile({
  src,
  alt,
  className,
  onClick,
  overlay,
}: {
  src: string;
  alt: string;
  className?: string;
  onClick: () => void;
  overlay?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative h-full w-full overflow-hidden rounded-xl bg-slate-200 text-right",
        "ring-0 transition hover:ring-2 hover:ring-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
      <div className="absolute left-2 top-2 rounded-full bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
        <Expand className="h-4 w-4" />
      </div>
      {overlay}
    </button>
  );
}

export default function Tourism_Place_Detail_Gallery({ images, alt }: Props) {
  const slides = images.filter(Boolean);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openAt = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "ArrowRight") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, goNext, goPrev]);

  if (slides.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 via-slate-100 to-purple-50 sm:h-72">
        <p className="text-sm text-slate-500">لا توجد صور لهذا المكان</p>
      </div>
    );
  }

  const display = slides.slice(0, 5);
  const extra = slides.length - display.length;

  return (
    <>
      <div className="w-full">
        {slides.length === 1 && (
          <div className="h-[min(70vh,420px)]">
            <GalleryTile
              src={slides[0]}
              alt={alt}
              className="h-full rounded-2xl"
              onClick={() => openAt(0)}
            />
          </div>
        )}

        {slides.length === 2 && (
          <div className="grid h-[min(60vh,380px)] grid-cols-1 gap-2 sm:grid-cols-2">
            {display.map((src, i) => (
              <GalleryTile
                key={src}
                src={src}
                alt={`${alt} ${i + 1}`}
                onClick={() => openAt(i)}
              />
            ))}
          </div>
        )}

        {slides.length === 3 && (
          <div className="grid grid-cols-1 gap-2 sm:h-[min(65vh,400px)] sm:grid-cols-3">
            <GalleryTile
              src={display[0]}
              alt={alt}
              className="h-52 sm:col-span-2 sm:h-full sm:row-span-2"
              onClick={() => openAt(0)}
            />
            <GalleryTile
              src={display[1]}
              alt={alt}
              className="h-40 sm:h-full"
              onClick={() => openAt(1)}
            />
            <GalleryTile
              src={display[2]}
              alt={alt}
              className="h-40 sm:h-full"
              onClick={() => openAt(2)}
            />
          </div>
        )}

        {slides.length >= 4 && (
          <div className="grid h-[280px] grid-cols-4 grid-rows-2 gap-2 sm:h-[min(70vh,440px)]">
            <GalleryTile
              src={display[0]}
              alt={alt}
              className="col-span-2 row-span-2 rounded-2xl"
              onClick={() => openAt(0)}
            />
            <GalleryTile
              src={display[1]}
              alt={alt}
              className="col-span-1 row-span-1"
              onClick={() => openAt(1)}
            />
            <GalleryTile
              src={display[2]}
              alt={alt}
              className="col-span-1 row-span-1"
              onClick={() => openAt(2)}
            />
            <GalleryTile
              src={display[3]}
              alt={alt}
              className="col-span-1 row-span-1"
              onClick={() => openAt(3)}
            />
            {display[4] ? (
              <GalleryTile
                src={display[4]}
                alt={alt}
                className="col-span-1 row-span-1"
                onClick={() => openAt(4)}
                overlay={
                  extra > 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                      +{extra}
                    </div>
                  ) : undefined
                }
              />
            ) : (
              <div className="col-span-1 row-span-1 rounded-xl bg-slate-100" />
            )}
          </div>
        )}

        {slides.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {slides.map((src, i) => (
              <button
                key={`strip-${src}-${i}`}
                type="button"
                onClick={() => openAt(i)}
                className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg ring-1 ring-slate-200 transition hover:ring-purple-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-h-[96vh] max-w-[96vw] border-0 bg-black/95 p-0 shadow-2xl sm:rounded-xl [&>button]:text-white [&>button]:opacity-90">
          <DialogTitle className="sr-only">
            معرض صور {alt} — {lightboxIndex + 1} من {slides.length}
          </DialogTitle>

          <p className="absolute left-4 top-4 z-50 rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur">
            {lightboxIndex + 1} / {slides.length}
          </p>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute right-3 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20"
                aria-label="الصورة السابقة"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute left-3 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur hover:bg-white/20"
                aria-label="الصورة التالية"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="flex min-h-[70vh] items-center justify-center p-4 pt-14 sm:min-h-[80vh]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slides[lightboxIndex]}
              alt={`${alt} — ${lightboxIndex + 1}`}
              className="max-h-[78vh] max-w-full object-contain"
            />
          </div>

          {slides.length > 1 && (
            <div className="flex justify-center gap-2 border-t border-white/10 px-4 py-3">
              {slides.map((src, i) => (
                <button
                  key={`lb-thumb-${src}-${i}`}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className={cn(
                    "h-14 w-20 overflow-hidden rounded-md border-2 transition",
                    i === lightboxIndex
                      ? "border-purple-400 opacity-100"
                      : "border-transparent opacity-50 hover:opacity-90"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
