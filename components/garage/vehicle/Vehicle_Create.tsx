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
import {
  VEHICLE_BRAND_SUGGESTIONS,
  VEHICLE_CATEGORY_LABELS,
  countBookableSeats,
  getDefaultSeatLayout,
} from "@/lib/vehicle-seat-layouts";
import type { VehicleCategory } from "@prisma/client";
import { SeatLayoutPreview } from "@/components/Shared/SeatMap";
import Swal from "sweetalert2";

type Opt = { id: string; name: string };
type Props = { garageOptions: Opt[]; userRole: string };

const CATEGORIES = Object.keys(VEHICLE_CATEGORY_LABELS) as VehicleCategory[];

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
  const [category, setCategory] = useState<VehicleCategory>("SEDAN");
  const [brand, setBrand] = useState("");

  const layout = useMemo(() => getDefaultSeatLayout(category), [category]);
  const seatsCount = countBookableSeats(layout);

  useEffect(() => {
    if (isGarageOwner && defaultGarageId) {
      setGarageId(defaultGarageId);
    }
  }, [isGarageOwner, defaultGarageId]);

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
                fd.set("category", category);
                fd.set("totalSeats", String(seatsCount));
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
                <Label htmlFor="v-category">نوع السيارة</Label>
                <select
                  id="v-category"
                  name="category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as VehicleCategory)
                  }
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
                <Label htmlFor="v-brand">الماركة</Label>
                <Input
                  id="v-brand"
                  name="brand"
                  list="brand-suggestions"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="مثال: تويوتا"
                />
                <datalist id="brand-suggestions">
                  {VEHICLE_BRAND_SUGGESTIONS.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-1">
                <Label htmlFor="v-model">الموديل</Label>
                <Input id="v-model" name="model" required />
              </div>
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
                <Label htmlFor="v-seats">عدد المقاعد (تلقائي)</Label>
                <Input
                  id="v-seats"
                  name="totalSeats"
                  type="number"
                  readOnly
                  value={seatsCount}
                  className="bg-muted"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="v-color">اللون</Label>
                <Input id="v-color" name="color" />
              </div>

              <div className="sm:col-span-2">
                <SeatLayoutPreview layout={layout} />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="v-type">نطاق التشغيل (داخلي / خارجي)</Label>
                <select
                  id="v-type"
                  name="transportType"
                  defaultValue="INTERNAL"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {!isGarageOwner && <option value="">بدون شركة سياحية</option>}
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
                disabled={pending}
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
