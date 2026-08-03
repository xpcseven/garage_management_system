import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { canManageFarms } from "@/lib/permissions";
import { getFarmForOwner } from "@/lib/actions/farm.actions";
import { FarmDetailManager } from "@/components/farm/FarmsManager";
import UnAuthorized from "@/components/UnAuthorized";
import { Button } from "@/components/ui/button";

type Props = { params: { farmId: string } };

export default async function FarmDetailPage({ params }: Props) {
  const user = await currentUser();
  if (!user || !canManageFarms(user.role)) return <UnAuthorized />;

  const farm = await getFarmForOwner(params.farmId);
  if (!farm) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-display text-2xl text-plum dark:text-orchid-light">
          المزرعة غير موجودة
        </p>
        <p className="mt-2 text-sm text-dusk/60 dark:text-muted-foreground">
          ربما حُذفت أو ليس لديك صلاحية عرضها.
        </p>
        <Button
          asChild
          className="mt-6 rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
        >
          <Link href="/farms">العودة للمزارع</Link>
        </Button>
      </div>
    );
  }

  return <FarmDetailManager farm={farm} />;
}
