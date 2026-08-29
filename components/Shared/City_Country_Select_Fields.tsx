"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import type { CityRow } from "@/lib/actions/city.actions";
import Link from "next/link";

type Props = {
  cities: CityRow[];
  defaultCityId?: string | null;
  defaultCountry?: string | null;
  cityRequired?: boolean;
  countryRequired?: boolean;
  idPrefix?: string;
  className?: string;
  /** رابط إدارة المدن (للمشرفين) — إن تُرك فارغاً لا يُعرض الرابط */
  manageCitiesHref?: string | null;
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60";

function cityOptionLabel(c: CityRow) {
  if (c.region?.trim() && c.region.trim() !== c.name.trim()) {
    return `${c.name} — ${c.region}`;
  }
  return c.name;
}

/** الدولة ثم المدينة/المحافظة من قائمة المدن المسجّلة */
export default function City_Country_Select_Fields({
  cities,
  defaultCityId,
  defaultCountry,
  cityRequired = true,
  countryRequired = true,
  idPrefix = "city-loc",
  className,
  manageCitiesHref = "/cities",
}: Props) {
  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const c of cities) {
      const country = c.country?.trim();
      if (country) set.add(country);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
  }, [cities]);

  const initialCity = useMemo(
    () => cities.find((c) => c.id === defaultCityId) ?? null,
    [cities, defaultCityId]
  );

  const [country, setCountry] = useState(
    () =>
      initialCity?.country?.trim() ||
      defaultCountry?.trim() ||
      ""
  );
  const [cityId, setCityId] = useState(defaultCityId?.trim() || "");

  const citiesInCountry = useMemo(() => {
    if (!country) return [];
    return cities.filter((c) => (c.country?.trim() || "") === country);
  }, [cities, country]);

  const selected = useMemo(
    () => cities.find((c) => c.id === cityId) ?? null,
    [cities, cityId]
  );

  useEffect(() => {
    const next =
      initialCity?.country?.trim() || defaultCountry?.trim() || "";
    setCountry(next);
    setCityId(defaultCityId?.trim() || "");
  }, [initialCity, defaultCountry, defaultCityId]);

  return (
    <div className={className ?? "grid gap-3 sm:grid-cols-2"}>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-country`}>الدولة</Label>
        <select
          id={`${idPrefix}-country`}
          required={countryRequired}
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setCityId("");
          }}
          className={selectClass}
        >
          <option value="" disabled={countryRequired}>
            — اختر الدولة أولاً —
          </option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-city`}>المدينة / المحافظة</Label>
        <select
          id={`${idPrefix}-city`}
          name="cityId"
          required={cityRequired}
          value={cityId}
          disabled={!country}
          onChange={(e) => setCityId(e.target.value)}
          className={selectClass}
        >
          <option value="">
            {country ? "— اختر المدينة أو المحافظة —" : "— اختر الدولة أولاً —"}
          </option>
          {citiesInCountry.map((c) => (
            <option key={c.id} value={c.id}>
              {cityOptionLabel(c)}
            </option>
          ))}
        </select>
      </div>

      {/* تُحفظ مع المكان للعرض السريع */}
      <input type="hidden" name="country" value={selected?.country ?? country} />
      <input
        type="hidden"
        name="governorate"
        value={selected?.region?.trim() || selected?.name || ""}
      />

      {cities.length === 0 && (
        <p className="text-xs text-amber-800 sm:col-span-2 dark:text-amber-200">
          لا توجد مدن مسجّلة
          {manageCitiesHref ? (
            <>
              . أضف الدولة والمدينة من{" "}
              <Link href={manageCitiesHref} className="underline">
                صفحة المدن
              </Link>
              .
            </>
          ) : (
            ". يرجى التواصل مع الإدارة لإضافة المدن."
          )}
        </p>
      )}
      {cities.length > 0 && countries.length === 0 && (
        <p className="text-xs text-amber-800 sm:col-span-2 dark:text-amber-200">
          المدن الحالية بلا دولة
          {manageCitiesHref ? (
            <>
              . عدّل المدن من{" "}
              <Link href={manageCitiesHref} className="underline">
                صفحة المدن
              </Link>{" "}
              وأضف الدولة لكل مدينة.
            </>
          ) : (
            ". يرجى تحديث بيانات المدن عبر الإدارة."
          )}
        </p>
      )}
    </div>
  );
}
