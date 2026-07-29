"use client";

import { useMemo, useState, useTransition } from "react";
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
import {
  VEHICLE_BRAND_SUGGESTIONS,
  VEHICLE_CATEGORY_LABELS,
  countBookableSeats,
  getDefaultSeatLayout,
} from "@/lib/vehicle-seat-layouts";
import type { VehicleCategory } from "@prisma/client";
import { SeatLayoutPreview } from "@/components/Shared/SeatMap";
import Swal from "sweetalert2";

type Props = { vehicle: VehicleRow };

const CATEGORIES = Object.keys(VEHICLE_CATEGORY_LABELS) as VehicleCategory[];

export default function Vehicle_Update({ vehicle }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [category, setCategory] = useState<VehicleCategory>(vehicle.category);

  const layout = useMemo(() => getDefaultSeatLayout(category), [category]);
  const seatsCount = countBookableSeats(layout);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل المركبة</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          action={(fd) => {
            fd.set("id", vehicle.id);
            fd.set("category", category);
            fd.set("totalSeats", String(seatsCount));
            start(async () => {
              const res = await updateVehicle(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم التحديث",
                  text: "تم تعديل المركبة بنجاح",
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
          <input type="hidden" name="id" value={vehicle.id} />
          <p className="text-xs text-muted-foreground">
            اللوحة: {vehicle.plateNumber}
          </p>

          <div className="space-y-1">
            <Label>نوع السيارة</Label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as VehicleCategory)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {VEHICLE_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor={`vb-${vehicle.id}`}>الماركة</Label>
            <Input
              id={`vb-${vehicle.id}`}
              name="brand"
              list={`brand-list-${vehicle.id}`}
              required
              defaultValue={vehicle.brand}
            />
            <datalist id={`brand-list-${vehicle.id}`}>
              {VEHICLE_BRAND_SUGGESTIONS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
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
            <Label htmlFor={`vs-${vehicle.id}`}>المقاعد (تلقائي)</Label>
            <Input
              id={`vs-${vehicle.id}`}
              name="totalSeats"
              type="number"
              readOnly
              value={seatsCount}
              className="bg-muted"
            />
          </div>

          <SeatLayoutPreview layout={layout} />

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
          <Button type="submit" disabled={pending} className="w-full">
            تحديث
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
