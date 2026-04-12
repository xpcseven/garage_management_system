"use client";

import type { GarageRow } from "@/lib/actions/garage.actions";
import Garage_Update from "./Garage_Update";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = { garages: GarageRow[] };

export default function Garage_Table({ garages }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">قائمة الكراجات</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-right">
              <th className="p-2">الاسم</th>
              <th className="p-2">الهاتف</th>
              <th className="p-2">الحالة</th>
              <th className="p-2 w-32">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {garages.map((g) => (
              <tr key={g.id} className="border-b border-muted">
                <td className="p-2 font-medium">{g.name}</td>
                <td className="p-2 text-muted-foreground">{g.phone ?? "—"}</td>
                <td className="p-2">
                  {g.isActive ? (
                    <Badge>نشط</Badge>
                  ) : (
                    <Badge variant="secondary">موقوف</Badge>
                  )}
                </td>
                <td className="p-2">
                  <Garage_Update garage={g} />
                </td>
              </tr>
            ))}
            {garages.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  لا توجد كراجات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
