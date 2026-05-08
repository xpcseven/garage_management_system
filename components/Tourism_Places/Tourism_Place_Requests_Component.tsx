"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { TourismPlaceRow } from "@/lib/actions/tourism_places.actions";
import {
  approveTourismPlaceRequest,
  rejectTourismPlaceRequest,
} from "@/lib/actions/tourism_places.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";

type Props = {
  requests: TourismPlaceRow[];
};

export default function Tourism_Place_Requests_Component({ requests }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-purple-700">طلبات اعتماد الأماكن السياحية</h1>
        <p className="text-sm text-muted-foreground mt-1">
          أي مكان يضيفه صاحب شركة سياحية يظهر هنا للموافقة أو الرفض.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">الطلبات المعلقة ({requests.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-purple-700 text-white">
              <tr className="text-center">
                <th className="p-2">الاسم</th>
                <th className="p-2">المحافظة/المدينة</th>
                <th className="p-2">الوصف</th>
                <th className="p-2">التاريخ</th>
                <th className="p-2">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.governorate ?? p.cityName ?? "—"}</td>
                  <td className="p-2">{p.description ?? "—"}</td>
                  <td className="p-2 whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString("en-US")}
                  </td>
                  <td className="p-2">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={pending}
                        onClick={() => {
                          start(async () => {
                            const res = await approveTourismPlaceRequest(p.id);
                            if (res.success) {
                              router.refresh();
                              await Swal.fire({
                                icon: "success",
                                title: "تمت الموافقة",
                                text: "تم اعتماد المكان السياحي بنجاح",
                                confirmButtonText: "موافق",
                              });
                            } else {
                              await Swal.fire({
                                icon: "error",
                                title: "تعذر التنفيذ",
                                text: res.error,
                                confirmButtonText: "حسناً",
                              });
                            }
                          });
                        }}
                      >
                        موافقة
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={pending}
                        onClick={() => {
                          start(async () => {
                            const res = await rejectTourismPlaceRequest(p.id);
                            if (res.success) {
                              router.refresh();
                              await Swal.fire({
                                icon: "success",
                                title: "تم الرفض",
                                text: "تم رفض طلب المكان السياحي",
                                confirmButtonText: "موافق",
                              });
                            } else {
                              await Swal.fire({
                                icon: "error",
                                title: "تعذر التنفيذ",
                                text: res.error,
                                confirmButtonText: "حسناً",
                              });
                            }
                          });
                        }}
                      >
                        رفض
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    لا توجد طلبات معلقة حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

