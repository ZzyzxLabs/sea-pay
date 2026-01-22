"use client";

import * as React from "react";
import SidebarNav from "@/components/sidebar-nav";
import TopBar from "@/components/topbar";
import MobileNav from "@/components/mobile-nav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-4 pb-20 pt-6 md:px-6 lg:gap-10">
        <SidebarNav />
        <div className="flex min-h-[70vh] flex-1 flex-col gap-6">
          <TopBar />
          <main className="flex flex-1 flex-col gap-6">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
