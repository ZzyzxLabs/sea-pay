"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, CreditCard, TrendingUp, Activity, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/earn", label: "Earn", icon: Wallet },
  { href: "/card", label: "Card", icon: CreditCard },
  { href: "/invest", label: "Invest", icon: TrendingUp },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="glass fixed bottom-4 left-1/2 z-40 flex w-[92%] -translate-x-1/2 items-center justify-between rounded-2xl px-4 py-2 md:hidden">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[10px]",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
