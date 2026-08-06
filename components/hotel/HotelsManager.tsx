"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { HotelRow } from "@/lib/actions/hotel.actions";
import {
  createHotel,
  createHotelRoom,
  updateHotel,
  updateHotelRoom,
} from "@/lib/actions/hotel.actions";
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
  BusinessForm,
  BusinessFormDialog,
  Field,
  FieldRow,
  ImageThumbs,
  ImagesField,
  StatusField,
} from "@/components/Shared/BusinessPlaceForm";
import Link from "next/link";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";
import { LocationMapIcon } from "@/components/Shared/LocationMapIcon";

const ROOM_TYPES = [
  { value: "SINGLE", label: "فردية" },
  { value: "DOUBLE", label: "مزدوجة" },
  { value: "TWIN", label: "سريرين" },
  { value: "TRIPLE", label: "ثلاثية" },
  { value: "SUITE", label: "جناح" },
  { value: "FAMILY", label: "عائلية" },
] as const;

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground";

function approvalLabel(s: HotelRow["approvalStatus"]) {
  if (s === "APPROVED") return "معتمد";
  if (s === "PENDING") return "بانتظار الموافقة";
  return "مرفوض";
}

function roomTypeLabel(t: string) {
  return ROOM_TYPES.find((x) => x.value === t)?.label ?? t;
}

export function HotelCreate() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light">
          إضافة فندق
        </Button>
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

          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
          >
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
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl border-plum/20 dark:border-orchid/30"
        >
          تعديل الفندق
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
            label="استبدال الصور"
            hint="اختيار صور جديدة يحذف الصور السابقة من AWS ويبقي على الجديدة فقط"
          />

          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
          >
            تحديث
          </Button>
        </BusinessForm>
      </BusinessFormDialog>
    </Dialog>
  );
}

