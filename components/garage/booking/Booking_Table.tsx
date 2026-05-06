"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
import Swal from "sweetalert2";
import TablePagination from "@/components/Shared/TablePagination";

type Props = { bookings: BookingRow[]; canCancel: boolean };

export default function Booking_Table({ bookings, canCancel }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(bookings.length / PAGE_SIZE));
  const pagedBookings = useMemo(
    () => bookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [bookings, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">الحجوزات</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm responsive-table">
          <thead>
            <tr className="border-b text-center text-purple-700">
              <th className="p-2">صاحب الحجز</th>
              <th className="p-2">المسار</th>
              <th className="p-2 min-w-[10rem]">الأمتعة</th>
              <th className="p-2">المقعد</th>
              <th className="p-2">السعر</th>
              <th className="p-2">الحالة</th>
              <th className="p-2">وقت المغادرة</th>
              <th className="p-2">التاريخ</th>
              {canCancel && <th className="p-2 w-28">إجراءات</th>}
            </tr>
          </thead>
          <tbody className="text-center">
            {pagedBookings.map((b) => (
              <tr key={b.id} className="border-b border-muted">
                <td className="p-2 font-medium" data-label="صاحب الحجز">{b.passengerName}</td>
                <td className="p-2" data-label="المسار">
                  <TripRouteArrow
                    fromCityName={b.tripFromCity}
                    fromRegion={b.tripFromRegion}
                    toCityName={b.tripToCity}
                    toRegion={b.tripToRegion}
                  />
                </td>
                <td className="p-2 align-top" data-label="الأمتعة">
                  <BookingLuggageList luggage={b.luggage} />
                </td>
                <td className="p-2" data-label="المقعد">{b.seatNumber ?? "—"}</td>
                <td className="p-2 font-mono" data-label="السعر">{b.priceAtBooking}</td>
                <td className="p-2" data-label="الحالة">
                  <div className={`text-${b.status === "PENDING" ? "yellow-500" : b.status === "CONFIRMED" ? "green-500" : "red-500"} font-bold flex items-center gap-2`}>
                    {b.status}
                  </div>
                </td>
                <td className="p-2 text-muted-foreground whitespace-nowrap" data-label="وقت المغادرة">
                  {new Date(b.departureTime).toLocaleTimeString("en-US")}
                </td>
                <td className="p-2 text-muted-foreground" data-label="التاريخ">
                  {new Date(b.departureTime).toLocaleDateString("en-US")}
                </td>
                {canCancel && (
                  <td className="p-2" data-label="إجراءات">
                    {b.status === "PENDING" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={async () => {
                          const confirmed = await Swal.fire({
                            icon: "warning",
                            title: "إلغاء الحجز",
                            text: "هل تريد إلغاء الحجز؟",
                            showCancelButton: true,
                            confirmButtonText: "نعم، إلغاء",
                            cancelButtonText: "تراجع",
                          });
                          if (!confirmed.isConfirmed) return;
                          start(async () => {
                            const res = await cancelBooking(b.id);
                            if (res.success) {
                              router.refresh();
                              await Swal.fire({
                                icon: "success",
                                title: "تم الإلغاء",
                                text: "تم إلغاء الحجز بنجاح",
                                confirmButtonText: "موافق",
                              });
                            } else {
                              await Swal.fire({
                                icon: "error",
                                title: "تعذر الإلغاء",
                                text: res.error,
                                confirmButtonText: "حسناً",
                              });
                            }
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
                <td colSpan={canCancel ? 9 : 8} className="p-6 text-center text-muted-foreground">
                  لا توجد حجوزات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </Card>
  );
}
