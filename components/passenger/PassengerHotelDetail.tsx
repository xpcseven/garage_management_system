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
import { Badge } from "@/components/ui/badge";
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

export default function PassengerHotelDetail({ hotel }: { hotel: Hotel }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/passenger/hotels">← العودة للفنادق</Link>
        </Button>
      </div>

      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="relative h-44 bg-gradient-to-br from-violet-100 via-slate-50 to-cyan-50 sm:h-56">
          {hotel.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={hotel.imageUrl}
              alt={hotel.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl opacity-30">
              🏨
            </div>
          )}
        </div>
        <div className="space-y-2 p-5 text-right sm:p-6">
          <h1 className="text-2xl font-bold text-purple-900 sm:text-3xl">
            {hotel.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {hotel.address}
            {hotel.city?.name ? ` — ${hotel.city.name}` : ""}
          </p>
          {hotel.location && (
            <p className="text-sm text-violet-700">{hotel.location}</p>
          )}
          {hotel.phone && (
            <p className="text-sm text-slate-600">هاتف: {hotel.phone}</p>
          )}
          {hotel.description && (
            <p className="pt-2 text-sm leading-7 text-slate-700">
              {hotel.description}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="text-right">
          <h2 className="text-xl font-bold text-slate-900">الغرف المتاحة</h2>
          <p className="text-sm text-muted-foreground">
            اختر غرفة واحجز تواريخ إقامتك
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {hotel.rooms.map((r) => (
            <article
              key={r.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="text-right">
                  <h3 className="text-lg font-bold text-slate-900">
                    غرفة {r.roomNumber}
                  </h3>
                  <Badge variant="secondary" className="mt-1">
                    {ROOM_TYPE_LABELS[r.roomType] ?? r.roomType}
                  </Badge>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-violet-700">
                    {priceText(r.pricePerNight)}
                  </p>
                  <p className="text-xs text-muted-foreground">للليلة</p>
                </div>
              </div>

              <dl className="mt-4 space-y-2 text-sm text-slate-700">
                <div className="flex justify-between gap-3 border-b border-dashed pb-2">
                  <dt className="text-muted-foreground">السعة</dt>
                  <dd className="font-medium">{r.capacity} أشخاص</dd>
                </div>
                {r.amenities && (
                  <div className="flex justify-between gap-3 border-b border-dashed pb-2">
                    <dt className="text-muted-foreground">المرافق</dt>
                    <dd className="max-w-[60%] text-left font-medium">
                      {r.amenities}
                    </dd>
                  </div>
                )}
                {r.description && (
                  <p className="pt-1 leading-6 text-slate-600">{r.description}</p>
                )}
              </dl>

              <div className="mt-auto pt-4">
                <BookRoomButton roomId={r.id} capacity={r.capacity} />
              </div>
            </article>
          ))}
        </div>

        {hotel.rooms.length === 0 && (
          <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            لا توجد غرف متاحة في هذا الفندق حالياً
          </p>
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
        <Button className="w-full">حجز هذه الغرفة</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حجز غرفة</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
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
          <div className="space-y-1">
            <Label>تاريخ الوصول</Label>
            <Input name="checkIn" type="date" required />
          </div>
          <div className="space-y-1">
            <Label>تاريخ المغادرة</Label>
            <Input name="checkOut" type="date" required />
          </div>
          <div className="space-y-1">
            <Label>عدد الضيوف (حد أقصى {capacity})</Label>
            <Input
              name="guests"
              type="number"
              min={1}
              max={capacity}
              defaultValue={1}
            />
          </div>
          <div className="space-y-1">
            <Label>ملاحظات</Label>
            <Input name="notes" />
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            تأكيد الحجز
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
