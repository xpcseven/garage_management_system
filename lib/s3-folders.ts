/** مجلدات منظمة داخل الـ bucket: tourism/{folder}/... */
export const S3_FOLDERS = {
  uploads: "uploads",
  homeSlider: "home-slider",
  tourismPlaces: "tourism-places",
  hotels: "hotels",
  restaurants: "restaurants",
  menu: "menu",
  farms: "farms",
  documents: "documents",
} as const;

export type S3Folder = (typeof S3_FOLDERS)[keyof typeof S3_FOLDERS];
