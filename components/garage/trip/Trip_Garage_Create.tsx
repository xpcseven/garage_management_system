"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CityRow } from "@/lib/actions/city.actions";
import type { GarageTripPack } from "@/lib/actions/trip.actions";
import { createGarageTrip } from "@/lib/actions/trip.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  cities: CityRow[];
  garagePacks: GarageTripPack[];
};

export default function Trip_Garage_Create({ cities, garagePacks }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [garageId, setGarageId] = useState(garagePacks[0]?.id ?? "");
  const [vehicleId, setVehicleId] = useState("");

  const pack = useMemo(
    () => garagePacks.find((g) => g.id === garageId),
    [garageId, garagePacks]
  );

  useEffect(() => {
    const first = pack?.vehicles[0]?.id ?? "";
    setVehicleId(first);
  }, [garageId, pack]);

  const selectedVehicle = pack?.vehicles.find((v) => v.id === vehicleId);
  const maxCap = selectedVehicle?.totalSeats ?? pack?.vehicles[0]?.totalSeats ?? 1;

  if (garagePacks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">رحلة باسم الكراج</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-800">
            لا يوجد كراج نشط. أنشئ كراجاً ومركبات مرتبطة به أولاً.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">إنشاء رحلة للكراج</CardTitle>
        <p className="text-sm text-muted-foreground font-normal pt-1">
          حدّد وجهة السفر: نقطة الانطلاق (من) ونقطة الوصول (إلى) — يجب أن تكونا
          مختلفتين.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 sm:grid-cols-2"
          action={(fd) => {
            fd.set("garageId", garageId);
            start(async () => {
              const res = await createGarageTrip(fd);
              if (res.success) router.refresh();
              else alert(res.error);
            });
          }}
        >
          <div className="space-y-1 sm:col-span-2">
            <Label>الكراج</Label>
            <select
              value={garageId}
              onChange={(e) => setGarageId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {garagePacks.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 rounded-lg border border-sky-200 bg-sky-50/60 dark:bg-sky-950/20 p-4 space-y-3">
            <p className="text-sm font-semibold text-sky-900 dark:text-sky-100">
              وجهة السفر (مطلوب)
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="tg-from">من — نقطة الانطلاق</Label>
                <select
                  id="tg-from"
                  name="fromCityId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>
                    اختر مدينة الانطلاق
                  </option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.region ? ` — ${c.region}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="tg-to">إلى — نقطة الوصول</Label>
                <select
                  id="tg-to"
                  name="toCityId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>
                    اختر مدينة الوصول
                  </option>
                  {cities.map((c) => (
                    <option key={`to-${c.id}`} value={c.id}>
                      {c.name}
                      {c.region ? ` — ${c.region}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {cities.length === 0 && (
              <p className="text-xs text-amber-800">
                لا توجد مدن في النظام. يطلب المشرف إضافة مدن من قسم «المدن» حتى
                تستطيع تحديد من وإلى.
              </p>
            )}
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="tg-veh">المركبة</Label>
            <select
              id="tg-veh"
              name="vehicleId"
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {(pack?.vehicles ?? []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="tg-drv">السائق</Label>
            <select
              id="tg-drv"
              name="driverId"
              required
              key={`d-${garageId}`}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={pack?.drivers[0]?.id ?? ""}
            >
              {(pack?.drivers ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="tg-dep">وقت المغادرة</Label>
            <Input
              id="tg-dep"
              name="departureTime"
              type="datetime-local"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tg-price">السعر الأساسي</Label>
            <Input
              id="tg-price"
              name="basePrice"
              type="number"
              step="0.01"
              min={0}
              required
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="tg-seats">عدد المقاعد المعروضة</Label>
            <Input
              id="tg-seats"
              name="maxSeats"
              type="number"
              min={1}
              max={maxCap}
              key={`${garageId}-${vehicleId}-${maxCap}`}
              defaultValue={Math.min(4, maxCap)}
              required
            />
            <p className="text-xs text-muted-foreground">
              لا يتجاوز مقاعد المركبة ({maxCap}).
            </p>
          </div>

          <Button
            type="submit"
            disabled={pending || !pack?.vehicles.length}
            className="sm:col-span-2 bg-sky-600"
          >
            إنشاء الرحلة والمقاعد
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
