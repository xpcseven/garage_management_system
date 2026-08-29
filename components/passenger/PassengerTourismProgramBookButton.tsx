"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  bookSeatsOnTourismProgram,
  getProgramSeatsForMap,
} from "@/lib/actions/tourism_program.actions";
import { loginWithCallback } from "@/routes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SeatMap, { type SeatMapSeat } from "@/components/Shared/SeatMap";
import Swal from "sweetalert2";

type Props = {
  programId: string;
  isLoggedIn?: boolean;
};

export default function PassengerTourismProgramBookButton({
  programId,
  isLoggedIn = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [seats, setSeats] = useState<SeatMapSeat[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
      const list = await getProgramSeatsForMap(programId);
      setSeats(list);
      setSelectedIds([]);
    });
  }

  function toggleSeat(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function confirmBook() {
    if (selectedIds.length === 0) return;
    start(async () => {
      const res = await bookSeatsOnTourismProgram(programId, selectedIds);
      if (res.success) {
        setOpen(false);
        router.refresh();
        await Swal.fire({
          icon: "success",
          title: "تم الحجز",
          text:
            (res.count ?? selectedIds.length) > 1
              ? `تم حجز ${res.count} مقاعد على البرنامج بنجاح`
              : "تم حجز المقعد على البرنامج بنجاح",
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
        if (o) loadSeats();
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white"
        >
          حجز مقاعد
        </Button>
      </DialogTrigger>

      <DialogContent className="w-max max-w-[min(96vw,72rem)] gap-0 overflow-hidden border-0 bg-transparent p-0 shadow-none sm:max-w-[min(96vw,72rem)]">
        <div className="w-full min-w-[min(96vw,20rem)] overflow-hidden rounded-2xl border border-plum/15 bg-white shadow-xl dark:border-orchid/25 dark:bg-card">
          <DialogHeader className="space-y-1 border-b border-plum/10 bg-mist/80 px-4 py-3 text-right dark:border-orchid/20 dark:bg-background">
            <DialogTitle className="font-display text-base text-dusk dark:text-foreground">
              حجز مقاعد البرنامج
            </DialogTitle>
            <p className="text-[11px] text-dusk/55 dark:text-muted-foreground">
              اختر مقعداً أو أكثر من خريطة مركبة البرنامج
            </p>
          </DialogHeader>

          <div className="space-y-3 px-3 py-3">
            <div className="w-full rounded-xl bg-mist/50 p-2.5 ring-1 ring-plum/10 dark:bg-background dark:ring-orchid/20">
              <SeatMap
                seats={seats}
                selectedIds={selectedIds}
                onSelect={toggleSeat}
                orientation="horizontal"
                fitWidth
              />
              {seats.length === 0 && !pending && (
                <p className="mt-2 text-center text-xs text-dusk/45 dark:text-muted-foreground">
                  لا توجد مقاعد لهذا البرنامج
                </p>
              )}
            </div>

            {selectedIds.length > 0 && (
              <div className="flex flex-wrap justify-end gap-1.5">
                {selectedLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-plum-soft px-2.5 py-0.5 text-[11px] font-medium text-plum dark:bg-orchid/20 dark:text-orchid-light"
                  >
                    {label}
                  </span>
                ))}
                <span className="rounded-full bg-plum px-2.5 py-0.5 text-[11px] font-medium text-white">
                  {selectedIds.length} مقعد
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-plum/10 bg-mist/60 px-4 py-3 dark:border-orchid/20 dark:bg-background">
            <Button
              type="button"
              className="h-10 w-full rounded-xl border-0 bg-plum text-sm font-semibold text-white hover:bg-plum-light"
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
