"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTourismSliderSlide } from "@/lib/actions/tourism_slider.actions";
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

export default function Tourism_Slider_Create() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [imageUrlValue, setImageUrlValue] = useState("");
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
      setImageUrlValue("");
      setUploadingImage(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>إضافة صورة للسلايدر</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">إضافة صورة للسلايدر</DialogTitle>
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
                  text: "يرجى رفع الصورة والانتظار حتى اكتمال الرفع قبل الحفظ",
                  confirmButtonText: "حسناً",
                });
                return;
              }
              const res = await createTourismSliderSlide(fd);
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
            <Label htmlFor="ts-title">العنوان</Label>
            <Input
              id="ts-title"
              name="title"
              required
              placeholder="مثال: الحضر الأثرية"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="ts-sort">ترتيب العرض</Label>
              <Input
                id="ts-sort"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={0}
              />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <input
                id="ts-active"
                name="isActive"
                type="checkbox"
                defaultChecked
                className="h-4 w-4"
              />
              <Label htmlFor="ts-active">نشط في السلايدر</Label>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="ts-file">رفع صورة</Label>
              <Input
                id="ts-file"
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
                    setImageUrlValue("");
                    await notify("error", "فشل رفع الصورة");
                  } finally {
                    setUploadingImage(false);
                  }
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>معاينة الصورة</Label>
              {imageUrlValue ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrlValue}
                  alt="معاينة"
                  className="h-20 w-full rounded-md border object-cover"
                />
              ) : (
                <div className="flex h-20 w-full items-center justify-center rounded-md border bg-muted/30 text-xs text-muted-foreground">
                  {uploadingImage ? "جارٍ الرفع..." : "لم تُرفع صورة بعد"}
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
              {uploadingImage ? "انتظار رفع الصورة..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
