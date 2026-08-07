import { currentUser } from "@/lib/auth";
import { canUsePassengerPortal } from "@/lib/permissions";
import { getFreelanceTripsForPassenger } from "@/lib/actions/passenger.actions";
import Passenger_Freelance_Trips_Component from "@/components/passenger/Passenger_Freelance_Trips_Component";

export default async function PassengerFreelanceTripsPage() {
  const user = await currentUser();
  const isLoggedIn = Boolean(user && canUsePassengerPortal(user.role));
  const trips = await getFreelanceTripsForPassenger();
  return (
    <Passenger_Freelance_Trips_Component
      trips={trips}
      isLoggedIn={isLoggedIn}
    />
  );
}
