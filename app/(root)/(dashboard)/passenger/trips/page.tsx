import { currentUser } from "@/lib/auth";
import { canUsePassengerPortal } from "@/lib/permissions";
import { getActiveCitiesPublic } from "@/lib/actions/city.actions";
import {
  searchTripsForPassenger,
  type PassengerTripScope,
} from "@/lib/actions/passenger.actions";
import Passenger_Trips_Component from "@/components/passenger/Passenger_Trips_Component";

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
  const isLoggedIn = Boolean(user && canUsePassengerPortal(user.role));

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
      isLoggedIn={isLoggedIn}
      initialParams={{
        from: searchParams.from ?? "",
        to: searchParams.to ?? "",
        q: searchParams.q ?? "",
        scope,
      }}
    />
  );
}
