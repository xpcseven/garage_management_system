"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  RestaurantRow,
  RestaurantBookingRow,
} from "@/lib/actions/restaurant.actions";
import {
  createRestaurant,
  updateRestaurant,
  updateRestaurantBookingStatus,
} from "@/lib/actions/restaurant.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  BusinessForm,
  BusinessFormDialog,
  Field,
  FieldRow,
  ImageThumbs,
  ImagesField,
  StatusField,
} from "@/components/Shared/BusinessPlaceForm";
import type { BookingStatus } from "@prisma/client";
import Link from "next/link";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";
import { LocationMapIcon } from "@/components/Shared/LocationMapIcon";
import RestaurantMenuManager from "@/components/restaurant/RestaurantMenuManager";
import { toDisplayImageUrl } from "@/lib/media-url";

function approvalLabel(s: RestaurantRow["approvalStatus"]) {
  if (s === "APPROVED") return "معتمد";
  if (s === "PENDING") return "بانتظار الموافقة";
  return "مرفوض";
}

export function RestaurantsManager({
  restaurants,
}: {
  restaurants: RestaurantRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [search, setSearch] = useState("");

  const approved = restaurants.filter(
    (r) => r.approvalStatus === "APPROVED"
  ).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) =>
      [r.name, r.address, r.phone, r.description, r.openHours]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [restaurants, search]);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-6 py-8 text-white sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-48 w-48 rounded-full bg-orchid/30 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              الضيافة
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              المطاعم
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
              اختر بطاقة مطعم لفتح صفحة التفاصيل.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light">
                  إضافة مطعم
                </Button>
              </DialogTrigger>
              <BusinessFormDialog title="إضافة مطعم">
                <BusinessForm
                  action={(fd) => {
                    start(async () => {
                      const res = await createRestaurant(fd);
                      if (res.success) {
                        setOpen(false);
                        router.refresh();
                        await Swal.fire({
                          icon: "success",
                          title: "تمت الإضافة",
                        });
                      } else {
                        await Swal.fire({ icon: "error", title: res.error });
                      }
                    });
                  }}
                >
                  <Field label="اسم المطعم *" htmlFor="restaurant-name">
                    <Input id="restaurant-name" name="name" required />
                  </Field>
                  <FieldRow>
                    <Field label="العنوان *" htmlFor="restaurant-address">
                      <Input id="restaurant-address" name="address" required />
                    </Field>
                    <Field label="الموقع" htmlFor="restaurant-location">
                      <Input id="restaurant-location" name="location" />
                    </Field>
                  </FieldRow>
                  <FieldRow>
                    <Field label="الهاتف" htmlFor="restaurant-phone">
                      <Input id="restaurant-phone" name="phone" />
                    </Field>
                    <Field label="ساعات العمل" htmlFor="restaurant-hours">
                      <Input
                        id="restaurant-hours"
                        name="openHours"
                        placeholder="مثال: 10 ص — 12 م"
                      />
                    </Field>
                  </FieldRow>
                  <FieldRow>
                    <Field label="السعة" htmlFor="restaurant-capacity">
                      <Input
                        id="restaurant-capacity"
                        name="capacity"
                        type="number"
                        min={1}
                        defaultValue={20}
                      />
                    </Field>
                    <div className="hidden sm:block" />
                  </FieldRow>
                  <Field label="الوصف" htmlFor="restaurant-description">
                    <Input id="restaurant-description" name="description" />
                  </Field>
                  <ImagesField name="restaurantImages" label="صور المطعم" />
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
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-white/25 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
            >
              <Link href="/restaurant-bookings">الحجوزات</Link>
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
        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
          <Metric label="مطاعم" value={restaurants.length} />
          <Metric label="معتمدة" value={approved} />
        </div>
      </header>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ابحث باسم المطعم أو العنوان…"
        className="h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-card dark:text-foreground"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {filtered.map((r) => {
          const cover = r.images[0] ?? r.imageUrl;
          return (
            <Link
              key={r.id}
              href={`/restaurants/${r.id}`}
              className="group overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-plum/10 transition hover:-translate-y-0.5 hover:ring-orchid/40 dark:bg-card dark:ring-orchid/20 dark:hover:ring-orchid/50"
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={r.name}
                  className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.02] sm:h-44"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-36 items-center justify-center bg-mist text-sm text-dusk/40 dark:bg-muted dark:text-muted-foreground">
                  بلا صورة
                </div>
              )}

              <div className="space-y-3 p-5 text-start">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="font-display text-xl text-dusk group-hover:text-orchid dark:text-foreground dark:group-hover:text-orchid-light">
                    {r.name}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusPill
                      tone={
                        r.approvalStatus === "APPROVED"
                          ? "ok"
                          : r.approvalStatus === "PENDING"
                            ? "warn"
                            : "bad"
                      }
                    >
                      {approvalLabel(r.approvalStatus)}
                    </StatusPill>
                    <StatusPill tone={r.isActive ? "info" : "muted"}>
                      {r.isActive ? "نشط" : "موقوف"}
                    </StatusPill>
                  </div>
                </div>
                <p className="line-clamp-1 text-sm text-dusk/55 dark:text-muted-foreground">
                  {r.address ?? "بدون عنوان"}
                </p>
                <p className="text-xs text-dusk/45 dark:text-muted-foreground">
                  سعة {r.capacity} · اضغط لعرض التفاصيل
                </p>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <p className="rounded-[1.75rem] border border-dashed border-plum/20 bg-white p-10 text-center text-sm text-dusk/50 sm:col-span-2 dark:border-orchid/25 dark:bg-card dark:text-muted-foreground">
            {restaurants.length === 0
              ? "لا يوجد مطعم بعد"
              : "لا نتائج مطابقة للبحث"}
          </p>
        )}
      </div>
    </div>
  );
}

