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
  const [stopKind, setStopKind] = useState<"TRAVEL" | "TOURISM">("TOURISM");
  const [itemIdToAdd, setItemIdToAdd] = useState("");
  const [selectedStops, setSelectedStops] = useState<
    { kind: "TRAVEL" | "TOURISM"; id: string }[]
  >([]);
  const [selectedPartnershipIds, setSelectedPartnershipIds] = useState<string[]>([]);

  const selectedGarage = useMemo(
    () => pack.garages.find((g) => g.id === garageId),
    [pack.garages, garageId]
  );

  const cities = pack.cities ?? [];
  const addOptions = useMemo(() => {
    if (stopKind === "TRAVEL") {
      return cities.map((c) => ({
        id: c.id,
        label: [c.name, c.region, c.country].filter(Boolean).join(" — "),
      }));
    }
    return pack.places.map((p) => ({
      id: p.id,
      label: p.governorate ? `${p.name} — ${p.governorate}` : p.name,
    }));
  }, [stopKind, cities, pack.places]);

  function stopLabel(stop: { kind: "TRAVEL" | "TOURISM"; id: string }) {
    if (stop.kind === "TRAVEL") {
      const c = cities.find((x) => x.id === stop.id);
      return c
        ? [c.name, c.region, c.country].filter(Boolean).join(" — ")
        : stop.id;
    }
    const p = pack.places.find((x) => x.id === stop.id);
    return p
      ? p.governorate
        ? `${p.name} — ${p.governorate}`
        : p.name
      : stop.id;
  }

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
            if (selectedStops.length === 0) {
              Swal.fire({
                icon: "warning",
                title: "المحطات مطلوبة",
                text: "أضف محطة سفر أو سياحة واحدة على الأقل قبل الحفظ",
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
            <Label className={labelClass} htmlFor="tp-currency">
              العملة
            </Label>
            <select
              id="tp-currency"
              name="currency"
              required
              defaultValue="IQD"
              className={fieldClass}
            >
              <option value="IQD">IQD</option>
              <option value="USD">USD</option>
            </select>
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
            <Label className={labelClass}>مسار البرنامج (محطات)</Label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setStopKind("TRAVEL");
                  setItemIdToAdd("");
                }}
                className={`rounded-xl px-3 py-2 text-sm transition ${
                  stopKind === "TRAVEL"
                    ? "bg-plum text-white"
                    : "bg-mist text-dusk ring-1 ring-plum/15 dark:bg-muted dark:text-foreground dark:ring-orchid/25"
                }`}
              >
                سفر (مدن)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStopKind("TOURISM");
                  setItemIdToAdd("");
                }}
                className={`rounded-xl px-3 py-2 text-sm transition ${
                  stopKind === "TOURISM"
                    ? "bg-orchid text-white"
                    : "bg-mist text-dusk ring-1 ring-plum/15 dark:bg-muted dark:text-foreground dark:ring-orchid/25"
                }`}
              >
                سياحة (أماكن سياحية)
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                id="tp-stop-add"
                value={itemIdToAdd}
                onChange={(e) => setItemIdToAdd(e.target.value)}
                className={`flex-1 ${fieldClass}`}
              >
                <option value="">
                  {stopKind === "TRAVEL"
                    ? "— اختر مدينة للسفر —"
                    : "— اختر مكاناً سياحياً —"}
                </option>
                {addOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl border-plum/20 dark:border-orchid/30 dark:text-foreground dark:hover:bg-orchid/15"
                onClick={() => {
                  if (!itemIdToAdd) return;
                  const key = `${stopKind}:${itemIdToAdd}`;
                  setSelectedStops((prev) =>
                    prev.some((s) => `${s.kind}:${s.id}` === key)
                      ? prev
                      : [...prev, { kind: stopKind, id: itemIdToAdd }]
                  );
                  setItemIdToAdd("");
                }}
              >
                + إضافة
              </Button>
            </div>

            <div className="rounded-2xl border border-plum/15 p-2 dark:border-orchid/25">
              {selectedStops.length === 0 ? (
                <p className="text-xs text-dusk/50 dark:text-muted-foreground">
                  لم تُضف محطات بعد — اختر سفر أو سياحة ثم أضف.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedStops.map((stop, idx) => (
                    <div
                      key={`${stop.kind}-${stop.id}`}
                      className="flex items-center justify-between rounded-xl bg-mist px-2 py-1 dark:bg-muted"
                    >
                      <span className="text-sm text-dusk dark:text-foreground">
                        {idx + 1}.{" "}
                        <span className="font-data text-[10px] text-orchid dark:text-orchid-light">
                          {stop.kind === "TRAVEL" ? "سفر" : "سياحة"}
                        </span>{" "}
                        {stopLabel(stop)}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setSelectedStops((prev) =>
                            prev.filter(
                              (s) =>
                                !(s.kind === stop.kind && s.id === stop.id)
                            )
                          )
                        }
                      >
                        حذف
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedStops.map((s) => (
              <input
                key={`${s.kind}:${s.id}`}
                type="hidden"
                name="stopEntries"
                value={`${s.kind}:${s.id}`}
              />
            ))}
            <p className="text-xs text-dusk/50 dark:text-muted-foreground">
              السفر = مدن من صفحة المدن · السياحة = أماكن سياحية. الترتيب حسب
              الإضافة.
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
