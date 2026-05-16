import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import Tourism_Places_Create from "./Tourism_Places_Create";
import Tourism_Places_Table from "./Tourism_Places_Table";

type Props = {
  places: TourismPlaceRow[];
};

export default function Tourism_Places_Component({ places }: Props) {
  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-2xl font-bold text-purple-700">الأماكن السياحية</h1>
        <p className="text-muted-foreground text-sm mt-1 text-purple-500">
          إنشاء وإدارة الأماكن السياحية (للمشرف العام وصاحب المكان السياحي).
        </p>
      </div>
      <div className="flex items-center justify-between border-b border-purple-200 pb-4">
        <div>
          <Tourism_Places_Create />

        </div>

        <div>
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/System/flags.png"
            alt="Tourism Places"
            className="h-[30px] w-[90px] object-cover"
            width={90}
            height={30}
          />
        </div>
      </div>
      <Tourism_Places_Table places={places} />
    </div>
  );
}