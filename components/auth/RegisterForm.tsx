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
import CardWrapper from "@/components/auth/CardWrapper";
import { z } from "zod";
import { RegisterSchema } from "@/schemas";
import { Button } from "../ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { register } from "@/lib/action/auth/register";
import FormError from "./FormError";
import FormSuccess from "./FormSuccess";

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
    <CardWrapper
      headerLabel="إنشاء حساب"
      backButtonLabel="لديك حساب؟ تسجيل الدخول"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 text-right"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الاسم الكامل</FormLabel>
                <FormControl>
                  <Input
                    className="text-right"
                    placeholder="الاسم"
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
                    placeholder="you@example.com"
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نوع الحساب</FormLabel>
                <FormDescription className="text-xs">
                  اختر دورك في النظام (لا يمكن اختيار مشرف عام من هنا).
                </FormDescription>
                <FormControl>
                  <select
                    {...field}
                    disabled={isPending}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="USER">مسافر — حجز رحلات</option>
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
                  <FormLabel>ما الذي تنوي نقله؟</FormLabel>
                  <FormDescription className="text-xs">
                    اختر واحداً أو أكثر (متعدد). يظهر لصاحب الكراج وللسائق فقط.
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

          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending}
            type="submit"
            size="lg"
            className="w-full bg-sky-500 hover:bg-sky-400"
          >
            إنشاء الحساب
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterForm;
