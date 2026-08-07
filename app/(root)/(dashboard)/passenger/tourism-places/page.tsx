import { currentUser } from "@/lib/auth";
import { canSuggestTourismPlaces } from "@/lib/permissions";
import { getPublicTourismPlacesForPassenger } from "@/lib/actions/tourism_places.actions";
import Passenger_Tourism_Places_Component from "@/components/passenger/Passenger_Tourism_Places_Component";

export default async function PassengerTourismPlacesPage() {
  const user = await currentUser();
  const places = await getPublicTourismPlacesForPassenger();
  return (
    <Passenger_Tourism_Places_Component
      places={places}
      canSuggest={canSuggestTourismPlaces(user?.role)}
    />
  );
}
