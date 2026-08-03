import { currentUser } from "@/lib/auth";
import { listMyPartnershipChats } from "@/lib/actions/partnership-message.actions";
import UnAuthorized from "@/components/UnAuthorized";
import { UserRole } from "@/prisma/UserRole.enum";
import PartnershipMessagesList from "@/components/partnership/PartnershipMessagesList";

export default async function PartnershipMessagesIndexPage() {
  const user = await currentUser();
  const allowed = [
    UserRole.GARAGE_OWNER,
    UserRole.HOTEL_OWNER,
    UserRole.RESTAURANT_OWNER,
    UserRole.FARM_OWNER,
    UserRole.SUPER_ADMIN,
  ];
  if (!user || !allowed.includes(user.role as UserRole)) {
    return <UnAuthorized />;
  }

  const chats = await listMyPartnershipChats();

  return <PartnershipMessagesList chats={chats} />;
}
