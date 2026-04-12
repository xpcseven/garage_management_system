import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import {
  getPublicGarageByIdForPassenger,
  getTripsForGaragePassenger,
} from "@/lib/actions/passenger.actions";
import { canUsePassengerPortal } from "@/lib/permissions";
import Passenger_Garage_Detail_Component from "@/components/passenger/Passenger_Garage_Detail_Component";
import UnAuthorized from "@/components/UnAuthorized";

type Props = {
  params: { garageId: string };
};

export default async function PassengerGarageDetailPage({ params }: Props) {
  const user = await currentUser();
  if (!user || !canUsePassengerPortal(user.role)) {
    return <UnAuthorized />;
  }

  const garage = await getPublicGarageByIdForPassenger(params.garageId);
  if (!garage) {
    notFound();
  }

  const trips = await getTripsForGaragePassenger(params.garageId);

  return <Passenger_Garage_Detail_Component garage={garage} trips={trips} />;
}
