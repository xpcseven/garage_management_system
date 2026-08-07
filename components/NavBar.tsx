"use client";

import { Computer, Menu, Moon, Sun, LogOut, LayoutDashboard, Users } from "lucide-react";
import { UserRole } from "@/prisma/UserRole.enum";
import { roleLabelAr } from "@/lib/role-labels";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/action/auth/logout";
import NotificationBell from "@/components/NotificationBell";

export type NavBarUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Props = {
  user: NavBarUser | null;
  onToggleSidebar?: () => void;
};

function NavBar({ user, onToggleSidebar }: Props) {
  const { setTheme } = useTheme();

  return (
    <header
      dir="rtl"
      className="
        fixed inset-x-0 top-0 z-50
        flex items-center justify-between
        gap-3 px-4 py-3.5
        border-b border-white/10
        bg-plum-dark/95
        backdrop-blur-md
        print:hidden
      "
    >
      {/* زخرفة خفيفة أعلى الهيدر */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -start-10 -top-16 h-40 w-40 rounded-full bg-orchid/30 blur-3xl" />
        <div className="absolute -end-8 top-0 h-32 w-48 rounded-full bg-fuchsia-brand/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-orchid-light/60 to-transparent" />
      </div>

      <div className="relative z-10 flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="
            md:hidden
            h-9 w-9 rounded-xl
            border border-white/15
            text-white/85
            hover:bg-white/10 hover:text-white
          "
          onClick={onToggleSidebar}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">فتح القائمة</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="
                h-9 w-9 rounded-xl
                border border-white/15
                text-white/85
                hover:bg-white/10 hover:text-white
              "
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">المظهر</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="mt-1 w-36 rounded-2xl border-plum/15 bg-mist/95 shadow-orchid backdrop-blur-sm dark:bg-dusk/95"
          >
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className="gap-2 rounded-xl text-sm font-medium"
            >
              <Sun className="h-4 w-4 text-orchid" />
              فاتح
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className="gap-2 rounded-xl text-sm font-medium"
            >
              <Moon className="h-4 w-4 text-plum" />
              داكن
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className="gap-2 rounded-xl text-sm font-medium"
            >
              <Computer className="h-4 w-4 text-dusk/50" />
              النظام
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {user && <NotificationBell />}
      </div>

      <div className="absolute left-1/2 z-10 -translate-x-1/2">
        <Link
          href="/"
          className="
            block max-w-[58vw] truncate text-center
            font-display text-lg tracking-wide text-white
            transition-colors duration-200
            hover:text-orchid-light
            sm:text-xl
          "
        >
          آشور للسياحة والسفر
        </Link>
      </div>

      <div className="relative z-10 flex items-center gap-2">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="
                  h-9 max-w-[10rem] truncate rounded-xl
                  border border-white/15 bg-white/10
                  px-3 text-sm font-medium text-white
                  hover:bg-white/20
                "
              >
                {user.name || user.email}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="mt-1 w-56 rounded-2xl border-plum/15 bg-mist/95 shadow-orchid backdrop-blur-sm dark:bg-dusk/95"
            >
              <div className="border-b border-plum/10 px-3 py-2.5 dark:border-orchid/20">
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-plum dark:text-orchid-light">
                  {roleLabelAr(user.role)}
                </p>
              </div>

              <div className="p-1">
                <DropdownMenuItem asChild className="gap-2 rounded-xl text-sm">
                  <Link href="/home">
                    <LayoutDashboard className="h-4 w-4 text-plum" />
                    لوحة التحكم
                  </Link>
                </DropdownMenuItem>

                {user.role === UserRole.SUPER_ADMIN && (
                  <DropdownMenuItem asChild className="gap-2 rounded-xl text-sm">
                    <Link href="/users">
                      <Users className="h-4 w-4 text-orchid" />
                      المستخدمون والصلاحيات
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  className="gap-2 rounded-xl text-sm text-fuchsia-brand focus:bg-fuchsia-soft focus:text-fuchsia-brand"
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/auth/login">دخول</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="hidden h-9 rounded-xl border-0 bg-orchid px-3 text-sm text-white hover:bg-orchid-light sm:inline-flex"
            >
              <Link href="/auth/register">تسجيل</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

export default NavBar;
