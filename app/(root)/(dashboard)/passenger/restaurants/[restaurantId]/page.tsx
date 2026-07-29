import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { canUsePassengerPortal } from "@/lib/permissions";
import { getRestaurantDetailForPassenger } from "@/lib/actions/restaurant.actions";
import PassengerRestaurantDetail from "@/components/passenger/PassengerRestaurantDetail";
import UnAuthorized from "@/components/UnAuthorized";
import { Button } from "@/components/ui/button";

type Props = { params: { restaurantId: string } };

export default async function PassengerRestaurantDetailPage({ params }: Props) {
  const user = await currentUser();
  if (!user || !canUsePassengerPortal(user.role)) return <UnAuthorized />;

  const restaurant = await getRestaurantDetailForPassenger(params.restaurantId);
  if (!restaurant) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-8 text-center">
        <h1 className="text-xl font-bold text-slate-800">المطعم غير متاح</h1>
        <p className="text-sm text-muted-foreground">
          ربما تم إخفاؤه أو لم يعد معتمداً.
        </p>
        <Button asChild>
          <Link href="/passenger/restaurants">العودة للمطاعم</Link>
        </Button>
      </div>
    );
  }

  return (
    <PassengerRestaurantDetail
      restaurant={{
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        location: restaurant.location,
        phone: restaurant.phone,
        description: restaurant.description,
        capacity: restaurant.capacity,
        openHours: restaurant.openHours,
        city: restaurant.city,
        images: restaurant.images,
      }}
    />
  );
}
