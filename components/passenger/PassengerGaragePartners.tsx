"use client";

import Link from "next/link";
import type { PartnershipRow } from "@/lib/actions/partnership.actions";
import { partnerLabel } from "@/lib/partnership-labels";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  partners: PartnershipRow[];
};

function partnerHref(p: PartnershipRow) {
  if (p.partnerType === "HOTEL") return `/passenger/hotels/${p.partnerId}`;
  if (p.partnerType === "RESTAURANT")
    return `/passenger/restaurants/${p.partnerId}`;
  return `/passenger/farms/${p.partnerId}`;
}

export default function PassengerGaragePartners({ partners }: Props) {
  if (partners.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="text-start">
        <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
          الشبكة
        </p>
        <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
          شركاء هذه الشركة
        </h2>
        <p className="mt-1 text-sm text-dusk/60 dark:text-muted-foreground">
          فنادق ومطاعم ومزارع معتمدة — اعرض التفاصيل واحجز مباشرة.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((p) => (
          <article
            key={p.id}
            className={cn(
              "flex h-full flex-col rounded-3xl bg-white p-5 text-start ring-1 ring-plum/10",
              "transition hover:-translate-y-0.5 hover:shadow-orchid",
              "dark:bg-card dark:ring-orchid/20 dark:hover:ring-orchid/40",
              "motion-reduce:hover:translate-y-0"
            )}
          >
            <p className="font-data text-[10px] tracking-[0.16em] text-orchid dark:text-orchid-light">
              {partnerLabel(p.partnerType)}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-dusk dark:text-foreground">
              {p.partnerName}
            </h3>
            {p.partnerAddress?.trim() && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-dusk/60 dark:text-muted-foreground">
                {p.partnerAddress}
              </p>
            )}
            <div className="mt-auto pt-4">
              <Button
                asChild
                size="sm"
                className="w-full rounded-xl border-0 bg-plum text-white hover:bg-plum-light hover:text-white dark:bg-orchid dark:hover:bg-orchid-light"
              >
                <Link href={partnerHref(p)}>اعرض التفاصيل</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
