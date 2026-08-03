"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FarmRow, FarmBookingRow } from "@/lib/actions/farm.actions";
import {
  createFarm,
  updateFarm,
  updateFarmBookingStatus,
} from "@/lib/actions/farm.actions";
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

function approvalLabel(s: FarmRow["approvalStatus"]) {
  if (s === "APPROVED") return "معتمد";
  if (s === "PENDING") return "بانتظار الموافقة";
  return "مرفوض";
}

export function FarmsManager({ farms }: { farms: FarmRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [search, setSearch] = useState("");

  const approved = farms.filter((f) => f.approvalStatus === "APPROVED").length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return farms;
    return farms.filter((f) =>
      [f.name, f.address, f.phone, f.description, f.amenities]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [farms, search]);

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
              المزارع
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
              اختر بطاقة مزرعة لفتح صفحة التفاصيل.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light">
                  إضافة مزرعة
                </Button>
              </DialogTrigger>
              <BusinessFormDialog title="إضافة مزرعة">
                <BusinessForm
                  action={(fd) => {
                    start(async () => {
                      const res = await createFarm(fd);
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
                  <Field label="اسم المزرعة *" htmlFor="farm-name">
                    <Input id="farm-name" name="name" required />
                  </Field>
                  <FieldRow>
                    <Field label="العنوان *" htmlFor="farm-address">
                      <Input id="farm-address" name="address" required />
                    </Field>
                    <Field label="الموقع" htmlFor="farm-location">
                      <Input id="farm-location" name="location" />
                    </Field>
                  </FieldRow>
                  <FieldRow>
                    <Field label="الهاتف" htmlFor="farm-phone">
                      <Input id="farm-phone" name="phone" />
                    </Field>
                    <Field label="السعة" htmlFor="farm-capacity">
                      <Input
                        id="farm-capacity"
                        name="capacity"
                        type="number"
                        min={1}
                        defaultValue={30}
                      />
                    </Field>
                  </FieldRow>
                  <Field label="المرافق" htmlFor="farm-amenities">
                    <Input
                      id="farm-amenities"
                      name="amenities"
                      placeholder="مثال: مسبح، شواء، جلسات خارجية"
                    />
                  </Field>
                  <Field label="الوصف" htmlFor="farm-description">
                    <Input id="farm-description" name="description" />
                  </Field>
                  <ImagesField name="farmImages" label="صور المزرعة" />
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
              <Link href="/farm-bookings">الحجوزات</Link>
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
          <Metric label="مزارع" value={farms.length} />
          <Metric label="معتمدة" value={approved} />
        </div>
      </header>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ابحث باسم المزرعة أو العنوان…"
        className="h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-card dark:text-foreground"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {filtered.map((f) => {
          const cover = f.images[0] ?? f.imageUrl;
          return (
            <Link
              key={f.id}
              href={`/farms/${f.id}`}
              className="group overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-plum/10 transition hover:-translate-y-0.5 hover:ring-orchid/40 dark:bg-card dark:ring-orchid/20 dark:hover:ring-orchid/50"
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={f.name}
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
                    {f.name}
                  </h2>
                  <div className="flex flex-wrap gap-1.5">
                    <StatusPill
                      tone={
                        f.approvalStatus === "APPROVED"
                          ? "ok"
                          : f.approvalStatus === "PENDING"
                            ? "warn"
                            : "bad"
                      }
                    >
                      {approvalLabel(f.approvalStatus)}
                    </StatusPill>
                    <StatusPill tone={f.isActive ? "info" : "muted"}>
                      {f.isActive ? "نشط" : "موقوف"}
                    </StatusPill>
                  </div>
                </div>
                <p className="line-clamp-1 text-sm text-dusk/55 dark:text-muted-foreground">
                  {f.address ?? "بدون عنوان"}
                </p>
                <p className="text-xs text-dusk/45 dark:text-muted-foreground">
                  سعة {f.capacity} · اضغط لعرض التفاصيل
                </p>
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <p className="rounded-[1.75rem] border border-dashed border-plum/20 bg-white p-10 text-center text-sm text-dusk/50 sm:col-span-2 dark:border-orchid/25 dark:bg-card dark:text-muted-foreground">
            {farms.length === 0 ? "لا توجد مزرعة بعد" : "لا نتائج مطابقة للبحث"}
          </p>
        )}
      </div>
    </div>
  );
}

export function FarmDetailManager({ farm }: { farm: FarmRow }) {
  const cover = farm.images[0] ?? farm.imageUrl;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Button
        asChild
        variant="outline"
        className="rounded-xl border-plum/20 dark:border-orchid/30"
      >
        <Link href="/farms">← العودة للمزارع</Link>
      </Button>

      <article className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={farm.name}
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
                تفاصيل المزرعة
              </p>
              <h1 className="mt-2 font-display text-3xl text-dusk dark:text-foreground sm:text-4xl">
                {farm.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill
                tone={
                  farm.approvalStatus === "APPROVED"
                    ? "ok"
                    : farm.approvalStatus === "PENDING"
                      ? "warn"
                      : "bad"
                }
              >
                {approvalLabel(farm.approvalStatus)}
              </StatusPill>
              <StatusPill tone={farm.isActive ? "info" : "muted"}>
                {farm.isActive ? "نشط" : "موقوف"}
              </StatusPill>
            </div>
          </div>

          <dl className="grid gap-3 rounded-2xl bg-mist/70 p-4 ring-1 ring-plum/10 dark:bg-background dark:ring-orchid/15 sm:grid-cols-2">
            <Detail label="العنوان" value={farm.address ?? "—"} />
            <Detail label="الهاتف" value={farm.phone ?? "—"} dir="ltr" />
            <Detail label="السعة" value={`${farm.capacity} ضيف`} />
            <Detail label="المرافق" value={farm.amenities ?? "—"} />
            <div>
              <dt className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                الموقع
              </dt>
              <dd className="mt-2">
                <LocationMapIcon location={farm.location} />
              </dd>
            </div>
            <Detail
              label="الوصف"
              value={farm.description ?? "لا يوجد وصف"}
              className="sm:col-span-2"
            />
          </dl>

          {farm.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {farm.images.map((url) => (
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
            <FarmEdit row={farm} />
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-plum/20 dark:border-orchid/30"
            >
              <Link href="/farm-bookings">الحجوزات</Link>
            </Button>
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

function FarmEdit({ row }: { row: FarmRow }) {
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
          تعديل المزرعة
        </Button>
      </DialogTrigger>
      <BusinessFormDialog title="تعديل المزرعة">
        <BusinessForm
          action={(fd) => {
            fd.set("id", row.id);
            start(async () => {
              const res = await updateFarm(fd);
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
          <Field label="اسم المزرعة *" htmlFor={`farm-name-${row.id}`}>
            <Input
              id={`farm-name-${row.id}`}
              name="name"
              required
              defaultValue={row.name}
            />
          </Field>
          <FieldRow>
            <Field label="العنوان *" htmlFor={`farm-address-${row.id}`}>
              <Input
                id={`farm-address-${row.id}`}
                name="address"
                required
                defaultValue={row.address ?? ""}
              />
            </Field>
            <Field label="الموقع" htmlFor={`farm-location-${row.id}`}>
              <Input
                id={`farm-location-${row.id}`}
                name="location"
                defaultValue={row.location ?? ""}
              />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="الهاتف" htmlFor={`farm-phone-${row.id}`}>
              <Input
                id={`farm-phone-${row.id}`}
                name="phone"
                defaultValue={row.phone ?? ""}
              />
            </Field>
            <Field label="السعة" htmlFor={`farm-capacity-${row.id}`}>
              <Input
                id={`farm-capacity-${row.id}`}
                name="capacity"
                type="number"
                min={1}
                defaultValue={row.capacity}
              />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="المرافق" htmlFor={`farm-amenities-${row.id}`}>
              <Input
                id={`farm-amenities-${row.id}`}
                name="amenities"
                defaultValue={row.amenities ?? ""}
              />
            </Field>
            <StatusField defaultActive={row.isActive} />
          </FieldRow>
          <Field label="الوصف" htmlFor={`farm-description-${row.id}`}>
            <Input
              id={`farm-description-${row.id}`}
              name="description"
              defaultValue={row.description ?? ""}
            />
          </Field>
          <ImageThumbs urls={row.images} />
          <ImagesField name="farmImages" label="إضافة صور" />
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

export function FarmBookingsManager({
  bookings,
}: {
  bookings: FarmBookingRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  function setStatus(id: string, status: BookingStatus) {
    start(async () => {
      await updateFarmBookingStatus(id, status);
      router.refresh();
    });
  }
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-3 py-6 sm:px-6">
      <header className="rounded-[2rem] bg-plum-dark px-6 py-8 text-white">
        <h1 className="font-display text-3xl">حجوزات المزرعة</h1>
        <p className="mt-2 text-sm text-white/70">متابعة طلبات زيارة المزرعة.</p>
      </header>
      <div className="overflow-x-auto rounded-[1.75rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-plum/10 text-start dark:border-orchid/15">
              <th className="p-3 font-data text-[11px] text-orchid">الضيف</th>
              <th className="p-3 font-data text-[11px] text-orchid">المزرعة</th>
              <th className="p-3 font-data text-[11px] text-orchid">من</th>
              <th className="p-3 font-data text-[11px] text-orchid">إلى</th>
              <th className="p-3 font-data text-[11px] text-orchid">المناسبة</th>
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
                  {b.farmName}
                </td>
                <td className="whitespace-nowrap p-3 text-dusk/60 dark:text-muted-foreground">
                  {new Date(b.startAt).toLocaleString("ar")}
                </td>
                <td className="whitespace-nowrap p-3 text-dusk/60 dark:text-muted-foreground">
                  {new Date(b.endAt).toLocaleString("ar")}
                </td>
                <td className="p-3">{b.occasionLabel}</td>
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
                  colSpan={7}
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
