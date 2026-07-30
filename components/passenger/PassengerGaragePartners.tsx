"use client";

import Link from "next/link";
import type { PartnershipRow } from "@/lib/actions/partnership.actions";
import { partnerLabel } from "@/lib/partnership-labels";
import { Button } from "@/components/ui/button";
import TicketStub, {
  type TicketAccent,
} from "@/components/Shared/TicketStub";

type Props = {
  partners: PartnershipRow[];
};

function partnerHref(p: PartnershipRow) {
  if (p.partnerType === "HOTEL") return `/passenger/hotels/${p.partnerId}`;
  if (p.partnerType === "RESTAURANT")
    return `/passenger/restaurants/${p.partnerId}`;
  return `/passenger/farms/${p.partnerId}`;
}

function accentFor(type: string): TicketAccent {
  if (type === "HOTEL") return "rafidain";
  if (type === "RESTAURANT") return "clay";
  return "palm";
}

export default function PassengerGaragePartners({ partners }: Props) {
  if (partners.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-plum">
          شركاء هذه الشركة
        </h2>
        <p className="mt-1 text-sm text-dusk/60">
          فنادق ومطاعم ومزارع معتمدة — اعرض التفاصيل واحجز مباشرة.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {partners.map((p) => (
          <TicketStub
            key={p.id}
            accent={accentFor(p.partnerType)}
            media={
              p.partnerImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.partnerImageUrl}
                  alt={p.partnerName}
                  className="h-full min-h-[7rem] w-full object-cover"
                />
              ) : (
                <span className="text-4xl" aria-hidden>
                  {p.partnerType === "HOTEL"
                    ? "🏨"
                    : p.partnerType === "RESTAURANT"
                      ? "🍽️"
                      : "🌿"}
                </span>
              )
            }
            footer={
              <Button asChild size="sm" className="mt-1 w-full">
                <Link href={partnerHref(p)}>اعرض التفاصيل</Link>
              </Button>
            }
          >
            <span className="font-data text-xs text-orchid">
              {partnerLabel(p.partnerType)}
            </span>
            <h3 className="font-body font-bold text-dusk dark:text-mist">
              {p.partnerName}
            </h3>
            {p.partnerAddress && (
              <p className="line-clamp-2 text-sm text-dusk/60 dark:text-mist/60">
                {p.partnerAddress}
              </p>
            )}
          </TicketStub>
        ))}
      </div>
    </section>
  );
}
