import { currentUser } from "@/lib/auth";
import { canManageFarms } from "@/lib/permissions";
import { getFarmBookingsForOwner } from "@/lib/actions/farm.actions";
import { FarmBookingsManager } from "@/components/farm/FarmsManager";
import UnAuthorized from "@/components/UnAuthorized";

export default async function FarmBookingsPage() {
  const user = await currentUser();
  if (!user || !canManageFarms(user.role)) return <UnAuthorized />;
  const bookings = await getFarmBookingsForOwner();
  return <FarmBookingsManager bookings={bookings} />;
}
