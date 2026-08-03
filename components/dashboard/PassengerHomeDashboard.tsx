"use client";

import Link from "next/link";
import type { DashboardSnapshot } from "@/lib/actions/dashboard.actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/prisma/UserRole.enum";

type PassengerUser = {
  id: string;
  name: string | null | undefined;
  email: string | null | undefined;
  role: UserRole | string;
};

type Props = {
  user: PassengerUser;
  snapshot: DashboardSnapshot;
};

type QuickLink = {
  href: string;
  title: string;
  desc: string;
  accent?: "primary" | "soft";
};

const journeyLinks: QuickLink[] = [
  {
    href: "/passenger/trips",
    title: "ابحث عن رحلة",
    desc: "رحلات الشركات والسائقين المتاحة للحجز",
    accent: "primary",
  },
  {
    href: "/passenger/garages",
    title: "الشركات السياحية",
    desc: "تصفّح الشركات المسجّلة ونقاط الانطلاق",
  },
  {
    href: "/bookings",
    title: "حجوزاتي",
    desc: "متابعة حالة الحجز والدفع",
  },
];

const stayLinks: QuickLink[] = [
  {
    href: "/passenger/hotels",
    title: "فنادق",
    desc: "تصفّح واحجز غرفة",
  },
  {
    href: "/passenger/restaurants",
    title: "مطاعم",
    desc: "احجز طاولة في مطعم",
  },
  {
    href: "/passenger/farms",
    title: "مزارع",
    desc: "احجز زيارة مزرعة",
  },
];

const exploreLinks: QuickLink[] = [
  {
    href: "/passenger/tourism-places",
    title: "أماكن سياحية",
    desc: "معالم العراق المعتمدة للزيارة",
  },
  {
    href: "/passenger/tourism-programs",
    title: "برامج سياحية",
    desc: "باقات وبرامج من الشركات الشريكة",
  },
];

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-5 text-center ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
      <p className="font-data text-2xl font-semibold tabular-nums text-plum sm:text-3xl dark:text-orchid-light">
        {value}
      </p>
      <p className="mt-1.5 text-xs leading-5 text-dusk/55 sm:text-sm dark:text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function LinkTile({ item }: { item: QuickLink }) {
  const primary = item.accent === "primary";
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex h-full flex-col rounded-2xl p-5 text-start transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-plum dark:focus-visible:ring-orchid",
        primary
          ? "bg-plum text-white shadow-plum hover:bg-plum-light dark:bg-orchid-dark dark:hover:bg-orchid"
          : "bg-white ring-1 ring-plum/10 hover:-translate-y-0.5 hover:shadow-orchid motion-reduce:hover:translate-y-0 dark:bg-card dark:ring-orchid/20 dark:hover:bg-muted/60 dark:hover:shadow-none"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={cn(
            "text-base font-semibold sm:text-lg",
            primary ? "text-white" : "text-dusk dark:text-foreground"
          )}
        >
          {item.title}
        </h3>
        <span
          className={cn(
            "shrink-0 text-sm transition group-hover:-translate-x-0.5",
            primary ? "text-orchid-light" : "text-orchid dark:text-orchid-light"
          )}
          aria-hidden
        >
          ←
        </span>
      </div>
      <p
        className={cn(
          "mt-2 flex-1 text-sm leading-7",
          primary ? "text-white/75" : "text-dusk/60 dark:text-muted-foreground"
        )}
      >
        {item.desc}
      </p>
    </Link>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="text-start">
        <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

/** الصفحة الرئيسية لمسافر منصة آشور */
export default function PassengerHomeDashboard({ user, snapshot }: Props) {
  const displayName = user.name?.trim() || user.email || "مسافر";

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-6 py-8 text-white sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-48 w-48 rounded-full bg-orchid/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 bottom-0 h-40 w-40 rounded-full bg-fuchsia-brand/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              لوحة المسافر
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              أهلاً، {displayName}
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
              من هنا تحجز رحلتك، تتابع حجوزاتك، وتستكشف المعالم والإقامة على منصة
              آشور.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light"
            >
              <Link href="/passenger/trips">ابحث عن رحلة</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-white/25 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
            >
              <Link href="/bookings">حجوزاتي</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="شركات سياحية مسجّلة" value={snapshot.garages} />
        <Metric label="رحلات متاحة للحجز" value={snapshot.tripsActive} />
        <Metric label="حجوزات قيد الانتظار" value={snapshot.bookingsPending} />
      </div>

      <Section eyebrow="التنقل" title="رحلتك">
        <div className="grid gap-3 sm:grid-cols-3">
          {journeyLinks.map((item) => (
            <LinkTile key={item.href} item={item} />
          ))}
        </div>
      </Section>

      <Section eyebrow="الضيافة" title="إقامة ومطاعم ومزارع">
        <div className="grid gap-3 sm:grid-cols-3">
          {stayLinks.map((item) => (
            <LinkTile key={item.href} item={item} />
          ))}
        </div>
      </Section>

      <Section eyebrow="الاستكشاف" title="معالم وبرامج">
        <div className="grid gap-3 sm:grid-cols-2">
          {exploreLinks.map((item) => (
            <LinkTile key={item.href} item={item} />
          ))}
        </div>
      </Section>
    </div>
  );
}
