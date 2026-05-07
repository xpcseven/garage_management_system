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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Swal from "sweetalert2";
import { MapPin } from "lucide-react";

type Props = {
  cities: CityRow[];
  vehicles: GarageTripPack["vehicles"];
};

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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">رحلة مستقلة (سائق)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-800">
            أضف مركبة باسمك من قسم المركبات لإنشاء رحلة مستقلة.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="">إضافة رحلة مستقلة</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">إنشاء رحلة مستقلة</DialogTitle>
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
          <div className="space-y-1">
            <Label htmlFor="tf-from">من</Label>
            <select
              id="tf-from"
              name="fromCityId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
          <div className="space-y-1">
            <Label htmlFor="tf-to">إلى</Label>
            <select
              id="tf-to"
              name="toCityId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="tf-veh">المركبة</Label>
            <select
              id="tf-veh"
              name="vehicleId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={vehicles[0]?.id}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>موقع السائق الحالي</Label>
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input hover:bg-muted disabled:opacity-60"
              disabled={locating}
              title="أخذ/تحديث الموقع الحالي"
            >
              <MapPin
                className={`h-5 w-5 ${
                  driverLocation ? "text-purple-600" : "text-muted-foreground"
                }`}
              />
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ms-2"
              disabled={!driverLocation}
              onClick={() => openMap(driverLocation)}
            >
              عرض على الخريطة
            </Button>
          </div>

          <div className="space-y-1">
            <Label htmlFor="tf-dep">وقت المغادرة</Label>
            <Input
              id="tf-dep"
              name="departureTime"
              type="datetime-local"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tf-price">السعر الأساسي</Label>
            <Input
              id="tf-price"
              name="basePrice"
              type="number"
              step="0.01"
              min={0}
              required
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="tf-seats">عدد المقاعد</Label>
            <Input
              id="tf-seats"
              name="maxSeats"
              type="number"
              min={1}
              max={maxCap}
              defaultValue={Math.min(4, maxCap)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="sm:col-span-2 bg-purple-600"
          >
            نشر الرحلة
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
