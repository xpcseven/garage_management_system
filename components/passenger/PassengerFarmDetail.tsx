"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Users } from "lucide-react";
import { bookFarm } from "@/lib/actions/farm.actions";
import Tourism_Place_Detail_Gallery from "@/components/Tourism_Places/Tourism_Place_Detail_Gallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";

export type PassengerFarmDetailData = {
  id: string;
  name: string;
  address: string | null;
  location: string | null;
  phone: string | null;
  description: string | null;
  capacity: number;
  amenities: string | null;
  city: { name: string } | null;
  images: string[];
};

function farmMapUrl(location: string): string {
  const trimmed = location.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

export default function PassengerFarmDetail({
  farm,
}: {
  farm: PassengerFarmDetailData;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [occasionType, setOccasionType] = useState("FAMILY");

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/passenger/farms">← العودة للمزارع</Link>
        </Button>
      </div>

      <Tourism_Place_Detail_Gallery images={farm.images} alt={farm.name} />

      <section className="space-y-3 text-right">
        <h1 className="text-2xl font-bold text-emerald-900 sm:text-3xl">
          {farm.name}
        </h1>
        <p className="text-sm text-slate-500">
          {[farm.address, farm.city?.name].filter(Boolean).join(" — ") ||
            "العنوان غير محدد"}
        </p>

        <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-700" />
            سعة {farm.capacity} ضيف
          </span>
          {farm.phone && (
            <a
              href={`tel:${farm.phone}`}
              className="inline-flex items-center gap-1.5 hover:text-emerald-700"
              dir="ltr"
            >
              <Phone className="h-4 w-4" />
              {farm.phone}
            </a>
          )}
          {farm.location && (
            <a
              href={farmMapUrl(farm.location)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900"
            >
              <MapPin className="h-4 w-4" />
              الموقع على الخريطة
            </a>
          )}
        </div>

        {farm.amenities && (
          <div className="flex flex-wrap justify-end gap-1.5">
            {farm.amenities
              .split(/[,،|/]/)
              .map((a) => a.trim())
              .filter(Boolean)
              .map((a) => (
                <span
                  key={a}
                  className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-800"
                >
                  {a}
                </span>
              ))}
          </div>
        )}

        {farm.description && (
          <p className="leading-7 text-slate-700">{farm.description}</p>
        )}
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-right text-lg font-bold text-emerald-900">
          حجز المزرعة
        </h2>
        <form
          className="space-y-3 text-right"
          action={(fd) => {
            fd.set("farmId", farm.id);
            start(async () => {
              const res = await bookFarm(fd);
              if (res.success) {
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم إرسال طلب الحجز",
                });
                router.push("/passenger/farms");
              } else {
                await Swal.fire({ icon: "error", title: res.error });
              }
            });
          }}
        >
          <input type="hidden" name="farmId" value={farm.id} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>من</Label>
              <Input name="startAt" type="datetime-local" required />
            </div>
            <div className="space-y-1">
              <Label>إلى</Label>
              <Input name="endAt" type="datetime-local" required />
            </div>
          </div>

          <div className="space-y-1">
            <Label>نوع الحجز / المناسبة</Label>
            <select
              name="occasionType"
              value={occasionType}
              onChange={(e) => setOccasionType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="FAMILY">عائلة</option>
              <option value="YOUTH">شبابية</option>
              <option value="WEDDING">عرس</option>
              <option value="OTHER">مناسبة أخرى</option>
            </select>
          </div>

          {occasionType === "OTHER" && (
            <div className="space-y-1">
              <Label>اذكر المناسبة</Label>
              <Input
                name="occasionOther"
                placeholder="مثال: عيد ميلاد، تخرج..."
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <Label>عدد الضيوف (حد أقصى {farm.capacity})</Label>
            <Input
              name="guests"
              type="number"
              min={1}
              max={farm.capacity}
              defaultValue={2}
            />
          </div>

          <div className="space-y-1">
            <Label>ملاحظات</Label>
            <Input name="notes" />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-violet-500 hover:bg-violet-600 text-white"
          >
            تأكيد الحجز
          </Button>
        </form>
      </section>
    </div>
  );
}
