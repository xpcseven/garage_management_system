"use client";

import { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { bookTourismProgram } from "@/lib/actions/tourism_program.actions";
import { loginWithCallback } from "@/routes";
import Swal from "sweetalert2";

type Props = {
  programId: string;
  isLoggedIn?: boolean;
};

export default function PassengerTourismProgramBookButton({
  programId,
  isLoggedIn = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();

  if (!isLoggedIn) {
    return (
      <Button
        asChild
        size="sm"
        className="rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white"
      >
        <Link href={loginWithCallback(pathname)}>سجّل الدخول للحجز</Link>
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      disabled={pending}
      className="rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white"
      onClick={async () => {
        const confirmed = await Swal.fire({
          icon: "question",
          title: "تأكيد الحجز",
          text: "حدد عدد الأفراد للحجز على هذا البرنامج السياحي",
          input: "number",
          inputValue: 1,
          inputAttributes: {
            min: "1",
            step: "1",
          },
          inputValidator: (value) => {
            const n = Number(value);
            if (!Number.isInteger(n) || n < 1) return "أدخل عدد أفراد صحيح (1 أو أكثر)";
            return null;
          },
          showCancelButton: true,
          confirmButtonText: "نعم، حجز",
          cancelButtonText: "إلغاء",
        });
        if (!confirmed.isConfirmed) return;
        const count = Number(confirmed.value ?? 1);

        start(async () => {
          const res = await bookTourismProgram(programId, count);
          if (res.success) {
            router.refresh();
            await Swal.fire({
              icon: "success",
              title: "تم الحجز",
              text: "تم حجزك على البرنامج السياحي بنجاح",
              confirmButtonText: "موافق",
            });
          } else {
            await Swal.fire({
              icon: "error",
              title: "تعذر الحجز",
              text: res.error,
              confirmButtonText: "حسناً",
            });
          }
        });
      }}
    >
      حجز البرنامج
    </Button>
  );
}

