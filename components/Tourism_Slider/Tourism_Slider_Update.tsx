"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TourismSliderSlideRow } from "@/lib/actions/tourism_slider.actions";
import { updateTourismSliderSlide } from "@/lib/actions/tourism_slider.actions";
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
  slide: TourismSliderSlideRow;
  iconOnly?: boolean;
};

export default function Tourism_Slider_Update({ slide, iconOnly = false }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [imageUrlValue, setImageUrlValue] = useState(slide.imageUrl);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  useEffect(() => {
    if (open) setImageUrlValue(slide.imageUrl);
    else setUploadingImage(false);
  }, [open, slide.imageUrl]);

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
          <DialogTitle className="text-lg">تعديل صورة السلايدر</DialogTitle>
        </DialogHeader>

        <form
          className="grid gap-4"
          action={(fd) => {
            start(async () => {
              if (uploadingImage) {
                await notify("info", "جارٍ رفع الصورة... يرجى الانتظار");
                return;
              }
              if (!imageUrlValue.trim()) {
                await Swal.fire({
                  icon: "warning",
                  title: "الصورة مطلوبة",
                  text: "يرجى الإبقاء على صورة صالحة أو رفع صورة جديدة قبل الحفظ",
                  confirmButtonText: "حسناً",
                });
                return;
              }
              fd.set("id", slide.id);
              const res = await updateTourismSliderSlide(fd);
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
          <div className="space-y-1">
            <Label htmlFor={`ts-title-${slide.id}`}>العنوان</Label>
            <Input
              id={`ts-title-${slide.id}`}
              name="title"
              required
              defaultValue={slide.title}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`ts-sort-${slide.id}`}>ترتيب العرض</Label>
              <Input
                id={`ts-sort-${slide.id}`}
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={slide.sortOrder}
              />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <input
                id={`ts-active-${slide.id}`}
                name="isActive"
                type="checkbox"
                defaultChecked={slide.isActive}
                className="h-4 w-4"
              />
              <Label htmlFor={`ts-active-${slide.id}`}>نشط في السلايدر</Label>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`ts-file-${slide.id}`}>تغيير الصورة (اختياري)</Label>
              <Input
                id={`ts-file-${slide.id}`}
                type="file"
                accept="image/*"
                disabled={uploadingImage}
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
                  alt={slide.title}
                  className="h-20 w-full rounded-md border object-cover"
                />
              ) : (
                <div className="flex h-20 w-full items-center justify-center rounded-md border bg-muted/30 text-xs text-muted-foreground">
                  لا توجد صورة حالياً
                </div>
              )}
            </div>
          </div>
          <input type="hidden" name="imageUrl" value={imageUrlValue} />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={pending || uploadingImage || !imageUrlValue.trim()}
            >
              {uploadingImage ? "انتظار رفع الصورة..." : "حفظ التعديل"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
