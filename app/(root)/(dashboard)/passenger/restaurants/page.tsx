import { currentUser } from "@/lib/auth";
import { canUsePassengerPortal } from "@/lib/permissions";
import { getApprovedRestaurantsForPassenger } from "@/lib/actions/restaurant.actions";
import PassengerRestaurantsList from "@/components/passenger/PassengerRestaurantsList";
import UnAuthorized from "@/components/UnAuthorized";

export default async function PassengerRestaurantsPage() {
  const user = await currentUser();
  if (!user || !canUsePassengerPortal(user.role)) return <UnAuthorized />;
  const restaurants = await getApprovedRestaurantsForPassenger();
  return <PassengerRestaurantsList restaurants={restaurants} />;
}
