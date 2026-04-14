"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { getAvailableSeatsForTrip } from "@/lib/actions/passenger.actions";
import { bookSeatOnTrip } from "@/lib/actions/booking.actions";
import {
  LUGGAGE_KIND_OPTIONS,
  type BookTripLuggagePayload,
  type LuggageKindValue,
} from "@/lib/luggage-labels";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Swal from "sweetalert2";

type Props = { tripId: string };

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

export default function PassengerTripBookButton({ tripId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [seats, setSeats] = useState<{ id: string; seatNumber: number }[]>([]);
  const [luggageRows, setLuggageRows] = useState<LuggageFormRow[]>([]);
  const [pending, start] = useTransition();

  function loadSeats() {
    start(async () => {
      const list = await getAvailableSeatsForTrip(tripId);
      setSeats(list);
    });
  }

  function updateRow(
    key: string,
    patch: Partial<Omit<LuggageFormRow, "key">>
  ) {
    setLuggageRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          loadSeats();
          setLuggageRows([]);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="bg-sky-600">
          حجز
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>حجز مقعد</DialogTitle>
          <p className="text-sm text-muted-foreground text-right pt-1">
            يمكنك السفر دون أمتعة. إن رغبت بتسجيل أغراض، اضغط «إضافة غرض» ثم املأ
            الحقول. للحقيبة أو الكرتون: الوزن والحجم مطلوبان. للكيس: عدد الأكياس
            مطلوب والوزن اختياري.
          </p>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto flex-1 min-h-0 pr-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label className="text-base">أمتعة مرافقة (اختياري)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setLuggageRows((p) => [...p, emptyRow()])}
            >
              <Plus className="h-4 w-4" />
              إضافة غرض
            </Button>
          </div>

          {luggageRows.length === 0 && (
            <p className="text-sm text-muted-foreground rounded-md border border-dashed border-muted-foreground/25 bg-muted/20 px-3 py-4 text-center">
              لا توجد أغراض مضافة — اختر مقعداً بالأسفل للحجز بدون أمتعة، أو أضف
              غرضاً أولاً.
            </p>
          )}

          {luggageRows.map((row, idx) => {
            const isSack = row.kind === "SACK";
            return (
              <div
                key={row.key}
                className="rounded-lg border border-border bg-muted/30 p-3 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    غرض {idx + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive gap-1"
                    onClick={() =>
                      setLuggageRows((p) => p.filter((r) => r.key !== row.key))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">نوع الغرض</Label>
                  <Select
                    value={row.kind}
                    onValueChange={(v) =>
                      updateRow(row.key, { kind: v as LuggageKindValue })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LUGGAGE_KIND_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isSack ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">عدد الأكياس</Label>
                      <Input
                        inputMode="numeric"
                        min={1}
                        value={row.quantity}
                        onChange={(e) =>
                          updateRow(row.key, { quantity: e.target.value })
                        }
                        placeholder="مثال: 3"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">الوزن (كغ) — اختياري</Label>
                      <Input
                        inputMode="decimal"
                        value={row.weightKg}
                        onChange={(e) =>
                          updateRow(row.key, { weightKg: e.target.value })
                        }
                        placeholder="إجمالي أو تقديري"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">الوزن (كغ)</Label>
                        <Input
                          inputMode="decimal"
                          value={row.weightKg}
                          onChange={(e) =>
                            updateRow(row.key, { weightKg: e.target.value })
                          }
                          placeholder="مثال: 18"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">عدد القطع</Label>
                        <Input
                          inputMode="numeric"
                          min={1}
                          value={row.quantity}
                          onChange={(e) =>
                            updateRow(row.key, { quantity: e.target.value })
                          }
                          placeholder="1"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">الحجم</Label>
                      <Input
                        value={row.dimensions}
                        onChange={(e) =>
                          updateRow(row.key, { dimensions: e.target.value })
                        }
                        placeholder="مثال: 75×50×32 سم"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t pt-3 space-y-2">
          <Label className="text-sm">اختر مقعداً</Label>
          <div className="flex flex-wrap gap-2">
            {seats.map((s) => (
              <Button
                key={s.id}
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  const payload = rowsToPayload(luggageRows);
                  start(async () => {
                    const res = await bookSeatOnTrip(tripId, s.id, payload);
                    if (res.success) {
                      setOpen(false);
                      router.refresh();
                      await Swal.fire({
                        icon: "success",
                        title: "تم الحجز",
                        text: "تم حجز المقعد بنجاح",
                        confirmButtonText: "موافق",
                      });
                    } else {
                      await Swal.fire({
                        icon: "error",
                        title: "تعذر الحجز",
                        text: res.error,
                        confirmButtonText: "حسناً",
                      });
                    }
                  });
                }}
              >
                مقعد {s.seatNumber}
              </Button>
            ))}
            {seats.length === 0 && !pending && (
              <p className="text-sm text-muted-foreground">لا توجد مقاعد متاحة.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
