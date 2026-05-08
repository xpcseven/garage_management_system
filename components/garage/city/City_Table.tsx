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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import TablePagination from "@/components/Shared/TablePagination";
import { FaCertificate } from "react-icons/fa";

type Props = { cities: CityRow[] };

export default function City_Table({ cities }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 20;
  const filteredCities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => {
      const name = c.name.toLowerCase();
      const region = (c.region ?? "").toLowerCase();
      return name.includes(q) || region.includes(q);
    });
  }, [cities, search]);
  const totalPages = Math.max(1, Math.ceil(filteredCities.length / PAGE_SIZE));
  const pagedCities = useMemo(
    () => filteredCities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredCities, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <CardTitle className="text-lg">قائمة المدن</CardTitle>
          <div className="w-full max-w-xs">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالمدينة أو المنطقة..."
              className="text-right"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm  responsive-table">
          <thead className="text-center bg-purple-700 text-white">
            <tr className="border-b text-center">
              <th className="p-2 text-center">#</th>
              <th className="p-2 text-center">الاسم</th>
              <th className="p-2 text-center">المنطقة</th>
              <th className="p-2 text-center">الحالة</th>
              <th className="p-2 w-40 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {pagedCities.map((c, index) => (
              <tr key={c.id} className="border-b border-muted">
                <td className="p-2 font-semibold text-muted-foreground" data-label="#">
                  {(page - 1) * PAGE_SIZE + index + 1}
                </td>
                <td className="p-2 font-medium" data-label="الاسم">{c.name}</td>
                <td className="p-2 text-muted-foreground" data-label="المنطقة">{c.region ?? "—"}</td>
                <td className="p-2" data-label="الحالة">
                  {c.isActive ? (
                    <div className="text-green-500 font-bold flex items-center justify-center">
                      <FaCertificate className="w-5 h-5" />
                    </div>
                  ) : (
                      <div className="text-red-500 font-bold flex items-center justify-center">
                        <FaCertificate className="w-5 h-5" />
                      </div>
                      
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
            {filteredCities.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  لا توجد مدن مطابقة للبحث
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
