"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TourismSliderSlideRow } from "@/lib/actions/tourism_slider.actions";
import { deleteTourismSliderSlide } from "@/lib/actions/tourism_slider.actions";
import Tourism_Slider_Update from "./Tourism_Slider_Update";
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
import { ImageIcon, Trash2 } from "lucide-react";

type Props = { slides: TourismSliderSlideRow[] };

export default function Tourism_Slider_Table({ slides }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;
  const totalPages = Math.max(1, Math.ceil(slides.length / PAGE_SIZE));
  const pagedSlides = useMemo(
    () => slides.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [slides, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-800">
          صور السلايدر
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pagedSlides.map((s) => (
            <div
              key={s.id}
              className="group relative h-64 overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.imageUrl}
                alt={s.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <Tourism_Slider_Update slide={s} iconOnly />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-red-500/80 shadow backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-red-600"
                    disabled={pending}
                    onClick={async () => {
                      const confirmed = await Swal.fire({
                        icon: "warning",
                        title: "تأكيد الحذف",
                        text: "هل تريد حذف هذه الصورة من السلايدر؟",
                        showCancelButton: true,
                        confirmButtonText: "نعم، حذف",
                        cancelButtonText: "إلغاء",
                      });
                      if (!confirmed.isConfirmed) return;
                      start(async () => {
                        const res = await deleteTourismSliderSlide(s.id);
                        if (res.success) {
                          router.refresh();
                          await Swal.fire({
                            icon: "success",
                            title: "تم الحذف",
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

                {s.isActive ? (
                  <Badge className="rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[11px] font-medium text-white shadow backdrop-blur-sm">
                    نشط
                  </Badge>
                ) : (
                  <Badge className="rounded-full bg-slate-500/90 px-2.5 py-0.5 text-[11px] font-medium text-white shadow backdrop-blur-sm">
                    مخفي
                  </Badge>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white">
                <h3 className="truncate text-base font-bold leading-snug drop-shadow">
                  {s.title}
                </h3>
                <p className="mt-1 text-[11px] text-white/75">
                  ترتيب العرض: {s.sortOrder}
                </p>
              </div>
            </div>
          ))}

          {slides.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
              <ImageIcon className="h-10 w-10 opacity-30" />
              <p className="text-sm">لا توجد صور في السلايدر بعد</p>
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
