"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bookHotelRoom } from "@/lib/actions/hotel.actions";
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
import { LocationMapIcon } from "@/components/Shared/LocationMapIcon";
import Swal from "sweetalert2";

const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: "فردية",
  DOUBLE: "مزدوجة",
  TWIN: "سريرين",
  TRIPLE: "ثلاثية",
  SUITE: "جناح",
  FAMILY: "عائلية",
};

type Room = {
  id: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  pricePerNight: { toString(): string } | string;
  amenities: string | null;
  description: string | null;
};

type Hotel = {
  id: string;
  name: string;
  address: string | null;
  location: string | null;
  phone: string | null;
  description: string | null;
  imageUrl: string | null;
  city: { name: string } | null;
  rooms: Room[];
};

function priceText(p: Room["pricePerNight"]) {
  return typeof p === "string" ? p : p.toString();
}

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground";

export default function PassengerHotelDetail({ hotel }: { hotel: Hotel }) {
  const city = hotel.city?.name?.trim() || "العراق";

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-6 py-8 text-white sm:px-8 sm:py-10 dark:bg-card dark:ring-1 dark:ring-orchid/25">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-48 w-48 rounded-full bg-orchid/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 bottom-0 h-40 w-40 rounded-full bg-fuchsia-brand/20 blur-3xl dark:bg-orchid/15"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              {city}
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              {hotel.name}
            </h1>
            {(hotel.address || hotel.description) && (
              <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
                {hotel.description?.trim() || hotel.address}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/65 dark:text-muted-foreground">
              {hotel.address?.trim() && hotel.description?.trim() && (
                <p>
                  <span className="font-data text-[10px] uppercase tracking-wider text-orchid-light">
                    العنوان
                  </span>{" "}
                  {hotel.address}
                </p>
              )}
              {hotel.phone?.trim() && (
                <p>
                  <span className="font-data text-[10px] uppercase tracking-wider text-orchid-light">
                    هاتف
                  </span>{" "}
                  <a
                    href={`tel:${hotel.phone}`}
                    className="hover:text-white dark:hover:text-orchid-light"
                  >
                    {hotel.phone}
                  </a>
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="font-data text-[10px] uppercase tracking-wider text-orchid-light">
                  الموقع
                </span>
                <LocationMapIcon location={hotel.location} size="sm" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-orchid/30 dark:bg-transparent dark:text-foreground dark:hover:bg-orchid/15 dark:hover:text-foreground"
            >
              <Link href="/passenger/hotels">العودة للفنادق</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3 text-start">
          <div>
            <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
              الإقامة
            </p>
            <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
              الغرف المتاحة
            </h2>
          </div>
          <p className="font-data text-sm text-dusk/50 dark:text-muted-foreground">
            {hotel.rooms.length} غرفة
          </p>
        </div>

        {hotel.rooms.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
            <p className="font-display text-2xl text-plum dark:text-orchid-light">
              لا غرف متاحة حالياً
            </p>
            <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
              يمكنك العودة لقائمة الفنادق واختيار فندق آخر.
            </p>
            <Button
              asChild
              className="mt-6 rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
            >
              <Link href="/passenger/hotels">تصفّح الفنادق</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {hotel.rooms.map((r) => (
              <article
                key={r.id}
                className="flex h-full flex-col rounded-3xl bg-white p-5 text-start ring-1 ring-plum/10 transition hover:shadow-orchid dark:bg-card dark:ring-orchid/20 dark:hover:ring-orchid/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-full bg-plum-soft px-2.5 py-0.5 font-data text-[10px] tracking-wide text-plum dark:bg-orchid/20 dark:text-orchid-light">
                      {ROOM_TYPE_LABELS[r.roomType] ?? r.roomType}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-dusk dark:text-foreground">
                      غرفة {r.roomNumber}
                    </h3>
                  </div>
                  <div className="text-end">
                    <p className="font-data text-xl font-semibold tabular-nums text-plum dark:text-orchid-light">
                      {priceText(r.pricePerNight)}
                    </p>
                    <p className="text-xs text-dusk/50 dark:text-muted-foreground">
                      للليلة
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-dusk/65 dark:text-muted-foreground">
                  <p>
                    <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                      السعة
                    </span>{" "}
                    {r.capacity} أشخاص
                  </p>
                  {r.amenities?.trim() && (
                    <p>
                      <span className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                        المرافق
                      </span>{" "}
                      {r.amenities}
                    </p>
                  )}
                  {r.description?.trim() && (
                    <p className="leading-7">{r.description}</p>
                  )}
                </div>

                <div className="mt-auto pt-5">
                  <BookRoomButton roomId={r.id} capacity={r.capacity} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BookRoomButton({
  roomId,
  capacity,
}: {
  roomId: string;
  capacity: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white dark:bg-orchid dark:hover:bg-orchid-light">
          حجز هذه الغرفة
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl dark:bg-card dark:ring-1 dark:ring-orchid/25">
        <DialogHeader>
          <DialogTitle className="font-display text-dusk dark:text-foreground">
            حجز غرفة
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3 text-start"
          action={(fd) => {
            fd.set("roomId", roomId);
            start(async () => {
              const res = await bookHotelRoom(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم إرسال طلب الحجز",
                });
              } else {
                await Swal.fire({ icon: "error", title: res.error });
              }
            });
          }}
        >
          <input type="hidden" name="roomId" value={roomId} />
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              تاريخ الوصول
            </Label>
            <Input name="checkIn" type="date" required className={fieldClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              تاريخ المغادرة
            </Label>
            <Input name="checkOut" type="date" required className={fieldClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              عدد الضيوف (حد أقصى {capacity})
            </Label>
            <Input
              name="guests"
              type="number"
              min={1}
              max={capacity}
              defaultValue={1}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              ملاحظات
            </Label>
            <Input name="notes" className={fieldClass} />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
          >
            {pending ? "جاري الإرسال…" : "تأكيد الحجز"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
