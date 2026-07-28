import Link from "next/link";
import { verifyEmail } from "@/lib/action/auth/verify-email";

type Props = {
  searchParams: { token?: string };
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const token = searchParams.token?.trim() ?? "";

  let result: { success?: true; error?: string } = {
    error: "رابط التحقق غير مكتمل",
  };

  if (token) {
    result = await verifyEmail(token);
  }

  const ok = "success" in result && result.success;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 to-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
            ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          }`}
          aria-hidden
        >
          {ok ? "✓" : "!"}
        </div>
        <h1 className="text-xl font-bold text-purple-800">
          {ok ? "تم التحقق" : "تعذر التحقق"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          {ok
            ? "تم تأكيد بريدك بنجاح. يمكنك الآن تسجيل الدخول."
            : result.error ?? "رابط غير صالح"}
        </p>
        <div className="mt-8 flex flex-col gap-2">
          <Link
            href="/auth/login"
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-purple-700 px-4 text-sm font-semibold text-white hover:bg-purple-800"
          >
            تسجيل الدخول
          </Link>
          {!ok && (
            <Link
              href="/auth/register"
              className="inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 hover:bg-slate-50"
            >
              إنشاء حساب جديد
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
