'use client'
import Link from "next/link";
import type { DashboardSnapshot } from "@/lib/actions/dashboard.actions";
import {
  dashboardSectionsForRole,
  type DashboardSectionId,
} from "@/lib/permissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/prisma/UserRole.enum";

export type DashboardUserProps = {
  id: string;
  name: string | null | undefined;
  email: string | null | undefined;
  role: UserRole | string;
};

type Props = {
  user: DashboardUserProps;
  snapshot: DashboardSnapshot;
};

const links: Record<
  Exclude<DashboardSectionId, "overview">,
  { href: string; title: string; desc: string }
> = {
  cities: {
    href: "/cities",
    title: "المدن",
    desc: "إدارة المدن للرحلات",
  },
  home_slider: {
    href: "/home-slider",
    title: "سلايدر الرئيسية",
    desc: "إدارة صور السلايدر في الصفحة العامة",
  },
  tourism_places: {
    href: "/tourism_places",
    title: "الأماكن السياحية",
    desc: "إدارة وعرض الأماكن السياحية",
  },
  garages: {
    href: "/garages",
    title: "الشركات السياحية",
    desc: "شركاتك السياحية أو شركات أعضائك",
  },
  vehicles: {
    href: "/vehicles",
    title: "المركبات",
    desc: "أسطول المركبات",
  },
  bookings: {
    href: "/bookings",
    title: "الحجوزات",
    desc: "متابعة الحجوزات والدفع",
  },
  trips: {
    href: "/trips",
    title: "الرحلات",
    desc: "إنشاء ومتابعة الرحلات",
  },
  passenger_garages: {
    href: "/passenger/garages",
    title: "الشركات السياحية المسجّلة",
    desc: "تصفّح الشركات السياحية النشطة",
  },
  passenger_trips: {
    href: "/passenger/trips",
    title: "البحث عن رحلة",
    desc: "رحلات الشركات السياحية والسائقين المستقلين",
  },
  passenger_tourism_places: {
    href: "/passenger/tourism-places",
    title: "أماكن سياحية",
    desc: "استكشف الأماكن السياحية المتاحة",
  },
  tourism_place_requests: {
    href: "/tourism-requests",
    title: "طلبات اعتماد الأماكن",
    desc: "مراجعة طلبات اعتماد الأماكن السياحية",
  },
};

/** شريط لوني خفيف يذكّر بأسلوب البطاقات النظيف في واجهات مثل claude.ai */
const statAccent: Record<"purple" | "emerald" | "violet" | "amber", string> = {
  purple: "bg-purple-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
};

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "purple" | "emerald" | "violet" | "amber";
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:border-stone-300 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
      <div
        className={`absolute end-0 top-0 h-full w-1 ${statAccent[tone]} opacity-80`}
        aria-hidden
      />
      <div className="px-5 py-6 text-center">
        <div className="text-3xl font-semibold tabular-nums tracking-tight text-stone-900">
          {value}
        </div>
        <div className="mt-2 text-sm font-medium leading-snug text-stone-500">
          {label}
        </div>
      </div>
    </div>
  );
}

