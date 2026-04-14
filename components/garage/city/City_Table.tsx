"use client";

import { useTransition } from "react";
import { useEffect, useMemo, useState } from "react";
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
import Swal from "sweetalert2";
import TablePagination from "@/components/Shared/TablePagination";

type Props = { cities: CityRow[] };

export default function City_Table({ cities }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(cities.length / PAGE_SIZE));
  const pagedCities = useMemo(
    () => cities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [cities, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">قائمة المدن</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm responsive-table">
          <thead>
            <tr className="border-b text-right">
              <th className="p-2">الاسم</th>
              <th className="p-2">المنطقة</th>
              <th className="p-2">الحالة</th>
              <th className="p-2 w-40">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {pagedCities.map((c) => (
              <tr key={c.id} className="border-b border-muted">
                <td className="p-2 font-medium" data-label="الاسم">{c.name}</td>
                <td className="p-2 text-muted-foreground" data-label="المنطقة">{c.region ?? "—"}</td>
                <td className="p-2" data-label="الحالة">
                  {c.isActive ? (
                    <Badge>نشطة</Badge>
                  ) : (
                    <Badge variant="secondary">موقوفة</Badge>
                  )}
                </td>
                <td className="p-2 flex flex-wrap gap-2 justify-end" data-label="إجراءات">
                  <City_Update city={c} />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={pending}
                    onClick={async () => {
                      const confirmed = await Swal.fire({
                        icon: "warning",
                        title: "تأكيد الحذف",
                        text: "هل تريد حذف هذه المدينة؟",
                        showCancelButton: true,
                        confirmButtonText: "نعم، حذف",
                        cancelButtonText: "إلغاء",
                      });
                      if (!confirmed.isConfirmed) return;
                      start(async () => {
                        const res = await deleteCity(c.id);
                        if (res.success) {
                          router.refresh();
                          await Swal.fire({
                            icon: "success",
                            title: "تم الحذف",
                            text: "تم حذف المدينة بنجاح",
                            confirmButtonText: "موافق",
                          });
                        } else {
                          await Swal.fire({
                            icon: "error",
                            title: "تعذر الحذف",
                            text: res.error,
                            confirmButtonText: "حسناً",
                          });
                        }
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
      <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </Card>
  );
}
