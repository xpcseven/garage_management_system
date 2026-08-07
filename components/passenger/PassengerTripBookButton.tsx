"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Plus, Trash2 } from "lucide-react";
import { getTripSeatsForMap } from "@/lib/actions/passenger.actions";
import { bookSeatsOnTrip } from "@/lib/actions/booking.actions";
import {
  LUGGAGE_KIND_OPTIONS,
  type BookTripLuggagePayload,
  type LuggageKindValue,
} from "@/lib/luggage-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SeatMap, { type SeatMapSeat } from "@/components/Shared/SeatMap";
import Swal from "sweetalert2";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { loginWithCallback } from "@/routes";

type Props = { tripId: string; isLoggedIn?: boolean };

type LuggageFormRow = {
  key: string;
  kind: LuggageKindValue;
  weightKg: string;
  dimensions: string;
  quantity: string;
};

function emptyRow(): LuggageFormRow {
  return {
    key: crypto.randomUUID(),
    kind: "LARGE_BAG",
    weightKg: "",
    dimensions: "",
    quantity: "1",
  };
}

function rowsToPayload(rows: LuggageFormRow[]): BookTripLuggagePayload[] {
  return rows.map((r) => ({
    kind: r.kind,
    weightKg: r.weightKg,
    dimensions: r.dimensions,
    quantity: Number(String(r.quantity).replace(/,/g, ".")) || 1,
  }));
}

