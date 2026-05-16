"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLandingSliderSlide } from "@/lib/actions/landing_slider.actions";
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

export default function Landing_Slider_Create() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [imageUrlValue, setImageUrlValue] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!open) {
      setImageUrlValue("");
      setUploadingImage(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>إضافة شريحة</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg">إضافة صورة للسلايدر</DialogTitle>
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
              if (imageUrlValue) fd.set("imageUrl", imageUrlValue);
              const res = await createLandingSliderSlide(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تمت الإضافة",
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
          <div className="space-y-1">
            <Label htmlFor="slide-title">العنوان</Label>
            <Input
              id="slide-title"
              name="title"
              required
              placeholder="مثال: بابل الأثرية"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="slide-sort">ترتيب العرض (اختياري)</Label>
            <Input
              id="slide-sort"
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={0}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slide-file">الصورة</Label>
            <Input
              id="slide-file"
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
            {imageUrlValue ? (
              <p className="text-xs text-green-600">تم رفع الصورة بنجاح</p>
            ) : null}
          </div>

          <Button type="submit" disabled={pending || uploadingImage}>
            حفظ
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
