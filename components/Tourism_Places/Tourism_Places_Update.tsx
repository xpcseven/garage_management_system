"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import { updateTourismPlace } from "@/lib/actions/tourism_places.actions";
import type { CityRow } from "@/lib/actions/city.actions";
import City_Country_Select_Fields from "@/components/Shared/City_Country_Select_Fields";
import Tourism_Place_Images_Upload, {
  appendPlaceImagesToFormData,
  type PlaceImageItem,
} from "./Tourism_Place_Images_Upload";
import { toDisplayImageUrl } from "@/lib/media-url";

function placeToImageItems(place: TourismPlaceRow): PlaceImageItem[] {
  const urls =
    place.images?.length > 0
      ? place.images
      : place.imageUrl
        ? [place.imageUrl]
        : [];
  return urls.map((url) => ({
    preview: toDisplayImageUrl(url) || url,
    url,
  }));
}
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
  cities: CityRow[];
};

export default function Tourism_Places_Update({ place, cities }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [locationValue, setLocationValue] = useState(place.location ?? "");
  const [locating, setLocating] = useState(false);
  const [imageItems, setImageItems] = useState<PlaceImageItem[]>(() =>
    placeToImageItems(place)
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
      setImageItems(placeToImageItems(place));
    }
  }, [open, place]);

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
          variant="outline"
          size="sm"
          className="rounded-xl border-plum/20 dark:border-orchid/30"
        >
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            تعديل مكان سياحي
          </DialogTitle>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            fd.set("id", place.id);
            appendPlaceImagesToFormData(fd, imageItems);
            const savedUrls = imageItems
              .map((i) => i.url)
              .filter((u): u is string => !!u);

            start(async () => {
              const res = await updateTourismPlace(fd, savedUrls);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم التحديث",
                  text: "تم تحديث المكان والصور بنجاح",
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
          <div className="space-y-1">
            <Label htmlFor={`tp-name-${place.id}`}>الاسم</Label>
            <Input
              id={`tp-name-${place.id}`}
              name="name"
              required
              defaultValue={place.name}
            />
          </div>

          <City_Country_Select_Fields
            cities={cities}
            idPrefix={`tp-${place.id}`}
            defaultCityId={place.cityId}
            defaultCountry={place.country}
            cityRequired
            countryRequired
          />

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

          <Tourism_Place_Images_Upload
            items={imageItems}
            onChange={setImageItems}
            disabled={pending}
            idPrefix={`tp-edit-${place.id}`}
          />

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
              <Button type="submit" disabled={pending}>
                {pending ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}