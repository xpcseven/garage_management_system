import type { GarageRow } from "@/lib/actions/garage.actions";
import Garage_Create from "./Garage_Create";
import Garage_Table from "./Garage_Table";
import { canCreateGarage } from "@/lib/permissions";

type Props = {
  garages: GarageRow[];
  role: string;
};

export default function Garage_Component({ garages, role }: Props) {
  return (
    <div className="space-y-8 p-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-purple-500">الشركات السياحية</h1>
        <p className="text-muted-foreground text-sm mt-1">
          عرض الشركات السياحية المرتبطة بحسابك؛ الإنشاء متاح لمالك الشركة السياحية أو المشرف العام.
        </p>
      </div>
      {canCreateGarage(role) && <Garage_Create role={role} />}
      <Garage_Table garages={garages} />
    </div>
  );
}
