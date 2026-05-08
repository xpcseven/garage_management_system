"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTourismPlace } from "@/lib/actions/tourism_places.actions";
import { IRAQI_GOVERNORATES } from "@/lib/constants/iraqi-governorates";
import { uploadImage } from "@/lib/uploadImage";
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

export default function Tourism_Places_Create() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [locationValue, setLocationValue] = useState("");
  const [locating, setLocating] = useState(false);
  const [imageUrlValue, setImageUrlValue] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const notify = async (icon: "success" | "error" | "info", title: string) => {
    const r = await Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true,
      icon,
      title,
    });
    return r;
  };

  const detectCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationValue(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (open && !locationValue) detectCurrentLocation();
  }, [open, locationValue]);

  useEffect(() => {
    if (!open) {
      setImageUrlValue("");
      setUploadingImage(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="">إضافة مكان سياحي</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">إضافة مكان سياحي</DialogTitle>
        </DialogHeader>

        <form
          className="grid gap-4"
          action={(fd) => {
            start(async () => {
              if (uploadingImage) {
                await notify("info", "جارٍ رفع الصورة... يرجى الانتظار");
                return;
              }
              const res = await createTourismPlace(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                if (res.pendingApproval) {
                  await Swal.fire({
                    icon: "info",
                    title: "تم إرسال الطلب",
                    text: "تمت إضافة المكان وإرساله بانتظار موافقة السوبر أدمن",
                    confirmButtonText: "موافق",
                  });
                } else {
                  await Swal.fire({
                    icon: "success",
                    title: "تمت الإضافة",
                    text: "تمت إضافة المكان بنجاح",
                    confirmButtonText: "موافق",
                  });
                }
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="tp-name">الاسم</Label>
              <Input id="tp-name" name="name" required placeholder="شلال..." />
            </div>

            <div className="space-y-1">
              <Label htmlFor="tp-governorate">المحافظة (العراق)</Label>
              <select
                id="tp-governorate"
                name="governorate"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue=""
              >
                <option value="">— اختر المحافظة —</option>
                {IRAQI_GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="tp-address">العنوان (اختياري)</Label>
              <Input id="tp-address" name="address" placeholder="العنوان..." />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tp-location">الموقع Location (اختياري)</Label>
              <Input
                id="tp-location"
                name="location"
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
                placeholder="Baghdad, Iraq أو رابط Google Maps"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={detectCurrentLocation}
                disabled={locating || pending}
                className="mt-2"
              >
                {locating ? "جارٍ تحديد الموقع..." : "استخدام موقعي الحالي"}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="tp-file">رفع صورة (اختياري)</Label>
              <Input
                id="tp-file"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const fd = new FormData();
                  fd.set("file", file);

                  setUploadingImage(true);
                  await notify("info", "جارٍ رفع الصورة...");
                  try {
                    const result = await uploadImage(fd);
                    setImageUrlValue(result.path);
                    await notify("success", "تم رفع الصورة بنجاح");
                  } catch {
                    setImageUrlValue("");
                    await notify("error", "فشل رفع الصورة");
                  } finally {
                    setUploadingImage(false);
                  }
                }}
              />
            </div>
            <div className="hidden sm:block" />
          </div>
          <input type="hidden" name="imageUrl" value={imageUrlValue} />

          <div className="space-y-1">
            <Label htmlFor="tp-desc">الوصف (اختياري)</Label>
            <textarea
              id="tp-desc"
              name="description"
              className="min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="وصف مختصر..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={pending || uploadingImage} className="">
              {uploadingImage ? "انتظار رفع الصورة..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}