"use client";

import { useState } from "react";
import NavBar, { type NavBarUser } from "@/components/NavBar";
import Sidebar from "@/components/Sidebar";

type Props = {
  user: NavBarUser | null;
  children: React.ReactNode;
};

export default function DashboardShell({ user, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div dir="rtl" className="flex min-h-screen flex-col">
      <NavBar user={user} onToggleSidebar={() => setSidebarOpen((s) => !s)} />

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden print:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-dusk/40 backdrop-blur-[2px]"
            onClick={() => setSidebarOpen(false)}
            aria-label="إغلاق القائمة"
          />
          <div className="absolute end-0 top-0 h-full w-64 bg-mist shadow-plum dark:bg-dusk">
            <Sidebar user={user} />
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 pt-16 print:pt-0">
        <div className="hidden w-60 shrink-0 md:block print:hidden">
          <Sidebar user={user} />
        </div>
        <main className="min-w-0 flex-1 p-1 sm:p-2 print:flex-grow-0">
          {children}
        </main>
      </div>
    </div>
  );
}
