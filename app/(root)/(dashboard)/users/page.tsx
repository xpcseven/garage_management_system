import { currentUser } from "@/lib/auth";
import UnAuthorized from "@/components/UnAuthorized";
import { canManageUsers } from "@/lib/permissions";
import { getUsersForAdmin } from "@/lib/actions/users.actions";
import Users_Component from "@/components/Users/Users_Component";

export default async function UsersPage() {
  const user = await currentUser();
  if (!user || !canManageUsers(user.role)) {
    return <UnAuthorized />;
  }

  const users = await getUsersForAdmin();
  return <Users_Component users={users} />;
}
