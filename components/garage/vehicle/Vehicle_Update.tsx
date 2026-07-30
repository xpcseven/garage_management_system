"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
import { VEHICLE_CATEGORY_LABELS } from "@/lib/vehicle-seat-layouts";
import {
  findVehicleModel,
  getModelsForBrand,
  getModelsForCategory,
  getVehicleBrands,
  getVehicleModelById,
  resolveVehicleSeatLayout,
} from "@/lib/vehicle-models";
import type { VehicleCategory } from "@prisma/client";
import { SeatLayoutPreview } from "@/components/Shared/SeatMap";
import Swal from "sweetalert2";

type Props = { vehicle: VehicleRow };

const CATEGORIES = Object.keys(VEHICLE_CATEGORY_LABELS) as VehicleCategory[];
const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

function initialModelId(vehicle: VehicleRow) {
  return findVehicleModel(vehicle.brand, vehicle.model)?.id ?? "";
}

export default function Vehicle_Update({ vehicle }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [category, setCategory] = useState<VehicleCategory | "">(
    vehicle.category
  );
  const [brand, setBrand] = useState(vehicle.brand);
  const [modelId, setModelId] = useState(() => initialModelId(vehicle));

  const selectedModel = useMemo(
    () => (modelId ? getVehicleModelById(modelId) : null),
    [modelId]
  );

  const brands = useMemo(() => {
    if (category) {
      return [
        ...new Set(getModelsForCategory(category).map((m) => m.brand)),
      ];
    }
    return getVehicleBrands();
  }, [category]);

  const models = useMemo(() => {
    if (!brand) return [];
    const list = getModelsForBrand(brand);
    if (category) return list.filter((m) => m.category === category);
    return list;
  }, [brand, category]);

  const resolvedCategory =
    selectedModel?.category ?? (category || vehicle.category);

  const layout = useMemo(
    () =>
      resolveVehicleSeatLayout({
        modelId: modelId || null,
        brand: selectedModel?.brand ?? brand,
        model: selectedModel?.model ?? vehicle.model,
        category: resolvedCategory as VehicleCategory,
      }),
    [modelId, selectedModel, brand, resolvedCategory, vehicle.model]
  );

  const seatsCount =
    selectedModel?.passengerSeats ??
    layout.seats.filter((s) => !s.isDriver && s.n > 0).length;

  useEffect(() => {
    if (!open) return;
    setCategory(vehicle.category);
    setBrand(vehicle.brand);
    setModelId(initialModelId(vehicle));
  }, [open, vehicle]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل المركبة</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3 sm:grid-cols-2"
          action={(fd) => {
            if (!selectedModel) {
              void Swal.fire({
                icon: "error",
                title: "اختر الموديل",
                text: "يجب اختيار ماركة وموديل من القائمة",
              });
              return;
            }
            fd.set("id", vehicle.id);
            fd.set("modelId", selectedModel.id);
            fd.set("brand", selectedModel.brand);
            fd.set("model", selectedModel.model);
            fd.set("category", selectedModel.category);
            fd.set("totalSeats", String(selectedModel.passengerSeats));
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
          <p className="sm:col-span-2 text-xs text-muted-foreground">
            اللوحة: {vehicle.plateNumber}
          </p>

          <div className="space-y-1 sm:col-span-2">
            <Label>نوع المركبة (تصفية)</Label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as VehicleCategory | "");
                setBrand("");
                setModelId("");
              }}
              className={selectClass}
            >
              <option value="">الكل</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {VEHICLE_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>الماركة *</Label>
            <select
              value={brand}
              required
              onChange={(e) => {
                setBrand(e.target.value);
                setModelId("");
              }}
              className={selectClass}
            >
              <option value="">— اختر الماركة —</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>الموديل *</Label>
            <select
              value={modelId}
              required
              disabled={!brand}
              onChange={(e) => setModelId(e.target.value)}
              className={selectClass}
            >
              <option value="">— اختر الموديل —</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.passengerSeats} مقعد)
                </option>
              ))}
            </select>
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
            <Label>المقاعد (حسب الموديل)</Label>
            <Input
              name="totalSeats"
              type="number"
              readOnly
              value={seatsCount}
              className="bg-muted"
            />
          </div>

          {selectedModel && (
            <div className="sm:col-span-2 space-y-2 rounded-xl border border-violet-100 bg-violet-50/40 p-3">
              <p className="text-right text-sm text-violet-900">
                <span className="font-semibold">{selectedModel.label}</span>
                {" — "}
                {VEHICLE_CATEGORY_LABELS[selectedModel.category]}
                {" — "}
                {selectedModel.passengerSeats} مقعد راكب
              </p>
              <SeatLayoutPreview layout={layout} />
            </div>
          )}

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
              className={selectClass}
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
              className={selectClass}
            >
              <option value="true">نشطة</option>
              <option value="false">موقوفة</option>
            </select>
          </div>
          <Button
            type="submit"
            disabled={pending || !selectedModel}
            className="sm:col-span-2 w-full"
          >
            تحديث
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