export default function PassengerTripBookButton({
  tripId,
  isLoggedIn = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [seats, setSeats] = useState<SeatMapSeat[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [luggageRows, setLuggageRows] = useState<LuggageFormRow[]>([]);
  const [showLuggage, setShowLuggage] = useState(false);
  const [pending, start] = useTransition();

  if (!isLoggedIn) {
    return (
      <Button
        asChild
        size="sm"
        className="rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white"
      >
        <Link href={loginWithCallback(pathname)}>سجّل الدخول للحجز</Link>
      </Button>
    );
  }

  function loadSeats() {
    start(async () => {
      const list = await getTripSeatsForMap(tripId);
      setSeats(list);
      setSelectedIds([]);
    });
  }

  function toggleSeat(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function updateRow(
    key: string,
    patch: Partial<Omit<LuggageFormRow, "key">>
  ) {
    setLuggageRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    );
  }

  function confirmBook() {
    if (selectedIds.length === 0) return;
    const payload = rowsToPayload(luggageRows);
    start(async () => {
      const res = await bookSeatsOnTrip(tripId, selectedIds, payload);
      if (res.success) {
        setOpen(false);
        router.refresh();
        await Swal.fire({
          icon: "success",
          title: "تم الحجز",
          text:
            (res.count ?? selectedIds.length) > 1
              ? `تم حجز ${res.count} مقاعد بنجاح`
              : "تم حجز المقعد بنجاح",
          confirmButtonText: "موافق",
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "تعذر الحجز",
          text: res.error,
          confirmButtonText: "حسناً",
        });
        loadSeats();
      }
    });
  }

  const selectedLabels = seats
    .filter((s) => selectedIds.includes(s.id))
    .map((s) => s.label || String(s.seatNumber));

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          loadSeats();
          setLuggageRows([]);
          setShowLuggage(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white"
        >
          حجز
        </Button>
      </DialogTrigger>

      <DialogContent className="w-max max-w-[min(96vw,72rem)] gap-0 overflow-hidden border-0 bg-transparent p-0 shadow-none sm:max-w-[min(96vw,72rem)]">
        <div className="w-full min-w-[min(96vw,20rem)] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/10">
          <DialogHeader className="space-y-1 border-b border-slate-100 bg-gradient-to-l from-emerald-50 to-white px-4 py-3 text-right">
            <DialogTitle className="text-base font-bold text-slate-900">
              حجز المقاعد
            </DialogTitle>
            <p className="text-[11px] text-slate-500">
              اضغط المقاعد لاختيارها — يمكنك اختيار أكثر من مقعد
            </p>
          </DialogHeader>

          <div className="space-y-3 px-3 py-3">
            <div className="w-full rounded-xl bg-slate-50/90 p-2.5 ring-1 ring-slate-100">
              <SeatMap
                seats={seats}
                selectedIds={selectedIds}
                onSelect={toggleSeat}
                orientation="horizontal"
                fitWidth
              />
              {seats.length === 0 && !pending && (
                <p className="mt-2 text-center text-xs text-slate-400">
                  لا توجد مقاعد لهذه الرحلة
                </p>
              )}
            </div>

            {selectedIds.length > 0 && (
              <div className="flex flex-wrap justify-end gap-1.5">
                {selectedLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800"
                  >
                    {label}
                  </span>
                ))}
                <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[11px] font-medium text-white">
                  {selectedIds.length} مقعد
                </span>
              </div>
            )}

            {!showLuggage ? (
              <button
                type="button"
                onClick={() => {
                  setShowLuggage(true);
                  if (luggageRows.length === 0) {
                    setLuggageRows([emptyRow()]);
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 py-2 text-xs text-slate-500 transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-800"
              >
                <Briefcase className="h-3.5 w-3.5" />
                إضافة أمتعة (اختياري)
              </button>
            ) : (
              <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700">
                    الأمتعة
                  </span>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 px-2 text-[11px]"
                      onClick={() =>
                        setLuggageRows((p) => [...p, emptyRow()])
                      }
                    >
                      <Plus className="h-3 w-3" />
                      غرض
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[11px] text-slate-400"
                      onClick={() => {
                        setShowLuggage(false);
                        setLuggageRows([]);
                      }}
                    >
                      إخفاء
                    </Button>
                  </div>
                </div>

                {luggageRows.map((row, idx) => {
                  const isSack = row.kind === "SACK";
                  return (
                    <div
                      key={row.key}
                      className="grid grid-cols-[1fr_auto] gap-1.5 rounded-lg bg-white p-2 ring-1 ring-slate-100"
                    >
                      <div className="grid grid-cols-2 gap-1.5">
                        <Select
                          value={row.kind}
                          onValueChange={(v) =>
                            updateRow(row.key, {
                              kind: v as LuggageKindValue,
                            })
                          }
                        >
                          <SelectTrigger className="col-span-2 h-8 text-[11px]">
                            <SelectValue placeholder={`غرض ${idx + 1}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {LUGGAGE_KIND_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="h-8 text-[11px]"
                          placeholder={isSack ? "عدد" : "وزن كغ"}
                          inputMode={isSack ? "numeric" : "decimal"}
                          value={isSack ? row.quantity : row.weightKg}
                          onChange={(e) =>
                            updateRow(
                              row.key,
                              isSack
                                ? { quantity: e.target.value }
                                : { weightKg: e.target.value }
                            )
                          }
                        />
                        <Input
                          className="h-8 text-[11px]"
                          placeholder={isSack ? "وزن" : "حجم"}
                          value={isSack ? row.weightKg : row.dimensions}
                          onChange={(e) =>
                            updateRow(
                              row.key,
                              isSack
                                ? { weightKg: e.target.value }
                                : { dimensions: e.target.value }
                            )
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className="self-start rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                        onClick={() =>
                          setLuggageRows((p) =>
                            p.filter((r) => r.key !== row.key)
                          )
                        }
                        aria-label="حذف"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3">
            <Button
              type="button"
              className="h-10 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700"
              disabled={pending || selectedIds.length === 0}
              onClick={confirmBook}
            >
              {selectedIds.length > 1
                ? `تأكيد حجز ${selectedIds.length} مقاعد`
                : selectedIds.length === 1
                  ? "تأكيد حجز المقعد"
                  : "اختر مقعداً أولاً"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
