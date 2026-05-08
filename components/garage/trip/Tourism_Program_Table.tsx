"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type {
  TourismProgramCreatePack,
  TourismProgramManageRow,
} from "@/lib/actions/tourism_program.actions";
import { deleteTourismProgram } from "@/lib/actions/tourism_program.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TablePagination from "@/components/Shared/TablePagination";
import Tourism_Program_Update from "./Tourism_Program_Update";
import Swal from "sweetalert2";

type Props = {
  rows: TourismProgramManageRow[];
  editPack?: TourismProgramCreatePack;
};

function statusAr(s: string) {
  if (s === "SCHEDULED") return "مجدول";
  if (s === "IN_PROGRESS") return "جاري";
  if (s === "COMPLETED") return "مكتمل";
  if (s === "CANCELLED") return "ملغى";
  return s;
}

export default function Tourism_Program_Table({ rows, editPack }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = useMemo(
    () => rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [rows, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-purple-700">جدول البرامج السياحية ({rows.length})</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm responsive-table">
          <thead className=" bg-purple-700 text-white">
            <tr className="border-b text-center">
              <th className="p-2">البرنامج</th>
              <th className="p-2">الشركة</th>
              <th className="p-2">المركبة/السائق</th>
              <th className="p-2">الأماكن</th>
              <th className="p-2">الانطلاق</th>
              <th className="p-2">السعر</th>
              <th className="p-2">المقاعد</th>
              <th className="p-2">الحالة</th>
              {editPack && <th className="p-2 w-44">إجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => (
              <tr key={p.id} className="border-b border-muted">
                <td className="p-2" data-label="البرنامج">{p.title}</td>
                <td className="p-2" data-label="الشركة">{p.garageName}</td>
                <td className="p-2" data-label="المركبة/السائق">
                  <div>{p.vehicleLabel}</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.driverName}</div>
                </td>
                <td className="p-2" data-label="الأماكن">
                  <div className="space-y-1">
                    {p.places.map((x) => (
                      <div key={x.id} className="text-xs">
                        {x.order}. {x.name}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="p-2 whitespace-nowrap" data-label="الانطلاق">
                  {new Date(p.startAt).toLocaleString("en-US")}
                </td>
                <td className="p-2 font-mono" data-label="السعر">{p.basePrice}</td>
                <td className="p-2" data-label="المقاعد">
                  {p.availableSeats}/{p.maxSeats}
                </td>
                <td className="p-2" data-label="الحالة">{statusAr(p.status)}</td>
                {editPack && (
                  <td className="p-2" data-label="إجراءات">
                    <div className="flex flex-wrap items-center gap-2">
                      <Tourism_Program_Update row={p} pack={editPack} />
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={pending}
                        onClick={async () => {
                          const confirmed = await Swal.fire({
                            icon: "warning",
                            title: "تأكيد الحذف",
                            text: "هل تريد حذف البرنامج السياحي؟",
                            showCancelButton: true,
                            confirmButtonText: "نعم، حذف",
                            cancelButtonText: "إلغاء",
                          });
                          if (!confirmed.isConfirmed) return;
                          start(async () => {
                            const res = await deleteTourismProgram(p.id);
                            if (res.success) {
                              router.refresh();
                              await Swal.fire({
                                icon: "success",
                                title: "تم الحذف",
                                text: "تم حذف البرنامج السياحي بنجاح",
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
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={editPack ? 9 : 8} className="p-8 text-center text-muted-foreground">
                  لا توجد برامج سياحية بعد
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

