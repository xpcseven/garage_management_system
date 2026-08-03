"use client";

import { useEffect, useMemo, useState } from "react";
import type { GarageRow } from "@/lib/actions/garage.actions";
import Garage_Update from "./Garage_Update";
import TablePagination from "@/components/Shared/TablePagination";
import { cn } from "@/lib/utils";

type Props = { garages: GarageRow[] };

type StatusFilter = "all" | "active" | "inactive";

const chipIdle =
  "bg-mist text-dusk/70 ring-1 ring-plum/10 hover:bg-plum-soft dark:bg-muted dark:text-muted-foreground dark:ring-orchid/25 dark:hover:bg-orchid/15";

export default function Garage_Table({ garages }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const PAGE_SIZE = 12;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return garages.filter((g) => {
      if (status === "active" && !g.isActive) return false;
      if (status === "inactive" && g.isActive) return false;
      if (!q) return true;
      const hay = [g.name, g.phone, g.description, g.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [garages, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
        <div className="border-b border-plum/10 p-5 sm:p-6 dark:border-orchid/15">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-start">
              <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
                القائمة
              </p>
              <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
                الشركات المسجّلة
              </h2>
            </div>
            <p className="font-data text-sm text-dusk/50 dark:text-muted-foreground">
              {filtered.length} شركة
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو الهاتف…"
              className="h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition placeholder:text-dusk/40 focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:border-orchid-light dark:focus:ring-orchid/40"
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(
                [
                  ["all", "الكل"],
                  ["active", "نشطة"],
                  ["inactive", "موقوفة"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orchid",
                    status === value
                      ? "bg-orchid text-white shadow-orchid"
                      : chipIdle
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto p-2 sm:p-4">
          <table className="w-full text-sm responsive-table">
            <thead>
              <tr className="border-b border-plum/10 text-start dark:border-orchid/15">
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  #
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الاسم
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الهاتف
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الحالة
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((g, index) => (
                <tr
                  key={g.id}
                  className="border-b border-plum/5 text-start last:border-0 dark:border-orchid/10"
                >
                  <td
                    className="p-3 font-data tabular-nums text-dusk/45 dark:text-muted-foreground"
                    data-label="#"
                  >
                    {(page - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="p-3" data-label="الاسم">
                    <p className="font-semibold text-dusk dark:text-foreground">
                      {g.name}
                    </p>
                    {g.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-dusk/50 dark:text-muted-foreground">
                        {g.description}
                      </p>
                    )}
                  </td>
                  <td
                    className="p-3 font-data text-dusk/60 dark:text-muted-foreground"
                    data-label="الهاتف"
                    dir="ltr"
                  >
                    {g.phone ?? "—"}
                  </td>
                  <td className="p-3" data-label="الحالة">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 font-data text-[10px] tracking-wide",
                        g.isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      )}
                    >
                      {g.isActive ? "نشط" : "موقوف"}
                    </span>
                  </td>
                  <td className="p-3" data-label="إجراءات">
                    <Garage_Update garage={g} />
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-10 text-center text-dusk/50 dark:text-muted-foreground"
                  >
                    {garages.length === 0
                      ? "لا توجد شركات سياحية مضافة بعد"
                      : "لا نتائج مطابقة للبحث"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-plum/10 px-2 py-3 sm:px-4 dark:border-orchid/15">
          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </section>
  );
}
