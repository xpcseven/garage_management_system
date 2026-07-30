"use client";

import { useState, useTransition } from "react";
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
import type { BookingStatus } from "@prisma/client";
import Swal from "sweetalert2";

export function RestaurantsManager({
  restaurants,
}: {
  restaurants: RestaurantRow[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">مطعمي</h1>
          <p className="text-sm text-muted-foreground">
            أدر موقع المطعم والسعة وساعات العمل والصور.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>إضافة مطعم</Button>
          </DialogTrigger>
          <BusinessFormDialog title="إضافة مطعم">
            <BusinessForm
              action={(fd) => {
                start(async () => {
                  const res = await createRestaurant(fd);
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
              <Field label="اسم المطعم *" htmlFor="restaurant-name">
                <Input
                  id="restaurant-name"
                  name="name"
                  required
                  placeholder="اسم المطعم"
                />
              </Field>

              <FieldRow>
                <Field label="العنوان *" htmlFor="restaurant-address">
                  <Input
                    id="restaurant-address"
                    name="address"
                    required
                    placeholder="العنوان التفصيلي"
                  />
                </Field>
                <Field
                  label="الموقع"
                  htmlFor="restaurant-location"
                  hint="رابط Google Maps أو إحداثيات"
                >
                  <Input
                    id="restaurant-location"
                    name="location"
                    placeholder="رابط الخريطة أو العنوان"
                  />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="الهاتف" htmlFor="restaurant-phone">
                  <Input
                    id="restaurant-phone"
                    name="phone"
                    placeholder="07xx xxx xxxx"
                  />
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
                <Field label="السعة (عدد الضيوف)" htmlFor="restaurant-capacity">
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
                <Input
                  id="restaurant-description"
                  name="description"
                  placeholder="نبذة مختصرة عن المطعم"
                />
              </Field>

              <ImagesField name="restaurantImages" label="صور المطعم" />

              <Button type="submit" disabled={pending} className="w-full">
                حفظ
              </Button>
            </BusinessForm>
          </BusinessFormDialog>
        </Dialog>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-right">
              <th className="p-3">الاسم</th>
              <th className="p-3">العنوان</th>
              <th className="p-3">السعة</th>
              <th className="p-3">الاعتماد</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3">{r.address}</td>
                <td className="p-3">{r.capacity}</td>
                <td className="p-3">
                  <Badge variant="secondary">{r.approvalStatus}</Badge>
                </td>
                <td className="p-3">
                  <RestaurantEdit row={r} />
                </td>
              </tr>
            ))}
            {restaurants.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  لا يوجد مطعم بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
        <Button size="sm" variant="outline">
          تعديل
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
                placeholder="رابط الخريطة أو العنوان"
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
            <Field
              label="السعة (عدد الضيوف)"
              htmlFor={`restaurant-capacity-${row.id}`}
            >
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
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <h1 className="text-2xl font-bold text-purple-700">حجوزات المطعم</h1>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-right">
              <th className="p-3">الضيف</th>
              <th className="p-3">المطعم</th>
              <th className="p-3">الوقت</th>
              <th className="p-3">الضيوف</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="p-3">{b.guestName}</td>
                <td className="p-3">{b.restaurantName}</td>
                <td className="p-3">
                  {new Date(b.reservedAt).toLocaleString("ar")}
                </td>
                <td className="p-3">{b.guests}</td>
                <td className="p-3">
                  <Badge>{b.status}</Badge>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() => setStatus(b.id, "CONFIRMED")}
                    >
                      تأكيد
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
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
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
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