function RoomCreate({ hotelId }: { hotelId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
        >
          إضافة غرفة
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            غرفة جديدة
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3 text-start"
          action={(fd) => {
            fd.set("hotelId", hotelId);
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
          <input type="hidden" name="hotelId" value={hotelId} />
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              رقم الغرفة
            </Label>
            <Input name="roomNumber" required className={fieldClass} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              النوع
            </Label>
            <select
              name="roomType"
              defaultValue="DOUBLE"
              className={fieldClass}
            >
              {ROOM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                السعة
              </Label>
              <Input
                name="capacity"
                type="number"
                defaultValue={2}
                min={1}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                السعر / ليلة
              </Label>
              <Input name="pricePerNight" required className={fieldClass} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              المرافق
            </Label>
            <Input
              name="amenities"
              placeholder="واي فاي، تكييف..."
              className={fieldClass}
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
          >
            حفظ
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RoomEdit({
  room,
}: {
  room: HotelRow["rooms"][number];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl border-plum/20 dark:border-orchid/30"
        >
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            تعديل الغرفة
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3 text-start"
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
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              رقم الغرفة
            </Label>
            <Input
              name="roomNumber"
              defaultValue={room.roomNumber}
              required
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              النوع
            </Label>
            <select
              name="roomType"
              defaultValue={room.roomType}
              className={fieldClass}
            >
              {ROOM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                السعة
              </Label>
              <Input
                name="capacity"
                type="number"
                defaultValue={room.capacity}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                السعر
              </Label>
              <Input
                name="pricePerNight"
                defaultValue={room.pricePerNight}
                required
                className={fieldClass}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              المرافق
            </Label>
            <Input
              name="amenities"
              defaultValue={room.amenities ?? ""}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              الحالة
            </Label>
            <select
              name="isActive"
              defaultValue={room.isActive ? "true" : "false"}
              className={fieldClass}
            >
              <option value="true">نشطة</option>
              <option value="false">معطّلة</option>
            </select>
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
          >
            تحديث
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function HotelsManager({ hotels }: { hotels: HotelRow[] }) {
  const [search, setSearch] = useState("");
  const approved = hotels.filter((h) => h.approvalStatus === "APPROVED").length;
  const roomsTotal = hotels.reduce((n, h) => n + h.roomsCount, 0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return hotels;
    return hotels.filter((h) => {
      const hay = [h.name, h.address, h.phone, h.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [hotels, search]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-6 py-8 text-white sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-48 w-48 rounded-full bg-orchid/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 bottom-0 h-40 w-40 rounded-full bg-fuchsia-brand/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              الضيافة
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              الفنادق
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
              اختر بطاقة فندق لفتح صفحة التفاصيل والغرف.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <HotelCreate />
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-white/25 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
            >
              <Link href="/hotel-bookings">الحجوزات</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white dark:border-white/25 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
            >
              <Link href="/home">الرئيسية</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-3 gap-3">
          <Metric label="فنادق" value={hotels.length} />
          <Metric label="معتمدة" value={approved} />
          <Metric label="غرف" value={roomsTotal} />
        </div>
      </header>

      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث باسم الفندق أو العنوان…"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {filtered.map((h) => {
          const cover = h.images[0] ?? h.imageUrl;
          return (
            <Link
              key={h.id}
              href={`/hotels/${h.id}`}
              className="group overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-plum/10 transition hover:-translate-y-0.5 hover:ring-orchid/40 dark:bg-card dark:ring-orchid/20 dark:hover:ring-orchid/50"
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={h.name}
                  className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-44"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-36 w-full items-center justify-center bg-mist text-sm text-dusk/40 dark:bg-muted dark:text-muted-foreground">
                  بلا صورة
                </div>
              )}

              <div className="space-y-3 p-5 text-start">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-display text-xl text-dusk group-hover:text-orchid dark:text-foreground dark:group-hover:text-orchid-light">
                    {h.name}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 font-data text-[10px] tracking-wide",
                        h.approvalStatus === "APPROVED" &&
                          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
                        h.approvalStatus === "PENDING" &&
                          "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200",
                        h.approvalStatus === "REJECTED" &&
                          "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      )}
                    >
                      {approvalLabel(h.approvalStatus)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 font-data text-[10px] tracking-wide",
                        h.isActive
                          ? "bg-orchid/10 text-orchid dark:bg-orchid/20 dark:text-orchid-light"
                          : "bg-mist text-dusk/50 dark:bg-muted dark:text-muted-foreground"
                      )}
                    >
                      {h.isActive ? "نشط" : "موقوف"}
                    </span>
                  </div>
                </div>
                <p className="line-clamp-1 text-sm text-dusk/55 dark:text-muted-foreground">
                  {h.address ?? "بدون عنوان"}
                </p>
                <p className="text-xs text-dusk/45 dark:text-muted-foreground">
                  {h.roomsCount} غرفة · اضغط لعرض التفاصيل
                </p>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-[1.75rem] border border-dashed border-plum/20 bg-white p-10 text-center sm:col-span-2 dark:border-orchid/25 dark:bg-card">
            <p className="text-sm text-dusk/50 dark:text-muted-foreground">
              {hotels.length === 0
                ? "لا يوجد فندق بعد — أضف فندقك الآن."
                : "لا نتائج مطابقة للبحث"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function HotelDetailManager({ hotel }: { hotel: HotelRow }) {
  const cover = hotel.images[0] ?? hotel.imageUrl;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          asChild
          variant="outline"
          className="rounded-xl border-plum/20 dark:border-orchid/30"
        >
          <Link href="/hotels">← العودة للفنادق</Link>
        </Button>
      </div>

      <article className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={hotel.name}
            className="h-52 w-full object-cover sm:h-64"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-mist text-sm text-dusk/40 dark:bg-muted dark:text-muted-foreground">
            بلا صورة
          </div>
        )}

        <div className="space-y-5 p-5 text-start sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid dark:text-orchid-light">
                تفاصيل الفندق
              </p>
              <h1 className="mt-2 font-display text-3xl text-dusk dark:text-foreground sm:text-4xl">
                {hotel.name}
              </h1>
              <p className="mt-2 text-sm text-dusk/55 dark:text-muted-foreground">
                {hotel.rooms.length} غرفة ·{" "}
                {hotel.images.length || (cover ? 1 : 0)} صورة
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 font-data text-[10px] tracking-wide",
                  hotel.approvalStatus === "APPROVED" &&
                    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
                  hotel.approvalStatus === "PENDING" &&
                    "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200",
                  hotel.approvalStatus === "REJECTED" &&
                    "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                )}
              >
                {approvalLabel(hotel.approvalStatus)}
              </span>
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 font-data text-[10px] tracking-wide",
                  hotel.isActive
                    ? "bg-orchid/10 text-orchid dark:bg-orchid/20 dark:text-orchid-light"
                    : "bg-mist text-dusk/50 dark:bg-muted dark:text-muted-foreground"
                )}
              >
                {hotel.isActive ? "نشط" : "موقوف"}
              </span>
            </div>
          </div>

          <dl className="grid gap-3 rounded-2xl bg-mist/70 p-4 ring-1 ring-plum/10 dark:bg-background dark:ring-orchid/15 sm:grid-cols-2">
            <Detail label="العنوان" value={hotel.address ?? "—"} />
            <Detail label="الهاتف" value={hotel.phone ?? "—"} dir="ltr" />
            <div>
              <dt className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                الموقع
              </dt>
              <dd className="mt-2">
                <LocationMapIcon location={hotel.location} />
              </dd>
            </div>
            <Detail
              label="الوصف"
              value={hotel.description ?? "لا يوجد وصف"}
              className="sm:col-span-2"
            />
          </dl>

          {hotel.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {hotel.images.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt=""
                  className="h-20 w-28 shrink-0 rounded-xl object-cover ring-1 ring-plum/10 dark:ring-orchid/20"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <HotelEdit hotel={hotel} />
            <RoomCreate hotelId={hotel.id} />
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-plum/20 dark:border-orchid/30"
            >
              <Link href="/hotel-bookings">الحجوزات</Link>
            </Button>
          </div>

          <div>
            <p className="mb-3 font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
              الغرف ({hotel.rooms.length})
            </p>
            {hotel.rooms.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {hotel.rooms.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start justify-between gap-3 rounded-2xl bg-mist/80 px-4 py-3 ring-1 ring-plum/10 dark:bg-background dark:ring-orchid/15"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-dusk dark:text-foreground">
                        غرفة {r.roomNumber}
                      </p>
                      <p className="mt-0.5 text-xs text-dusk/55 dark:text-muted-foreground">
                        {roomTypeLabel(r.roomType)} · سعة {r.capacity} ·{" "}
                        <span className="font-data text-orchid dark:text-orchid-light">
                          {r.pricePerNight}
                        </span>{" "}
                        / ليلة
                      </p>
                      {r.amenities && (
                        <p className="mt-1 line-clamp-1 text-[11px] text-dusk/45 dark:text-muted-foreground">
                          {r.amenities}
                        </p>
                      )}
                    </div>
                    <RoomEdit room={r} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-plum/20 px-4 py-6 text-center text-sm text-dusk/50 dark:border-orchid/25 dark:text-muted-foreground">
                لا غرف بعد — أضف أول غرفة لهذا الفندق
              </p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

function Detail({
  label,
  value,
  className,
  dir,
}: {
  label: string;
  value: string;
  className?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className={className}>
      <dt className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
        {label}
      </dt>
      <dd
        className="mt-1 text-sm leading-7 text-dusk dark:text-foreground"
        dir={dir}
      >
        {value}
      </dd>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm ring-1 ring-white/15">
      <p className="font-data text-xl font-semibold tabular-nums text-white sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-white/55 sm:text-xs">{label}</p>
    </div>
  );
}
