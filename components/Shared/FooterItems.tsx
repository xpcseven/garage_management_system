import Link from "next/link";
export const FooterItems = () => {
  return (
    <div className="flex">
      <Link href="/haekaleaprint">
        <button className="mt-4 m-2 text-sm border-b-2 border-savecolor rounded-tr-xl rounded-bl-xl w-32 h-9 text-titlecolor bg-primary hover:bg-secondary flex justify-center items-center ">
          طباعة الهيكلية
        </button>
      </Link>

      <Link href="/counting">
        <button className="mt-4 m-2 text-sm border-b-2 border-savecolor rounded-tr-xl rounded-bl-xl w-32 h-9 text-titlecolor bg-primary hover:bg-secondary flex justify-center items-center">
          احصائيات
        </button>
      </Link>

      <Link href="/allvacation">
        <button className="mt-4 m-2 text-sm border-b-2 border-savecolor rounded-tr-xl rounded-bl-xl w-32 h-9 text-titlecolor bg-primary hover:bg-secondary flex justify-center items-center ">
          الاجازات
        </button>
      </Link>
    </div>
  );
};
