import { currentUser } from "@/lib/auth";
import { getActiveCitiesPublic } from "@/lib/actions/city.actions";
import {
  getGaragesPackForTripCreation,
  getManagedTrips,
  getOwnVehiclesForFreelanceTrip,
} from "@/lib/actions/trip.actions";
import {
  getManagedTourismPrograms,
  getTourismProgramCreatePack,
} from "@/lib/actions/tourism_program.actions";
import { canManageTrips } from "@/lib/permissions";
import Trip_Component from "@/components/garage/trip/Trip_Component";
import UnAuthorized from "@/components/UnAuthorized";
import { UserRole } from "@/prisma/UserRole.enum";

export default async function TripsPage() {
  const user = await currentUser();
  if (!user || !canManageTrips(user.role)) {
    return <UnAuthorized />;
  }

  const [cities, trips, tourismPrograms] = await Promise.all([
    getActiveCitiesPublic(),
    getManagedTrips(),
    getManagedTourismPrograms(),
  ]);

  if (user.role === UserRole.DRIVER) {
    const vehicles = await getOwnVehiclesForFreelanceTrip();
    return (
      <Trip_Component
        role={user.role}
        cities={cities}
        trips={trips}
        freelanceVehicles={vehicles}
        tourismPrograms={tourismPrograms}
      />
    );
  }

  const [garagePacks, tourismProgramPack] = await Promise.all([
    getGaragesPackForTripCreation(),
    getTourismProgramCreatePack(),
  ]);
  return (
    <Trip_Component
      role={user.role}
      cities={cities}
      trips={trips}
      garagePacks={garagePacks}
      tourismPrograms={tourismPrograms}
      tourismProgramPack={tourismProgramPack}
    />
  );
}
