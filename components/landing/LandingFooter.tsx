import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="border-t border-plum/10 bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-start sm:px-6">
        <p className="font-display text-lg text-plum">آشور للسياحة والسفر</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-dusk/60">
          <Link href="/tourism-places" className="hover:text-plum">
            المعالم
          </Link>
          <Link href="/passenger/trips" className="hover:text-plum">
            الرحلات
          </Link>
          <Link href="/passenger/hotels" className="hover:text-plum">
            الفنادق
          </Link>
          <Link href="/auth/login" className="hover:text-plum">
            تسجيل الدخول
          </Link>
        </div>
        <p className="font-data text-xs text-dusk/45">
          © {new Date().getFullYear()} Ashuor Tourism
        </p>
      </div>
    </footer>
  );
}
