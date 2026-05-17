"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { HomeSliderSlideRow } from "@/lib/actions/home_slider.actions";
import { deleteHomeSliderSlide } from "@/lib/actions/home_slider.actions";
import Home_Slider_Update from "./Home_Slider_Update";
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
import { Trash2 } from "lucide-react";

type Props = { slides: HomeSliderSlideRow[] };

export default function Home_Slider_Table({ slides }: Props) {
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

  if (slides.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          لا توجد شرائح بعد. أضف صوراً لعرضها في سلايدر الصفحة الرئيسية.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-800">
          شرائح السلايدر ({slides.length})
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pagedSlides.map((s) => (
            <div
              key={s.id}
              className="group relative h-56 overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl"
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
                  <Home_Slider_Update slide={s} iconOnly />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-red-500/80 shadow backdrop-blur-sm hover:bg-red-600"
                    disabled={pending}
                    onClick={async () => {
                      const confirmed = await Swal.fire({
                        icon: "warning",
                        title: "تأكيد الحذف",
                        text: "هل تريد حذف هذه الشريحة؟",
                        showCancelButton: true,
                        confirmButtonText: "نعم، حذف",
                        cancelButtonText: "إلغاء",
                      });
                      if (!confirmed.isConfirmed) return;
                      start(async () => {
                        const res = await deleteHomeSliderSlide(s.id);
                        if (res.success) {
                          router.refresh();
                          await Swal.fire({
                            icon: "success",
                            title: "تم الحذف",
                            timer: 1500,
                            showConfirmButton: false,
                          });
                        } else {
                          await Swal.fire({
                            icon: "error",
                            title: "تعذر الحذف",
                            text: res.error,
                          });
                        }
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Badge
                  variant={s.isActive ? "default" : "secondary"}
                  className="bg-black/50 text-white backdrop-blur-sm"
                >
                  {s.isActive ? "نشطة" : "مخفية"}
                </Badge>
              </div>

              <div className="absolute bottom-0 z-10 w-full p-4 text-white">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-xs text-white/80">ترتيب: {s.sortOrder}</p>
              </div>
            </div>
          ))}
        </div>

        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  );
}
