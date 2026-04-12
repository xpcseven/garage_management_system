import type { VehicleRow } from "@/lib/actions/vehicle.actions";
import Vehicle_Create from "./Vehicle_Create";
import Vehicle_Table from "./Vehicle_Table";

type Opt = { id: string; name: string };

type Props = {
  vehicles: VehicleRow[];
  garageOptions: Opt[];
  userRole: string;
};

export default function Vehicle_Component({
  vehicles,
  garageOptions,
  userRole,
}: Props) {
  return (
    <div className="space-y-8 p-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-sky-700">المركبات</h1>
        <p className="text-muted-foreground text-sm mt-1">
          إدارة المركبات المرتبطة بحسابك أو بكراجك.
        </p>
      </div>
      <Vehicle_Create garageOptions={garageOptions} userRole={userRole} />
      <Vehicle_Table vehicles={vehicles} />
    </div>
  );
}
