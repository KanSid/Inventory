"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden rounded-md p-2 text-neutral-600 hover:bg-neutral-100"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

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
