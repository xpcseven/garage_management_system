import { currentUser } from "@/lib/auth";
import { canUsePassengerPortal } from "@/lib/permissions";
import { getApprovedFarmsForPassenger } from "@/lib/actions/farm.actions";
import PassengerFarmsList from "@/components/passenger/PassengerFarmsList";
import UnAuthorized from "@/components/UnAuthorized";

export default async function PassengerFarmsPage() {
  const user = await currentUser();
  if (!user || !canUsePassengerPortal(user.role)) return <UnAuthorized />;
  const farms = await getApprovedFarmsForPassenger();
  return <PassengerFarmsList farms={farms} />;
}
