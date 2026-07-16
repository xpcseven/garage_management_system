"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

export type PlaceImageItem = {
  /** معاينة محلية أو رابط محفوظ */
  preview: string;
  /** ملف جديد لم يُرفع بعد (يُرفع عند الحفظ على السيرفر) */
  file?: File;
  /** رابط محفوظ مسبقاً */
  url?: string;
};

type Props = {
  items: PlaceImageItem[];
  onChange: (items: PlaceImageItem[]) => void;
  disabled?: boolean;
  idPrefix?: string;
};

export default function Tourism_Place_Images_Upload({
  items,
  onChange,
  disabled = false,
  idPrefix = "tp",
}: Props) {
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      for (const u of objectUrlsRef.current) {
        if (u.startsWith("blob:")) URL.revokeObjectURL(u);
      }
    };
  }, []);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const added: PlaceImageItem[] = [];
    for (const file of Array.from(fileList)) {
      const preview = URL.createObjectURL(file);
      objectUrlsRef.current.push(preview);
      added.push({ preview, file });
    }
    onChange([...items, ...added]);
  };

  const removeAt = (index: number) => {
    const removed = items[index];
    if (removed?.preview.startsWith("blob:")) {
      URL.revokeObjectURL(removed.preview);
      objectUrlsRef.current = objectUrlsRef.current.filter(
        (u) => u !== removed.preview
      );
    }
    onChange(items.filter((_, i) => i !== index));
  };

  const pendingCount = items.filter((i) => i.file).length;
  const savedCount = items.filter((i) => i.url).length;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor={`${idPrefix}-files`}>صور المكان (يمكن اختيار أكثر من صورة)</Label>
        <Input
          id={`${idPrefix}-files`}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp"
          multiple
          disabled={disabled}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="text-xs text-muted-foreground">
          {items.length === 0
            ? "اختر صوراً ثم اضغط حفظ — تُرفع عند الحفظ"
            : `${items.length} صورة (${pendingCount} جديدة، ${savedCount} محفوظة)`}
        </p>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={`${item.preview}-${index}`}
              className="relative overflow-hidden rounded-lg border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.preview} alt="" className="h-24 w-full object-cover" />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute left-1 top-1 h-7 w-7 rounded-full"
                disabled={disabled}
                onClick={() => removeAt(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** يُستدعى عند الإرسال لإلحاق الملفات بـ FormData */
export function appendPlaceImagesToFormData(
  formData: FormData,
  items: PlaceImageItem[]
) {
  for (const item of items) {
    if (item.file) {
      formData.append("placeImages", item.file);
    }
  }
  const urls = items.map((i) => i.url).filter(Boolean) as string[];
  formData.set("imageUrls", JSON.stringify(urls));
}
