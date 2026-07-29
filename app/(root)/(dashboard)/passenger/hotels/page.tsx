import { currentUser } from "@/lib/auth";
import { canUsePassengerPortal } from "@/lib/permissions";
import { getApprovedHotelsForPassenger } from "@/lib/actions/hotel.actions";
import PassengerHotelsList from "@/components/passenger/PassengerHotelsList";
import UnAuthorized from "@/components/UnAuthorized";

export default async function PassengerHotelsPage() {
  const user = await currentUser();
  if (!user || !canUsePassengerPortal(user.role)) return <UnAuthorized />;
  const hotels = await getApprovedHotelsForPassenger();
  return <PassengerHotelsList hotels={hotels} />;
}
