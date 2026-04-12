"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCity } from "@/lib/actions/city.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function City_Create() {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">إضافة مدينة</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          action={(fd) => {
            start(async () => {
              const res = await createCity(fd);
              if (res.success) router.refresh();
              else alert(res.error);
            });
          }}
        >
          <div className="flex-1 space-y-1">
            <Label htmlFor="city-name">الاسم</Label>
            <Input id="city-name" name="name" required placeholder="بغداد" />
          </div>
          <div className="flex-1 space-y-1">
            <Label htmlFor="city-region">المنطقة (اختياري)</Label>
            <Input id="city-region" name="region" placeholder="بغداد" />
          </div>
          <Button type="submit" disabled={pending} className="bg-sky-600">
            حفظ
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
