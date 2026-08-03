"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PartnershipRow } from "@/lib/actions/partnership.actions";
import {
  endPartnership,
  respondToPartnershipInvite,
} from "@/lib/actions/partnership.actions";
import { partnerLabel } from "@/lib/partnership-labels";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";

const STATUS_AR: Record<string, string> = {
  PENDING: "بانتظار ردك",
  ACCEPTED: "مقبولة",
  REJECTED: "مرفوضة",
  CANCELLED: "ملغاة",
  ENDED: "منتهية",
};

type StatusFilter = "all" | "PENDING" | "ACCEPTED" | "REJECTED" | "ENDED";

const chipIdle =
  "bg-mist text-dusk/70 ring-1 ring-plum/10 hover:bg-plum-soft dark:bg-muted dark:text-muted-foreground dark:ring-orchid/25 dark:hover:bg-orchid/15";

export default function PartnershipInvitesManager({
  invites,
}: {
  invites: PartnershipRow[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [active, setActive] = useState<PartnershipRow | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [accept, setAccept] = useState(true);
  const [status, setStatus] = useState<StatusFilter>("all");

  const waiting = invites.filter((p) => p.status === "PENDING").length;

  const filtered = useMemo(() => {
    if (status === "all") return invites;
    return invites.filter((p) => p.status === status);
  }, [invites, status]);

  function openRespond(row: PartnershipRow, willAccept: boolean) {
    setActive(row);
    setAccept(willAccept);
    setResponseMessage("");
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
              التعاون التجاري
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              دعوات الشراكة
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
              راجع دعوات الشركات السياحية واقبل أو ارفض مع إمكانية إضافة رد.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
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

        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
          <Metric label="الكل" value={invites.length} />
          <Metric label="بانتظار ردك" value={waiting} />
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(
          [
            ["all", "الكل"],
            ["PENDING", "بانتظار ردك"],
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
              status === value ? "bg-orchid text-white shadow-orchid" : chipIdle
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map((p) => (
          <article
            key={p.id}
            className="rounded-[1.75rem] bg-white p-5 ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20 sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 text-start">
              <div className="space-y-2">
                <h2 className="font-display text-xl text-dusk dark:text-foreground">
                  {p.garageName}
                </h2>
                <p className="text-sm text-dusk/60 dark:text-muted-foreground">
                  يدعوك للشراكة مع {partnerLabel(p.partnerType)}:{" "}
                  <span className="font-medium text-dusk dark:text-foreground">
                    {p.partnerName}
                  </span>
                </p>
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
              </div>
              <div className="flex flex-wrap gap-2">
                {p.status === "PENDING" && (
                  <>
                    <Button
                      size="sm"
                      className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
                      onClick={() => openRespond(p, true)}
                    >
                      قبول
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-plum/20 dark:border-orchid/30"
                      onClick={() => openRespond(p, false)}
                    >
                      رفض
                    </Button>
                  </>
                )}
                {p.status === "ACCEPTED" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="rounded-xl border-plum/20 dark:border-orchid/30"
                    >
                      <Link href={`/partnership-messages/${p.id}`}>مراسلة</Link>
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
                      إنهاء الشراكة
                    </Button>
                  </>
                )}
              </div>
            </div>
            <p className="mt-4 rounded-2xl bg-mist/80 p-4 text-sm leading-7 text-dusk/80 dark:bg-background dark:text-muted-foreground">
              {p.inviteMessage}
            </p>
            {p.responseMessage && (
              <p className="mt-2 text-xs text-dusk/50 dark:text-muted-foreground">
                ردك: {p.responseMessage}
              </p>
            )}
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-[1.75rem] border border-dashed border-plum/20 bg-white p-10 text-center text-sm text-dusk/50 dark:border-orchid/25 dark:bg-card dark:text-muted-foreground">
            لا توجد دعوات حالياً
          </p>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20">
          <DialogHeader>
            <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
              {accept ? "قبول الدعوة" : "رفض الدعوة"}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3 text-start"
            action={(fd) => {
              if (!active) return;
              fd.set("id", active.id);
              fd.set("accept", accept ? "true" : "false");
              fd.set("responseMessage", responseMessage);
              start(async () => {
                const res = await respondToPartnershipInvite(fd);
                if (res.success) {
                  setActive(null);
                  router.refresh();
                  await Swal.fire({
                    icon: "success",
                    title: accept ? "تم القبول" : "تم الرفض",
                  });
                } else {
                  await Swal.fire({ icon: "error", title: res.error });
                }
              });
            }}
          >
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              className="min-h-[90px] w-full rounded-2xl border border-plum/15 bg-white px-4 py-3 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground"
              placeholder="رسالة رد اختيارية..."
            />
            <Button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
            >
              تأكيد
            </Button>
          </form>
        </DialogContent>
      </Dialog>
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
