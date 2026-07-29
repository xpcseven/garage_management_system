import type { FarmOccasionType } from "@prisma/client";

export const FARM_OCCASION_LABELS: Record<FarmOccasionType, string> = {
  FAMILY: "عائلة",
  YOUTH: "شبابية",
  WEDDING: "عرس",
  OTHER: "مناسبة أخرى",
};
