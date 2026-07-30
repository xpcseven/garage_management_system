"use client";

import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PassengerFarmCard = {
  id: string;
  name: string;
  address: string | null;
  location: string | null;
  phone: string | null;
  description: string | null;
  imageUrl?: string | null;
  images?: string[];
  capacity: number;
  amenities: string | null;
  city: { name: string } | null;
};

/** يفتح رابط الخرائط مباشرة، أو يبحث في Google Maps إن كان نصاً */
function farmMapUrl(location: string): string {
  const trimmed = location.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

function farmCover(farm: PassengerFarmCard): string | null {
  if (farm.images?.length) return farm.images[0];
  return farm.imageUrl ?? null;
}

export default function PassengerFarmsList({
  farms,
}: {
  farms: PassengerFarmCard[];
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="text-right">
        <h1 className="text-2xl font-bold text-emerald-800">المزارع</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          اختر مزرعة واحجز فترة الزيارة حسب المناسبة.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {farms.map((farm) => {
          const cover = farmCover(farm);
          return (
            <article
              key={farm.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md"
            >
              <div className="relative h-40 bg-gradient-to-br from-emerald-100 via-lime-50 to-teal-50">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover}
                    alt={farm.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-1 text-emerald-700/50">
                    <span className="text-4xl">🌿</span>
                    <span className="text-xs font-medium">مزرعة</span>
                  </div>
                )}

                {farm.location && (
                  <a
                    href={farmMapUrl(farm.location)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="فتح موقع المزرعة على الخريطة"
                    aria-label="فتح موقع المزرعة على الخريطة"
                    className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-700 shadow-md transition hover:bg-emerald-50 hover:text-emerald-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MapPin className="h-5 w-5" />
                  </a>
                )}

                <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                  سعة {farm.capacity} ضيف
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4 text-right">
                <div>
                  <h2 className="text-lg font-bold leading-snug text-slate-900">
                    {farm.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {[farm.address, farm.city?.name]
                      .filter(Boolean)
                      .join(" — ") || "العنوان غير محدد"}
                  </p>
                </div>

                {farm.phone && (
                  <a
                    href={`tel:${farm.phone}`}
                    className="inline-flex items-center justify-end gap-1.5 text-sm text-slate-600 hover:text-emerald-700"
                    dir="ltr"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {farm.phone}
                  </a>
                )}

                {farm.amenities && (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {farm.amenities
                      .split(/[,،|/]/)
                      .map((a) => a.trim())
                      .filter(Boolean)
                      .slice(0, 4)
                      .map((a) => (
                        <span
                          key={a}
                          className="rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-800"
                        >
                          {a}
                        </span>
                      ))}
                  </div>
                )}

                {farm.description && (
                  <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                    {farm.description}
                  </p>
                )}

                <div className="mt-auto border-t border-slate-100 pt-3">
                  <Button
                    asChild
                    className="w-full bg-violet-500 text-white hover:bg-violet-600"
                  >
                    <Link href={`/passenger/farms/${farm.id}`}>حجز المزرعة</Link>
                  </Button>
                </div>
              </div>
            </article>
          );
        })}

        {farms.length === 0 && (
          <p className="col-span-full rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center text-sm text-emerald-800/70">
            لا توجد مزارع معتمدة حالياً
          </p>
        )}
      </div>
    </div>
  );
}
