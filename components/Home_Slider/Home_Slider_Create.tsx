"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createHomeSliderSlide } from "@/lib/actions/home_slider.actions";
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
import { toDisplayImageUrl } from "@/lib/media-url";
import { uploadFileToAws } from "@/lib/client-upload";
import { S3_FOLDERS } from "@/lib/s3-folders";

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground";

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
        <Button className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light">
          إضافة شريحة
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            إضافة شريحة سلايدر
          </DialogTitle>
        </DialogHeader>

        <form
          className="grid gap-3 text-start"
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
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground" htmlFor="hs-title">
              العنوان
            </Label>
            <Input
              id="hs-title"
              name="title"
              required
              placeholder="مثال: الحضر الأثرية"
              className={fieldClass}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-dusk/60 dark:text-muted-foreground" htmlFor="hs-sort">
                ترتيب العرض
              </Label>
              <Input
                id="hs-sort"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={0}
                className={fieldClass}
              />
            </div>
            <div className="flex items-end pb-2">
              <input type="hidden" name="isActive" value="true" />
              <p className="text-sm text-dusk/55 dark:text-muted-foreground">نشطة افتراضياً</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground" htmlFor="hs-file">
              صورة الشريحة
            </Label>
            <Input
              id="hs-file"
              name="file"
              type="file"
              accept="image/*"
              className={fieldClass}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingImage(true);
                await notify("info", "جارٍ رفع الصورة إلى AWS...");
                try {
                  const { url } = await uploadFileToAws(
                    file,
                    S3_FOLDERS.homeSlider
                  );
                  setImageUrlValue(url);
                  await notify("success", "تم رفع الصورة بنجاح");
                } catch (err) {
                  console.error("S3 upload error:", err);
                  setImageUrlValue("");
                  await notify(
                    "error",
                    err instanceof Error ? err.message : "فشل رفع الصورة إلى AWS"
                  );
                } finally {
                  setUploadingImage(false);
                }
              }}
            />
            {imageUrlValue && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={toDisplayImageUrl(imageUrlValue) || imageUrlValue}
                alt=""
                className="mt-2 h-28 w-full rounded-xl object-cover ring-1 ring-plum/10 dark:ring-orchid/20"
              />
            )}
          </div>
          <input type="hidden" name="imageUrl" value={imageUrlValue} />

          <Button
            type="submit"
            disabled={pending || uploadingImage}
            className="rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white dark:bg-orchid dark:hover:bg-orchid-light"
          >
            {uploadingImage
              ? "انتظار رفع الصورة…"
              : pending
                ? "جاري الحفظ…"
                : "حفظ"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
