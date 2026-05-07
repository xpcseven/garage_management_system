import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { canUsePassengerPortal } from "@/lib/permissions";
import { getPublicTourismPlaceByIdForPassenger } from "@/lib/actions/tourism_places.actions";
import UnAuthorized from "@/components/UnAuthorized";
import Passenger_Tourism_Place_Detail_Component from "@/components/passenger/Passenger_Tourism_Place_Detail_Component";

type Props = {
  params: { placeId: string };
};

export default async function PassengerTourismPlaceDetailPage({ params }: Props) {
  const user = await currentUser();
  if (!user || !canUsePassengerPortal(user.role)) {
    return <UnAuthorized />;
  }

  const place = await getPublicTourismPlaceByIdForPassenger(params.placeId);
  if (!place) notFound();

  return <Passenger_Tourism_Place_Detail_Component place={place} />;
}

