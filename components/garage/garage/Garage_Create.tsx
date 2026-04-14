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
import { MapPin } from "lucide-react";

type Props = { role: string };

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sky-600">إضافة كراج</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">إضافة كراج</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-4 sm:grid-cols-2"
          action={(fd) => {
            start(async () => {
              const res = await createGarage(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تمت الإضافة",
                  text: "تم إنشاء الكراج بنجاح",
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
            <Label htmlFor="g-name">اسم الكراج</Label>
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
                  address ? "text-sky-600" : "text-muted-foreground"
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
          {showOwnerField && (
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="g-owner">معرّف مالك الكراج (UUID)</Label>
              <Input
                id="g-owner"
                name="ownerId"
                placeholder="اتركه فارغاً لاستخدام حسابك"
              />
            </div>
          )}
          <Button
            type="submit"
            disabled={pending}
            className="sm:col-span-2 bg-sky-600 w-full sm:w-auto"
          >
            حفظ
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
