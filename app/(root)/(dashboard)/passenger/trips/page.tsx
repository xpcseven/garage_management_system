import { currentUser } from "@/lib/auth";
import { getActiveCitiesPublic } from "@/lib/actions/city.actions";
import {
  searchTripsForPassenger,
  type PassengerTripScope,
} from "@/lib/actions/passenger.actions";
import { canUsePassengerPortal } from "@/lib/permissions";
import Passenger_Trips_Component from "@/components/passenger/Passenger_Trips_Component";
import UnAuthorized from "@/components/UnAuthorized";

type SearchParams = {
  from?: string;
  to?: string;
  q?: string;
  scope?: string;
};

export default async function PassengerTripsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await currentUser();
  if (!user || !canUsePassengerPortal(user.role)) {
    return <UnAuthorized />;
  }

  const scopeRaw = searchParams.scope ?? "all";
  const scope: PassengerTripScope =
    scopeRaw === "garage" || scopeRaw === "freelance" || scopeRaw === "all"
      ? scopeRaw
      : "all";

  const [cities, trips] = await Promise.all([
    getActiveCitiesPublic(),
    searchTripsForPassenger({
      fromCityId: searchParams.from,
      toCityId: searchParams.to,
      q: searchParams.q,
      scope,
    }),
  ]);

  return (
    <Passenger_Trips_Component
      cities={cities}
      trips={trips}
      initialParams={{
        from: searchParams.from ?? "",
        to: searchParams.to ?? "",
        q: searchParams.q ?? "",
        scope,
      }}
    />
  );
}
