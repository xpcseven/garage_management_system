"use client";

import { useTransition } from "react";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">رحلاتك</CardTitle>
        <p className="text-xs text-muted-foreground font-normal leading-relaxed">
          السائق المعيّن على الرحلة (كراج أو مستقلة) يغيّر الحالة من هنا. عند اكتمال
          حجز المقاعد: «بدء الرحلة» قبل موعد المغادرة إن رغبت، ثم «تم الوصول —
          إكمال» بعد الوصول؛ أو الإكمال مباشرة إن مرّ موعد المغادرة والمقاعد
          مكتملة. «إلغاء» للرحلة المجدولة فقط.
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
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
            {trips.map((t) => {
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
                  <td className="p-2">
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
                  <td className="p-2">
                    {t.isFreelance ? (
                      <Badge variant="secondary">مستقلة</Badge>
                    ) : (
                      <Badge>كراج</Badge>
                    )}
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    {departure.toLocaleString("ar-IQ")}
                  </td>
                  <td className="p-2 font-mono">{t.basePrice}</td>
                  <td className="p-2">
                    {t.availableSeats}/{t.maxSeats}
                  </td>
                  <td className="p-2">
                    {STATUS_AR[t.status] ?? t.status}
                  </td>
                  <td className="p-2">
                    <div className="flex flex-col gap-1.5 items-stretch">
                      {showStart && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={pending}
                          onClick={() => {
                            if (
                              !confirm(
                                "تسجيل بدء الرحلة؟ (جميع المقاعد محجوزة)"
                              )
                            )
                              return;
                            start(async () => {
                              const res = await startTripInProgress(t.id);
                              if (res.success) router.refresh();
                              else alert(res.error);
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
                          onClick={() => {
                            if (
                              !confirm(
                                "تأكيد الوصول إلى الوجهة وإكمال الرحلة؟"
                              )
                            )
                              return;
                            start(async () => {
                              const res = await completeTripAtDestination(t.id);
                              if (res.success) router.refresh();
                              else alert(res.error);
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
                          onClick={() => {
                            if (!confirm("إلغاء الرحلة؟")) return;
                            start(async () => {
                              const res = await cancelTrip(t.id);
                              if (res.success) router.refresh();
                              else alert(res.error);
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
    </Card>
  );
}
