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
  garages: {
    href: "/garages",
    title: "الكراجات",
    desc: "كراجاتك أو كراجات أعضائك",
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
    title: "الكراجات المسجّلة",
    desc: "تصفّح الكراجات النشطة",
  },
  passenger_trips: {
    href: "/passenger/trips",
    title: "البحث عن رحلة",
    desc: "رحلات الكراجات والسائقين المستقلين",
  },
};

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "sky" | "emerald" | "violet" | "amber";
}) {
  const toneClasses: Record<typeof tone, string> = {
    sky: "border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50 text-sky-700",
    emerald:
      "border-emerald-200 bg-gradient-to-br from-emerald-50 to-lime-50 text-emerald-700",
    violet:
      "border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 text-violet-700",
    amber:
      "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700",
  };

  return (
    <div
      className={`rounded-2xl border p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${toneClasses[tone]}`}
    >
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-600">{label}</div>
    </div>
  );
}

/** محتوى الصفحة الرئيسية للوحة التحكم — يُستدعى من `home/page.tsx` مع بيانات من السيرفر */
export default function Dashboard_Component({ user, snapshot }: Props) {
  const sections = dashboardSectionsForRole(user.role);
  const isPassenger = user.role === UserRole.USER;

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-4">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-sky-50/40 to-emerald-50/40 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          {isPassenger ? "لوحة المسافر" : "لوحة تحكم الكراج"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          مرحباً {user.name ?? user.email} —{" "}
          {isPassenger ? (
            <>
              الدور: <span className="font-medium text-foreground">مسافر</span>
            </>
          ) : (
            <>
              الدور:{" "}
              <span className="font-medium text-foreground">{user.role}</span>
            </>
          )}
        </p>
      </div>

      {isPassenger ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="كراجات مسجّلة" value={snapshot.garages} tone="emerald" />
          <Stat label="رحلات متاحة للحجز" value={snapshot.tripsActive} tone="sky" />
          <Stat label="حجوزات قيد الانتظار" value={snapshot.bookingsPending} tone="amber" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="كراجات" value={snapshot.garages} tone="emerald" />
          <Stat label="مركبات" value={snapshot.vehicles} tone="violet" />
          <Stat label="رحلات نشطة" value={snapshot.tripsActive} tone="sky" />
          <Stat label="حجوزات قيد الانتظار" value={snapshot.bookingsPending} tone="amber" />
        </div>
      )}

      {user.role === UserRole.GARAGE_OWNER &&
        snapshot.showGarageOwnerTripReminder && (
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-amber-900 dark:text-amber-100">
                مطلوب: إنشاء رحلة وتحديد الوجهة
              </CardTitle>
              <CardDescription className="text-amber-900/80 dark:text-amber-100/90">
                لديك كراج ومركبات جاهزة، لكن لا توجد رحلة مجدولة بعد. أنشئ رحلة
                من صفحة «الرحلات» وحدد بوضوح{" "}
                <strong>من أين تنطلق</strong> و<strong>إلى أين</strong> (مدينتان
                مختلفتان في القائمة).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="bg-amber-700 hover:bg-amber-600 text-white">
                <Link href="/trips">الذهاب إلى إنشاء الرحلة</Link>
              </Button>
            </CardContent>
          </Card>
        )}

      <div>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">الأقسام</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {sections
            .filter((s): s is Exclude<DashboardSectionId, "overview"> => s !== "overview")
            .map((key) => {
              const item = links[key];
              const sectionTone: Record<string, string> = {
                cities: "from-blue-50 to-cyan-50 border-blue-100",
                garages: "from-emerald-50 to-lime-50 border-emerald-100",
                vehicles: "from-violet-50 to-fuchsia-50 border-violet-100",
                bookings: "from-amber-50 to-orange-50 border-amber-100",
                trips: "from-sky-50 to-indigo-50 border-sky-100",
                passenger_garages: "from-teal-50 to-emerald-50 border-teal-100",
                passenger_trips: "from-cyan-50 to-blue-50 border-cyan-100",
              };
              return (
                <Link key={key} href={item.href}>
                  <Card
                    className={`h-full border bg-gradient-to-br transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${sectionTone[key] ?? "from-slate-50 to-white border-slate-100"}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900">{item.title}</CardTitle>
                      <CardDescription className="text-slate-600">{item.desc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sm font-semibold text-sky-700">فتح ←</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
