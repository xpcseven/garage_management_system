"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type {
  TourismProgramCreatePack,
  TourismProgramManageRow,
} from "@/lib/actions/tourism_program.actions";
import { deleteTourismProgram } from "@/lib/actions/tourism_program.actions";
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
    <section className="space-y-4">
      <div className="rounded-[1.75rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
        <div className="border-b border-plum/10 p-5 sm:p-6 dark:border-orchid/15">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-start">
              <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
                القائمة
              </p>
              <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
                البرامج السياحية
              </h2>
            </div>
            <p className="font-data text-sm text-dusk/50 dark:text-muted-foreground">
              {rows.length} برنامج
            </p>
          </div>
        </div>

        <div className="overflow-x-auto p-2 sm:p-4">
          <table className="w-full text-sm responsive-table">
            <thead>
              <tr className="border-b border-plum/10 text-center dark:border-orchid/15">
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  البرنامج
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الشركة
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  المركبة/السائق
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الأماكن
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الانطلاق
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  السعر
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  المقاعد
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الحالة
                </th>
                {editPack && (
                  <th className="w-44 p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    إجراءات
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-plum/5 text-center last:border-0 dark:border-orchid/10"
                >
                  <td
                    className="p-3 font-semibold text-dusk dark:text-foreground"
                    data-label="البرنامج"
                  >
                    {p.title}
                  </td>
                  <td
                    className="p-3 text-dusk/70 dark:text-muted-foreground"
                    data-label="الشركة"
                  >
                    {p.garageName}
                  </td>
                  <td className="p-3" data-label="المركبة/السائق">
                    <div className="text-dusk dark:text-foreground">
                      {p.vehicleLabel}
                    </div>
                    <div className="mt-1 text-xs text-dusk/50 dark:text-muted-foreground">
                      {p.driverName}
                    </div>
                  </td>
                  <td className="p-3" data-label="الأماكن">
                    <div className="space-y-1">
                      {p.places.map((x) => (
                        <div
                          key={`${x.kind}-${x.id}-${x.order}`}
                          className="text-xs text-dusk/70 dark:text-muted-foreground"
                        >
                          {x.order}. [{x.kind === "TRAVEL" ? "سفر" : "سياحة"}]{" "}
                          {x.name}
                        </div>
                      ))}
                      {p.partners.length > 0 && (
                        <div className="mt-2 space-y-1 border-t border-plum/10 pt-1 dark:border-orchid/15">
                          {p.partners.map((x) => (
                            <div
                              key={x.partnershipId}
                              className="text-xs text-orchid dark:text-orchid-light"
                            >
                              شريك: {x.partnerName}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td
                    className="whitespace-nowrap p-3 font-data text-dusk/70 dark:text-muted-foreground"
                    data-label="الانطلاق"
                  >
                    {new Date(p.startAt).toLocaleString("en-US")}
                  </td>
                  <td
                    className="p-3 font-data tabular-nums text-dusk dark:text-foreground"
                    data-label="السعر"
                  >
                    {p.basePrice}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {p.currency === "USD" ? "دولار" : "دينار"}
                    </span>
                  </td>
                  <td
                    className="p-3 font-data tabular-nums text-dusk/70 dark:text-muted-foreground"
                    data-label="المقاعد"
                  >
                    {p.availableSeats}/{p.maxSeats}
                  </td>
                  <td
                    className="p-3 text-dusk dark:text-foreground"
                    data-label="الحالة"
                  >
                    {statusAr(p.status)}
                  </td>
                  {editPack && (
                    <td className="p-3" data-label="إجراءات">
                      <div className="flex flex-wrap items-center justify-center gap-2">
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
                  <td
                    colSpan={editPack ? 9 : 8}
                    className="p-10 text-center text-dusk/50 dark:text-muted-foreground"
                  >
                    لا توجد برامج سياحية بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-plum/10 px-2 py-3 sm:px-4 dark:border-orchid/15">
          <TablePagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </section>
  );
}
