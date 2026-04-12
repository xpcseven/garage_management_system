import React from "react";
import { auth } from "@/auth";
import { currentUser } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import { getUserAuthById } from "@/lib/action/user.action";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  if (!session?.user) {
    return <div>Loading...</div>;
  }

  const user = await currentUser();
  // const currentUser2 = await getUserAuthById(user?.id);
  return (
    <div dir="rtl" className="font-cairo min-h-screen flex flex-col">
      <div className="print:hidden">
        <NavBar />
      </div>
      <main className="flex-grow print:flex-grow-0">{children}</main>

    </div>
  );
};
export default Layout;
