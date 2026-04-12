"use client";

import React, { useState, useRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchComboboxProps {
  data: any[]; // قائمة البيانات
  valueKey: string; // المفتاح المستخدم للقيمة (مثل "id")
  labelKey: string; // المفتاح المستخدم للعرض (مثل "name")
  placeholder?: string; // النص الافتراضي عند عدم اختيار قيمة
  errorTitle?: string; // رسالة الخطأ عند عدم وجود نتائج
  value?: string; // القيمة الحالية
  className?:string;
  onChange?: (value: string) => void; // دالة لتحديث القيمة
}

const Search_Combobox = ({
  data,
  valueKey,
  labelKey,
  placeholder,
  errorTitle,
  value,
  className,
  onChange,
}: SearchComboboxProps) => {
  const [query, setQuery] = useState(""); // استعلام البحث
  const [isOpen, setIsOpen] = useState(false); // حالة فتح القائمة
  const wrapperRef = useRef<HTMLDivElement>(null); // مرجع للعنصر الرئيسي

  // إغلاق القائمة عند النقر خارجها
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // فلترة البيانات بناءً على البحث
  const filteredData =
    query === ""
      ? data
      : data.filter((item) =>
          item[labelKey]?.toLowerCase().includes(query.toLowerCase())
        );

  // عند اختيار عنصر
  const handleSelect = (selectedValue: string) => {
    onChange?.(selectedValue); // تحديث القيمة
    setQuery(""); // مسح البحث
    setIsOpen(false); // إغلاق القائمة
  };

  // عند التركيز على حقل الإدخال
  const handleFocus = () => {
    if (value) {
      onChange?.(""); // مسح القيمة المختارة إذا كانت موجودة
    }
    setIsOpen(true); // فتح القائمة عند التركيز
  };

  return (
    <div className="relative w-full " ref={wrapperRef}>
      {/* حقل الإدخال */}
      <input
      
        type="text"
        value={
          query ||
          (value
            ? data.find((item) => item[valueKey] === value)?.[labelKey]
            : "")
        }
        onChange={(e) => {
          const newQuery = e.target.value;
          setQuery(newQuery);
          setIsOpen(true); // فتح القائمة عند الكتابة
          if (value) {
            onChange?.(""); // إعادة ضبط القيمة عند الكتابة من جديد
          }
        }}
        onFocus={() => setIsOpen(true)} // فتح القائمة عند التركيز
        placeholder={placeholder || "اختر..."}
        className={`${className} px-3 py-2 border focus:outline-none focus:border-primary dark:text-white dark:bg-slate-800 h-10 w-full rounded-md`}
      />

      {/* عرض القائمة إذا كانت مفتوحة */}
      {isOpen && (
        <ul className="absolute z-50 w-full mt-1 dark:bg-slate-900 bg-white  border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredData.length === 0 ? (
            <li className="px-3 py-2 text-center text-gray-500">
              {errorTitle || "لم يتم العثور على نتائج."}
            </li>
          ) : (
            filteredData.map((item) => (
              <li
                key={item[valueKey]}
                onClick={() => handleSelect(item[valueKey])}
                className={cn(
                  "px-3 py-2 cursor-pointer dark:hover:bg-slate-700 hover:bg-slate-300",
                  value === item[valueKey] && "dark:bg-slate-800"
                )}
              >
                {item[labelKey]}
                {value === item[valueKey] && (
                  <Check className="inline ml-2 text-primary" />
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default Search_Combobox;
