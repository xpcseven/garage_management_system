import { currentUser } from "@/lib/auth";
import { getFreelanceTripsForPassenger } from "@/lib/actions/passenger.actions";
import { canUsePassengerPortal } from "@/lib/permissions";
import Passenger_Freelance_Trips_Component from "@/components/passenger/Passenger_Freelance_Trips_Component";
import UnAuthorized from "@/components/UnAuthorized";

export default async function PassengerFreelanceTripsPage() {
  const user = await currentUser();
  if (!user || !canUsePassengerPortal(user.role)) {
    return <UnAuthorized />;
  }

  const trips = await getFreelanceTripsForPassenger();
  return <Passenger_Freelance_Trips_Component trips={trips} />;
}
