"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import { deleteTourismPlace } from "@/lib/actions/tourism_places.actions";
import type { CityRow } from "@/lib/actions/city.actions";
import Tourism_Places_Update from "./Tourism_Places_Update";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import TablePagination from "@/components/Shared/TablePagination";
import { cn } from "@/lib/utils";
import { placeLocationLabel } from "@/lib/place-location-label";

type Props = { places: TourismPlaceRow[]; cities: CityRow[] };

type StatusFilter = "all" | "APPROVED" | "PENDING" | "REJECTED";

const chipIdle =
  "bg-mist text-dusk/70 ring-1 ring-plum/10 hover:bg-plum-soft dark:bg-muted dark:text-muted-foreground dark:ring-orchid/25 dark:hover:bg-orchid/15";

function fmtCity(p: TourismPlaceRow) {
  return placeLocationLabel(p);
}

function statusLabel(s: TourismPlaceRow["approvalStatus"]) {
  if (s === "APPROVED") return "معتمد";
  if (s === "PENDING") return "بانتظار الموافقة";
  return "مرفوض";
}

export default function Tourism_Places_Table({ places, cities }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const PAGE_SIZE = 12;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return places.filter((p) => {
      if (status !== "all" && p.approvalStatus !== status) return false;
      if (!q) return true;
      const hay = [p.name, p.description, p.country, p.governorate, p.cityName, fmtCity(p)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [places, search, status]);

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
                الأماكن المسجّلة
              </h2>
            </div>
            <p className="font-data text-sm text-dusk/50 dark:text-muted-foreground">
              {filtered.length} مكان
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو المحافظة…"
              className="h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition placeholder:text-dusk/40 focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:border-orchid-light dark:focus:ring-orchid/40"
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(
                [
                  ["all", "الكل"],
                  ["APPROVED", "معتمدة"],
                  ["PENDING", "بانتظار الموافقة"],
                  ["REJECTED", "مرفوضة"],
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
                  الاسم
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  المحافظة
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
              {paged.map((p, index) => {
                const cover = p.images?.[0] ?? p.imageUrl;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-plum/5 text-start last:border-0 dark:border-orchid/10"
                  >
                    <td
                      className="p-3 font-data tabular-nums text-dusk/45 dark:text-muted-foreground"
                      data-label="#"
                    >
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="p-3" data-label="الصورة">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt={p.name}
                          className="h-14 w-20 rounded-xl object-cover ring-1 ring-plum/10 dark:ring-orchid/20"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-mist text-[10px] text-dusk/40 ring-1 ring-plum/10 dark:bg-muted dark:text-muted-foreground dark:ring-orchid/20">
                          بلا صورة
                        </div>
                      )}
                    </td>
                    <td className="p-3" data-label="الاسم">
                      <p className="font-semibold text-dusk dark:text-foreground">
                        {p.name}
                      </p>
                      {(p.images?.length ?? 0) > 1 && (
                        <p className="mt-0.5 font-data text-[10px] text-orchid dark:text-orchid-light">
                          {p.images!.length} صور
                        </p>
                      )}
                    </td>
                    <td
                      className="p-3 text-dusk/60 dark:text-muted-foreground"
                      data-label="المحافظة"
                    >
                      {fmtCity(p)}
                    </td>
                    <td className="p-3" data-label="الحالة">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 font-data text-[10px] tracking-wide",
                          p.approvalStatus === "APPROVED" &&
                            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
                          p.approvalStatus === "PENDING" &&
                            "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200",
                          p.approvalStatus === "REJECTED" &&
                            "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        )}
                      >
                        {statusLabel(p.approvalStatus)}
                      </span>
                    </td>
                    <td className="p-3" data-label="إجراءات">
                      <div className="flex flex-wrap gap-2">
                        <Tourism_Places_Update place={p} cities={cities} />
                        <Button
                          type="button"
                          size="sm"
                          disabled={pending}
                          className="rounded-xl border-0 bg-dusk text-white hover:bg-dusk-muted dark:bg-muted dark:text-foreground dark:hover:bg-orchid/20"
                          onClick={async () => {
                            const confirmed = await Swal.fire({
                              icon: "warning",
                              title: "تأكيد الحذف",
                              text: "هل تريد حذف هذا المكان؟",
                              showCancelButton: true,
                              confirmButtonText: "نعم، حذف",
                              cancelButtonText: "إلغاء",
                            });
                            if (!confirmed.isConfirmed) return;
                            start(async () => {
                              const res = await deleteTourismPlace(p.id);
                              if (res.success) {
                                router.refresh();
                                await Swal.fire({
                                  icon: "success",
                                  title: "تم الحذف",
                                  text: "تم حذف المكان بنجاح",
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
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-dusk/50 dark:text-muted-foreground"
                  >
                    {places.length === 0
                      ? "لا توجد أماكن سياحية مضافة بعد"
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
