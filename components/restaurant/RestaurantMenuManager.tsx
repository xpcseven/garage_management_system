"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { RestaurantMenuItemRow } from "@/lib/actions/restaurant.actions";
import {
  createRestaurantMenuItem,
  updateRestaurantMenuItem,
  deleteRestaurantMenuItem,
} from "@/lib/actions/restaurant.actions";
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
import { toDisplayImageUrl } from "@/lib/media-url";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 w-full rounded-2xl border border-plum/15 bg-white px-4 text-sm text-dusk outline-none transition focus:border-orchid focus:ring-2 focus:ring-orchid/30 dark:border-orchid/25 dark:bg-background dark:text-foreground";

type Props = {
  restaurantId: string;
  items: RestaurantMenuItemRow[];
};

export default function RestaurantMenuManager({ restaurantId, items }: Props) {
  return (
    <section className="space-y-4 rounded-[1.75rem] bg-white p-5 ring-1 ring-plum/10 dark:bg-card dark:ring-orchid/20 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-start">
          <p className="font-data text-[11px] uppercase tracking-[0.22em] text-orchid dark:text-orchid-light">
            المنيو
          </p>
          <h2 className="mt-1 font-display text-2xl text-dusk dark:text-foreground">
            قائمة الطعام
          </h2>
          <p className="mt-1 text-sm text-dusk/55 dark:text-muted-foreground">
            {items.length} صنف — أضف وجبات مع صورة واسم وسعر
          </p>
        </div>
        <MenuItemCreate restaurantId={restaurantId} />
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-plum/20 bg-mist/50 p-8 text-center dark:border-orchid/25 dark:bg-background">
          <p className="text-sm text-dusk/50 dark:text-muted-foreground">
            لا توجد أصناف بعد — أضف أول وجبة للقائمة.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

function MenuItemCard({ item }: { item: RestaurantMenuItemRow }) {
  const src = toDisplayImageUrl(item.imageUrl) || item.imageUrl;

  return (
    <article className="overflow-hidden rounded-2xl bg-mist/40 ring-1 ring-plum/10 dark:bg-background dark:ring-orchid/15">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={item.name}
          className="h-36 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-36 items-center justify-center bg-mist text-xs text-dusk/40 dark:bg-muted dark:text-muted-foreground">
          بلا صورة
        </div>
      )}
      <div className="space-y-3 p-4 text-start">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-dusk dark:text-foreground">
              {item.name}
            </h3>
            <p className="mt-1 font-data text-sm tabular-nums text-orchid dark:text-orchid-light">
              {formatPrice(item.price)} د.ع
            </p>
          </div>
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 font-data text-[10px]",
              item.isActive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-mist text-dusk/50 dark:bg-muted dark:text-muted-foreground"
            )}
          >
            {item.isActive ? "ظاهر" : "مخفي"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <MenuItemEdit item={item} />
          <MenuItemDelete id={item.id} name={item.name} />
        </div>
      </div>
    </article>
  );
}

function MenuItemCreate({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState<string>("");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setPreview("");
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light">
          إضافة صنف
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-lg text-dusk dark:text-foreground">
            إضافة صنف للقائمة
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          action={(fd) => {
            fd.set("restaurantId", restaurantId);
            start(async () => {
              const res = await createRestaurantMenuItem(fd);
              if (res.success) {
                setOpen(false);
                setPreview("");
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تمت الإضافة",
                  timer: 1400,
                  showConfirmButton: false,
                });
              } else {
                await Swal.fire({
                  icon: "error",
                  title: res.error || "تعذر الإضافة",
                });
              }
            });
          }}
        >
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              صورة الوجبة
            </Label>
            <Input
              name="file"
              type="file"
              accept="image/*"
              className={fieldClass}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) {
                  setPreview("");
                  return;
                }
                setPreview(URL.createObjectURL(file));
              }}
            />
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="mt-2 h-28 w-full rounded-xl object-cover"
              />
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              اسم الصنف *
            </Label>
            <Input name="name" required className={fieldClass} placeholder="مثال: كباب مشوي" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              السعر (د.ع) *
            </Label>
            <Input
              name="price"
              type="number"
              min={0}
              step="0.01"
              required
              className={fieldClass}
              placeholder="15000"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              الترتيب
            </Label>
            <Input
              name="sortOrder"
              type="number"
              defaultValue={0}
              className={fieldClass}
            />
          </div>
          <input type="hidden" name="isActive" value="true" />
          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
          >
            {pending ? "جاري الحفظ…" : "حفظ الصنف"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MenuItemEdit({ item }: { item: RestaurantMenuItemRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState(
    toDisplayImageUrl(item.imageUrl) || item.imageUrl || ""
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setPreview(toDisplayImageUrl(item.imageUrl) || item.imageUrl || "");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl border-plum/20 dark:border-orchid/30"
        >
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-start text-lg text-dusk dark:text-foreground">
            تعديل الصنف
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          action={(fd) => {
            fd.set("id", item.id);
            start(async () => {
              const res = await updateRestaurantMenuItem(fd);
              if (res.success) {
                setOpen(false);
                router.refresh();
                await Swal.fire({
                  icon: "success",
                  title: "تم التحديث",
                  timer: 1400,
                  showConfirmButton: false,
                });
              } else {
                await Swal.fire({
                  icon: "error",
                  title: res.error || "تعذر التحديث",
                });
              }
            });
          }}
        >
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              صورة جديدة (اختياري — تستبدل القديمة)
            </Label>
            <Input
              name="file"
              type="file"
              accept="image/*"
              className={fieldClass}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setPreview(URL.createObjectURL(file));
              }}
            />
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="mt-2 h-28 w-full rounded-xl object-cover"
              />
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              اسم الصنف *
            </Label>
            <Input
              name="name"
              required
              defaultValue={item.name}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              السعر (د.ع) *
            </Label>
            <Input
              name="price"
              type="number"
              min={0}
              step="0.01"
              required
              defaultValue={item.price}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              الترتيب
            </Label>
            <Input
              name="sortOrder"
              type="number"
              defaultValue={item.sortOrder}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-dusk/60 dark:text-muted-foreground">
              الحالة
            </Label>
            <select
              name="isActive"
              defaultValue={item.isActive ? "true" : "false"}
              className={fieldClass}
            >
              <option value="true">ظاهر للمسافرين</option>
              <option value="false">مخفي</option>
            </select>
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl border-0 bg-orchid text-white hover:bg-orchid-light"
          >
            {pending ? "جاري الحفظ…" : "حفظ التعديلات"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MenuItemDelete({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
      onClick={() => {
        start(async () => {
          const confirm = await Swal.fire({
            icon: "warning",
            title: "حذف الصنف؟",
            text: `سيتم حذف «${name}» من القائمة ومن AWS`,
            showCancelButton: true,
            confirmButtonText: "حذف",
            cancelButtonText: "إلغاء",
            confirmButtonColor: "#e11d48",
          });
          if (!confirm.isConfirmed) return;
          const res = await deleteRestaurantMenuItem(id);
          if (res.success) {
            router.refresh();
            await Swal.fire({
              icon: "success",
              title: "تم الحذف",
              timer: 1200,
              showConfirmButton: false,
            });
          } else {
            await Swal.fire({
              icon: "error",
              title: res.error || "تعذر الحذف",
            });
          }
        });
      }}
    >
      حذف
    </Button>
  );
}

function formatPrice(raw: string) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return n.toLocaleString("en-US");
}
