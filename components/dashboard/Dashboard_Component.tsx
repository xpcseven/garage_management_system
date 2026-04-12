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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4 text-center">
      <div className="text-2xl font-bold text-sky-700">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

/** محتوى الصفحة الرئيسية للوحة التحكم — يُستدعى من `home/page.tsx` مع بيانات من السيرفر */
export default function Dashboard_Component({ user, snapshot }: Props) {
  const sections = dashboardSectionsForRole(user.role);
  const isPassenger = user.role === UserRole.USER;

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-sky-800">
          {isPassenger ? "لوحة المسافر" : "لوحة تحكم الكراج"}
        </h1>
        <p className="text-muted-foreground mt-2">
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
          <Stat label="كراجات مسجّلة" value={snapshot.garages} />
          <Stat label="رحلات متاحة للحجز" value={snapshot.tripsActive} />
          <Stat label="حجوزات قيد الانتظار" value={snapshot.bookingsPending} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="كراجات" value={snapshot.garages} />
          <Stat label="مركبات" value={snapshot.vehicles} />
          <Stat label="رحلات نشطة" value={snapshot.tripsActive} />
          <Stat label="حجوزات قيد الانتظار" value={snapshot.bookingsPending} />
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
        <h2 className="text-xl font-semibold mb-4 text-sky-800">الأقسام</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {sections
            .filter((s): s is Exclude<DashboardSectionId, "overview"> => s !== "overview")
            .map((key) => {
              const item = links[key];
              return (
                <Link key={key} href={item.href}>
                  <Card className="h-full transition-shadow hover:shadow-md border-sky-100">
                    <CardHeader>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.desc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-sky-600 text-sm font-medium">فتح ←</span>
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
