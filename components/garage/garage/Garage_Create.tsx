"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGarage } from "@/lib/actions/garage.actions";
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
import { UserRole } from "@/prisma/UserRole.enum";
import Swal from "sweetalert2";
import { Loader2, MapPin } from "lucide-react";

type Props = { role: string };

function geolocationErrorMessage(code?: number) {
  if (code === 1) return "يرجى السماح بالوصول إلى الموقع من المتصفح";
  if (code === 2) return "تعذر الحصول على الموقع حالياً";
  if (code === 3) return "انتهت مهلة تحديد الموقع، حاول مرة أخرى";
  return "تعذر تحديث الموقع";
}

export default function Garage_Create({ role }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [address, setAddress] = useState("");
  const [locating, setLocating] = useState(false);
  const showOwnerField = role === UserRole.SUPER_ADMIN;

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

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setAddress("");
          setLocating(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="">إضافة شركة سياحية</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">إضافة شركة سياحية</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4 sm:grid-cols-2"
          action={(fd) => {
            fd.set("address", address.trim());
            start(async () => {
              const res = await createGarage(fd);
              if (res.success) {
                setOpen(false);
                setAddress("");
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تمت الإضافة",
                  text: "تم إنشاء الشركة السياحية بنجاح",
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
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="g-name">اسم الشركة السياحية</Label>
            <Input id="g-name" name="name" required />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="g-desc">الوصف</Label>
            <Input id="g-desc" name="description" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="g-phone">الهاتف</Label>
            <Input id="g-phone" name="phone" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="g-address">موقع الشركة السياحية</Label>
            <div className="flex gap-2">
              <Input
                id="g-address"
                name="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="اضغط أيقونة الموقع لأخذ موقعك الحالي"
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
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                ) : (
                  <MapPin
                    className={`h-5 w-5 ${
                      address ? "text-purple-600" : "text-muted-foreground"
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
          {showOwnerField && (
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="g-owner">معرّف مالك الشركة السياحية (UUID)</Label>
              <Input
                id="g-owner"
                name="ownerId"
                placeholder="اتركه فارغاً لاستخدام حسابك"
              />
            </div>
          )}
          <Button
            type="submit"
            disabled={pending || locating}
            className="sm:col-span-2 w-full sm:w-auto"
          >
            حفظ
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
