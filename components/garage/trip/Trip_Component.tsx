import type { CityRow } from "@/lib/actions/city.actions";
import type { GarageTripPack, TripManageRow } from "@/lib/actions/trip.actions";
import type {
  TourismProgramCreatePack,
  TourismProgramManageRow,
} from "@/lib/actions/tourism_program.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Trip_Garage_Create from "./Trip_Garage_Create";
import Trip_Freelance_Create from "./Trip_Freelance_Create";
import Trip_Table from "./Trip_Table";
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
}: Props) {
  const showGarageForm =
    role === UserRole.GARAGE_OWNER || role === UserRole.SUPER_ADMIN;
  const showFreelance = role === UserRole.DRIVER;
  const isGarageOwner = role === UserRole.GARAGE_OWNER;
  const scheduled = trips.filter((t) => t.status === "SCHEDULED").length;
  const inProgress = trips.filter((t) => t.status === "IN_PROGRESS").length;

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-6 py-8 text-white sm:px-8 sm:py-10 dark:bg-card dark:ring-1 dark:ring-orchid/25">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-48 w-48 rounded-full bg-orchid/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 bottom-0 h-40 w-40 rounded-full bg-fuchsia-brand/20 blur-3xl dark:bg-orchid/15"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              النقل
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              الرحلات
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
              {isGarageOwner ? (
                <>
                  أنشئ رحلات شركتك وحدّد الوجهة من وإلى، ثم تابع حالة الرحلة
                  والمقاعد من هنا.
                </>
              ) : showFreelance ? (
                <>
                  أنشئ رحلة مستقلة بمركبتك، ثم حدّث الحالة عند الانطلاق والوصول.
                </>
              ) : (
                <>
                  أنشئ ومتابعة الرحلات بين المدن — شركات سياحية أو رحلات مستقلة.
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showGarageForm && (
              <Trip_Garage_Create cities={cities} garagePacks={garagePacks} />
            )}
            {showFreelance && (
              <Trip_Freelance_Create
                cities={cities}
                vehicles={freelanceVehicles}
              />
            )}
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white dark:border-orchid/30 dark:text-foreground dark:hover:bg-orchid/15 dark:hover:text-foreground"
            >
              <Link href="/home">الرئيسية</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-3 gap-3">
          <Metric label="الكل" value={trips.length} />
          <Metric label="مجدولة" value={scheduled} />
          <Metric label="جارية" value={inProgress} />
        </div>
      </header>

      <Trip_Table trips={trips} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm ring-1 ring-white/15">
      <p className="font-data text-xl font-semibold tabular-nums text-white sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-white/55 sm:text-xs">{label}</p>
    </div>
  );
}
