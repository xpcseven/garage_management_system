"use client";

import { useEffect, useMemo, useState } from "react";
import type { PassengerTripRow } from "@/lib/actions/passenger.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PassengerTripBookButton from "./PassengerTripBookButton";
import TripRouteArrow from "@/components/Shared/TripRouteArrow";
import TablePagination from "@/components/Shared/TablePagination";

type Props = { trips: PassengerTripRow[] };

export default function Passenger_Freelance_Trips_Component({ trips }: Props) {
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
    <div className="space-y-6 p-4 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="h-8 px-0 text-purple-800">
            <Link href="/passenger/garages">العودة إلى قائمة الشركات السياحية</Link>
          </Button>
          <h1 className="text-2xl font-bold text-violet-900 dark:text-violet-500">
            رحلات السائقين المستقلين
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            رحلات لا تتبع شركة سياحية — مقاعد متاحة، رحلة مجدولة، وفق نفس شروط العرض
            في البحث العام.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/passenger/trips">البحث في كل الرحلات</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الرحلات ({trips.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm responsive-table">
            <thead>
              <tr className="border-b text-right">
                <th className="p-2">المسار</th>
                <th className="p-2">السائق</th>
                <th className="p-2">الموقع</th>
                <th className="p-2">المغادرة</th>
                <th className="p-2">السعر</th>
                <th className="p-2">متبقي</th>
                <th className="p-2 w-28">حجز</th>
              </tr>
            </thead>
            <tbody>
              {pagedTrips.map((t) => (
                <tr key={t.id} className="border-b border-muted">
                  <td className="p-2" data-label="المسار">
                    <TripRouteArrow
                      fromCityName={t.fromCity}
                      fromRegion={t.fromRegion}
                      toCityName={t.toCity}
                      toRegion={t.toRegion}
                    />
                  </td>
                  <td className="p-2" data-label="السائق">{t.driverName}</td>
                  <td className="p-2" data-label="الموقع">{t.sourceLocation ?? "غير محدد"}</td>
                  <td className="p-2 whitespace-nowrap" data-label="المغادرة">
                    {new Date(t.departureTime).toLocaleString("en-US")}
                  </td>
                  <td className="p-2 font-mono" data-label="السعر">{t.basePrice}</td>
                  <td className="p-2" data-label="متبقي">{t.availableSeats}</td>
                  <td className="p-2" data-label="حجز">
                    <PassengerTripBookButton tripId={t.id} />
                  </td>
                </tr>
              ))}
              {trips.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-10 text-center text-muted-foreground"
                  >
                    لا توجد رحلات مستقلة متاحة حالياً. يمكنك العودة لاحقاً أو
                    استخدام البحث العام عن الرحلات.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
        <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>
    </div>
  );
}
