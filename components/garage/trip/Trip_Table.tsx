"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TripManageRow } from "@/lib/actions/trip.actions";
import {
  cancelTrip,
  completeTripAtDestination,
  startTripInProgress,
} from "@/lib/actions/trip.actions";
import { Button } from "@/components/ui/button";
import TripRouteArrow from "@/components/Shared/TripRouteArrow";
import Swal from "sweetalert2";
import TablePagination from "@/components/Shared/TablePagination";
import { BiSolidCarGarage } from "react-icons/bi";
import { FaCarSide } from "react-icons/fa";

type Props = { trips: TripManageRow[] };

const STATUS_AR: Record<string, string> = {
  SCHEDULED: "مجدولة",
  IN_PROGRESS: "جارية",
  COMPLETED: "مكتملة",
  CANCELLED: "ملغاة",
};

export default function Trip_Table({ trips }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(trips.length / PAGE_SIZE));
  const pagedTrips = useMemo(
    () => trips.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [trips, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
        <div className="border-b border-plum/10 p-5 sm:p-6 dark:border-orchid/15">
          <div className="text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
              القائمة
            </p>
            <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
              رحلاتك
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-dusk/50 dark:text-muted-foreground">
              السائق المعيّن على الرحلة (شركة سياحية أو مستقلة) يغيّر الحالة من
              هنا. عند اكتمال حجز المقاعد: «بدء الرحلة» قبل موعد المغادرة إن
              رغبت، ثم «تم الوصول — إكمال» بعد الوصول؛ أو الإكمال مباشرة إن مرّ
              موعد المغادرة والمقاعد مكتملة. «إلغاء» للرحلة المجدولة فقط.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto p-2 sm:p-4">
          <table className="w-full text-sm responsive-table">
            <thead>
              <tr className="border-b border-plum/10 text-start dark:border-orchid/15">
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  المسار
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  النوع
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  المغادرة
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  السعر
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  المقاعد
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الحالة
                </th>
                <th className="min-w-[11rem] p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedTrips.map((t) => {
                const departure = new Date(t.departureTime);
                const now = new Date();
                const isFull = t.availableSeats === 0;
                const departurePassed = departure <= now;
                const showStart =
                  t.status === "SCHEDULED" && isFull && !departurePassed;
                const showComplete =
                  t.status === "IN_PROGRESS" ||
                  (t.status === "SCHEDULED" && isFull && departurePassed);

                return (
                  <tr
                    key={t.id}
                    className="border-b border-plum/5 text-start last:border-0 dark:border-orchid/10"
                  >
                    <td className="p-3" data-label="المسار">
                      <TripRouteArrow
                        fromCityName={t.fromCity}
                        fromRegion={t.fromRegion}
                        toCityName={t.toCity}
                        toRegion={t.toRegion}
                      />
                      <div className="mt-1 text-xs text-dusk/50 dark:text-muted-foreground">
                        {t.garageName ?? "رحلة مستقلة"} — {t.driverName}
                      </div>
                    </td>
                    <td className="p-3" data-label="النوع">
                      {t.isFreelance ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orchid/10 px-2.5 py-0.5 font-data text-[10px] tracking-wide text-orchid dark:bg-fuchsia-brand/15 dark:text-fuchsia-brand">
                          <FaCarSide className="h-3.5 w-3.5" />
                          مستقلة
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-data text-[10px] tracking-wide text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <BiSolidCarGarage className="h-3.5 w-3.5" />
                          شركة سياحية
                        </span>
                      )}
                    </td>
                    <td
                      className="whitespace-nowrap p-3 font-data text-dusk/70 dark:text-muted-foreground"
                      data-label="المغادرة"
                    >
                      {departure.toLocaleString("en-US")}
                    </td>
                    <td
                      className="p-3 font-data tabular-nums text-dusk dark:text-foreground"
                      data-label="السعر"
                    >
                      {t.basePrice}
                    </td>
                    <td
                      className="p-3 font-data tabular-nums text-dusk/70 dark:text-muted-foreground"
                      data-label="المقاعد"
                    >
                      {t.availableSeats}/{t.maxSeats}
                    </td>
                    <td
                      className="p-3 text-dusk dark:text-foreground"
                      data-label="الحالة"
                    >
                      {STATUS_AR[t.status] ?? t.status}
                    </td>
                    <td className="p-3" data-label="إجراءات">
                      <div className="flex flex-col items-stretch gap-1.5">
                        {showStart && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="rounded-xl bg-mist text-dusk ring-1 ring-plum/10 hover:bg-plum-soft dark:bg-muted dark:text-foreground dark:ring-orchid/25 dark:hover:bg-orchid/15"
                            disabled={pending}
                            onClick={async () => {
                              const confirmed = await Swal.fire({
                                icon: "question",
                                title: "بدء الرحلة",
                                text: "تسجيل بدء الرحلة؟ (جميع المقاعد محجوزة)",
                                showCancelButton: true,
                                confirmButtonText: "نعم، ابدأ",
                                cancelButtonText: "إلغاء",
                              });
                              if (!confirmed.isConfirmed) return;
                              start(async () => {
                                const res = await startTripInProgress(t.id);
                                if (res.success) {
                                  router.refresh();
                                  await Swal.fire({
                                    icon: "success",
                                    title: "تم التحديث",
                                    text: "تم تسجيل بدء الرحلة",
                                    confirmButtonText: "موافق",
                                  });
                                } else {
                                  await Swal.fire({
                                    icon: "error",
                                    title: "تعذر التحديث",
                                    text: res.error,
                                    confirmButtonText: "حسناً",
                                  });
                                }
                              });
                            }}
                          >
                            بدء الرحلة
                          </Button>
                        )}
                        {showComplete && (
                          <Button
                            type="button"
                            className="rounded-xl border-0 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                            size="sm"
                            disabled={pending}
                            onClick={async () => {
                              const confirmed = await Swal.fire({
                                icon: "question",
                                title: "إكمال الرحلة",
                                text: "تأكيد الوصول إلى الوجهة وإكمال الرحلة؟",
                                showCancelButton: true,
                                confirmButtonText: "نعم، إكمال",
                                cancelButtonText: "إلغاء",
                              });
                              if (!confirmed.isConfirmed) return;
                              start(async () => {
                                const res = await completeTripAtDestination(
                                  t.id
                                );
                                if (res.success) {
                                  router.refresh();
                                  await Swal.fire({
                                    icon: "success",
                                    title: "تم الإكمال",
                                    text: "تم تسجيل الوصول وإكمال الرحلة",
                                    confirmButtonText: "موافق",
                                  });
                                } else {
                                  await Swal.fire({
                                    icon: "error",
                                    title: "تعذر الإكمال",
                                    text: res.error,
                                    confirmButtonText: "حسناً",
                                  });
                                }
                              });
                            }}
                          >
                            تم الوصول — إكمال
                          </Button>
                        )}
                        {t.status === "SCHEDULED" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-plum/20 dark:border-orchid/30"
                            disabled={pending}
                            onClick={async () => {
                              const confirmed = await Swal.fire({
                                icon: "warning",
                                title: "إلغاء الرحلة",
                                text: "هل تريد إلغاء الرحلة؟",
                                showCancelButton: true,
                                confirmButtonText: "نعم، إلغاء",
                                cancelButtonText: "تراجع",
                              });
                              if (!confirmed.isConfirmed) return;
                              start(async () => {
                                const res = await cancelTrip(t.id);
                                if (res.success) {
                                  router.refresh();
                                  await Swal.fire({
                                    icon: "success",
                                    title: "تم الإلغاء",
                                    text: "تم إلغاء الرحلة بنجاح",
                                    confirmButtonText: "موافق",
                                  });
                                } else {
                                  await Swal.fire({
                                    icon: "error",
                                    title: "تعذر الإلغاء",
                                    text: res.error,
                                    confirmButtonText: "حسناً",
                                  });
                                }
                              });
                            }}
                          >
                            إلغاء
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {trips.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-10 text-center text-dusk/50 dark:text-muted-foreground"
                  >
                    لا توجد رحلات
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
