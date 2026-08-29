"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  TOURISM_COUNTRIES,
  findCountryForGovernorate,
  governoratesForCountry,
} from "@/lib/constants/countries-governorates";

type Props = {
  defaultCountry?: string | null;
  defaultGovernorate?: string | null;
  countryRequired?: boolean;
  governorateRequired?: boolean;
  countryName?: string;
  governorateName?: string;
  idPrefix?: string;
  className?: string;
};

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function Country_Governorate_Fields({
  defaultCountry,
  defaultGovernorate,
  countryRequired = true,
  governorateRequired = false,
  countryName = "country",
  governorateName = "governorate",
  idPrefix = "loc",
  className,
}: Props) {
  const inferredCountry = useMemo(() => {
    if (defaultCountry?.trim()) return defaultCountry.trim();
    return findCountryForGovernorate(defaultGovernorate);
  }, [defaultCountry, defaultGovernorate]);

  const [country, setCountry] = useState(inferredCountry);
  const [governorate, setGovernorate] = useState(
    defaultGovernorate?.trim() ?? ""
  );

  const governorates = useMemo(
    () => governoratesForCountry(country),
    [country]
  );

  useEffect(() => {
    setCountry(inferredCountry);
    setGovernorate(defaultGovernorate?.trim() ?? "");
  }, [inferredCountry, defaultGovernorate]);

  return (
    <div className={className ?? "grid gap-3 sm:grid-cols-2"}>
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-country`}>الدولة</Label>
        <select
          id={`${idPrefix}-country`}
          name={countryName}
          required={countryRequired}
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setGovernorate("");
          }}
          className={selectClass}
        >
          <option value="" disabled={countryRequired}>
            — اختر الدولة أولاً —
          </option>
          {TOURISM_COUNTRIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-governorate`}>المحافظة / المنطقة</Label>
        <select
          id={`${idPrefix}-governorate`}
          name={governorateName}
          required={governorateRequired}
          value={governorate}
          disabled={!country}
          onChange={(e) => setGovernorate(e.target.value)}
          className={selectClass}
        >
          <option value="">
            {country ? "— اختر المحافظة —" : "— اختر الدولة أولاً —"}
          </option>
          {governorates.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
