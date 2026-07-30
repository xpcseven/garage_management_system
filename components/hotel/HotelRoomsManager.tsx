"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { HotelRoomRow } from "@/lib/actions/hotel.actions";
import { createHotelRoom, updateHotelRoom } from "@/lib/actions/hotel.actions";
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
import Swal from "sweetalert2";

const ROOM_TYPES = [
  { value: "SINGLE", label: "فردية" },
  { value: "DOUBLE", label: "مزدوجة" },
  { value: "TWIN", label: "سريرين" },
  { value: "TRIPLE", label: "ثلاثية" },
  { value: "SUITE", label: "جناح" },
  { value: "FAMILY", label: "عائلية" },
];

type Props = {
  rooms: HotelRoomRow[];
  hotels: { id: string; name: string }[];
};

export default function HotelRoomsManager({ rooms, hotels }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">غرف الفندق</h1>
          <p className="text-sm text-muted-foreground">
            أضف الغرف مع النوع والسعة والسعر لليلة.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={hotels.length === 0}>إضافة غرفة</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>غرفة جديدة</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-3"
              action={(fd) => {
                start(async () => {
                  const res = await createHotelRoom(fd);
                  if (res.success) {
                    setOpen(false);
                    router.refresh();
                  } else {
                    await Swal.fire({ icon: "error", title: res.error });
                  }
                });
              }}
            >
              <div className="space-y-1">
                <Label>الفندق</Label>
                <select
                  name="hotelId"
                  required
                  className="flex h-10 w-full rounded-md border px-3 text-sm"
                >
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>رقم الغرفة</Label>
                <Input name="roomNumber" required />
              </div>
              <div className="space-y-1">
                <Label>النوع</Label>
                <select
                  name="roomType"
                  defaultValue="DOUBLE"
                  className="flex h-10 w-full rounded-md border px-3 text-sm"
                >
                  {ROOM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>السعة</Label>
                  <Input name="capacity" type="number" defaultValue={2} min={1} />
                </div>
                <div className="space-y-1">
                  <Label>السعر / ليلة</Label>
                  <Input name="pricePerNight" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label>المرافق</Label>
                <Input name="amenities" placeholder="واي فاي، تكييف..." />
              </div>
              <Button type="submit" disabled={pending} className="w-full">
                حفظ
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-right">
              <th className="p-3">الفندق</th>
              <th className="p-3">الغرفة</th>
              <th className="p-3">النوع</th>
              <th className="p-3">السعة</th>
              <th className="p-3">السعر</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{r.hotelName}</td>
                <td className="p-3 font-mono">{r.roomNumber}</td>
                <td className="p-3">
                  {ROOM_TYPES.find((t) => t.value === r.roomType)?.label ??
                    r.roomType}
                </td>
                <td className="p-3">{r.capacity}</td>
                <td className="p-3">{r.pricePerNight}</td>
                <td className="p-3">
                  <RoomEdit room={r} />
                </td>
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  لا توجد غرف
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoomEdit({ room }: { room: HotelRoomRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل الغرفة</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          action={(fd) => {
            fd.set("id", room.id);
            start(async () => {
              const res = await updateHotelRoom(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
              } else {
                await Swal.fire({ icon: "error", title: res.error });
              }
            });
          }}
        >
          <input type="hidden" name="id" value={room.id} />
          <div className="space-y-1">
            <Label>رقم الغرفة</Label>
            <Input name="roomNumber" defaultValue={room.roomNumber} required />
          </div>
          <div className="space-y-1">
            <Label>النوع</Label>
            <select
              name="roomType"
              defaultValue={room.roomType}
              className="flex h-10 w-full rounded-md border px-3 text-sm"
            >
              {ROOM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>السعة</Label>
              <Input
                name="capacity"
                type="number"
                defaultValue={room.capacity}
              />
            </div>
            <div className="space-y-1">
              <Label>السعر</Label>
              <Input
                name="pricePerNight"
                defaultValue={room.pricePerNight}
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>المرافق</Label>
            <Input name="amenities" defaultValue={room.amenities ?? ""} />
          </div>
          <div className="space-y-1">
            <Label>الحالة</Label>
            <select
              name="isActive"
              defaultValue={room.isActive ? "true" : "false"}
              className="flex h-10 w-full rounded-md border px-3 text-sm"
            >
              <option value="true">نشطة</option>
              <option value="false">معطّلة</option>
            </select>
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            تحديث
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
