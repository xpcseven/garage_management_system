"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  TourismProgramCreatePack,
  TourismProgramManageRow,
} from "@/lib/actions/tourism_program.actions";
import { updateTourismProgram } from "@/lib/actions/tourism_program.actions";
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
  row: TourismProgramManageRow;
  pack: TourismProgramCreatePack;
};

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

export default function Tourism_Program_Update({ row, pack }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [garageId, setGarageId] = useState(row.garageId);
  const [placeIdToAdd, setPlaceIdToAdd] = useState(pack.places[0]?.id ?? "");
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>(
    [...row.places].sort((a, b) => a.order - b.order).map((p) => p.id)
  );

  const selectedGarage = useMemo(
    () => pack.garages.find((g) => g.id === garageId),
    [pack.garages, garageId]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تعديل البرنامج السياحي</DialogTitle>
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
              const res = await updateTourismProgram(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم التعديل",
                  text: "تم تعديل البرنامج السياحي بنجاح",
                  confirmButtonText: "موافق",
                });
              } else {
                await Swal.fire({
                  icon: "error",
                  title: "تعذر التعديل",
                  text: res.error,
                  confirmButtonText: "حسناً",
                });
              }
            });
          }}
        >
          <input type="hidden" name="id" value={row.id} />
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor={`tp-title-${row.id}`}>اسم البرنامج</Label>
            <Input id={`tp-title-${row.id}`} name="title" defaultValue={row.title} required />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor={`tp-desc-${row.id}`}>الوصف</Label>
            <Input
              id={`tp-desc-${row.id}`}
              name="description"
              defaultValue={row.description ?? ""}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor={`tp-garage-${row.id}`}>الشركة السياحية</Label>
            <select
              id={`tp-garage-${row.id}`}
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
            <Label htmlFor={`tp-vehicle-${row.id}`}>المركبة</Label>
            <select
              id={`tp-vehicle-${row.id}`}
              name="vehicleId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={row.vehicleId}
              key={`vehicle-${row.id}-${garageId}`}
            >
              {(selectedGarage?.vehicles ?? []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} (سعة: {v.totalSeats})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`tp-driver-${row.id}`}>السائق</Label>
            <select
              id={`tp-driver-${row.id}`}
              name="driverId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={row.driverId}
              key={`driver-${row.id}-${garageId}`}
            >
              {(selectedGarage?.drivers ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor={`tp-start-${row.id}`}>تاريخ/وقت الانطلاق</Label>
            <Input
              id={`tp-start-${row.id}`}
              name="startAt"
              type="datetime-local"
              defaultValue={toLocalInputValue(row.startAt)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`tp-end-${row.id}`}>تاريخ/وقت النهاية</Label>
            <Input
              id={`tp-end-${row.id}`}
              name="endAt"
              type="datetime-local"
              defaultValue={toLocalInputValue(row.endAt)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`tp-price-${row.id}`}>السعر</Label>
            <Input
              id={`tp-price-${row.id}`}
              name="basePrice"
              type="number"
              min={0}
              step="0.01"
              defaultValue={row.basePrice}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`tp-seats-${row.id}`}>عدد المقاعد</Label>
            <Input
              id={`tp-seats-${row.id}`}
              name="maxSeats"
              type="number"
              min={1}
              defaultValue={row.maxSeats}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`tp-status-${row.id}`}>الحالة</Label>
            <select
              id={`tp-status-${row.id}`}
              name="status"
              defaultValue={row.status}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="SCHEDULED">مجدول</option>
              <option value="IN_PROGRESS">جاري</option>
              <option value="COMPLETED">مكتمل</option>
              <option value="CANCELLED">ملغى</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`tp-active-${row.id}`}>نشط</Label>
            <select
              id={`tp-active-${row.id}`}
              name="isActive"
              defaultValue={row.isActive ? "true" : "false"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="true">نعم</option>
              <option value="false">لا</option>
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor={`tp-place-add-${row.id}`}>الأماكن السياحية (إدخال متعدد)</Label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                id={`tp-place-add-${row.id}`}
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
                <p className="text-xs text-muted-foreground">لم يتم إضافة أماكن بعد.</p>
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
                            setSelectedPlaceIds((prev) => prev.filter((x) => x !== pid))
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
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor={`tp-notes-${row.id}`}>ملاحظات</Label>
            <Input
              id={`tp-notes-${row.id}`}
              name="notes"
              defaultValue={row.notes ?? ""}
            />
          </div>

          <Button type="submit" disabled={pending} className="sm:col-span-2">
            حفظ التعديلات
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

