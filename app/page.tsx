"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {

  return (
    <main className="overflow-hidden min-h-screen font-cairo bg-background px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24">
      <div>
        <Link href="/home">
          <Button>Home Page</Button>
        </Link>
      </div>
    </main>
  );
}
