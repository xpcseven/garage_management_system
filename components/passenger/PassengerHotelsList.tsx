"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PassengerHotelCard = {
  id: string;
  name: string;
  address: string | null;
  location: string | null;
  phone: string | null;
  description: string | null;
  imageUrl: string | null;
  city: { name: string } | null;
  roomsCount: number;
};

function cityLabel(h: PassengerHotelCard) {
  return h.city?.name?.trim() || "العراق";
}

function shortText(raw: string | null | undefined, max = 100) {
  if (!raw?.trim()) return null;
  const text = raw.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export default function PassengerHotelsList({
  hotels,
}: {
  hotels: PassengerHotelCard[];
}) {
  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const h of hotels) set.add(cityLabel(h));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
  }, [hotels]);

  const [city, setCity] = useState("الكل");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hotels.filter((h) => {
      const cap = cityLabel(h);
      if (city !== "الكل" && cap !== city) return false;
      if (!q) return true;
      const hay = [h.name, h.description, h.address, h.phone, cap]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [hotels, city, query]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-6 py-8 text-white sm:px-8 sm:py-10 dark:bg-card dark:ring-1 dark:ring-orchid/25">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-48 w-48 rounded-full bg-orchid/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 bottom-0 h-40 w-40 rounded-full bg-fuchsia-brand/20 blur-3xl dark:bg-orchid/15"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              إقامة
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              الفنادق
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
              اختر فندقاً معتمداً لعرض الغرف المتاحة وحجز إقامتك.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
            >
              <Link href="/passenger/trips">ابحث عن رحلة</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-orchid/30 dark:bg-transparent dark:text-foreground dark:hover:bg-orchid/15 dark:hover:text-foreground"
            >
              <Link href="/home">الرئيسية</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">بحث عن فندق</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم الفندق أو المدينة أو العنوان…"
              className="h-11 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 outline-none ring-orchid/40 transition focus:bg-white/15 focus:ring-2 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:bg-background"
            />
          </label>
          <p className="font-data text-xs text-white/50 sm:whitespace-nowrap dark:text-muted-foreground">
            {filtered.length} فندق
          </p>
        </div>

        {cities.length > 0 && (
          <div className="relative mt-5 flex gap-2 overflow-x-auto pb-1">
            <FilterChip
              active={city === "الكل"}
              onClick={() => setCity("الكل")}
              label="الكل"
            />
            {cities.map((c) => (
              <FilterChip
                key={c}
                active={city === c}
                onClick={() => setCity(c)}
                label={c}
              />
            ))}
          </div>
        )}
      </header>

      <section className="space-y-4">
        <div className="text-start">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
            المعتمدة
          </p>
          <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
            فنادق متاحة
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
            <p className="font-display text-2xl text-plum dark:text-orchid-light">
              {hotels.length === 0
                ? "لا فنادق معتمدة حالياً"
                : "لا نتائج مطابقة"}
            </p>
            <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
              {hotels.length === 0
                ? "يمكنك البحث عن رحلة أو تصفّح المطاعم والمزارع في الأثناء."
                : "جرّب كلمة أخرى أو اختر مدينة مختلفة."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {(query || city !== "الكل") && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl dark:border-orchid/30"
                  onClick={() => {
                    setQuery("");
                    setCity("الكل");
                  }}
                >
                  مسح التصفية
                </Button>
              )}
              <Button
                asChild
                className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
              >
                <Link href="/passenger/restaurants">تصفّح المطاعم</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((h) => (
              <Link
                key={h.id}
                href={`/passenger/hotels/${h.id}`}
                className={cn(
                  "group flex h-full flex-col rounded-3xl bg-white p-5 text-start ring-1 ring-plum/10",
                  "transition hover:-translate-y-0.5 hover:shadow-orchid",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum",
                  "dark:bg-card dark:ring-orchid/20 dark:hover:ring-orchid/40",
                  "motion-reduce:hover:translate-y-0"
                )}
              >
                <p className="font-data text-[10px] tracking-[0.16em] text-orchid dark:text-orchid-light">
                  {cityLabel(h)}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-dusk dark:text-foreground">
                  {h.name}
                </h3>
                {(h.address || shortText(h.description, 90)) && (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-dusk/60 dark:text-muted-foreground">
                    {shortText(h.description, 90) || h.address}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  <span className="rounded-full bg-plum-soft px-2.5 py-1 font-data text-[11px] text-plum dark:bg-orchid/20 dark:text-orchid-light">
                    {h.roomsCount} غرفة
                  </span>
                  <span className="text-sm font-semibold text-plum transition group-hover:-translate-x-0.5 dark:text-orchid-light">
                    عرض الغرف ←
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
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
          : "bg-white/10 text-white/80 hover:bg-white/20 dark:bg-background/60 dark:text-muted-foreground dark:hover:bg-orchid/15 dark:hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
