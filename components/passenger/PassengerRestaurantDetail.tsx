"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bookRestaurant } from "@/lib/actions/restaurant.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocationMapIcon } from "@/components/Shared/LocationMapIcon";
import Swal from "sweetalert2";

export type PassengerRestaurantDetailData = {
  id: string;
  name: string;
  address: string | null;
  location: string | null;
  phone: string | null;
  description: string | null;
  capacity: number;
  openHours: string | null;
  city: { name: string } | null;
  images: string[];
};

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground";

export default function PassengerRestaurantDetail({
  restaurant,
}: {
  restaurant: PassengerRestaurantDetailData;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const city = restaurant.city?.name?.trim() || "العراق";

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
              {restaurant.name}
            </h1>
            {(restaurant.description || restaurant.address) && (
              <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
                {restaurant.description?.trim() || restaurant.address}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/65 dark:text-muted-foreground">
              <p>
                <span className="font-data text-[10px] uppercase tracking-wider text-orchid-light">
                  السعة
                </span>{" "}
                {restaurant.capacity} ضيف
              </p>
              {restaurant.openHours?.trim() && (
                <p>
                  <span className="font-data text-[10px] uppercase tracking-wider text-orchid-light">
                    الساعات
                  </span>{" "}
                  {restaurant.openHours}
                </p>
              )}
              {restaurant.address?.trim() && restaurant.description?.trim() && (
                <p>
                  <span className="font-data text-[10px] uppercase tracking-wider text-orchid-light">
                    العنوان
                  </span>{" "}
                  {restaurant.address}
                </p>
              )}
              {restaurant.phone?.trim() && (
                <p>
                  <span className="font-data text-[10px] uppercase tracking-wider text-orchid-light">
                    هاتف
                  </span>{" "}
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="hover:text-white dark:hover:text-orchid-light"
                  >
                    {restaurant.phone}
                  </a>
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="font-data text-[10px] uppercase tracking-wider text-orchid-light">
                  الموقع
                </span>
                <LocationMapIcon location={restaurant.location} size="sm" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-orchid/30 dark:bg-transparent dark:text-foreground dark:hover:bg-orchid/15 dark:hover:text-foreground"
            >
              <Link href="/passenger/restaurants">العودة للمطاعم</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="rounded-[1.75rem] bg-white p-5 ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20 sm:p-6">
        <div className="text-start">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
            الحجز
          </p>
          <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
            احجز موعدك
          </h2>
          <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
            اختر الوقت وعدد الضيوف لإرسال طلب الحجز للمطعم.
          </p>
        </div>

        <form
          className="mt-6 grid gap-3 sm:grid-cols-2"
          action={(fd) => {
            fd.set("restaurantId", restaurant.id);
            start(async () => {
              const res = await bookRestaurant(fd);
              if (res.success) {
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم إرسال طلب الحجز",
                });
                router.push("/passenger/restaurants");
              } else {
                await Swal.fire({ icon: "error", title: res.error });
              }
            });
          }}
        >
          <input type="hidden" name="restaurantId" value={restaurant.id} />

          <div className="space-y-1.5 text-start sm:col-span-2">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              وقت الحجز
            </Label>
            <Input
              name="reservedAt"
              type="datetime-local"
              required
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5 text-start">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              عدد الضيوف (حد أقصى {restaurant.capacity})
            </Label>
            <Input
              name="guests"
              type="number"
              min={1}
              max={restaurant.capacity}
              defaultValue={2}
              className={fieldClass}
            />
          </div>

          <div className="space-y-1.5 text-start">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              ملاحظات
            </Label>
            <Input name="notes" className={fieldClass} />
          </div>

          <div className="sm:col-span-2">
            <Button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white dark:bg-orchid dark:hover:bg-orchid-light sm:w-auto sm:px-8"
            >
              {pending ? "جاري الإرسال…" : "تأكيد الحجز"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
