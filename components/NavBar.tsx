"use client";
import React from "react";
import { Moon, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Link from "next/link";
import { logout } from "@/lib/action/auth/logout";
import {
  canManageCities,
  canManageGarages,
  canManageTrips,
  canManageVehicles,
  canUsePassengerPortal,
  canViewBookings,
} from "@/lib/permissions";

export type NavBarUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Props = {
  user: NavBarUser | null;
};

function NavBar({ user }: Props) {
  const { setTheme } = useTheme();
  const role = user?.role;

  return (
    <div className="flex justify-between items-center p-4 border-b border-sky-200 bg-white dark:bg-card shadow-sm print:hidden gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="rounded-lg border-sky-200"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-lg">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="h-4 w-4 ml-2" />
              فاتح
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="h-4 w-4 ml-2" />
              داكن
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              النظام
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 flex justify-center min-w-0">
        <Link href="/home" className="text-xl font-bold text-sky-600 truncate">
          كراج السيارات
        </Link>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        {user && (
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <Button asChild variant="ghost" size="sm">
              <Link href="/home">الرئيسية</Link>
            </Button>
            {canManageCities(role) && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/cities">المدن</Link>
              </Button>
            )}
            {canManageGarages(role) && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/garages">الكراجات</Link>
              </Button>
            )}
            {canManageVehicles(role) && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/vehicles">المركبات</Link>
              </Button>
            )}
            {canManageTrips(role) && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/trips">الرحلات</Link>
              </Button>
            )}
            {canUsePassengerPortal(role) && (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/passenger/garages">كراجات (مسافر)</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/passenger/trips">بحث رحلة</Link>
                </Button>
              </>
            )}
            {canViewBookings(role) && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/bookings">الحجوزات</Link>
              </Button>
            )}
          </nav>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="bg-sky-600 hover:bg-sky-500 max-w-[10rem] truncate"
              >
                {user.name || user.email}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-xs text-muted-foreground border-b">
                {user.email}
                <br />
                <span className="font-medium text-foreground">{user.role}</span>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/home">لوحة التحكم</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => logout()}
              >
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </div>
  );
}

export default NavBar;
