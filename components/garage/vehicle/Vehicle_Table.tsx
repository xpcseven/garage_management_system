"use client";

import type { VehicleRow } from "@/lib/actions/vehicle.actions";
import Vehicle_Update from "./Vehicle_Update";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = { vehicles: VehicleRow[] };

export default function Vehicle_Table({ vehicles }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">قائمة المركبات</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-right">
              <th className="p-2">اللوحة</th>
              <th className="p-2">المركبة</th>
              <th className="p-2">السائق</th>
              <th className="p-2">الكراج</th>
              <th className="p-2">النوع</th>
              <th className="p-2">الحالة</th>
              <th className="p-2 w-28">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b border-muted">
                <td className="p-2 font-mono">{v.plateNumber}</td>
                <td className="p-2">
                  {v.brand} {v.model} ({v.year})
                </td>
                <td className="p-2 text-muted-foreground">
                  {v.driverName ?? "—"}
                </td>
                <td className="p-2 text-muted-foreground">{v.garageName ?? "—"}</td>
                <td className="p-2">{v.transportType === "INTERNAL" ? "داخلي" : "خارجي"}</td>
                <td className="p-2">
                  {v.isActive ? <Badge>نشطة</Badge> : <Badge variant="secondary">موقوفة</Badge>}
                </td>
                <td className="p-2">
                  <Vehicle_Update vehicle={v} />
                </td>
              </tr>
            ))}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  لا توجد مركبات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
