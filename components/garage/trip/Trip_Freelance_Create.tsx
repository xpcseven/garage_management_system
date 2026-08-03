"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CityRow } from "@/lib/actions/city.actions";
import type { GarageTripPack } from "@/lib/actions/trip.actions";
import { createFreelanceTrip } from "@/lib/actions/trip.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Swal from "sweetalert2";
import { MapPin } from "lucide-react";

type Props = {
  cities: CityRow[];
  vehicles: GarageTripPack["vehicles"];
};

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground";

export default function Trip_Freelance_Create({ cities, vehicles }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [driverLocation, setDriverLocation] = useState("");
  const [locating, setLocating] = useState(false);
  const maxCap = vehicles[0]?.totalSeats ?? 1;

  function openMap(coords: string) {
    const [lat, lng] = coords.split(",").map((v) => v.trim());
    if (!lat || !lng) return;
    window.open(
      `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function requestCurrentLocation() {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const coords = `${lat}, ${lng}`;
        setDriverLocation(coords);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="rounded-[1.75rem] bg-white p-5 ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20 sm:p-6">
        <h3 className="font-display text-lg text-dusk dark:text-foreground">
          رحلة مستقلة (سائق)
        </h3>
        <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
          أضف مركبة باسمك من قسم المركبات لإنشاء رحلة مستقلة.
        </p>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light">
          إضافة رحلة مستقلة
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            إنشاء رحلة مستقلة
          </DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3 sm:grid-cols-2"
          action={(fd) => {
            start(async () => {
              const res = await createFreelanceTrip(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تمت الإضافة",
                  text: "تم إنشاء الرحلة المستقلة بنجاح",
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
          <div className="space-y-1.5">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor="tf-from"
            >
              من
            </Label>
            <select
              id="tf-from"
              name="fromCityId"
              required
              className={fieldClass}
              defaultValue=""
            >
              <option value="" disabled>
                — اختر —
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.region ? ` — ${c.region}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor="tf-to"
            >
              إلى
            </Label>
            <select
              id="tf-to"
              name="toCityId"
              required
              className={fieldClass}
              defaultValue=""
            >
              <option value="" disabled>
                — اختر —
              </option>
              {cities.map((c) => (
                <option key={`t-${c.id}`} value={c.id}>
                  {c.name}
                  {c.region ? ` — ${c.region}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor="tf-veh"
            >
              المركبة
            </Label>
            <select
              id="tf-veh"
              name="vehicleId"
              required
              className={fieldClass}
              defaultValue={vehicles[0]?.id}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              موقع السائق الحالي
            </Label>
            <input
              type="hidden"
              id="tf-location"
              name="driverLocation"
              required
              value={driverLocation}
            />
            <button
              type="button"
              onClick={requestCurrentLocation}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-plum/15 bg-white hover:bg-mist disabled:opacity-60 dark:border-orchid/25 dark:bg-background dark:hover:bg-muted"
              disabled={locating}
              title="أخذ/تحديث الموقع الحالي"
            >
              <MapPin
                className={`h-5 w-5 ${
                  driverLocation ? "text-orchid" : "text-dusk/40 dark:text-muted-foreground"
                }`}
              />
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ms-2 rounded-xl border-plum/20 dark:border-orchid/30"
              disabled={!driverLocation}
              onClick={() => openMap(driverLocation)}
            >
              عرض على الخريطة
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor="tf-dep"
            >
              وقت المغادرة
            </Label>
            <Input
              id="tf-dep"
              name="departureTime"
              type="datetime-local"
              required
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor="tf-price"
            >
              السعر الأساسي
            </Label>
            <Input
              id="tf-price"
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
              htmlFor="tf-seats"
            >
              عدد المقاعد
            </Label>
            <Input
              id="tf-seats"
              name="maxSeats"
              type="number"
              min={1}
              max={maxCap}
              defaultValue={Math.min(4, maxCap)}
              required
              className={fieldClass}
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="sm:col-span-2 rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light"
          >
            نشر الرحلة
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
