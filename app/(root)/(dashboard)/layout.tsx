import React from "react";
import { auth } from "@/auth";
import { currentUser } from "@/lib/auth";
import NavBar from "@/components/NavBar";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  if (!session?.user) {
    return <div>Loading...</div>;
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

  return (
    <div dir="rtl" className="font-cairo min-h-screen flex flex-col">
      <div className="print:hidden">
        <NavBar user={navUser} />
      </div>
      <main className="flex-grow print:flex-grow-0">{children}</main>
    </div>
  );
};
export default Layout;
