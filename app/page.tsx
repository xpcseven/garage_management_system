import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import publicGarageImage from "@/public/System/Public_Garagr.png";
import outsideGarageImage from "@/public/System/Outside_Garage.png";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,_rgba(34,197,94,0.16),_transparent_45%)]" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="mb-6 rounded-full border border-sky-300 bg-sky-50 px-4 py-1 text-sm text-sky-700">
            منصة ذكية لإدارة النقل في الكراجات
          </span>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            إدارة النقل العام والنقل الخارجي من لوحة واحدة
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            نظام متكامل يساعد الكراج على تنظيم الحركة اليومية، متابعة الرحلات،
            إدارة السائقين والمركبات، ورفع كفاءة خدمات النقل العام والخارجي.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="bg-sky-600 px-8 hover:bg-sky-500">
              <Link href="/auth/register">ابدأ الآن</Link>
            </Button>
            <Button asChild variant="outline" className="border-sky-300 bg-white text-sky-700 hover:bg-sky-50">
              <Link href="/auth/login">تسجيل الدخول</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/home">لوحة التحكم</Link>
            </Button>
          </div>
        </div>
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

      <section className="border-y border-sky-100 bg-sky-50/70">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 text-right sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-sky-100 bg-white p-4">
            <p className="text-sm text-slate-500">تشغيل يومي</p>
            <p className="mt-1 text-xl font-bold text-sky-600">رحلات منتظمة</p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-white p-4">
            <p className="text-sm text-slate-500">إدارة ذكية</p>
            <p className="mt-1 text-xl font-bold text-sky-600">مركبات وسائقون</p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-white p-4">
            <p className="text-sm text-slate-500">خدمة العملاء</p>
            <p className="mt-1 text-xl font-bold text-sky-600">حجوزات دقيقة</p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-white p-4">
            <p className="text-sm text-slate-500">توسّع الأعمال</p>
            <p className="mt-1 text-xl font-bold text-sky-600">نقل عام وخارجي</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6 lg:px-8">
        <h3 className="text-2xl font-bold sm:text-3xl">
          جهّز كراجك لمرحلة تشغيل أكثر احترافية
        </h3>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">
          ابدأ اليوم في تنظيم عمليات النقل العام والنقل الخارجي بنظام واحد
          يمنحك وضوحاً أكبر وتحكماً أفضل.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="bg-emerald-600 px-8 hover:bg-emerald-500">
            <Link href="/auth/register">إنشاء حساب</Link>
          </Button>
          <Button asChild variant="outline" className="border-sky-300 bg-white text-sky-700 hover:bg-sky-50">
            <Link href="/auth/login">الدخول للنظام</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
