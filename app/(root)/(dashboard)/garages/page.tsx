import { currentUser } from "@/lib/auth";
import { getGaragesForUser } from "@/lib/actions/garage.actions";
import { canManageGarages } from "@/lib/permissions";
import Garage_Component from "@/components/garage/garage/Garage_Component";
import UnAuthorized from "@/components/UnAuthorized";

export default async function GaragesPage() {
  const user = await currentUser();
  if (!user || !canManageGarages(user.role)) {
    return <UnAuthorized />;
  }
  const garages = await getGaragesForUser();
  return <Garage_Component garages={garages} role={user.role} />;
}
