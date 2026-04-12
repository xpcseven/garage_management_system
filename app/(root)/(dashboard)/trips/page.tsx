import { currentUser } from "@/lib/auth";
import { getActiveCitiesPublic } from "@/lib/actions/city.actions";
import {
  getGaragesPackForTripCreation,
  getManagedTrips,
  getOwnVehiclesForFreelanceTrip,
} from "@/lib/actions/trip.actions";
import { canManageTrips } from "@/lib/permissions";
import Trip_Component from "@/components/garage/trip/Trip_Component";
import UnAuthorized from "@/components/UnAuthorized";
import { UserRole } from "@/prisma/UserRole.enum";

export default async function TripsPage() {
  const user = await currentUser();
  if (!user || !canManageTrips(user.role)) {
    return <UnAuthorized />;
  }

  const [cities, trips] = await Promise.all([
    getActiveCitiesPublic(),
    getManagedTrips(),
  ]);

  if (user.role === UserRole.DRIVER) {
    const vehicles = await getOwnVehiclesForFreelanceTrip();
    return (
      <Trip_Component
        role={user.role}
        cities={cities}
        trips={trips}
        freelanceVehicles={vehicles}
      />
    );
  }

  const garagePacks = await getGaragesPackForTripCreation();
  return (
    <Trip_Component
      role={user.role}
      cities={cities}
      trips={trips}
      garagePacks={garagePacks}
    />
  );
}
