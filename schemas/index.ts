import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  password: z.string().min(1, {
    message: "كلمة المرور مطلوبة",
  }),
});

/** أدوار التسجيل الذاتي — بدون SUPER_ADMIN */
export const SelfRegisterRoleSchema = z.enum([
  "GARAGE_OWNER",
  "USER",
  "DRIVER",
  "TOURISM_OWNER",
]);

export const RegisterJobTypeSchema = z.enum([
  "PASSENGERS",
  "CARGO",
  "DELIVERY",
]);

export const RegisterSchema = z
  .object({
    email: z.string().email({
      message: "البريد الإلكتروني غير صالح",
    }),
    password: z.string().min(6, {
      message: "الحد الأدنى 6 أحرف",
    }),
    name: z.string().min(1, {
      message: "الاسم مطلوب",
    }),
    role: SelfRegisterRoleSchema,
    /** أنواع النقل (اختيار متعدد) — تُستخدم لصاحب الكراج والسائق فقط */
    jobTypes: z.array(RegisterJobTypeSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.role === "GARAGE_OWNER" || data.role === "DRIVER") {
      const unique = [...new Set(data.jobTypes)];
      if (unique.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "اختر نوعاً واحداً على الأقل من أنواع النقل",
          path: ["jobTypes"],
        });
      }
    }
  });
