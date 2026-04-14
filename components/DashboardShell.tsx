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
    <div dir="rtl" className="font-cairo min-h-screen flex flex-col">
      <div className="print:hidden">
        <NavBar user={user} onToggleSidebar={() => setSidebarOpen((s) => !s)} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden print:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-background shadow-xl">
            <Sidebar user={user} />
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        <div className="hidden md:block w-60 shrink-0 print:hidden">
          <Sidebar user={user} />
        </div>
        <main className="flex-1 min-w-0 print:flex-grow-0">{children}</main>
      </div>
    </div>
  );
}
