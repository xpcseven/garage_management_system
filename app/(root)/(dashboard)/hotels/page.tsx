import { currentUser } from "@/lib/auth";
import { canManageHotels } from "@/lib/permissions";
import { getHotelsForOwner } from "@/lib/actions/hotel.actions";
import HotelsManager from "@/components/hotel/HotelsManager";
import UnAuthorized from "@/components/UnAuthorized";

export default async function HotelsPage() {
  const user = await currentUser();
  if (!user || !canManageHotels(user.role)) return <UnAuthorized />;
  const hotels = await getHotelsForOwner();
  return <HotelsManager hotels={hotels} />;
}
