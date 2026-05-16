/** الشريحة الافتراضية الثابتة — تبقى دائماً في السلايدر ولا تُحذف من لوحة التحكم */
export const DEFAULT_LANDING_SLIDER = {
  src: "/System/Tourism_Images/all-hadar_02.png",
  title: "الحضر الأثرية",
} as const;

export type LandingSliderCard = {
  id?: string;
  src: string;
  title: string;
  isDefault?: boolean;
};
