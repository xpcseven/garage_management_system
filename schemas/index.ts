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
  "HOTEL_OWNER",
  "RESTAURANT_OWNER",
  "FARM_OWNER",
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
    /** سائق رحلات مستقلة */
    isIndependentDriver: z.boolean().default(false),
    /** سائق مرتبط بشركة سياحية */
    isCompanyDriver: z.boolean().default(false),
    /** الشركات التي يرتبط بها السائق عند التسجيل */
    garageIds: z.array(z.string().uuid()).default([]),
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
    if (data.role === "DRIVER") {
      if (!data.isIndependentDriver && !data.isCompanyDriver) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "اختر نوع عمل واحداً على الأقل للسائق",
          path: ["isIndependentDriver"],
        });
      }
      if (data.isCompanyDriver) {
        const uniqueGarages = [...new Set(data.garageIds)];
        if (uniqueGarages.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "اختر شركة سياحية واحدة على الأقل للارتباط بها",
            path: ["garageIds"],
          });
        }
      }
    }
  });
