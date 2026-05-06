"use client";

import { useEffect, useMemo, useState } from "react";
import type { VehicleRow } from "@/lib/actions/vehicle.actions";
import Vehicle_Update from "./Vehicle_Update";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TablePagination from "@/components/Shared/TablePagination";
import { FaCertificate } from "react-icons/fa";

type Props = { vehicles: VehicleRow[] };

export default function Vehicle_Table({ vehicles }: Props) {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(vehicles.length / PAGE_SIZE));
  const pagedVehicles = useMemo(
    () => vehicles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [vehicles, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">قائمة المركبات</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm responsive-table">
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
            {pagedVehicles.map((v) => (
              <tr key={v.id} className="border-b border-muted">
                <td className="p-2 font-mono" data-label="اللوحة">{v.plateNumber}</td>
                <td className="p-2" data-label="المركبة">
                  {v.brand} {v.model} ({v.year})
                </td>
                <td className="p-2 text-muted-foreground" data-label="السائق">
                  {v.driverName ?? "—"}
                </td>
                <td className="p-2 text-muted-foreground" data-label="الكراج">{v.garageName ?? "—"}</td>
                <td className="p-2" data-label="النوع">{v.transportType === "INTERNAL" ? "داخلي" : "خارجي"}</td>
                <td className="p-2" data-label="الحالة">
                  {v.isActive ? <h1 className="text-green-500 font-bold">
                    <FaCertificate />
                  </h1> : <h1 className="text-red-500 font-bold  ">
                    <FaCertificate />
                  </h1>}
                </td>
                <td className="p-2" data-label="إجراءات">
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
      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </Card>
  );
}
