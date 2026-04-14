"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { NavBarUser } from "@/components/NavBar";
import {
  canManageCities,
  canManageGarages,
  canManageTrips,
  canManageVehicles,
  canUsePassengerPortal,
  canViewBookings,
} from "@/lib/permissions";
import { cn } from "@/lib/utils";

type Props = {
  user: NavBarUser | null;
  className?: string;
};

export default function Sidebar({ user, className }: Props) {
  const role = user?.role;

  if (!user) return null;

  return (
    <aside
      className={cn(
        "h-full border-l border-violet-200 bg-violet-50/70 dark:bg-card p-3",
        className
      )}
    >
      <nav className="flex flex-col gap-2 text-sm">
        <Button asChild variant="outline" size="sm" className="w-full justify-start">
          <Link href="/home">الرئيسية</Link>
        </Button>
        {canManageCities(role) && (
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <Link href="/cities">المدن</Link>
          </Button>
        )}
        {canManageGarages(role) && (
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <Link href="/garages">الكراجات</Link>
          </Button>
        )}
        {canManageVehicles(role) && (
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <Link href="/vehicles">المركبات</Link>
          </Button>
        )}
        {canManageTrips(role) && (
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <Link href="/trips">الرحلات</Link>
          </Button>
        )}
        {canUsePassengerPortal(role) && (
          <>
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/passenger/garages">كراجات (مسافر)</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <Link href="/passenger/trips">بحث رحلة</Link>
            </Button>
          </>
        )}
        {canViewBookings(role) && (
          <Button asChild variant="outline" size="sm" className="w-full justify-start">
            <Link href="/bookings">الحجوزات</Link>
          </Button>
        )}
      </nav>
    </aside>
  );
}
