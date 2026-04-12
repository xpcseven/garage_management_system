"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { GarageRow } from "@/lib/actions/garage.actions";
import { updateGarage } from "@/lib/actions/garage.actions";
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

type Props = { garage: GarageRow };

export default function Garage_Update({ garage }: Props) {
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>تعديل الكراج</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          action={(fd) => {
            fd.set("id", garage.id);
            start(async () => {
              const res = await updateGarage(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
              } else alert(res.error);
            });
          }}
        >
          <input type="hidden" name="id" value={garage.id} />
          <div className="space-y-1">
            <Label htmlFor={`gn-${garage.id}`}>الاسم</Label>
            <Input
              id={`gn-${garage.id}`}
              name="name"
              required
              defaultValue={garage.name}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`gd-${garage.id}`}>الوصف</Label>
            <Input
              id={`gd-${garage.id}`}
              name="description"
              defaultValue={garage.description ?? ""}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`gp-${garage.id}`}>الهاتف</Label>
            <Input
              id={`gp-${garage.id}`}
              name="phone"
              defaultValue={garage.phone ?? ""}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`ga-${garage.id}`}>العنوان</Label>
            <Input
              id={`ga-${garage.id}`}
              name="address"
              defaultValue={garage.address ?? ""}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`gac-${garage.id}`}>الحالة</Label>
            <select
              id={`gac-${garage.id}`}
              name="isActive"
              defaultValue={garage.isActive ? "true" : "false"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="true">نشط</option>
              <option value="false">موقوف</option>
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
