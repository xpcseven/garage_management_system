"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { HotelBookingRow } from "@/lib/actions/hotel.actions";
import { updateHotelBookingStatus } from "@/lib/actions/hotel.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@prisma/client";

export default function HotelBookingsManager({
  bookings,
}: {
  bookings: HotelBookingRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function setStatus(id: string, status: BookingStatus) {
    start(async () => {
      await updateHotelBookingStatus(id, status);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-purple-700">حجوزات الفندق</h1>
        <p className="text-sm text-muted-foreground">
          متابعة طلبات حجز الغرف من المسافرين.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-right">
              <th className="p-3">الضيف</th>
              <th className="p-3">الغرفة</th>
              <th className="p-3">من</th>
              <th className="p-3">إلى</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="p-3">{b.guestName}</td>
                <td className="p-3">
                  {b.hotelName} / {b.roomNumber}
                </td>
                <td className="p-3">
                  {new Date(b.checkIn).toLocaleDateString("ar")}
                </td>
                <td className="p-3">
                  {new Date(b.checkOut).toLocaleDateString("ar")}
                </td>
                <td className="p-3">
                  <Badge>{b.status}</Badge>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <Button
                      size="sm"
                      disabled={pending || b.status === "CONFIRMED"}
                      onClick={() => setStatus(b.id, "CONFIRMED")}
                    >
                      تأكيد
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending || b.status === "CANCELLED"}
                      onClick={() => setStatus(b.id, "CANCELLED")}
                    >
                      إلغاء
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  لا توجد حجوزات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
