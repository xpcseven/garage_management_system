"use client";

import { useEffect, useMemo, useState } from "react";
import type { TourismProgramPassengerRow } from "@/lib/actions/tourism_program.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TablePagination from "@/components/Shared/TablePagination";
import PassengerTourismProgramBookButton from "./PassengerTourismProgramBookButton";

type Props = {
  programs: TourismProgramPassengerRow[];
};

export default function Passenger_Tourism_Programs_Component({ programs }: Props) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(programs.length / PAGE_SIZE));
  const paged = useMemo(
    () => programs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [programs, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-purple-800">البرامج السياحية</h1>
          <p className="text-sm text-muted-foreground mt-1">
            استعرض البرامج السياحية المتاحة واحجز مباشرة.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/passenger/trips">العودة إلى الرحلات</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">البرامج المتاحة ({programs.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 md:hidden">
            {paged.map((p) => (
              <article key={p.id} className="rounded-xl border border-muted p-3 space-y-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-base leading-6">{p.title}</h3>
                  <p className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                    {p.garageName}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div>
                    <p className="mb-1 inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                      المركبة / السائق
                    </p>
                    <p>{p.vehicleLabel}</p>
                    <p className="text-xs text-muted-foreground">{p.driverName}</p>
                  </div>
                  <div>
                    <p className="mb-1 inline-flex rounded-full bg-fuchsia-100 px-2 py-0.5 text-xs font-medium text-fuchsia-700">
                      الانطلاق
                    </p>
                    <p>{new Date(p.startAt).toLocaleString("en-US")}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <p className="mb-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        السعر
                      </p>
                      <p className="font-mono">{p.basePrice}</p>
                    </div>
                    <div>
                      <p className="mb-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        المقاعد المتاحة
                      </p>
                      <p>{p.availableSeats}</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 inline-flex rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                      الأماكن
                    </p>
                    <div className="space-y-1">
                      {p.places.map((x) => (
                        <p key={x.id} className="text-xs">
                          {x.order}. {x.name}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                <PassengerTourismProgramBookButton programId={p.id} />
              </article>
            ))}
            {programs.length === 0 && (
              <p className="rounded-xl border border-muted p-8 text-center text-muted-foreground">
                لا توجد برامج سياحية متاحة حالياً.
              </p>
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-gradient-to-l from-purple-700 via-violet-700 to-fuchsia-700 text-white shadow-sm">
                <tr className="border-b text-center">
                  <th className="p-2 font-bold border-l border-white/20">البرنامج</th>
                  <th className="p-2 font-bold border-l border-white/20">الشركة</th>
                  <th className="p-2 font-bold border-l border-white/20">المركبة / السائق</th>
                  <th className="p-2 font-bold border-l border-white/20">الأماكن</th>
                  <th className="p-2 font-bold border-l border-white/20">الانطلاق</th>
                  <th className="p-2 font-bold border-l border-white/20">السعر</th>
                  <th className="p-2 font-bold border-l border-white/20">متاح</th>
                  <th className="p-2 w-36 font-bold">حجز</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((p) => (
                  <tr key={p.id} className="border-b border-muted align-top">
                    <td className="p-2">{p.title}</td>
                    <td className="p-2">{p.garageName}</td>
                    <td className="p-2">
                      <div>{p.vehicleLabel}</div>
                      <div className="text-xs text-muted-foreground mt-1">{p.driverName}</div>
                    </td>
                    <td className="p-2">
                      <div className="max-w-[220px] space-y-1">
                        {p.places.map((x) => (
                          <div key={x.id} className="text-xs">
                            {x.order}. {x.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      {new Date(p.startAt).toLocaleString("en-US")}
                    </td>
                    <td className="p-2 font-mono whitespace-nowrap">{p.basePrice}</td>
                    <td className="p-2">{p.availableSeats}</td>
                    <td className="p-2">
                      <PassengerTourismProgramBookButton programId={p.id} />
                    </td>
                  </tr>
                ))}
                {programs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-muted-foreground">
                      لا توجد برامج سياحية متاحة حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>
    </div>
  );
}

