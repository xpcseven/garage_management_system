"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  HotelRoomBulkUpdateItem,
  HotelRoomRow,
} from "@/lib/actions/hotel.actions";
import {
  bulkDeleteHotelRooms,
  bulkUpdateHotelRooms,
  createHotelRoom,
  updateHotelRoom,
} from "@/lib/actions/hotel.actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";
import TablePagination from "@/components/Shared/TablePagination";
import type { HotelRoomType } from "@prisma/client";

const ROOM_TYPES = [
  { value: "SINGLE", label: "فردية" },
  { value: "DOUBLE", label: "مزدوجة" },
  { value: "TWIN", label: "سريرين" },
  { value: "TRIPLE", label: "ثلاثية" },
  { value: "SUITE", label: "جناح" },
  { value: "FAMILY", label: "عائلية" },
];

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground";

const cellFieldClass =
  "h-9 w-full min-w-[5.5rem] rounded-xl border border-plum/15 bg-white px-2.5 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground";

const chipIdle =
  "bg-mist text-dusk/70 ring-1 ring-plum/10 hover:bg-plum-soft dark:bg-muted dark:text-muted-foreground dark:ring-orchid/25 dark:hover:bg-orchid/15";

type DraftRoom = {
  id: string;
  hotelId: string;
  roomNumber: string;
  roomType: HotelRoomType;
  capacity: string;
  pricePerNight: string;
};

type Props = {
  rooms: HotelRoomRow[];
  hotels: { id: string; name: string }[];
};

function toDraft(rooms: HotelRoomRow[]): DraftRoom[] {
  return rooms.map((r) => ({
    id: r.id,
    hotelId: r.hotelId,
    roomNumber: r.roomNumber,
    roomType: r.roomType,
    capacity: String(r.capacity),
    pricePerNight: r.pricePerNight,
  }));
}

