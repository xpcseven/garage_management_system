import { currentUser } from "@/lib/auth";
import { canManageRestaurants } from "@/lib/permissions";
import { getRestaurantsForOwner } from "@/lib/actions/restaurant.actions";
import { RestaurantsManager } from "@/components/restaurant/RestaurantsManager";
import UnAuthorized from "@/components/UnAuthorized";

export default async function RestaurantsPage() {
  const user = await currentUser();
  if (!user || !canManageRestaurants(user.role)) return <UnAuthorized />;
  const restaurants = await getRestaurantsForOwner();
  return <RestaurantsManager restaurants={restaurants} />;
}
