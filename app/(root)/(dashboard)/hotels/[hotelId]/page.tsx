import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { canManageHotels } from "@/lib/permissions";
import { getHotelForOwner } from "@/lib/actions/hotel.actions";
import { HotelDetailManager } from "@/components/hotel/HotelsManager";
import UnAuthorized from "@/components/UnAuthorized";
import { Button } from "@/components/ui/button";

type Props = { params: { hotelId: string } };

export default async function HotelDetailPage({ params }: Props) {
  const user = await currentUser();
  if (!user || !canManageHotels(user.role)) return <UnAuthorized />;

  const hotel = await getHotelForOwner(params.hotelId);
  if (!hotel) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-display text-2xl text-plum dark:text-orchid-light">
          الفندق غير موجود
        </p>
        <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
          ربما حُذف أو ليس لديك صلاحية عرضه.
        </p>
        <Button
          asChild
          className="mt-6 rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
        >
          <Link href="/hotels">العودة للفنادق</Link>
        </Button>
      </div>
    );
  }

  return <HotelDetailManager hotel={hotel} />;
}
