import type { BookingLuggageRow } from "@/lib/actions/booking.actions";
import { luggageKindLabel } from "@/lib/luggage-labels";

export default function BookingLuggageList({
  luggage,
}: {
  luggage: BookingLuggageRow[];
}) {
  if (!luggage.length) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  return (
    <ul className="max-w-[16rem] space-y-1.5 text-xs">
      {luggage.map((l, i) => (
        <li
          key={`${l.kind}-${i}`}
          className="border-r-2 border-purple-200 pr-2 leading-relaxed"
        >
          <span className="font-medium text-foreground">
            {luggageKindLabel(l.kind)}
          </span>
          {l.kind === "SACK" ? (
            <span className="text-muted-foreground"> — العدد: {l.quantity}</span>
          ) : (
            l.quantity > 1 && (
              <span className="text-muted-foreground"> — عدد القطع: {l.quantity}</span>
            )
          )}
          {l.weightKg != null && (
            <span className="text-muted-foreground"> — الوزن: {l.weightKg} كغ</span>
          )}
          {l.dimensions ? (
            <span className="text-muted-foreground block">الحجم: {l.dimensions}</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
