import { notFound } from "next/navigation";
import { getPublicTourismPlaceByIdForPassenger } from "@/lib/actions/tourism_places.actions";
import Passenger_Tourism_Place_Detail_Component from "@/components/passenger/Passenger_Tourism_Place_Detail_Component";

type Props = {
  params: { placeId: string };
};

export default async function PassengerTourismPlaceDetailPage({ params }: Props) {
  const place = await getPublicTourismPlaceByIdForPassenger(params.placeId);
  if (!place) notFound();

  return <Passenger_Tourism_Place_Detail_Component place={place} />;
}
