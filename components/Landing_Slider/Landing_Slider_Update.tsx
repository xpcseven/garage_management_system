"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LandingSliderSlideRow } from "@/lib/actions/landing_slider.actions";
import { updateLandingSliderSlide } from "@/lib/actions/landing_slider.actions";
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
  slide: LandingSliderSlideRow;
};

export default function Landing_Slider_Update({ slide }: Props) {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-8 w-8 rounded-full bg-black/45 text-white hover:bg-black/65"
        >
          ✏️
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg">تعديل شريحة السلايدر</DialogTitle>
        </DialogHeader>

        <form
          className="grid gap-4"
          action={(fd) => {
            start(async () => {
              if (uploadingImage) {
                await Swal.fire({
                  toast: true,
                  position: "top-end",
                  icon: "info",
                  title: "جارٍ رفع الصورة...",
                  showConfirmButton: false,
                  timer: 2000,
                });
                return;
              }
              fd.set("id", slide.id);
              if (imageUrlValue) fd.set("imageUrl", imageUrlValue);
              const res = await updateLandingSliderSlide(fd);
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
            <Label htmlFor={`title-${slide.id}`}>العنوان</Label>
            <Input
              id={`title-${slide.id}`}
              name="title"
              required
              defaultValue={slide.title}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor={`sort-${slide.id}`}>ترتيب العرض</Label>
            <Input
              id={`sort-${slide.id}`}
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={slide.sortOrder}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor={`active-${slide.id}`}>الحالة</Label>
            <select
              id={`active-${slide.id}`}
              name="isActive"
              defaultValue={slide.isActive ? "true" : "false"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="true">نشطة في الصفحة الرئيسية</option>
              <option value="false">مخفية</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`file-${slide.id}`}>صورة جديدة (اختياري)</Label>
            <Input
              id={`file-${slide.id}`}
              name="file"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingImage(true);
                const fd = new FormData();
                fd.set("file", file);
                try {
                  const result = await uploadImage(fd);
                  setImageUrlValue(result.path);
                } catch {
                  await Swal.fire({
                    icon: "error",
                    title: "فشل رفع الصورة",
                    confirmButtonText: "حسناً",
                  });
                } finally {
                  setUploadingImage(false);
                }
              }}
            />
          </div>

          <Button type="submit" disabled={pending || uploadingImage}>
            حفظ التعديلات
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
