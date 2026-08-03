"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FALLBACK_IMG = "/System/Tourism_Images/all-hadar_01.png";

function placeCaption(p: TourismPlaceRow) {
  if (p.governorate) return p.governorate;
  if (!p.cityName) return "العراق";
  return p.cityRegion ? `${p.cityName} — ${p.cityRegion}` : p.cityName;
}

function shortBlurb(raw: string | null | undefined, max = 110) {
  if (!raw) return null;
  const arabicOnly = raw
    .replace(/[A-Za-z][A-Za-z0-9\s.,'"’“”\-—():;/\\&%]*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const text = arabicOnly || raw.trim();
  if (!text) return null;
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

type Props = {
  places: TourismPlaceRow[];
};

export default function PublicTourismPlacesCatalog({ places }: Props) {
  const regions = useMemo(() => {
    const set = new Set<string>();
    for (const p of places) {
      set.add(placeCaption(p));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
  }, [places]);

  const [region, setRegion] = useState<string>("الكل");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return places.filter((p) => {
      const cap = placeCaption(p);
      if (region !== "الكل" && cap !== region) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        cap.toLowerCase().includes(q)
      );
    });
  }, [places, region, query]);

  const [featured, ...rest] = filtered;

  return (
    <div className="relative">
      {/* هيرو الصفحة */}
      <section className="relative overflow-hidden bg-plum-dark pt-24 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-64 w-64 rounded-full bg-orchid/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-16 bottom-0 h-48 w-48 rounded-full bg-fuchsia-brand/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          <div className="max-w-xl text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              دليل المعالم
            </p>
            <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
              أماكن العراق
              <span className="mt-2 block text-orchid-light">للزيارة والاستكشاف</span>
            </h1>
            <p className="mt-4 text-sm leading-8 text-white/70 sm:text-base">
              تصفّح الوجهات المعتمدة، ثم أكمل رحلتك عبر شركة سياحية أو باقة
              إقامة وضيافة على منصة آشور.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light">
                <Link href="/passenger/trips">احجز رحلة</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="/">العودة للرئيسية</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block min-w-0 flex-1">
              <span className="sr-only">بحث</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث باسم المعلم أو المحافظة…"
                className="h-11 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 outline-none ring-orchid/40 transition focus:bg-white/15 focus:ring-2"
              />
            </label>
            <p className="font-data text-xs text-white/50 sm:whitespace-nowrap">
              {filtered.length} معلم
            </p>
          </div>

          {regions.length > 0 && (
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              <FilterChip
                active={region === "الكل"}
                onClick={() => setRegion("الكل")}
                label="الكل"
              />
              {regions.map((r) => (
                <FilterChip
                  key={r}
                  active={region === r}
                  onClick={() => setRegion(r)}
                  label={r}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* المحتوى */}
      <section className="bg-mist py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-plum/10">
              <p className="font-display text-2xl text-plum">لا نتائج مطابقة</p>
              <p className="mt-2 text-sm text-dusk/60">
                جرّب توسيع نطاق البحث أو اختيار محافظة أخرى.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-6 rounded-xl"
                onClick={() => {
                  setQuery("");
                  setRegion("الكل");
                }}
              >
                مسح التصفية
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {featured && (
                <Link
                  href={`/tourism-places/${featured.id}`}
                  className="group grid overflow-hidden rounded-[2rem] bg-white ring-1 ring-plum/10 transition hover:shadow-plum motion-reduce:transition-none lg:grid-cols-2"
                >
                  <div className="relative min-h-[16rem] sm:min-h-[20rem]">
                    <Image
                      src={featured.imageUrl || FALLBACK_IMG}
                      alt={featured.name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  </div>
                  <div className="flex flex-col justify-center px-6 py-8 text-start sm:px-10">
                    <p className="font-data text-xs tracking-[0.16em] text-orchid">
                      {placeCaption(featured)}
                    </p>
                    <h2 className="mt-2 font-display text-3xl text-dusk sm:text-4xl">
                      {featured.name}
                    </h2>
                    {shortBlurb(featured.description) && (
                      <p className="mt-4 text-sm leading-8 text-dusk/65">
                        {shortBlurb(featured.description, 160)}
                      </p>
                    )}
                    <span className="mt-6 inline-flex text-sm font-semibold text-plum">
                      اعرض التفاصيل ←
                    </span>
                  </div>
                </Link>
              )}

              {rest.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p, i) => (
                    <Link
                      key={p.id}
                      href={`/tourism-places/${p.id}`}
                      className={cn(
                        "group relative isolate aspect-[4/3] overflow-hidden rounded-3xl",
                        "ring-1 ring-plum/10 transition duration-500",
                        "hover:-translate-y-1 hover:shadow-orchid",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum",
                        "motion-reduce:hover:translate-y-0",
                        "places-reveal"
                      )}
                      style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                    >
                      <Image
                        src={p.imageUrl || FALLBACK_IMG}
                        alt={p.name}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dusk/90 via-dusk/25 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-start text-white">
                        <p className="font-data text-[10px] tracking-[0.16em] text-orchid-light/90">
                          {placeCaption(p)}
                        </p>
                        <h3 className="mt-1 text-lg font-bold leading-snug">
                          {p.name}
                        </h3>
                        {shortBlurb(p.description, 70) && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/70">
                            {shortBlurb(p.description, 70)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orchid-light",
        active
          ? "bg-orchid text-white shadow-orchid"
          : "bg-white/10 text-white/80 hover:bg-white/20"
      )}
    >
      {label}
    </button>
  );
}
