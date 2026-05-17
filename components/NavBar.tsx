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
        sticky top-0 z-50
        flex items-center justify-between
        gap-3 px-4 py-3
        border-b border-violet-600/40
        bg-gradient-to-l from-indigo-950 via-violet-900 to-purple-800
        shadow-[0_2px_20px_rgba(109,40,217,0.3)]
        backdrop-blur-sm
        print:hidden
      "
    >
      {/* ── Right side: sidebar toggle + theme switcher ── */}
      <div className="flex items-center gap-2">
        {/* Sidebar toggle (mobile only) */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="
            md:hidden
            h-9 w-9 rounded-lg
            border border-white/20
            text-white/80
            hover:bg-white/10 hover:text-white
            transition-colors
          "
          onClick={onToggleSidebar}
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Theme switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="
                h-9 w-9 rounded-lg
                border border-white/20
                text-white/80
                hover:bg-white/10 hover:text-white
                transition-colors
              "
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="
              mt-1 w-36 rounded-xl
              border border-violet-200/20
              bg-white/95 backdrop-blur-sm
              shadow-xl shadow-violet-900/20
              dark:bg-slate-900/95
            "
          >
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className="gap-2 rounded-lg text-sm font-medium"
            >
              <Sun className="h-4 w-4 text-amber-500" />
              فاتح
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className="gap-2 rounded-lg text-sm font-medium"
            >
              <Moon className="h-4 w-4 text-violet-500" />
              داكن
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className="gap-2 rounded-lg text-sm font-medium"
            >
              <Computer className="h-4 w-4 text-slate-500" />
              النظام
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Center: brand / title ── */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Link
          href="/"
          className="
            block max-w-[58vw] truncate text-center
            text-sm sm:text-base lg:text-lg
            font-bold tracking-wide text-white
            hover:text-violet-200
            transition-colors duration-200
          "
        >
          <span>آشور للسياحة و السفر</span>
          <span className="hidden sm:inline"> - Ashuor Tourism and Travel</span>
        </Link>
      </div>

      {/* ── Left side: user menu ── */}
      <div className="flex items-center">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="
                  h-9 max-w-[10rem]
                  rounded-lg
                  border border-white/20
                  bg-white/10
                  px-3 text-sm font-medium text-white
                  hover:bg-white/20
                  truncate
                  transition-colors
                "
              >
                {user.name || user.email}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="
                mt-1 w-56 rounded-xl
                border border-violet-200/20
                bg-white/95 backdrop-blur-sm
                shadow-xl shadow-violet-900/20
                dark:bg-slate-900/95
              "
            >
              {/* User info header */}
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <p className="mt-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                  {roleLabelAr(user.role)}
                </p>
              </div>

              <div className="p-1">
                <DropdownMenuItem asChild className="gap-2 rounded-lg text-sm">
                  <Link href="/home">
                    <LayoutDashboard className="h-4 w-4 text-violet-500" />
                    لوحة التحكم
                  </Link>
                </DropdownMenuItem>

                {user.role === UserRole.SUPER_ADMIN && (
                  <DropdownMenuItem asChild className="gap-2 rounded-lg text-sm">
                    <Link href="/users">
                      <Users className="h-4 w-4 text-violet-500" />
                      المستخدمون والصلاحيات
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  className="
                    gap-2 rounded-lg text-sm
                    text-red-600
                    focus:bg-red-50 focus:text-red-600
                    dark:focus:bg-red-950/40
                  "
                  onClick={() => logout()}
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // placeholder to keep layout balanced when no user
          <div className="h-9 w-9" />
        )}
      </div>
    </header>
  );
}

export default NavBar;