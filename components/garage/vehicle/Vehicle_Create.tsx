"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVehicle } from "@/lib/actions/vehicle.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRole } from "@/prisma/UserRole.enum";

type Opt = { id: string; name: string };

type Props = { garageOptions: Opt[]; userRole: string };

export default function Vehicle_Create({ garageOptions, userRole }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const isGarageOwner = userRole === UserRole.GARAGE_OWNER;
  const defaultGarageId = garageOptions[0]?.id ?? "";
  const blocked = isGarageOwner && garageOptions.length === 0;

  const [garageId, setGarageId] = useState(
    isGarageOwner ? defaultGarageId : ""
  );

  useEffect(() => {
    if (isGarageOwner && defaultGarageId) {
      setGarageId(defaultGarageId);
    }
  }, [isGarageOwner, defaultGarageId]);

  const showDriverField = isGarageOwner || garageId !== "";
  const driverRequired = showDriverField;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">إضافة مركبة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {blocked && (
          <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            لا يوجد لديك كراج بعد. أنشئ كراجاً من قسم{" "}
            <span className="font-semibold">الكراجات</span> ثم عد لإضافة مركبة
            ضمنه.
          </p>
        )}
        {!blocked && (
          <form
            className="grid gap-3 sm:grid-cols-2"
            action={(fd) => {
              start(async () => {
                const res = await createVehicle(fd);
                if (res.success) router.refresh();
                else alert(res.error);
              });
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="v-brand">الماركة</Label>
              <Input id="v-brand" name="brand" required />
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
              <Label htmlFor="v-seats">عدد المقاعد</Label>
              <Input
                id="v-seats"
                name="totalSeats"
                type="number"
                required
                min={1}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="v-color">اللون</Label>
              <Input id="v-color" name="color" />
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
                  {isGarageOwner ? "الكراج (مطلوب)" : "الكراج (اختياري)"}
                </Label>
                <select
                  id="v-garage"
                  name="garageId"
                  value={garageId}
                  onChange={(e) => setGarageId(e.target.value)}
                  required={isGarageOwner}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {!isGarageOwner && (
                    <option value="">بدون كراج</option>
                  )}
                  {garageOptions.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
                {isGarageOwner && (
                  <p className="text-xs text-muted-foreground">
                    تُسجَّل المركبة تحت كراجك؛ يمكنك تغيير الكراج من القائمة إن
                    كان لديك أكثر من كراج.
                  </p>
                )}
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
                <p className="text-xs text-muted-foreground">
                  يُطلب عند ربط المركبة بكراج لتسهيل التعرف على السائق المسؤول
                  عنها.
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={pending}
              className="sm:col-span-2 bg-sky-600 w-full sm:w-auto"
            >
              {isGarageOwner ? "حفظ في الكراج" : "حفظ"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
