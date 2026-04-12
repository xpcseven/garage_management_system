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
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import Link from "next/link";
import { logout } from "@/lib/action/auth/logout";

function NavBar({ currentUserManage }: any) {
  // تحليل البيانات القادمة من السيرفر

  // const parseCurrentUser = JSON.parse(currentUserManage);

  const { setTheme } = useTheme();

  return (
    <div className="flex justify-between items-center p-4 border-b border-sky-200 bg-white shadow-sm print:hidden">
      
      {/* Left Section - Theme Toggle & Role */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors duration-200">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border border-orange-200 shadow-lg rounded-lg">
            <DropdownMenuItem
              className="hover:bg-orange-50 text-gray-700"
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4 mr-2" />
              Light Mode
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-orange-50 text-gray-700"
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4 mr-2" />
              Dark Mode
            </DropdownMenuItem>
            <DropdownMenuItem
              className="hover:bg-orange-50 text-gray-700"
              onClick={() => setTheme("system")}
            >
              <span className="h-4 w-4 mr-2">⚙️</span>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Role Display */}
      </div>

      {/* Center Section - Logo/Title */}
      <div className="flex-1 flex justify-center">
        <h1 className="text-xl font-bold text-sky-600">
         System
        </h1>
      </div>

      {/* Right Section - Status & User Menu */}
      <div className="flex items-center space-x-4">
        {/* Online Status Indicator */}
       

        {/* User Menu
        {parseCurrentUser && (
          <Popover>
            <PopoverTrigger className="bg-sky-500 hover:bg-sky-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
              {parseCurrentUser.username}
            </PopoverTrigger>
            <PopoverContent className="bg-white border border-orange-200 ml-3 w-40 shadow-lg rounded-lg">
              <div className="space-y-1">
                {parseCurrentUser?.role === "SUPERADMIN" && (
                  <>
                    <Button asChild className="w-full justify-start bg-transparent hover:bg-orange-50 text-gray-700 h-8">
                      <Link href="/ListUserManage">المستخدمين</Link>
                    </Button>
                    <Button asChild className="w-full justify-start bg-transparent hover:bg-orange-50 text-gray-700 h-8">
                      <Link href="/auth/register">انشاء حساب</Link>
                    </Button>
                    <Button asChild className="w-full justify-start bg-transparent hover:bg-orange-50 text-gray-700 h-8">
                      <Link href="/logs">سجل الحركات</Link>
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => logout()}
                  className="w-full justify-start bg-transparent hover:bg-red-50 text-red-600 h-8"
                >
                  تسجيل الخروج
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )} */}
      </div>
    </div>
  );
}

export default NavBar;
