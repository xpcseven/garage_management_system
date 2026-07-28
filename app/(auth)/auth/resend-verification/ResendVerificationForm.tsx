"use client";

import { useState, useTransition } from "react";
import { resendVerificationEmail } from "@/lib/action/auth/resend-verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormError from "@/components/auth/FormError";
import FormSuccess from "@/components/auth/FormSuccess";
import Link from "next/link";

export default function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    startTransition(() => {
      resendVerificationEmail(email).then((data) => {
        if ("success" in data) setSuccess(data.success);
        if ("error" in data) setError(data.error);
      });
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-right" dir="rtl">
      <div>
        <label className="mb-1.5 block text-sm font-medium">البريد الإلكتروني</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          disabled={pending}
          required
          className="text-right"
        />
      </div>
      <FormError message={error} />
      <FormSuccess message={success} />
      <Button type="submit" disabled={pending} className="w-full">
        إعادة إرسال رابط التحقق
      </Button>
      <p className="text-center text-sm text-slate-600">
        <Link href="/auth/login" className="font-semibold text-purple-700">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
