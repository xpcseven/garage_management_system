"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import {
  approveTourismPlaceRequest,
  rejectTourismPlaceRequest,
} from "@/lib/actions/tourism_places.actions";
import { Button } from "@/components/ui/button";
import TablePagination from "@/components/Shared/TablePagination";
import Swal from "sweetalert2";
import { placeLocationLabel } from "@/lib/place-location-label";

type Props = {
  requests: TourismPlaceRow[];
};

function fmtCity(p: TourismPlaceRow) {
  return placeLocationLabel(p);
}

export default function Tourism_Place_Requests_Component({ requests }: Props) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 12;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((p) => {
      const hay = [p.name, p.description, p.country, p.governorate, p.cityName, fmtCity(p)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [requests, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  function handleApprove(id: string) {
    start(async () => {
      const res = await approveTourismPlaceRequest(id);
      if (res.success) {
        router.refresh();
        await Swal.fire({
          icon: "success",
          title: "تمت الموافقة",
          text: "تم اعتماد المكان السياحي بنجاح",
          confirmButtonText: "موافق",
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "تعذر التنفيذ",
          text: res.error,
          confirmButtonText: "حسناً",
        });
      }
    });
  }

  function handleReject(id: string) {
    start(async () => {
      const confirmed = await Swal.fire({
        icon: "warning",
        title: "تأكيد الرفض",
        text: "هل تريد رفض هذا الطلب؟",
        showCancelButton: true,
        confirmButtonText: "نعم، رفض",
        cancelButtonText: "إلغاء",
      });
      if (!confirmed.isConfirmed) return;

      const res = await rejectTourismPlaceRequest(id);
      if (res.success) {
        router.refresh();
        await Swal.fire({
          icon: "success",
          title: "تم الرفض",
          text: "تم رفض طلب المكان السياحي",
          confirmButtonText: "موافق",
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: "تعذر التنفيذ",
          text: res.error,
          confirmButtonText: "حسناً",
        });
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-6 py-8 text-white sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-48 w-48 rounded-full bg-orchid/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-8 bottom-0 h-40 w-40 rounded-full bg-fuchsia-brand/20 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              مراجعة الاعتماد
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              طلبات اعتماد الأماكن
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
              مراجعة الأماكن التي يضيفها أصحاب الشركات السياحية — موافقة أو رفض
              قبل ظهورها للمسافرين.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light"
            >
              <Link href="/tourism_places">الأماكن السياحية</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white dark:border-white/25 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
            >
              <Link href="/home">الرئيسية</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Metric label="طلبات معلّقة" value={requests.length} />
          <Metric label="نتائج البحث" value={filtered.length} />
        </div>
      </header>

      <section className="space-y-4">
        <div className="rounded-[1.75rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
          <div className="border-b border-plum/10 p-5 sm:p-6 dark:border-orchid/15">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="text-start">
                <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
                  القائمة
                </p>
                <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
                  الطلبات المعلّقة
                </h2>
              </div>
              <p className="font-data text-sm text-dusk/50 dark:text-muted-foreground">
                {filtered.length} طلب
              </p>
            </div>

            <div className="mt-5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو المحافظة…"
                className="h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition placeholder:text-dusk/40 focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground dark:placeholder:text-muted-foreground dark:focus:border-orchid-light dark:focus:ring-orchid/40"
              />
            </div>
          </div>

          <div className="overflow-x-auto p-2 sm:p-4">
            <table className="w-full text-sm responsive-table">
              <thead>
                <tr className="border-b border-plum/10 text-start dark:border-orchid/15">
                  <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    #
                  </th>
                  <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    الصورة
                  </th>
                  <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    الاسم
                  </th>
                  <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    المحافظة
                  </th>
                  <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    التاريخ
                  </th>
                  <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {paged.map((p, index) => {
                  const cover = p.images?.[0] ?? p.imageUrl;
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-plum/5 text-start last:border-0 dark:border-orchid/10"
                    >
                      <td
                        className="p-3 font-data tabular-nums text-dusk/45 dark:text-muted-foreground"
                        data-label="#"
                      >
                        {(page - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="p-3" data-label="الصورة">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt={p.name}
                            className="h-14 w-20 rounded-xl object-cover ring-1 ring-plum/10 dark:ring-orchid/20"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-mist text-[10px] text-dusk/40 ring-1 ring-plum/10 dark:bg-muted dark:text-muted-foreground dark:ring-orchid/20">
                            بلا صورة
                          </div>
                        )}
                      </td>
                      <td className="p-3" data-label="الاسم">
                        <p className="font-semibold text-dusk dark:text-foreground">
                          {p.name}
                        </p>
                        {p.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-dusk/50 dark:text-muted-foreground">
                            {p.description}
                          </p>
                        )}
                      </td>
                      <td
                        className="p-3 text-dusk/60 dark:text-muted-foreground"
                        data-label="المحافظة"
                      >
                        {fmtCity(p)}
                      </td>
                      <td
                        className="whitespace-nowrap p-3 font-data text-dusk/55 dark:text-muted-foreground"
                        data-label="التاريخ"
                      >
                        {new Date(p.createdAt).toLocaleDateString("ar-IQ")}
                      </td>
                      <td className="p-3" data-label="إجراءات">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={busy}
                            className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light"
                            onClick={() => handleApprove(p.id)}
                          >
                            موافقة
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            className="rounded-xl border-plum/20 text-dusk hover:bg-mist dark:border-orchid/30 dark:text-foreground dark:hover:bg-muted"
                            onClick={() => handleReject(p.id)}
                          >
                            رفض
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-10 text-center text-dusk/50 dark:text-muted-foreground"
                    >
                      {requests.length === 0
                        ? "لا توجد طلبات معلّقة حالياً"
                        : "لا نتائج مطابقة للبحث"}
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
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm ring-1 ring-white/15">
      <p className="font-data text-xl font-semibold tabular-nums text-white sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-white/55 sm:text-xs">{label}</p>
    </div>
  );
}
