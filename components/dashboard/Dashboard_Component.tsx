'use client'
import Link from "next/link";
import type { DashboardSnapshot } from "@/lib/actions/dashboard.actions";
import {
  dashboardSectionsForRole,
  type DashboardSectionId,
} from "@/lib/permissions";
import { roleLabelAr } from "@/lib/role-labels";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/prisma/UserRole.enum";
import PassengerHomeDashboard from "@/components/dashboard/PassengerHomeDashboard";
import SuperAdminHomeDashboard from "@/components/dashboard/SuperAdminHomeDashboard";

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
  hotels: {
    href: "/hotels",
    title: "الفنادق",
    desc: "إدارة الفندق والتفاصيل",
  },
  hotel_rooms: {
    href: "/hotel-rooms",
    title: "غرف الفندق",
    desc: "إضافة وتعديل الغرف",
  },
  hotel_bookings: {
    href: "/hotel-bookings",
    title: "حجوزات الفندق",
    desc: "طلبات حجز الغرف",
  },
  restaurants: {
    href: "/restaurants",
    title: "المطاعم",
    desc: "إدارة المطعم",
  },
  restaurant_bookings: {
    href: "/restaurant-bookings",
    title: "حجوزات المطعم",
    desc: "طلبات حجز الطاولات",
  },
  farms: {
    href: "/farms",
    title: "المزارع",
    desc: "إدارة المزرعة",
  },
  farm_bookings: {
    href: "/farm-bookings",
    title: "حجوزات المزرعة",
    desc: "طلبات زيارة المزرعة",
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
  passenger_hotels: {
    href: "/passenger/hotels",
    title: "فنادق",
    desc: "تصفح واحجز غرفة",
  },
  passenger_restaurants: {
    href: "/passenger/restaurants",
    title: "مطاعم",
    desc: "احجز طاولة في مطعم",
  },
  passenger_farms: {
    href: "/passenger/farms",
    title: "مزارع",
    desc: "احجز زيارة مزرعة",
  },
  tourism_place_requests: {
    href: "/tourism-requests",
    title: "طلبات اعتماد الأماكن",
    desc: "مراجعة طلبات اعتماد الأماكن السياحية",
  },
};

