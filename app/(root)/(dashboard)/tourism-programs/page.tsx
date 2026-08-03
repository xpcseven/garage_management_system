import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { canManageTrips } from "@/lib/permissions";
import {
  getManagedTourismPrograms,
  getTourismProgramCreatePack,
} from "@/lib/actions/tourism_program.actions";
import Tourism_Program_Create from "@/components/garage/trip/Tourism_Program_Create";
import Tourism_Program_Table from "@/components/garage/trip/Tourism_Program_Table";
import UnAuthorized from "@/components/UnAuthorized";
import { Button } from "@/components/ui/button";

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
              البرامج السياحية
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base dark:text-muted-foreground">
              أنشئ وادر برامج متعددة الأماكن مع المركبة والسائق والشركاء من مكان
              واحد.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {pack.garages.length > 0 && <Tourism_Program_Create pack={pack} />}
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white dark:border-orchid/30 dark:text-foreground dark:hover:bg-orchid/15 dark:hover:text-foreground"
            >
              <Link href="/home">الرئيسية</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm ring-1 ring-white/15">
            <p className="font-data text-xl font-semibold tabular-nums text-white sm:text-2xl">
              {rows.length}
            </p>
            <p className="mt-1 text-[11px] text-white/55 sm:text-xs">الكل</p>
          </div>
        </div>
      </header>

      <Tourism_Program_Table rows={rows} editPack={pack} />
    </div>
  );
}
