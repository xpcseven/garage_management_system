"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { HomeSliderImageRow } from "@/lib/actions/home_slider.actions";
import { updateHomeSliderImage } from "@/lib/actions/home_slider.actions";
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
  slide: HomeSliderImageRow;
};

export default function Home_Slider_Update({ slide }: Props) {
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
    if (!open) {
      setImageUrlValue(slide.imageUrl);
      setUploadingImage(false);
    }
  }, [open, slide.imageUrl]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          تعديل
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
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

              fd.set("id", slide.id);
              const res = await updateHomeSliderImage(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم التحديث",
                  text: "تم تحديث صورة السلايدر بنجاح",
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
              <Label htmlFor={`hs-title-${slide.id}`}>عنوان الصورة</Label>
              <Input
                id={`hs-title-${slide.id}`}
                name="title"
                required
                defaultValue={slide.title}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor={`hs-order-${slide.id}`}>ترتيب الظهور</Label>
              <Input
                id={`hs-order-${slide.id}`}
                name="sortOrder"
                type="number"
                min="0"
                defaultValue={slide.sortOrder}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`hs-file-${slide.id}`}>تغيير الصورة</Label>
              <Input
                id={`hs-file-${slide.id}`}
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
              <Label htmlFor={`hs-active-${slide.id}`}>الحالة</Label>
              <select
                id={`hs-active-${slide.id}`}
                name="isActive"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={slide.isActive ? "true" : "false"}
              >
                <option value="true">نشطة</option>
                <option value="false">مخفية</option>
              </select>
            </div>
          </div>

          <input type="hidden" name="imageUrl" value={imageUrlValue} />

          <div className="space-y-1">
            <Label>الصورة الحالية</Label>
            {imageUrlValue ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrlValue}
                alt={slide.title}
                className="h-48 w-full rounded-lg border object-cover"
              />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                لا توجد صورة حالياً
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={pending || uploadingImage}>
              {uploadingImage ? "انتظار رفع الصورة..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
