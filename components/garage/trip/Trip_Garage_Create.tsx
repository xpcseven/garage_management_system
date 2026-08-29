"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CityRow } from "@/lib/actions/city.actions";
import type { GarageTripPack } from "@/lib/actions/trip.actions";
import { createGarageTrip } from "@/lib/actions/trip.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import City_Route_Search_Select from "@/components/Shared/City_Route_Search_Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Swal from "sweetalert2";

type Props = {
  cities: CityRow[];
  garagePacks: GarageTripPack[];
};

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground";

export default function Trip_Garage_Create({ cities, garagePacks }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
      <div className="rounded-[1.75rem] bg-white p-5 ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20 sm:p-6">
        <h3 className="font-display text-lg text-dusk dark:text-foreground">
          رحلة باسم الشركة السياحية
        </h3>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
          لا توجد شركة سياحية نشطة. أنشئ شركة سياحية ومركبات مرتبطة بها أولاً.
        </p>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light">
          إضافة رحلة للشركة السياحية
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            إنشاء رحلة للشركة السياحية
          </DialogTitle>
        </DialogHeader>
        <p className="pt-1 text-start text-sm font-normal text-dusk/60 dark:text-muted-foreground">
          حدّد وجهة السفر: نقطة الانطلاق (من) ونقطة الوصول (إلى) — يجب أن تكونا
          مختلفتين.
        </p>
        <form
          className="grid gap-3 sm:grid-cols-2"
          action={(fd) => {
            fd.set("garageId", garageId);
            start(async () => {
              const res = await createGarageTrip(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تمت الإضافة",
                  text: "تم إنشاء الرحلة بنجاح",
                  confirmButtonText: "موافق",
                });
              } else {
                await Swal.fire({
                  icon: "error",
                  title: "تعذر الإضافة",
                  text: res.error,
                  confirmButtonText: "حسناً",
                });
              }
            });
          }}
        >
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              الشركة السياحية
            </Label>
            <select
              value={garageId}
              onChange={(e) => setGarageId(e.target.value)}
              className={fieldClass}
            >
              {garagePacks.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 rounded-2xl bg-mist/70 p-4 ring-1 ring-plum/10 dark:bg-background dark:ring-orchid/15 sm:col-span-2">
            <p className="text-sm font-semibold text-orchid dark:text-orchid-light">
              وجهة السفر (مطلوب)
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  className="text-xs text-dusk/60 dark:text-muted-foreground"
                  htmlFor="tg-from"
                >
                  من — نقطة الانطلاق
                </Label>
                <City_Route_Search_Select
                  id="tg-from"
                  name="fromCityId"
                  cities={cities}
                  required
                  className={fieldClass}
                  placeholder="ابحث عن دولة أو محافظة أو مدينة…"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  className="text-xs text-dusk/60 dark:text-muted-foreground"
                  htmlFor="tg-to"
                >
                  إلى — نقطة الوصول
                </Label>
                <City_Route_Search_Select
                  id="tg-to"
                  name="toCityId"
                  cities={cities}
                  required
                  className={fieldClass}
                  placeholder="ابحث عن دولة أو محافظة أو مدينة…"
                />
              </div>
            </div>
            {cities.length === 0 && (
              <p className="text-xs text-amber-800 dark:text-amber-200">
                لا توجد مدن في النظام. يطلب المشرف إضافة مدن من قسم «المدن» حتى
                تستطيع تحديد من وإلى.
              </p>
            )}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor="tg-veh"
            >
              المركبة
            </Label>
            <select
              id="tg-veh"
              name="vehicleId"
              required
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className={fieldClass}
            >
              {(pack?.vehicles ?? []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor="tg-drv"
            >
              السائق
            </Label>
            <select
              id="tg-drv"
              name="driverId"
              required
              key={`d-${garageId}`}
              className={fieldClass}
              defaultValue={pack?.drivers[0]?.id ?? ""}
            >
              {(pack?.drivers ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor="tg-dep"
            >
              وقت المغادرة
            </Label>
            <Input
              id="tg-dep"
              name="departureTime"
              type="datetime-local"
              required
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor="tg-price"
            >
              السعر الأساسي
            </Label>
            <Input
              id="tg-price"
              name="basePrice"
              type="number"
              step="0.01"
              min={0}
              required
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor="tg-seats"
            >
              عدد المقاعد المعروضة
            </Label>
            <Input
              id="tg-seats"
              name="maxSeats"
              type="number"
              min={1}
              max={maxCap}
              key={`${garageId}-${vehicleId}-${maxCap}`}
              defaultValue={Math.min(4, maxCap)}
              required
              className={fieldClass}
            />
            <p className="text-xs text-dusk/50 dark:text-muted-foreground">
              لا يتجاوز مقاعد المركبة ({maxCap}).
            </p>
          </div>

          <Button
            type="submit"
            disabled={pending || !pack?.vehicles.length}
            className="sm:col-span-2 rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light"
          >
            إنشاء الرحلة والمقاعد
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
