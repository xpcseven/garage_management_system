"use client";

import { useState, useTransition } from "react";
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

export function FarmsManager({ farms }: { farms: FarmRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">مزرعتي</h1>
          <p className="text-sm text-muted-foreground">
            أدر موقع المزرعة والسعة والمرافق والصور.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>إضافة مزرعة</Button>
          </DialogTrigger>
          <BusinessFormDialog title="إضافة مزرعة">
            <BusinessForm
              action={(fd) => {
                start(async () => {
                  const res = await createFarm(fd);
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
              <Field label="اسم المزرعة *" htmlFor="farm-name">
                <Input
                  id="farm-name"
                  name="name"
                  required
                  placeholder="اسم المزرعة"
                />
              </Field>

              <FieldRow>
                <Field label="العنوان *" htmlFor="farm-address">
                  <Input
                    id="farm-address"
                    name="address"
                    required
                    placeholder="العنوان التفصيلي"
                  />
                </Field>
                <Field
                  label="الموقع"
                  htmlFor="farm-location"
                  hint="رابط Google Maps أو إحداثيات"
                >
                  <Input
                    id="farm-location"
                    name="location"
                    placeholder="رابط الخريطة أو العنوان"
                  />
                </Field>
              </FieldRow>

              <FieldRow>
                <Field label="الهاتف" htmlFor="farm-phone">
                  <Input
                    id="farm-phone"
                    name="phone"
                    placeholder="07xx xxx xxxx"
                  />
                </Field>
                <Field label="السعة (عدد الضيوف)" htmlFor="farm-capacity">
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
                <Input
                  id="farm-description"
                  name="description"
                  placeholder="نبذة مختصرة عن المزرعة"
                />
              </Field>

              <ImagesField name="farmImages" label="صور المزرعة" />

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
            {farms.map((f) => (
              <tr key={f.id} className="border-b">
                <td className="p-3 font-medium">{f.name}</td>
                <td className="p-3">{f.address}</td>
                <td className="p-3">{f.capacity}</td>
                <td className="p-3">
                  <Badge variant="secondary">{f.approvalStatus}</Badge>
                </td>
                <td className="p-3">
                  <FarmEdit row={f} />
                </td>
              </tr>
            ))}
            {farms.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  لا توجد مزرعة بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
        <Button size="sm" variant="outline">
          تعديل
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
                placeholder="رابط الخريطة أو العنوان"
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
            <Field label="السعة (عدد الضيوف)" htmlFor={`farm-capacity-${row.id}`}>
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
          <ImagesField
            name="farmImages"
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
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <h1 className="text-2xl font-bold text-purple-700">حجوزات المزرعة</h1>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-right">
              <th className="p-3">الضيف</th>
              <th className="p-3">المزرعة</th>
              <th className="p-3">من</th>
              <th className="p-3">إلى</th>
              <th className="p-3">المناسبة</th>
              <th className="p-3">الضيوف</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="p-3">{b.guestName}</td>
                <td className="p-3">{b.farmName}</td>
                <td className="p-3 whitespace-nowrap">
                  {new Date(b.startAt).toLocaleString("ar")}
                </td>
                <td className="p-3 whitespace-nowrap">
                  {new Date(b.endAt).toLocaleString("ar")}
                </td>
                <td className="p-3">{b.occasionLabel}</td>
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
                <td colSpan={8} className="p-6 text-center text-muted-foreground">
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
