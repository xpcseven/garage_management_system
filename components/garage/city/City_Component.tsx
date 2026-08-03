"use client";

import type { CityRow } from "@/lib/actions/city.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import City_Create from "./City_Create";
import City_Table from "./City_Table";

type Props = {
  cities: CityRow[];
};

export default function City_Component({ cities }: Props) {
  const activeCount = cities.filter((c) => c.isActive).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-6 py-8 text-white sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-48 w-48 rounded-full bg-orchid/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 bottom-0 h-40 w-40 rounded-full bg-fuchsia-brand/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              إعدادات المنصة
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              المدن
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
              إدارة مدن الانطلاق والوصول المستخدمة في الرحلات والبحث — للمشرف
              العام فقط.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <City_Create />
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
            >
              <Link href="/home">الرئيسية</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="الكل" value={cities.length} />
          <Metric label="نشطة" value={activeCount} />
          <Metric
            label="موقوفة"
            value={cities.length - activeCount}
            className="col-span-2 sm:col-span-1"
          />
        </div>
      </header>

      <City_Table cities={cities} />
    </div>
  );
}

function Metric({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm ring-1 ring-white/15 ${className ?? ""}`}
    >
      <p className="font-data text-xl font-semibold tabular-nums text-white sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-white/55 sm:text-xs">{label}</p>
    </div>
  );
}
