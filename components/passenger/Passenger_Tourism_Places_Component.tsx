"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import { Button } from "@/components/ui/button";
import TablePagination from "@/components/Shared/TablePagination";
import { cn } from "@/lib/utils";

const FALLBACK_IMG = "/System/Tourism_Images/all-hadar_01.png";

type Props = { places: TourismPlaceRow[] };

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

export default function Passenger_Tourism_Places_Component({ places }: Props) {
  const regions = useMemo(() => {
    const set = new Set<string>();
    for (const p of places) set.add(placeCaption(p));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
  }, [places]);

  const [region, setRegion] = useState("الكل");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    setPage(1);
  }, [region, query]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const featured = page === 1 ? paged[0] : null;
  const rest = page === 1 ? paged.slice(1) : paged;

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
              دليل المعالم
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              الأماكن السياحية
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
              تصفّح المعالم المعتمدة، ثم أكمل رحلتك عبر برنامج سياحي أو حجز مقعد.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
            >
              <Link href="/passenger/tourism-programs">البرامج السياحية</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-orchid/30 dark:bg-transparent dark:text-foreground dark:hover:bg-orchid/15 dark:hover:text-foreground"
            >
              <Link href="/passenger/trips">ابحث عن رحلة</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">بحث</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم المعلم أو المحافظة…"
              className="h-11 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 outline-none ring-orchid/40 transition focus:bg-white/15 focus:ring-2 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:bg-background"
            />
          </label>
          <p className="font-data text-xs text-white/50 sm:whitespace-nowrap dark:text-muted-foreground">
            {filtered.length} معلم
          </p>
        </div>

        {regions.length > 0 && (
          <div className="relative mt-5 flex gap-2 overflow-x-auto pb-1">
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
      </header>

      <section className="space-y-4">
        <div className="text-start">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
            للاستكشاف
          </p>
          <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
            معالم متاحة
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
            <p className="font-display text-2xl text-plum dark:text-orchid-light">
              لا نتائج مطابقة
            </p>
            <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
              جرّب توسيع البحث أو اختيار محافظة أخرى.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6 rounded-xl border-plum/20 dark:border-orchid/30"
              onClick={() => {
                setQuery("");
                setRegion("الكل");
              }}
            >
              مسح التصفية
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {featured && (
                <Link
                  href={`/passenger/tourism-places/${featured.id}`}
                  className="group grid overflow-hidden rounded-[2rem] bg-white ring-1 ring-plum/10 transition hover:shadow-plum motion-reduce:transition-none dark:bg-card dark:ring-orchid/20 dark:hover:ring-orchid/40 lg:grid-cols-2"
                >
                  <div className="relative min-h-[14rem] sm:min-h-[18rem]">
                    <Image
                      src={featured.imageUrl || FALLBACK_IMG}
                      alt={featured.name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                  </div>
                  <div className="flex flex-col justify-center px-6 py-8 text-start sm:px-8">
                    <p className="font-data text-xs tracking-[0.16em] text-orchid dark:text-orchid-light">
                      {placeCaption(featured)}
                    </p>
                    <h3 className="mt-2 font-display text-3xl text-dusk dark:text-foreground">
                      {featured.name}
                    </h3>
                    {shortBlurb(featured.description, 160) && (
                      <p className="mt-4 text-sm leading-8 text-dusk/65 dark:text-muted-foreground">
                        {shortBlurb(featured.description, 160)}
                      </p>
                    )}
                    <span className="mt-6 inline-flex text-sm font-semibold text-plum dark:text-orchid-light">
                      اعرض التفاصيل ←
                    </span>
                  </div>
                </Link>
              )}

              {rest.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p) => (
                    <Link
                      key={p.id}
                      href={`/passenger/tourism-places/${p.id}`}
                      className={cn(
                        "group relative isolate aspect-[4/3] overflow-hidden rounded-3xl",
                        "ring-1 ring-plum/10 transition duration-500",
                        "hover:-translate-y-1 hover:shadow-orchid",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum",
                        "dark:ring-orchid/20 dark:hover:ring-orchid/45 dark:focus-visible:ring-orchid",
                        "motion-reduce:hover:translate-y-0"
                      )}
                    >
                      <Image
                        src={p.imageUrl || FALLBACK_IMG}
                        alt={p.name}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dusk/90 via-dusk/25 to-transparent dark:from-background/95 dark:via-background/40" />
                      <div className="absolute inset-x-0 bottom-0 p-5 text-start text-white">
                        <p className="font-data text-[10px] tracking-[0.16em] text-orchid-light/90">
                          {placeCaption(p)}
                        </p>
                        <h3 className="mt-1 text-lg font-bold leading-snug">
                          {p.name}
                        </h3>
                        {shortBlurb(p.description, 70) && (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/70 dark:text-white/75">
                            {shortBlurb(p.description, 70)}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <TablePagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
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
