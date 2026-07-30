"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVehicle } from "@/lib/actions/vehicle.actions";
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
import { UserRole } from "@/prisma/UserRole.enum";
import { VEHICLE_CATEGORY_LABELS } from "@/lib/vehicle-seat-layouts";
import {
  getModelsForBrand,
  getModelsForCategory,
  getVehicleBrands,
  getVehicleModelById,
  resolveVehicleSeatLayout,
} from "@/lib/vehicle-models";
import type { VehicleCategory } from "@prisma/client";
import { SeatLayoutPreview } from "@/components/Shared/SeatMap";
import Swal from "sweetalert2";

type Opt = { id: string; name: string };
type Props = { garageOptions: Opt[]; userRole: string };

const CATEGORIES = Object.keys(VEHICLE_CATEGORY_LABELS) as VehicleCategory[];
const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

export default function Vehicle_Create({ garageOptions, userRole }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const isGarageOwner = userRole === UserRole.GARAGE_OWNER;
  const defaultGarageId = garageOptions[0]?.id ?? "";
  const blocked = isGarageOwner && garageOptions.length === 0;

  const [garageId, setGarageId] = useState(
    isGarageOwner ? defaultGarageId : ""
  );
  const [category, setCategory] = useState<VehicleCategory | "">("");
  const [brand, setBrand] = useState("");
  const [modelId, setModelId] = useState("");

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
    selectedModel?.category ?? (category || "SEDAN");

  const layout = useMemo(
    () =>
      resolveVehicleSeatLayout({
        modelId: modelId || null,
        brand: selectedModel?.brand ?? brand,
        model: selectedModel?.model ?? "",
        category: resolvedCategory as VehicleCategory,
      }),
    [modelId, selectedModel, brand, resolvedCategory]
  );

  const seatsCount = selectedModel?.passengerSeats ?? 0;

  useEffect(() => {
    if (isGarageOwner && defaultGarageId) {
      setGarageId(defaultGarageId);
    }
  }, [isGarageOwner, defaultGarageId]);

  useEffect(() => {
    if (!open) {
      setCategory("");
      setBrand("");
      setModelId("");
    }
  }, [open]);

  const showDriverField = isGarageOwner || garageId !== "";
  const driverRequired = showDriverField;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>إضافة مركبة</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">إضافة مركبة</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {blocked && (
            <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              لا يوجد لديك شركة سياحية بعد. أنشئ شركة سياحية من قسم{" "}
              <span className="font-semibold">الشركات السياحية</span> ثم عد لإضافة
              مركبة.
            </p>
          )}
          {!blocked && (
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
                fd.set("modelId", selectedModel.id);
                fd.set("brand", selectedModel.brand);
                fd.set("model", selectedModel.model);
                fd.set("category", selectedModel.category);
                fd.set("totalSeats", String(selectedModel.passengerSeats));
                start(async () => {
                  const res = await createVehicle(fd);
                  if (res.success) {
                    setOpen(false);
                    router.refresh();
                    await Swal.fire({
                      icon: "success",
                      title: "تمت الإضافة",
                      text: "تمت إضافة المركبة بنجاح",
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
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="v-category">نوع المركبة (تصفية)</Label>
                <select
                  id="v-category"
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
                <Label htmlFor="v-brand">الماركة *</Label>
                <select
                  id="v-brand"
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
                <Label htmlFor="v-model">الموديل *</Label>
                <select
                  id="v-model"
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

              <input type="hidden" name="modelId" value={modelId} />
              <input
                type="hidden"
                name="brand"
                value={selectedModel?.brand ?? ""}
              />
              <input
                type="hidden"
                name="model"
                value={selectedModel?.model ?? ""}
              />
              <input
                type="hidden"
                name="category"
                value={selectedModel?.category ?? ""}
              />

              <div className="space-y-1">
                <Label htmlFor="v-plate">رقم اللوحة</Label>
                <Input id="v-plate" name="plateNumber" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="v-year">السنة</Label>
                <Input
                  id="v-year"
                  name="year"
                  type="number"
                  required
                  min={1990}
                  max={2035}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="v-seats">عدد المقاعد (حسب الموديل)</Label>
                <Input
                  id="v-seats"
                  name="totalSeats"
                  type="number"
                  readOnly
                  value={seatsCount || ""}
                  className="bg-muted"
                  placeholder="اختر الموديل أولاً"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="v-color">اللون</Label>
                <Input id="v-color" name="color" />
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

              {!selectedModel && (
                <p className="sm:col-span-2 text-center text-sm text-muted-foreground">
                  اختر الماركة والموديل لعرض مخطط المقاعد المطابق
                </p>
              )}

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="v-type">نطاق التشغيل (داخلي / خارجي)</Label>
                <select
                  id="v-type"
                  name="transportType"
                  defaultValue="INTERNAL"
                  className={selectClass}
                >
                  <option value="INTERNAL">داخلي</option>
                  <option value="EXTERNAL">خارجي</option>
                </select>
              </div>

              {(garageOptions.length > 0 || isGarageOwner) && (
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="v-garage">
                    {isGarageOwner
                      ? "الشركة السياحية (مطلوب)"
                      : "الشركة السياحية (اختياري)"}
                  </Label>
                  <select
                    id="v-garage"
                    name="garageId"
                    value={garageId}
                    onChange={(e) => setGarageId(e.target.value)}
                    required={isGarageOwner}
                    className={selectClass}
                  >
                    {!isGarageOwner && (
                      <option value="">بدون شركة سياحية</option>
                    )}
                    {garageOptions.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showDriverField && (
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="v-driver">
                    اسم السائق المعيّن للمركبة
                    {driverRequired ? " (مطلوب)" : ""}
                  </Label>
                  <Input
                    id="v-driver"
                    name="driverName"
                    placeholder="مثال: أحمد علي"
                    required={driverRequired}
                    className="text-right"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={pending || !selectedModel}
                className="sm:col-span-2 w-full sm:w-auto"
              >
                {isGarageOwner ? "حفظ في الشركة السياحية" : "حفظ"}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
