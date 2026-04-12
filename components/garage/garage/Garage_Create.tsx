"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGarage } from "@/lib/actions/garage.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRole } from "@/prisma/UserRole.enum";

type Props = { role: string };

export default function Garage_Create({ role }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const showOwnerField = role === UserRole.SUPER_ADMIN;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">إضافة كراج</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2"
          action={(fd) => {
            start(async () => {
              const res = await createGarage(fd);
              if (res.success) router.refresh();
              else alert(res.error);
            });
          }}
        >
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="g-name">اسم الكراج</Label>
            <Input id="g-name" name="name" required />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="g-desc">الوصف</Label>
            <Input id="g-desc" name="description" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="g-phone">الهاتف</Label>
            <Input id="g-phone" name="phone" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="g-address">العنوان</Label>
            <Input id="g-address" name="address" />
          </div>
          {showOwnerField && (
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="g-owner">معرّف مالك الكراج (UUID)</Label>
              <Input
                id="g-owner"
                name="ownerId"
                placeholder="اتركه فارغاً لاستخدام حسابك"
              />
            </div>
          )}
          <Button
            type="submit"
            disabled={pending}
            className="sm:col-span-2 bg-sky-600 w-full sm:w-auto"
          >
            حفظ
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
