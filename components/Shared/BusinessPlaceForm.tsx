"use client";

import type { FormEventHandler, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toDisplayImageUrl } from "@/lib/media-url";

export const businessSelectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function BusinessFormDialog({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl border-plum/10 dark:border-orchid/20 sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-display text-start text-lg text-dusk dark:text-foreground">
          {title}
        </DialogTitle>
      </DialogHeader>
      {children}
    </DialogContent>
  );
}

export function BusinessForm({
  children,
  action,
  onSubmit,
}: {
  children: ReactNode;
  action?: (formData: FormData) => void;
  onSubmit?: FormEventHandler<HTMLFormElement>;
}) {
  return (
    <form className="grid gap-4" action={action} onSubmit={onSubmit}>
      {children}
    </form>
  );
}

export function Field({
  label,
  htmlFor,
  children,
  hint,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5 text-right">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function ImageThumbs({ urls }: { urls: string[] }) {
  if (!urls.length) return null;
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {urls.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={toDisplayImageUrl(src) || src}
          alt=""
          className="h-14 w-20 rounded-md object-cover ring-1 ring-slate-200"
        />
      ))}
    </div>
  );
}

export function ImagesField({
  name,
  label,
  hint = "يمكنك اختيار عدة صور — الحد الأقصى 10",
}: {
  name: string;
  label: string;
  hint?: string;
}) {
  return (
    <Field label={label} htmlFor={name} hint={hint}>
      <Input
        id={name}
        name={name}
        type="file"
        accept="image/*"
        multiple
        className="cursor-pointer"
      />
    </Field>
  );
}

export function StatusField({
  defaultActive = true,
}: {
  defaultActive?: boolean;
}) {
  return (
    <Field label="الحالة" htmlFor="isActive">
      <select
        id="isActive"
        name="isActive"
        defaultValue={defaultActive ? "true" : "false"}
        className={businessSelectClassName}
      >
        <option value="true">نشط</option>
        <option value="false">معطّل</option>
      </select>
    </Field>
  );
}
