export type ProgramCurrency = "IQD" | "USD";

export const PROGRAM_CURRENCY_OPTIONS: {
  value: ProgramCurrency;
  label: string;
  short: string;
}[] = [
  { value: "IQD", label: "IQD", short: "د.ع" },
  { value: "USD", label: "USD", short: "$" },
];

export function normalizeProgramCurrency(raw: string | null | undefined): ProgramCurrency {
  const v = String(raw ?? "").trim().toUpperCase();
  return v === "USD" ? "USD" : "IQD";
}

export function currencyLabel(currency: string | null | undefined): string {
  const c = normalizeProgramCurrency(currency);
  return PROGRAM_CURRENCY_OPTIONS.find((o) => o.value === c)?.label ?? "IQD";
}

export function formatProgramPrice(
  amount: string | number | null | undefined,
  currency: string | null | undefined
): string {
  const n = amount == null ? "—" : String(amount).trim() || "—";
  return `${n} ${currencyLabel(currency)}`;
}
