import { currentUser } from "@/lib/auth";
import { getPublicGaragesForPassenger } from "@/lib/actions/passenger.actions";
import { canUsePassengerPortal } from "@/lib/permissions";
import Passenger_Garages_Component from "@/components/passenger/Passenger_Garages_Component";
import UnAuthorized from "@/components/UnAuthorized";

export default async function PassengerGaragesPage() {
  const user = await currentUser();
  if (!user || !canUsePassengerPortal(user.role)) {
    return <UnAuthorized />;
  }
  const garages = await getPublicGaragesForPassenger();
  return <Passenger_Garages_Component garages={garages} />;
}
