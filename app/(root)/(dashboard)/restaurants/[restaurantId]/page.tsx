import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { canManageRestaurants } from "@/lib/permissions";
import { getRestaurantForOwner } from "@/lib/actions/restaurant.actions";
import { RestaurantDetailManager } from "@/components/restaurant/RestaurantsManager";
import UnAuthorized from "@/components/UnAuthorized";
import { Button } from "@/components/ui/button";

type Props = { params: { restaurantId: string } };

export default async function RestaurantDetailPage({ params }: Props) {
  const user = await currentUser();
  if (!user || !canManageRestaurants(user.role)) return <UnAuthorized />;

  const restaurant = await getRestaurantForOwner(params.restaurantId);
  if (!restaurant) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-display text-2xl text-plum dark:text-orchid-light">
          المطعم غير موجود
        </p>
        <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
          ربما حُذف أو ليس لديك صلاحية عرضه.
        </p>
        <Button
          asChild
          className="mt-6 rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
        >
          <Link href="/restaurants">العودة للمطاعم</Link>
        </Button>
      </div>
    );
  }

  return <RestaurantDetailManager restaurant={restaurant} />;
}
