"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BookingRow } from "@/lib/actions/booking.actions";
import { cancelBooking } from "@/lib/actions/booking.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TripRouteArrow from "@/components/Shared/TripRouteArrow";
import BookingLuggageList from "./BookingLuggageList";

type Props = { bookings: BookingRow[]; canCancel: boolean };

export default function Booking_Table({ bookings, canCancel }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">الحجوزات</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-right">
              <th className="p-2">المسار</th>
              <th className="p-2 min-w-[10rem]">الأمتعة</th>
              <th className="p-2">المقعد</th>
              <th className="p-2">السعر</th>
              <th className="p-2">الحالة</th>
              <th className="p-2">التاريخ</th>
              {canCancel && <th className="p-2 w-28">إجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-muted">
                <td className="p-2">
                  <TripRouteArrow
                    fromCityName={b.tripFromCity}
                    fromRegion={b.tripFromRegion}
                    toCityName={b.tripToCity}
                    toRegion={b.tripToRegion}
                  />
                </td>
                <td className="p-2 align-top">
                  <BookingLuggageList luggage={b.luggage} />
                </td>
                <td className="p-2">{b.seatNumber ?? "—"}</td>
                <td className="p-2 font-mono">{b.priceAtBooking}</td>
                <td className="p-2">
                  <Badge variant={b.status === "PENDING" ? "default" : "secondary"}>
                    {b.status}
                  </Badge>
                </td>
                <td className="p-2 text-muted-foreground">
                  {new Date(b.createdAt).toLocaleDateString("ar-IQ")}
                </td>
                {canCancel && (
                  <td className="p-2">
                    {b.status === "PENDING" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => {
                          if (!confirm("إلغاء الحجز؟")) return;
                          start(async () => {
                            const res = await cancelBooking(b.id);
                            if (res.success) router.refresh();
                            else alert(res.error);
                          });
                        }}
                      >
                        إلغاء
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={canCancel ? 7 : 6} className="p-6 text-center text-muted-foreground">
                  لا توجد حجوزات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
