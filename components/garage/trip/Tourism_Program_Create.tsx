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

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground";

const labelClass = "text-xs text-dusk/60 dark:text-muted-foreground";

export default function Tourism_Program_Create({ pack }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [garageId, setGarageId] = useState(pack.garages[0]?.id ?? "");
  const [placeIdToAdd, setPlaceIdToAdd] = useState(pack.places[0]?.id ?? "");
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  const [selectedPartnershipIds, setSelectedPartnershipIds] = useState<string[]>([]);

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
        <Button className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light">
          إنشاء برنامج سياحي
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            برنامج سياحي جديد
          </DialogTitle>
        </DialogHeader>
        <form
          className="grid gap-3 text-start sm:grid-cols-2"
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
          <div className="space-y-1.5 sm:col-span-2">
            <Label className={labelClass} htmlFor="tp-title">
              اسم البرنامج
            </Label>
            <Input id="tp-title" name="title" required className={fieldClass} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className={labelClass} htmlFor="tp-desc">
              الوصف
            </Label>
            <Input id="tp-desc" name="description" className={fieldClass} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className={labelClass} htmlFor="tp-garage">
              الشركة السياحية
            </Label>
            <select
              id="tp-garage"
              name="garageId"
              value={garageId}
              onChange={(e) => {
                setGarageId(e.target.value);
                setSelectedPartnershipIds([]);
              }}
              required
              className={fieldClass}
            >
              {pack.garages.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass} htmlFor="tp-vehicle">
              المركبة
            </Label>
            <select
              id="tp-vehicle"
              name="vehicleId"
              required
              className={fieldClass}
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
          <div className="space-y-1.5">
            <Label className={labelClass} htmlFor="tp-driver">
              السائق
            </Label>
            <select
              id="tp-driver"
              name="driverId"
              required
              className={fieldClass}
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

          <div className="space-y-1.5">
            <Label className={labelClass} htmlFor="tp-start">
              تاريخ/وقت الانطلاق
            </Label>
            <Input
              id="tp-start"
              name="startAt"
              type="datetime-local"
              required
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass} htmlFor="tp-end">
              تاريخ/وقت النهاية (اختياري)
            </Label>
            <Input
              id="tp-end"
              name="endAt"
              type="datetime-local"
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass} htmlFor="tp-price">
              السعر
            </Label>
            <Input
              id="tp-price"
              name="basePrice"
              type="number"
              min={0}
              step="0.01"
              required
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass} htmlFor="tp-seats">
              عدد المقاعد
            </Label>
            <Input
              id="tp-seats"
              name="maxSeats"
              type="number"
              min={1}
              required
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className={labelClass} htmlFor="tp-place-add">
              الأماكن السياحية (إدخال متعدد)
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              <select
                id="tp-place-add"
                value={placeIdToAdd}
                onChange={(e) => setPlaceIdToAdd(e.target.value)}
                className={`flex-1 ${fieldClass}`}
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
                className="rounded-xl border-plum/20 dark:border-orchid/30 dark:text-foreground dark:hover:bg-orchid/15"
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
            <div className="rounded-2xl border border-plum/15 p-2 dark:border-orchid/25">
              {selectedPlaceIds.length === 0 ? (
                <p className="text-xs text-dusk/50 dark:text-muted-foreground">
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
                        className="flex items-center justify-between rounded-xl bg-mist px-2 py-1 dark:bg-muted"
                      >
                        <span className="text-sm text-dusk dark:text-foreground">
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
            <p className="text-xs text-dusk/50 dark:text-muted-foreground">
              يمكنك إضافة أكثر من مكان. الترتيب يعتمد على ترتيب الإضافة.
            </p>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className={labelClass}>
              شركاء الباقة (اختياري — شركاء مقبولون فقط)
            </Label>
            {(selectedGarage?.partners ?? []).length === 0 ? (
              <p className="text-xs text-dusk/50 dark:text-muted-foreground">
                لا توجد شراكات مقبولة لهذه الشركة. أضف شركاء من صفحة الشراكات
                أولاً.
              </p>
            ) : (
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-2xl border border-plum/15 p-2 dark:border-orchid/25">
                {(selectedGarage?.partners ?? []).map((partner) => {
                  const checked = selectedPartnershipIds.includes(partner.id);
                  return (
                    <label
                      key={partner.id}
                      className="flex cursor-pointer items-center gap-2 text-sm text-dusk dark:text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedPartnershipIds((prev) =>
                            checked
                              ? prev.filter((x) => x !== partner.id)
                              : [...prev, partner.id]
                          )
                        }
                      />
                      <span>
                        {partner.partnerName}{" "}
                        <span className="text-xs text-dusk/50 dark:text-muted-foreground">
                          ({partner.partnerType === "HOTEL"
                            ? "فندق"
                            : partner.partnerType === "RESTAURANT"
                              ? "مطعم"
                              : "مزرعة"}
                          )
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
            {selectedPartnershipIds.map((pid) => (
              <input key={pid} type="hidden" name="partnershipIds" value={pid} />
            ))}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className={labelClass} htmlFor="tp-notes">
              ملاحظات
            </Label>
            <Input id="tp-notes" name="notes" className={fieldClass} />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light sm:col-span-2"
          >
            حفظ البرنامج السياحي
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
