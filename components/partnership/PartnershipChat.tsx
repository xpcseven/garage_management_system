"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendPartnershipMessage } from "@/lib/actions/partnership-message.actions";
import type { PartnershipMessageRow } from "@/lib/actions/partnership-message.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { partnerLabel } from "@/lib/partnership-labels";
import type { BusinessPartnerType } from "@prisma/client";

type Props = {
  partnershipId: string;
  garageName: string;
  partnerName: string;
  partnerType: BusinessPartnerType;
  messages: PartnershipMessageRow[];
};

export default function PartnershipChat({
  partnershipId,
  garageName,
  partnerName,
  partnerType,
  messages,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/partnership-messages">← المحادثات</Link>
        </Button>
        <div className="text-right">
          <h1 className="text-lg font-bold text-violet-900">
            {garageName} ↔ {partnerName}
          </h1>
          <p className="text-xs text-muted-foreground">
            {partnerLabel(partnerType)}
          </p>
        </div>
      </div>

      <div className="flex min-h-[360px] flex-col gap-2 rounded-2xl border bg-slate-50 p-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
              m.isMine
                ? "ms-auto bg-violet-600 text-white"
                : "me-auto bg-white text-slate-800 shadow-sm"
            }`}
          >
            {!m.isMine && (
              <p className="mb-0.5 text-[10px] opacity-70">{m.senderName}</p>
            )}
            <p className="leading-6">{m.body}</p>
            <p className="mt-1 text-[10px] opacity-60">
              {new Date(m.createdAt).toLocaleString("ar")}
            </p>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="m-auto text-sm text-muted-foreground">
            لا رسائل بعد — ابدأ المحادثة
          </p>
        )}
      </div>

      <form
        className="flex gap-2"
        action={(fd) => {
          fd.set("partnershipId", partnershipId);
          start(async () => {
            await sendPartnershipMessage(fd);
            router.refresh();
          });
        }}
      >
        <input type="hidden" name="partnershipId" value={partnershipId} />
        <input
          name="body"
          required
          placeholder="اكتب رسالتك..."
          className="h-10 flex-1 rounded-md border px-3 text-sm"
        />
        <Button type="submit" disabled={pending}>
          إرسال
        </Button>
      </form>
    </div>
  );
}
