"use client";

import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import Tourism_Place_Detail_Gallery from "@/components/Tourism_Places/Tourism_Place_Detail_Gallery";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  MapPin,
  Navigation,
  Images,
  FileText,
} from "lucide-react";

type Props = {
  place: TourismPlaceRow;
  backHref?: string;
};

function cityLabel(p: TourismPlaceRow) {
  if (p.governorate) return p.governorate;
  if (!p.cityName) return "العراق";
  return p.cityRegion ? `${p.cityName} — ${p.cityRegion}` : p.cityName;
}

function placeImages(place: TourismPlaceRow) {
  if (place.images?.length) return place.images;
  if (place.imageUrl) return [place.imageUrl];
  return [];
}

export default function Passenger_Tourism_Place_Detail_Component({
  place,
  backHref = "/passenger/tourism-places",
}: Props) {
  const images = placeImages(place);
  const imageCount = images.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/80 via-white to-slate-50">
      {/* شريط علوي */}
      <header className="sticky top-0 z-30 border-b border-violet-100/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 text-violet-800 hover:bg-violet-50"
          >
            <Link href={backHref}>
              <ArrowRight className="h-4 w-4" />
              العودة للأماكن
            </Link>
          </Button>
          {imageCount > 0 && (
            <Badge variant="secondary" className="gap-1 bg-violet-100 text-violet-800">
              <Images className="h-3.5 w-3.5" />
              {imageCount} {imageCount === 1 ? "صورة" : "صور"}
            </Badge>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* العنوان */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            {place.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-slate-600">
            <MapPin className="h-4 w-4 shrink-0 text-violet-600" />
            <span className="text-sm sm:text-base">{cityLabel(place)}</span>
          </div>
        </div>

        {/* معرض الصور — اضغط لتكبير */}
        <section className="mb-8">
          <p className="mb-3 text-xs text-slate-500">
            اضغط على أي صورة لعرضها بحجم كامل
          </p>
          <Tourism_Place_Detail_Gallery images={images} alt={place.name} />
        </section>

        {/* التفاصيل */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="overflow-hidden border-violet-100/80 shadow-sm">
            <CardContent className="space-y-6 p-5 sm:p-8">
              <div className="flex items-center gap-2 text-violet-800">
                <FileText className="h-5 w-5" />
                <h2 className="text-lg font-semibold">عن المكان</h2>
              </div>
              <p className="text-base leading-8 text-slate-700 whitespace-pre-line">
                {place.description?.trim() ||
                  "لا يوجد وصف تفصيلي لهذا المكان حالياً."}
              </p>
            </CardContent>
          </Card>

          <aside className="space-y-4">
            <Card className="border-violet-100/80 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <h3 className="text-sm font-semibold text-slate-800">
                  معلومات الوصول
                </h3>

                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-medium text-slate-400">
                      العنوان
                    </p>
                    <p className="text-sm leading-relaxed text-slate-700">
                      {place.address?.trim() || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-medium text-slate-400">
                      الموقع
                    </p>
                    <p className="break-all text-sm leading-relaxed text-slate-700">
                      {place.location?.trim() || "—"}
                    </p>
                  </div>
                </div>

                {place.location && (
                  <Button asChild className="w-full gap-2 rounded-xl">
                    <a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(
                        place.location
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="h-4 w-4" />
                      فتح على خرائط Google
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
