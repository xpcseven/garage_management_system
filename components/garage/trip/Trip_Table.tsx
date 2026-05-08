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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">رحلاتك</CardTitle>
        <p className="text-xs text-muted-foreground font-normal leading-relaxed">
          السائق المعيّن على الرحلة (شركة سياحية أو مستقلة) يغيّر الحالة من هنا. عند اكتمال
          حجز المقاعد: «بدء الرحلة» قبل موعد المغادرة إن رغبت، ثم «تم الوصول —
          إكمال» بعد الوصول؛ أو الإكمال مباشرة إن مرّ موعد المغادرة والمقاعد
          مكتملة. «إلغاء» للرحلة المجدولة فقط.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm responsive-table">
          <thead>
            <tr className="border-b text-right">
              <th className="p-2">المسار</th>
              <th className="p-2">النوع</th>
              <th className="p-2">المغادرة</th>
              <th className="p-2">السعر</th>
              <th className="p-2">المقاعد</th>
              <th className="p-2">الحالة</th>
              <th className="p-2 min-w-[11rem]">إجراءات</th>
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
                <tr key={t.id} className="border-b border-muted">
                  <td className="p-2" data-label="المسار">
                    <TripRouteArrow
                      fromCityName={t.fromCity}
                      fromRegion={t.fromRegion}
                      toCityName={t.toCity}
                      toRegion={t.toRegion}
                    />
                    <div className="mt-1 text-xs text-muted-foreground">
                      {t.garageName ?? "رحلة مستقلة"} — {t.driverName}
                    </div>
                  </td>
                  <td className="p-2" data-label="النوع">
                    {t.isFreelance ? (
                      <h1 className="text-purple-500 font-bold flex items-center gap-2">
                       <FaCarSide className="w-5 h-5" />
                       <span className="text-purple-500 font-bold">مستقلة</span>
                      </h1>
                    ) : (
                      <h1 className="text-green-500 font-bold flex items-center gap-2">
                       <BiSolidCarGarage className="w-5 h-5" />
                       <span className="text-green-500 font-bold">شركة سياحية</span>
                      </h1>
                    )}
                  </td>
                  <td className="p-2 whitespace-nowrap" data-label="المغادرة">
                    {departure.toLocaleString("en-US")}
                  </td>
                  <td className="p-2 font-mono" data-label="السعر">{t.basePrice}</td>
                  <td className="p-2" data-label="المقاعد">
                    {t.availableSeats}/{t.maxSeats}
                  </td>
                  <td className="p-2" data-label="الحالة">
                    {STATUS_AR[t.status] ?? t.status}
                  </td>
                  <td className="p-2" data-label="إجراءات">
                    <div className="flex flex-col gap-1.5 items-stretch">
                      {showStart && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
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
                          className="bg-emerald-700 hover:bg-emerald-800"
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
                              const res = await completeTripAtDestination(t.id);
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
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  لا توجد رحلات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </Card>
  );
}
