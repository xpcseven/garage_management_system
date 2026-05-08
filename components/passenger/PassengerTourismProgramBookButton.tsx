"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { bookTourismProgram } from "@/lib/actions/tourism_program.actions";
import Swal from "sweetalert2";

type Props = {
  programId: string;
};

export default function PassengerTourismProgramBookButton({ programId }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      size="sm"
      disabled={pending}
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

