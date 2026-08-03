import Image from "next/image";
import Link from "next/link";
import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import { Button } from "@/components/ui/button";

const FALLBACK_IMG = "/System/Tourism_Images/all-hadar_01.png";

function placeCaption(p: TourismPlaceRow) {
  if (p.governorate) return p.governorate;
  if (!p.cityName) return "العراق";
  return p.cityRegion ? `${p.cityName} — ${p.cityRegion}` : p.cityName;
}

/** اقتباس عربي قصير للواجهة — بدون فقرات إنجليزية طويلة */
function shortBlurb(raw: string | null | undefined, max = 140) {
  if (!raw) return "وجهة تستحق أن تُرى وتُروى قبل أن تُحجز.";
  const arabicOnly = raw
    .replace(/[A-Za-z][A-Za-z0-9\s.,'"’“”\-—():;/\\&%]*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const text = arabicOnly || raw.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

type Props = {
  places: TourismPlaceRow[];
};

export default function LandingPlaces({ places }: Props) {
  const [featured, ...others] = places;
  const grid = others.slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -start-24 top-24 h-72 w-72 rounded-full bg-orchid/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -end-16 bottom-10 h-64 w-64 rounded-full bg-plum/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-lg text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid">
              معالم العراق
            </p>
            <h2 className="mt-3 font-display text-4xl leading-[1.15] text-plum sm:text-5xl">
              وجهات تُختار بالعين
            </h2>
            <p className="mt-4 text-sm leading-8 text-dusk/65 sm:text-base">
              صورة، اسم، وموقع — ثم أكمل رحلتك عبر شركة سياحية أو باقة إقامة
              وضيافة.
            </p>
          </div>
          <Button asChild variant="outline" className="self-start rounded-xl sm:self-auto">
            <Link href="/tourism-places">تصفّح كل المعالم</Link>
          </Button>
        </div>

        {!featured ? (
          <p className="mt-16 text-center text-sm text-dusk/50">
            جرّب العودة لاحقاً — لا معالم معروضة حالياً.
          </p>
        ) : (
          <>
            {/* المعلم المميز: صورة + نص قصير جنبًا إلى جنب */}
            <div className="mt-14 grid items-stretch gap-0 overflow-hidden rounded-[2rem] bg-mist lg:grid-cols-2">
              <Link
                href={`/tourism-places/${featured.id}`}
                className="group relative min-h-[20rem] overflow-hidden sm:min-h-[24rem]"
              >
                <Image
                  src={featured.imageUrl || FALLBACK_IMG}
                  alt={featured.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/40 via-transparent to-transparent opacity-80" />
              </Link>

              <div className="flex flex-col justify-center px-6 py-8 text-start sm:px-10 sm:py-12">
                <p className="font-data text-xs tracking-[0.18em] text-orchid">
                  {placeCaption(featured)}
                </p>
                <h3 className="mt-3 font-display text-3xl text-dusk sm:text-4xl">
                  {featured.name}
                </h3>
                <p className="mt-4 text-sm leading-8 text-dusk/65 sm:text-[15px]">
                  {shortBlurb(featured.description, 160)}
                </p>
                <div className="mt-8">
                  <Button asChild className="rounded-xl px-6">
                    <Link href={`/tourism-places/${featured.id}`}>
                      اعرض التفاصيل
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* شبكة أنيقة للمعالم الأخرى */}
            {grid.length > 0 && (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {grid.map((p) => (
                  <Link
                    key={p.id}
                    href={`/tourism-places/${p.id}`}
                    className="group relative isolate aspect-[4/3] overflow-hidden rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum focus-visible:ring-offset-2"
                  >
                    <Image
                      src={p.imageUrl || FALLBACK_IMG}
                      alt={p.name}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dusk/85 via-dusk/25 to-transparent transition group-hover:from-plum-dark/90" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-start text-white">
                      <p className="font-data text-[10px] tracking-[0.16em] text-white/70">
                        {placeCaption(p)}
                      </p>
                      <p className="mt-1 text-lg font-bold leading-snug">
                        {p.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
