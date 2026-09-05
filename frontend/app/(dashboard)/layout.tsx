"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icons } from "@/components/Icons";
import { Role } from "@/lib/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // For demonstration, we'll assume Admin. In a real app, read from context/session.
  const userRole: Role = "Admin"; 
  const displayName = userRole === "Admin" ? "Marta Okonkwo" : "Daisuke Watanabe";
  const initials = displayName.split(" ").map((n) => n[0]).join("");

  const navItems = [
    { href: "/users", label: "User Management", icon: <Icons.Users />, roles: ["Admin"] as Role[] },
    { href: "/promotions", label: "Promotions", icon: <Icons.Tag />, roles: ["Admin", "Operator"] as Role[] },
  ];

  const visibleNav = navItems.filter((i) => i.roles.includes(userRole));

  const viewTitle = pathname.includes("/users") ? "User Management" : "Promotions";

  const handleLogout = () => {
    // FIX: Redirect strictly to /login instead of / (landing page)
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-60 bg-slate-900 flex flex-col shrink-0">
        <div className="h-16 flex items-center px-5 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-500 rounded-md flex items-center justify-center text-white">
              <Icons.Tag />
            </div>
            <span className="text-white font-semibold text-sm tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              PromoHub
            </span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold px-3 mb-3">Navigation</p>
          {visibleNav.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                pathname === item.href
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-4 pb-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
            userRole === "Admin" ? "bg-violet-900/50 text-violet-300"
            : "bg-blue-900/50 text-blue-300"
          }`}>
            {userRole} Access
          </div>
        </div>

        <div className="p-4 border-t border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-slate-200 text-xs font-medium truncate">{displayName}</p>
              <p className="text-slate-500 text-[11px]">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-slate-800 font-semibold text-base" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {viewTitle}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-slate-500 hover:text-slate-700 transition-colors">
              <Icons.Bell />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