const statAccent: Record<"purple" | "emerald" | "violet" | "amber", string> = {
  purple: "bg-plum dark:bg-orchid",
  emerald: "bg-emerald-500 dark:bg-emerald-400",
  violet: "bg-orchid dark:bg-orchid-light",
  amber: "bg-amber-500 dark:bg-amber-400",
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
    <div className="group relative overflow-hidden rounded-2xl border border-plum/10 bg-white shadow-sm transition duration-200 hover:border-plum/20 hover:shadow-orchid dark:border-orchid/20 dark:bg-card dark:hover:border-orchid/35 dark:hover:shadow-none">
      <div
        className={`absolute end-0 top-0 h-full w-1 ${statAccent[tone]} opacity-80`}
        aria-hidden
      />
      <div className="px-5 py-6 text-center">
        <div className="font-data text-3xl font-semibold tabular-nums tracking-tight text-dusk dark:text-foreground">
          {value}
        </div>
        <div className="mt-2 text-sm font-medium leading-snug text-dusk/55 dark:text-muted-foreground">
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
  const roleLabel = roleLabelAr(String(user.role));

  if (isPassenger) {
    return <PassengerHomeDashboard user={user} snapshot={snapshot} />;
  }

  if (user.role === UserRole.SUPER_ADMIN) {
    return <SuperAdminHomeDashboard user={user} snapshot={snapshot} />;
  }

  const dashboardTitle =
    user.role === UserRole.SUPER_ADMIN
      ? "لوحة المشرف العام"
      : user.role === UserRole.GARAGE_OWNER
      ? "لوحة صاحب الشركة السياحية"
      : user.role === UserRole.DRIVER
      ? "لوحة السائق"
      : user.role === UserRole.TOURISM_OWNER
      ? "لوحة صاحب المكان السياحي"
      : user.role === UserRole.HOTEL_OWNER
      ? "لوحة صاحب الفندق"
      : user.role === UserRole.RESTAURANT_OWNER
      ? "لوحة صاحب المطعم"
      : user.role === UserRole.FARM_OWNER
      ? "لوحة صاحب المزرعة"
      : "لوحة التحكم";

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-6 py-8 text-white sm:px-8 sm:py-10 dark:bg-card dark:ring-1 dark:ring-orchid/25">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-48 w-48 rounded-full bg-orchid/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 bottom-0 h-40 w-40 rounded-full bg-fuchsia-brand/20 blur-3xl dark:bg-orchid/15"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl space-y-3 text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              نظرة عامة
            </p>
            <h1 className="font-display text-3xl leading-tight sm:text-4xl">
              {dashboardTitle}
            </h1>
            <p className="text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
              مرحباً{" "}
              <span className="font-medium text-white">
                {user.name ?? user.email}
              </span>
              . من هنا تتابع الأرقام الأساسية وتنتقل بسرعة إلى الأقسام.
            </p>
          </div>
          <div className="shrink-0 self-start rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
            <span className="text-white/50">الدور</span>{" "}
            <span className="font-medium text-white">{roleLabel}</span>
          </div>
        </div>
      </header>

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

      {user.role === UserRole.GARAGE_OWNER &&
        snapshot.showGarageOwnerTripReminder && (
          <Card className="overflow-hidden rounded-2xl border border-amber-200/90 bg-[#FFFBF5] shadow-sm dark:border-amber-500/30 dark:bg-amber-950/30">
            <CardHeader className="space-y-2 pb-2 sm:pb-3">
              <CardTitle className="text-lg font-semibold text-dusk dark:text-amber-100">
                مطلوب: إنشاء رحلة وتحديد الوجهة
              </CardTitle>
              <CardDescription className="text-base leading-relaxed text-dusk/70 dark:text-amber-100/70">
                لديك شركة سياحية ومركبات جاهزة، لكن لا توجد رحلة مجدولة بعد. أنشئ رحلة
                من صفحة «الرحلات» وحدد بوضوح{" "}
                <strong className="font-semibold text-dusk dark:text-amber-50">
                  من أين تنطلق
                </strong>{" "}
                و
                <strong className="font-semibold text-dusk dark:text-amber-50">
                  إلى أين
                </strong>{" "}
                (مدينتان مختلفتان في القائمة).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                asChild
                className="rounded-xl border-0 bg-orchid px-5 font-medium text-white shadow-sm transition hover:bg-orchid-light"
              >
                <Link href="/trips">الذهاب إلى إنشاء الرحلة</Link>
              </Button>
            </CardContent>
          </Card>
        )}

      <section className="space-y-5">
        <div className="text-start">
          <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
            التنقل
          </p>
          <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
            الأقسام
          </h2>
          <p className="mt-1 text-sm text-dusk/50 dark:text-muted-foreground">
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
                  <Card className="h-full rounded-2xl border border-plum/10 bg-white shadow-sm transition duration-200 hover:border-plum/25 hover:shadow-orchid dark:border-orchid/20 dark:bg-card dark:hover:border-orchid/40 dark:hover:shadow-none">
                    <CardHeader className="space-y-2 pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-base font-semibold text-dusk sm:text-lg dark:text-foreground">
                          {item.title}
                        </CardTitle>
                        <span
                          className="mt-0.5 shrink-0 text-orchid transition group-hover:-translate-x-0.5 dark:text-orchid-light"
                          aria-hidden
                        >
                          ←
                        </span>
                      </div>
                      <CardDescription className="text-sm leading-relaxed text-dusk/55 dark:text-muted-foreground">
                        {item.desc}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <span className="text-xs font-medium text-dusk/40 transition group-hover:text-orchid dark:text-muted-foreground dark:group-hover:text-orchid-light">
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
