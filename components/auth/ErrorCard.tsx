import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import CardWrapper from "@/components/auth/CardWrapper";

const ErrorCard = () => {
  return (
    <CardWrapper
      headerLabel="Oops! Something went wrong"
      backButtonLabel="Back to Login"
      backButtonHref="/auth/login"
    >
      <div className="w-full flex justify-center items-center">
        <FaExclamationTriangle className=" text-destructive" />
      </div>
    </CardWrapper>
  );
};

export default ErrorCard;
