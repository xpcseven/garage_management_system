import { currentUser } from "@/lib/auth";
import { UserRole } from "@/prisma/UserRole.enum";
import {
  getGaragesForPartnership,
  listOutgoingPartnerships,
} from "@/lib/actions/partnership.actions";
import PartnershipsManager from "@/components/partnership/PartnershipsManager";
import UnAuthorized from "@/components/UnAuthorized";

export default async function PartnershipsPage() {
  const user = await currentUser();
  if (
    !user ||
    (user.role !== UserRole.GARAGE_OWNER &&
      user.role !== UserRole.SUPER_ADMIN)
  ) {
    return <UnAuthorized />;
  }

  const [garages, partnerships] = await Promise.all([
    getGaragesForPartnership(),
    listOutgoingPartnerships(),
  ]);

  return (
    <PartnershipsManager garages={garages} partnerships={partnerships} />
  );
}
