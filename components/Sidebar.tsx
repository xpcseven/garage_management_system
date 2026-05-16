"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavBarUser } from "@/components/NavBar";
import {
  canManageCities,
  canManageGarages,
  canManageTrips,
  canManageTourismPlaces,
  canManageVehicles,
  canUsePassengerPortal,
  canViewBookings,
} from "@/lib/permissions";
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
        "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
        "hover:bg-violet-100 hover:text-violet-900 dark:hover:bg-violet-900/30 dark:hover:text-violet-100",
        isActive
          ? "bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/40 hover:bg-violet-700 hover:text-white dark:hover:bg-violet-600"
          : "text-slate-600 dark:text-slate-400"
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute right-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-l-full bg-white/40" />
      )}

      {/* Icon */}
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg text-base transition-all duration-200",
          isActive
            ? "bg-white/20 text-white"
            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-violet-200 group-hover:text-violet-700 dark:group-hover:bg-violet-800 dark:group-hover:text-violet-300"
        )}
      >
        {icon}
      </span>

      <span className="flex-1 text-right">{label}</span>
    </Link>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-2 pt-3 pb-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
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
        "border-l border-slate-200/80 dark:border-slate-700/60",
        "bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm",
        "px-3 py-4",
        "w-56 shrink-0",
        className
      )}
    >
      {/* Logo / Brand area */}
      <div className="mb-3 flex items-center gap-2.5 px-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-sm">
          <span className="text-sm text-white">🚌</span>
        </div>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">
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
          <>
            <NavLink href="/cities" label="المدن" icon="🏙️" />
            <NavLink href="/landing-slider" label="سلايدر الرئيسية" icon="🖼️" />
          </>
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
          </>
        )}

        {canViewBookings(role) && (
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
              {role ?? "—"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}