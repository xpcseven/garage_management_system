"use client";

import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Tourism_Places_Create from "./Tourism_Places_Create";
import Tourism_Places_Table from "./Tourism_Places_Table";

type Props = {
  places: TourismPlaceRow[];
};

export default function Tourism_Places_Component({ places }: Props) {
  const approved = places.filter((p) => p.approvalStatus === "APPROVED").length;
  const pending = places.filter((p) => p.approvalStatus === "PENDING").length;

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
              إدارة المعالم
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              الأماكن السياحية
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
              إنشاء وإدارة المعالم المعروضة للمسافرين — للمشرف العام وصاحب المكان
              السياحي.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tourism_Places_Create />
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
            >
              <Link href="/tourism-requests">طلبات الاعتماد</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white dark:border-white/25 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
            >
              <Link href="/home">الرئيسية</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-3 gap-3">
          <Metric label="الكل" value={places.length} />
          <Metric label="معتمدة" value={approved} />
          <Metric label="بانتظار الموافقة" value={pending} />
        </div>
      </header>

      <Tourism_Places_Table places={places} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm ring-1 ring-white/15">
      <p className="font-data text-xl font-semibold tabular-nums text-white sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-white/55 sm:text-xs">{label}</p>
    </div>
  );
}
