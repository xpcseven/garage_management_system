import type { PublicGarageRow } from "@/lib/actions/passenger.actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin } from "lucide-react";

type Props = { garages: PublicGarageRow[] };

export default function Passenger_Garages_Component({ garages }: Props) {
  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-800">الكراجات المسجّلة</h1>
          <p className="text-sm text-muted-foreground mt-1">
            مسافر — اختر كراجاً أو قسم الرحلات المستقلة لعرض الرحلات المتاحة.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/passenger/trips">البحث عن رحلة</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-violet-100 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">رحلات السائقين المستقلين</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground flex-1 flex flex-col">
            <p className="flex-1 leading-relaxed">
              رحلات لا تتبع كراجاً — ادخل لعرض جميع الرحلات المستقلة المتاحة
              للحجز.
            </p>
            <Button asChild className="w-full">
              <Link href="/passenger/freelance-trips">
                الدخول وعرض الرحلات
              </Link>
            </Button>
          </CardContent>
        </Card>

        {garages.map((g) => (
          <Card key={g.id} className="border-sky-100 flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{g.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground flex-1 flex flex-col">
              <div className="space-y-2 flex-1">
                {g.description && <p>{g.description}</p>}
                {g.phone && <p>هاتف: {g.phone}</p>}
                <div className="flex items-center justify-between gap-2">
                  <p>الموقع (location): {g.address ?? "غير محدد"}</p>
                  {g.address ? (
                    <Button asChild variant="ghost" size="icon" title="عرض الموقع على الخريطة">
                      <a
                        href={`https://www.google.com/maps?q=${encodeURIComponent(g.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="h-5 w-5 text-sky-600" />
                      </a>
                    </Button>
                  ) : (
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground/50"
                      title="لا يوجد موقع"
                    >
                      <MapPin className="h-5 w-5" />
                    </span>
                  )}
                </div>
              </div>
              <Button asChild className="w-full">
                <Link href={`/passenger/garages/${g.id}`}>
                  الدخول وعرض الرحلات
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {garages.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-8">
            لا توجد كراجات مسجّلة حالياً.
          </p>
        )}
      </div>
    </div>
  );
}
