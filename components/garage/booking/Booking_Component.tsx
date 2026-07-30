"use client";

import type { BookingRow } from "@/lib/actions/booking.actions";
import Booking_Table from "./Booking_Table";
import GarageBookSeatsDialog from "./GarageBookSeatsDialog";

type Props = {
  bookings: BookingRow[];
  canCancel: boolean;
  canBookSeats?: boolean;
};

export default function Booking_Component({
  bookings,
  canCancel,
  canBookSeats = false,
}: Props) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 font-body">
      <div className="ashur-panel flex flex-wrap items-start justify-between gap-3 p-5">
        <div>
          <h1 className="ashur-page-title">الحجوزات</h1>
          <p className="mt-1 text-sm text-dusk/60 dark:text-mist/60">
            راجع حجوزاتك أو احجز مقاعد من رحلات شركتك.
          </p>
        </div>
        {canBookSeats && <GarageBookSeatsDialog />}
      </div>
      <Booking_Table bookings={bookings} canCancel={canCancel} />
    </div>
  );
}
