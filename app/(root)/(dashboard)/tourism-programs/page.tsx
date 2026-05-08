import { currentUser } from "@/lib/auth";
import { canManageTrips } from "@/lib/permissions";
import {
  getManagedTourismPrograms,
  getTourismProgramCreatePack,
} from "@/lib/actions/tourism_program.actions";
import Tourism_Program_Create from "@/components/garage/trip/Tourism_Program_Create";
import Tourism_Program_Table from "@/components/garage/trip/Tourism_Program_Table";
import UnAuthorized from "@/components/UnAuthorized";

export default async function TourismProgramsPage() {
  const user = await currentUser();
  if (!user || !canManageTrips(user.role)) {
    return <UnAuthorized />;
  }

  const [rows, pack] = await Promise.all([
    getManagedTourismPrograms(),
    getTourismProgramCreatePack(),
  ]);

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-700">البرامج السياحية</h1>
        {pack.garages.length > 0 && <Tourism_Program_Create pack={pack} />}
      </div>
      <Tourism_Program_Table rows={rows} editPack={pack} />
    </div>
  );
}

