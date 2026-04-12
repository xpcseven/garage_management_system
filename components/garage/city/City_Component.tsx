import type { CityRow } from "@/lib/actions/city.actions";
import City_Create from "./City_Create";
import City_Table from "./City_Table";

type Props = {
  cities: CityRow[];
};

/** تجميع محتوى صفحة المدن: إنشاء + جدول (البيانات تُمرَّر من الصفحة) */
export default function City_Component({ cities }: Props) {
  return (
    <div className="space-y-8 p-4 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-sky-700">المدن</h1>
        <p className="text-muted-foreground text-sm mt-1">
          إدارة المدن المتاحة للرحلات (صلاحية المشرف العام فقط).
        </p>
      </div>
      <City_Create />
      <City_Table cities={cities} />
    </div>
  );
}
