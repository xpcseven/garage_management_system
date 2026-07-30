"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PartnershipRow } from "@/lib/actions/partnership.actions";
import {
  endPartnership,
  respondToPartnershipInvite,
} from "@/lib/actions/partnership.actions";
import { partnerLabel } from "@/lib/partnership-labels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import Swal from "sweetalert2";

const STATUS_AR: Record<string, string> = {
  PENDING: "بانتظار ردك",
  ACCEPTED: "مقبولة",
  REJECTED: "مرفوضة",
  CANCELLED: "ملغاة",
  ENDED: "منتهية",
};

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

  function openRespond(row: PartnershipRow, willAccept: boolean) {
    setActive(row);
    setAccept(willAccept);
    setResponseMessage("");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="text-right">
        <h1 className="text-2xl font-bold text-violet-800">دعوات الشراكة</h1>
        <p className="text-sm text-muted-foreground">
          راجع دعوات الشركات السياحية واقبل أو ارفض مع إمكانية إضافة رد.
        </p>
      </div>

      <div className="grid gap-4">
        {invites.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1 text-right">
                <h2 className="text-lg font-bold">{p.garageName}</h2>
                <p className="text-sm text-muted-foreground">
                  يدعوك للشراكة مع {partnerLabel(p.partnerType)}:{" "}
                  <span className="font-medium text-slate-800">
                    {p.partnerName}
                  </span>
                </p>
                <Badge variant="secondary">
                  {STATUS_AR[p.status] ?? p.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.status === "PENDING" && (
                  <>
                    <Button size="sm" onClick={() => openRespond(p, true)}>
                      قبول
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRespond(p, false)}
                    >
                      رفض
                    </Button>
                  </>
                )}
                {p.status === "ACCEPTED" && (
                  <>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/partnership-messages/${p.id}`}>مراسلة</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
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
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              {p.inviteMessage}
            </p>
            {p.responseMessage && (
              <p className="mt-2 text-xs text-muted-foreground">
                ردك: {p.responseMessage}
              </p>
            )}
          </article>
        ))}
        {invites.length === 0 && (
          <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            لا توجد دعوات حالياً
          </p>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {accept ? "قبول الدعوة" : "رفض الدعوة"}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
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
              className="min-h-[90px] w-full rounded-md border px-3 py-2 text-sm"
              placeholder="رسالة رد اختيارية..."
            />
            <Button type="submit" disabled={pending} className="w-full">
              تأكيد
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
