import Link from "next/link";
import SiteVisitCounter from "@/components/landing/SiteVisitCounter";

export default function LandingFooter() {
  return (
    <footer className="border-t border-plum/10 bg-white py-8 dark:border-orchid/20 dark:bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-start sm:px-6">
        <p className="font-display text-lg text-plum dark:text-orchid-light">
          آشور للسياحة والسفر
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-dusk/60 dark:text-muted-foreground">
          <Link
            href="/tourism-places"
            className="hover:text-plum dark:hover:text-orchid-light"
          >
            المعالم
          </Link>
          <Link
            href="/passenger/trips"
            className="hover:text-plum dark:hover:text-orchid-light"
          >
            الرحلات
          </Link>
          <Link
            href="/passenger/hotels"
            className="hover:text-plum dark:hover:text-orchid-light"
          >
            الفنادق
          </Link>
          <Link
            href="/auth/login"
            className="hover:text-plum dark:hover:text-orchid-light"
          >
            تسجيل الدخول
          </Link>
        </div>
        <div className="flex flex-col items-center gap-1 sm:items-end">
          <SiteVisitCounter />
          <p className="font-data text-xs text-dusk/45 dark:text-muted-foreground">
            © {new Date().getFullYear()} Ashuor Tourism
          </p>
        </div>
      </div>
    </footer>
  );
}
