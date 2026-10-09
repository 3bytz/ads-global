"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, History, Inbox, LayoutDashboard, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/settings", label: "Company settings", icon: Settings },
  { href: "/admin/users", label: "Users", icon: Users, superOnly: true },
  { href: "/admin/audit", label: "Audit log", icon: History },
];

export function AdminNav({ isSuperAdmin, newCount }: { isSuperAdmin: boolean; newCount: number }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex-1">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {items
          .filter((i) => !i.superOnly || isSuperAdmin)
          .map((i) => {
            const active = i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(`${i.href}/`);
            return (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-ink text-white" : "text-ink hover:bg-tint",
                  )}
                >
                  <i.icon className={cn("size-4", active ? "text-accent" : "text-brand")} aria-hidden="true" />
                  {i.label}
                  {i.href === "/admin/enquiries" && newCount > 0 && (
                    <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-ink">
                      {newCount}
                      <span className="sr-only"> new</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}
