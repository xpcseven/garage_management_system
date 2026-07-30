"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, MapPin, Phone, Users } from "lucide-react";
import { bookRestaurant } from "@/lib/actions/restaurant.actions";
import Tourism_Place_Detail_Gallery from "@/components/Tourism_Places/Tourism_Place_Detail_Gallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function placeMapUrl(location: string): string {
  const trimmed = location.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

export default function PassengerRestaurantDetail({
  restaurant,
}: {
  restaurant: PassengerRestaurantDetailData;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/passenger/restaurants">← العودة للمطاعم</Link>
        </Button>
      </div>

      <Tourism_Place_Detail_Gallery
        images={restaurant.images}
        alt={restaurant.name}
      />

      <section className="space-y-3 text-right">
        <h1 className="text-2xl font-bold text-emerald-900 sm:text-3xl">
          {restaurant.name}
        </h1>
        <p className="text-sm text-slate-500">
          {[restaurant.address, restaurant.city?.name]
            .filter(Boolean)
            .join(" — ") || "العنوان غير محدد"}
        </p>

        <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-700" />
            سعة {restaurant.capacity} ضيف
          </span>
          {restaurant.openHours && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-700" />
              {restaurant.openHours}
            </span>
          )}
          {restaurant.phone && (
            <a
              href={`tel:${restaurant.phone}`}
              className="inline-flex items-center gap-1.5 hover:text-emerald-700"
              dir="ltr"
            >
              <Phone className="h-4 w-4" />
              {restaurant.phone}
            </a>
          )}
          {restaurant.location && (
            <a
              href={placeMapUrl(restaurant.location)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900"
            >
              <MapPin className="h-4 w-4" />
              الموقع على الخريطة
            </a>
          )}
        </div>

        {restaurant.description && (
          <p className="leading-7 text-slate-700">{restaurant.description}</p>
        )}
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-right text-lg font-bold text-emerald-900">
          حجز المطعم
        </h2>
        <form
          className="space-y-3 text-right"
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

          <div className="space-y-1">
            <Label>وقت الحجز</Label>
            <Input name="reservedAt" type="datetime-local" required />
          </div>

          <div className="space-y-1">
            <Label>عدد الضيوف (حد أقصى {restaurant.capacity})</Label>
            <Input
              name="guests"
              type="number"
              min={1}
              max={restaurant.capacity}
              defaultValue={2}
            />
          </div>

          <div className="space-y-1">
            <Label>ملاحظات</Label>
            <Input name="notes" />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-violet-500 text-white hover:bg-violet-600"
          >
            تأكيد الحجز
          </Button>
        </form>
      </section>
    </div>
  );
}
