"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TourismProgramCreatePack } from "@/lib/actions/tourism_program.actions";
import { createTourismProgram } from "@/lib/actions/tourism_program.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Swal from "sweetalert2";

type Props = {
  pack: TourismProgramCreatePack;
};

export default function Tourism_Program_Create({ pack }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [garageId, setGarageId] = useState(pack.garages[0]?.id ?? "");
  const [placeIdToAdd, setPlaceIdToAdd] = useState(pack.places[0]?.id ?? "");
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);

  const selectedGarage = useMemo(
    () => pack.garages.find((g) => g.id === garageId),
    [pack.garages, garageId]
  );

  if (pack.garages.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>إنشاء برنامج سياحي</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>برنامج سياحي جديد</DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3 sm:grid-cols-2"
          action={(fd) => {
            if (selectedPlaceIds.length === 0) {
              Swal.fire({
                icon: "warning",
                title: "الأماكن السياحية مطلوبة",
                text: "أضف مكاناً سياحياً واحداً على الأقل قبل الحفظ",
                confirmButtonText: "حسناً",
              });
              return;
            }
            start(async () => {
              const res = await createTourismProgram(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم الإنشاء",
                  text: "تم إنشاء البرنامج السياحي بنجاح",
                  confirmButtonText: "موافق",
                });
              } else {
                await Swal.fire({
                  icon: "error",
                  title: "تعذر الإنشاء",
                  text: res.error,
                  confirmButtonText: "حسناً",
                });
              }
            });
          }}
        >
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="tp-title">اسم البرنامج</Label>
            <Input id="tp-title" name="title" required />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="tp-desc">الوصف</Label>
            <Input id="tp-desc" name="description" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="tp-garage">الشركة السياحية</Label>
            <select
              id="tp-garage"
              name="garageId"
              value={garageId}
              onChange={(e) => setGarageId(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {pack.garages.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="tp-vehicle">المركبة</Label>
            <select
              id="tp-vehicle"
              name="vehicleId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={selectedGarage?.vehicles[0]?.id ?? ""}
              key={`vehicle-${garageId}`}
            >
              {(selectedGarage?.vehicles ?? []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} (سعة: {v.totalSeats})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="tp-driver">السائق</Label>
            <select
              id="tp-driver"
              name="driverId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={selectedGarage?.drivers[0]?.id ?? ""}
              key={`driver-${garageId}`}
            >
              {(selectedGarage?.drivers ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="tp-start">تاريخ/وقت الانطلاق</Label>
            <Input id="tp-start" name="startAt" type="datetime-local" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tp-end">تاريخ/وقت النهاية (اختياري)</Label>
            <Input id="tp-end" name="endAt" type="datetime-local" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tp-price">السعر</Label>
            <Input id="tp-price" name="basePrice" type="number" min={0} step="0.01" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tp-seats">عدد المقاعد</Label>
            <Input id="tp-seats" name="maxSeats" type="number" min={1} required />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="tp-place-add">الأماكن السياحية (إدخال متعدد)</Label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                id="tp-place-add"
                value={placeIdToAdd}
                onChange={(e) => setPlaceIdToAdd(e.target.value)}
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {pack.places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.governorate ? ` — ${p.governorate}` : ""}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!placeIdToAdd) return;
                  setSelectedPlaceIds((prev) =>
                    prev.includes(placeIdToAdd) ? prev : [...prev, placeIdToAdd]
                  );
                }}
              >
                + إضافة
              </Button>
            </div>
            <div className="rounded-md border border-input p-2">
              {selectedPlaceIds.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  لم يتم إضافة أماكن بعد.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedPlaceIds.map((pid, idx) => {
                    const place = pack.places.find((p) => p.id === pid);
                    if (!place) return null;
                    return (
                      <div
                        key={pid}
                        className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1"
                      >
                        <span className="text-sm">
                          {idx + 1}. {place.name}
                          {place.governorate ? ` — ${place.governorate}` : ""}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setSelectedPlaceIds((prev) =>
                              prev.filter((x) => x !== pid)
                            )
                          }
                        >
                          حذف
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {selectedPlaceIds.map((pid) => (
              <input key={pid} type="hidden" name="placeIds" value={pid} />
            ))}
            <p className="text-xs text-muted-foreground">
              يمكنك إضافة أكثر من مكان. الترتيب يعتمد على ترتيب الإضافة.
            </p>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="tp-notes">ملاحظات</Label>
            <Input id="tp-notes" name="notes" />
          </div>

          <Button type="submit" disabled={pending} className="sm:col-span-2">
            حفظ البرنامج السياحي
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

