import { currentUser } from "@/lib/auth";
import {
  getGarageOptionsForVehicle,
  getVehiclesForUser,
} from "@/lib/actions/vehicle.actions";
import { canManageVehicles } from "@/lib/permissions";
import Vehicle_Component from "@/components/garage/vehicle/Vehicle_Component";
import UnAuthorized from "@/components/UnAuthorized";

export default async function VehiclesPage() {
  const user = await currentUser();
  if (!user || !canManageVehicles(user.role)) {
    return <UnAuthorized />;
  }
  const [vehicles, garageOptions] = await Promise.all([
    getVehiclesForUser(),
    getGarageOptionsForVehicle(),
  ]);
  return (
    <Vehicle_Component
      vehicles={vehicles}
      garageOptions={garageOptions}
      userRole={user.role}
    />
  );
}
