"use client";

import { ArrowLeft } from "lucide-react";
import { governorateDisplayName } from "@/lib/trip-route-label";

type Props = {
  fromCityName: string;
  fromRegion: string | null | undefined;
  toCityName: string;
  toRegion: string | null | undefined;
};

/** مسار من محافظة (أو مدينة) إلى أخرى مع أيقونة سهم — اتجاه RTL */
export default function TripRouteArrow({
  fromCityName,
  fromRegion,
  toCityName,
  toRegion,
}: Props) {
  const from = governorateDisplayName(fromCityName, fromRegion);
  const to = governorateDisplayName(toCityName, toRegion);

  return (
    <span
      className="inline-flex flex-row items-center gap-2 flex-wrap"
      dir="rtl"
    >
      <span className="font-medium text-foreground">{from}</span>
      <ArrowLeft
        className="h-4 w-4 shrink-0 text-purple-500"
        strokeWidth={2.5}
        aria-hidden
      />
      <span className="font-medium text-foreground">{to}</span>
    </span>
  );
}
