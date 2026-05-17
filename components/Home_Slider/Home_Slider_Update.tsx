"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { HomeSliderSlideRow } from "@/lib/actions/home_slider.actions";
import { updateHomeSliderSlide } from "@/lib/actions/home_slider.actions";
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
  slide: HomeSliderSlideRow;
  iconOnly?: boolean;
};

export default function Home_Slider_Update({ slide, iconOnly = false }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [imageUrlValue, setImageUrlValue] = useState(slide.imageUrl);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!open) {
      setImageUrlValue(slide.imageUrl);
      setUploadingImage(false);
    }
  }, [open, slide.imageUrl]);

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
          className={
            iconOnly
              ? "h-8 w-8 rounded-full bg-black/45 text-white hover:bg-black/65"
              : ""
          }
        >
          {iconOnly ? "✏️" : "تعديل"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">تعديل شريحة السلايدر</DialogTitle>
        </DialogHeader>

        <form
          className="grid gap-4"
          action={(fd) => {
            start(async () => {
              if (uploadingImage) {
                await notify("info", "جارٍ رفع الصورة... يرجى الانتظار");
                return;
              }
              const res = await updateHomeSliderSlide(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم التحديث",
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
          <input type="hidden" name="id" value={slide.id} />

          <div className="space-y-1">
            <Label htmlFor={`hs-title-${slide.id}`}>العنوان</Label>
            <Input
              id={`hs-title-${slide.id}`}
              name="title"
              required
              defaultValue={slide.title}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`hs-sort-${slide.id}`}>ترتيب العرض</Label>
              <Input
                id={`hs-sort-${slide.id}`}
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={slide.sortOrder}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`hs-active-${slide.id}`}>الحالة</Label>
              <select
                id={`hs-active-${slide.id}`}
                name="isActive"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue={slide.isActive ? "true" : "false"}
              >
                <option value="true">نشطة</option>
                <option value="false">مخفية</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor={`hs-file-${slide.id}`}>تغيير الصورة (اختياري)</Label>
            <Input
              id={`hs-file-${slide.id}`}
              name="file"
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
            {imageUrlValue && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrlValue}
                alt={slide.title}
                className="mt-2 h-24 w-full rounded-lg object-cover"
              />
            )}
          </div>
          <input type="hidden" name="imageUrl" value={imageUrlValue} />

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={pending || uploadingImage}>
              {uploadingImage ? "انتظار رفع الصورة..." : "حفظ التعديلات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
