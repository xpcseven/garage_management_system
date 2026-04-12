import RegisterForm from "@/components/auth/RegisterForm";
import UnAuthorized from "@/components/UnAuthorized";
import { currentUser } from "@/lib/auth";
import React from "react";

const RegisterPage = async () => {
  const user = await currentUser();

 
    return (
      <div>
        <RegisterForm />
      </div>
    );
  }


export default RegisterPage;
