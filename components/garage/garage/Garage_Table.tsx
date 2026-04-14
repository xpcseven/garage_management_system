"use client";

import { useEffect, useMemo, useState } from "react";
import type { GarageRow } from "@/lib/actions/garage.actions";
import Garage_Update from "./Garage_Update";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TablePagination from "@/components/Shared/TablePagination";

type Props = { garages: GarageRow[] };

export default function Garage_Table({ garages }: Props) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(garages.length / PAGE_SIZE));
  const pagedGarages = useMemo(
    () => garages.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [garages, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">قائمة الكراجات</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm responsive-table">
          <thead>
            <tr className="border-b text-right">
              <th className="p-2">الاسم</th>
              <th className="p-2">الهاتف</th>
              <th className="p-2">الحالة</th>
              <th className="p-2 w-32">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {pagedGarages.map((g) => (
              <tr key={g.id} className="border-b border-muted">
                <td className="p-2 font-medium" data-label="الاسم">{g.name}</td>
                <td className="p-2 text-muted-foreground" data-label="الهاتف">{g.phone ?? "—"}</td>
                <td className="p-2" data-label="الحالة">
                  {g.isActive ? (
                    <Badge>نشط</Badge>
                  ) : (
                    <Badge variant="secondary">موقوف</Badge>
                  )}
                </td>
                <td className="p-2" data-label="إجراءات">
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
      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </Card>
  );
}
