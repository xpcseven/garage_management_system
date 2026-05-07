"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { GarageRow } from "@/lib/actions/garage.actions";
import { updateGarage } from "@/lib/actions/garage.actions";
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

type Props = { garage: GarageRow };

export default function Garage_Update({ garage }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [address, setAddress] = useState(garage.address ?? "");
  const [locating, setLocating] = useState(false);

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
        setAddress(coords);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  useEffect(() => {
    if (!open) return;
    const initial = garage.address ?? "";
    setAddress(initial);
  }, [open, garage.address]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل الكراج</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          action={(fd) => {
            fd.set("id", garage.id);
            start(async () => {
              const res = await updateGarage(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم التحديث",
                  text: "تم تعديل الكراج بنجاح",
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
          <input type="hidden" name="id" value={garage.id} />
          <div className="space-y-1">
            <Label htmlFor={`gn-${garage.id}`}>الاسم</Label>
            <Input
              id={`gn-${garage.id}`}
              name="name"
              required
              defaultValue={garage.name}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`gd-${garage.id}`}>الوصف</Label>
            <Input
              id={`gd-${garage.id}`}
              name="description"
              defaultValue={garage.description ?? ""}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`gp-${garage.id}`}>الهاتف</Label>
            <Input
              id={`gp-${garage.id}`}
              name="phone"
              defaultValue={garage.phone ?? ""}
            />
          </div>
          <div className="space-y-1">
            <Label>موقع الكراج</Label>
            <input type="hidden" name="address" value={address} required />
            <button
              type="button"
              onClick={requestCurrentLocation}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input hover:bg-muted disabled:opacity-60"
              disabled={locating}
              title="أخذ/تحديث الموقع الحالي"
            >
              <MapPin
                className={`h-5 w-5 ${
                  address ? "text-purple-600" : "text-muted-foreground"
                }`}
              />
            </button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ms-2"
              disabled={!address}
              onClick={() => openMap(address)}
            >
              عرض على الخريطة
            </Button>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`gac-${garage.id}`}>الحالة</Label>
            <select
              id={`gac-${garage.id}`}
              name="isActive"
              defaultValue={garage.isActive ? "true" : "false"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="true">نشط</option>
              <option value="false">موقوف</option>
            </select>
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            تحديث
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
