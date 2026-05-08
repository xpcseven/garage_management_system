import type { CityRow } from "@/lib/actions/city.actions";
import type { GarageTripPack, TripManageRow } from "@/lib/actions/trip.actions";
import type {
  TourismProgramCreatePack,
  TourismProgramManageRow,
} from "@/lib/actions/tourism_program.actions";
import Trip_Garage_Create from "./Trip_Garage_Create";
import Trip_Freelance_Create from "./Trip_Freelance_Create";
import Trip_Table from "./Trip_Table";
import Tourism_Program_Create from "./Tourism_Program_Create";
import Tourism_Program_Table from "./Tourism_Program_Table";
import { UserRole } from "@/prisma/UserRole.enum";

type Props = {
  role: string;
  cities: CityRow[];
  trips: TripManageRow[];
  garagePacks?: GarageTripPack[];
  freelanceVehicles?: GarageTripPack["vehicles"];
  tourismPrograms?: TourismProgramManageRow[];
  tourismProgramPack?: TourismProgramCreatePack;
};

export default function Trip_Component({
  role,
  cities,
  trips,
  garagePacks = [],
  freelanceVehicles = [],
  tourismPrograms = [],
  tourismProgramPack,
}: Props) {
  const showGarageForm =
    role === UserRole.GARAGE_OWNER || role === UserRole.SUPER_ADMIN;
  const showFreelance = role === UserRole.DRIVER;
  const isGarageOwner = role === UserRole.GARAGE_OWNER;

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-2xl font-bold text-purple-500">الرحلات</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isGarageOwner ? (
            <>
              <span className="font-medium text-foreground">
                على صاحب الشركة السياحية إنشاء الرحلات
              </span>{" "}
              وتحديد{" "}
              <span className="font-medium text-foreground">
                وجهة السفر: من أين وإلى أين
              </span>{" "}
              (مدينة أو منطقة حسب ما هو مسجّل في «المدن»). كل رحلة مرتبطة
              بشركتك السياحية ومركبة وسائق.
            </>
          ) : (
            <>
              أنشئ رحلة بين مدينتين (أو بلدين عبر أسماء المدن في النظام). رحلات
              الشركة السياحية مرتبطة بشركتك السياحية؛ الرحلة المستقلة بدون شركة سياحية.
            </>
          )}
        </p>
      </div>
      {showGarageForm && (
        <Trip_Garage_Create cities={cities} garagePacks={garagePacks} />
      )}
      {showFreelance && (
        <Trip_Freelance_Create cities={cities} vehicles={freelanceVehicles} />
      )}
      <Trip_Table trips={trips} />


    </div>
  );
}
