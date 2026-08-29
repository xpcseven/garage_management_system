"use client";

import Image from "next/image";
import Link from "next/link";
import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import Tourism_Place_Detail_Gallery from "@/components/Tourism_Places/Tourism_Place_Detail_Gallery";
import { Button } from "@/components/ui/button";
import { placeLocationLabel } from "@/lib/place-location-label";

const FALLBACK_IMG = "/System/Tourism_Images/all-hadar_01.png";

type Props = {
  place: TourismPlaceRow;
};

function placeCaption(p: TourismPlaceRow) {
  return placeLocationLabel(p, "العراق");
}

function placeImages(place: TourismPlaceRow) {
  if (place.images?.length) return place.images;
  if (place.imageUrl) return [place.imageUrl];
  return [];
}

export default function PublicTourismPlaceDetail({ place }: Props) {
  const images = placeImages(place);
  const cover = images[0] || FALLBACK_IMG;
  const caption = placeCaption(place);
  const description =
    place.description?.trim() ||
    "لا يوجد وصف تفصيلي لهذا المكان حالياً. يمكنك العودة لدليل المعالم أو حجز رحلة لاستكشاف المنطقة.";

  return (
    <div className="relative">
      {/* هيرو فوتوغرافي */}
      <section className="relative isolate min-h-[72vh] overflow-hidden bg-plum-dark text-white pt-20">
        <Image
          src={cover}
          alt={place.name}
          fill
          priority
          className="object-cover landing-kenburns motion-reduce:animate-none"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-plum-dark via-plum-dark/55 to-plum-dark/25"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -start-16 top-24 h-56 w-56 rounded-full bg-orchid/25 blur-3xl"
        />

        <div className="relative mx-auto flex min-h-[calc(72vh-5rem)] max-w-6xl flex-col justify-end px-4 pb-12 pt-10 sm:px-6 lg:px-8">
          <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
            {caption}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
            {place.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/70">
            {images.length > 0 && (
              <span className="rounded-full bg-white/10 px-3 py-1 font-data text-xs tracking-wide backdrop-blur-sm">
                {images.length} {images.length === 1 ? "صورة" : "صور"}
              </span>
            )}
            <span className="text-white/50">اضغط الصور أدناه للتكبير</span>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/tourism-places">العودة للمعالم</Link>
            </Button>
            <Button asChild className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light">
              <Link href="/passenger/trips">احجز رحلة</Link>
            </Button>
            {place.location?.trim() && (
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white"
              >
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(
                    place.location
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  فتح على الخريطة
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* المعرض والمحتوى */}
      <section className="bg-mist py-12 sm:py-16">
        <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
          {images.length > 0 && (
            <div>
              <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid">
                معرض الصور
              </p>
              <h2 className="mt-2 font-display text-2xl text-dusk sm:text-3xl">
                لقطات من المكان
              </h2>
              <div className="mt-6">
                <Tourism_Place_Detail_Gallery images={images} alt={place.name} />
              </div>
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
            <article className="text-start">
              <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid">
                عن المكان
              </p>
              <h2 className="mt-2 font-display text-2xl text-dusk sm:text-3xl">
                ماذا ستجد هنا
              </h2>
              <p className="mt-5 whitespace-pre-line text-base leading-9 text-dusk/75">
                {description}
              </p>
            </article>

            <aside className="space-y-6 border-t border-plum/10 pt-8 lg:border-t-0 lg:border-s lg:pt-0 lg:ps-8">
              <div>
                <p className="font-data text-[11px] uppercase tracking-[0.16em] text-orchid">
                  المحافظة
                </p>
                <p className="mt-2 text-sm font-semibold text-dusk">{caption}</p>
              </div>

              <div>
                <p className="font-data text-[11px] uppercase tracking-[0.16em] text-orchid">
                  العنوان
                </p>
                <p className="mt-2 text-sm leading-7 text-dusk/70">
                  {place.address?.trim() || "غير متوفر حالياً"}
                </p>
              </div>

              <div>
                <p className="font-data text-[11px] uppercase tracking-[0.16em] text-orchid">
                  إحداثيات / رابط الموقع
                </p>
                <p className="mt-2 break-all text-sm leading-7 text-dusk/70">
                  {place.location?.trim() || "غير متوفر حالياً"}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {place.location?.trim() && (
                  <Button
                    asChild
                    className="rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white"
                  >
                    <a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(
                        place.location
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      خرائط Google
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" className="rounded-xl border-plum/20">
                  <Link href="/tourism-places">تصفّح معالم أخرى</Link>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
