import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { listMyPartnershipChats } from "@/lib/actions/partnership-message.actions";
import UnAuthorized from "@/components/UnAuthorized";
import { UserRole } from "@/prisma/UserRole.enum";

export default async function PartnershipMessagesIndexPage() {
  const user = await currentUser();
  const allowed = [
    UserRole.GARAGE_OWNER,
    UserRole.HOTEL_OWNER,
    UserRole.RESTAURANT_OWNER,
    UserRole.FARM_OWNER,
    UserRole.SUPER_ADMIN,
  ];
  if (!user || !allowed.includes(user.role as UserRole)) {
    return <UnAuthorized />;
  }

  const chats = await listMyPartnershipChats();

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-right text-2xl font-bold text-violet-800">
        مراسلات الشراكة
      </h1>
      <div className="space-y-2">
        {chats.map((c) => (
          <Link
            key={c.id}
            href={`/partnership-messages/${c.id}`}
            className="block rounded-2xl border bg-white p-4 shadow-sm transition hover:border-violet-300"
          >
            <p className="font-semibold text-slate-900">{c.title}</p>
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {c.lastMessage}
            </p>
          </Link>
        ))}
        {chats.length === 0 && (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            لا محادثات — اقبل دعوة شراكة أولاً
          </p>
        )}
      </div>
    </div>
  );
}
