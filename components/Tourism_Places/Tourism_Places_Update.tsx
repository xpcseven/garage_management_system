"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import { updateTourismPlace } from "@/lib/actions/tourism_places.actions";
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

type Props = {
  place: TourismPlaceRow;
  iconOnly?: boolean;
};

export default function Tourism_Places_Update({ place, iconOnly = false }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [locationValue, setLocationValue] = useState(place.location ?? "");
  const [locating, setLocating] = useState(false);
  const [imageUrlValue, setImageUrlValue] = useState(place.imageUrl ?? "");
  const [uploadingImage, setUploadingImage] = useState(false);

  const defaultGovernorate = useMemo(
    () => place.governorate ?? "",
    [place.governorate]
  );

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
    if (!open) setLocationValue(place.location ?? "");
  }, [open, place.location]);

  useEffect(() => {
    if (!open) {
      setImageUrlValue(place.imageUrl ?? "");
      setUploadingImage(false);
    }
  }, [open, place.imageUrl]);

  const notify = async (icon: "success" | "error" | "info", title: string) => {
    await Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2200,
      timerProgressBar: true,
      icon,
      title,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={iconOnly ? "secondary" : "outline"}
          size={iconOnly ? "icon" : "sm"}
          className={iconOnly ? "h-8 w-8 rounded-full bg-black/45 text-white hover:bg-black/65" : ""}
        >
          {iconOnly ? "✏️" : "تعديل"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">تعديل مكان سياحي</DialogTitle>
        </DialogHeader>

        <form
          className="grid gap-4"
          action={(fd) => {
            start(async () => {
              if (uploadingImage) {
                await notify("info", "جارٍ رفع الصورة... يرجى الانتظار");
                return;
              }
              fd.set("id", place.id);
              const res = await updateTourismPlace(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم التحديث",
                  text: "تم تحديث المكان بنجاح",
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`tp-name-${place.id}`}>الاسم</Label>
              <Input
                id={`tp-name-${place.id}`}
                name="name"
                required
                defaultValue={place.name}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor={`tp-governorate-${place.id}`}>
                المحافظة (العراق)
              </Label>
              <select
                id={`tp-governorate-${place.id}`}
                name="governorate"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={defaultGovernorate}
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
              <Label htmlFor={`tp-address-${place.id}`}>العنوان (اختياري)</Label>
              <Input
                id={`tp-address-${place.id}`}
                name="address"
                defaultValue={place.address ?? ""}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`tp-location-${place.id}`}>
                الموقع Location (اختياري)
              </Label>
              <Input
                id={`tp-location-${place.id}`}
                name="location"
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
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
              <Label htmlFor={`tp-file-${place.id}`}>تغيير الصورة (اختياري)</Label>
              <Input
                id={`tp-file-${place.id}`}
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
                    await notify("error", "فشل رفع الصورة");
                  } finally {
                    setUploadingImage(false);
                  }
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>الصورة الحالية</Label>
              {imageUrlValue ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrlValue}
                  alt={place.name}
                  className="h-20 w-full rounded-md border object-cover"
                />
              ) : (
                <div className="h-20 w-full rounded-md border bg-muted/30 text-xs text-muted-foreground flex items-center justify-center">
                  لا توجد صورة حالياً
                </div>
              )}
            </div>
          </div>
          <input type="hidden" name="imageUrl" value={imageUrlValue} />

          <div className="space-y-1">
            <Label htmlFor={`tp-desc-${place.id}`}>الوصف (اختياري)</Label>
            <textarea
              id={`tp-desc-${place.id}`}
              name="description"
              className="min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              defaultValue={place.description ?? ""}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`tp-active-${place.id}`}>الحالة</Label>
              <select
                id={`tp-active-${place.id}`}
                name="isActive"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={place.isActive ? "true" : "false"}
              >
                <option value="true">نشط</option>
                <option value="false">موقوف</option>
              </select>
            </div>
            <div className="flex items-end justify-end gap-2">
              <Button type="submit" disabled={pending || uploadingImage} className="">
                {uploadingImage ? "انتظار رفع الصورة..." : "حفظ"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}