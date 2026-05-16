"use client";

import { useEffect, useMemo, useState } from "react";
import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TablePagination from "@/components/Shared/TablePagination";
import flagImage from "@/public/System/flags.png";
import { IRAQI_GOVERNORATES } from "@/lib/constants/iraqi-governorates";

type Props = { places: TourismPlaceRow[] };

function cityLabel(p: TourismPlaceRow) {
  if (p.governorate) return p.governorate;
  if (!p.cityName) return "—";
  return p.cityRegion ? `${p.cityName} — ${p.cityRegion}` : p.cityName;
}

export default function Passenger_Tourism_Places_Component({ places }: Props) {
  const [page, setPage] = useState(1);
  const [gov, setGov] = useState<string>("all");
  const PAGE_SIZE = 12;
  const filtered = useMemo(() => {
    if (gov === "all") return places;
    return places.filter((p) => p.governorate === gov);
  }, [places, gov]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [gov]);

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-2xl font-bold text-purple-700">الأماكن السياحية</h1>
        <p className="text-muted-foreground text-sm mt-1 text-purple-500">
          تصفح أماكن السياحة التي ترغب في زيارتها.
        </p>
      </div>

      <div className="flex items-center justify-between border-b border-purple-200 pb-4">
        <div>
          <Link
            href="/passenger/garages"
            className="text-sm font-medium text-purple-700 hover:text-purple-900"
          >
            العودة إلى الشركات السياحية للمسافر
          </Link>
        </div>

        <div>
          <Image
            src={flagImage}
            alt="علم"
            width={120}
            height={60}
            className="rounded-sm object-cover"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <CardTitle className="text-lg">القائمة</CardTitle>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">المحافظة</label>
              <select
                value={gov}
                onChange={(e) => setGov(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">الكل</option>
                {IRAQI_GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {paged.map((p) => (
              <Link
                key={p.id}
                href={`/passenger/tourism-places/${p.id}`}
                className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="relative h-56 overflow-hidden border-0">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/25" />
                  <CardContent className="absolute bottom-0 z-10 w-full p-3 text-white">
                    <div className="text-lg font-semibold leading-tight">{p.name}</div>
                    <div className="mt-1 text-xs text-white/80">{cityLabel(p)}</div>
                    <p className="mt-2 line-clamp-2 text-xs text-white/90">
                      {p.description ?? "بدون وصف"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-full p-10 text-center text-muted-foreground">
                لا توجد أماكن سياحية مطابقة لهذا الفلتر.
              </div>
            )}
          </div>
        </CardContent>
        <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>
    </div>
  );
}

