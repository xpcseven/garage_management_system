"use client";

import { useEffect, useState } from "react";

export default function SiteVisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function recordVisit() {
      try {
        const res = await fetch("/api/site-visits", { method: "POST" });
        if (!res.ok) return;
        const data = (await res.json()) as { count?: number };
        if (!cancelled && typeof data.count === "number") {
          setCount(data.count);
        }
      } catch {
        // silent — العداد ثانوي ولا يجب أن يعيق الصفحة
      }
    }

    void recordVisit();
    return () => {
      cancelled = true;
    };
  }, []);

  const label =
    count === null
      ? "عدد الزوار: …"
      : `عدد الزوار: ${count.toLocaleString("en-US")}`;

  return (
    <p
      className="font-data text-xs tabular-nums text-dusk/50 dark:text-muted-foreground"
      aria-live="polite"
    >
      {label}
    </p>
  );
}
