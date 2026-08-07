"use client";

import type { VehicleRow } from "@/lib/actions/vehicle.actions";
import type { GarageDriverOption } from "@/lib/actions/vehicle.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Vehicle_Create from "./Vehicle_Create";
import Vehicle_Table from "./Vehicle_Table";

type Opt = { id: string; name: string };

type Props = {
  vehicles: VehicleRow[];
  garageOptions: Opt[];
  driversByGarage: Record<string, GarageDriverOption[]>;
  userRole: string;
};

export default function Vehicle_Component({
  vehicles,
  garageOptions,
  driversByGarage,
  userRole,
}: Props) {
  const active = vehicles.filter((v) => v.isActive).length;
  const internal = vehicles.filter((v) => v.transportType === "INTERNAL").length;

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
              أسطول النقل
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              المركبات
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
              إدارة المركبات المرتبطة بحسابك أو بشركتك السياحية — اللوحات،
              المقاعد، والسائقين.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Vehicle_Create
              garageOptions={garageOptions}
              driversByGarage={driversByGarage}
              userRole={userRole}
            />
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-orchid/30 dark:text-foreground dark:hover:bg-orchid/15 dark:hover:text-foreground"
            >
              <Link href="/garages">إدارة سائقي الشركات</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white dark:border-orchid/30 dark:text-foreground dark:hover:bg-orchid/15 dark:hover:text-foreground"
            >
              <Link href="/home">الرئيسية</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="الكل" value={vehicles.length} />
          <Metric label="نشطة" value={active} />
          <Metric label="داخلية" value={internal} />
          <Metric label="خارجية" value={vehicles.length - internal} />
        </div>
      </header>

      <Vehicle_Table vehicles={vehicles} driversByGarage={driversByGarage} />
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
