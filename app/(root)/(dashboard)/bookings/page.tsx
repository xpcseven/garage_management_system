import { currentUser } from "@/lib/auth";
import { getBookingsForUser } from "@/lib/actions/booking.actions";
import Booking_Component from "@/components/garage/booking/Booking_Component";
import { UserRole } from "@/prisma/UserRole.enum";

export default async function BookingsPage() {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const bookings = await getBookingsForUser();
  const canCancel =
    user.role === UserRole.USER ||
    user.role === UserRole.SUPER_ADMIN ||
    user.role === UserRole.GARAGE_OWNER;

  return <Booking_Component bookings={bookings} canCancel={canCancel} />;
}
