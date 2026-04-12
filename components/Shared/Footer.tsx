import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="w-full border-t-2 border-savecolor bg-primary mt-3">
      <Link href="/copyrights">
        <h1 className="text-titlecolor text-xs p-1 text-center">
          Copyright © THE-FUSION2024
        </h1>
      </Link>
    </footer>
  );
};
