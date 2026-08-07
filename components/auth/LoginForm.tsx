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
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { LoginSchema } from "@/schemas";
import { Button } from "../ui/button";
import { login, resendVerification } from "@/lib/action/auth/login";
import FormError from "./FormError";
import FormSuccess from "./FormSuccess";
import Image from "next/image";
import Link from "next/link";
import outsideGarageImage from "@/public/System/Outside_Garage.png";

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition placeholder:text-dusk/40 focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground";

const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [needsVerify, setNeedsVerify] = useState(false);
  const [emailForResend, setEmailForResend] = useState("");
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
    setNeedsVerify(false);
    setEmailForResend("");
    startTransition(() => {
      login(values, callbackUrl).then((data) => {
        setSuccess(data?.success);
        setError(data?.error);
        if (data && "code" in data && data.code === "EMAIL_NOT_VERIFIED") {
          setNeedsVerify(true);
          setEmailForResend(
            ("emailForResend" in data && data.emailForResend) || values.email
          );
        }
      });
    });
  }

  function onResend() {
    const email = emailForResend || form.getValues("email");
    setError("");
    setSuccess("");
    startTransition(() => {
      resendVerification(email).then((data) => {
        if ("success" in data) setSuccess(data.success);
        if ("error" in data) setError(data.error);
      });
    });
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-5 sm:px-5">
      <div className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/25">
        <div className="grid lg:grid-cols-[1fr_1.05fr]">
          <div className="bg-mist/40 p-5 text-start sm:p-8 lg:p-10 dark:bg-background/40">
            <div className="mb-6">
              <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid dark:text-orchid-light">
                مرحباً بعودتك
              </p>
              <h1 className="mt-2 font-display text-3xl text-dusk dark:text-foreground sm:text-4xl">
                تسجيل الدخول
              </h1>
              <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
                أدخل بياناتك للوصول إلى لوحة التحكم وإدارة نشاطك.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
                dir="rtl"
              >
                <div className="rounded-[1.5rem] bg-white p-4 ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20 sm:p-5">
                  <h3 className="mb-4 font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
                    بيانات الدخول
                  </h3>

                  <div className="space-y-4">
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
                              disabled={isPending}
                              {...field}
                              type="password"
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-dusk/50 dark:text-muted-foreground">
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

                {needsVerify && (
                  <div className="space-y-3 rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-3 dark:border-amber-500/40 dark:bg-amber-950/40">
                    <p className="text-sm leading-7 text-amber-950 dark:text-amber-100">
                      حسابك غير مفعّل بعد. افتح رابط التأكيد من بريدك، أو أعد
                      إرسال الرسالة.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      onClick={onResend}
                      className="h-10 w-full rounded-xl border-amber-400/60 bg-white text-amber-950 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-transparent dark:text-amber-100 dark:hover:bg-amber-950/60"
                    >
                      إعادة إرسال رابط التحقق
                    </Button>
                  </div>
                )}

                <Button
                  disabled={isPending}
                  type="submit"
                  size="lg"
                  className="h-11 w-full rounded-xl border-0 bg-orchid text-base font-semibold text-white hover:bg-orchid-light"
                >
                  {isPending ? "جاري الدخول…" : "دخول النظام"}
                </Button>
              </form>
            </Form>

            <div className="mt-5 space-y-2 border-t border-plum/10 pt-4 text-center text-sm text-dusk/60 dark:border-orchid/15 dark:text-muted-foreground">
              <p>
                ليس لديك حساب؟{" "}
                <Link
                  href="/auth/register"
                  className="font-semibold text-plum transition hover:text-orchid dark:text-orchid-light dark:hover:text-orchid"
                >
                  إنشاء حساب جديد
                </Link>
              </p>
              <p>
                <Link
                  href="/auth/resend-verification"
                  className="text-xs font-medium text-orchid transition hover:text-plum dark:text-orchid-light"
                >
                  لم يصلك رابط التفعيل؟
                </Link>
              </p>
            </div>
          </div>

          <aside className="relative hidden min-h-[420px] lg:block">
            <Image
              src={outsideGarageImage}
              alt="خدمات النقل والسياحة"
              fill
              priority
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-plum-dark/95 via-plum/50 to-orchid/30 dark:from-background/95 dark:via-plum-dark/70 dark:to-orchid/25" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-start text-white">
              <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid-light">
                ASHUR
              </p>
              <h2 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">
                إدارة رحلاتك ونشاطك من مكان واحد
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/75 dark:text-muted-foreground">
                تابع الحجوزات، المركبات، والبرامج السياحية بسهولة عبر حسابك.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default LoginForm;
