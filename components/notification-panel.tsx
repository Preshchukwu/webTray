"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  UserPlus,
  Bell,
  Check,
  Package,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type NotificationType = "order" | "payment" | "inventory" | "customer";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "N001",
    type: "order",
    title: "New Order Received",
    description: "Adaeze Obi placed an order for ₦45,000",
    time: "2 min ago",
    read: false,
  },
  {
    id: "N002",
    type: "payment",
    title: "Payment Confirmed",
    description: "₦78,000 received for Order #INV-002",
    time: "15 min ago",
    read: false,
  },
  {
    id: "N003",
    type: "inventory",
    title: "Low Stock Alert",
    description: '"Custom Dress" has only 2 units left',
    time: "1 hr ago",
    read: false,
  },
  {
    id: "N004",
    type: "order",
    title: "Order Status Updated",
    description: "Order #ORD-291 has been marked as delivered",
    time: "3 hrs ago",
    read: true,
  },
  {
    id: "N005",
    type: "customer",
    title: "New Customer",
    description: "Emeka Chukwu just created an account",
    time: "5 hrs ago",
    read: true,
  },
  {
    id: "N006",
    type: "payment",
    title: "Payment Failed",
    description: "Payment for Order #ORD-188 could not be processed",
    time: "Yesterday",
    read: true,
  },
  {
    id: "N007",
    type: "inventory",
    title: "Low Stock Alert",
    description: '"Ankara Suit" has only 1 unit left',
    time: "Yesterday",
    read: true,
  },
  {
    id: "N008",
    type: "order",
    title: "New Order Received",
    description: "Ngozi Eze placed an order for ₦120,000",
    time: "2 days ago",
    read: true,
  },
];

// ─── Icon map ─────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ReactNode; bg: string; color: string }
> = {
  order: {
    icon: <ShoppingBag className="w-4 h-4" />,
    bg: "bg-blue-50",
    color: "text-[#365BEB]",
  },
  payment: {
    icon: <CreditCard className="w-4 h-4" />,
    bg: "bg-green-50",
    color: "text-green-600",
  },
  inventory: {
    icon: <AlertTriangle className="w-4 h-4" />,
    bg: "bg-orange-50",
    color: "text-orange-500",
  },
  customer: {
    icon: <UserPlus className="w-4 h-4" />,
    bg: "bg-purple-50",
    color: "text-purple-500",
  },
};

type FilterTab = "all" | "unread" | "orders" | "payments";

// ─── Main component ───────────────────────────────────────────────────────────
export function NotificationPanel({ bellClassName }: { bellClassName?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "orders") return n.type === "order";
    if (activeTab === "payments") return n.type === "payment";
    return true;
  });

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function dismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "orders", label: "Orders" },
    { key: "payments", label: "Payments" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className={cn("relative focus:outline-none", bellClassName)}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-[400px] p-0 flex flex-col gap-0 border-l border-gray-100"
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-6 pb-0 shrink-0">
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2.5">
              <SheetTitle className="text-[18px] font-bold text-[#111827]">
                Notifications
              </SheetTitle>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#365BEB] text-white text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs font-medium text-[#365BEB] hover:text-[#365BEB]/80 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 mt-5 border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "pb-3 px-3 text-sm font-medium transition-colors relative",
                  activeTab === tab.key
                    ? "text-[#365BEB]"
                    : "text-[#808080] hover:text-[#4D4D4D]"
                )}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#365BEB] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </SheetHeader>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                <Bell className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-[#4D4D4D]">No notifications</p>
              <p className="text-xs text-[#808080]">You&apos;re all caught up!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {filtered.map((notif) => {
                const config = TYPE_CONFIG[notif.type];
                return (
                  <li
                    key={notif.id}
                    onClick={() => markRead(notif.id)}
                    className={cn(
                      "flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors group",
                      notif.read ? "bg-white hover:bg-gray-50/70" : "bg-blue-50/30 hover:bg-blue-50/50"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        config.bg,
                        config.color
                      )}
                    >
                      {config.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-snug",
                            notif.read
                              ? "font-medium text-[#4D4D4D]"
                              : "font-semibold text-[#111827]"
                          )}
                        >
                          {notif.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismiss(notif.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 shrink-0 text-gray-300 hover:text-gray-500 transition-all mt-0.5"
                          aria-label="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[#808080] mt-0.5 leading-relaxed">
                        {notif.description}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1.5">{notif.time}</p>
                    </div>

                    {/* Unread dot */}
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-[#365BEB] shrink-0 mt-2" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="shrink-0 px-5 py-4 border-t border-gray-100 bg-white">
            <button
              onClick={() => setNotifications([])}
              className="w-full text-xs text-[#808080] hover:text-red-500 transition-colors font-medium text-center"
            >
              Clear all notifications
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
