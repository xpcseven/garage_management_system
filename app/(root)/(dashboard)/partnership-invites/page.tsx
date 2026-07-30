import { currentUser } from "@/lib/auth";
import { UserRole } from "@/prisma/UserRole.enum";
import { listIncomingInvites } from "@/lib/actions/partnership.actions";
import PartnershipInvitesManager from "@/components/partnership/PartnershipInvitesManager";
import UnAuthorized from "@/components/UnAuthorized";

export default async function PartnershipInvitesPage() {
  const user = await currentUser();
  if (
    !user ||
    ![
      UserRole.HOTEL_OWNER,
      UserRole.RESTAURANT_OWNER,
      UserRole.FARM_OWNER,
      UserRole.SUPER_ADMIN,
    ].includes(user.role as UserRole)
  ) {
    return <UnAuthorized />;
  }

  const invites = await listIncomingInvites();
  return <PartnershipInvitesManager invites={invites} />;
}
