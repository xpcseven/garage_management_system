"use server";
import { LoginSchema } from "@/schemas";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/lib/action/user.action";
import { resendVerificationEmail } from "@/lib/action/auth/resend-verification";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validateFields = LoginSchema.safeParse(values);

  if (!validateFields.success) {
    return { error: "بيانات غير صالحة" };
  }

  const { email, password } = validateFields.data;

  const user = await getUserByEmail(email);
  if (!user?.password || user.isDeleted) {
    return { error: "البريد أو كلمة المرور غير صحيحة" };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return { error: "البريد أو كلمة المرور غير صحيحة" };
  }

  if (!user.emailVerified || !user.isActive) {
    return {
      error:
        "حسابك غير مفعّل بعد. افتح رابط التفعيل في بريدك أو أعد إرسال الرابط من الأسفل.",
      code: "EMAIL_NOT_VERIFIED" as const,
      emailForResend: user.email,
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
    return { success: "تم تسجيل الدخول بنجاح" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "البريد أو كلمة المرور غير صحيحة" };
        default:
          return { error: "حدث خطأ أثناء تسجيل الدخول" };
      }
    }
    throw error;
  }
};

export async function resendVerification(email: string) {
  return resendVerificationEmail(email);
}
