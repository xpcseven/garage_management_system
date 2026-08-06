"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { HomeSliderSlideRow } from "@/lib/actions/home_slider.actions";
import { deleteHomeSliderSlide } from "@/lib/actions/home_slider.actions";
import Home_Slider_Update from "./Home_Slider_Update";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import { toDisplayImageUrl } from "@/lib/media-url";
import TablePagination from "@/components/Shared/TablePagination";
import { cn } from "@/lib/utils";

type Props = { slides: HomeSliderSlideRow[] };

type StatusFilter = "all" | "active" | "inactive";

const chipIdle =
  "bg-mist text-dusk/70 ring-1 ring-plum/10 hover:bg-plum-soft dark:bg-muted dark:text-muted-foreground dark:ring-orchid/25 dark:hover:bg-orchid/15";

export default function Home_Slider_Table({ slides }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const PAGE_SIZE = 12;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return slides.filter((s) => {
      if (status === "active" && !s.isActive) return false;
      if (status === "inactive" && s.isActive) return false;
      if (!q) return true;
      return s.title.toLowerCase().includes(q);
    });
  }, [slides, search, status]);

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
                شرائح السلايدر
              </h2>
            </div>
            <p className="font-data text-sm text-dusk/50 dark:text-muted-foreground">
              {filtered.length} شريحة
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بعنوان الشريحة…"
              className="h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition placeholder:text-dusk/40 focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:border-orchid-light dark:focus:ring-orchid/40"
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(
                [
                  ["all", "الكل"],
                  ["active", "نشطة"],
                  ["inactive", "مخفية"],
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
                  الصورة
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  العنوان
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الترتيب
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
              {paged.map((s, index) => (
                <tr
                  key={s.id}
                  className="border-b border-plum/5 text-start last:border-0 dark:border-orchid/10"
                >
                  <td
                    className="p-3 font-data tabular-nums text-dusk/45 dark:text-muted-foreground"
                    data-label="#"
                  >
                    {(page - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="p-3" data-label="الصورة">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={toDisplayImageUrl(s.imageUrl) || s.imageUrl}
                      alt={s.title}
                      className="h-14 w-24 rounded-xl object-cover ring-1 ring-plum/10 dark:ring-orchid/20"
                      loading="lazy"
                    />
                  </td>
                  <td
                    className="p-3 font-semibold text-dusk dark:text-foreground"
                    data-label="العنوان"
                  >
                    {s.title}
                  </td>
                  <td
                    className="p-3 font-data tabular-nums text-dusk/70 dark:text-muted-foreground"
                    data-label="الترتيب"
                  >
                    {s.sortOrder}
                  </td>
                  <td className="p-3" data-label="الحالة">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 font-data text-[10px] tracking-wide",
                        s.isActive
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      )}
                    >
                      {s.isActive ? "نشطة" : "مخفية"}
                    </span>
                  </td>
                  <td className="p-3" data-label="إجراءات">
                    <div className="flex flex-wrap gap-2">
                      <Home_Slider_Update slide={s} />
                      <Button
                        type="button"
                        size="sm"
                        disabled={pending}
                        className="rounded-xl border-0 bg-dusk text-white hover:bg-dusk-muted dark:bg-muted dark:text-foreground dark:hover:bg-orchid/20"
                        onClick={async () => {
                          const confirmed = await Swal.fire({
                            icon: "warning",
                            title: "تأكيد الحذف",
                            text: "هل تريد حذف هذه الشريحة؟",
                            showCancelButton: true,
                            confirmButtonText: "نعم، حذف",
                            cancelButtonText: "إلغاء",
                          });
                          if (!confirmed.isConfirmed) return;
                          start(async () => {
                            const res = await deleteHomeSliderSlide(s.id);
                            if (res.success) {
                              router.refresh();
                              await Swal.fire({
                                icon: "success",
                                title: "تم الحذف",
                                text: "تم حذف الشريحة بنجاح",
                                confirmButtonText: "موافق",
                              });
                            } else {
                              await Swal.fire({
                                icon: "error",
                                title: "تعذر الحذف",
                                text: res.error,
                                confirmButtonText: "حسناً",
                              });
                            }
                          });
                        }}
                      >
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-dusk/50 dark:text-muted-foreground"
                  >
                    {slides.length === 0
                      ? "لا توجد شرائح بعد. أضف صوراً لعرضها في الصفحة الرئيسية."
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
