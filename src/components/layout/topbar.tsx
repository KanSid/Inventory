"use client";

import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, LogOut, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const segments = pathname.split("/").filter(Boolean);
  const isSubpage = segments.length > 1;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-md p-2 text-neutral-600 hover:bg-neutral-100"
        >
          <Menu size={20} />
        </button>

        {isSubpage && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-neutral-600 hover:text-red-600"
      >
        <LogOut size={16} className="mr-2" />
        Sign out
      </Button>
    </header>
  );
}
