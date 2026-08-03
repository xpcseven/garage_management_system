"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PublicGarageRow } from "@/lib/actions/passenger.actions";
import { Button } from "@/components/ui/button";
import { LocationMapIcon } from "@/components/Shared/LocationMapIcon";
import { cn } from "@/lib/utils";

type Props = { garages: PublicGarageRow[] };

function shortText(raw: string | null | undefined, max = 110) {
  if (!raw?.trim()) return null;
  const text = raw.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

export default function Passenger_Garages_Component({ garages }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return garages;
    return garages.filter((g) => {
      const hay = [g.name, g.description, g.phone, g.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [garages, query]);

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
              دليل الشركات
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              الشركات السياحية
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
              اختر شركة لعرض رحلاتها، أو انتقل للرحلات المستقلة والبحث السريع عن
              وجهة.
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
              <Link href="/home">العودة للرئيسية</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 flex-1">
            <span className="sr-only">بحث عن شركة</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم الشركة أو الموقع أو الهاتف…"
              className="h-11 w-full rounded-2xl border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 outline-none ring-orchid/40 transition focus:bg-white/15 focus:ring-2 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:bg-background"
            />
          </label>
          <p className="font-data text-xs text-white/50 sm:whitespace-nowrap dark:text-muted-foreground">
            {filtered.length} شركة
          </p>
        </div>
      </header>

      <Link
        href="/passenger/freelance-trips"
        className="group flex flex-col justify-between gap-4 rounded-[1.75rem] bg-plum p-6 text-white shadow-plum transition hover:bg-plum-light dark:bg-orchid/20 dark:ring-1 dark:ring-orchid/30 dark:hover:bg-orchid/30 sm:flex-row sm:items-center"
      >
        <div className="text-start">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid-light">
            بدون شركة
          </p>
          <h2 className="mt-2 font-display text-2xl">رحلات السائقين المستقلين</h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-white/75 dark:text-muted-foreground">
            رحلات لا تتبع شركة سياحية — اعرض المتاح منها واحجز مقعدك مباشرة.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-orchid-light transition group-hover:-translate-x-1">
          عرض الرحلات
          <span aria-hidden>←</span>
        </span>
      </Link>

      <section className="space-y-4">
        <div className="text-start">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
            المسجّلة
          </p>
          <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
            شركات سياحية نشطة
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
            <p className="font-display text-2xl text-plum dark:text-orchid-light">
              {garages.length === 0
                ? "لا شركات مسجّلة حالياً"
                : "لا نتائج مطابقة"}
            </p>
            <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
              {garages.length === 0
                ? "يمكنك البحث عن رحلة مباشرة أو العودة لاحقاً."
                : "جرّب اسماً آخر أو امسح البحث."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {query && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-plum/20 dark:border-orchid/30"
                  onClick={() => setQuery("")}
                >
                  مسح البحث
                </Button>
              )}
              <Button
                asChild
                className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
              >
                <Link href="/passenger/trips">ابحث عن رحلة</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((g) => (
              <article
                key={g.id}
                className={cn(
                  "flex h-full flex-col rounded-3xl bg-white p-5 text-start ring-1 ring-plum/10",
                  "transition hover:-translate-y-0.5 hover:shadow-orchid",
                  "dark:bg-card dark:ring-orchid/20 dark:hover:ring-orchid/40",
                  "motion-reduce:hover:translate-y-0"
                )}
              >
                <div className="flex-1 space-y-3">
                  <h3 className="text-lg font-semibold text-dusk dark:text-foreground">
                    {g.name}
                  </h3>
                  {shortText(g.description) && (
                    <p className="text-sm leading-7 text-dusk/65 dark:text-muted-foreground">
                      {shortText(g.description)}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-dusk/60 dark:text-muted-foreground">
                    {g.phone && (
                      <p>
                        <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                          هاتف
                        </span>{" "}
                        <a
                          href={`tel:${g.phone}`}
                          className="font-medium text-dusk hover:text-plum dark:text-foreground dark:hover:text-orchid-light"
                        >
                          {g.phone}
                        </a>
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                        الموقع
                      </span>
                      <LocationMapIcon location={g.address} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <Button
                    asChild
                    className="w-full rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white dark:bg-orchid dark:hover:bg-orchid-light"
                  >
                    <Link href={`/passenger/garages/${g.id}`}>عرض الرحلات</Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
