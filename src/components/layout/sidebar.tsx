"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Truck,
  Scissors,
  Heart,
  BarChart3,
  Store,
  Settings,
  Wrench,
  X,
  Users,
  ScrollText,
  SlidersHorizontal,
} from "lucide-react";
import type { UserRole } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: FolderOpen },
  { href: "/shipments", label: "Shipments", icon: Truck },
  { href: "/usage", label: "Stock Usage", icon: Scissors },
  { href: "/brides", label: "Brides", icon: Heart },
  { href: "/adjustments", label: "Adjustments", icon: Wrench },
  { href: "/suppliers", label: "Suppliers", icon: Store },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

const adminItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/admin", label: "Admin Config", icon: SlidersHorizontal },
  { href: "/settings/users", label: "Users", icon: Users },
  { href: "/settings/activity-log", label: "Activity Log", icon: ScrollText },
];

interface SidebarProps {
  role: UserRole;
  fullName: string;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ role, fullName, open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo + Branding */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-sidebar-border">
          <div className="space-y-0.5">
            <Link href="/dashboard">
              <span className="font-serif italic text-2xl text-primary tracking-tight">D&apos;Aisle</span>
            </Link>
            <p className="font-sans text-[10px] uppercase tracking-[0.15em] font-semibold text-warm-600">
              Bridal Standard v1.0
            </p>
          </div>
          <button onClick={onClose} className="lg:hidden mt-1 text-warm-600 hover:text-sidebar-foreground" aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-warm-600 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}

          {role === "admin" && (
            <>
              <div className="my-3 border-t border-sidebar-border" />
              {adminItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-warm-600 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User */}
        <div className="border-t border-sidebar-border px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{fullName}</p>
              <p className="text-[10px] capitalize text-warm-600 uppercase tracking-[0.08em]">{role.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
