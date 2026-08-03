"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { sendPartnershipMessage } from "@/lib/actions/partnership-message.actions";
import type { PartnershipMessageRow } from "@/lib/actions/partnership-message.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { partnerLabel } from "@/lib/partnership-labels";
import type { BusinessPartnerType } from "@prisma/client";
import { cn } from "@/lib/utils";

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
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-3 py-6 sm:px-6 sm:py-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-5 py-6 text-white sm:px-7 sm:py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-8 top-0 h-36 w-36 rounded-full bg-orchid/30 blur-3xl"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              {partnerLabel(partnerType)}
            </p>
            <h1 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">
              {garageName} ↔ {partnerName}
            </h1>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-white/25 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
          >
            <Link href="/partnership-messages">← المحادثات</Link>
          </Button>
        </div>
      </header>

      <div className="flex min-h-[360px] flex-col gap-2 rounded-[1.75rem] bg-mist/80 p-4 ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20 sm:p-5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
              m.isMine
                ? "ms-auto bg-orchid text-white shadow-orchid"
                : "me-auto bg-white text-dusk shadow-sm ring-1 ring-plum/10 dark:bg-background dark:text-foreground dark:ring-orchid/20"
            )}
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
          <p className="m-auto text-sm text-dusk/50 dark:text-muted-foreground">
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
          className="h-11 flex-1 rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition placeholder:text-dusk/40 focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          disabled={pending}
          className="rounded-xl border-0 bg-orchid px-5 text-white hover:bg-orchid-light"
        >
          إرسال
        </Button>
      </form>
    </div>
  );
}
