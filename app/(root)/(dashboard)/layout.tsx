import React from "react";
import { auth } from "@/auth";
import { currentUser } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  // الزائر يصل هنا فقط عبر المسارات العامة (middleware) — واجهة تصفّح بدون لوحة كاملة
  if (!session?.user) {
    return <DashboardShell user={null}>{children}</DashboardShell>;
  }

  const user = await currentUser();
  const navUser = user
    ? {
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        role: String(user.role),
      }
    : null;

  return <DashboardShell user={navUser}>{children}</DashboardShell>;
};
export default Layout;
