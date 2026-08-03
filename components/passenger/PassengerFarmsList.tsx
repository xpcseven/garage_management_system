"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LocationMapIcon } from "@/components/Shared/LocationMapIcon";
import { cn } from "@/lib/utils";

export type PassengerFarmCard = {
  id: string;
  name: string;
  address: string | null;
  location: string | null;
  phone: string | null;
  description: string | null;
  imageUrl?: string | null;
  images?: string[];
  capacity: number;
  amenities: string | null;
  city: { name: string } | null;
};

function cityLabel(f: PassengerFarmCard) {
  return f.city?.name?.trim() || "العراق";
}

function shortText(raw: string | null | undefined, max = 100) {
  if (!raw?.trim()) return null;
  const text = raw.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

function amenityChips(amenities: string | null) {
  if (!amenities?.trim()) return [];
  return amenities
    .split(/[,،|/]/)
    .map((a) => a.trim())
    .filter(Boolean)
    .slice(0, 4);
}

export default function PassengerFarmsList({
  farms,
}: {
  farms: PassengerFarmCard[];
}) {
  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const f of farms) set.add(cityLabel(f));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
  }, [farms]);

  const [city, setCity] = useState("الكل");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return farms.filter((f) => {
      const cap = cityLabel(f);
      if (city !== "الكل" && cap !== city) return false;
      if (!q) return true;
      const hay = [f.name, f.description, f.address, f.phone, f.amenities, cap]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [farms, city, query]);

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
              استراحات
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              المزارع
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
              اختر مزرعة معتمدة واحجز فترة الزيارة حسب المناسبة وعدد الضيوف.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
            >
              <Link href="/passenger/restaurants">المطاعم</Link>
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
            <span className="sr-only">بحث عن مزرعة</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم المزرعة أو المدينة أو المرافق…"
              className="h-11 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 outline-none ring-orchid/40 transition focus:bg-white/15 focus:ring-2 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:bg-background"
            />
          </label>
          <p className="font-data text-xs text-white/50 sm:whitespace-nowrap dark:text-muted-foreground">
            {filtered.length} مزرعة
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
            مزارع متاحة
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
            <p className="font-display text-2xl text-plum dark:text-orchid-light">
              {farms.length === 0
                ? "لا مزارع معتمدة حالياً"
                : "لا نتائج مطابقة"}
            </p>
            <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
              {farms.length === 0
                ? "يمكنك تصفّح الفنادق أو المطاعم في الأثناء."
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
                <Link href="/passenger/hotels">تصفّح الفنادق</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((f) => {
              const chips = amenityChips(f.amenities);
              return (
                <article
                  key={f.id}
                  className={cn(
                    "flex h-full flex-col rounded-3xl bg-white p-5 text-start ring-1 ring-plum/10",
                    "transition hover:-translate-y-0.5 hover:shadow-orchid",
                    "dark:bg-card dark:ring-orchid/20 dark:hover:ring-orchid/40",
                    "motion-reduce:hover:translate-y-0"
                  )}
                >
                  <p className="font-data text-[10px] tracking-[0.16em] text-orchid dark:text-orchid-light">
                    {cityLabel(f)}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-dusk dark:text-foreground">
                    {f.name}
                  </h3>

                  {(f.address || shortText(f.description, 90)) && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-dusk/60 dark:text-muted-foreground">
                      {shortText(f.description, 90) || f.address}
                    </p>
                  )}

                  {chips.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {chips.map((a) => (
                        <span
                          key={a}
                          className="rounded-full bg-mist px-2.5 py-0.5 text-[11px] text-dusk/70 ring-1 ring-plum/10 dark:bg-orchid/20 dark:text-orchid-light dark:ring-orchid/20"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 space-y-1.5 text-sm text-dusk/60 dark:text-muted-foreground">
                    {f.phone?.trim() && (
                      <p>
                        <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                          هاتف
                        </span>{" "}
                        <a
                          href={`tel:${f.phone}`}
                          className="font-medium text-dusk hover:text-plum dark:text-foreground dark:hover:text-orchid-light"
                        >
                          {f.phone}
                        </a>
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                        الموقع
                      </span>
                      <LocationMapIcon location={f.location} size="sm" />
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                    <span className="rounded-full bg-plum-soft px-2.5 py-1 font-data text-[11px] text-plum dark:bg-orchid/20 dark:text-orchid-light">
                      سعة {f.capacity}
                    </span>
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white dark:bg-orchid dark:hover:bg-orchid-light"
                    >
                      <Link href={`/passenger/farms/${f.id}`}>حجز المزرعة</Link>
                    </Button>
                  </div>
                </article>
              );
            })}
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
