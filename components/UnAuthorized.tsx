import Link from "next/link";
import React from "react";
import { BiError } from "react-icons/bi";
const UnAuthorized = () => {
  return (
    <section className="min-h-screen flex items-center justify-center">
      <div className="py-8 px-4 mx-auto max-w-screen-xl text-center">
        <div className="mx-auto max-w-screen-sm">
          {/* Icon or Illustration */}
          <div className="flex justify-center mb-6">
            <BiError className="size-40 text-red-500" />
          </div>

          {/* Error Code */}
          <h1 className="mb-4 text-8xl tracking-tight font-extrabold lg:text-9xl text-primary dark:text-primary">
            401
          </h1>

          {/* Main Message */}
          <p className="mb-4 text-3xl tracking-tight font-bold text-secondary md:text-4xl">
            Unauthorized Page
          </p>

          {/* Description */}
          <p className="mb-6 text-lg font-light text-secondary">
            You are not authorized to view this page. If you believe this is an
            error, please contact the administrator.
          </p>

          {/* Action Button */}
          <Link
            href="/home"
            className="inline-flex items-center justify-center text-titlecolor bg-primary hover:bg-secondary focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-6 py-3 shadow-lg transition-all duration-200 transform hover:scale-105 dark:focus:ring-primary-800"
          >
            Back to Homepage
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UnAuthorized;
