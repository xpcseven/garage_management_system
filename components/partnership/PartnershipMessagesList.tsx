"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export type PartnershipChatListItem = {
  id: string;
  title: string;
  lastMessage: string;
};

type Props = {
  chats: PartnershipChatListItem[];
};

export default function PartnershipMessagesList({ chats }: Props) {
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
              مراسلات الشراكة
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
              محادثات مع الشركاء المقبولين — الفنادق والمطاعم والمزارع.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              asChild
              className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light dark:bg-orchid dark:hover:bg-orchid-light"
            >
              <Link href="/partnerships">الشراكات</Link>
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

        <div className="relative mt-8 grid grid-cols-1 gap-3 sm:max-w-xs">
          <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm ring-1 ring-white/15">
            <p className="font-data text-xl font-semibold tabular-nums text-white sm:text-2xl">
              {chats.length}
            </p>
            <p className="mt-1 text-[11px] text-white/55 sm:text-xs">محادثة</p>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        {chats.map((c) => (
          <Link
            key={c.id}
            href={`/partnership-messages/${c.id}`}
            className="group block rounded-[1.5rem] bg-white p-5 ring-1 ring-plum/10 transition hover:-translate-y-0.5 hover:shadow-orchid motion-reduce:hover:translate-y-0 dark:bg-card dark:ring-orchid/20 dark:hover:bg-muted/50 dark:hover:shadow-none"
          >
            <div className="flex items-start justify-between gap-3 text-start">
              <div className="min-w-0">
                <p className="font-semibold text-dusk dark:text-foreground">
                  {c.title}
                </p>
                <p className="mt-1 line-clamp-1 text-sm text-dusk/55 dark:text-muted-foreground">
                  {c.lastMessage || "لا رسائل بعد"}
                </p>
              </div>
              <span
                className="shrink-0 text-orchid transition group-hover:-translate-x-0.5 dark:text-orchid-light"
                aria-hidden
              >
                ←
              </span>
            </div>
          </Link>
        ))}

        {chats.length === 0 && (
          <div className="rounded-[1.75rem] border border-dashed border-plum/20 bg-white p-10 text-center dark:border-orchid/25 dark:bg-card">
            <p className="text-sm text-dusk/50 dark:text-muted-foreground">
              لا محادثات — اقبل دعوة شراكة أولاً
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
