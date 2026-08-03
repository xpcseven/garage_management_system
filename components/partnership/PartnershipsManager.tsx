"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BusinessPartnerType } from "@prisma/client";
import type {
  PartnerCandidate,
  PartnershipRow,
} from "@/lib/actions/partnership.actions";
import {
  cancelPartnershipInvite,
  endPartnership,
  listPartnerCandidates,
  sendPartnershipInvite,
  setPartnershipDirectoryVisibility,
} from "@/lib/actions/partnership.actions";
import { partnerLabel } from "@/lib/partnership-labels";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Swal from "sweetalert2";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TYPES: BusinessPartnerType[] = ["HOTEL", "RESTAURANT", "FARM"];

const STATUS_AR: Record<string, string> = {
  PENDING: "بانتظار الرد",
  ACCEPTED: "مقبولة",
  REJECTED: "مرفوضة",
  CANCELLED: "ملغاة",
  ENDED: "منتهية",
};

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground";

type StatusFilter = "all" | "PENDING" | "ACCEPTED" | "REJECTED" | "ENDED" | "CANCELLED";

type Props = {
  garages: { id: string; name: string }[];
  partnerships: PartnershipRow[];
};

export default function PartnershipsManager({
  garages,
  partnerships,
}: Props) {
  const router = useRouter();
  const [garageId, setGarageId] = useState(garages[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const [partnerType, setPartnerType] =
    useState<BusinessPartnerType>("HOTEL");
  const [candidates, setCandidates] = useState<PartnerCandidate[]>([]);
  const [partnerId, setPartnerId] = useState("");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  useEffect(() => {
    if (!open || !garageId) return;
    start(async () => {
      const list = await listPartnerCandidates(partnerType, garageId);
      setCandidates(list);
      setPartnerId(list[0]?.id ?? "");
    });
  }, [open, partnerType, garageId]);

  const garageFiltered = useMemo(() => {
    const base = garageId
      ? partnerships.filter((p) => p.garageId === garageId)
      : partnerships;
    const q = search.trim().toLowerCase();
    return base.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (!q) return true;
      const hay = [p.partnerName, p.inviteMessage, partnerLabel(p.partnerType)]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [partnerships, garageId, search, status]);

  const accepted = partnerships.filter((p) => p.status === "ACCEPTED").length;
  const pendingCount = partnerships.filter((p) => p.status === "PENDING").length;

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
              التعاون التجاري
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              الشراكات
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
              أرسل دعوة مع رسالة للفندق أو المطعم أو المزرعة — التعاون يبدأ بعد
              القبول فقط.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={!garageId}
                  className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light"
                >
                  دعوة شراكة
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
                    إرسال دعوة شراكة
                  </DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-3 text-start"
                  action={(fd) => {
                    fd.set("garageId", garageId);
                    fd.set("partnerType", partnerType);
                    fd.set("partnerId", partnerId);
                    fd.set("inviteMessage", message);
                    start(async () => {
                      const res = await sendPartnershipInvite(fd);
                      if (res.success) {
                        setOpen(false);
                        setMessage("");
                        router.refresh();
                        await Swal.fire({
                          icon: "success",
                          title: "تم إرسال الدعوة",
                        });
                      } else {
                        await Swal.fire({ icon: "error", title: res.error });
                      }
                    });
                  }}
                >
                  <div className="space-y-1.5">
                    <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                      نوع الشريك
                    </Label>
                    <select
                      className={fieldClass}
                      value={partnerType}
                      onChange={(e) =>
                        setPartnerType(e.target.value as BusinessPartnerType)
                      }
                    >
                      {TYPES.map((t) => (
                        <option key={t} value={t}>
                          {partnerLabel(t)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                      الشريك
                    </Label>
                    <select
                      className={fieldClass}
                      value={partnerId}
                      onChange={(e) => setPartnerId(e.target.value)}
                      required
                    >
                      {candidates.length === 0 && (
                        <option value="">لا يوجد مرشحون متاحون</option>
                      )}
                      {candidates.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                          {c.cityName ? ` — ${c.cityName}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                      رسالة الدعوة *
                    </Label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[100px] w-full rounded-2xl border border-plum/15 bg-white px-4 py-3 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground"
                      placeholder="اكتب تفاصيل التعاون المقترح..."
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
                    disabled={pending || !partnerId || !message.trim()}
                  >
                    إرسال الدعوة
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-white/25 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
            >
              <Link href="/partnership-messages">المراسلات</Link>
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

        <div className="relative mt-8 grid grid-cols-3 gap-3">
          <Metric label="الكل" value={partnerships.length} />
          <Metric label="مقبولة" value={accepted} />
          <Metric label="بانتظار الرد" value={pendingCount} />
        </div>
      </header>

      {garages.length > 1 && (
        <div className="space-y-1.5 text-start">
          <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
            الشركة السياحية
          </Label>
          <select
            className={`${fieldClass} max-w-md`}
            value={garageId}
            onChange={(e) => setGarageId(e.target.value)}
          >
            {garages.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <section className="space-y-4">
        <div className="rounded-[1.75rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
          <div className="border-b border-plum/10 p-5 sm:p-6 dark:border-orchid/15">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="text-start">
                <p className="font-data text-[11px] uppercase tracking-[0.18em] text-orchid dark:text-orchid-light">
                  القائمة
                </p>
                <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
                  الدعوات والشراكات
                </h2>
              </div>
              <p className="font-data text-sm text-dusk/50 dark:text-muted-foreground">
                {garageFiltered.length} سجل
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم الشريك أو الرسالة…"
                className={fieldClass}
              />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(
                  [
                    ["all", "الكل"],
                    ["PENDING", "بانتظار الرد"],
                    ["ACCEPTED", "مقبولة"],
                    ["REJECTED", "مرفوضة"],
                    ["ENDED", "منتهية"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatus(value)}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orchid",
                      status === value
                        ? "bg-orchid text-white shadow-orchid"
                        : "bg-mist text-dusk/70 ring-1 ring-plum/10 hover:bg-plum-soft dark:bg-muted dark:text-muted-foreground dark:ring-orchid/25 dark:hover:bg-orchid/15"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto p-2 sm:p-4">
            <table className="w-full text-sm responsive-table">
              <thead>
                <tr className="border-b border-plum/10 text-start dark:border-orchid/15">
                  <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    الشريك
                  </th>
                  <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    النوع
                  </th>
                  <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    الحالة
                  </th>
                  <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    الرسالة
                  </th>
                  <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    الدليل
                  </th>
                  <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {garageFiltered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-plum/5 text-start last:border-0 dark:border-orchid/10"
                  >
                    <td
                      className="p-3 font-semibold text-dusk dark:text-foreground"
                      data-label="الشريك"
                    >
                      {p.partnerName}
                    </td>
                    <td
                      className="p-3 text-dusk/60 dark:text-muted-foreground"
                      data-label="النوع"
                    >
                      {partnerLabel(p.partnerType)}
                    </td>
                    <td className="p-3" data-label="الحالة">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 font-data text-[10px] tracking-wide",
                          p.status === "ACCEPTED" &&
                            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
                          p.status === "PENDING" &&
                            "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200",
                          (p.status === "REJECTED" ||
                            p.status === "CANCELLED" ||
                            p.status === "ENDED") &&
                            "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        )}
                      >
                        {STATUS_AR[p.status] ?? p.status}
                      </span>
                    </td>
                    <td
                      className="max-w-[220px] truncate p-3 text-dusk/55 dark:text-muted-foreground"
                      data-label="الرسالة"
                    >
                      {p.inviteMessage}
                    </td>
                    <td className="p-3" data-label="الدليل">
                      {p.status === "ACCEPTED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          className="rounded-xl border-plum/20 dark:border-orchid/30"
                          onClick={() =>
                            start(async () => {
                              await setPartnershipDirectoryVisibility(
                                p.id,
                                !p.isPublicOnDirectory
                              );
                              router.refresh();
                            })
                          }
                        >
                          {p.isPublicOnDirectory ? "ظاهر" : "مخفي"}
                        </Button>
                      ) : (
                        <span className="text-dusk/40 dark:text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>
                    <td className="p-3" data-label="إجراءات">
                      <div className="flex flex-wrap gap-2">
                        {p.status === "ACCEPTED" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="rounded-xl border-plum/20 dark:border-orchid/30"
                            >
                              <Link href={`/partnership-messages/${p.id}`}>
                                مراسلة
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={pending}
                              className="rounded-xl border-plum/20 dark:border-orchid/30"
                              onClick={() =>
                                start(async () => {
                                  await endPartnership(p.id);
                                  router.refresh();
                                })
                              }
                            >
                              إنهاء
                            </Button>
                          </>
                        )}
                        {p.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            className="rounded-xl border-plum/20 dark:border-orchid/30"
                            onClick={() =>
                              start(async () => {
                                await cancelPartnershipInvite(p.id);
                                router.refresh();
                              })
                            }
                          >
                            إلغاء
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {garageFiltered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-10 text-center text-dusk/50 dark:text-muted-foreground"
                    >
                      لا توجد دعوات أو شراكات بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