export default function HotelRoomsManager({ rooms, hotels }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [search, setSearch] = useState("");
  const [hotelFilter, setHotelFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [bulkMode, setBulkMode] = useState(false);
  const [drafts, setDrafts] = useState<DraftRoom[]>(() => toDraft(rooms));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const PAGE_SIZE = 12;

  useEffect(() => {
    if (!bulkMode) setDrafts(toDraft(rooms));
  }, [rooms, bulkMode]);

  useEffect(() => {
    const valid = new Set(rooms.map((r) => r.id));
    setSelectedIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) if (valid.has(id)) next.add(id);
      return next.size === prev.size ? prev : next;
    });
  }, [rooms]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rooms.filter((r) => {
      if (hotelFilter !== "all" && r.hotelId !== hotelFilter) return false;
      if (!q) return true;
      const hay = [r.hotelName, r.roomNumber, r.amenities, r.roomType]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rooms, search, hotelFilter]);

  const filteredDrafts = useMemo(() => {
    if (!bulkMode) return [];
    const q = search.trim().toLowerCase();
    return drafts.filter((d) => {
      if (hotelFilter !== "all" && d.hotelId !== hotelFilter) return false;
      if (!q) return true;
      const hotelName =
        hotels.find((h) => h.id === d.hotelId)?.name ?? "";
      const hay = [hotelName, d.roomNumber, d.roomType]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [bulkMode, drafts, hotelFilter, search, hotels]);

  const listForTable = bulkMode ? filteredDrafts : filtered;
  const pageSize = bulkMode ? Math.max(filteredDrafts.length, 1) : PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(listForTable.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = listForTable.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const visibleIds = useMemo(
    () => listForTable.map((r) => r.id),
    [listForTable]
  );
  const selectedCount = selectedIds.size;
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected =
    visibleIds.some((id) => selectedIds.has(id)) && !allVisibleSelected;

  function updateDraft(id: string, patch: Partial<DraftRoom>) {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleSelectAllVisible(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of visibleIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function enterBulkMode() {
    setDrafts(toDraft(rooms));
    setBulkMode(true);
    setPage(1);
  }

  function cancelBulkMode() {
    setDrafts(toDraft(rooms));
    setBulkMode(false);
  }

  function saveBulk() {
    const payload: HotelRoomBulkUpdateItem[] = drafts.map((d) => ({
      id: d.id,
      hotelId: d.hotelId,
      roomNumber: d.roomNumber.trim(),
      roomType: d.roomType,
      capacity: Number(d.capacity),
      pricePerNight: d.pricePerNight,
    }));

    start(async () => {
      const res = await bulkUpdateHotelRooms(payload);
      if (res.success) {
        setBulkMode(false);
        router.refresh();
        await Swal.fire({
          icon: "success",
          title: "تم حفظ التعديلات الجماعية",
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({ icon: "error", title: res.error });
      }
    });
  }

  function deleteSelected() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    start(async () => {
      const confirm = await Swal.fire({
        icon: "warning",
        title: `حذف ${ids.length} غرفة؟`,
        text: "سيتم حذف الغرف المحددة وأي حجوزات مرتبطة بها. لا يمكن التراجع.",
        showCancelButton: true,
        confirmButtonText: "نعم، احذف",
        cancelButtonText: "إلغاء",
        confirmButtonColor: "#b42318",
      });
      if (!confirm.isConfirmed) return;

      const res = await bulkDeleteHotelRooms(ids);
      if (res.success) {
        setSelectedIds(new Set());
        setDrafts((prev) => prev.filter((d) => !ids.includes(d.id)));
        router.refresh();
        await Swal.fire({
          icon: "success",
          title: `تم حذف ${res.deleted ?? ids.length} غرفة`,
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({ icon: "error", title: res.error });
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-plum-dark px-6 py-8 text-white sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-10 top-0 h-48 w-48 rounded-full bg-orchid/30 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl text-start">
            <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid-light">
              الضيافة
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              غرف الفندق
            </h1>
            <p className="mt-3 text-sm leading-8 text-white/70 sm:text-base">
              قائمة مجمّعة لكل الغرف — يمكنك أيضاً إدارتها من بطاقة كل فندق.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!bulkMode && (
              <>
                <Button
                  type="button"
                  disabled={rooms.length === 0}
                  onClick={enterBulkMode}
                  className="rounded-xl border-0 bg-white/15 text-white hover:bg-white/25"
                >
                  تعديل جماعي
                </Button>
                <Button
                  type="button"
                  disabled={pending || selectedCount === 0}
                  onClick={deleteSelected}
                  className="rounded-xl border-0 bg-red-600 text-white hover:bg-red-700"
                >
                  حذف المحدد{selectedCount > 0 ? ` (${selectedCount})` : ""}
                </Button>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={hotels.length === 0}
                      className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
                    >
                      إضافة غرفة
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20">
                    <DialogHeader>
                      <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
                        غرفة جديدة
                      </DialogTitle>
                    </DialogHeader>
                    <form
                      className="space-y-3 text-start"
                      action={(fd) => {
                        start(async () => {
                          const res = await createHotelRoom(fd);
                          if (res.success) {
                            setOpen(false);
                            router.refresh();
                          } else {
                            await Swal.fire({ icon: "error", title: res.error });
                          }
                        });
                      }}
                    >
                      <div className="space-y-1.5">
                        <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                          الفندق
                        </Label>
                        <select name="hotelId" required className={fieldClass}>
                          {hotels.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                          رقم الغرفة
                        </Label>
                        <Input name="roomNumber" required className={fieldClass} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                          النوع
                        </Label>
                        <select
                          name="roomType"
                          defaultValue="DOUBLE"
                          className={fieldClass}
                        >
                          {ROOM_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                            السعة
                          </Label>
                          <Input
                            name="capacity"
                            type="number"
                            defaultValue={2}
                            min={1}
                            className={fieldClass}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                            السعر / ليلة
                          </Label>
                          <Input
                            name="pricePerNight"
                            required
                            className={fieldClass}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                          المرافق
                        </Label>
                        <Input
                          name="amenities"
                          placeholder="واي فاي، تكييف..."
                          className={fieldClass}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={pending}
                        className="w-full rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
                      >
                        حفظ
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
            {bulkMode && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={cancelBulkMode}
                  className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  إلغاء
                </Button>
                <Button
                  type="button"
                  disabled={pending || selectedCount === 0}
                  onClick={deleteSelected}
                  className="rounded-xl border-0 bg-red-600 text-white hover:bg-red-700"
                >
                  حذف المحدد{selectedCount > 0 ? ` (${selectedCount})` : ""}
                </Button>
                <Button
                  type="button"
                  disabled={pending || drafts.length === 0}
                  onClick={saveBulk}
                  className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
                >
                  {pending ? "جاري الحفظ…" : "حفظ الكل"}
                </Button>
              </>
            )}
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white dark:border-white/25 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
            >
              <Link href="/hotels">الفنادق</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white dark:border-white/25 dark:text-white dark:hover:bg-white/20 dark:hover:text-white"
            >
              <Link href="/home">الرئيسية</Link>
            </Button>
          </div>
        </div>
        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
          <Metric label="الغرف" value={rooms.length} />
          <Metric label="نتائج" value={listForTable.length} />
        </div>
      </header>

      {bulkMode && (
        <div className="rounded-2xl bg-orchid/10 px-4 py-3 text-start text-sm text-dusk ring-1 ring-orchid/25 dark:bg-orchid/15 dark:text-foreground dark:ring-orchid/30">
          وضع التعديل الجماعي: عدّل الفندق / الغرفة / النوع / السعة / السعر ثم
          اضغط «حفظ الكل». التعديل يشمل كل الغرف وليس الصفحة الحالية فقط.
        </div>
      )}

      <section className="rounded-[1.75rem] bg-white ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20">
        <div className="border-b border-plum/10 p-5 sm:p-6 dark:border-orchid/15">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ابحث برقم الغرفة أو الفندق…"
            className={fieldClass}
          />
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                setHotelFilter("all");
                setPage(1);
              }}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                hotelFilter === "all"
                  ? "bg-orchid text-white shadow-orchid"
                  : chipIdle
              )}
            >
              كل الفنادق
            </button>
            {hotels.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => {
                  setHotelFilter(h.id);
                  setPage(1);
                }}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                  hotelFilter === h.id
                    ? "bg-orchid text-white shadow-orchid"
                    : chipIdle
                )}
              >
                {h.name}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto p-2 sm:p-4">
          <table className="w-full text-sm responsive-table">
            <thead>
              <tr className="border-b border-plum/10 text-start dark:border-orchid/15">
                <th className="w-10 p-3">
                  <Checkbox
                    checked={
                      allVisibleSelected
                        ? true
                        : someVisibleSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(v) =>
                      toggleSelectAllVisible(v === true)
                    }
                    aria-label="تحديد كل النتائج الظاهرة"
                    className="border-plum/30 data-[state=checked]:bg-orchid data-[state=checked]:border-orchid"
                  />
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الفندق
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  الغرفة
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  النوع
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  السعة
                </th>
                <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                  السعر
                </th>
                {!bulkMode && (
                  <th className="p-3 font-data text-[11px] uppercase tracking-wider text-orchid dark:text-orchid-light">
                    إجراءات
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {bulkMode
                ? (paged as DraftRoom[]).map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-plum/5 text-start last:border-0 dark:border-orchid/10"
                    >
                      <td className="p-2" data-label="تحديد">
                        <Checkbox
                          checked={selectedIds.has(d.id)}
                          onCheckedChange={(v) =>
                            toggleSelected(d.id, v === true)
                          }
                          aria-label={`تحديد الغرفة ${d.roomNumber}`}
                          className="border-plum/30 data-[state=checked]:bg-orchid data-[state=checked]:border-orchid"
                        />
                      </td>
                      <td className="p-2" data-label="الفندق">
                        <select
                          value={d.hotelId}
                          onChange={(e) =>
                            updateDraft(d.id, { hotelId: e.target.value })
                          }
                          className={cn(cellFieldClass, "min-w-[9rem]")}
                        >
                          {hotels.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2" data-label="الغرفة">
                        <Input
                          value={d.roomNumber}
                          onChange={(e) =>
                            updateDraft(d.id, { roomNumber: e.target.value })
                          }
                          className={cellFieldClass}
                        />
                      </td>
                      <td className="p-2" data-label="النوع">
                        <select
                          value={d.roomType}
                          onChange={(e) =>
                            updateDraft(d.id, {
                              roomType: e.target.value as HotelRoomType,
                            })
                          }
                          className={cn(cellFieldClass, "min-w-[7rem]")}
                        >
                          {ROOM_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2" data-label="السعة">
                        <Input
                          type="number"
                          min={1}
                          value={d.capacity}
                          onChange={(e) =>
                            updateDraft(d.id, { capacity: e.target.value })
                          }
                          className={cn(cellFieldClass, "min-w-[4.5rem]")}
                        />
                      </td>
                      <td className="p-2" data-label="السعر">
                        <Input
                          value={d.pricePerNight}
                          onChange={(e) =>
                            updateDraft(d.id, {
                              pricePerNight: e.target.value,
                            })
                          }
                          className={cn(cellFieldClass, "min-w-[6rem]")}
                        />
                      </td>
                    </tr>
                  ))
                : (paged as HotelRoomRow[]).map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-plum/5 text-start last:border-0 dark:border-orchid/10"
                    >
                      <td className="p-3" data-label="تحديد">
                        <Checkbox
                          checked={selectedIds.has(r.id)}
                          onCheckedChange={(v) =>
                            toggleSelected(r.id, v === true)
                          }
                          aria-label={`تحديد الغرفة ${r.roomNumber}`}
                          className="border-plum/30 data-[state=checked]:bg-orchid data-[state=checked]:border-orchid"
                        />
                      </td>
                      <td
                        className="p-3 text-dusk dark:text-foreground"
                        data-label="الفندق"
                      >
                        {r.hotelName}
                      </td>
                      <td
                        className="p-3 font-data font-semibold text-dusk dark:text-foreground"
                        data-label="الغرفة"
                      >
                        {r.roomNumber}
                      </td>
                      <td
                        className="p-3 text-dusk/60 dark:text-muted-foreground"
                        data-label="النوع"
                      >
                        {ROOM_TYPES.find((t) => t.value === r.roomType)
                          ?.label ?? r.roomType}
                      </td>
                      <td
                        className="p-3 font-data text-dusk/70 dark:text-muted-foreground"
                        data-label="السعة"
                      >
                        {r.capacity}
                      </td>
                      <td
                        className="p-3 font-data text-orchid dark:text-orchid-light"
                        data-label="السعر"
                      >
                        {r.pricePerNight}
                      </td>
                      <td className="p-3" data-label="إجراءات">
                        <RoomEdit room={r} />
                      </td>
                    </tr>
                  ))}
              {listForTable.length === 0 && (
                <tr>
                  <td
                    colSpan={bulkMode ? 6 : 7}
                    className="p-10 text-center text-dusk/50 dark:text-muted-foreground"
                  >
                    لا توجد غرف
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-plum/10 px-2 py-3 sm:px-4 dark:border-orchid/15">
          <TablePagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>

      {bulkMode && (
        <div className="sticky bottom-4 z-20 mx-auto flex max-w-xl flex-wrap items-center justify-center gap-2 rounded-2xl bg-plum-dark/95 px-4 py-3 shadow-lg ring-1 ring-white/15 backdrop-blur">
          <p className="w-full text-center text-xs text-white/70 sm:w-auto sm:text-sm">
            {drafts.length} غرفة · محدد {selectedCount}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={cancelBulkMode}
            className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            disabled={pending || selectedCount === 0}
            onClick={deleteSelected}
            className="rounded-xl border-0 bg-red-600 text-white hover:bg-red-700"
          >
            حذف المحدد
          </Button>
          <Button
            type="button"
            disabled={pending || drafts.length === 0}
            onClick={saveBulk}
            className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
          >
            {pending ? "جاري الحفظ…" : "حفظ الكل"}
          </Button>
        </div>
      )}

      {!bulkMode && selectedCount > 0 && (
        <div className="sticky bottom-4 z-20 mx-auto flex max-w-md flex-wrap items-center justify-center gap-2 rounded-2xl bg-plum-dark/95 px-4 py-3 shadow-lg ring-1 ring-white/15 backdrop-blur">
          <p className="text-sm text-white/80">محدد {selectedCount}</p>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setSelectedIds(new Set())}
            className="rounded-xl border-white/30 bg-transparent text-white hover:bg-white/15 hover:text-white"
          >
            إلغاء التحديد
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={deleteSelected}
            className="rounded-xl border-0 bg-red-600 text-white hover:bg-red-700"
          >
            حذف المحدد
          </Button>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3 text-center backdrop-blur-sm ring-1 ring-white/15">
      <p className="font-data text-xl font-semibold tabular-nums text-white sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-white/55 sm:text-xs">{label}</p>
    </div>
  );
}

function RoomEdit({ room }: { room: HotelRoomRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl border-plum/20 dark:border-orchid/30"
        >
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-dusk dark:text-foreground">
            تعديل الغرفة
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3 text-start"
          action={(fd) => {
            fd.set("id", room.id);
            start(async () => {
              const res = await updateHotelRoom(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
              } else {
                await Swal.fire({ icon: "error", title: res.error });
              }
            });
          }}
        >
          <input type="hidden" name="id" value={room.id} />
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              رقم الغرفة
            </Label>
            <Input
              name="roomNumber"
              defaultValue={room.roomNumber}
              required
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              النوع
            </Label>
            <select
              name="roomType"
              defaultValue={room.roomType}
              className={fieldClass}
            >
              {ROOM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                السعة
              </Label>
              <Input
                name="capacity"
                type="number"
                defaultValue={room.capacity}
                className={fieldClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
                السعر
              </Label>
              <Input
                name="pricePerNight"
                defaultValue={room.pricePerNight}
                required
                className={fieldClass}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              المرافق
            </Label>
            <Input
              name="amenities"
              defaultValue={room.amenities ?? ""}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              الحالة
            </Label>
            <select
              name="isActive"
              defaultValue={room.isActive ? "true" : "false"}
              className={fieldClass}
            >
              <option value="true">نشطة</option>
              <option value="false">معطّلة</option>
            </select>
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
          >
            تحديث
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
