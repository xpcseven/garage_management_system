import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

interface FilterStaffProps {
  label: string;
  itemValue: string;
  data: any[]; // Array of objects to display
  selectedValue: string;
  queryParam: string;
  onSelect: (value: string) => void;
  role?: string; // Role-based visibility
}

export const FilterStaff = ({
  label,
  itemValue,
  data,
  selectedValue,
  queryParam,
  onSelect,
  role,
}: FilterStaffProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isVisible = role === "ADMIN" || role === "SUPERADMIN";

  const handleSelect = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(window.location.search);

    // Reset or update the query parameter based on selection
    if (value === selectedValue) {
      params.delete(queryParam); // Remove the query parameter if deselected
    } else {
      params.set(queryParam, value); // Add or update the query parameter
    }

    // Always reset to page 1
    params.set("page", "1");

    // Update the URL without page reload
    router.replace(`${pathname}?${params.toString()}`);
    onSelect(value); // Update the parent state
  }, 300);



  const filteredData = data.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
 <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between rounded-none mb-3 ${!isVisible ? "hidden" : ""}`}
          hidden={!isVisible}
        >
          {isVisible
            ? selectedValue
              ? data.find((item: any) => item.id === selectedValue)?.label || label
              : label
            : label}
          {isVisible && (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
          )}
        </Button>
      </PopoverTrigger>

      {isVisible && (
        <PopoverContent className="p-0 font-cairo">
          <Command className="bg-gray-400 w-80">
            <input
              type="text"
              placeholder={`Search ${label}...`}
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              className="input-class"
            />
            <CommandList>
              <CommandEmpty>No data found.</CommandEmpty>
              <CommandGroup>
                {filteredData.length === 0 ? (
                  <CommandItem className="text-center">
                    لا توجد بيانات
                  </CommandItem>
                ) : (
                  <>
                    <CommandItem
                      className="hover:bg-slate-500 hover:text-titlecolor"
                      value=""
                      onSelect={() => handleSelect("")}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedValue === "" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {label} (None)
                    </CommandItem>
                    {filteredData.map((item: any) => (
                      <CommandItem
                        className="hover:bg-slate-500 hover:text-titlecolor"
                        key={item.id}
                        value={item.value}
                        onSelect={() => handleSelect(item.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedValue === item.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {item.label}
                      </CommandItem>
                    ))}
                  </>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
    </div>
  );
};