export function RestaurantDetailManager({
  restaurant,
}: {
  restaurant: RestaurantRow;
}) {
  const cover =
    toDisplayImageUrl(restaurant.images[0] ?? restaurant.imageUrl) ||
    restaurant.images[0] ||
    restaurant.imageUrl;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Button
        asChild
        variant="outline"
        className="rounded-xl border-plum/20 dark:border-orchid/30"
      >
        <Link href="/restaurants">← العودة للمطاعم</Link>
      </Button>

      <article className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={restaurant.name}
            className="h-52 w-full object-cover sm:h-64"
          />
        ) : (
          <div className="flex h-40 items-center justify-center bg-mist text-sm text-dusk/40 dark:bg-muted dark:text-muted-foreground">
            بلا صورة
          </div>
        )}

        <div className="space-y-5 p-5 text-start sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid dark:text-orchid-light">
                تفاصيل المطعم
              </p>
              <h1 className="mt-2 font-display text-3xl text-dusk dark:text-foreground sm:text-4xl">
                {restaurant.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill
                tone={
                  restaurant.approvalStatus === "APPROVED"
                    ? "ok"
                    : restaurant.approvalStatus === "PENDING"
                      ? "warn"
                      : "bad"
                }
              >
                {approvalLabel(restaurant.approvalStatus)}
              </StatusPill>
              <StatusPill tone={restaurant.isActive ? "info" : "muted"}>
                {restaurant.isActive ? "نشط" : "موقوف"}
              </StatusPill>
            </div>
          </div>

          <dl className="grid gap-3 rounded-2xl bg-mist/70 p-4 ring-1 ring-plum/10 dark:bg-background dark:ring-orchid/15 sm:grid-cols-2">
            <Detail label="العنوان" value={restaurant.address ?? "—"} />
            <Detail label="الهاتف" value={restaurant.phone ?? "—"} dir="ltr" />
            <Detail label="السعة" value={`${restaurant.capacity} ضيف`} />
            <Detail label="ساعات العمل" value={restaurant.openHours ?? "—"} />
            <div>
              <dt className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                الموقع
              </dt>
              <dd className="mt-2">
                <LocationMapIcon location={restaurant.location} />
              </dd>
            </div>
            <Detail
              label="الوصف"
              value={restaurant.description ?? "لا يوجد وصف"}
              className="sm:col-span-2"
            />
          </dl>

          {restaurant.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {restaurant.images.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={toDisplayImageUrl(url) || url}
                  alt=""
                  className="h-20 w-28 shrink-0 rounded-xl object-cover ring-1 ring-plum/10 dark:ring-orchid/20"
                  loading="lazy"
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <RestaurantEdit row={restaurant} />
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-plum/20 dark:border-orchid/30"
            >
              <Link href="/restaurant-bookings">الحجوزات</Link>
            </Button>
          </div>
        </div>
      </article>

      <RestaurantMenuManager
        restaurantId={restaurant.id}
        items={restaurant.menuItems ?? []}
      />
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

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "ok" | "warn" | "bad" | "info" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 font-data text-[10px] tracking-wide",
        tone === "ok" &&
          "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
        tone === "warn" &&
          "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200",
        tone === "bad" &&
          "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
        tone === "info" &&
          "bg-orchid/10 text-orchid dark:bg-orchid/20 dark:text-orchid-light",
        tone === "muted" &&
          "bg-mist text-dusk/50 dark:bg-muted dark:text-muted-foreground"
      )}
    >
      {children}
    </span>
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

function RestaurantEdit({ row }: { row: RestaurantRow }) {
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
          تعديل المطعم
        </Button>
      </DialogTrigger>
      <BusinessFormDialog title="تعديل المطعم">
        <BusinessForm
          action={(fd) => {
            fd.set("id", row.id);
            start(async () => {
              const res = await updateRestaurant(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
              } else {
                await Swal.fire({ icon: "error", title: res.error });
              }
            });
          }}
        >
          <input type="hidden" name="id" value={row.id} />
          <Field label="اسم المطعم *" htmlFor={`restaurant-name-${row.id}`}>
            <Input
              id={`restaurant-name-${row.id}`}
              name="name"
              required
              defaultValue={row.name}
            />
          </Field>
          <FieldRow>
            <Field label="العنوان *" htmlFor={`restaurant-address-${row.id}`}>
              <Input
                id={`restaurant-address-${row.id}`}
                name="address"
                required
                defaultValue={row.address ?? ""}
              />
            </Field>
            <Field label="الموقع" htmlFor={`restaurant-location-${row.id}`}>
              <Input
                id={`restaurant-location-${row.id}`}
                name="location"
                defaultValue={row.location ?? ""}
              />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="الهاتف" htmlFor={`restaurant-phone-${row.id}`}>
              <Input
                id={`restaurant-phone-${row.id}`}
                name="phone"
                defaultValue={row.phone ?? ""}
              />
            </Field>
            <Field label="ساعات العمل" htmlFor={`restaurant-hours-${row.id}`}>
              <Input
                id={`restaurant-hours-${row.id}`}
                name="openHours"
                defaultValue={row.openHours ?? ""}
              />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="السعة" htmlFor={`restaurant-capacity-${row.id}`}>
              <Input
                id={`restaurant-capacity-${row.id}`}
                name="capacity"
                type="number"
                min={1}
                defaultValue={row.capacity}
              />
            </Field>
            <StatusField defaultActive={row.isActive} />
          </FieldRow>
          <Field label="الوصف" htmlFor={`restaurant-description-${row.id}`}>
            <Input
              id={`restaurant-description-${row.id}`}
              name="description"
              defaultValue={row.description ?? ""}
            />
          </Field>
          <ImageThumbs urls={row.images} />
          <ImagesField
            name="restaurantImages"
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

export function RestaurantBookingsManager({
  bookings,
}: {
  bookings: RestaurantBookingRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  function setStatus(id: string, status: BookingStatus) {
    start(async () => {
      await updateRestaurantBookingStatus(id, status);
      router.refresh();
    });
  }
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-3 py-6 sm:px-6">
      <header className="rounded-[2rem] bg-plum-dark px-6 py-8 text-white">
        <h1 className="font-display text-3xl">حجوزات المطعم</h1>
        <p className="mt-2 text-sm text-white/70">متابعة طلبات حجز الطاولات.</p>
      </header>
      <div className="overflow-x-auto rounded-[1.75rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-plum/10 text-start dark:border-orchid/15">
              <th className="p-3 font-data text-[11px] text-orchid">الضيف</th>
              <th className="p-3 font-data text-[11px] text-orchid">المطعم</th>
              <th className="p-3 font-data text-[11px] text-orchid">الوقت</th>
              <th className="p-3 font-data text-[11px] text-orchid">الضيوف</th>
              <th className="p-3 font-data text-[11px] text-orchid">الحالة</th>
              <th className="p-3 font-data text-[11px] text-orchid">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr
                key={b.id}
                className="border-b border-plum/5 dark:border-orchid/10"
              >
                <td className="p-3 text-dusk dark:text-foreground">
                  {b.guestName}
                </td>
                <td className="p-3 text-dusk/70 dark:text-muted-foreground">
                  {b.restaurantName}
                </td>
                <td className="p-3 text-dusk/60 dark:text-muted-foreground">
                  {new Date(b.reservedAt).toLocaleString("ar")}
                </td>
                <td className="p-3">{b.guests}</td>
                <td className="p-3">{b.status}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      disabled={pending}
                      className="rounded-xl bg-orchid text-white"
                      onClick={() => setStatus(b.id, "CONFIRMED")}
                    >
                      تأكيد
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      className="rounded-xl"
                      onClick={() => setStatus(b.id, "CANCELLED")}
                    >
                      إلغاء
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-dusk/50 dark:text-muted-foreground"
                >
                  لا توجد حجوزات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
