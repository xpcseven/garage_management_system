"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import React from "react";

const SelectPageSize = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSelect = useDebouncedCallback((term: any) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (term) {
      params.set("pageSize", term);
    } else {
      params.delete("pageSize");
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="mt-2 text-center">
      <select
        className="text-right "
        onChange={(e) => {
          handleSelect(e.target.value);
        }}
      >
        <option className="text-center" value="50">
          Page Capacity
        </option>
        <option className="text-center" value="100">
          100
        </option>
        <option className="text-center" value="150">
          150
        </option>
        <option className="text-center" value="200">
          200
        </option>
        <option className="text-center" value="250">
          250
        </option>
        <option className="text-center" value="300">
          300
        </option>
        <option className="text-center" value="350">
          350
        </option>
        <option className="text-center" value="400">
          400
        </option>
        <option className="text-center" value="450">
          450
        </option>
        <option className="text-center" value="500">
          500
        </option>
        <option className="text-center" value="1000">
          1000
        </option>
        <option className="text-center" value="2000">
          2000
        </option>
      </select>
    </div>
  );
};

export default SelectPageSize;
