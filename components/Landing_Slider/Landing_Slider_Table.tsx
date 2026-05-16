"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LandingSliderSlideRow } from "@/lib/actions/landing_slider.actions";
import { deleteLandingSliderSlide } from "@/lib/actions/landing_slider.actions";
import { DEFAULT_LANDING_SLIDER } from "@/lib/constants/landing-slider";
import Landing_Slider_Update from "./Landing_Slider_Update";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Swal from "sweetalert2";

type Props = {
  slides: LandingSliderSlideRow[];
};

export default function Landing_Slider_Table({ slides }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-800">
          شرائح السلايدر
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="group relative h-56 overflow-hidden rounded-2xl shadow-md ring-2 ring-purple-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={DEFAULT_LANDING_SLIDER.src}
              alt={DEFAULT_LANDING_SLIDER.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 top-0 z-10 flex justify-end p-3">
              <Badge className="bg-purple-600">افتراضية — ثابتة</Badge>
            </div>
            <div className="absolute bottom-0 z-10 w-full p-4 text-white">
              <h3 className="text-lg font-semibold">{DEFAULT_LANDING_SLIDER.title}</h3>
              <p className="mt-1 text-xs text-white/80">لا يمكن تعديلها أو حذفها</p>
            </div>
          </div>

          {slides.map((slide) => (
            <div
              key={slide.id}
              className="group relative h-56 overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3">
                <Badge variant={slide.isActive ? "default" : "secondary"}>
                  {slide.isActive ? "نشطة" : "مخفية"}
                </Badge>
                <div className="flex gap-2">
                  <Landing_Slider_Update slide={slide} />
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
                        const res = await deleteLandingSliderSlide(slide.id);
                        if (res.success) {
                          router.refresh();
                          await Swal.fire({
                            icon: "success",
                            title: "تم الحذف",
                            timer: 1800,
                            showConfirmButton: false,
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
                    🗑️
                  </Button>
                </div>
              </div>
              <div className="absolute bottom-0 z-10 w-full p-4 text-white">
                <h3 className="text-lg font-semibold">{slide.title}</h3>
                <p className="mt-1 text-xs text-white/80">ترتيب: {slide.sortOrder}</p>
              </div>
            </div>
          ))}

          {slides.length === 0 && (
            <p className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600 sm:col-span-2 lg:col-span-2">
              لا توجد شرائح إضافية. الشريحة الافتراضية تظهر دائماً في الصفحة الرئيسية.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
