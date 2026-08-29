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
  const [stopKind, setStopKind] = useState<"TRAVEL" | "TOURISM">("TOURISM");
  const [itemIdToAdd, setItemIdToAdd] = useState("");
  const [selectedStops, setSelectedStops] = useState<
    { kind: "TRAVEL" | "TOURISM"; id: string }[]
  >(() =>
    [...row.places]
      .sort((a, b) => a.order - b.order)
      .map((p) => ({
        kind: (p.kind === "TRAVEL" ? "TRAVEL" : "TOURISM") as
          | "TRAVEL"
          | "TOURISM",
        id: p.id,
      }))
  );
  const [selectedPartnershipIds, setSelectedPartnershipIds] = useState<string[]>(
    row.partners.map((p) => p.partnershipId)
  );

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
              onChange={(e) => {
                setGarageId(e.target.value);
                setSelectedPartnershipIds([]);
              }}
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
            <Label htmlFor={`tp-currency-${row.id}`}>العملة</Label>
            <select
              id={`tp-currency-${row.id}`}
              name="currency"
              required
              defaultValue={row.currency ?? "IQD"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="IQD">IQD</option>
              <option value="USD">USD</option>
            </select>
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
            <Label>مسار البرنامج (محطات)</Label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setStopKind("TRAVEL");
                  setItemIdToAdd("");
                }}
                className={`rounded-md px-3 py-2 text-sm ${
                  stopKind === "TRAVEL"
                    ? "bg-primary text-primary-foreground"
                    : "border border-input bg-background"
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
                className={`rounded-md px-3 py-2 text-sm ${
                  stopKind === "TOURISM"
                    ? "bg-primary text-primary-foreground"
                    : "border border-input bg-background"
                }`}
              >
                سياحة (أماكن سياحية)
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                id={`tp-stop-add-${row.id}`}
                value={itemIdToAdd}
                onChange={(e) => setItemIdToAdd(e.target.value)}
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            <div className="rounded-md border border-input p-2">
              {selectedStops.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  لم تُضف محطات بعد.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedStops.map((stop, idx) => (
                    <div
                      key={`${stop.kind}-${stop.id}`}
                      className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1"
                    >
                      <span className="text-sm">
                        {idx + 1}.{" "}
                        <span className="text-[10px] text-muted-foreground">
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
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label>شركاء الباقة (اختياري — شركاء مقبولون فقط)</Label>
            {(selectedGarage?.partners ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">
                لا توجد شراكات مقبولة لهذه الشركة.
              </p>
            ) : (
              <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-input p-2">
                {(selectedGarage?.partners ?? []).map((partner) => {
                  const checked = selectedPartnershipIds.includes(partner.id);
                  return (
                    <label
                      key={partner.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
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
                        <span className="text-xs text-muted-foreground">
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

