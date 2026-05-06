import type { BookingRow } from "@/lib/actions/booking.actions";
import Booking_Table from "./Booking_Table";

type Props = {
  bookings: BookingRow[];
  canCancel: boolean;
};

export default function Booking_Component({ bookings, canCancel }: Props) {
  return (
    <div className="space-y-8 p-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-purple-500">الحجوزات</h1>
        <p className="text-muted-foreground text-sm mt-1">
          عرض الحجوزات حسب صلاحيتك في النظام.
        </p>
      </div>
      <Booking_Table bookings={bookings} canCancel={canCancel} />
    </div>
  );
}
