"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { HomeSliderImageRow } from "@/lib/actions/home_slider.actions";
import { deleteHomeSliderImage } from "@/lib/actions/home_slider.actions";
import Home_Slider_Create from "./Home_Slider_Create";
import Home_Slider_Update from "./Home_Slider_Update";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";

type Props = {
  slides: HomeSliderImageRow[];
};

function fmtDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ar-IQ", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function Home_Slider_Component({ slides }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-2xl font-bold text-purple-700">صور سلايدر الصفحة الرئيسية</h1>
        <p className="mt-1 text-sm text-purple-500">
          رفع وتعديل وحذف صور السلايدر في الصفحة الرئيسية. هذا القسم متاح للسوبر أدمن فقط.
        </p>
      </div>

      <div className="flex items-center justify-between border-b border-purple-200 pb-4">
        <Home_Slider_Create />
        <div className="rounded-full bg-purple-50 px-4 py-2 text-sm text-purple-700">
          إجمالي الصور: {slides.length}
        </div>
      </div>

      {slides.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          لا توجد صور مضافة بعد. يمكنك البدء برفع أول صورة للسلايدر.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {slides.map((slide) => (
            <article
              key={slide.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative h-56 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
                    slide.isActive
                      ? "bg-emerald-500/90 text-white"
                      : "bg-slate-900/75 text-white"
                  }`}
                >
                  {slide.isActive ? "نشطة" : "مخفية"}
                </span>
              </div>

              <div className="space-y-4 p-4 text-right">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{slide.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    ترتيب الظهور: {slide.sortOrder}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    أضيفت في: {fmtDate(slide.createdAt)}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Home_Slider_Update slide={slide} />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={pending}
                    onClick={async () => {
                      const confirmed = await Swal.fire({
                        icon: "warning",
                        title: "تأكيد الحذف",
                        text: "هل تريد حذف صورة السلايدر هذه؟",
                        showCancelButton: true,
                        confirmButtonText: "نعم، حذف",
                        cancelButtonText: "إلغاء",
                      });

                      if (!confirmed.isConfirmed) return;

                      start(async () => {
                        const res = await deleteHomeSliderImage(slide.id);
                        if (res.success) {
                          router.refresh();
                          await Swal.fire({
                            icon: "success",
                            title: "تم الحذف",
                            text: "تم حذف صورة السلايدر بنجاح",
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
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
