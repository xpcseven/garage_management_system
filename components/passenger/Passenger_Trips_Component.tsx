"use client";

import { useEffect, useMemo, useState } from "react";
import type { CityRow } from "@/lib/actions/city.actions";
import type {
  PassengerTripRow,
  PassengerTripScope,
} from "@/lib/actions/passenger.actions";
import Link from "next/link";
import { DashboardPageLayout } from "@/components/layout/DashboardPageLayout";
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

type Initial = {
  from: string;
  to: string;
  q: string;
  scope: PassengerTripScope;
};

type Props = {
  cities: CityRow[];
  trips: PassengerTripRow[];
  initialParams: Initial;
};

export default function Passenger_Trips_Component({
  cities,
  trips,
  initialParams,
}: Props) {
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
    <div className="space-y-8 p-4 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-800">البحث عن رحلة</h1>
          <p className="text-sm text-muted-foreground mt-1">
            رحلات الكراجات ورحلات السائقين المستقلين — ثم احجز مقعداً.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/passenger/garages">الكراجات المسجّلة</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تصفية البحث</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="get" action="/passenger/trips" className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">من مدينة</label>
              <select
                name="from"
                defaultValue={initialParams.from}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— أي انطلاق —</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.region ? ` (${c.region})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">إلى مدينة</label>
              <select
                name="to"
                defaultValue={initialParams.to}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">— أي وصول —</option>
                {cities.map((c) => (
                  <option key={`t-${c.id}`} value={c.id}>
                    {c.name}
                    {c.region ? ` (${c.region})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">بحث نصي (اسم مدينة أو منطقة)</label>
              <input
                name="q"
                defaultValue={initialParams.q}
                placeholder="مثال: بغداد، أربيل..."
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-sm font-medium">نوع الرحلات</label>
              <select
                name="scope"
                defaultValue={initialParams.scope}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">الكل (كراج + مستقل)</option>
                <option value="garage">رحلات أصحاب الكراجات فقط</option>
                <option value="freelance">رحلات السائقين المستقلين فقط</option>
              </select>
            </div>
            <Button type="submit" className="sm:col-span-2 bg-sky-600 w-full sm:w-auto">
              بحث
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">النتائج ({trips.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm responsive-table">
            <thead>
              <tr className="border-b text-right">
                <th className="p-2">المسار</th>
                <th className="p-2">المصدر</th>
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
                  <td className="p-2" data-label="المصدر">
                    {t.isFreelance ? (
                      <span className="text-violet-700">مستقل</span>
                    ) : (
                      <span>{t.garageName ?? "كراج"}</span>
                    )}
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
                  <td colSpan={8} className="p-10 text-center text-muted-foreground">
                    لا توجد رحلات مطابقة. جرّب تغيير التصفية أو التاريخ.
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
