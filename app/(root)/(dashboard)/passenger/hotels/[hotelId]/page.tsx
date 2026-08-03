import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { canUsePassengerPortal } from "@/lib/permissions";
import { getHotelDetailForPassenger } from "@/lib/actions/hotel.actions";
import PassengerHotelDetail from "@/components/passenger/PassengerHotelDetail";
import UnAuthorized from "@/components/UnAuthorized";
import { Button } from "@/components/ui/button";

type Props = { params: { hotelId: string } };

export default async function PassengerHotelDetailPage({ params }: Props) {
  const user = await currentUser();
  if (!user || !canUsePassengerPortal(user.role)) return <UnAuthorized />;

  const hotel = await getHotelDetailForPassenger(params.hotelId);
  if (!hotel) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-display text-2xl text-plum">الفندق غير متاح</p>
        <p className="mt-2 text-sm text-dusk/60">
          ربما تم إخفاؤه أو لم يعد معتمداً.
        </p>
        <Button
          asChild
          className="mt-6 rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
        >
          <Link href="/passenger/hotels">العودة للفنادق</Link>
        </Button>
      </div>
    );
  }

  return <PassengerHotelDetail hotel={hotel} />;
}
