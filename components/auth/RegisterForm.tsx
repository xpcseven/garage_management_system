"use client";
import { useForm, useWatch } from "react-hook-form";
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
import { useState, useTransition, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { RegisterSchema } from "@/schemas";
import { Button } from "../ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { register } from "@/lib/action/auth/register";
import FormError from "./FormError";
import FormSuccess from "./FormSuccess";
import Image from "next/image";
import Link from "next/link";
import createGarageImage from "@/public/System/Create_Garage.png";

const REGISTER_JOB_OPTIONS = [
  { value: "PASSENGERS" as const, label: "مسافرين" },
  { value: "CARGO" as const, label: "بضائع" },
  { value: "DELIVERY" as const, label: "بريد / توصيل" },
];

const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      role: "USER",
      jobTypes: [],
    },
  });

  const role = useWatch({ control: form.control, name: "role" });
  const showJobType = role === "GARAGE_OWNER" || role === "DRIVER";

  useEffect(() => {
    if (role === "USER") {
      form.setValue("jobTypes", []);
    }
  }, [role, form]);

  async function onSubmit(values: z.infer<typeof RegisterSchema>) {
    setError("");
    setSuccess("");
    startTransition(() => {
      register(values).then((data) => {
        setSuccess(data?.success);
        setError(data?.error);
      });
    });
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-5 lg:px-0">
      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 shadow-2xl backdrop-blur-sm">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <aside className="relative min-h-[260px] lg:min-h-[740px]">
            <Image
              src={createGarageImage}
              alt="صورة كراج سيارات"
              fill
              priority
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/45 to-sky-800/35" />
            <div className="absolute inset-0 flex flex-col justify-between p-6 text-right text-white sm:p-8">
              <div className="self-start rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs">
                Garage Management System
              </div>
              <div>
                <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">
                  منصة متكاملة لإدارة الكراج
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-200 sm:text-base">
                  أنشئ حسابك الآن وابدأ إدارة العملاء، السائقين، ونشاطات الكراج
                  اليومية من لوحة واحدة.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-2 text-xs text-slate-100 sm:grid-cols-3 sm:text-sm">
                  <span className="rounded-md bg-white/10 px-3 py-2 text-center">
                    إدارة الحجوزات
                  </span>
                  <span className="rounded-md bg-white/10 px-3 py-2 text-center">
                    تتبع المركبات
                  </span>
                  <span className="rounded-md bg-white/10 px-3 py-2 text-center">
                    تنظيم السائقين
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <div className="bg-gradient-to-b from-slate-50 to-white p-5 text-right sm:p-8 lg:p-10">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                إنشاء حساب جديد
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                أدخل بياناتك الأساسية ثم اختر نوع الحساب المناسب لنشاطك.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
                dir="rtl"
              >
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                  <h3 className="mb-4 text-sm font-bold text-slate-800">
                    البيانات الشخصية
                  </h3>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الكامل</FormLabel>
                          <FormControl>
                            <Input
                              className="text-right"
                              placeholder="مثال: أحمد خالد"
                              type="text"
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
                              type="password"
                              disabled={isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            يفضّل استخدام كلمة مرور قوية لا تقل عن 8 أحرف.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                  <h3 className="mb-4 text-sm font-bold text-slate-800">
                    إعدادات الحساب
                  </h3>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع الحساب</FormLabel>
                          <FormDescription className="text-xs">
                            اختر الدور المناسب. حساب المشرف العام لا يُنشأ من
                            هذه الصفحة.
                          </FormDescription>
                          <FormControl>
                            <select
                              {...field}
                              disabled={isPending}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="USER">عميل الكراج</option>
                              <option value="GARAGE_OWNER">صاحب كراج</option>
                              <option value="DRIVER">سائق مركبة</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {showJobType && (
                      <FormField
                        control={form.control}
                        name="jobTypes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>نوع الخدمات أو النقل</FormLabel>
                            <FormDescription className="text-xs">
                              يظهر هذا القسم لصاحب الكراج أو السائق فقط.
                            </FormDescription>
                            <div className="space-y-3 rounded-md border border-input bg-background p-3">
                              {REGISTER_JOB_OPTIONS.map((opt) => {
                                const list = field.value ?? [];
                                const checked = list.includes(opt.value);
                                return (
                                  <label
                                    key={opt.value}
                                    className="flex cursor-pointer flex-row-reverse items-center gap-3 text-sm"
                                  >
                                    <Checkbox
                                      disabled={isPending}
                                      checked={checked}
                                      onCheckedChange={(c) => {
                                        const on = c === true;
                                        const next = on
                                          ? [...new Set([...list, opt.value])]
                                          : list.filter((v) => v !== opt.value);
                                        field.onChange(next);
                                      }}
                                    />
                                    <span>{opt.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </div>

                <FormError message={error} />
                <FormSuccess message={success} />

                <Button
                  disabled={isPending}
                  type="submit"
                  size="lg"
                  className="h-11 w-full bg-sky-600 text-base font-semibold hover:bg-sky-500"
                >
                  إنشاء الحساب
                </Button>
              </form>
            </Form>

            <div className="mt-5 border-t border-slate-200 pt-4 text-center text-sm text-slate-600">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-sky-700 transition hover:text-sky-600"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegisterForm;
