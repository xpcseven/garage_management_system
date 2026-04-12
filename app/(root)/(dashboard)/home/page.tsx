import React from "react";
import { currentUser } from "@/lib/auth";
import Home from "@/components/Home";



const page = async () => {
  const user = await currentUser();



  return (
    <div>
      <Home />
    </div>
  );
};

export default page;
