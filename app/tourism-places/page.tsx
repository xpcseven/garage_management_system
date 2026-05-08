import Link from "next/link";
import { getPublicTourismPlacesForGuest } from "@/lib/actions/tourism_places.actions";

function placeGovernorate(
  p: Awaited<ReturnType<typeof getPublicTourismPlacesForGuest>>[number]
) {
  if (p.governorate) return p.governorate;
  if (!p.cityName) return "العراق";
  return p.cityRegion ? `${p.cityName} — ${p.cityRegion}` : p.cityName;
}

export default async function PublicTourismPlacesPage() {
  const places = await getPublicTourismPlacesForGuest();

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div className="text-right">
            <h1 className="text-2xl font-bold text-purple-700 sm:text-3xl">
              الأماكن السياحية
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              عرض الأماكن السياحية المتاحة للجميع.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-purple-700 hover:text-purple-900"
          >
            العودة للرئيسية
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => (
            <Link
              key={p.id}
              href={`/tourism-places/${p.id}`}
              className="relative block h-56 overflow-hidden rounded-2xl border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-slate-300 to-slate-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
              <div className="absolute bottom-0 z-10 w-full p-3 text-white">
                <h3 className="text-lg font-semibold leading-tight">{p.name}</h3>
                <p className="mt-1 text-xs text-white/80">{placeGovernorate(p)}</p>
                <p className="mt-2 line-clamp-2 text-xs text-white/90">
                  {p.description ?? "بدون وصف"}
                </p>
              </div>
            </Link>
          ))}

          {places.length === 0 && (
            <p className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
              لا توجد أماكن سياحية متاحة حالياً.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

