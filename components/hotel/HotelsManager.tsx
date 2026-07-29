"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { HotelRow } from "@/lib/actions/hotel.actions";
import { createHotel, updateHotel } from "@/lib/actions/hotel.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  BusinessForm,
  BusinessFormDialog,
  Field,
  FieldRow,
  ImageThumbs,
  ImagesField,
  StatusField,
} from "@/components/Shared/BusinessPlaceForm";
import Swal from "sweetalert2";

export function HotelCreate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>إضافة فندق</Button>
      </DialogTrigger>
      <BusinessFormDialog title="إضافة فندق">
        <BusinessForm
          action={(fd) => {
            start(async () => {
              const res = await createHotel(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({ icon: "success", title: "تمت الإضافة" });
              } else {
                await Swal.fire({ icon: "error", title: res.error });
              }
            });
          }}
        >
          <Field label="اسم الفندق *" htmlFor="hotel-name">
            <Input id="hotel-name" name="name" required placeholder="اسم الفندق" />
          </Field>

          <FieldRow>
            <Field label="العنوان *" htmlFor="hotel-address">
              <Input
                id="hotel-address"
                name="address"
                required
                placeholder="العنوان التفصيلي"
              />
            </Field>
            <Field
              label="الموقع"
              htmlFor="hotel-location"
              hint="رابط Google Maps أو إحداثيات"
            >
              <Input
                id="hotel-location"
                name="location"
                placeholder="رابط الخريطة أو العنوان"
              />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="الهاتف" htmlFor="hotel-phone">
              <Input id="hotel-phone" name="phone" placeholder="07xx xxx xxxx" />
            </Field>
            <div className="hidden sm:block" />
          </FieldRow>

          <Field label="الوصف" htmlFor="hotel-description">
            <Input
              id="hotel-description"
              name="description"
              placeholder="نبذة مختصرة عن الفندق"
            />
          </Field>

          <ImagesField name="hotelImages" label="صور الفندق" />

          <Button type="submit" disabled={pending} className="w-full">
            حفظ
          </Button>
        </BusinessForm>
      </BusinessFormDialog>
    </Dialog>
  );
}

function HotelEdit({ hotel }: { hotel: HotelRow }) {
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
      <BusinessFormDialog title="تعديل الفندق">
        <BusinessForm
          action={(fd) => {
            fd.set("id", hotel.id);
            start(async () => {
              const res = await updateHotel(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
              } else {
                await Swal.fire({ icon: "error", title: res.error });
              }
            });
          }}
        >
          <input type="hidden" name="id" value={hotel.id} />

          <Field label="اسم الفندق *" htmlFor={`hotel-name-${hotel.id}`}>
            <Input
              id={`hotel-name-${hotel.id}`}
              name="name"
              required
              defaultValue={hotel.name}
            />
          </Field>

          <FieldRow>
            <Field label="العنوان *" htmlFor={`hotel-address-${hotel.id}`}>
              <Input
                id={`hotel-address-${hotel.id}`}
                name="address"
                required
                defaultValue={hotel.address ?? ""}
              />
            </Field>
            <Field label="الموقع" htmlFor={`hotel-location-${hotel.id}`}>
              <Input
                id={`hotel-location-${hotel.id}`}
                name="location"
                defaultValue={hotel.location ?? ""}
                placeholder="رابط الخريطة أو العنوان"
              />
            </Field>
          </FieldRow>

          <FieldRow>
            <Field label="الهاتف" htmlFor={`hotel-phone-${hotel.id}`}>
              <Input
                id={`hotel-phone-${hotel.id}`}
                name="phone"
                defaultValue={hotel.phone ?? ""}
              />
            </Field>
            <StatusField defaultActive={hotel.isActive} />
          </FieldRow>

          <Field label="الوصف" htmlFor={`hotel-description-${hotel.id}`}>
            <Input
              id={`hotel-description-${hotel.id}`}
              name="description"
              defaultValue={hotel.description ?? ""}
            />
          </Field>

          <ImageThumbs urls={hotel.images} />
          <ImagesField
            name="hotelImages"
            label="إضافة صور"
            hint="تُضاف إلى الصور الحالية — الإجمالي حد أقصى 10"
          />

          <Button type="submit" disabled={pending} className="w-full">
            تحديث
          </Button>
        </BusinessForm>
      </BusinessFormDialog>
    </Dialog>
  );
}

export default function HotelsManager({ hotels }: { hotels: HotelRow[] }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">فندقي</h1>
          <p className="text-sm text-muted-foreground">
            أدر تفاصيل فندقك: الموقع، الوصف، والصور.
          </p>
        </div>
        <HotelCreate />
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-right">
              <th className="p-3">الاسم</th>
              <th className="p-3">العنوان</th>
              <th className="p-3">الغرف</th>
              <th className="p-3">الاعتماد</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((h) => (
              <tr key={h.id} className="border-b">
                <td className="p-3 font-medium">{h.name}</td>
                <td className="p-3 text-muted-foreground">{h.address}</td>
                <td className="p-3">{h.roomsCount}</td>
                <td className="p-3">
                  <Badge variant="secondary">{h.approvalStatus}</Badge>
                </td>
                <td className="p-3">
                  <HotelEdit hotel={h} />
                </td>
              </tr>
            ))}
            {hotels.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  لا يوجد فندق بعد — أضف فندقك الآن.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
