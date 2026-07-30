import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TicketAccent = "rafidain" | "palm" | "date" | "clay";

const mediaTone: Record<TicketAccent, string> = {
  rafidain: "bg-plum/10",
  palm: "bg-orchid/15",
  date: "bg-orchid-light/25",
  clay: "bg-fuchsia-soft",
};

type Props = {
  accent?: TicketAccent;
  media?: ReactNode;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
};

/** بطاقة التذكرة — بنفسج آشور */
export default function TicketStub({
  accent = "rafidain",
  media,
  children,
  className,
  footer,
}: Props) {
  return (
    <article
      className={cn(
        "group relative flex overflow-hidden rounded-2xl bg-white shadow-plum",
        "ring-1 ring-plum/10 transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-orchid",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "dark:bg-dusk/50 dark:ring-orchid/20",
        className
      )}
    >
      <div
        className={cn(
          "relative flex w-[38%] shrink-0 items-center justify-center overflow-hidden sm:w-2/5",
          mediaTone[accent]
        )}
      >
        {media}
      </div>

      <div className="relative w-0 border-e-2 border-dashed border-plum/20 dark:border-orchid/30">
        <span className="ticket-notch -start-2 -top-2" />
        <span className="ticket-notch -start-2 -bottom-2" />
      </div>

      <div
        className={cn(
          "flex flex-1 flex-col gap-2 p-4",
          "transition-transform duration-300 group-hover:rotate-1",
          "motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
        )}
      >
        {children}
        {footer}
      </div>
    </article>
  );
}