/** محتوى الصفحة الرئيسية للوحة التحكم — يُستدعى من `home/page.tsx` مع بيانات من السيرفر */
export default function Dashboard_Component({ user, snapshot }: Props) {
  const sections = dashboardSectionsForRole(user.role);
  const isPassenger = user.role === UserRole.USER;
  const roleLabel =
    user.role === UserRole.SUPER_ADMIN
      ? "مشرف عام"
      : user.role === UserRole.GARAGE_OWNER
      ? "صاحب شركة سياحية"
      : user.role === UserRole.DRIVER
      ? "سائق"
      : user.role === UserRole.TOURISM_OWNER
      ? "صاحب مكان سياحي"
      : user.role === UserRole.USER
      ? "مسافر"
      : String(user.role);

  const dashboardTitle =
    user.role === UserRole.SUPER_ADMIN
      ? "لوحة المشرف العام"
      : user.role === UserRole.GARAGE_OWNER
      ? "لوحة صاحب الشركة السياحية"
      : user.role === UserRole.DRIVER
      ? "لوحة السائق"
      : user.role === UserRole.TOURISM_OWNER
      ? "لوحة صاحب المكان السياحي"
      : user.role === UserRole.USER
      ? "لوحة المسافر"
      : "لوحة التحكم";

  return (
    <div className="mx-auto max-w-5xl space-y-12  sm:px-6 sm:py-10 lg:px-8">
      {/* خلفية دافئة ومساحات واسعة — أسلوب صفحات منتجات نظيفة */}
      <header className="rounded-2xl border border-stone-200/80 bg-[#FAFAF8] px-6 py-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3 text-right">
            <p className="text-sm font-medium text-stone-500">نظرة عامة</p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              {dashboardTitle}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-stone-600">
              مرحباً{" "}
              <span className="font-medium text-stone-800">
                {user.name ?? user.email}
              </span>
              . من هنا تتابع الأرقام الأساسية وتنتقل بسرعة إلى الأقسام.
            </p>
          </div>
          <div className="shrink-0 self-start rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 shadow-sm">
            <span className="text-stone-400">الدور</span>{" "}
            <span className="font-medium text-stone-900">{roleLabel}</span>
          </div>
        </div>
      </header>

      {isPassenger ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="شركات سياحية مسجّلة" value={snapshot.garages} tone="emerald" />
          <Stat
            label="رحلات متاحة للحجز"
            value={snapshot.tripsActive}
            tone="purple"
          />
          <Stat
            label="حجوزات قيد الانتظار"
            value={snapshot.bookingsPending}
            tone="amber"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="شركات سياحية" value={snapshot.garages} tone="emerald" />
          <Stat label="مركبات" value={snapshot.vehicles} tone="violet" />
          <Stat label="رحلات نشطة" value={snapshot.tripsActive} tone="purple" />
          <Stat
            label="حجوزات قيد الانتظار"
            value={snapshot.bookingsPending}
            tone="amber"
          />
        </div>
      )}

      {user.role === UserRole.GARAGE_OWNER &&
        snapshot.showGarageOwnerTripReminder && (
          <Card className="overflow-hidden rounded-2xl border border-amber-200/90 bg-[#FFFBF5] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <CardHeader className="space-y-2 pb-2 sm:pb-3">
              <CardTitle className="text-lg font-semibold text-stone-900">
                مطلوب: إنشاء رحلة وتحديد الوجهة
              </CardTitle>
              <CardDescription className="text-base leading-relaxed text-stone-600">
                لديك شركة سياحية ومركبات جاهزة، لكن لا توجد رحلة مجدولة بعد. أنشئ رحلة
                من صفحة «الرحلات» وحدد بوضوح{" "}
                <strong className="font-semibold text-stone-800">
                  من أين تنطلق
                </strong>{" "}
                و
                <strong className="font-semibold text-stone-800">
                  إلى أين
                </strong>{" "}
                (مدينتان مختلفتان في القائمة).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                asChild
                className="rounded-xl bg-stone-900 px-5 font-medium text-white shadow-sm transition hover:bg-stone-800"
              >
                <Link href="/trips">الذهاب إلى إنشاء الرحلة</Link>
              </Button>
            </CardContent>
          </Card>
        )}

      <section className="space-y-5">
        <div className="text-right">
          <h2 className="text-lg font-semibold tracking-tight text-stone-900">
            الأقسام
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            اختر القسم للانتقال مباشرة
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {sections
            .filter(
              (s): s is Exclude<DashboardSectionId, "overview"> =>
                s !== "overview"
            )
            .map((key) => {
              const item = links[key];
              return (
                <Link key={key} href={item.href} className="group block">
                  <Card className="h-full rounded-2xl border border-stone-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:border-stone-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                    <CardHeader className="space-y-2 pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base font-semibold text-stone-900 sm:text-lg">
                          {item.title}
                        </CardTitle>
                        <span
                          className="mt-0.5 shrink-0 text-stone-400 transition group-hover:text-stone-700"
                          aria-hidden
                        >
                          ←
                        </span>
                      </div>
                      <CardDescription className="text-sm leading-relaxed text-stone-500">
                        {item.desc}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <span className="text-xs font-medium text-stone-400 transition group-hover:text-stone-600">
                        فتح القسم
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>
      </section>
    </div>
  );
}
