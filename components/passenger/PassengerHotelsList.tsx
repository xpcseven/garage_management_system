"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export type PassengerHotelCard = {
  id: string;
  name: string;
  address: string | null;
  location: string | null;
  phone: string | null;
  description: string | null;
  imageUrl: string | null;
  city: { name: string } | null;
  roomsCount: number;
};

export default function PassengerHotelsList({
  hotels,
}: {
  hotels: PassengerHotelCard[];
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-purple-800">الفنادق</h1>
        <p className="text-sm text-muted-foreground">
          اختر فندقاً لعرض الغرف المتاحة وتفاصيلها.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.map((h) => (
          <Link
            key={h.id}
            href={`/passenger/hotels/${h.id}`}
            className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-violet-300 hover:shadow-md"
          >
            <div className="relative h-36 bg-gradient-to-br from-violet-100 via-slate-50 to-cyan-50">
              {h.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={h.imageUrl}
                  alt={h.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl opacity-40">
                  🏨
                </div>
              )}
            </div>
            <div className="space-y-2 p-4 text-right">
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-violet-800">
                {h.name}
              </h2>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {h.address}
                {h.city?.name ? ` — ${h.city.name}` : ""}
              </p>
              {h.description && (
                <p className="text-sm text-slate-600 line-clamp-2">
                  {h.description}
                </p>
              )}
              <div className="flex items-center justify-between gap-2 pt-2">
                <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                  {h.roomsCount} غرفة متاحة
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="pointer-events-none group-hover:border-violet-400 group-hover:text-violet-700"
                  tabIndex={-1}
                >
                  عرض الغرف
                </Button>
              </div>
            </div>
          </Link>
        ))}

        {hotels.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground">
            لا توجد فنادق معتمدة حالياً
          </p>
        )}
      </div>
    </div>
  );
}
