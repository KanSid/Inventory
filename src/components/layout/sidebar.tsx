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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-neutral-900 text-neutral-200 transition-transform lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-neutral-700">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-rose-500">D&apos;Aisle</span>
            <span className="text-xs text-neutral-400">Inventory</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-neutral-400 hover:text-white">
            <X size={20} />
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-rose-600 text-white"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}

          {role === "admin" && (
            <>
              <div className="my-3 border-t border-neutral-700" />
              {adminItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-rose-600 text-white"
                        : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
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
        <div className="border-t border-neutral-700 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-sm font-semibold text-white">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-white">{fullName}</p>
              <p className="text-xs capitalize text-neutral-400">{role.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
