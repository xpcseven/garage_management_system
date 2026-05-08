import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import publicGarageImage from "@/public/System/Public_Garagr.png";
import outsideGarageImage from "@/public/System/Outside_Garage.png";
import { getPublicTourismPlacesForLanding } from "@/lib/actions/tourism_places.actions";
import Tourism_Img_Component from "@/components/Dashboard_Components/Tourism_Img_Component";
import Dashboard_Nav from "@/components/Dashboard_Components/Dashboard_Nav";

function placeGovernorate(
  p: Awaited<ReturnType<typeof getPublicTourismPlacesForLanding>>[number]
) {
  if (p.governorate) return p.governorate;
  if (!p.cityName) return "العراق";
  return p.cityRegion ? `${p.cityName} — ${p.cityRegion}` : p.cityName;
}

export default async function LandingPage() {
  const tourismPlaces = await getPublicTourismPlacesForLanding();

  return (
    <main className="min-h-screen bg-white text-slate-900">

      <section className="">
        <Dashboard_Nav />
      </section>

      <section>
        <Tourism_Img_Component />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-lg">
            <div className="relative h-64 sm:h-72">
              <Image
                src={publicGarageImage}
                alt="خدمات النقل العام"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/50 via-emerald-900/10 to-transparent" />
              <span className="absolute right-4 top-4 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold">
                النقل العام
              </span>
            </div>
            <div className="space-y-4 p-6 text-right">
              <h2 className="text-2xl font-bold text-emerald-700">
                تشغيل رحلات النقل العام بكفاءة
              </h2>
              <p className="text-sm leading-7 text-slate-600">
                إدارة خطوط النقل العام، تنظيم جداول الانطلاق والوصول، متابعة
                الإشغال، وتحسين تجربة الركاب عبر نظام موحد وسهل الاستخدام.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>تنظيم المسارات والمحطات</li>
                <li>متابعة الحجوزات اليومية لحظياً</li>
                <li>تحسين الالتزام بالمواعيد والجودة التشغيلية</li>
              </ul>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg">
            <div className="relative h-64 sm:h-72">
              <Image
                src={outsideGarageImage}
                alt="خدمات النقل الخارجي"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/50 via-blue-900/10 to-transparent" />
              <span className="absolute right-4 top-4 rounded-full bg-blue-500/90 px-3 py-1 text-xs font-bold">
                النقل الخارجي
              </span>
            </div>
            <div className="space-y-4 p-6 text-right">
              <h2 className="text-2xl font-bold text-blue-700">
                حلول مرنة للنقل الخارجي بين المدن
              </h2>
              <p className="text-sm leading-7 text-slate-600">
                خطّط رحلات النقل الخارجي بثقة عبر إدارة المركبات والسائقين،
                توزيع المهام، وضمان التتبع التشغيلي الكامل لكل رحلة.
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>إدارة خطوط السفر البعيدة والرحلات الطويلة</li>
                <li>تتبع المركبات والسائقين أثناء التشغيل</li>
                <li>تنسيق أفضل بين الطلبات والتحميل والانطلاق</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-purple-100 bg-purple-50/70">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 text-right sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-purple-100 bg-white p-4">
            <p className="text-sm text-slate-500">تشغيل يومي</p>
            <p className="mt-1 text-xl font-bold text-purple-600">رحلات منتظمة</p>
          </div>
          <div className="rounded-xl border border-purple-100 bg-white p-4">
            <p className="text-sm text-slate-500">إدارة ذكية</p>
            <p className="mt-1 text-xl font-bold text-purple-600">مركبات وسائقون</p>
          </div>
          <div className="rounded-xl border border-purple-100 bg-white p-4">
            <p className="text-sm text-slate-500">خدمة العملاء</p>
            <p className="mt-1 text-xl font-bold text-purple-600">حجوزات دقيقة</p>
          </div>
          <div className="rounded-xl border border-purple-100 bg-white p-4">
            <p className="text-sm text-slate-500">توسّع الأعمال</p>
            <p className="mt-1 text-xl font-bold text-purple-600">نقل عام وخارجي</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 text-right">
          <h2 className="text-2xl font-bold text-purple-700">أماكن سياحية</h2>
          <p className="mt-1 text-sm text-slate-600">
            تصفح أماكن السياحة التي ترغب في زيارتها.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {tourismPlaces.slice(0, 1).map((p) => (
              <Link
                key={p.id}
                href="/tourism-places"
                className="relative block h-72 w-full overflow-hidden rounded-2xl border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {p.imageUrl ? (
                  <Image
                    src="/System/Tourism_Images/all-hadar_01.png"
                    alt={p.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    width={500}
                    height={500}
                  />
                ) : (
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-slate-300 to-slate-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                <div className="absolute bottom-0 z-10 w-full p-3 text-white">
                  <h3 className="text-lg font-semibold leading-tight">الأماكن السياحية في العراق</h3>
                </div>
              </Link>
            ))}
            {tourismPlaces.length === 0 && (
              <p className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
                لا توجد أماكن سياحية متاحة حالياً.
              </p>
            )}
          </div>

          <aside className="rounded-2xl border border-purple-100 bg-purple-50/60 p-5 text-right">
            <h3 className="text-lg font-bold text-purple-700">السياحة في العراق</h3>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              يتميّز العراق بتنوع سياحي غني يجمع بين المواقع الأثرية، الطبيعة،
              والموروث الحضاري العريق. من الأهوار الجنوبية إلى المدن التاريخية،
              يجد الزائر تجربة فريدة تجمع التاريخ والثقافة.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              كما تُعد العتبات المقدسة في النجف الأشرف وكربلاء المقدسة وسامراء
              والكاظمية من أبرز المقاصد الدينية، وتستقبل ملايين الزائرين سنوياً،
              ما يجعل السياحة الدينية ركيزة أساسية في المشهد السياحي العراقي.
            </p>
          </aside>
        </div>
      </section>



      <section className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h3 className="text-2xl font-bold sm:text-3xl">
          آشور للسياحة و السفر - Ashuor Tourism and Travel
        </h3>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">
          انت على بعد خطوة واحدة من تنظيم رحلاتك والسفر.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className=" px-8">
            <Link href="/auth/register">إنشاء حساب</Link>
          </Button>
          <Button asChild variant="outline" className="border-purple-300 bg-white text-purple-700 hover:bg-purple-50">
            <Link href="/auth/login">الدخول للنظام</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
