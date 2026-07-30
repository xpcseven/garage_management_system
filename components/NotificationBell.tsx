"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationRow,
} from "@/lib/actions/notification.actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function hrefForNotification(n: NotificationRow): string | null {
  const data = n.data as Record<string, unknown> | null;
  if (data && typeof data === "object") {
    if (typeof data.partnershipId === "string") {
      if (n.type === "PARTNERSHIP_MESSAGE") {
        return `/partnership-messages/${data.partnershipId}`;
      }
      if (n.type === "PARTNERSHIP_INVITE") return "/partnership-invites";
      return "/partnerships";
    }
  }
  if (n.type === "PARTNERSHIP_INVITE") return "/partnership-invites";
  if (n.type === "PARTNERSHIP_MESSAGE") return "/partnership-messages";
  if (n.type.startsWith("PARTNERSHIP_")) return "/partnerships";
  if (n.type === "PACKAGE_INCLUDED") return "/bookings";
  return null;
}

export default function NotificationBell() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [pending, start] = useTransition();

  const refresh = () => {
    start(async () => {
      const [list, count] = await Promise.all([
        getMyNotifications(20),
        getUnreadNotificationCount(),
      ]);
      setItems(list);
      setUnread(count);
    });
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 60_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) refresh();
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="relative h-9 w-9 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 hover:text-white focus-visible:ring-date"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
          <span className="sr-only">الإشعارات</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="mt-1 max-h-[70vh] w-80 overflow-y-auto rounded-2xl border border-plum/15 bg-mist/95 p-0 shadow-orchid dark:bg-dusk/95"
      >
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">الإشعارات</p>
          {unread > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await markAllNotificationsRead();
                  refresh();
                })
              }
            >
              تعليم الكل كمقروء
            </Button>
          )}
        </div>
        {items.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            لا إشعارات حالياً
          </p>
        ) : (
          items.map((n) => {
            const href = hrefForNotification(n);
            return (
              <DropdownMenuItem
                key={n.id}
                className={`cursor-pointer rounded-none border-b border-plum/10 px-3 py-2.5 focus:bg-plum/5 ${
                  n.isRead ? "" : "bg-plum/5 dark:bg-orchid/15"
                }`}
                onSelect={() => {
                  start(async () => {
                    if (!n.isRead) await markNotificationRead(n.id);
                    refresh();
                    if (href) window.location.href = href;
                  });
                }}
              >
                <div className="w-full space-y-0.5 text-right">
                  <p
                    className={`text-sm ${n.isRead ? "font-normal" : "font-semibold"}`}
                  >
                    {n.title}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {n.body}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString("en-US")}
                  </p>
                </div>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
