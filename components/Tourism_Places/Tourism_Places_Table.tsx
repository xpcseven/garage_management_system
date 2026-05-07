"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import { deleteTourismPlace } from "@/lib/actions/tourism_places.actions";
import Tourism_Places_Update from "./Tourism_Places_Update";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import TablePagination from "@/components/Shared/TablePagination";
import { MapPin, Trash2 } from "lucide-react";

type Props = { places: TourismPlaceRow[] };

function fmtCity(p: TourismPlaceRow) {
  if (p.governorate) return p.governorate;
  if (!p.cityName) return "—";
  return p.cityRegion ? `${p.cityName} — ${p.cityRegion}` : p.cityName;
}

export default function Tourism_Places_Table({ places }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const totalPages = Math.max(1, Math.ceil(places.length / PAGE_SIZE));
  const pagedPlaces = useMemo(
    () => places.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [places, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-800">
          قائمة الأماكن السياحية
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pagedPlaces.map((p) => (
            <div
              key={p.id}
              className="group relative h-64 overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl"
            >
              {/* صورة الخلفية */}
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700" />
              )}

              {/* طبقة التعتيم التدريجية */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              {/* شريط الأزرار العلوي */}
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3">
                {/* أزرار التعديل والحذف */}
                <div className="flex items-center gap-2">
                  <Tourism_Places_Update place={p} iconOnly />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-red-500/80 shadow backdrop-blur-sm hover:bg-red-600 hover:scale-105 transition-all duration-200"
                    disabled={pending}
                    onClick={async () => {
                      const confirmed = await Swal.fire({
                        icon: "warning",
                        title: "تأكيد الحذف",
                        text: "هل تريد حذف هذا المكان؟",
                        showCancelButton: true,
                        confirmButtonText: "نعم، حذف",
                        cancelButtonText: "إلغاء",
                      });
                      if (!confirmed.isConfirmed) return;
                      start(async () => {
                        const res = await deleteTourismPlace(p.id);
                        if (res.success) {
                          router.refresh();
                          await Swal.fire({
                            icon: "success",
                            title: "تم الحذف",
                            text: "تم حذف المكان بنجاح",
                            confirmButtonText: "موافق",
                          });
                        } else {
                          await Swal.fire({
                            icon: "error",
                            title: "تعذر الحذف",
                            text: res.error,
                            confirmButtonText: "حسناً",
                          });
                        }
                      });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* شارة الحالة */}
                {p.isActive ? (
                  <Badge className="rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[11px] font-medium text-white shadow backdrop-blur-sm hover:bg-emerald-500">
                    نشط
                  </Badge>
                ) : (
                  <Badge className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium text-white/90 shadow backdrop-blur-sm">
                    موقوف
                  </Badge>
                )}
              </div>

              {/* محتوى الكارد السفلي */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white">
                <h3 className="truncate text-base font-bold leading-snug drop-shadow">
                  {p.name}
                </h3>

                <div className="mt-1 flex items-center gap-1 text-white/75">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate text-[11px]">{fmtCity(p)}</span>
                </div>

                <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-white/80">
                  {p.description ?? "بدون وصف"}
                </p>
              </div>
            </div>
          ))}

          {places.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
              <MapPin className="h-10 w-10 opacity-30" />
              <p className="text-sm">لا توجد أماكن سياحية مضافة بعد</p>
            </div>
          )}
        </div>
      </CardContent>

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </Card>
  );
}