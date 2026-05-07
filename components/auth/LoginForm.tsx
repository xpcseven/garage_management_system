"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormLabel,
  FormItem,
  FormField,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { LoginSchema } from "@/schemas";
import { Button } from "../ui/button";

import { login } from "@/lib/action/auth/login";
import FormError from "./FormError";
import FormSuccess from "./FormSuccess";
import Image from "next/image";
import Link from "next/link";
import outsideGarageImage from "@/public/System/Outside_Garage.png";

const LoginForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    setError("");
    setSuccess("");
    startTransition(() => {
      login(values).then((data) => {
        setSuccess(data?.success);
        setError(data?.error);
      });
    });
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-5 lg:px-0">
      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 shadow-2xl backdrop-blur-sm">
        <div className="grid lg:grid-cols-[1fr_1.05fr]">
          <div className="bg-gradient-to-b from-slate-50 to-white p-5 text-right sm:p-8 lg:p-10">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                تسجيل الدخول
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                أهلاً بعودتك، أدخل بياناتك للوصول إلى لوحة إدارة الكراج.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
                dir="rtl"
              >
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <Input
                              className="text-right"
                              placeholder="name@garage.com"
                              type="email"
                              disabled={isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <Input
                              className="text-right"
                              placeholder="••••••••"
                              disabled={isPending}
                              {...field}
                              type="password"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            تأكد من صحة البريد وكلمة المرور الخاصة بحسابك.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormError message={error} />
                <FormSuccess message={success} />

                <Button
                  disabled={isPending}
                  type="submit"
                  size="lg"
                  className="h-11 w-full text-base font-semibold"
                >
                  دخول النظام
                </Button>
              </form>
            </Form>

            <div className="mt-5 border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
              ليس لديك حساب؟{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-purple-700 transition hover:text-purple-600"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </div>

          <aside className="relative hidden min-h-[420px] lg:block">
            <Image
              src={outsideGarageImage}
              alt="خدمات النقل الخارجي"
              fill
              priority
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/45 to-purple-800/30" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-right text-white">
              <h2 className="text-2xl font-bold leading-tight">
                إدارة متقدمة لرحلات النقل
              </h2>
              <p className="mt-3 text-sm text-slate-200">
                تابع الرحلات اليومية، راقب حالة المركبات، ونظم عمليات التشغيل
                بسهولة من حساب واحد.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
