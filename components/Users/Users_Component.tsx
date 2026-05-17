import type { UserAdminRow } from "@/lib/actions/users.actions";
import Users_Table from "./Users_Table";

type Props = {
  users: UserAdminRow[];
};

export default function Users_Component({ users }: Props) {
  return (
    <div className="space-y-8 p-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-purple-700">المستخدمون والصلاحيات</h1>
        <p className="text-muted-foreground text-sm mt-1">
          قائمة بجميع المستخدمين المسجّلين وصلاحياتهم (للمشرف العام فقط).
        </p>
      </div>
      <Users_Table users={users} />
    </div>
  );
}
