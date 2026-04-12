import { cn } from "@/lib/utils";
interface HeaderProps {
  label: string;
}
export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center ">
      <h1
        className={cn(
          "text-xl font-bold items-center justify-center text-sky-600"
        )}
      >
      تسجيل الدخول  
      </h1>
      <p className="text-muted-foreground text-sm font-semibold font-cairo">
        {label}
      </p>
    </div>
  );
};
