import { getPublicGaragesForPassenger } from "@/lib/actions/passenger.actions";
import Passenger_Garages_Component from "@/components/passenger/Passenger_Garages_Component";

export default async function PassengerGaragesPage() {
  const garages = await getPublicGaragesForPassenger();
  return <Passenger_Garages_Component garages={garages} />;
}
