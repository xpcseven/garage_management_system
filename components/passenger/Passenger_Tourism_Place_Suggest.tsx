"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { suggestTourismPlaceByPassenger } from "@/lib/actions/tourism_places.actions";
import { IRAQI_GOVERNORATES } from "@/lib/constants/iraqi-governorates";
import { MAX_TOURISM_PLACE_IMAGES } from "@/lib/tourism-place-images";
import Tourism_Place_Images_Upload, {
  appendPlaceImagesToFormData,
  type PlaceImageItem,
} from "@/components/Tourism_Places/Tourism_Place_Images_Upload";
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
import { loginWithCallback } from "@/routes";
import Swal from "sweetalert2";

type Props = {
  isLoggedIn: boolean;
  callbackPath?: string;
  triggerClassName?: string;
  triggerLabel?: string;
};

export default function Passenger_Tourism_Place_Suggest({
  isLoggedIn,
  callbackPath = "/passenger/tourism-places",
  triggerClassName,
  triggerLabel = "أضف مكاناً زرته",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [locationValue, setLocationValue] = useState("");
  const [imageItems, setImageItems] = useState<PlaceImageItem[]>([]);

  useEffect(() => {
    if (!open) {
      setImageItems([]);
      setLocationValue("");
    }
  }, [open]);

  if (!isLoggedIn) {
    return (
      <Button
        asChild
        className={
          triggerClassName ??
          "rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
        }
      >
        <Link href={loginWithCallback(callbackPath)}>{triggerLabel}</Link>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={
            triggerClassName ??
            "rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
          }
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            اقترح مكاناً سياحياً
          </DialogTitle>
        </DialogHeader>
        <p className="text-start text-sm leading-7 text-dusk/65 dark:text-muted-foreground">
          شارك مكاناً زرته مع صوره ووصفه. سيظهر للعامة بعد موافقة إدارة المنصة.
        </p>

        <form
          className="mt-2 grid gap-3 text-start"
          onSubmit={(e) => {
            e.preventDefault();
            if (imageItems.length === 0) {
              void Swal.fire({
                icon: "error",
                title: "الصور مطلوبة",
                text: `أضف من صورة إلى ${MAX_TOURISM_PLACE_IMAGES} صور`,
              });
              return;
            }
            const fd = new FormData(e.currentTarget);
            appendPlaceImagesToFormData(fd, imageItems);
            const savedUrls = imageItems
              .map((i) => i.url)
              .filter(Boolean) as string[];

            start(async () => {
              const res = await suggestTourismPlaceByPassenger(fd, savedUrls);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم إرسال الاقتراح",
                  text: "مكانك بانتظار موافقة السوبر أدمن قبل ظهوره للعامة.",
                  confirmButtonText: "موافق",
                });
              } else {
                await Swal.fire({
                  icon: "error",
                  title: "تعذر الإرسال",
                  text: res.error,
                });
              }
            });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="sug-name">اسم المكان</Label>
            <Input id="sug-name" name="name" required placeholder="مثال: قلعة أربيل" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sug-gov">المحافظة</Label>
            <select
              id="sug-gov"
              name="governorate"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                — اختر المحافظة —
              </option>
              {IRAQI_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sug-desc">وصف المكان / تجربتك</Label>
            <textarea
              id="sug-desc"
              name="description"
              required
              rows={4}
              placeholder="ماذا أعجبك؟ كيف تصل إليه؟ نصائح للزوار…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sug-address">العنوان (اختياري)</Label>
            <Input id="sug-address" name="address" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sug-location">موقع على الخريطة (اختياري)</Label>
            <Input
              id="sug-location"
              name="location"
              value={locationValue}
              onChange={(e) => setLocationValue(e.target.value)}
              placeholder="إحداثيات أو رابط Google Maps"
            />
          </div>

          <Tourism_Place_Images_Upload
            idPrefix="sug"
            items={imageItems}
            onChange={setImageItems}
            disabled={pending}
            maxImages={MAX_TOURISM_PLACE_IMAGES}
          />

          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl border-0 bg-plum text-white hover:bg-plum-light"
          >
            {pending ? "جاري الإرسال…" : "إرسال للمراجعة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
