import { Suspense } from "react";
import ResendVerificationForm from "./ResendVerificationForm";

export default function ResendVerificationPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 to-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-center text-xl font-bold text-purple-800">
          إعادة إرسال رابط التحقق
        </h1>
        <p className="mt-2 mb-6 text-center text-sm text-slate-600">
          أدخل بريدك لإرسال رابط تأكيد جديد (صالح 24 ساعة).
        </p>
        <Suspense fallback={null}>
          <ResendVerificationForm />
        </Suspense>
      </div>
    </main>
  );
}
