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
      <div className="mx-auto max-w-lg space-y-4 p-8 text-center">
        <h1 className="text-xl font-bold text-slate-800">الفندق غير متاح</h1>
        <p className="text-sm text-muted-foreground">
          ربما تم إخفاؤه أو لم يعد معتمداً.
        </p>
        <Button asChild>
          <Link href="/passenger/hotels">العودة للفنادق</Link>
        </Button>
      </div>
    );
  }

  return <PassengerHotelDetail hotel={hotel} />;
}
