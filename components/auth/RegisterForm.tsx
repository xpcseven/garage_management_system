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

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition placeholder:text-dusk/40 focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground";

const RegisterForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [emailForResend, setEmailForResend] = useState("");
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
    setEmailForResend("");
    startTransition(() => {
      register(values)
        .then((data) => {
          setSuccess(data?.success);
          setError(data?.error);
          if (
            data &&
            "emailForResend" in data &&
            typeof data.emailForResend === "string"
          ) {
            setEmailForResend(data.emailForResend);
          }
        })
        .catch((err) => {
          console.error(err);
          setError("تعذر إنشاء الحساب. حاول مرة أخرى.");
        });
    });
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-5">
      <div className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/25">
        <div className="grid lg:grid-cols-[1.05fr_1fr]">
          <aside className="relative min-h-[240px] lg:min-h-full">
            <Image
              src={createGarageImage}
              alt="منصة إدارة الشركات السياحية"
              fill
              priority
              unoptimized
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/95 via-plum/55 to-orchid/35 dark:from-background/95 dark:via-plum-dark/70 dark:to-orchid/25" />
            <div className="absolute inset-0 flex flex-col justify-between p-6 text-start text-white sm:p-8">
              <p className="self-start rounded-full border border-white/30 bg-white/10 px-3 py-1 font-data text-[11px] tracking-[0.18em] text-orchid-light">
                ASHUR
              </p>
              <div>
                <h2 className="font-display text-2xl leading-tight sm:text-3xl">
                  انضم إلى شبكة الضيافة والنقل
                </h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/75 sm:text-base dark:text-muted-foreground">
                  أنشئ حسابك وابدأ إدارة الرحلات، الحجوزات، أو نشاطك كفندق ومطعم
                  ومزرعة من لوحة واحدة.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs sm:text-sm">
                  {["حجوزات", "مركبات", "برامج سياحية"].map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="bg-mist/40 p-5 text-start sm:p-8 lg:p-10 dark:bg-background/40">
            <div className="mb-6">
              <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid dark:text-orchid-light">
                حساب جديد
              </p>
              <h1 className="mt-2 font-display text-3xl text-dusk dark:text-foreground sm:text-4xl">
                إنشاء حساب
              </h1>
              <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
                أدخل بياناتك ثم اختر نوع الحساب المناسب لنشاطك.
              </p>

              <div
                role="note"
                className="mt-4 rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-3 text-start dark:border-amber-500/40 dark:bg-amber-950/40"
              >
                <p className="font-data text-[10px] uppercase tracking-[0.16em] text-amber-800 dark:text-amber-200">
                  مهم قبل التسجيل
                </p>
                <p className="mt-1.5 text-sm leading-7 text-amber-950 dark:text-amber-100">
                  يُرجى إدخال بريد إلكتروني صحيح وفعال؛ ستصلك رسالة تأكيد لتفعيل
                  الحساب. بدون فتح رابط التفعيل لن تتمكن من تسجيل الدخول.
                </p>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
                dir="rtl"
              >
                <div className="rounded-[1.5rem] bg-white p-4 ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20 sm:p-5">
                  <h3 className="mb-4 font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
                    البيانات الشخصية
                  </h3>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-dusk dark:text-foreground">
                            الاسم الكامل
                          </FormLabel>
                          <FormControl>
                            <Input
                              className={fieldClass}
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
                          <FormLabel className="text-dusk dark:text-foreground">
                            البريد الإلكتروني
                          </FormLabel>
                          <FormControl>
                            <Input
                              className={fieldClass}
                              placeholder="name@example.com"
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
                          <FormLabel className="text-dusk dark:text-foreground">
                            كلمة المرور
                          </FormLabel>
                          <FormControl>
                            <Input
                              className={fieldClass}
                              placeholder="••••••••"
                              type="password"
                              disabled={isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-dusk/50 dark:text-muted-foreground">
                            يفضّل كلمة مرور قوية لا تقل عن 8 أحرف.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-white p-4 ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20 sm:p-5">
                  <h3 className="mb-4 font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
                    إعدادات الحساب
                  </h3>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-dusk dark:text-foreground">
                            نوع الحساب
                          </FormLabel>
                          <FormDescription className="text-xs text-dusk/50 dark:text-muted-foreground">
                            حساب المشرف العام لا يُنشأ من هذه الصفحة.
                          </FormDescription>
                          <FormControl>
                            <select
                              {...field}
                              disabled={isPending}
                              className={fieldClass}
                            >
                              <option value="USER">مسافر / عميل</option>
                              <option value="GARAGE_OWNER">
                                مالك شركة سياحية
                              </option>
                              <option value="DRIVER">سائق مستقل</option>
                              <option value="TOURISM_OWNER">
                                مالك مكان سياحي
                              </option>
                              <option value="HOTEL_OWNER">صاحب فندق</option>
                              <option value="RESTAURANT_OWNER">
                                صاحب مطعم
                              </option>
                              <option value="FARM_OWNER">صاحب مزرعة</option>
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
                            <FormLabel className="text-dusk dark:text-foreground">
                              نوع الخدمات أو النقل
                            </FormLabel>
                            <FormDescription className="text-xs text-dusk/50 dark:text-muted-foreground">
                              يظهر لصاحب الشركة السياحية أو السائق فقط.
                            </FormDescription>
                            <div className="space-y-3 rounded-2xl bg-mist/70 p-3 ring-1 ring-plum/10 dark:bg-background dark:ring-orchid/15">
                              {REGISTER_JOB_OPTIONS.map((opt) => {
                                const list = field.value ?? [];
                                const checked = list.includes(opt.value);
                                return (
                                  <label
                                    key={opt.value}
                                    className="flex cursor-pointer flex-row-reverse items-center gap-3 text-sm text-dusk dark:text-foreground"
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

                {emailForResend ? (
                  <p className="text-center text-sm text-dusk/70 dark:text-muted-foreground">
                    <Link
                      href={`/auth/resend-verification?email=${encodeURIComponent(emailForResend)}`}
                      className="font-semibold text-plum underline-offset-4 hover:text-orchid hover:underline dark:text-orchid-light"
                    >
                      إعادة إرسال رابط التحقق
                    </Link>
                  </p>
                ) : null}

                <Button
                  disabled={isPending}
                  type="submit"
                  size="lg"
                  className="h-11 w-full rounded-xl border-0 bg-orchid text-base font-semibold text-white hover:bg-orchid-light"
                >
                  {isPending ? "جاري الإنشاء…" : "إنشاء الحساب"}
                </Button>
              </form>
            </Form>

            <div className="mt-5 border-t border-plum/10 pt-4 text-center text-sm text-dusk/60 dark:border-orchid/15 dark:text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-plum transition hover:text-orchid dark:text-orchid-light dark:hover:text-orchid"
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
