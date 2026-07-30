import { currentUser } from "@/lib/auth";
import { canManageRestaurants } from "@/lib/permissions";
import { getRestaurantBookingsForOwner } from "@/lib/actions/restaurant.actions";
import { RestaurantBookingsManager } from "@/components/restaurant/RestaurantsManager";
import UnAuthorized from "@/components/UnAuthorized";

export default async function RestaurantBookingsPage() {
  const user = await currentUser();
  if (!user || !canManageRestaurants(user.role)) return <UnAuthorized />;
  const bookings = await getRestaurantBookingsForOwner();
  return <RestaurantBookingsManager bookings={bookings} />;
}
