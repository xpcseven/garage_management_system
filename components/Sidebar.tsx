"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavBarUser } from "@/components/NavBar";
import {
  canManageCities,
  canManageHomeSlider,
  canManageGarages,
  canManageTrips,
  canManageTourismPlaces,
  canManageVehicles,
  canManageHotels,
  canManageRestaurants,
  canManageFarms,
  canUsePassengerPortal,
  canViewBookings,
} from "@/lib/permissions";
import { UserRole } from "@/prisma/UserRole.enum";
import { roleLabelAr } from "@/lib/role-labels";
import { cn } from "@/lib/utils";

type Props = {
  user: NavBarUser | null;
  className?: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

function NavLink({ href, label, icon }: NavItem) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center justify-start gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "hover:bg-plum/10 hover:text-plum-dark dark:hover:bg-orchid/15 dark:hover:text-orchid-light",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orchid",
        "motion-reduce:transition-none",
        isActive
          ? "bg-gradient-to-l from-plum to-orchid text-white shadow-orchid hover:from-plum-light hover:to-orchid-light hover:text-white"
          : "text-dusk/70 dark:text-mist/60"
      )}
    >
      {isActive && (
        <span className="absolute start-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-e-full bg-white/50" />
      )}

      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-base transition-all duration-200",
          isActive
            ? "bg-white/20 text-white"
            : "bg-mist-dark text-plum/60 group-hover:bg-plum/15 group-hover:text-plum dark:bg-dusk dark:text-mist/50"
        )}
      >
        {icon}
      </span>

      <span className="text-start leading-none">{label}</span>
    </Link>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-2 pb-1 pt-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-plum/40 dark:text-orchid/40">
        {label}
      </span>
      <div className="h-px flex-1 bg-mist-deep dark:bg-orchid/20" />
    </div>
  );
}

export default function Sidebar({ user, className }: Props) {
  const role = user?.role;

  if (!user) return null;

  return (
    <aside
      className={cn(
        "flex h-full flex-col gap-1",
        "border-s border-plum/10 dark:border-orchid/15",
        "bg-white/70 dark:bg-dusk/70 backdrop-blur-md",
        "px-3 py-4",
        "w-56 shrink-0",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-start gap-2.5 border-b border-plum/10 px-3 pb-3 dark:border-orchid/15">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-plum to-orchid shadow-orchid">
          <span className="text-sm text-white">🚌</span>
        </div>
        <span className="font-display text-sm tracking-wide text-dusk dark:text-mist">
          لوحة التحكم
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5" dir="rtl">
        <NavLink href="/home" label="الرئيسية" icon="🏠" />

        {(canManageCities(role) || canManageGarages(role) || canManageVehicles(role)) && (
          <SectionDivider label="الإدارة" />
        )}

        {canManageCities(role) && (
          <NavLink href="/cities" label="المدن" icon="🏙️" />
        )}

        {canManageHomeSlider(role) && (
          <NavLink href="/home-slider" label="سلايدر الرئيسية" icon="🖼️" />
        )}

        {canManageTourismPlaces(role) && (
          <>
            <NavLink href="/tourism_places" label="الأماكن السياحية" icon="🧭" />
            {role === "SUPER_ADMIN" && (
              <NavLink href="/tourism-requests" label="طلبات اعتماد الأماكن" icon="✅" />
            )}
          </>
        )}

        {canManageGarages(role) && (
          <NavLink href="/garages" label="الشركات السياحية" icon="🏢" />
        )}

        {canManageVehicles(role) && (
          <NavLink href="/vehicles" label="المركبات" icon="🚐" />
        )}

        {canManageGarages(role) &&
          (role === UserRole.GARAGE_OWNER || role === UserRole.SUPER_ADMIN) && (
          <>
            <NavLink href="/partnerships" label="الشراكات" icon="🤝" />
            <NavLink href="/partnership-messages" label="مراسلات الشركاء" icon="💬" />
          </>
        )}

        {canManageHotels(role) && (
          <>
            <SectionDivider label="الفندق" />
            <NavLink href="/hotels" label="فندقي" icon="🏨" />
            <NavLink href="/hotel-rooms" label="الغرف" icon="🛏️" />
            <NavLink href="/hotel-bookings" label="حجوزات الفندق" icon="📋" />
            <NavLink href="/partnership-invites" label="دعوات الشراكة" icon="✉️" />
            <NavLink href="/partnership-messages" label="مراسلات الشركاء" icon="💬" />
          </>
        )}

        {canManageRestaurants(role) && (
          <>
            <SectionDivider label="المطعم" />
            <NavLink href="/restaurants" label="مطعمي" icon="🍽️" />
            <NavLink
              href="/restaurant-bookings"
              label="حجوزات المطعم"
              icon="📋"
            />
            <NavLink href="/partnership-invites" label="دعوات الشراكة" icon="✉️" />
            <NavLink href="/partnership-messages" label="مراسلات الشركاء" icon="💬" />
          </>
        )}

        {canManageFarms(role) && (
          <>
            <SectionDivider label="المزرعة" />
            <NavLink href="/farms" label="مزرعتي" icon="🌿" />
            <NavLink href="/farm-bookings" label="حجوزات المزرعة" icon="📋" />
            <NavLink href="/partnership-invites" label="دعوات الشراكة" icon="✉️" />
            <NavLink href="/partnership-messages" label="مراسلات الشركاء" icon="💬" />
          </>
        )}

        {canManageTrips(role) && (
          <>
            <SectionDivider label="الرحلات" />
            <NavLink href="/trips" label="الرحلات" icon="🗺️" />
            <NavLink href="/tourism-programs" label="البرامج السياحية" icon="🧳" />
          </>
        )}

        {canUsePassengerPortal(role) && (
          <>
            <SectionDivider label="المسافر" />
            <NavLink href="/passenger/garages" label="الشركات السياحية (مسافر)" icon="📍" />
            <NavLink href="/passenger/trips" label="بحث رحلة" icon="🔍" />
            <NavLink
              href="/passenger/tourism-programs"
              label="برامج سياحية"
              icon="🧭"
            />
            <NavLink
              href="/passenger/tourism-places"
              label="أماكن سياحية"
              icon="🧳"
            />
            <NavLink href="/passenger/hotels" label="فنادق" icon="🏨" />
            <NavLink href="/passenger/restaurants" label="مطاعم" icon="🍽️" />
            <NavLink href="/passenger/farms" label="مزارع" icon="🌿" />
          </>
        )}

        {canViewBookings(role) &&
          role !== UserRole.HOTEL_OWNER &&
          role !== UserRole.RESTAURANT_OWNER &&
          role !== UserRole.FARM_OWNER && (
          <>
            <SectionDivider label="الحجوزات" />
            <NavLink href="/bookings" label="الحجوزات" icon="🎫" />
          </>
        )}
      </nav>

      {/* User info at bottom */}
      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50 text-sm shrink-0">
            👤
          </div>
          <div className="flex-1 min-w-0 text-right" dir="rtl">
            <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
              {user.name ?? "المستخدم"}
            </p>
            <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">
              {roleLabelAr(role ?? "")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}