"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CityRow } from "@/lib/actions/city.actions";
import { deleteCity } from "@/lib/actions/city.actions";
import City_Update from "./City_Update";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = { cities: CityRow[] };

export default function City_Table({ cities }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">قائمة المدن</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-right">
              <th className="p-2">الاسم</th>
              <th className="p-2">المنطقة</th>
              <th className="p-2">الحالة</th>
              <th className="p-2 w-40">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => (
              <tr key={c.id} className="border-b border-muted">
                <td className="p-2 font-medium">{c.name}</td>
                <td className="p-2 text-muted-foreground">{c.region ?? "—"}</td>
                <td className="p-2">
                  {c.isActive ? (
                    <Badge>نشطة</Badge>
                  ) : (
                    <Badge variant="secondary">موقوفة</Badge>
                  )}
                </td>
                <td className="p-2 flex flex-wrap gap-2 justify-end">
                  <City_Update city={c} />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm("حذف هذه المدينة؟")) return;
                      start(async () => {
                        const res = await deleteCity(c.id);
                        if (res.success) router.refresh();
                        else alert(res.error);
                      });
                    }}
                  >
                    حذف
                  </Button>
                </td>
              </tr>
            ))}
            {cities.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  لا توجد مدن
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
