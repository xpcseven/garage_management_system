import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import {
  getPublicGarageByIdForPassenger,
  getTripsForGaragePassenger,
} from "@/lib/actions/passenger.actions";
import { listAcceptedPartnersForGarage } from "@/lib/actions/partnership.actions";
import { canUsePassengerPortal } from "@/lib/permissions";
import Passenger_Garage_Detail_Component from "@/components/passenger/Passenger_Garage_Detail_Component";

type Props = {
  params: { garageId: string };
};

export default async function PassengerGarageDetailPage({ params }: Props) {
  const user = await currentUser();
  const isLoggedIn = Boolean(user && canUsePassengerPortal(user.role));

  const garage = await getPublicGarageByIdForPassenger(params.garageId);
  if (!garage) {
    notFound();
  }

  const [trips, partners] = await Promise.all([
    getTripsForGaragePassenger(params.garageId),
    listAcceptedPartnersForGarage(params.garageId),
  ]);

  return (
    <Passenger_Garage_Detail_Component
      garage={garage}
      trips={trips}
      partners={partners}
      isLoggedIn={isLoggedIn}
    />
  );
}
