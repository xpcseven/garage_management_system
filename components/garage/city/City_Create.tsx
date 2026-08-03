"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCity } from "@/lib/actions/city.actions";
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

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground";

export default function City_Create() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light">
          إضافة مدينة
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            إضافة مدينة
          </DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3 text-start"
          action={(fd) => {
            start(async () => {
              const res = await createCity(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تمت الإضافة",
                  text: "تمت إضافة المدينة بنجاح",
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
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground" htmlFor="city-name">
              الاسم
            </Label>
            <Input
              id="city-name"
              name="name"
              required
              placeholder="بغداد"
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground" htmlFor="city-region">
              المنطقة (اختياري)
            </Label>
            <Input
              id="city-region"
              name="region"
              placeholder="بغداد"
              className={fieldClass}
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white dark:bg-orchid dark:hover:bg-orchid-light"
          >
            {pending ? "جاري الحفظ…" : "حفظ"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
