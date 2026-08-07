import { getApprovedRestaurantsForPassenger } from "@/lib/actions/restaurant.actions";
import PassengerRestaurantsList from "@/components/passenger/PassengerRestaurantsList";

export default async function PassengerRestaurantsPage() {
  const restaurants = await getApprovedRestaurantsForPassenger();
  return <PassengerRestaurantsList restaurants={restaurants} />;
}
