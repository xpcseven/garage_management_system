import React from "react";
import { currentUser } from "@/lib/auth";
import { getDashboardSnapshot } from "@/lib/actions/dashboard.actions";
import Dashboard_Component from "@/components/dashboard/Dashboard_Component";

const page = async () => {
  const user = await currentUser();
  const snapshot = await getDashboardSnapshot();

  if (!user || !snapshot) {
    return null;
  }

  return (
    <Dashboard_Component
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }}
      snapshot={snapshot}
    />
  );
};

export default page;
