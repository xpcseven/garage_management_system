import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import flagImage from "@/public/System/flags.png";

const Dashboard_Nav = () => {
  return (
    <nav className="mx-4 mt-2 rounded-2xl border border-purple-200/80 bg-gradient-to-r from-purple-50 via-white to-purple-50 px-4 py-4 shadow-sm sm:px-6">
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button
            asChild
            size="lg"
            className="w-full rounded-xl border-0 bg-gradient-to-l from-purple-600 to-purple-500 px-8 font-semibold text-white shadow-md shadow-purple-500/25 transition hover:from-purple-500 hover:to-purple-400 hover:shadow-lg hover:shadow-purple-500/30 sm:w-auto sm:min-w-[11.5rem]"
          >
            <Link href="/auth/register">ابدأ الآن</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full rounded-xl border-2 border-purple-400 bg-white px-8 font-semibold text-purple-700 shadow-sm transition hover:border-purple-500 hover:bg-purple-50 sm:w-auto sm:min-w-[11.5rem]"
          >
            <Link href="/auth/login">تسجيل الدخول</Link>
          </Button>
        </div>

        <div className="flex items-center justify-between sm:justify-end">
          <div className="text-right">
            <p className="text-xs font-medium text-purple-500">IRAQ Tourism and Travel</p>
          </div>
          <Image
            className="ms-3 h-[30px] w-[90px] rounded-sm object-cover"
            src={flagImage}
            alt="علم العراق"
            width={100}
            height={100}
            priority
          />
        </div>
      </div>
    </nav>
  );
};

export default Dashboard_Nav;