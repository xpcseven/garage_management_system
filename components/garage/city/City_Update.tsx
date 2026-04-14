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

export default function City_Update({ city }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل المدينة</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
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
          <div className="space-y-1">
            <Label htmlFor={`name-${city.id}`}>الاسم</Label>
            <Input
              id={`name-${city.id}`}
              name="name"
              required
              defaultValue={city.name}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`region-${city.id}`}>المنطقة</Label>
            <Input
              id={`region-${city.id}`}
              name="region"
              defaultValue={city.region ?? ""}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`active-${city.id}`}>الحالة</Label>
            <select
              id={`active-${city.id}`}
              name="isActive"
              defaultValue={city.isActive ? "true" : "false"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="true">نشطة</option>
              <option value="false">موقوفة</option>
            </select>
          </div>
          <Button type="submit" disabled={pending} className="w-full bg-sky-600">
            تحديث
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
