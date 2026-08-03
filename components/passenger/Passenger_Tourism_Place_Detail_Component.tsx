"use client";

import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import Tourism_Place_Detail_Gallery from "@/components/Tourism_Places/Tourism_Place_Detail_Gallery";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LocationMapIcon } from "@/components/Shared/LocationMapIcon";
import { MapPin, Images } from "lucide-react";

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
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          asChild
          variant="outline"
          className="rounded-xl border-plum/20 dark:border-orchid/30"
        >
          <Link href={backHref}>← العودة للأماكن</Link>
        </Button>
        {imageCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orchid/10 px-3 py-1 font-data text-[11px] text-orchid dark:bg-orchid/20 dark:text-orchid-light">
            <Images className="h-3.5 w-3.5" />
            {imageCount} {imageCount === 1 ? "صورة" : "صور"}
          </span>
        )}
      </div>

      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-6 py-8 text-white sm:px-8 sm:py-10 dark:bg-card dark:ring-1 dark:ring-orchid/25">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-48 w-48 rounded-full bg-orchid/30 blur-3xl"
        />
        <div className="relative text-start">
          <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
            معلم سياحي
          </p>
          <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            {place.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/70 dark:text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-orchid-light" />
            <span>{cityLabel(place)}</span>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <p className="text-start text-xs text-dusk/50 dark:text-muted-foreground">
          اضغط على أي صورة لعرضها بحجم كامل
        </p>
        <Tourism_Place_Detail_Gallery images={images} alt={place.name} />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <article className="rounded-[1.75rem] bg-white p-5 ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20 sm:p-8">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
            عن المكان
          </p>
          <p className="mt-4 whitespace-pre-line text-start text-sm leading-8 text-dusk/80 dark:text-muted-foreground sm:text-base">
            {place.description?.trim() ||
              "لا يوجد وصف تفصيلي لهذا المكان حالياً."}
          </p>
        </article>

        <aside className="space-y-4 rounded-[1.75rem] bg-white p-5 ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
            معلومات الوصول
          </p>

          <div className="space-y-3 text-start">
            <div className="rounded-2xl bg-mist/70 p-4 ring-1 ring-plum/10 dark:bg-background dark:ring-orchid/15">
              <p className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                العنوان
              </p>
              <p className="mt-1 text-sm leading-7 text-dusk dark:text-foreground">
                {place.address?.trim() || "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-mist/70 p-4 ring-1 ring-plum/10 dark:bg-background dark:ring-orchid/15">
              <p className="font-data text-[10px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                الموقع
              </p>
              <div className="mt-2">
                <LocationMapIcon location={place.location} />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
