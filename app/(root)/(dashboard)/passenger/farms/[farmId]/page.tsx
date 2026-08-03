import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { canUsePassengerPortal } from "@/lib/permissions";
import { getFarmDetailForPassenger } from "@/lib/actions/farm.actions";
import PassengerFarmDetail from "@/components/passenger/PassengerFarmDetail";
import UnAuthorized from "@/components/UnAuthorized";
import { Button } from "@/components/ui/button";

type Props = { params: { farmId: string } };

export default async function PassengerFarmDetailPage({ params }: Props) {
  const user = await currentUser();
  if (!user || !canUsePassengerPortal(user.role)) return <UnAuthorized />;

  const farm = await getFarmDetailForPassenger(params.farmId);
  if (!farm) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-display text-2xl text-plum">المزرعة غير متاحة</p>
        <p className="mt-2 text-sm text-dusk/60">
          ربما تم إخفاؤها أو لم تعد معتمدة.
        </p>
        <Button
          asChild
          className="mt-6 rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
        >
          <Link href="/passenger/farms">العودة للمزارع</Link>
        </Button>
      </div>
    );
  }

  return (
    <PassengerFarmDetail
      farm={{
        id: farm.id,
        name: farm.name,
        address: farm.address,
        location: farm.location,
        phone: farm.phone,
        description: farm.description,
        capacity: farm.capacity,
        amenities: farm.amenities,
        city: farm.city,
        images: farm.images,
      }}
    />
  );
}
