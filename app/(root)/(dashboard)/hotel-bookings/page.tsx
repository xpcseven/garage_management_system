import { currentUser } from "@/lib/auth";
import { canManageHotels } from "@/lib/permissions";
import { getHotelBookingsForOwner } from "@/lib/actions/hotel.actions";
import HotelBookingsManager from "@/components/hotel/HotelBookingsManager";
import UnAuthorized from "@/components/UnAuthorized";

export default async function HotelBookingsPage() {
  const user = await currentUser();
  if (!user || !canManageHotels(user.role)) return <UnAuthorized />;
  const bookings = await getHotelBookingsForOwner();
  return <HotelBookingsManager bookings={bookings} />;
}
