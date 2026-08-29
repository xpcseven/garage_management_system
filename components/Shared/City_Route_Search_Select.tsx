"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CityRow } from "@/lib/actions/city.actions";
import { COUNTRY_GOVERNORATES } from "@/lib/constants/countries-governorates";

type Props = {
  name: string;
  cities: CityRow[];
  id?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
};

function cityLabel(c: CityRow) {
  const parts = [c.name];
  if (c.region) parts.push(c.region);
  if (c.country) parts.push(c.country);
  return parts.join(" — ");
}

function citySearchText(c: CityRow) {
  return `${c.name} ${c.region ?? ""} ${c.country ?? ""}`.toLowerCase();
}

function matchesQuery(c: CityRow, q: string): boolean {
  if (citySearchText(c).includes(q)) return true;

  for (const [country, govs] of Object.entries(COUNTRY_GOVERNORATES)) {
    if (country.toLowerCase().includes(q)) {
      if ((c.country ?? "").toLowerCase().includes(q)) return true;
      const names = new Set(govs.map((g) => g.toLowerCase()));
      if (
        names.has((c.region ?? "").toLowerCase()) ||
        names.has(c.name.toLowerCase())
      ) {
        return true;
      }
    }
    for (const g of govs) {
      if (!g.toLowerCase().includes(q)) continue;
      const region = (c.region ?? "").toLowerCase();
      const name = c.name.toLowerCase();
      const gov = g.toLowerCase();
      if (
        region.includes(gov) ||
        name.includes(gov) ||
        gov.includes(region) ||
        gov.includes(name)
      ) {
        return true;
      }
    }
  }
  return false;
}

/** بحث قابل للكتابة لنقطة انطلاق/وصول (مدينة أو محافظة/منطقة أو دولة) */
export default function City_Route_Search_Select({
  name,
  cities,
  id,
  required,
  placeholder = "ابحث باسم المدينة أو المحافظة…",
  className,
  defaultValue = "",
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = useMemo(
    () => cities.find((c) => c.id === value) ?? null,
    [cities, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => matchesQuery(c, q));
  }, [cities, query]);

  const display = query || (selected ? cityLabel(selected) : "");

  return (
    <div className="relative w-full" ref={wrapRef}>
      <input type="hidden" name={name} value={value} required={required} />
      <input
        id={id}
        type="text"
        autoComplete="off"
        value={display}
        placeholder={placeholder}
        className={className}
        onFocus={() => {
          setOpen(true);
          if (value) {
            setQuery("");
          }
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) setValue("");
        }}
        aria-required={required}
        aria-expanded={open}
        aria-controls={id ? `${id}-list` : undefined}
      />
      {open && (
        <ul
          id={id ? `${id}-list` : undefined}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border border-plum/15 bg-white shadow-lg dark:border-orchid/25 dark:bg-card"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-center text-sm text-dusk/50 dark:text-muted-foreground">
              لا نتائج — جرّب اسم دولة أو محافظة أو مدينة
            </li>
          ) : (
            filtered.map((c) => (
              <li
                key={c.id}
                role="option"
                aria-selected={value === c.id}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm text-dusk hover:bg-mist dark:text-foreground dark:hover:bg-orchid/15",
                  value === c.id && "bg-plum-soft/50 dark:bg-orchid/20"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setValue(c.id);
                  setQuery("");
                  setOpen(false);
                }}
              >
                <span>{cityLabel(c)}</span>
                {value === c.id && (
                  <Check className="h-4 w-4 shrink-0 text-orchid" />
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
