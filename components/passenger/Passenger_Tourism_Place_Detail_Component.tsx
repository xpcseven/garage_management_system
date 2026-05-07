"use client";

import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, MapPin, Navigation } from "lucide-react";

type Props = {
  place: TourismPlaceRow;
};

function cityLabel(p: TourismPlaceRow) {
  if (p.governorate) return p.governorate;
  if (!p.cityName) return "—";
  return p.cityRegion ? `${p.cityName} — ${p.cityRegion}` : p.cityName;
}

export default function Passenger_Tourism_Place_Detail_Component({ place }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative p-3 h-80 w-full overflow-hidden sm:h-96 lg:h-[28rem]">
        {place.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.imageUrl}
            alt={place.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700" />
        )}

        {/* طبقة التعتيم */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />

        {/* زر العودة */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            asChild
            size="sm"
            className="gap-1.5 rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 border border-white/30"
          >
            <Link href="/passenger/tourism-places">
              <ArrowRight className="h-4 w-4" />
              العودة
            </Link>
          </Button>
        </div>

        {/* العنوان فوق الصورة */}
        <div className="absolute bottom-0 inset-x-0 z-10 p-5 sm:p-7">
          <h1 className="text-2xl font-bold text-white drop-shadow-md sm:text-3xl">
            {place.name}
          </h1>
          <div className="mt-1.5 flex items-center gap-1.5 text-white/80">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="text-sm">{cityLabel(place)}</span>
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardContent className="space-y-5 p-5 sm:p-6">

            {/* الوصف */}
            <p className="text-sm leading-8 text-slate-600">
              {place.description ?? "لا يوجد وصف تفصيلي لهذا المكان حالياً."}
            </p>

            <hr className="border-slate-100" />

            {/* تفاصيل العنوان والموقع */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  العنوان
                </p>
                <p className="text-sm text-slate-700">{place.address ?? "—"}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  الموقع
                </p>
                <p className="text-sm text-slate-700">{place.location ?? "—"}</p>
              </div>
            </div>

            {/* زر الخريطة */}
            {place.location && (
              <Button
                asChild
                className="w-full gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(
                    place.location
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="h-4 w-4" />
                  فتح الموقع على الخريطة
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}