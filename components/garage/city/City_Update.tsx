"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { CityRow } from "@/lib/actions/city.actions";
import { updateCity } from "@/lib/actions/city.actions";
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

type Props = { city: CityRow };

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground";

export default function City_Update({ city }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-plum/20 dark:border-orchid/30"
        >
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            تعديل المدينة
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3 text-start"
          action={(fd) => {
            fd.set("id", city.id);
            start(async () => {
              const res = await updateCity(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم التحديث",
                  text: "تم تعديل المدينة بنجاح",
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
          <input type="hidden" name="id" value={city.id} />
          <div className="space-y-1.5">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor={`country-${city.id}`}
            >
              الدولة
            </Label>
            <Input
              id={`country-${city.id}`}
              name="country"
              required
              defaultValue={city.country ?? ""}
              placeholder="العراق"
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor={`name-${city.id}`}
            >
              المدينة / المحافظة
            </Label>
            <Input
              id={`name-${city.id}`}
              name="name"
              required
              defaultValue={city.name}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor={`region-${city.id}`}
            >
              المنطقة (اختياري)
            </Label>
            <Input
              id={`region-${city.id}`}
              name="region"
              defaultValue={city.region ?? ""}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              className="text-xs text-dusk/60 dark:text-muted-foreground"
              htmlFor={`active-${city.id}`}
            >
              الحالة
            </Label>
            <select
              id={`active-${city.id}`}
              name="isActive"
              defaultValue={city.isActive ? "true" : "false"}
              className={fieldClass}
            >
              <option value="true">نشطة</option>
              <option value="false">موقوفة</option>
            </select>
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white dark:bg-orchid dark:hover:bg-orchid-light"
          >
            {pending ? "جاري التحديث…" : "تحديث"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
