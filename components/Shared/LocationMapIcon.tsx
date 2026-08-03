import { MapPin } from "lucide-react";
import { placeMapsUrl } from "@/lib/maps";
import { cn } from "@/lib/utils";

type Props = {
  location: string | null | undefined;
  className?: string;
  /** Visual size of the icon button */
  size?: "sm" | "md";
};

export function LocationMapIcon({ location, className, size = "md" }: Props) {
  const href = placeMapsUrl(location);

  if (!href) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-mist text-dusk/35 dark:bg-muted dark:text-muted-foreground",
          size === "sm" ? "h-8 w-8" : "h-10 w-10",
          className
        )}
        title="لا يوجد موقع"
        aria-label="لا يوجد موقع"
      >
        <MapPin className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="فتح الموقع على الخريطة"
      aria-label="فتح الموقع على الخريطة"
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-orchid/10 text-orchid transition hover:bg-orchid hover:text-white dark:bg-orchid/20 dark:text-orchid-light dark:hover:bg-orchid dark:hover:text-white",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        className
      )}
    >
      <MapPin className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
    </a>
  );
}
