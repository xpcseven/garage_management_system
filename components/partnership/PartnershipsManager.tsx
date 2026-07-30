"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BusinessPartnerType } from "@prisma/client";
import type {
  PartnerCandidate,
  PartnershipRow,
} from "@/lib/actions/partnership.actions";
import {
  cancelPartnershipInvite,
  endPartnership,
  listPartnerCandidates,
  sendPartnershipInvite,
  setPartnershipDirectoryVisibility,
} from "@/lib/actions/partnership.actions";
import { partnerLabel } from "@/lib/partnership-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Swal from "sweetalert2";
import Link from "next/link";

const TYPES: BusinessPartnerType[] = ["HOTEL", "RESTAURANT", "FARM"];

const STATUS_AR: Record<string, string> = {
  PENDING: "بانتظار الرد",
  ACCEPTED: "مقبولة",
  REJECTED: "مرفوضة",
  CANCELLED: "ملغاة",
  ENDED: "منتهية",
};

type Props = {
  garages: { id: string; name: string }[];
  partnerships: PartnershipRow[];
};

export default function PartnershipsManager({
  garages,
  partnerships,
}: Props) {
  const router = useRouter();
  const [garageId, setGarageId] = useState(garages[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const [partnerType, setPartnerType] =
    useState<BusinessPartnerType>("HOTEL");
  const [candidates, setCandidates] = useState<PartnerCandidate[]>([]);
  const [partnerId, setPartnerId] = useState("");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!open || !garageId) return;
    start(async () => {
      const list = await listPartnerCandidates(partnerType, garageId);
      setCandidates(list);
      setPartnerId(list[0]?.id ?? "");
    });
  }, [open, partnerType, garageId]);

  const filtered = garageId
    ? partnerships.filter((p) => p.garageId === garageId)
    : partnerships;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-right">
          <h1 className="text-2xl font-bold text-violet-800">الشراكات</h1>
          <p className="text-sm text-muted-foreground">
            أرسل دعوة مع رسالة للفندق أو المطعم أو المزرعة. التعاون يبدأ بعد القبول فقط.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={!garageId}>دعوة شراكة</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>إرسال دعوة شراكة</DialogTitle>
            </DialogHeader>
            <form
              className="space-y-3"
              action={(fd) => {
                fd.set("garageId", garageId);
                fd.set("partnerType", partnerType);
                fd.set("partnerId", partnerId);
                fd.set("inviteMessage", message);
                start(async () => {
                  const res = await sendPartnershipInvite(fd);
                  if (res.success) {
                    setOpen(false);
                    setMessage("");
                    router.refresh();
                    await Swal.fire({
                      icon: "success",
                      title: "تم إرسال الدعوة",
                    });
                  } else {
                    await Swal.fire({ icon: "error", title: res.error });
                  }
                });
              }}
            >
              <div className="space-y-1">
                <Label>نوع الشريك</Label>
                <select
                  className="flex h-10 w-full rounded-md border px-3 text-sm"
                  value={partnerType}
                  onChange={(e) =>
                    setPartnerType(e.target.value as BusinessPartnerType)
                  }
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {partnerLabel(t)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>الشريك</Label>
                <select
                  className="flex h-10 w-full rounded-md border px-3 text-sm"
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  required
                >
                  {candidates.length === 0 && (
                    <option value="">لا يوجد مرشحون متاحون</option>
                  )}
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.cityName ? ` — ${c.cityName}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>رسالة الدعوة *</Label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px] w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="اكتب تفاصيل التعاون المقترح..."
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={pending || !partnerId || !message.trim()}
              >
                إرسال الدعوة
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {garages.length > 1 && (
        <div className="space-y-1 text-right">
          <Label>الشركة السياحية</Label>
          <select
            className="flex h-10 w-full max-w-md rounded-md border px-3 text-sm"
            value={garageId}
            onChange={(e) => setGarageId(e.target.value)}
          >
            {garages.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-right">
              <th className="p-3">الشريك</th>
              <th className="p-3">النوع</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">الرسالة</th>
              <th className="p-3">الدليل</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3 font-medium">{p.partnerName}</td>
                <td className="p-3">{partnerLabel(p.partnerType)}</td>
                <td className="p-3">
                  <Badge variant="secondary">
                    {STATUS_AR[p.status] ?? p.status}
                  </Badge>
                </td>
                <td className="max-w-[220px] truncate p-3 text-muted-foreground">
                  {p.inviteMessage}
                </td>
                <td className="p-3">
                  {p.status === "ACCEPTED" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          await setPartnershipDirectoryVisibility(
                            p.id,
                            !p.isPublicOnDirectory
                          );
                          router.refresh();
                        })
                      }
                    >
                      {p.isPublicOnDirectory ? "ظاهر" : "مخفي"}
                    </Button>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {p.status === "ACCEPTED" && (
                      <>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/partnership-messages/${p.id}`}>
                            مراسلة
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() =>
                            start(async () => {
                              await endPartnership(p.id);
                              router.refresh();
                            })
                          }
                        >
                          إنهاء
                        </Button>
                      </>
                    )}
                    {p.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                          start(async () => {
                            await cancelPartnershipInvite(p.id);
                            router.refresh();
                          })
                        }
                      >
                        إلغاء
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  لا توجد دعوات أو شراكات بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
