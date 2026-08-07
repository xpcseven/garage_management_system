"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { GarageDriverRow } from "@/lib/actions/garage.actions";
import {
  getDriversLinkedToGarage,
  linkDriverToGarageByEmail,
  unlinkDriverFromGarage,
} from "@/lib/actions/garage.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Swal from "sweetalert2";

type Props = { garageId: string; garageName: string };

export default function Garage_Drivers({ garageId, garageName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [drivers, setDrivers] = useState<GarageDriverRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  async function loadDrivers() {
    setLoading(true);
    try {
      const list = await getDriversLinkedToGarage(garageId);
      setDrivers(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    void loadDrivers();
    setEmail("");
  }, [open, garageId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl border-plum/20 dark:border-orchid/30"
        >
          السائقون
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            سائقو «{garageName}»
          </DialogTitle>
        </DialogHeader>

        <p className="text-start text-sm text-dusk/60 dark:text-muted-foreground">
          اربط سائقين مسجّلين في النظام (بدور سائق) عبر بريدهم. هؤلاء فقط يظهرون
          عند إضافة مركبة للشركة.
        </p>

        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end"
          action={() => {
            const fd = new FormData();
            fd.set("garageId", garageId);
            fd.set("email", email);
            start(async () => {
              const res = await linkDriverToGarageByEmail(fd);
              if (res.success) {
                setEmail("");
                await loadDrivers();
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم ربط السائق",
                  timer: 1400,
                  showConfirmButton: false,
                });
              } else {
                await Swal.fire({ icon: "error", title: res.error });
              }
            });
          }}
        >
          <div className="min-w-0 flex-1 space-y-1.5 text-start">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              بريد السائق
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="driver@example.com"
              required
              className="h-10 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={pending || !email.trim()}
            className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
          >
            ربط
          </Button>
        </form>

        <div className="mt-4 space-y-2">
          {loading ? (
            <p className="py-6 text-center text-sm text-dusk/50 dark:text-muted-foreground">
              جاري التحميل…
            </p>
          ) : drivers.length === 0 ? (
            <p className="py-6 text-center text-sm text-dusk/50 dark:text-muted-foreground">
              لا يوجد سائقون مرتبطون بعد
            </p>
          ) : (
            drivers.map((d) => (
              <div
                key={d.membershipId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-mist/60 px-3 py-2.5 ring-1 ring-plum/10 dark:bg-background dark:ring-orchid/15"
              >
                <div className="min-w-0 text-start">
                  <p className="truncate text-sm font-semibold text-dusk dark:text-foreground">
                    {d.name}
                  </p>
                  <p
                    className="truncate font-data text-xs text-dusk/50 dark:text-muted-foreground"
                    dir="ltr"
                  >
                    {d.email}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-300"
                  onClick={() => {
                    start(async () => {
                      const confirm = await Swal.fire({
                        icon: "warning",
                        title: "إلغاء ربط السائق؟",
                        text: "ستُزال تعييناته من مركبات هذه الشركة.",
                        showCancelButton: true,
                        confirmButtonText: "نعم",
                        cancelButtonText: "إلغاء",
                      });
                      if (!confirm.isConfirmed) return;
                      const fd = new FormData();
                      fd.set("garageId", garageId);
                      fd.set("userId", d.userId);
                      const res = await unlinkDriverFromGarage(fd);
                      if (res.success) {
                        await loadDrivers();
                        router.refresh();
                      } else {
                        await Swal.fire({ icon: "error", title: res.error });
                      }
                    });
                  }}
                >
                  إلغاء الربط
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
