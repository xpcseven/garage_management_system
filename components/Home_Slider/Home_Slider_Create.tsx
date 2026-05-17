"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createHomeSliderSlide } from "@/lib/actions/home_slider.actions";
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

export default function Home_Slider_Create() {
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
        <Button>إضافة شريحة للسلايدر</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">إضافة شريحة سلايدر</DialogTitle>
        </DialogHeader>

        <form
          className="grid gap-4"
          action={(fd) => {
            start(async () => {
              if (uploadingImage) {
                await notify("info", "جارٍ رفع الصورة... يرجى الانتظار");
                return;
              }
              const res = await createHomeSliderSlide(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تمت الإضافة",
                  text: "تمت إضافة الشريحة بنجاح",
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
            <Label htmlFor="hs-title">العنوان</Label>
            <Input
              id="hs-title"
              name="title"
              required
              placeholder="مثال: الحضر الأثرية"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="hs-sort">ترتيب العرض</Label>
              <Input
                id="hs-sort"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={0}
              />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <input type="hidden" name="isActive" value="true" />
              <span className="text-sm text-muted-foreground">نشطة افتراضياً</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="hs-file">صورة الشريحة</Label>
            <Input
              id="hs-file"
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
                  setImageUrlValue("");
                  await notify("error", "فشل رفع الصورة");
                } finally {
                  setUploadingImage(false);
                }
              }}
            />
          </div>
          <input type="hidden" name="imageUrl" value={imageUrlValue} />

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
