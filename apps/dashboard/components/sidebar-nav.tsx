"use client";

import { Home, Wallet, CreditCard, TrendingUp, Activity, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/earn", label: "Earn", icon: Wallet },
  { href: "/card", label: "Card", icon: CreditCard },
  { href: "/invest", label: "Invest", icon: TrendingUp },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[240px] flex-col gap-6 md:flex">
      <div className="glass rounded-2xl px-5 py-4">
        <div className="text-lg font-semibold">SeaPay</div>
        <p className="text-xs text-muted-foreground">Money, simplified.</p>
      </div>
      <nav className="glass rounded-2xl p-3">
        <ul className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="glass rounded-2xl px-5 py-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Student-safe mode</p>
        <p className="mt-1">
          Simulated features help you learn before going live.
        </p>
      </div>
    </aside>
  );
}
