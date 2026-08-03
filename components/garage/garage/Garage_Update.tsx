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
import { Loader2, MapPin } from "lucide-react";

type Props = { garage: GarageRow };

function geolocationErrorMessage(code?: number) {
  if (code === 1) return "يرجى السماح بالوصول إلى الموقع من المتصفح";
  if (code === 2) return "تعذر الحصول على الموقع حالياً";
  if (code === 3) return "انتهت مهلة تحديد الموقع، حاول مرة أخرى";
  return "تعذر تحديث الموقع";
}

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
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      void Swal.fire({
        icon: "error",
        title: "المتصفح لا يدعم تحديد الموقع",
      });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setAddress(`${lat}, ${lng}`);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        void Swal.fire({
          icon: "error",
          title: "تعذر تحديث الموقع",
          text: geolocationErrorMessage(err.code),
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  useEffect(() => {
    if (!open) return;
    setAddress(garage.address ?? "");
    setLocating(false);
  }, [open, garage.address]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-plum/20 dark:border-orchid/30"
        >
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            تعديل الشركة السياحية
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          action={(fd) => {
            fd.set("id", garage.id);
            fd.set("address", address.trim());
            start(async () => {
              const res = await updateGarage(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم التحديث",
                  text: "تم تعديل الشركة السياحية بنجاح",
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
            <Label htmlFor={`ga-${garage.id}`}>موقع الشركة السياحية</Label>
            <div className="flex gap-2">
              <Input
                id={`ga-${garage.id}`}
                name="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="اضغط أيقونة الموقع لتحديث موقعك الحالي"
                className="flex-1"
                dir="ltr"
              />
              <button
                type="button"
                onClick={requestCurrentLocation}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-input hover:bg-muted disabled:opacity-60"
                disabled={locating || pending}
                title="أخذ/تحديث الموقع الحالي"
                aria-label="تحديث الموقع الحالي"
              >
                {locating ? (
                  <Loader2 className="h-5 w-5 animate-spin text-orchid" />
                ) : (
                  <MapPin
                    className={`h-5 w-5 ${
                      address ? "text-orchid" : "text-dusk/40"
                    }`}
                  />
                )}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!address || locating}
                onClick={() => openMap(address)}
              >
                عرض على الخريطة
              </Button>
              {locating ? (
                <span className="text-xs text-muted-foreground">
                  جارٍ تحديث الموقع...
                </span>
              ) : address ? (
                <span className="text-xs text-emerald-700">تم تحديث الموقع</span>
              ) : null}
            </div>
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
          <Button
            type="submit"
            disabled={pending || locating}
            className="w-full rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
          >
            تحديث
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
