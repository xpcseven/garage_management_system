import { currentUser } from "@/lib/auth";
import { canManageFarms } from "@/lib/permissions";
import { getFarmsForOwner } from "@/lib/actions/farm.actions";
import { FarmsManager } from "@/components/farm/FarmsManager";
import UnAuthorized from "@/components/UnAuthorized";

export default async function FarmsPage() {
  const user = await currentUser();
  if (!user || !canManageFarms(user.role)) return <UnAuthorized />;
  const farms = await getFarmsForOwner();
  return <FarmsManager farms={farms} />;
}
