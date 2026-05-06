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
        <h1 className="text-2xl font-bold text-purple-500">الكراجات</h1>
        <p className="text-muted-foreground text-sm mt-1">
          عرض الكراجات المرتبطة بحسابك؛ الإنشاء متاح لمالك الكراج أو المشرف العام.
        </p>
      </div>
      {canCreateGarage(role) && <Garage_Create role={role} />}
      <Garage_Table garages={garages} />
    </div>
  );
}
