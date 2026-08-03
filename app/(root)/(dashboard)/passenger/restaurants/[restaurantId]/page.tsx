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
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-display text-2xl text-plum">المطعم غير متاح</p>
        <p className="mt-2 text-sm text-dusk/60">
          ربما تم إخفاؤه أو لم يعد معتمداً.
        </p>
        <Button
          asChild
          className="mt-6 rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
        >
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
