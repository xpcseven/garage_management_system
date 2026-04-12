"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CityRow } from "@/lib/actions/city.actions";
import type { GarageTripPack } from "@/lib/actions/trip.actions";
import { createFreelanceTrip } from "@/lib/actions/trip.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  cities: CityRow[];
  vehicles: GarageTripPack["vehicles"];
};

export default function Trip_Freelance_Create({ cities, vehicles }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const maxCap = vehicles[0]?.totalSeats ?? 1;

  if (vehicles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">رحلة مستقلة (سائق)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-800">
            أضف مركبة باسمك من قسم المركبات لإنشاء رحلة مستقلة.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">إنشاء رحلة مستقلة</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 sm:grid-cols-2"
          action={(fd) => {
            start(async () => {
              const res = await createFreelanceTrip(fd);
              if (res.success) router.refresh();
              else alert(res.error);
            });
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="tf-from">من</Label>
            <select
              id="tf-from"
              name="fromCityId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                — اختر —
              </option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.region ? ` — ${c.region}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="tf-to">إلى</Label>
            <select
              id="tf-to"
              name="toCityId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                — اختر —
              </option>
              {cities.map((c) => (
                <option key={`t-${c.id}`} value={c.id}>
                  {c.name}
                  {c.region ? ` — ${c.region}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="tf-veh">المركبة</Label>
            <select
              id="tf-veh"
              name="vehicleId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={vehicles[0]?.id}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="tf-dep">وقت المغادرة</Label>
            <Input
              id="tf-dep"
              name="departureTime"
              type="datetime-local"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tf-price">السعر الأساسي</Label>
            <Input
              id="tf-price"
              name="basePrice"
              type="number"
              step="0.01"
              min={0}
              required
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="tf-seats">عدد المقاعد</Label>
            <Input
              id="tf-seats"
              name="maxSeats"
              type="number"
              min={1}
              max={maxCap}
              defaultValue={Math.min(4, maxCap)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="sm:col-span-2 bg-sky-600"
          >
            نشر الرحلة
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
