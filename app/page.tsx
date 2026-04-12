import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen font-cairo bg-gradient-to-b from-sky-50 to-background px-4 py-16 flex flex-col items-center justify-center gap-8 text-center">
      <div className="max-w-lg space-y-4">
        <h1 className="text-3xl font-bold text-sky-800 md:text-4xl">
          نظام إدارة كراج السيارات
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          إدارة الكراجات، المركبات، الرحلات والحجوزات. سجّل الدخول للوصول إلى لوحة
          التحكم.
        </p>
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button asChild className="bg-sky-600 hover:bg-sky-500">
          <Link href="/auth/login">تسجيل الدخول</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/auth/register">إنشاء حساب</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/home">لوحة التحكم</Link>
        </Button>
      </div>
    </main>
  );
}
