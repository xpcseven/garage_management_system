"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { VehicleRow } from "@/lib/actions/vehicle.actions";
import { updateVehicle } from "@/lib/actions/vehicle.actions";
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

type Props = { vehicle: VehicleRow };

export default function Vehicle_Update({ vehicle }: Props) {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل المركبة</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          action={(fd) => {
            fd.set("id", vehicle.id);
            start(async () => {
              const res = await updateVehicle(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
              } else alert(res.error);
            });
          }}
        >
          <input type="hidden" name="id" value={vehicle.id} />
          <p className="text-xs text-muted-foreground">اللوحة: {vehicle.plateNumber}</p>
          <div className="space-y-1">
            <Label htmlFor={`vb-${vehicle.id}`}>الماركة</Label>
            <Input
              id={`vb-${vehicle.id}`}
              name="brand"
              required
              defaultValue={vehicle.brand}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`vm-${vehicle.id}`}>الموديل</Label>
            <Input
              id={`vm-${vehicle.id}`}
              name="model"
              required
              defaultValue={vehicle.model}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`vy-${vehicle.id}`}>السنة</Label>
            <Input
              id={`vy-${vehicle.id}`}
              name="year"
              type="number"
              required
              defaultValue={vehicle.year}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`vs-${vehicle.id}`}>المقاعد</Label>
            <Input
              id={`vs-${vehicle.id}`}
              name="totalSeats"
              type="number"
              required
              defaultValue={vehicle.totalSeats}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`vc-${vehicle.id}`}>اللون</Label>
            <Input
              id={`vc-${vehicle.id}`}
              name="color"
              defaultValue={vehicle.color ?? ""}
            />
          </div>
          {vehicle.garageId && (
            <div className="space-y-1">
              <Label htmlFor={`vdn-${vehicle.id}`}>اسم السائق المعيّن</Label>
              <Input
                id={`vdn-${vehicle.id}`}
                name="driverName"
                required
                defaultValue={vehicle.driverName ?? ""}
                placeholder="اسم السائق"
              />
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor={`vt-${vehicle.id}`}>نوع النقل</Label>
            <select
              id={`vt-${vehicle.id}`}
              name="transportType"
              defaultValue={vehicle.transportType}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="INTERNAL">داخلي</option>
              <option value="EXTERNAL">خارجي</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`va-${vehicle.id}`}>الحالة</Label>
            <select
              id={`va-${vehicle.id}`}
              name="isActive"
              defaultValue={vehicle.isActive ? "true" : "false"}
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
