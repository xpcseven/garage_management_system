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

export default function City_Create() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-sky-600">إضافة مدينة</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg">إضافة مدينة</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
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
          <div className="flex-1 space-y-1">
            <Label htmlFor="city-name">الاسم</Label>
            <Input id="city-name" name="name" required placeholder="بغداد" />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor="city-region">المنطقة (اختياري)</Label>
            <Input id="city-region" name="region" placeholder="بغداد" />
          </div>
          <Button type="submit" disabled={pending} className="bg-sky-600">
            حفظ
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
