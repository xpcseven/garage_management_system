"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTourismPlace } from "@/lib/actions/tourism_places.actions";
import type { CityRow } from "@/lib/actions/city.actions";
import City_Country_Select_Fields from "@/components/Shared/City_Country_Select_Fields";
import Tourism_Place_Images_Upload, {
  appendPlaceImagesToFormData,
  type PlaceImageItem,
} from "./Tourism_Place_Images_Upload";
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
  cities: CityRow[];
};

export default function Tourism_Places_Create({ cities }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [locationValue, setLocationValue] = useState("");
  const [locating, setLocating] = useState(false);
  const [imageItems, setImageItems] = useState<PlaceImageItem[]>([]);

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

  const detectCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationValue(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (open && !locationValue) detectCurrentLocation();
  }, [open, locationValue]);

  useEffect(() => {
    if (!open) {
      setImageItems([]);
      setLocationValue("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light">
          إضافة مكان سياحي
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            إضافة مكان سياحي
          </DialogTitle>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            appendPlaceImagesToFormData(fd, imageItems);
            const savedUrls = imageItems
              .map((i) => i.url)
              .filter(Boolean) as string[];

            start(async () => {
              const res = await createTourismPlace(fd, savedUrls);
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
                    text: "تمت إضافة المكان والصور بنجاح",
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
          <div className="space-y-1">
            <Label htmlFor="tp-name">الاسم</Label>
            <Input id="tp-name" name="name" required placeholder="شلال..." />
          </div>

          <City_Country_Select_Fields
            cities={cities}
            idPrefix="tp"
            cityRequired
            countryRequired
          />

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

          <Tourism_Place_Images_Upload
            items={imageItems}
            onChange={setImageItems}
            disabled={pending}
            idPrefix="tp-create"
          />

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
            <Button type="submit" disabled={pending}>
              {pending ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
