"use client";

import { useEffect, useMemo, useState } from "react";
import type { UserAdminRow } from "@/lib/actions/users.actions";
import { roleLabelAr } from "@/lib/role-labels";
import { UserRole } from "@/prisma/UserRole.enum";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import TablePagination from "@/components/Shared/TablePagination";

type Props = { users: UserAdminRow[] };

function roleBadgeClass(role: string): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return "bg-violet-600 hover:bg-violet-600";
    case UserRole.GARAGE_OWNER:
      return "bg-blue-600 hover:bg-blue-600";
    case UserRole.DRIVER:
      return "bg-amber-600 hover:bg-amber-600";
    case UserRole.TOURISM_OWNER:
      return "bg-emerald-600 hover:bg-emerald-600";
    case UserRole.USER:
      return "bg-slate-600 hover:bg-slate-600";
    default:
      return "";
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function Users_Table({ users }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const roleAr = roleLabelAr(u.role).toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").includes(q) ||
        u.role.toLowerCase().includes(q) ||
        roleAr.includes(q)
      );
    });
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <CardTitle className="text-lg">
            قائمة المستخدمين ({filtered.length})
          </CardTitle>
          <div className="w-full max-w-sm">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم، البريد، الهاتف أو الصلاحية..."
              className="text-right"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm responsive-table">
          <thead className="text-center bg-purple-700 text-white">
            <tr className="border-b">
              <th className="p-2">#</th>
              <th className="p-2">الاسم</th>
              <th className="p-2">البريد الإلكتروني</th>
              <th className="p-2">الهاتف</th>
              <th className="p-2">الصلاحية</th>
              <th className="p-2">الحالة</th>
              <th className="p-2">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-muted-foreground">
                  لا يوجد مستخدمون مطابقون للبحث.
                </td>
              </tr>
            ) : (
              paged.map((u, index) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-100 hover:bg-purple-50/50 dark:hover:bg-slate-800/40"
                >
                  <td className="p-2">{(page - 1) * PAGE_SIZE + index + 1}</td>
                  <td className="p-2 font-medium">{u.name}</td>
                  <td className="p-2 text-muted-foreground" dir="ltr">
                    {u.email}
                  </td>
                  <td className="p-2" dir="ltr">
                    {u.phone ?? "—"}
                  </td>
                  <td className="p-2">
                    <Badge className={roleBadgeClass(u.role)}>
                      {roleLabelAr(u.role)}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <Badge variant={u.isActive ? "default" : "secondary"}>
                      {u.isActive ? "نشط" : "معطّل"}
                    </Badge>
                  </td>
                  <td className="p-2 text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </CardContent>
    </Card>
  );
}
